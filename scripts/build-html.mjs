// Gera o index.html da raiz (publicado) a partir de src/index.html (fonte legível).
//
// Uso: npm run build:html   (ou npm run build, que regera o CSS antes)
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { minify } from 'html-minifier-terser';

const fonte = readFileSync('src/index.html', 'utf8');
const css = readFileSync('src/output.css', 'utf8');

// CSS crítico inline: o CSS inteiro tem ~3,5 KB com gzip, então embuti-lo no HTML elimina
// a única requisição que bloqueava a renderização sem pesar no documento.
const LINK_CSS = '<link rel="stylesheet" href="src/output.css">';
if (!fonte.includes(LINK_CSS)) throw new Error(`src/index.html precisa conter ${LINK_CSS}`);
const comCssInline = fonte.replace(LINK_CSS, () => `<style>${css}</style>`);

const html = await minify(comCssInline, {
  collapseWhitespace: true,
  conservativeCollapse: true, // mantém um espaço entre elementos inline (ex.: logo + "Pet&Style")
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true,
  minifyCSS: true,
});

writeFileSync('index.html', html);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const tamanho = (texto) => `${kb(Buffer.byteLength(texto))} (gzip ${kb(gzipSync(texto).length)})`;
console.log(`src/index.html  ${tamanho(fonte)}`);
console.log(`index.html      ${tamanho(html)}`);
console.log(`src/output.css  ${tamanho(css)} (inline no index.html)`);
