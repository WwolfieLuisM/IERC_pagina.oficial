import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generator = path.join(root, "scripts", "build-cms-content.mjs");
const temp = await mkdtemp(path.join(os.tmpdir(), "ierc-cms-test-"));
const pilotDir = path.join(temp, "content", "cms-pilot");
const boletinesDir = path.join(temp, "content", "boletines");
const sermonesDir = path.join(temp, "content", "sermones");
const outputFile = path.join(temp, "preview", "cms-content.json");

function record({ title, slug, status, extra = "" }) {
  return `---
title: "${title}"
slug: "${slug}"
status: "${status}"
summary: "Resumen de prueba"
updatedAt: "2026-10-25"
publishedAt: "2026-10-25"
reviewNotes: "NOTA INTERNA SECRETA"
---
Texto de prueba.
${extra}`;
}

function buildRecord(fields) {
  const header = Object.entries(fields).map(([key, value]) => `${key}: "${value}"`).join("\n");
  return `---
${header}
---
Texto de prueba.
`;
}

function runGenerator() {
  return spawnSync(process.execPath, [generator], {
    encoding: "utf8",
    env: { ...process.env, CMS_ROOT: temp }
  });
}

// HTML mini con marcadores IERC reales y contenido de relleno: una sección por archivo.
const HTML_FIXTURES = {
  "ierc-boletin.html": ["boletin-body"],
  "ierc-sermones.html": ["sermon-filas"],
  "ierc-index.html": ["sermon-tira", "boletin-tarjeta"]
};

async function writeHtmlFixture(file, sections, eol = "\n") {
  const lines = ["<!DOCTYPE html>", '<html lang="es">', "<body>", "  <main>", "    <section>"];
  for (const name of sections) {
    lines.push(
      `      <!-- IERC:BEGIN ${name} -->`,
      "      contenido de relleno",
      `      <!-- IERC:END ${name} -->`
    );
  }
  lines.push("    </section>", "  </main>", "</body>", "</html>", "");
  await writeFile(path.join(temp, file), lines.join(eol));
}

async function resetFixtures(eol = "\n") {
  for (const [file, sections] of Object.entries(HTML_FIXTURES)) {
    await writeHtmlFixture(file, sections, eol);
  }
}

// Colecciona los fallos en vez de abortar en el primero, para ver los 5 casos de una corrida.
const failures = [];
async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS: ${name}`);
  } catch (error) {
    failures.push(name);
    console.error(`FAIL: ${name}\n${error.message}`);
  }
}

try {
  await mkdir(pilotDir, { recursive: true });
  await mkdir(boletinesDir, { recursive: true });
  await mkdir(sermonesDir, { recursive: true });
  await writeFile(path.join(pilotDir, "publicado.md"), record({
    title: "Registro publicado", slug: "publicado", status: "published"
  }));
  await writeFile(path.join(pilotDir, "borrador.md"), record({
    title: "Registro borrador", slug: "borrador", status: "draft"
  }));
  await writeFile(path.join(pilotDir, "revision.md"), record({
    title: "Registro en revisión", slug: "revision", status: "in_review"
  }));
  await resetFixtures();

  let result = runGenerator();
  assert.equal(result.status, 0, result.stderr || result.stdout);
  let output = JSON.parse(await readFile(outputFile, "utf8"));
  assert.equal(output.count, 1, "Only published records should be exported");
  assert.deepEqual(output.items.map((item) => item.slug), ["publicado"]);
  assert.equal(JSON.stringify(output).includes("NOTA INTERNA SECRETA"), false,
    "Internal review notes must never be exported");
  assert.equal(JSON.stringify(output).includes("Registro borrador"), false,
    "Draft content must never be exported");
  assert.equal(JSON.stringify(output).includes("Registro en revisión"), false,
    "In-review content must never be exported");
  console.log("PASS: only published records are exported; drafts, review items, and internal notes stay private.");

  await writeFile(path.join(pilotDir, "slug-invalido.md"), record({
    title: "Slug inválido", slug: "Slug Invalido", status: "published"
  }));
  result = runGenerator();
  assert.notEqual(result.status, 0, "Invalid slugs must fail validation");
  assert.match(result.stderr, /slug must contain lowercase letters, numbers, and hyphens only/);
  console.log("PASS: invalid slugs fail validation.");

  await rm(path.join(pilotDir, "slug-invalido.md"));
  await writeFile(path.join(pilotDir, "nombre-distinto.md"), record({
    title: "Nombre distinto", slug: "slug-correcto", status: "published"
  }));
  result = runGenerator();
  assert.notEqual(result.status, 0, "Filename/slug mismatches must fail validation");
  assert.match(result.stderr, /filename must match slug/);
  console.log("PASS: filename/slug mismatches fail validation.");
  // Limpia el fixture inválido para que los casos siguientes arranquen con estado válido.
  await rm(path.join(pilotDir, "nombre-distinto.md"));

  await check("boletin sin editionNumber → exit≠0 y stderr menciona editionNumber", async () => {
    const file = path.join(boletinesDir, "boletin-sin-numero.md");
    await writeFile(file, buildRecord({
      title: "Boletín sin número",
      slug: "boletin-sin-numero",
      status: "published",
      editionDate: "2026-10-18"
    }));
    try {
      const invalid = runGenerator();
      assert.notEqual(invalid.status, 0, `expected exit≠0 but got ${invalid.status}`);
      assert.match(invalid.stderr, /editionNumber/);
    } finally {
      await rm(file, { force: true });
    }
  });

  await check('boletin con editionNumber no numérico ("14a") → exit≠0', async () => {
    const file = path.join(boletinesDir, "boletin-numero-invalido.md");
    await writeFile(file, buildRecord({
      title: "Boletín con número inválido",
      slug: "boletin-numero-invalido",
      status: "published",
      editionDate: "2026-10-18",
      editionNumber: "14a"
    }));
    try {
      const invalid = runGenerator();
      assert.notEqual(invalid.status, 0, `expected exit≠0 but got ${invalid.status}`);
    } finally {
      await rm(file, { force: true });
    }
  });

  await check('sermonDate "18/10/2026" (no ISO) → exit≠0', async () => {
    const file = path.join(sermonesDir, "sermon-fecha-invalida.md");
    await writeFile(file, buildRecord({
      title: "Sermón con fecha no ISO",
      slug: "sermon-fecha-invalida",
      status: "published",
      sermonDate: "18/10/2026",
      topic: "doctrina"
    }));
    try {
      const invalid = runGenerator();
      assert.notEqual(invalid.status, 0, `expected exit≠0 but got ${invalid.status}`);
    } finally {
      await rm(file, { force: true });
    }
  });

  await check("topic fuera del conjunto cerrado → exit≠0", async () => {
    const file = path.join(sermonesDir, "sermon-tema-invalido.md");
    await writeFile(file, buildRecord({
      title: "Sermón con tema fuera de conjunto",
      slug: "sermon-tema-invalido",
      status: "published",
      sermonDate: "2026-10-18",
      topic: "historia"
    }));
    try {
      const invalid = runGenerator();
      assert.notEqual(invalid.status, 0, `expected exit≠0 but got ${invalid.status}`);
    } finally {
      await rm(file, { force: true });
    }
  });

  await check("slug repetido entre boletines y sermones → exit≠0", async () => {
    const boletinFile = path.join(boletinesDir, "edicion-prueba.md");
    const sermonFile = path.join(sermonesDir, "edicion-prueba.md");
    await writeFile(boletinFile, buildRecord({
      title: "Boletín duplicado",
      slug: "edicion-prueba",
      status: "published",
      editionDate: "2026-10-18",
      editionNumber: "142"
    }));
    await writeFile(sermonFile, buildRecord({
      title: "Sermón duplicado",
      slug: "edicion-prueba",
      status: "published",
      sermonDate: "2026-10-18"
    }));
    try {
      const invalid = runGenerator();
      assert.notEqual(invalid.status, 0, `expected exit≠0 but got ${invalid.status}`);
    } finally {
      await rm(boletinFile, { force: true });
      await rm(sermonFile, { force: true });
    }
  });

  await check("publicado renderiza su marca entre los marcadores", async () => {
    await resetFixtures();
    const file = path.join(boletinesDir, "edicion-143.md");
    await writeFile(file, buildRecord({
      title: "Boletín de prueba",
      slug: "edicion-143",
      status: "published",
      editionDate: "2026-10-25",
      editionNumber: "143",
      season: "Tiempo después de Pentecostés"
    }));
    try {
      const run = runGenerator();
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const html = await readFile(path.join(temp, "ierc-boletin.html"), "utf8");
      const esperado = "Edición N° 143 · 25 de octubre de 2026 · Tiempo después de Pentecostés";
      const at = html.indexOf(esperado);
      assert.ok(at > 0, `se esperaba "${esperado}" en el HTML renderizado`);
      assert.ok(at > html.indexOf("<!-- IERC:BEGIN boletin-body -->"), "el render debe quedar después del BEGIN");
      assert.ok(at < html.indexOf("<!-- IERC:END boletin-body -->"), "el render debe quedar antes del END");
    } finally {
      await rm(file, { force: true });
    }
  });

  await check("draft deja el HTML byte-idéntico", async () => {
    await resetFixtures();
    const publicado = path.join(boletinesDir, "edicion-144.md");
    const borrador = path.join(boletinesDir, "edicion-999.md");
    await writeFile(publicado, buildRecord({
      title: "Boletín publicado",
      slug: "edicion-144",
      status: "published",
      editionDate: "2026-10-25",
      editionNumber: "144",
      season: "Tiempo después de Pentecostés"
    }));
    try {
      let run = runGenerator();
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const primera = {};
      for (const file of Object.keys(HTML_FIXTURES)) {
        primera[file] = await readFile(path.join(temp, file));
      }
      assert.ok(primera["ierc-boletin.html"].includes("Edición N° 144"),
        "el publicado debe renderizarse antes de probar el draft");
      // El draft tiene edición y fecha posteriores: si el render lo colara, los bytes cambiarían.
      await writeFile(borrador, buildRecord({
        title: "Boletín borrador",
        slug: "edicion-999",
        status: "draft",
        editionDate: "2026-11-01",
        editionNumber: "999",
        season: "Advento"
      }));
      run = runGenerator();
      assert.equal(run.status, 0, run.stderr || run.stdout);
      for (const file of Object.keys(HTML_FIXTURES)) {
        const segunda = await readFile(path.join(temp, file));
        assert.ok(primera[file].equals(segunda), `${file} debe quedar byte-idéntico con un draft nuevo`);
      }
    } finally {
      await rm(publicado, { force: true });
      await rm(borrador, { force: true });
    }
  });

  await check("cero publicados en la sección → HTML intacto + aviso por stderr, exit 0", async () => {
    await resetFixtures();
    const htmlPath = path.join(temp, "ierc-boletin.html");
    const antes = await readFile(htmlPath);
    const run = runGenerator();
    assert.equal(run.status, 0, run.stderr || run.stdout);
    assert.ok(antes.equals(await readFile(htmlPath)), "el HTML debe quedar byte-idéntico");
    assert.match(run.stderr, /sin registros publicados/, "debe avisarse por stderr");
  });

  await check("marcador BEGIN sin END → exit≠0", async () => {
    await writeFile(
      path.join(temp, "ierc-boletin.html"),
      ['<!DOCTYPE html>', '<html lang="es">', "<body>", "  <main>",
        "    <!-- IERC:BEGIN boletin-body -->", "    contenido de relleno",
        "  </main>", "</body>", "</html>", ""].join("\n")
    );
    const run = runGenerator();
    assert.notEqual(run.status, 0, `se esperaba exit≠0 pero fue ${run.status}`);
  });

  await check("doble corrida idempotente → git-diff equivalente vacío (bytes iguales)", async () => {
    await resetFixtures();
    const boletinFile = path.join(boletinesDir, "edicion-145.md");
    const sermonFile = path.join(sermonesDir, "sermon-idempotente.md");
    await writeFile(boletinFile, buildRecord({
      title: "Boletín idempotente",
      slug: "edicion-145",
      status: "published",
      editionDate: "2026-10-25",
      editionNumber: "145",
      season: "Tiempo después de Pentecostés"
    }));
    await writeFile(sermonFile, buildRecord({
      title: "Sermón idempotente",
      slug: "sermon-idempotente",
      status: "published",
      sermonDate: "2026-10-18",
      topic: "doctrina",
      durationMinutes: "6",
      scriptureReference: "Juan 3:16"
    }));
    try {
      const primera = runGenerator();
      assert.equal(primera.status, 0, primera.stderr || primera.stdout);
      const bytes = {};
      for (const file of Object.keys(HTML_FIXTURES)) {
        bytes[file] = await readFile(path.join(temp, file));
      }
      assert.ok(bytes["ierc-boletin.html"].includes("Edición N° 145"),
        "la primera corrida debe renderizar antes de comprobar idempotencia");
      const segunda = runGenerator();
      assert.equal(segunda.status, 0, segunda.stderr || segunda.stdout);
      for (const file of Object.keys(HTML_FIXTURES)) {
        const deNueva = await readFile(path.join(temp, file));
        assert.ok(bytes[file].equals(deNueva), `${file} debe ser byte-idéntico tras la segunda corrida`);
      }
    } finally {
      await rm(boletinFile, { force: true });
      await rm(sermonFile, { force: true });
    }
  });

  await check("reviewNotes no aparece en ningún HTML generado", async () => {
    await resetFixtures();
    const boletinFile = path.join(boletinesDir, "edicion-con-notas.md");
    const sermonFile = path.join(sermonesDir, "sermon-con-notas.md");
    const notas = "NOTA INTERNA SECRETA";
    await writeFile(boletinFile, buildRecord({
      title: "Boletín con notas",
      slug: "edicion-con-notas",
      status: "published",
      editionDate: "2026-10-25",
      editionNumber: "146",
      season: "Tiempo después de Pentecostés",
      reviewNotes: notas
    }));
    await writeFile(sermonFile, buildRecord({
      title: "Sermón con notas",
      slug: "sermon-con-notas",
      status: "published",
      sermonDate: "2026-10-18",
      topic: "doctrina",
      reviewNotes: notas
    }));
    try {
      const run = runGenerator();
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const boletinHtml = await readFile(path.join(temp, "ierc-boletin.html"), "utf8");
      assert.ok(boletinHtml.includes("Edición N° 146"), "el HTML debe estar generado");
      for (const file of Object.keys(HTML_FIXTURES)) {
        const html = await readFile(path.join(temp, file), "utf8");
        assert.equal(html.includes(notas), false, `${file} no debe filtrar reviewNotes`);
      }
    } finally {
      await rm(boletinFile, { force: true });
      await rm(sermonFile, { force: true });
    }
  });

  await check("fixture con CRLF → tras render el archivo conserva \\r\\n", async () => {
    await resetFixtures("\r\n");
    const file = path.join(boletinesDir, "edicion-crlf.md");
    await writeFile(file, buildRecord({
      title: "Boletín CRLF",
      slug: "edicion-crlf",
      status: "published",
      editionDate: "2026-10-25",
      editionNumber: "147",
      season: "Tiempo después de Pentecostés"
    }));
    try {
      const run = runGenerator();
      assert.equal(run.status, 0, run.stderr || run.stdout);
      const html = await readFile(path.join(temp, "ierc-boletin.html"), "utf8");
      assert.ok(html.includes("Edición N° 147"), "la sección debe haberse renderizado");
      const crlf = (html.match(/\r\n/g) || []).length;
      assert.ok(crlf > 0, "debe conservar los finales de línea CRLF");
      assert.equal(html.replace(/\r\n/g, "").includes("\n"), false, "no debe quedar ningún \\n suelto");
    } finally {
      await rm(file, { force: true });
    }
  });

  if (failures.length > 0) {
    throw new Error(`${failures.length} test(s) failed:\n${failures.join("\n")}`);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
