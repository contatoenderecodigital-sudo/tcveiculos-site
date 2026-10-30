import { DADOS, Link } from "./ui.jsx";

const TITULOS = { privacidade: "Política de privacidade", termos: "Termos de uso", cookies: "Cookies e preferências" };

const Privacidade = () => (
  <>
    <section>
      <h2>Quem é a loja</h2>
      <p>
        TC Comércio de Veículos Ltda., nome fantasia TC Veículos, CNPJ 24.168.436/0001-52, localizada na Av. Brasil, 1313, Colatto, Xanxerê, SC, CEP 89820-000. Para assuntos sobre seus dados, utilize o WhatsApp (49) 99986 8242 ou o telefone (49) 3430 0680.
      </p>
    </section>
    <section>
      <h2>Como o site utiliza dados</h2>
      <p>
        Você pode consultar os veículos sem criar uma conta. Os veículos que você salva ficam no armazenamento deste navegador e não são enviados à loja. O formulário de avaliação do usado apenas prepara uma mensagem no WhatsApp; nada é gravado no site.
      </p>
      <p>
        Ao abrir o WhatsApp e enviar uma mensagem, você compartilha com a loja o número e as informações que decidir fornecer. O contato serve para responder à sua solicitação e conduzir as tratativas de compra ou troca pedidas por você.
      </p>
    </section>
    <section>
      <h2>Serviços externos e finalidades</h2>
      <p>
        A lista de veículos é carregada do sistema de estoque da loja (Sua Revenda). O mapa do Google é carregado automaticamente ao se aproximar da seção de localização. Nesse momento, dados técnicos da conexão, como IP e informações do navegador, podem ser recebidos por esses serviços. Você pode bloquear conteúdo de terceiros nas configurações do navegador. Os links de Instagram e WhatsApp abrem serviços externos com suas próprias regras de privacidade. O site não contém ferramentas de publicidade nem medição de audiência.
      </p>
    </section>
    <section>
      <h2>Fundamentos e tempo de conservação</h2>
      <p>
        O atendimento de uma solicitação comercial pode envolver procedimentos preliminares a uma contratação, a seu pedido. Outras operações da loja precisam de finalidade e fundamento próprios; visualizar o mapa não autoriza marketing.
      </p>
      <p>
        Os registros locais permanecem neste navegador até você removê-los, limpar os dados do site ou até que o navegador os exclua. A remoção local não apaga mensagens enviadas pelo WhatsApp. Para informações sobre a conservação ou eliminação dessas mensagens pela loja, use o canal de contato abaixo.
      </p>
    </section>
    <section>
      <h2>Seus direitos e contato</h2>
      <p>
        Você pode pedir confirmação e acesso ao tratamento, correção, informações sobre compartilhamento e, quando aplicáveis, portabilidade, oposição, anonimização, bloqueio ou eliminação. Pode também revogar consentimento, conhecer as consequências de não fornecê-lo e solicitar revisão de decisões automatizadas. O site não aprova crédito nem toma decisões automatizadas sobre você.
      </p>
      <p>
        A loja poderá solicitar informações proporcionais para confirmar a identidade de quem faz o pedido. Também é possível apresentar uma petição à ANPD pelos canais oficiais.
      </p>
      <a className="tc-legal-action" href={DADOS} target="_blank" rel="noreferrer">
        Solicitar atendimento sobre meus dados
      </a>
    </section>
  </>
);

const Termos = () => (
  <>
    <section>
      <h2>Identificação e finalidade</h2>
      <p>
        Este é o site da TC Comércio de Veículos Ltda., CNPJ 24.168.436/0001-52, na Av. Brasil, 1313, Colatto, Xanxerê, SC. O site permite conhecer veículos e entrar em contato com a equipe. Não há checkout, pagamento, reserva vinculante ou contratação de financiamento pelo site.
      </p>
    </section>
    <section>
      <h2>Informações dos veículos</h2>
      <p>
        Confira a ficha, a disponibilidade e as condições diretamente com a loja. Campos não informados não representam características confirmadas. Imagens de campanha e de categoria são ilustrativas e podem diferir da unidade real. Para decidir, solicite fotos atuais, vistoria e documentação do veículo.
      </p>
      <p>
        Uma consulta não garante aprovação de crédito, valor de avaliação do usado ou reserva do veículo. Condições comerciais devem ser apresentadas de forma clara pela loja. Estes termos não afastam direitos previstos na legislação de defesa do consumidor nem obrigações decorrentes de uma oferta válida.
      </p>
    </section>
    <section>
      <h2>Contato e uso do conteúdo</h2>
      <p>
        Para esclarecer informações ou comunicar um problema, contate (49) 99986 8242 pelo WhatsApp ou (49) 3430 0680 por telefone. Marcas de fabricantes pertencem aos seus respectivos titulares. O uso no catálogo identifica os veículos, sem indicar vínculo de concessionária autorizada.
      </p>
    </section>
  </>
);

const Cookies = () => (
  <>
    <section>
      <h2>O que fica no navegador</h2>
      <p>
        O site não instala cookies próprios de publicidade ou analytics. Ele usa armazenamento local apenas para guardar os veículos que você salva. Esse registro não tem expiração automática configurada.
      </p>
    </section>
    <section>
      <h2>Mapa e serviços de terceiros</h2>
      <p>
        O Google Maps é incorporado à seção de localização e pode receber dados técnicos da conexão e utilizar cookies próprios quando o mapa é carregado. Para restringir esse acesso, utilize os controles de conteúdo e cookies de terceiros do navegador. A limpeza dos dados locais deste site não remove informações já recebidas pelo Google.
      </p>
    </section>
    <section>
      <h2>Apagar registros locais</h2>
      <p>
        Para apagar os veículos salvos, remova os dados deste site nas configurações do navegador. Mensagens enviadas à loja pelo WhatsApp não são apagadas por esse procedimento.
      </p>
    </section>
    <section>
      <h2>Consulte as políticas dos serviços</h2>
      <p>
        <a href="https://policies.google.com/privacy?hl=pt-BR" target="_blank" rel="noreferrer">
          Privacidade do Google
        </a>
        {" · "}
        <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noreferrer">
          Privacidade do WhatsApp
        </a>
      </p>
    </section>
  </>
);

export default function Legal({ page }) {
  return (
    <div className="tc-legal">
      <header>
        <Link href="/">
          <img src="/assets/tc-logo.svg" alt="TC Veículos" />
        </Link>
        <Link href="/">Voltar ao site</Link>
      </header>
      <main>
        <p className="tc-legal-date">Atualizado em 30 de outubro de 2026</p>
        <h1>{TITULOS[page]}</h1>
        <nav aria-label="Páginas legais">
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
          <Link href="/cookies">Cookies e preferências</Link>
        </nav>
        {page === "privacidade" ? <Privacidade /> : page === "termos" ? <Termos /> : <Cookies />}
        <div className="tc-legal-end">
          <Link href="/">Voltar para a TC Veículos</Link>
        </div>
      </main>
    </div>
  );
}

export const PAGINAS_LEGAIS = Object.keys(TITULOS);
export const tituloLegal = (p) => TITULOS[p];
