// Logo da TC Veiculos redesenhada em SVG (sem rastreio de bitmap).
// Pecas do "TC" e da faixa: forma interna com o degrade da marca e contorno
// preto de 11 px por fora (a mesma forma com traco de 22 px por baixo).
// "VEICULOS" e o telefone sao letras construidas por linha central + traco,
// inclinadas com skewX, no estilo largo e quadrado da logo original.
// Uso: node gerar-logo.cjs <pasta-de-saida>
const fs = require('fs');
const path = require('path');
const SAIDA = process.argv[2] || __dirname;

const PRETO = '#161616';
const DEG = `<linearGradient id="tcg" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#5a0d0a"/><stop offset=".26" stop-color="#f7941e"/>
  <stop offset=".52" stop-color="#f5821f"/><stop offset=".76" stop-color="#e9481b"/>
  <stop offset=".94" stop-color="#a30f1e"/><stop offset="1" stop-color="#7a0c15"/></linearGradient>`;

// ---- pecas grandes (coordenadas da forma interna, canvas 1080x288) ----
const PECAS = [
  // T, barra de cima
  'M30 80 L76 23 Q79 20 83 20 H306 L260 80 Z',
  // T, haste
  'M104 109 H196 L145 259 H52 Z',
  // C, braco de cima
  'M318 80 C327 45 352 20 398 20 H587 L541 80 Z',
  // C, corpo (abre por dentro e desce ate a faixa)
  'M300 109 H371 C358 130 365 168 421 183 H528 L474 259 H340 C300 259 279 238 283 198 L289 124 C290 114 294 109 300 109 Z',
];

// ---- letras por linha central (altura 60, origem no alto) ----
// cada glifo: { w, d: [paths], fill?: [polys] }
function glifos(s, r) {
  const a = s / 2, H = 60, b = H - a;            // linhas de cima e de baixo
  const m = H / 2, rb = (b - a) / 4;             // meio e raio das barrigas
  const caixa = (w) => `M${a + r} ${a} H${w - a - r} A${r} ${r} 0 0 1 ${w - a} ${a + r} V${b - r} A${r} ${r} 0 0 1 ${w - a - r} ${b} H${a + r} A${r} ${r} 0 0 1 ${a} ${b - r} V${a + r} A${r} ${r} 0 0 1 ${a + r} ${a} Z`;
  const cee = (w) => `M${w} ${a} H${a + r} A${r} ${r} 0 0 0 ${a} ${a + r} V${b - r} A${r} ${r} 0 0 0 ${a + r} ${b} H${w}`;
  return {
    V: (w) => ({ fill: [`M0 0 H${s * 1.25} L${w / 2} ${H - s * 1.5} L${w - s * 1.25} 0 H${w} L${w / 2 + s * 0.75} ${H} H${w / 2 - s * 0.75} Z`] }),
    E: (w) => ({ d: [cee(w), `M${a} ${m} H${w - s * 0.4}`] }),
    I: () => ({ d: [`M${a} 0 V${H}`] }),
    Iacento: () => ({ d: [`M${a} ${s * 1.6} V${H}`], fill: [`M${s * 0.2} ${s * 1.05} L${s * 0.75} 0 H${s * 1.9} L${s * 1.05} ${s * 1.05} Z`] }),
    C: (w) => ({ d: [cee(w)] }),
    U: (w) => ({ d: [`M${a} 0 V${b - r} A${r} ${r} 0 0 0 ${a + r} ${b} H${w - a - r} A${r} ${r} 0 0 0 ${w - a} ${b - r} V0`] }),
    L: (w) => ({ d: [`M${a} 0 V${b - r} A${r} ${r} 0 0 0 ${a + r} ${b} H${w}`] }),
    O: (w) => ({ d: [caixa(w)] }),
    '0': (w) => ({ d: [caixa(w)] }),
    S: (w) => ({ d: [`M${w} ${a} H${a + rb * 2} A${rb * 2} ${(m - a) / 2} 0 0 0 ${a + rb * 2} ${m} H${w - a - rb * 2} A${rb * 2} ${(b - m) / 2} 0 0 1 ${w - a - rb * 2} ${b} H0`] }),
    '3': (w) => ({ d: [`M0 ${a} H${w - a - rb * 2} A${rb * 2} ${(m - a) / 2} 0 0 1 ${w - a - rb * 2} ${m} H${w * 0.3}`, `M${w - a - rb * 2} ${m} A${rb * 2} ${(b - m) / 2} 0 0 1 ${w - a - rb * 2} ${b} H0`] }),
    '4': (w) => ({ d: [`M${w - a - 3} ${H} V${a}`, `M${w - a - 3} ${a} L${a} ${H * 0.64} H${w}`] }),
    '6': (w) => ({ d: [`M${w - 2} ${a} H${a + r} A${r} ${r} 0 0 0 ${a} ${a + r} V${b - r} A${r} ${r} 0 0 0 ${a + r} ${b} H${w - a - r} A${r} ${r} 0 0 0 ${w - a} ${b - r} V${m + r} A${r} ${r} 0 0 0 ${w - a - r} ${m} H${a}`] }),
    '9': (w) => ({ d: [`M2 ${b} H${w - a - r} A${r} ${r} 0 0 0 ${w - a} ${b - r} V${a + r} A${r} ${r} 0 0 0 ${w - a - r} ${a} H${a + r} A${r} ${r} 0 0 0 ${a} ${a + r} V${m - r} A${r} ${r} 0 0 0 ${a + r} ${m} H${w - a}`] }),
    '8': (w) => ({ d: [`M${a + r} ${a} H${w - a - r} A${r} ${r} 0 0 1 ${w - a} ${a + r} V${m - r * 0.2} H${a} V${a + r} A${r} ${r} 0 0 1 ${a + r} ${a} Z`, `M${a} ${m} H${w - a} V${b - r} A${r} ${r} 0 0 1 ${w - a - r} ${b} H${a + r} A${r} ${r} 0 0 1 ${a} ${b - r} Z`] }),
    '-': (w) => ({ fill: [`M0 ${m - s * 0.5} H${w} V${m + s * 0.5} H0 Z`] }),
    ' ': () => ({}),
  };
}

// Monta uma palavra: [{c, w}] -> grupo SVG com cor, traco e inclinacao.
function palavra(itens, { s, r, gap, x, base, alt, inclina, cor }) {
  const G = glifos(s, r);
  const esc = alt / 60;
  let cx = 0, partes = [];
  for (const { c, w } of itens) {
    const g = G[c](w);
    const t = `translate(${cx} 0)`;
    for (const d of g.d || []) partes.push(`<path transform="${t}" d="${d}" fill="none" stroke="${cor}" stroke-width="${s}" stroke-linejoin="${g.miter ? 'miter' : 'round'}" stroke-linecap="butt"/>`);
    for (const d of g.fill || []) partes.push(`<path transform="${t}" d="${d}" fill="${cor}"/>`);
    cx += w + gap;
  }
  const largura = (cx - gap) * esc;
  return { svg: `<g transform="translate(${x} ${base}) skewX(${-inclina}) scale(${esc}) translate(0 -60)">${partes.join('')}</g>`, largura };
}

const VEICULOS = [['V', 82], ['E', 64], ['Iacento', 17], ['C', 66], ['U', 72], ['L', 60], ['O', 84], ['S', 70]].map(([c, w]) => ({ c, w }));
const FONE = '49 3430-0680'.split('').map(c => ({ c, w: c === ' ' ? 8 : c === '-' ? 20 : 36 }));

// Icone do WhatsApp em linha (balao + fone), branco.
const ICONE = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})" fill="none" stroke="#fff" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round">
  <path d="M-15.5 16.5 L-12.6 7.8 A17.5 17.5 0 1 1 -6.4 13.6 Z"/>
  <path fill="#fff" stroke="none" d="M-7.6 -9.6c1.4-1.4 3.4-1.1 4.1.6l1.6 3.9c.5 1.2.1 2.3-.8 3.1l-1.3 1.1c1.4 2.9 3.6 5.1 6.5 6.5l1.1-1.3c.8-.9 1.9-1.3 3.1-.8l3.9 1.6c1.7.7 2 2.7.6 4.1l-1.6 1.6c-1.9 1.9-5 2.1-7.8.6-5-2.6-8.9-6.5-11.5-11.5-1.5-2.8-1.3-5.9.6-7.8z"/>
</g>`;

function logo(escuro) {
  const corPalavra = escuro ? '#ffffff' : PRETO;
  const contorno = PECAS.map(d => `<path d="${d}" fill="${PRETO}" stroke="${PRETO}" stroke-width="22" stroke-linejoin="round"/>`).join('');
  const preench = PECAS.map(d => `<path d="${d}" fill="url(#tcg)"/>`).join('');
  const v = palavra(VEICULOS, { s: 17, r: 13, gap: 13, x: 425, base: 158, alt: 58, inclina: 17, cor: corPalavra });
  // const f = palavra(FONE, { s: 13, r: 9, gap: 9, x: 622, base: 241, alt: 44, inclina: 14, cor: '#ffffff' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="__W__" height="288" viewBox="0 0 __W__ 288">
<title>TC Veículos</title>
<defs>${DEG.replace('<linearGradient id="tcg"', '<linearGradient id="tcg" gradientUnits="objectBoundingBox"')}</defs>
${contorno}
${preench}
${v.svg}
</svg>
`;
}

fs.mkdirSync(SAIDA, { recursive: true });
// largura: ate o fim de VEICULOS (inclinado) mais uma folga
const W = Math.ceil(425 + palavra(VEICULOS, { s: 17, r: 13, gap: 13, x: 0, base: 0, alt: 58, inclina: 17, cor: '#000' }).largura + 58 * Math.tan(17 * Math.PI / 180) + 12);
fs.writeFileSync(path.join(SAIDA, 'tc-logo.svg'), logo(false).replaceAll('__W__', W));
fs.writeFileSync(path.join(SAIDA, 'tc-logo-escuro.svg'), logo(true).replaceAll('__W__', W));
console.log('ok', SAIDA);
