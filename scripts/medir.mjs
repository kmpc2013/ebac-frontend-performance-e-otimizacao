// Mede a página com o Lighthouse (3 execuções Mobile + 3 Desktop) e gera a tabela de medianas.
//
// Uso:   node scripts/medir.mjs <pasta-servida> <pasta-de-saida> [rotulo]
// Ex.:   node scripts/medir.mjs . docs/relatorios/depois depois
//
// Com --resumir, não mede: só recalcula o resumo a partir dos relatórios HTML já salvos.
// Ex.:   node scripts/medir.mjs --resumir docs/relatorios/antes antes
//
// A pasta é servida com `serve` em http://localhost:3000 (compressão gzip, como em produção).
// Precisa de um Chrome/Edge instalado; defina CHROME_PATH se ele não for encontrado sozinho.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const soResumir = args[0] === '--resumir';
if (soResumir) args.shift();
const [raiz = '.', saida = 'docs/relatorios/medicao', rotulo = 'medicao'] = soResumir ? ['', ...args] : args;
const URL = 'http://localhost:3000/';
const EXECUCOES = 3;
const PRESETS = ['mobile', 'desktop'];

mkdirSync(saida, { recursive: true });

const servidor = soResumir ? null : spawn('npx', ['serve', resolve(raiz), '-l', '3000', '--no-clipboard'], { shell: true, stdio: 'ignore' });
if (servidor) await esperarServidor();

const resultados = {};
try {
  for (const preset of PRESETS) {
    resultados[preset] = [];
    for (let i = 1; i <= EXECUCOES; i++) {
      const base = join(saida, `${rotulo}-${preset}-${i}`);
      if (servidor) {
        console.log(`Lighthouse ${preset} ${i}/${EXECUCOES}...`);
        execFileSync('npx', [
          'lighthouse', URL,
          '--output=html', `--output-path=${base}.report.html`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--chrome-flags=--headless=new',
          '--quiet',
          ...(preset === 'desktop' ? ['--preset=desktop'] : []),
        ], { shell: true, stdio: 'inherit' });
      }
      // O relatório HTML embute o JSON completo do Lighthouse.
      const html = readFileSync(`${base}.report.html`, 'utf8');
      resultados[preset].push(extrair(JSON.parse(html.match(/__LIGHTHOUSE_JSON__ = (.*?);<\/script>/s)[1])));
    }
  }
} finally {
  if (servidor && process.platform === 'win32') execFileSync('taskkill', ['/pid', String(servidor.pid), '/T', '/F'], { stdio: 'ignore' });
  else servidor?.kill();
}

const medianas = Object.fromEntries(PRESETS.map((p) => [p, medianaPorMetrica(resultados[p])]));
writeFileSync(join(saida, 'resumo.json'), JSON.stringify({ rotulo, data: new Date().toISOString(), resultados, medianas }, null, 2));
writeFileSync(join(saida, 'resumo.md'), tabela(medianas));
console.log(tabela(medianas));

function extrair(r) {
  const a = r.audits;
  const requisicoes = a['network-requests'].details.items;
  const lcp = a['lcp-breakdown-insight']?.details?.items?.find((item) => item.type === 'node');
  return {
    performance: Math.round(r.categories.performance.score * 100),
    acessibilidade: Math.round(r.categories.accessibility.score * 100),
    boasPraticas: Math.round(r.categories['best-practices'].score * 100),
    seo: Math.round(r.categories.seo.score * 100),
    fcp: a['first-contentful-paint'].numericValue,
    lcp: a['largest-contentful-paint'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    si: a['speed-index'].numericValue,
    pesoKB: a['total-byte-weight'].numericValue / 1024,
    requisicoes: requisicoes.length,
    elementoLcp: lcp?.snippet ?? '',
    navegador: r.environment.hostUserAgent,
  };
}

function medianaPorMetrica(execucoes) {
  const m = {};
  for (const chave of Object.keys(execucoes[0])) {
    const valores = execucoes.map((e) => e[chave]);
    if (typeof valores[0] !== 'number') { m[chave] = valores[0]; continue; }
    const ordenados = [...valores].sort((x, y) => x - y);
    m[chave] = ordenados[Math.floor(ordenados.length / 2)];
  }
  return m;
}

function tabela(med) {
  const s = (ms) => `${(ms / 1000).toFixed(2).replace('.', ',')} s`;
  const linhas = [
    ['Performance', (m) => m.performance],
    ['Acessibilidade', (m) => m.acessibilidade],
    ['Boas práticas', (m) => m.boasPraticas],
    ['SEO', (m) => m.seo],
    ['FCP', (m) => s(m.fcp)],
    ['LCP', (m) => s(m.lcp)],
    ['TBT', (m) => `${Math.round(m.tbt)} ms`],
    ['CLS', (m) => m.cls.toFixed(3).replace('.', ',')],
    ['Speed Index', (m) => s(m.si)],
    ['Peso total', (m) => `${m.pesoKB.toFixed(1).replace('.', ',')} KB`],
    ['Requisições', (m) => m.requisicoes],
  ];
  return [
    `Medianas de ${EXECUCOES} execuções — ${rotulo}\n`,
    '| Métrica | Mobile | Desktop |',
    '|---|---|---|',
    ...linhas.map(([nome, f]) => `| ${nome} | ${f(med.mobile)} | ${f(med.desktop)} |`),
    '',
  ].join('\n');
}

async function esperarServidor() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(URL)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('O servidor não subiu em http://localhost:3000');
}
