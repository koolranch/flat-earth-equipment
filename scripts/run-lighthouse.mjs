import { execFile } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const routes = ['/training','/training/study/preop','/training/quests/preop-hotspots','/trainer/dashboard'];
const outDir = 'reports/lh';
mkdirSync(outDir, { recursive: true });

function run(url, out){
  return new Promise((resolve,reject)=>{
    execFile('npx', [ 'lighthouse', url, '--output=html', `--output-path=${out}`, '--chrome-flags=--headless=new', '--only-categories=performance,accessibility' ], (err, stdout, stderr)=>{
      if (err) return reject(err);
      console.log(stdout || stderr);
      resolve();
    });
  });
}

(async()=>{
  for (const r of routes){
    const url = `${BASE}${r}`;
    const file = `${outDir}/${r.replace(/\W+/g,'_')}.html`;
    console.log('Running Lighthouse:', url);
    try { await run(url, file); console.log('✔ saved', file); } catch(e){ console.error('Lighthouse failed for', url, e?.message||e); }
  }
})();