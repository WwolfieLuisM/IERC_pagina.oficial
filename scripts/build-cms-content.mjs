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

// Meses derivados del HTML actual (divisores «Octubre 2026», columna «18 oct 2026», fechas largas).
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const AVISO_CMS = "<!-- Generado por el CMS — no editar a mano -->";

function fechaParts(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function fechaLarga(iso) {
  const { year, month, day } = fechaParts(iso);
  return `${day} de ${MESES[month - 1]} de ${year}`;
}

function fechaCorta(iso) {
  const { year, month, day } = fechaParts(iso);
  return `${day} ${MESES_CORTOS[month - 1]} ${year}`;
}

function mesTitulo(iso) {
  const { year, month } = fechaParts(iso);
  const nombre = MESES[month - 1];
  return `${nombre[0].toUpperCase()}${nombre.slice(1)} ${year}`;
}

// Los atributos data-titulo/data-pasaje del buscador son ASCII (sin acentos, guion plano).
function sinAcentos(texto) {
  return (texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u2013/g, "-");
}

function renderBoletinBody(records, indent) {
  const { data, body } = records[0];
  const meta = [`Edición N° ${data.editionNumber}`, fechaLarga(data.editionDate), data.season]
    .filter((part) => part)
    .join(" · ");
  const lines = [
    `${indent}${AVISO_CMS}`,
    `${indent}<div class="boletin-header">`,
    `${indent}  <span class="iglesia-nombre">Iglesia Episcopal Reformada de Cuba</span>`,
    `${indent}  <h1>${data.title}</h1>`,
    `${indent}  <span class="edicion-meta">${meta}</span>`,
    `${indent}</div>`,
    ""
  ];
  if (body) {
    // El parser recorta el body: su primera línea pierde la sangría del HTML, el resto la conserva.
    const [primera, ...resto] = body.split("\n");
    lines.push(indent + primera, ...resto);
  }
  return lines.join("\n");
}

function renderSermonFilas(records, indent) {
  const lines = [`${indent}${AVISO_CMS}`];
  let mesActual = "";
  for (const { data } of records) {
    const mes = data.sermonDate.slice(0, 7);
    if (mes !== mesActual) {
      if (mesActual) lines.push("");
      lines.push(`${indent}<div class="m5-year m5-rv">${mesTitulo(data.sermonDate)}</div>`, "");
      mesActual = mes;
    }
    lines.push(
      `${indent}<a class="m5-row m5-rv" href="ierc-sermon.html" data-anio="${data.sermonDate.slice(0, 4)}" data-tema="${data.topic ?? ""}" data-titulo="${sinAcentos(data.title)}" data-pasaje="${sinAcentos(data.scriptureReference)}">`,
      `${indent}  <span class="d">${fechaCorta(data.sermonDate)}</span>`,
      `${indent}  <span><span class="t">«${data.title}»</span><span class="v">${data.scriptureReference ?? ""}</span></span>`,
      `${indent}  <span class="min">${data.durationMinutes ? `${data.durationMinutes} min` : ""}</span>`,
      `${indent}  <span class="arw" aria-hidden="true">→</span>`,
      `${indent}</a>`
    );
  }
  return lines.join("\n");
}

function renderSermonTira(records, indent) {
  const lines = [`${indent}${AVISO_CMS}`];
  for (const { data } of records.slice(0, 3)) {
    lines.push(
      `${indent}<a href="ierc-sermon.html" class="fila-sermon rv" style="display:flex;justify-content:space-between;align-items:center;padding:18px 22px;background:var(--paper);border:1px solid var(--line);border-radius:6px;text-decoration:none;color:inherit;transition:transform .3s var(--spring),border-color .3s">`,
      `${indent}  <div>`,
      `${indent}    <span style="font-size:12.5px;text-transform:uppercase;letter-spacing:.15em;color:var(--meta);display:block;margin-bottom:4px">${fechaLarga(data.sermonDate)}</span>`,
      `${indent}    <span style="font-size:18px;color:var(--ink)">${data.title}</span>`,
      `${indent}  </div>`,
      `${indent}  <span style="font-size:20px;color:var(--terracota);transition:transform .3s">→</span>`,
      `${indent}</a>`
    );
  }
  return lines.join("\n");
}

function renderBoletinTarjeta(records, indent) {
  const { data } = records[0];
  return [
    `${indent}${AVISO_CMS}`,
    `${indent}<a href="ierc-boletin.html" class="fila-sermon rv" style="display:flex;justify-content:space-between;align-items:center;padding:18px 22px;background:var(--paper-2);border:1px solid var(--line);border-radius:6px;text-decoration:none;color:inherit;transition:transform .3s var(--spring),border-color .3s">`,
    `${indent}  <div>`,
    `${indent}    <span style="font-size:12.5px;text-transform:uppercase;letter-spacing:.15em;color:var(--meta);display:block;margin-bottom:4px">Boletín dominical · Edición N° ${data.editionNumber} · ${fechaLarga(data.editionDate)}</span>`,
    `${indent}    <span style="font-size:18px;color:var(--ink)">Leer el boletín de esta semana</span>`,
    `${indent}  </div>`,
    `${indent}  <span style="font-size:20px;color:var(--terracota);transition:transform .3s">→</span>`,
    `${indent}</a>`
  ].join("\n");
}

const SECTIONS = [
  { file: "ierc-boletin.html", name: "boletin-body", records: () => publishedBoletines, render: renderBoletinBody },
  { file: "ierc-sermones.html", name: "sermon-filas", records: () => publishedSermons, render: renderSermonFilas },
  { file: "ierc-index.html", name: "sermon-tira", records: () => publishedSermons.slice(0, 3), render: renderSermonTira },
  { file: "ierc-index.html", name: "boletin-tarjeta", records: () => publishedBoletines.slice(0, 1), render: renderBoletinTarjeta }
];

async function renderHtmlSections(root) {
  for (const file of [...new Set(SECTIONS.map((section) => section.file))]) {
    const filePath = path.join(root, file);
    let source;
    try {
      source = await readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") throw new Error(`${file}: HTML file with IERC markers is missing`);
      throw error;
    }
    const eol = source.includes("\r\n") ? "\r\n" : "\n";
    const lines = source.split(/\r?\n/);
    let changed = false;
    for (const section of SECTIONS.filter((candidate) => candidate.file === file)) {
      const beginTag = `<!-- IERC:BEGIN ${section.name} -->`;
      const endTag = `<!-- IERC:END ${section.name} -->`;
      const begin = lines.findIndex((line) => line.trim() === beginTag);
      if (begin < 0) throw new Error(`${file}: missing marker ${beginTag}`);
      const end = lines.findIndex((line, index) => index > begin && line.trim() === endTag);
      if (end < 0) throw new Error(`${file}: missing marker ${endTag}`);
      const records = section.records();
      if (records.length === 0) {
        console.error(`Aviso: sección '${section.name}' sin registros publicados; se deja ${file} sin cambios.`);
        continue;
      }
      const indent = lines[begin].match(/^\s*/)[0];
      const rendered = section.render(records, indent).split("\n");
      const current = lines.slice(begin + 1, end);
      if (rendered.length === current.length && rendered.every((line, index) => line === current[index])) continue;
      lines.splice(begin + 1, end - begin - 1, ...rendered);
      changed = true;
    }
    if (changed) await writeFile(filePath, lines.join(eol));
  }
}

await mkdir(path.dirname(outputFile), { recursive: true });
const seenSlugs = new Set();
const published = [];
const publishedBoletines = [];
const publishedSermons = [];
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
    if (data.status === "published" && collection === "boletines") publishedBoletines.push({ data, body });
    if (data.status === "published" && collection === "sermones") publishedSermons.push({ data, body });
    validated += 1;
  }
}
published.sort((a, b) => (b.publishedAt || b.updatedAt).localeCompare(a.publishedAt || a.updatedAt));
publishedBoletines.sort((a, b) =>
  b.data.editionDate.localeCompare(a.data.editionDate) || Number(b.data.editionNumber) - Number(a.data.editionNumber));
publishedSermons.sort((a, b) => b.data.sermonDate.localeCompare(a.data.sermonDate));
await renderHtmlSections(cmsRoot);
await writeFile(outputFile, JSON.stringify({ generatedAt: new Date().toISOString(), count: published.length, items: published }, null, 2) + "\n");
console.log(`Validated ${validated} CMS record(s); exported ${published.length} published record(s) to preview/cms-content.json.`);
