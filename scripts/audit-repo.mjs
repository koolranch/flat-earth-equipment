import fs from 'fs'; 
import path from 'path';

const ROOT = process.cwd();
const outDir = path.join(ROOT,'docs'); 
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});

const read = p=>{try{return fs.readFileSync(p,'utf8')}catch{return null}};
const exists = p=>fs.existsSync(p);

function walk(dir){
  const out=[]; 
  if(!exists(dir)) return out;
  const st=fs.readdirSync(dir,{withFileTypes:true}); 
  for(const d of st){
    const p=path.join(dir,d.name); 
    if(d.isDirectory()){
      out.push(...walk(p));
    } else {
      out.push(p);
    } 
  } 
  return out;
}

function findRoutes(){
  const routes=[]; 
  const apis=[]; 
  const bases=['app','pages']; 
  
  for(const base of bases){
    const bp=path.join(ROOT,base); 
    if(!exists(bp)) continue; 
    const files=walk(bp);
    
    for(const f of files){ 
      if(/\/page\.(t|j)sx?$/.test(f)) routes.push(f.replace(ROOT,'')); 
      if(/\/(route|index)\.(t|j)s$/.test(f) && f.includes('/api/')) apis.push(f.replace(ROOT,'')); 
    }
  }
  return {routes, apis};
}

function guessMeta(file){
  const src=read(file)||''; 
  const h1=(src.match(/<h1[^>]*>([^<]+)</)||[])[1]||null; 
  const title=(src.match(/title:\s*['"]([^'"]+)/)||[])[1]||null; 
  const canonical=(src.match(/canonical:\s*['"]([^'"]+)/)||[])[1]||null;
  return {h1, title, canonical};
}

function isBrandHubPath(p){return /\/(brands)\/page\.(t|j)sx?$/.test(p);} 
function isBrandSlugPath(p){return /\/brand\//.test(p) && /page\.(t|j)sx?$/.test(p);} 
function isSerialToolPath(p){return /(serial-number-lookup|serial-lookup)/.test(p);} 
function isFaultCodePath(p){return /(fault|error|diagnostic|codes?)/.test(p);}
function isPartsPath(p){return /\/parts\//.test(p) && /page\.(t|j)sx?$/.test(p);}

(function main(){
  const pkg = read(path.join(ROOT,'package.json')); 
  const nextCfg = read(path.join(ROOT,'next.config.js'))||read(path.join(ROOT,'next.config.mjs'))||read(path.join(ROOT,'next.config.ts')); 
  const tsCfg = read(path.join(ROOT,'tsconfig.json'));
  
  const {routes, apis} = findRoutes();
  const brandHub = routes.filter(isBrandHubPath);
  const brandPages = routes.filter(isBrandSlugPath);
  const serialTools = routes.filter(isSerialToolPath);
  const faultCodes = routes.filter(isFaultCodePath);
  const partsPages = routes.filter(isPartsPath);

  const routeMeta = Object.fromEntries(routes.map(p=>[p, guessMeta(path.join(ROOT,p))]));

  const routeMap = { 
    pkg: pkg?JSON.parse(pkg):null, 
    hasAppDir: exists(path.join(ROOT,'app')), 
    hasPagesDir: exists(path.join(ROOT,'pages')), 
    nextConfigPresent: !!nextCfg, 
    tsconfigPresent: !!tsCfg, 
    routes: routes.length,
    apis: apis.length,
    brandHub, 
    brandPages, 
    serialTools, 
    faultCodes,
    partsPages,
    routeMeta,
    allRoutes: routes,
    allApis: apis
  };
  
  fs.writeFileSync(path.join(outDir,'brand-route-map.json'), JSON.stringify(routeMap,null,2));

  const serial = serialTools.map(p=>({ 
    path:p, 
    meta: routeMeta[p]||null,
    brand: extractBrandFromPath(p)
  }));
  fs.writeFileSync(path.join(outDir,'serial-tools.json'), JSON.stringify(serial,null,2));

  console.log('Wrote docs/brand-route-map.json and docs/serial-tools.json');
  console.log(`Found ${routes.length} routes, ${apis.length} APIs, ${serialTools.length} serial tools`);
})();

function extractBrandFromPath(p) {
  const matches = p.match(/\/(toyota|hyster|karcher|factory-cat|tennant|jlg|haulotte|crown|cat|clark|bobcat|case|doosan|ep|gehl|hangcha|linde|manitou|mitsubishi|raymond|sinoboom|skyjack|takeuchi|toro|unicarriers|xcmg|yale|new-holland|jungheinrich|komatsu|kubota|lull)/i);
  return matches ? matches[1] : null;
}
