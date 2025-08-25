import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const EN_GUIDES = path.join(ROOT,'content','brand-guides');
const EN_FAQS = path.join(ROOT,'content','brand-faqs');
const ES_GUIDES = path.join(ROOT,'content','es','brand-guides');
const ES_FAQS = path.join(ROOT,'content','es','brand-faqs');
fs.mkdirSync(ES_GUIDES,{recursive:true});
fs.mkdirSync(ES_FAQS,{recursive:true});
function copyIfMissing(srcDir:string, dstDir:string){
  if (!fs.existsSync(srcDir)) return 0;
  let n=0;
  for (const f of fs.readdirSync(srcDir)){
    if (!f.endsWith('.mdx')) continue;
    const dst = path.join(dstDir,f);
    if (!fs.existsSync(dst)){
      fs.copyFileSync(path.join(srcDir,f), dst);
      n++;
    }
  }
  return n;
}
const g = copyIfMissing(EN_GUIDES, ES_GUIDES);
const q = copyIfMissing(EN_FAQS, ES_FAQS);
console.log(`ES scaffolding complete. Guides copied: ${g}, FAQs copied: ${q}. Edit translations or run your translation script.`);
