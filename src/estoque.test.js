import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizar, publicos, numero, categoria } from "./estoque.js";

test("formato documentado", () => {
  const c = normalizar({
    id: 7,
    marca: "Jeep",
    modelo: "Compass",
    versao: "Sport",
    ano_fabricacao: 2024,
    ano_modelo: 2025,
    km: 18000,
    cambio: "Automático",
    categoria: "suv",
    preco: null,
    situacao: "reservado",
    opcionais: ["Ar", "Multimídia"],
    fotos: ["https://x/1.jpg", "https://x/2.jpg"],
    criado_em: "2026-10-01T10:00:00Z",
  });
  assert.equal(c.id, "7");
  assert.equal(c.year, 2025);
  assert.equal(c.manufactureYear, 2024);
  assert.equal(c.category, "SUV");
  assert.equal(c.price, null);
  assert.equal(c.status, "reservado");
  assert.deepEqual(c.photos, ["https://x/1.jpg", "https://x/2.jpg"]);
});

test("nomes alternativos e formatos soltos", () => {
  const c = normalizar({
    codigo: "a1",
    marca: { nome: "Toyota" },
    modelo: "Corolla",
    ano: "2018/2019",
    valor: "R$ 89.900,00",
    status: "Disponível",
    carroceria: "Sedan",
    acessorios: "Ar; Direção",
    imagens: [{ url: "https://x/b.jpg", ordem: 2 }, { url: "https://x/a.jpg", ordem: 1 }],
  });
  assert.equal(c.brand, "Toyota");
  assert.equal(c.year, 2019);
  assert.equal(c.manufactureYear, 2018);
  assert.equal(c.price, 89900);
  assert.equal(c.category, "Sedã");
  assert.deepEqual(c.equipment, ["Ar", "Direção"]);
  assert.deepEqual(c.photos, ["https://x/a.jpg", "https://x/b.jpg"]);
});

test("vendido some e lista vem do mais recente", () => {
  const r = publicos({
    carros: [
      { id: 1, situacao: "vendido", criado_em: "2026-10-03" },
      { id: 2, situacao: "disponivel", criado_em: "2026-10-01" },
      { id: 3, situacao: "reservado", criado_em: "2026-10-02" },
    ],
  });
  assert.deepEqual(r.map((c) => c.id), ["3", "2"]);
});

test("números e categorias", () => {
  assert.equal(numero("89.900"), 89900);
  assert.equal(numero("89900.50"), 89900.5);
  assert.equal(numero(""), null);
  assert.equal(categoria("Hatchback"), "Hatch");
  assert.equal(categoria("MOTOS"), "Moto");
  assert.equal(categoria("Picape"), "Picape");
});

test("mock local é válido", () => {
  const mock = JSON.parse(fs.readFileSync(new URL("../public/mock/estoque.json", import.meta.url)));
  const r = publicos(mock);
  assert.equal(r.length, 6);
  assert.ok(r.every((c) => c.brand && c.model && c.photos.length));
});
