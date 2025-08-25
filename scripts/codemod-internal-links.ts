import fs from 'fs';
import path from 'path';

// Insert a short inline paragraph linking to the brand hub Serial/Fault/Guide where a brand name appears.
// Targets: app/parts/**, app/insights/**, and any legacy brand serial pages.
const ROOT = process.cwd();
const TARGET_DIRS = ['app/parts', 'app/insights'];
const BRANDS = ['jlg','genie','toyota','jcb','hyster'];

const block = (slug: string, name: string) => `

{/* auto:brand-links */}
<p className="mt-4 text-sm text-muted-foreground">Looking for ${name} diagnostics or serial help? Try our <a class="underline" href="/brand/${slug}/serial-lookup">Serial Lookup</a>, <a class="underline" href="/brand/${slug}/fault-codes">Fault Codes</a>, and <a class="underline" href="/brand/${slug}/guide">Service Guide</a>.</p>
{/* /auto:brand-links */}`;

function walk(dir: string, out: string[] = []){
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile() && /\.(tsx|mdx?)$/.test(e.name)) out.push(p);
  }
  return out;
}

function alreadyHasAutoBlock(src: string){
  return src.includes('{/* auto:brand-links */}');
}

const files = TARGET_DIRS.flatMap(d => walk(path.join(ROOT, d)));
let edits = 0;
for (const file of files){
  const text = fs.readFileSync(file, 'utf8');
  if (alreadyHasAutoBlock(text)) continue;
  const lower = text.toLowerCase();
  for (const slug of BRANDS){
    const name = slug.charAt(0).toUpperCase() + slug.slice(1);
    if (lower.includes(slug)) {
      // Append block near the end of the main export component function
      let updated = text;
      if (/export default function|export default async function/.test(text)) {
        // Find the last return statement in the main function and insert before the closing tag
        const returnMatch = text.match(/return\s*\(\s*<[^>]*>[\s\S]*?<\/[^>]*>\s*\)\s*;\s*\n\s*\}/);
        if (returnMatch) {
          const beforeClosing = text.replace(/(<\/[^>]*>\s*\)\s*;\s*\n\s*\})$/, `${block(slug, name)}\n    $1`);
          updated = beforeClosing;
        } else {
          // Fallback: just append before the last }
          updated = text.replace(/\n\}\s*$/, `${block(slug, name)}\n}\n`);
        }
      } else {
        updated = text + block(slug, name);
      }
      fs.writeFileSync(file, updated, 'utf8');
      edits++;
      break;
    }
  }
}

console.log(`Inserted brand link blocks in ${edits} files.`);
