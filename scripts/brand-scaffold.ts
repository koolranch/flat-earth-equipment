import fs from 'fs';
import path from 'path';
const ROOT = process.cwd();
const SCALE = JSON.parse(fs.readFileSync(path.join(ROOT,'content','brands-scale.json'),'utf8')).brands as {slug:string,name:string}[];
const guidesDir = path.join(ROOT,'content','brand-guides');
const faqsDir = path.join(ROOT,'content','brand-faqs');
fs.mkdirSync(guidesDir,{recursive:true});
fs.mkdirSync(faqsDir,{recursive:true});
function guideTpl(name:string){
  return `### Serial Plate Locations
Common locations include the chassis near operator controls, frame rails, or by the counterweight. Cross-check any stamped frame ID.

### Decoding Basics
The serial/pin is used with the model to resolve running changes. Use our Serial tab to narrow by family and check mid-series breaks.

### Quick Fault Workflow
1. Verify system voltage and main contactor operation.
2. Retrieve active/stored codes (see Fault Codes tab).
3. Inspect high-flex harness points and sensor references.

### Safety Notes
- Follow lockout/tagout and support raised components.
- Confirm OEM procedures for lifting and hydraulics.
`; }
function faqTpl(name:string){
  return `Q: Where is the ${name} serial plate?
A: Typically near operator controls or on the chassis/frame; some models include a stamped frame ID.

Q: Can the serial tell me the exact year?
A: Treat serial as an identifier; use our lookup and known breaks to estimate build year.

Q: How do I pull fault codes on ${name}?
A: Use the machine's diagnostics menu/display; see our Fault Codes tab for retrieval tips.
`; }
let created=0;
for (const b of SCALE){
  const g = path.join(guidesDir,`${b.slug}.mdx`);
  const f = path.join(faqsDir,`${b.slug}.mdx`);
  if (!fs.existsSync(g)){ fs.writeFileSync(g, guideTpl(b.name),'utf8'); created++; }
  if (!fs.existsSync(f)){ fs.writeFileSync(f, faqTpl(b.name),'utf8'); created++; }
}
console.log(`Scaffolded/ensured ${created} MDX files.`);
