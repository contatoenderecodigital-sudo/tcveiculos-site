import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import Home, { rolarPara } from "./Home.jsx";
import Estoque from "./Estoque.jsx";
import Carro from "./Carro.jsx";
import Legal, { PAGINAS_LEGAIS, tituloLegal } from "./Legal.jsx";
import { META_PADRAO, setMeta, useEstoque, useRoute, useSaved } from "./ui.jsx";
import "./styles.css";

// Links antigos do site eram por hash (#/privacidade); viram caminhos normais.
if (location.hash.startsWith("#/") && location.hash.length > 2) history.replaceState(null, "", location.hash.slice(1));

function App() {
  const loc = useRoute();
  const [path, hash] = loc.split("#");
  const estoque = useEstoque();
  const [saved, toggleSave] = useSaved();
  const pagina = path.replace(/^\/+|\/+$/g, "");
  const carro = pagina.match(/^carro\/(.+)$/);

  useEffect(() => {
    if (carro) return; // a página do carro cuida do próprio título
    const legal = PAGINAS_LEGAIS.includes(pagina);
    setMeta(
      pagina === "estoque"
        ? { ...META_PADRAO, title: "Estoque de seminovos em Xanxerê | TC Veículos", description: "Veja os carros disponíveis na TC Veículos, em Xanxerê, SC. Busque por marca, categoria, preço e ano." }
        : legal
          ? { ...META_PADRAO, title: `${tituloLegal(pagina)} | TC Veículos` }
          : META_PADRAO,
    );
    if (hash) requestAnimationFrame(() => rolarPara(hash));
    else scrollTo(0, 0);
  }, [loc]);

  const props = { estoque, saved, toggleSave };
  if (carro) return <Carro id={decodeURIComponent(carro[1])} {...props} />;
  if (pagina === "estoque") return <Estoque {...props} />;
  if (PAGINAS_LEGAIS.includes(pagina)) return <Legal page={pagina} />;
  return <Home {...props} />;
}

createRoot(document.getElementById("root")).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>,
);
