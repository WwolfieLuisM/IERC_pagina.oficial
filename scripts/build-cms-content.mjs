import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "content", "cms-pilot");
const outputFile = path.join(root, "preview", "cms-content.json");
const allowedStatuses = new Set(["draft", "in_review", "published", "archived"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseFrontmatter(source, file) {
  const normalized = source.replace(/^\uFEFF/, "");
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

await mkdir(path.dirname(outputFile), { recursive: true });
let filenames = [];
try {
  filenames = (await readdir(sourceDir)).filter((name) => name.endsWith(".md")).sort();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const seenSlugs = new Set();
const published = [];
for (const filename of filenames) {
  const fullPath = path.join(sourceDir, filename);
  const source = await readFile(fullPath, "utf8");
  const { data, body } = parseFrontmatter(source, filename);
  for (const key of ["title", "slug", "status"]) requireText(data, key, filename);
  if (!slugPattern.test(data.slug)) throw new Error(`${filename}: slug must contain lowercase letters, numbers, and hyphens only`);
  if (filename !== `${data.slug}.md`) throw new Error(`${filename}: filename must match slug '${data.slug}.md'`);
  if (seenSlugs.has(data.slug)) throw new Error(`Duplicate slug: ${data.slug}`);
  seenSlugs.add(data.slug);
  if (!allowedStatuses.has(data.status)) throw new Error(`${filename}: invalid status '${data.status}'`);
  if (data.status === "published") {
    published.push({
      title: data.title,
      slug: data.slug,
      summary: data.summary ?? "",
      body,
      updatedAt: data.updatedAt ?? "",
      publishedAt: data.publishedAt ?? ""
    });
  }
}
published.sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
await writeFile(outputFile, JSON.stringify({ generatedAt: new Date().toISOString(), count: published.length, items: published }, null, 2) + "\n");
console.log(`Validated ${filenames.length} CMS record(s); exported ${published.length} published record(s) to preview/cms-content.json.`);
