import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cmsRoot = process.env.CMS_ROOT ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputFile = path.join(cmsRoot, "preview", "cms-content.json");
const allowedStatuses = new Set(["draft", "in_review", "published", "archived"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const CLOSED_TOPICS = ["doctrina", "libro-oracion"];
const collections = ["cms-pilot", "boletines", "sermones"];

function parseFrontmatter(source, file) {
  // Normaliza CRLF (checkout de Windows con autocrlf) para que el validador funcione igual que en CI.
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) throw new Error(`${file}: missing YAML frontmatter opening delimiter`);
  const end = normalized.indexOf("\n---", 4);
  if (end < 0) throw new Error(`${file}: missing YAML frontmatter closing delimiter`);
  const header = normalized.slice(4, end);
  const body = normalized.slice(end + 4).trim();
  const data = {};
  for (const line of header.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/);
    if (!match) throw new Error(`${file}: unsupported frontmatter line: ${line}`);
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/\\"/g, '"');
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1).replace(/''/g, "'");
    data[match[1]] = value;
  }
  return { data, body };
}

function requireText(record, key, file) {
  if (typeof record[key] !== "string" || !record[key].trim()) {
    throw new Error(`${file}: required field '${key}' is missing`);
  }
}

function validateBoletin(data, file) {
  requireText(data, "editionDate", file);
  if (!isoDatePattern.test(data.editionDate)) throw new Error(`${file}: editionDate must be an ISO date (yyyy-mm-dd)`);
  requireText(data, "editionNumber", file);
  if (!/^\d+$/.test(data.editionNumber) || Number(data.editionNumber) < 1) {
    throw new Error(`${file}: editionNumber must be an integer >= 1`);
  }
}

function validateSermon(data, file) {
  requireText(data, "sermonDate", file);
  if (!isoDatePattern.test(data.sermonDate)) throw new Error(`${file}: sermonDate must be an ISO date (yyyy-mm-dd)`);
  if (data.topic && !CLOSED_TOPICS.includes(data.topic)) {
    throw new Error(`${file}: topic '${data.topic}' is outside the closed set (${CLOSED_TOPICS.join(", ")})`);
  }
}

await mkdir(path.dirname(outputFile), { recursive: true });
const seenSlugs = new Set();
const published = [];
let validated = 0;
for (const collection of collections) {
  const sourceDir = path.join(cmsRoot, "content", collection);
  let filenames = [];
  try {
    filenames = (await readdir(sourceDir)).filter((name) => name.endsWith(".md")).sort();
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  for (const filename of filenames) {
    const file = `${collection}/${filename}`;
    const source = await readFile(path.join(sourceDir, filename), "utf8");
    const { data, body } = parseFrontmatter(source, file);
    for (const key of ["title", "slug", "status"]) requireText(data, key, file);
    if (!slugPattern.test(data.slug)) throw new Error(`${file}: slug must contain lowercase letters, numbers, and hyphens only`);
    if (filename !== `${data.slug}.md`) throw new Error(`${file}: filename must match slug '${data.slug}.md'`);
    if (seenSlugs.has(data.slug)) throw new Error(`Duplicate slug: ${data.slug}`);
    seenSlugs.add(data.slug);
    if (!allowedStatuses.has(data.status)) throw new Error(`${file}: invalid status '${data.status}'`);
    if (collection === "boletines") validateBoletin(data, file);
    if (collection === "sermones") validateSermon(data, file);
    // El JSON de preview lo exporta solo el piloto; los otros registros solo se validan.
    if (collection === "cms-pilot" && data.status === "published") {
      published.push({
        title: data.title,
        slug: data.slug,
        summary: data.summary ?? "",
        body,
        updatedAt: data.updatedAt ?? "",
        publishedAt: data.publishedAt ?? ""
      });
    }
    validated += 1;
  }
}
published.sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
await writeFile(outputFile, JSON.stringify({ generatedAt: new Date().toISOString(), count: published.length, items: published }, null, 2) + "\n");
console.log(`Validated ${validated} CMS record(s); exported ${published.length} published record(s) to preview/cms-content.json.`);
