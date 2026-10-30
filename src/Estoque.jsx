import { useEffect, useState } from "react";
import { LayoutGroup } from "framer-motion";
import Inventory, { FILTRO_INICIAL } from "./Inventory.jsx";
import { Footer, Header, WhatsFloat, navigate } from "./ui.jsx";

const irNaHome = (id) => (id === "estoque" ? scrollTo({ top: 0, behavior: "smooth" }) : navigate("/#" + id));

export default function Estoque({ estoque, saved, toggleSave }) {
  const [f, setF] = useState(() => {
    const p = new URLSearchParams(location.search);
    return { ...FILTRO_INICIAL, cat: p.get("categoria") || "Todos", q: p.get("busca") || "" };
  });

  // filtros na URL para poder compartilhar uma busca
  useEffect(() => {
    const p = new URLSearchParams();
    if (f.cat !== "Todos") p.set("categoria", f.cat);
    if (f.q) p.set("busca", f.q);
    const s = p.toString();
    history.replaceState(null, "", "/estoque" + (s ? "?" + s : ""));
  }, [f.cat, f.q]);

  return (
    <LayoutGroup>
      <div className="tc-site tc-stock-page">
        <Header count={estoque.loading ? undefined : estoque.cars.length} go={irNaHome} />
        <main>
          <Inventory
            estoque={estoque}
            f={f}
            setF={setF}
            saved={saved}
            toggleSave={toggleSave}
            full
            as="h1"
            title="Nosso estoque."
          />
        </main>
        <Footer go={irNaHome} />
        <WhatsFloat />
      </div>
    </LayoutGroup>
  );
}
