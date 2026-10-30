import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import * as Select from "@radix-ui/react-select";
import { ArrowUpRight, CalendarDays, Check, ChevronDown, Heart, Menu, Settings2, CarFront, X } from "lucide-react";
import { BASE, listar } from "./estoque.js";

export const WHATSAPP = "5549999868242";
export const wa = (msg) => `https://wa.me/${WHATSAPP}?text=` + encodeURIComponent(msg);
export const MSG_GERAL = "Olá! Gostaria de conversar com a TC Veículos.";
export const MAPS = "https://www.google.com/maps/place/TC+Ve%C3%ADculos/data=!4m2!3m1!1s0x0:0xe0079f358751991c";
export const brl = (n) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n);
export const nomeCarro = (c) => `${c.brand} ${c.model}`.trim();

/* Navegação: history API, sem roteador. O nginx devolve index.html para qualquer caminho. */
export function navigate(to) {
  history.pushState(null, "", to);
  dispatchEvent(new PopStateEvent("popstate"));
}
export function useRoute() {
  const [loc, setLoc] = useState(() => location.pathname + location.hash);
  useEffect(() => {
    const f = () => setLoc(location.pathname + location.hash);
    addEventListener("popstate", f);
    return () => removeEventListener("popstate", f);
  }, []);
  return loc;
}
export function Link({ href, onClick, ...p }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...p}
    />
  );
}

export function useEstoque() {
  const [s, set] = useState({ loading: true, error: null, cars: [] });
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    let vivo = true;
    listar().then(
      (cars) => vivo && set({ loading: false, error: null, cars }),
      (error) => vivo && set({ loading: false, error, cars: [] }),
    );
    return () => {
      vivo = false;
    };
  }, [tentativa]);
  return { ...s, retry: () => (set((x) => ({ ...x, loading: true })), setTentativa((t) => t + 1)) };
}

const SALVOS = "tc-salvos";
export function useSaved() {
  const [saved, set] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SALVOS)) || [];
    } catch {
      return [];
    }
  });
  const toggle = (id) =>
    set((s) => {
      const n = s.includes(id) ? s.filter((x) => x !== id) : [...s, id];
      try {
        localStorage.setItem(SALVOS, JSON.stringify(n));
      } catch {
        // sem armazenamento, a lista vale só nesta visita
      }
      return n;
    });
  return [saved, toggle];
}

export function WhatsIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.4 3.6A11.5 11.5 0 0 0 2.3 17.4L1 23l5.7-1.5A11.5 11.5 0 0 0 20.4 3.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.2 6.5c-.3-.6-.6-.6-.9-.6-.5 0-1.7.8-1.7 2.5s1.3 3.4 1.5 3.6c.2.3 2.5 4 6.2 5.3 3.1 1.1 3.8-.1 4.3-.8.4-.6.5-1.5.3-1.7-.2-.2-2.2-1.2-2.5-1.3-.3-.1-.5-.1-.7.2l-1 1.2c-.2.2-.4.2-.7.1-1.6-.7-2.9-1.7-3.9-3.3-.2-.3 0-.5.1-.7.5-.5.9-1 .7-1.4l-1-2.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

export const Logo = () => <img src="/assets/tc-logo.svg" alt="TC Veículos" className="tc-mark" />;

export function Action({ children, href, onClick, className = "", icon: Icon = ArrowUpRight, ...p }) {
  const inner = (
    <>
      <span>{children}</span>
      <i aria-hidden="true">
        <Icon size={18} />
      </i>
    </>
  );
  const cls = "tc-action " + className;
  if (href && href.startsWith("/"))
    return (
      <Link className={cls} href={href} {...p}>
        {inner}
      </Link>
    );
  const Tag = href ? "a" : "button";
  return (
    <Tag className={cls} href={href} onClick={onClick} {...p}>
      {inner}
    </Tag>
  );
}

export function Reveal({ children, className = "", delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Dropdown({ label, value, onChange, options }) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className="tc-select" aria-label={label}>
        <span className="tc-select-label">{label}</span>
        <Select.Value />
        <Select.Icon>
          <ChevronDown size={16} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="tc-select-menu" position="popper" sideOffset={8}>
          <Select.Viewport>
            {options.map((o) => (
              <Select.Item key={o.value ?? o} value={o.value ?? o} className="tc-select-option">
                <Select.ItemText>{o.label ?? o}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export function Segments({ items, value, onChange, name }) {
  const id = useId();
  return (
    <div className="tc-segments" aria-label={name}>
      {items.map((f) => (
        <button key={f.value} type="button" onClick={() => onChange(f.value)} aria-pressed={value === f.value}>
          {value === f.value && (
            <motion.span
              layoutId={id}
              className="tc-segment-active"
              transition={{ type: "spring", stiffness: 420, damping: 35 }}
            />
          )}
          <span>{f.label}</span>
          {f.count !== undefined && <b>{f.count}</b>}
        </button>
      ))}
    </div>
  );
}

const MARCAS = {
  Jeep: "jeep-alt-svgrepo-com.svg",
  Toyota: "cdnlogo.com_toyota-logo.svg",
  BMW: "bmw-svgrepo-com.svg",
  Volkswagen: "volkswagen.svg",
  VW: "volkswagen.svg",
  Ford: "ford.svg",
  Fiat: "fiat-3-logo-svgrepo-com.svg",
};
export function BrandLogo({ brand }) {
  return MARCAS[brand] ? (
    <img className="tc-brand-logo" src={"/assets/brands/" + MARCAS[brand]} alt={brand} />
  ) : (
    <span>{brand}</span>
  );
}

export function CarCard({ car: n, saved, onSave }) {
  const href = "/carro/" + encodeURIComponent(n.id);
  return (
    <motion.article
      layout
      className="tc-car"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      <div className="tc-car-top">
        <div>
          <BrandLogo brand={n.brand} />
          <h3>
            <Link href={href}>{n.model}</Link>
          </h3>
        </div>
        <button
          className={"tc-save " + (saved ? "is-saved" : "")}
          onClick={onSave}
          aria-label={`${saved ? "Remover" : "Salvar"} ${n.model}`}
          aria-pressed={saved}
        >
          <Heart size={20} />
        </button>
      </div>
      <Link className="tc-car-image" href={href} aria-label={`Ver ${nomeCarro(n)}`}>
        {n.photos[0] ? (
          <img src={n.photos[0]} alt={`${nomeCarro(n)} ${n.year ?? ""}`.trim()} loading="lazy" />
        ) : (
          <span className="tc-no-photo">Fotos em breve</span>
        )}
        <span className="tc-image-open">
          <ArrowUpRight size={23} />
        </span>
        {n.status === "reservado" && <b className="tc-reserved">Reservado</b>}
      </Link>
      <div className="tc-car-info">
        <p>{n.version}</p>
        <div className="tc-spec-line">
          <span>
            <CalendarDays />
            {n.year}
          </span>
          <span>
            <Settings2 />
            {n.gear || "A consultar"}
          </span>
          <span>
            <CarFront />
            {n.category}
          </span>
        </div>
        <div className="tc-car-price">
          <div>
            <small>{n.price ? "Valor anunciado" : "Consulte a equipe"}</small>
            <strong>{n.price ? brl(n.price) : "Valor sob consulta"}</strong>
          </div>
          <Action href={href}>Ver veículo</Action>
        </div>
      </div>
    </motion.article>
  );
}

export function CarSkeleton() {
  return (
    <div className="tc-car tc-car-skeleton" aria-hidden="true">
      <div className="tc-car-top">
        <div>
          <i />
          <i />
        </div>
      </div>
      <div className="tc-car-image" />
      <div className="tc-car-info">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

export function Header({ count, go }) {
  const [open, setOpen] = useState(false);
  const ir = (id) => (setOpen(false), go(id));
  return (
    <header className="tc-nav">
      <Link href="/" aria-label="TC Veículos, início">
        <Logo />
      </Link>
      <nav className={open ? "is-open" : ""} aria-label="Menu principal">
        <button onClick={() => ir("estoque")}>
          Veículos {count !== undefined && <span>{String(count).padStart(2, "0")}</span>}
        </button>
        <button onClick={() => ir("troca")}>Venda ou troque</button>
        <button onClick={() => ir("loja")}>A loja</button>
      </nav>
      <Action href={wa(MSG_GERAL)} target="_blank" rel="noreferrer">
        Fale com a TC
      </Action>
      <button
        className="tc-menu"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}

export const DADOS =
  "https://wa.me/5549999868242?text=" +
  encodeURIComponent("Olá! Gostaria de tratar de uma solicitação sobre meus dados pessoais.");

export function Footer({ go }) {
  return (
    <footer className="tc-site-footer">
      <div className="tc-footer-columns">
        <div className="tc-footer-company">
          <Link href="/" aria-label="TC Veículos, início">
            <img src="/assets/tc-logo.svg" alt="TC Veículos" />
          </Link>
          <p>Realizar seu sonho é nossa missão.</p>
          <strong>TC Comércio de Veículos Ltda.</strong>
          <span>CNPJ 24.168.436/0001-52</span>
        </div>
        <nav aria-label="Navegação do rodapé">
          <h3>Explore</h3>
          <button onClick={() => go("estoque")}>Veículos</button>
          <button onClick={() => go("troca")}>Venda ou troque</button>
          <button onClick={() => go("loja")}>Conheça a loja</button>
          <a href={BASE}>Área da loja</a>
        </nav>
        <div>
          <h3>Fale com a TC</h3>
          <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer">
            WhatsApp · (49) 99986 8242
          </a>
          <a href="tel:+554934300680">Telefone · (49) 3430 0680</a>
          <a href="https://www.instagram.com/tcveiculosxxe/" target="_blank" rel="noreferrer">
            Instagram · @tcveiculosxxe
          </a>
          <p>
            Av. Brasil, 1313 · Colatto
            <br />
            Xanxerê, SC · CEP 89820-000
          </p>
        </div>
        <nav aria-label="Informações legais">
          <h3>Informações</h3>
          <Link href="/privacidade">Política de privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
          <Link href="/cookies">Cookies e preferências</Link>
          <a href={DADOS} target="_blank" rel="noreferrer">
            Solicitações sobre dados
          </a>
        </nav>
      </div>
      <div className="tc-footer-base">
        <span>© {new Date().getFullYear()} TC Veículos</span>
        <a href="https://www.instagram.com/endereco.digital/" target="_blank" rel="noreferrer">
          Desenvolvido por: @endereco.digital
        </a>
      </div>
    </footer>
  );
}

export function WhatsFloat() {
  return (
    <a className="tc-whatsapp-float" href={wa(MSG_GERAL)} target="_blank" rel="noreferrer" aria-label="Conversar no WhatsApp">
      <WhatsIcon />
    </a>
  );
}

/* Título e meta por página (Open Graph só vale para robôs que rodam JS). */
export function setMeta({ title, description, image }) {
  document.title = title;
  const put = (attr, key, val) => {
    if (!val) return;
    let m = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute(attr, key);
      document.head.appendChild(m);
    }
    m.setAttribute("content", val);
  };
  put("name", "description", description);
  put("property", "og:title", title);
  put("property", "og:description", description);
  put("property", "og:url", location.href);
  if (image) put("property", "og:image", new URL(image, location.href).href);
}
export const META_PADRAO = {
  title: "TC Veículos | Seu próximo capítulo",
  description: "Conheça a TC Veículos, em Xanxerê. Compra, venda, troca e financiamento de veículos.",
  image: "/assets/tc-campaign-v2.png",
};
