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

  if (failures.length > 0) {
    throw new Error(`${failures.length} test(s) failed:\n${failures.join("\n")}`);
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}
