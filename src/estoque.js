// Adaptador único do estoque da Sua Revenda.
// Toda diferença de nome de campo da API se resolve aqui; o resto do site só vê o formato normalizado.
const env = import.meta.env ?? {};
export const BASE = (env.VITE_REVENDA_BASE || "https://painel.suarevenda.com").replace(/\/+$/, "");
export const SLUG = env.VITE_LOJA_SLUG || "tc-veiculos";
export const MOCK = env.VITE_ESTOQUE_MOCK === "1";

const semAcento = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

const pick = (o, ...keys) => {
  for (const k of keys) {
    const v = o?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
};

// Campos que às vezes vêm como objeto ({ nome: "Jeep" }).
const texto = (v) => (v && typeof v === "object" ? (v.nome ?? v.name ?? v.descricao ?? v.label ?? "") : (v ?? ""));

export function numero(v) {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/[^\d,.-]/g, "");
  // "89.900,00" e "89.900" (pt-BR) ou "89900.00"
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const CATEGORIAS = {
  suv: "SUV",
  sedan: "Sedã",
  seda: "Sedã",
  hatch: "Hatch",
  hatchback: "Hatch",
  moto: "Moto",
  motos: "Moto",
  motocicleta: "Moto",
  picape: "Picape",
  pickup: "Picape",
  caminhonete: "Picape",
  utilitario: "Utilitário",
  van: "Van",
  minivan: "Minivan",
  conversivel: "Conversível",
  cupe: "Cupê",
  coupe: "Cupê",
  perua: "Perua",
};

export function categoria(v) {
  const s = semAcento(texto(v));
  if (!s) return "Outros";
  return CATEGORIAS[s] || CATEGORIAS[s.replace(/s$/, "")] || s.charAt(0).toUpperCase() + s.slice(1);
}

function situacao(v) {
  const s = semAcento(texto(v));
  if (s.startsWith("vendid")) return "vendido";
  if (s.startsWith("reservad")) return "reservado";
  return "disponivel";
}

function lista(v) {
  if (!v) return [];
  if (typeof v === "string") return v.split(/\n|;|,/).map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(v)) return [];
  return v.map((i) => String(texto(i)).trim()).filter(Boolean);
}

function fotos(v, base) {
  if (!Array.isArray(v)) return [];
  const comOrdem = v.some((f) => f && typeof f === "object" && f.ordem !== undefined);
  const arr = comOrdem ? [...v].sort((a, b) => (a?.ordem ?? 0) - (b?.ordem ?? 0)) : v;
  return arr
    .map((f) => (typeof f === "string" ? f : pick(f, "url", "src", "link", "arquivo")))
    .filter(Boolean)
    .map((u) => (/^(https?:)?\/\//.test(u) || u.startsWith("/") ? u : base + "/" + u.replace(/^\.?\//, "")));
}

export function normalizar(raw) {
  const anoTxt = String(pick(raw, "ano_modelo", "anoModelo", "ano", "year") ?? "");
  const [anoA, anoB] = anoTxt.split("/").map(numero);
  const fab = numero(pick(raw, "ano_fabricacao", "anoFabricacao", "ano_fab")) ?? (anoB ? anoA : null);
  const preco = numero(pick(raw, "preco", "preço", "valor", "price"));
  return {
    id: String(pick(raw, "id", "codigo", "uuid", "slug") ?? ""),
    brand: String(texto(pick(raw, "marca", "brand", "fabricante"))).trim(),
    model: String(texto(pick(raw, "modelo", "model"))).trim(),
    version: String(texto(pick(raw, "versao", "versão", "version"))).trim(),
    manufactureYear: fab,
    year: anoB ?? anoA ?? fab,
    mileage: numero(pick(raw, "km", "quilometragem", "kilometragem", "mileage")),
    gear: String(texto(pick(raw, "cambio", "câmbio", "transmissao", "gear"))).trim(),
    fuel: String(texto(pick(raw, "combustivel", "combustível", "fuel"))).trim(),
    color: String(texto(pick(raw, "cor", "color"))).trim(),
    doors: numero(pick(raw, "portas", "doors")),
    category: categoria(pick(raw, "categoria", "carroceria", "tipo", "category")),
    // preço null ou zero = sob consulta
    price: preco && preco > 0 ? preco : null,
    status: situacao(pick(raw, "situacao", "situação", "status")),
    description: String(pick(raw, "descricao", "descrição", "observacoes", "description") ?? "").trim(),
    equipment: lista(pick(raw, "opcionais", "acessorios", "itens", "equipamentos")),
    photos: fotos(pick(raw, "fotos", "imagens", "photos", "images"), BASE),
    createdAt: Date.parse(pick(raw, "criado_em", "criadoEm", "entrada", "created_at", "data_cadastro") ?? "") || 0,
  };
}

const itens = (json) =>
  Array.isArray(json) ? json : (pick(json, "carros", "veiculos", "estoque", "itens", "data", "results") ?? []);

// Vendido some; o resto em ordem do mais recente para o mais antigo.
export const publicos = (arr) =>
  itens(arr)
    .map(normalizar)
    .filter((c) => c.id && c.status !== "vendido")
    .sort((a, b) => b.createdAt - a.createdAt || (b.year ?? 0) - (a.year ?? 0));

const url = (p) => (MOCK ? `/mock/${p}` : `${BASE}/v/${SLUG}/${p}`);

async function getJSON(u) {
  const r = await fetch(u, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`HTTP ${r.status} em ${u}`);
  return r.json();
}

let cache;
export function listar() {
  cache ??= getJSON(url("estoque.json"))
    .then(publicos)
    .catch((e) => {
      cache = undefined;
      throw e;
    });
  return cache;
}

export async function buscarCarro(id) {
  if (!MOCK) {
    try {
      const json = await getJSON(url(`carro/${encodeURIComponent(id)}.json`));
      const c = normalizar(pick(json, "carro", "veiculo", "data") ?? json);
      return c.status === "vendido" ? null : c;
    } catch {
      // cai para a lista abaixo
    }
  }
  return (await listar()).find((c) => c.id === String(id)) ?? null;
}
