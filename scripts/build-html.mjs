// Gera o index.html da raiz (publicado) a partir de src/index.html (fonte legível).
//
// Uso: npm run build:html   (ou npm run build, que regera o CSS antes)
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { minify } from 'html-minifier-terser';

const fonte = readFileSync('src/index.html', 'utf8');

const html = await minify(fonte, {
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
console.log(`src/output.css  ${kb(statSync('src/output.css').size)}`);
