import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generator = path.join(root, "scripts", "build-cms-content.mjs");
const temp = await mkdtemp(path.join(os.tmpdir(), "ierc-cms-test-"));
const sourceDir = path.join(temp, "content");
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

function runGenerator() {
  return spawnSync(process.execPath, [generator], {
    encoding: "utf8",
    env: { ...process.env, CMS_CONTENT_DIR: sourceDir, CMS_OUTPUT_FILE: outputFile }
  });
}

try {
  await mkdir(sourceDir, { recursive: true });
  await writeFile(path.join(sourceDir, "publicado.md"), record({
    title: "Registro publicado", slug: "publicado", status: "published"
  }));
  await writeFile(path.join(sourceDir, "borrador.md"), record({
    title: "Registro borrador", slug: "borrador", status: "draft"
  }));
  await writeFile(path.join(sourceDir, "revision.md"), record({
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

  await writeFile(path.join(sourceDir, "slug-invalido.md"), record({
    title: "Slug inválido", slug: "Slug Invalido", status: "published"
  }));
  result = runGenerator();
  assert.notEqual(result.status, 0, "Invalid slugs must fail validation");
  assert.match(result.stderr, /slug must contain lowercase letters, numbers, and hyphens only/);
  console.log("PASS: invalid slugs fail validation.");

  await rm(path.join(sourceDir, "slug-invalido.md"));
  await writeFile(path.join(sourceDir, "nombre-distinto.md"), record({
    title: "Nombre distinto", slug: "slug-correcto", status: "published"
  }));
  result = runGenerator();
  assert.notEqual(result.status, 0, "Filename/slug mismatches must fail validation");
  assert.match(result.stderr, /filename must match slug/);
  console.log("PASS: filename/slug mismatches fail validation.");
} finally {
  await rm(temp, { recursive: true, force: true });
}
