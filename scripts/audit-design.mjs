import fs from 'fs'; 
import path from 'path';

const ROOT = process.cwd(); 
const out=path.join(ROOT,'docs'); 
if(!fs.existsSync(out)) fs.mkdirSync(out,{recursive:true});

const read=p=>{try{return fs.readFileSync(p,'utf8')}catch{return null}}; 
const exists=p=>fs.existsSync(p);

function extractTailwindConfig(configText) {
  if (!configText) return null;
  
  // Try to extract the theme section
  const themeMatch = configText.match(/theme:\s*\{([^}]*(\{[^}]*\}[^}]*)*)\}/s);
  const pluginsMatch = configText.match(/plugins:\s*\[([^\]]*)\]/s);
  
  return {
    hasTheme: !!themeMatch,
    hasPlugins: !!pluginsMatch,
    rawTheme: themeMatch ? themeMatch[1] : null,
    rawPlugins: pluginsMatch ? pluginsMatch[1] : null
  };
}

(function(){
  const twPaths=['tailwind.config.ts','tailwind.config.js','tailwind.config.cjs'].map(p=>path.join(ROOT,p));
  let tw=null; 
  let twPath=null;
  for(const p of twPaths){
    if(exists(p)){
      tw = read(p); 
      twPath = p;
      break;
    }
  }
  
  const tailwindConfig = extractTailwindConfig(tw);
  
  const hasShadcn = exists(path.join(ROOT,'components','ui'));
  const uiComponents = hasShadcn ? 
    fs.readdirSync(path.join(ROOT,'components','ui')).filter(f=>/\.(t|j)sx?$/.test(f)) : [];
  
  const iconLibs = [];
  const fonts = [];
  const pkgPath = path.join(ROOT,'package.json'); 
  if(exists(pkgPath)){ 
    const pkg=JSON.parse(read(pkgPath)); 
    const deps={...pkg.dependencies,...pkg.devDependencies}; 
    for(const k of Object.keys(deps||{})){ 
      if(/lucide-react|@radix-ui|heroicons|@heroicons|react-icons/.test(k)) iconLibs.push(k);
      if(/font|typeface/.test(k)) fonts.push(k);
    }
  }
  
  // scan for shared layouts and components
  const layouts=[];
  const sharedComponents=[];
  ['app', 'components'].forEach(base=>{ 
    const p=path.join(ROOT,base); 
    if(exists(p)){ 
      const files=(function walk(d){
        const out=[]; 
        try {
          for(const x of fs.readdirSync(d,{withFileTypes:true})){
            const fp=path.join(d,x.name); 
            if(x.isDirectory()) out.push(...walk(fp)); 
            else out.push(fp);
          } 
        } catch(e) {
          // Skip inaccessible directories
        }
        return out;
      })(p); 
      
      for(const f of files){ 
        if(/layout\.(t|j)sx?$/.test(f)) layouts.push(f.replace(ROOT,''));
        if(base === 'components' && /\.(t|j)sx?$/.test(f)) {
          const name = path.basename(f, path.extname(f));
          if(!['index', 'page', 'layout'].includes(name.toLowerCase())) {
            sharedComponents.push(f.replace(ROOT,''));
          }
        }
      }
    }
  });
  
  // Look for global CSS files
  const globalCss = [];
  ['app/globals.css', 'styles/globals.css', 'src/styles/globals.css'].forEach(p => {
    if(exists(path.join(ROOT, p))) globalCss.push(p);
  });
  
  const outObj = { 
    tailwindConfigPath: twPath ? twPath.replace(ROOT, '') : null,
    tailwindConfig,
    hasShadcn, 
    uiComponents: uiComponents.length > 0 ? uiComponents.slice(0, 10) : [], // Limit for readability
    totalUiComponents: uiComponents.length,
    iconLibs, 
    fonts,
    sharedLayouts: layouts,
    sharedComponents: sharedComponents.slice(0, 20), // Limit for readability
    totalSharedComponents: sharedComponents.length,
    globalCss
  };
  
  fs.writeFileSync(path.join(out,'design-system-scan.json'), JSON.stringify(outObj,null,2));
  console.log('Wrote docs/design-system-scan.json');
  console.log(`Found ${uiComponents.length} UI components, ${iconLibs.length} icon libs, ${layouts.length} layouts`);
})();
