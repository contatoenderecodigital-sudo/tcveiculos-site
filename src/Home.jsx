import { useState } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, ArrowUpRight, MapPin, Phone, X } from "lucide-react";
import Inventory, { FILTRO_INICIAL } from "./Inventory.jsx";
import {
  Action,
  Footer,
  Header,
  Logo,
  MAPS,
  MSG_GERAL,
  Reveal,
  WhatsFloat,
  WhatsIcon,
  wa,
} from "./ui.jsx";

// Instagram não existe mais no lucide atual; o desenho é o mesmo da versão usada no site.
const InstagramIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const CATEGORIAS = [
  { name: "SUVs", value: "SUV", art: "/assets/tc-compass-plate-corrected.svg", copy: "Espaço para novos caminhos." },
  { name: "Sedãs", value: "Sedã", art: "/assets/tc-corolla-plate-corrected.svg", copy: "Conforto em cada quilômetro." },
  { name: "Hatches", value: "Hatch", art: "/assets/tc-fox-plate-corrected.svg", copy: "Feitos para o seu dia a dia." },
  { name: "Motos", value: "Moto", art: "/assets/tc-motos-category.png", copy: "Consulte as opções com a TC." },
];

export const rolarPara = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Home({ estoque, saved, toggleSave }) {
  const reduce = useReducedMotion();
  const [f, setF] = useState(FILTRO_INICIAL);
  const [pedido, setPedido] = useState(null);
  const { cars } = estoque;

  return (
    <LayoutGroup>
      <div className="tc-site">
        <Header count={estoque.loading ? undefined : cars.length} go={rolarPara} />
        <main>
          <section className="tc-hero">
            <picture>
              <source media="(max-width:700px)" srcSet="/assets/tc-hero-mobile-corrected.svg" />
              <img
                src="/assets/tc-hero-desktop-corrected.svg"
                alt="Jeep Compass com placa da TC em imagem de campanha"
                fetchPriority="high"
              />
            </picture>
            <div className="tc-hero-content">
              <Reveal>
                <p>TC Veículos · Xanxerê, SC</p>
                <h1>
                  Seminovos com
                  <br />
                  procedência.
                </h1>
              </Reveal>
              <Reveal className="tc-hero-aside" delay={0.12}>
                <p>
                  Compra, venda e troca.
                  <br />O seu próximo carro começa aqui.
                </p>
                <Action onClick={() => rolarPara("estoque")}>Conhecer os veículos</Action>
              </Reveal>
            </div>
          </section>

          <section className="tc-discover tc-section">
            <Reveal className="tc-section-heading">
              <div>
                <h2>Qual combina com você?</h2>
              </div>
              <p>
                Explore por categoria.
                <br />A escolha começa pelo seu jeito de dirigir.
              </p>
            </Reveal>
            <div className="tc-category-gallery">
              {CATEGORIAS.map((q, i) => {
                // foto do carro mais recente da categoria; sem carro, fica a arte da campanha
                const foto = cars.find((c) => c.category === q.value && c.photos[0])?.photos[0];
                return (
                  <motion.button
                    initial={reduce ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, delay: i * 0.08 }}
                    className="tc-category"
                    key={q.value}
                    onClick={() => {
                      setF({ ...FILTRO_INICIAL, cat: q.value });
                      rolarPara("estoque");
                    }}
                  >
                    <img src={foto || q.art} alt="" loading="lazy" />
                    <div className="tc-category-head">
                      <h3>{q.name}</h3>
                      <span>{q.copy}</span>
                    </div>
                    <div className="tc-category-bottom">
                      <span>Explorar {q.name.toLowerCase()}</span>
                      <i>
                        <ArrowUpRight size={23} />
                      </i>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <Inventory
            estoque={estoque}
            f={f}
            setF={setF}
            saved={saved}
            toggleSave={toggleSave}
            limit={6}
            title="Encontre o seu."
          />

          <section className="tc-trade" id="troca">
            <img src="/assets/tc-trade-v2.png" alt="Sedã em imagem ilustrativa de campanha" loading="lazy" />
            <Reveal className="tc-trade-copy">
              <h2>Vamos avaliar seu usado.</h2>
              <p>Conte qual é o seu carro e o que você procura. Nossa equipe ajuda a planejar a troca.</p>
              <Action onClick={() => setPedido("Avaliar meu usado")}>Quero avaliar meu usado</Action>
            </Reveal>
          </section>

          <section className="tc-visit tc-section" id="loja">
            <Reveal>
              <h2>A gente se encontra aqui.</h2>
              <a className="tc-instagram" href="https://www.instagram.com/tcveiculosxxe/" target="_blank" rel="noreferrer">
                <i className="tc-contact-icon">
                  <InstagramIcon size={22} />
                </i>
                <span>
                  <small>Instagram</small>
                  <strong>@tcveiculosxxe</strong>
                </span>
                <ArrowUpRight size={19} />
              </a>
              <div className="tc-contact-links">
                <a href={wa(MSG_GERAL)} target="_blank" rel="noreferrer">
                  <i className="tc-contact-icon">
                    <WhatsIcon />
                  </i>
                  <span>
                    <small>WhatsApp</small>
                    <strong>(49) 99986 8242</strong>
                  </span>
                  <ArrowUpRight size={19} />
                </a>
                <a href="tel:+554934300680">
                  <i className="tc-contact-icon">
                    <Phone size={22} />
                  </i>
                  <span>
                    <small>Telefone da loja</small>
                    <strong>(49) 3430 0680</strong>
                  </span>
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </Reveal>
            <div className="tc-location">
              <iframe
                title="Localização da TC Veículos em Xanxerê"
                src="https://maps.google.com/maps?q=TC%20Ve%C3%ADculos%20Av.%20Brasil%201313%20Xanxer%C3%AA%20SC&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer"
                allowFullScreen
              />
              <a className="tc-location-address" href={MAPS} target="_blank" rel="noreferrer">
                <i className="tc-contact-icon">
                  <MapPin size={22} />
                </i>
                <span>
                  <strong>Av. Brasil, 1313</strong>
                  <small>Colatto · Xanxerê, SC</small>
                </span>
                <i className="tc-contact-icon tc-route-arrow">
                  <ArrowUpRight size={21} />
                </i>
              </a>
            </div>
          </section>
        </main>
        <Footer go={rolarPara} />
        <WhatsFloat />
      </div>

      <Dialog.Root open={!!pedido} onOpenChange={(o) => o || setPedido(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="tc-overlay" />
          <Dialog.Content className="tc-enquiry">
            <Dialog.Close className="tc-close" aria-label="Fechar formulário">
              <X />
            </Dialog.Close>
            <Logo />
            <Dialog.Title>Vamos conhecer seu carro.</Dialog.Title>
            <Dialog.Description>
              Conte um pouco sobre o seu usado. A conversa continua no WhatsApp da TC.
            </Dialog.Description>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                window.open(
                  wa(`Olá! Meu nome é ${d.get("name")}. Quero avaliar meu usado: ${d.get("note")}`),
                  "_blank",
                  "noopener",
                );
                setPedido(null);
              }}
            >
              <label>
                Como podemos chamar você?
                <input name="name" required maxLength={60} placeholder="Seu nome" />
              </label>
              <label>
                Qual carro você quer avaliar?
                <textarea name="note" required maxLength={400} placeholder="Modelo, ano ou sua dúvida" />
              </label>
              <Action type="submit" icon={ArrowRight}>
                Continuar no WhatsApp
              </Action>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </LayoutGroup>
  );
}
