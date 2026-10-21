// Gera as versões otimizadas das imagens (AVIF + WebP, recortadas e redimensionadas).
//
// Uso: npm run images
//
// Os originais (JPG/PNG superdimensionados) não ficam mais no repositório: o script os lê
// direto da tag `antes` com `git show`, então o resultado é reproduzível a qualquer momento.
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import sharp from 'sharp';

const TAG = 'antes';
const PROPORCAO = 3 / 2; // recorte paisagem: o hero e os cards são exibidos mais largos que altos

// Larguras pensadas para o layout (ver `sizes` no index.html):
// hero até 540 px de largura (x2 = 1080); cards até ~480 px no layout de 2 colunas.
const IMAGENS = [
  { origem: 'assets/produtos/hero.jpg', destino: 'assets/produtos/hero', larguras: [480, 800, 1080] },
  { origem: 'assets/produtos/caminha.jpg', destino: 'assets/produtos/caminha', larguras: [400, 800] },
  { origem: 'assets/produtos/brinquedo.jpg', destino: 'assets/produtos/brinquedo', larguras: [400, 800] },
  { origem: 'assets/produtos/coleira.jpg', destino: 'assets/produtos/coleira', larguras: [400, 800] },
  { origem: 'assets/produtos/roupinha.jpg', destino: 'assets/produtos/roupinha', larguras: [400, 800] },
];

const lerOriginal = (caminho) => execFileSync('git', ['show', `${TAG}:${caminho}`], { maxBuffer: 1 << 26 });
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

for (const { origem, destino, larguras } of IMAGENS) {
  const original = lerOriginal(origem);
  console.log(`\n${origem} (${kb(original.length)})`);
  for (const largura of larguras) {
    const altura = Math.round(largura / PROPORCAO);
    const base = sharp(original).resize(largura, altura, { fit: 'cover', position: 'centre' });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${destino}-${largura}.avif`);
    await base.clone().webp({ quality: 75, effort: 6 }).toFile(`${destino}-${largura}.webp`);
    for (const ext of ['avif', 'webp']) {
      const arquivo = `${destino}-${largura}.${ext}`;
      console.log(`  ${arquivo.padEnd(40)} ${largura}x${altura}  ${kb(statSync(arquivo).size)}`);
    }
  }
}

// Logo: exibido em 36x36, então 72x72 cobre telas 2x.
const logo = lerOriginal('assets/logo.png');
console.log(`\nassets/logo.png (${kb(logo.length)})`);
await sharp(logo).resize(72, 72).webp({ quality: 85 }).toFile('assets/logo-72.webp');
await sharp(logo).resize(32, 32).png({ palette: true }).toFile('assets/favicon.png');
for (const arquivo of ['assets/logo-72.webp', 'assets/favicon.png']) {
  console.log(`  ${arquivo.padEnd(40)} ${kb(statSync(arquivo).size)}`);
}
