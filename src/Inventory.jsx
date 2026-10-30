import { AnimatePresence } from "framer-motion";
import { Heart, Search, X, RotateCw } from "lucide-react";
import { Action, CarCard, CarSkeleton, Dropdown, Reveal, Segments, WhatsIcon, wa } from "./ui.jsx";

export const FILTRO_INICIAL = {
  q: "",
  brand: "Todas",
  cat: "Todos",
  order: "recentes",
  saved: false,
  price: "todas",
  year: "todos",
};

const ORDENS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "antigos", label: "Mais antigos" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor km" },
];

const PRECOS = [
  { value: "todas", label: "Todos os preços", ok: () => true },
  { value: "50", label: "Até R$ 50 mil", ok: (p) => p && p <= 50000 },
  { value: "50-100", label: "R$ 50 a 100 mil", ok: (p) => p > 50000 && p <= 100000 },
  { value: "100-150", label: "R$ 100 a 150 mil", ok: (p) => p > 100000 && p <= 150000 },
  { value: "150", label: "Acima de R$ 150 mil", ok: (p) => p > 150000 },
  { value: "consulta", label: "Sob consulta", ok: (p) => !p },
];

const ANOS = [
  { value: "todos", label: "Todos os anos", ok: () => true },
  { value: "2023", label: "2023 ou mais novo", ok: (a) => a >= 2023 },
  { value: "2019", label: "2019 a 2022", ok: (a) => a >= 2019 && a <= 2022 },
  { value: "2015", label: "2015 a 2018", ok: (a) => a >= 2015 && a <= 2018 },
  { value: "2014", label: "2014 ou anterior", ok: (a) => a && a <= 2014 },
];

const ordenar = {
  recentes: (a, b) => b.createdAt - a.createdAt || (b.year ?? 0) - (a.year ?? 0),
  antigos: (a, b) => (a.year ?? 0) - (b.year ?? 0),
  // sob consulta vai para o fim nas ordens por preço
  "menor-preco": (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
  "maior-preco": (a, b) => (b.price ?? -1) - (a.price ?? -1),
  "menor-km": (a, b) => (a.mileage ?? Infinity) - (b.mileage ?? Infinity),
};

export function filtrar(cars, f, saved) {
  const q = f.q.trim().toLowerCase();
  const preco = PRECOS.find((p) => p.value === f.price) ?? PRECOS[0];
  const ano = ANOS.find((a) => a.value === f.year) ?? ANOS[0];
  return cars
    .filter(
      (c) =>
        (f.brand === "Todas" || c.brand === f.brand) &&
        (f.cat === "Todos" || c.category === f.cat) &&
        (!f.saved || saved.includes(c.id)) &&
        preco.ok(c.price) &&
        ano.ok(c.year) &&
        `${c.brand} ${c.model} ${c.version}`.toLowerCase().includes(q),
    )
    .sort(ordenar[f.order] ?? ordenar.recentes);
}

export default function Inventory({ estoque, f, setF, saved, toggleSave, full = false, limit, title, as: H = "h2" }) {
  const { cars, loading, error, retry } = estoque;
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const limpar = () => setF((x) => ({ ...FILTRO_INICIAL, order: x.order }));
  const lista = filtrar(cars, f, saved);
  const visiveis = limit ? lista.slice(0, limit) : lista;
  const filtrando =
    f.q || f.brand !== "Todas" || f.cat !== "Todos" || f.saved || f.price !== "todas" || f.year !== "todos";

  return (
    <section className={"tc-inventory tc-section" + (full ? " is-full" : "")} id="estoque">
      <Reveal className="tc-section-heading">
        <div>
          <H>{title}</H>
        </div>
        <span className="tc-stock-count">
          {loading ? "··" : String(cars.length).padStart(2, "0")}{" "}
          <span>
            veículos{" "}
            <br />
            em estoque
          </span>
        </span>
      </Reveal>
      <div className="tc-search">
        <label>
          <Search size={21} />
          <input
            aria-label="Buscar veículo"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Busque por marca ou modelo"
          />
          {f.q && (
            <button onClick={() => set({ q: "" })} aria-label="Limpar busca">
              <X size={17} />
            </button>
          )}
        </label>
        <Dropdown
          label="Marca"
          value={f.brand}
          onChange={(brand) => set({ brand })}
          options={[
            full ? { value: "Todas", label: "Todas as marcas" } : "Todas",
            ...[...new Set(cars.map((c) => c.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
          ]}
        />
        {full && <Dropdown label="Preço" value={f.price} onChange={(price) => set({ price })} options={PRECOS} />}
        {full && <Dropdown label="Ano" value={f.year} onChange={(year) => set({ year })} options={ANOS} />}
        <Dropdown
          label="Ordenar"
          value={f.order}
          onChange={(order) => set({ order })}
          options={full ? ORDENS : ORDENS.slice(0, 2)}
        />
      </div>
      <div className="tc-filter-row">
        <Segments
          name="Categoria"
          value={f.cat}
          onChange={(cat) => set({ cat })}
          items={["Todos", ...new Set([...cars.map((c) => c.category), "Moto"])].map((q) => ({
            value: q,
            label: q === "Todos" ? "Todos os veículos" : q,
            count: cars.filter((c) => q === "Todos" || c.category === q).length,
          }))}
        />
        <button className={"tc-saved-filter " + (f.saved ? "active" : "")} onClick={() => set({ saved: !f.saved })} aria-pressed={f.saved}>
          <Heart size={17} /> Salvos <b>{saved.length}</b>
        </button>
      </div>
      {filtrando && !loading && (
        <div className="tc-filter-summary" aria-live="polite">
          <span>
            {lista.length} veículo(s) encontrado(s){f.q && ` para “${f.q}”`}
          </span>
          <button onClick={limpar}>
            Limpar filtros <X size={14} />
          </button>
        </div>
      )}
      <div className="tc-cars" aria-busy={loading}>
        {loading ? (
          Array.from({ length: limit ? Math.min(limit, 4) : 6 }, (_, i) => <CarSkeleton key={i} />)
        ) : (
          <AnimatePresence initial={false} mode="popLayout">
            {visiveis.map((c) => (
              <CarCard key={c.id} car={c} saved={saved.includes(c.id)} onSave={() => toggleSave(c.id)} />
            ))}
          </AnimatePresence>
        )}
      </div>
      {!loading && error && (
        <div className="tc-empty">
          <RotateCw size={32} />
          <h3>Não conseguimos carregar o estoque agora.</h3>
          <p>Tente de novo em instantes ou fale direto com a equipe da TC.</p>
          <div className="tc-empty-actions">
            <Action onClick={retry} icon={RotateCw}>
              Tentar de novo
            </Action>
            <Action href={wa("Olá! Quais veículos vocês têm disponíveis?")} target="_blank" rel="noreferrer" icon={WhatsIcon}>
              Ver pelo WhatsApp
            </Action>
          </div>
        </div>
      )}
      {!loading && !error && !lista.length && (
        <div className="tc-empty">
          <Search size={32} />
          <h3>
            {f.cat === "Moto"
              ? "Vamos encontrar sua próxima moto?"
              : cars.length
                ? "Vamos tentar outra busca?"
                : "O estoque está sendo atualizado."}
          </h3>
          <p>
            {f.cat === "Moto"
              ? "Consulte os modelos e a disponibilidade com a equipe da TC."
              : cars.length
                ? "Nenhum veículo corresponde aos filtros selecionados. Se não achar o que procura, a equipe busca para você."
                : "Fale com a equipe da TC para saber o que chegou."}
          </p>
          <div className="tc-empty-actions">
            {f.cat === "Moto" || !cars.length ? (
              <Action
                href={wa(f.cat === "Moto" ? "Olá! Quais motos vocês têm disponíveis?" : "Olá! Quais veículos vocês têm disponíveis?")}
                target="_blank"
                rel="noreferrer"
                icon={WhatsIcon}
              >
                {f.cat === "Moto" ? "Consultar motos" : "Falar com a TC"}
              </Action>
            ) : (
              <>
                <Action onClick={limpar}>Ver todos os veículos</Action>
                <Action
                  href={wa(`Olá! Estou procurando ${f.q || "um veículo"} e não encontrei no site. Vocês conseguem?`)}
                  target="_blank"
                  rel="noreferrer"
                  icon={WhatsIcon}
                  className="is-light"
                >
                  Pedir para a equipe
                </Action>
              </>
            )}
          </div>
        </div>
      )}
      {limit && !loading && lista.length > 0 && (
        <div className="tc-inventory-more">
          <Action href="/estoque">
            {lista.length > limit ? `Ver todos os ${lista.length} veículos` : "Ver estoque completo"}
          </Action>
        </div>
      )}
    </section>
  );
}
