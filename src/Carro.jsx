import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { buscarCarro } from "./estoque.js";
import { Action, BrandLogo, CarCard, Link, META_PADRAO, WhatsIcon, brl, nomeCarro, setMeta, wa } from "./ui.jsx";

const NI = "Não informado";

function Galeria({ car }) {
  const fotos = car.photos.map((src, i) => ({ src, label: i === 0 ? "Capa" : "Foto " + (i + 1) }));
  const [[i, dir], setI] = useState([0, 0]);
  const reduce = useReducedMotion();
  const trilho = useRef(null);
  const ir = (n) => setI(([a]) => [(n + fotos.length) % fotos.length, n > a ? 1 : -1]);

  useEffect(() => {
    trilho.current?.children[i]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [i]);

  if (!fotos.length)
    return (
      <section data-section="Fotos" className="tc-product-photos">
        <div className="tc-product-photo">
          <span className="tc-no-photo">Fotos em breve</span>
        </div>
      </section>
    );

  const varia = {
    entra: (d) => ({ x: reduce ? 0 : d >= 0 ? "100%" : "-100%", opacity: reduce ? 0 : 1 }),
    fica: { x: 0, opacity: 1 },
    sai: (d) => ({ x: reduce ? 0 : d >= 0 ? "-100%" : "100%", opacity: reduce ? 0 : 1 }),
  };

  return (
    <section data-section="Fotos" className="tc-product-photos">
      <div
        className="tc-product-photo"
        tabIndex={0}
        aria-roledescription="carrossel"
        aria-label={`Fotos do ${nomeCarro(car)}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") ir(i + 1);
          if (e.key === "ArrowLeft") ir(i - 1);
        }}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.img
            key={i}
            src={fotos[i].src}
            alt={`${nomeCarro(car)}, ${fotos[i].label}`}
            custom={dir}
            variants={varia}
            initial="entra"
            animate="fica"
            exit="sai"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            drag={fotos.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, { offset }) => {
              if (offset.x < -60) ir(i + 1);
              else if (offset.x > 60) ir(i - 1);
            }}
            draggable={false}
          />
        </AnimatePresence>
        {car.status === "reservado" && <b className="tc-reserved">Reservado</b>}
        {fotos.length > 1 && (
          <div className="tc-photo-arrows">
            <button onClick={() => ir(i - 1)} aria-label="Foto anterior">
              <ChevronLeft size={22} />
            </button>
            <button onClick={() => ir(i + 1)} aria-label="Próxima foto">
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </div>
      <div className="tc-photo-selector">
        <div className="tc-photo-track" ref={trilho}>
          {fotos.map((f, n) => (
            <button key={f.src + n} onClick={() => ir(n)} aria-pressed={n === i} aria-label={f.label}>
              <img src={f.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
        <span>
          {String(i + 1).padStart(2, "0")} / {String(fotos.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}

function parcela(valor, entrada, meses, taxa) {
  const r = valor - entrada;
  if (!Number.isFinite(r) || valor <= 0 || entrada < 0 || r <= 0 || !Number.isInteger(meses) || meses < 1 || meses > 120 || !Number.isFinite(taxa) || taxa < 0 || taxa > 10)
    return null;
  const i = taxa / 100;
  const p = i === 0 ? r / meses : (r * i) / (1 - Math.pow(1 + i, -meses));
  return { principal: r, payment: p, total: p * meses + entrada, interest: p * meses - r };
}

function Financiamento({ car: n, falar }) {
  const [valor, setValor] = useState(n.price || "");
  const [entrada, setEntrada] = useState(n.price ? Math.round(n.price * 0.3) : "");
  const [meses, setMeses] = useState(48);
  const [taxa, setTaxa] = useState("");
  const v = taxa !== "" && entrada !== "" ? parcela(Number(valor), Number(entrada), Number(meses), Number(taxa)) : null;
  return (
    <section data-section="Financiamento" className="tc-product-section tc-financing">
      <h2>Simule o financiamento</h2>
      <p>Escolha a entrada e o prazo para estimar as parcelas.</p>
      <div className="finance-fields">
        <label>
          Valor do veículo (R$)
          <input type="number" min="1" step="100" value={valor} onChange={(e) => setValor(e.target.value)} placeholder={n.price ? "" : "Informe um valor para simular"} />
        </label>
        <label>
          Entrada (R$)
          <input type="number" min="0" step="100" value={entrada} onChange={(e) => setEntrada(e.target.value)} placeholder="Valor de entrada" />
        </label>
        <label>
          Prazo
          <select value={meses} onChange={(e) => setMeses(Number(e.target.value))}>
            {[12, 24, 36, 48, 60].map((m) => (
              <option key={m} value={m}>
                {m} meses
              </option>
            ))}
          </select>
        </label>
        <label>
          Taxa de juros mensal (%)
          <input type="number" min="0" max="10" step="0.01" value={taxa} onChange={(e) => setTaxa(e.target.value)} placeholder="Informe a taxa para simular" />
        </label>
      </div>
      {v ? (
        <div className="finance-result" aria-live="polite">
          <div>
            <span>{meses} parcelas estimadas de</span>
            <strong>{brl(v.payment)}</strong>
          </div>
          <dl>
            <div>
              <dt>Valor financiado</dt>
              <dd>{brl(v.principal)}</dd>
            </div>
            <div>
              <dt>Juros no período</dt>
              <dd>{brl(v.interest)}</dd>
            </div>
            <div>
              <dt>Total com entrada</dt>
              <dd>{brl(v.total)}</dd>
            </div>
          </dl>
          <a
            href={falar(`Quero consultar financiamento. Simulei valor de ${brl(Number(valor))}, entrada de ${brl(Number(entrada))} e prazo de ${meses} meses. Quais são as condições reais e o CET?`)}
            target="_blank"
            rel="noreferrer"
          >
            Consultar condições com a TC
          </a>
        </div>
      ) : (
        <p className="finance-hint">
          {valor && entrada !== "" && Number(entrada) >= Number(valor)
            ? "A entrada deve ser menor que o valor do veículo."
            : "Preencha o valor, a entrada e a taxa mensal para ver a estimativa."}
        </p>
      )}
      <small>
        Simulação matemática com parcelas fixas (Tabela Price). A taxa é informada por você. Não inclui IOF, tarifas, seguros ou outros custos e não representa o CET. Condições reais dependem da instituição financeira, análise de crédito e disponibilidade do veículo.
      </small>
    </section>
  );
}

function Compartilhar({ car }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className="tc-source-link"
      onClick={async () => {
        const dados = { title: `${nomeCarro(car)} ${car.year ?? ""} | TC Veículos`, url: location.href };
        try {
          if (navigator.share) return await navigator.share(dados);
          await navigator.clipboard.writeText(location.href);
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        } catch {
          // compartilhamento cancelado
        }
      }}
    >
      <Share2 size={15} /> {ok ? "Link copiado" : "Compartilhar este veículo"}
    </button>
  );
}

function parecidos(car, cars) {
  const outros = cars.filter((c) => c.id !== car.id);
  const dist = (c) =>
    (c.category === car.category ? 0 : 1e9) + (car.price && c.price ? Math.abs(c.price - car.price) : 5e8);
  return [...outros].sort((a, b) => dist(a) - dist(b)).slice(0, 3);
}

function schema(n) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${nomeCarro(n)} ${n.version}`.trim(),
    brand: { "@type": "Brand", name: n.brand },
    model: n.model,
    vehicleModelDate: n.year ? String(n.year) : undefined,
    mileageFromOdometer: n.mileage != null ? { "@type": "QuantitativeValue", value: n.mileage, unitCode: "KMT" } : undefined,
    color: n.color || undefined,
    image: n.photos.map((p) => new URL(p, location.href).href),
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: n.price ?? undefined,
      availability: n.status === "reservado" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      seller: {
        "@type": "AutoDealer",
        name: "TC Veículos",
        telephone: "+55 49 3430-0680",
        address: { "@type": "PostalAddress", streetAddress: "Av. Brasil, 1313, Colatto", addressLocality: "Xanxerê", addressRegion: "SC", postalCode: "89820-000", addressCountry: "BR" },
      },
    },
  });
}

export default function Carro({ id, estoque, saved, toggleSave }) {
  const [state, setState] = useState({ loading: true, car: null });
  const [secao, setSecao] = useState("Fotos");
  const scroll = useRef(null);

  useEffect(() => {
    let vivo = true;
    setState({ loading: true, car: null });
    scroll.current?.scrollTo(0, 0);
    buscarCarro(id).then(
      (car) => vivo && setState({ loading: false, car }),
      () => vivo && setState({ loading: false, car: null }),
    );
    return () => {
      vivo = false;
    };
  }, [id]);

  const n = state.car;
  useEffect(() => {
    if (!n) return;
    const preco = n.price ? brl(n.price) : "valor sob consulta";
    setMeta({
      title: `${nomeCarro(n)} ${n.year ?? ""} | TC Veículos Xanxerê`,
      description: `${nomeCarro(n)} ${n.version} ${n.year ?? ""}, ${preco}. Seminovo na TC Veículos, Av. Brasil 1313, Xanxerê, SC.`,
      image: n.photos[0],
    });
    return () => setMeta(META_PADRAO);
  }, [n]);

  const header = (
    <header className="tc-product-header">
      <Link className="tc-back" href="/estoque">
        Voltar aos veículos
      </Link>
      <Link href="/" aria-label="TC Veículos, início">
        <img src="/assets/tc-logo.svg" alt="TC Veículos" />
      </Link>
      {n ? (
        <button onClick={() => toggleSave(n.id)} aria-pressed={saved.includes(n.id)}>
          {saved.includes(n.id) ? "Salvo na sua lista" : "Salvar veículo"}
        </button>
      ) : (
        <span />
      )}
    </header>
  );

  if (!n)
    return (
      <div className="tc-product-page">
        {header}
        <div className="tc-product-scroll" ref={scroll}>
          {state.loading ? (
            <div className="tc-product-loading" aria-busy="true">
              <i />
              <i />
              <div className="tc-product-photo" />
            </div>
          ) : (
            <div className="tc-empty tc-product-missing">
              <h1>Este veículo não está mais disponível.</h1>
              <p>Ele pode ter sido vendido ou retirado do estoque. Veja os outros veículos da TC.</p>
              <div className="tc-empty-actions">
                <Action href="/estoque">Ver o estoque</Action>
                <Action href={wa("Olá! Procurei um veículo no site e ele não aparece mais. Vocês têm outro parecido?")} target="_blank" rel="noreferrer" icon={WhatsIcon} className="is-light">
                  Falar com a TC
                </Action>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  const falar = (msg) => wa(`Olá! Sobre o ${nomeCarro(n)} ${n.version} ${n.year ?? ""}: ${msg}\n${location.href}`);
  const ficha = [
    ["Marca", n.brand],
    ["Modelo", n.model],
    ["Versão", n.version],
    ["Fabricação / modelo", n.manufactureYear && n.manufactureYear !== n.year ? `${n.manufactureYear} / ${n.year}` : n.year],
    ["Quilometragem", n.mileage != null ? n.mileage.toLocaleString("pt-BR") + " km" : NI],
    ["Câmbio", n.gear],
    ["Combustível", n.fuel],
    ["Cor", n.color],
    ["Carroceria", n.category],
    ["Portas", n.doors],
  ];
  const perguntas = [
    ["Aceita meu carro na troca?", "A avaliação depende do modelo, ano, estado e documentação do seu usado. Envie esses dados para receber uma proposta de troca.", "Quero avaliar meu usado na troca.", "Avaliar minha troca"],
    ["Como posso financiar?", "Peça uma proposta com o valor de entrada e o prazo que você pretende. As condições dependem da análise de crédito.", "Quero uma proposta de financiamento.", "Pedir proposta"],
    ["Posso ver o carro pessoalmente?", "A TC fica na Av. Brasil, 1313, bairro Colatto, em Xanxerê, SC. Combine um horário com a equipe e confirme se o veículo está na loja.", "Quero agendar uma visita para conhecer o carro.", "Combinar visita"],
    ["Tem laudo, histórico e garantia?", "Peça à equipe o laudo, o histórico de revisões e as condições de garantia deste veículo antes de decidir.", "Pode me enviar o laudo, as revisões e as condições de garantia?", "Solicitar informações"],
  ];
  const similares = parecidos(n, estoque.cars);
  const secoes = ["Fotos", "Ficha técnica", "Equipamentos", "Financiamento", "Compra e visita", ...(similares.length ? ["Parecidos"] : [])];
  const irSecao = (s) => {
    setSecao(s);
    scroll.current?.querySelector(`[data-section="${s}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="tc-product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema(n) }} />
      {header}
      <div className="tc-product-scroll" ref={scroll}>
        <div className="tc-product-title">
          <div>
            <p className="tc-product-brand">
              <BrandLogo brand={n.brand} />
              <span>{n.year}</span>
              {n.status === "reservado" && <b className="tc-reserved-tag">Reservado</b>}
            </p>
            <h1>
              {n.model}
              <span>{n.version}</span>
            </h1>
          </div>
          <span>Xanxerê, SC</span>
        </div>
        <nav className="tc-product-nav" aria-label="Informações do veículo">
          {secoes.map((s) => (
            <button key={s} onClick={() => irSecao(s)} aria-current={secao === s ? "true" : undefined}>
              {s}
            </button>
          ))}
        </nav>
        <div className="tc-product-grid">
          <div className="tc-product-content">
            <Galeria key={n.id} car={n} />
            <section data-section="Ficha técnica" className="tc-product-section">
              <h2>Conheça o {n.model}.</h2>
              <dl className="tc-full-specs">
                {ficha.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v || NI}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section data-section="Equipamentos" className="tc-product-section">
              <h2>Equipamentos e detalhes</h2>
              {n.equipment.length ? (
                <ul className="tc-equipment-list">
                  {n.equipment.map((e, k) => (
                    <li key={k}>{e}</li>
                  ))}
                </ul>
              ) : (
                <div className="tc-missing-equipment">
                  <p>A lista de equipamentos desta unidade ainda não foi publicada.</p>
                  <a href={falar("Pode me enviar a lista de equipamentos desta unidade?")} target="_blank" rel="noreferrer">
                    Pedir lista à loja
                  </a>
                </div>
              )}
              {n.description && <p className="tc-car-description">{n.description}</p>}
            </section>
            <Financiamento car={n} falar={falar} />
            <section data-section="Compra e visita" className="tc-product-section">
              <h2>Antes de decidir</h2>
              <div className="tc-purchase-questions">
                {perguntas.map(([q, r, msg, cta], k) => (
                  <details key={q} open={k === 0 || undefined}>
                    <summary>
                      {q}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <p>{r}</p>
                    <a href={falar(msg)} target="_blank" rel="noreferrer">
                      {cta}
                    </a>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <aside className="tc-purchase">
            <div className="tc-purchase-inner">
              <span className="tc-price-label">{n.price ? "Valor do veículo" : "Fale com a loja sobre o valor"}</span>
              <strong className="tc-purchase-price">{n.price ? brl(n.price) : "Sob consulta"}</strong>
              <p className="tc-purchase-version">
                {nomeCarro(n)} · {n.year}
              </p>
              {n.status === "reservado" && (
                <p className="tc-purchase-reserved">Reservado no momento. Chame a equipe para entrar na fila ou ver opções parecidas.</p>
              )}
              <a className="tc-purchase-primary" href={falar("Tenho interesse neste veículo.")} target="_blank" rel="noreferrer">
                Chamar no WhatsApp <WhatsIcon />
              </a>
              <a className="tc-purchase-secondary" href={falar("Quero agendar uma visita.")} target="_blank" rel="noreferrer">
                Agendar visita
              </a>
              <div className="tc-purchase-dealer">
                <strong>TC Veículos</strong>
                <p>
                  Av. Brasil, 1313 · Colatto
                  <br />
                  Xanxerê, Santa Catarina
                </p>
                <a href={falar("Gostaria de tirar uma dúvida.")} target="_blank" rel="noreferrer">
                  WhatsApp · (49) 99986 8242
                </a>
              </div>
              <Compartilhar car={n} />
            </div>
          </aside>
        </div>
        {similares.length > 0 && (
          <section data-section="Parecidos" className="tc-product-section tc-similar">
            <h2>Você também pode gostar</h2>
            <div className="tc-cars">
              {similares.map((c) => (
                <CarCard key={c.id} car={c} saved={saved.includes(c.id)} onSave={() => toggleSave(c.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
      <div className="tc-product-mobile-contact">
        <span>{n.price ? brl(n.price) : "Valor sob consulta"}</span>
        <a href={falar("Tenho interesse neste veículo.")} target="_blank" rel="noreferrer">
          WhatsApp <WhatsIcon />
        </a>
      </div>
    </div>
  );
}
