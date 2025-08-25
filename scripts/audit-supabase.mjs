import fs from 'fs'; 
import path from 'path';

const ROOT=process.cwd(); 
const outDir=path.join(ROOT,'docs'); 
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});

function walk(dir){
  const out=[]; 
  if(!fs.existsSync(dir)) return out; 
  for(const d of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,d.name); 
    if(d.isDirectory()) out.push(...walk(p)); 
    else if(/\.sql$/.test(p)) out.push(p);
  } 
  return out;
}

const migDir=path.join(ROOT,'supabase','migrations');
const files=walk(migDir);
const summary={ 
  migrationFiles: [],
  tables: [], 
  serialTables: [],
  brandTables: [],
  partsTables: [],
  rlsEnabled: [], 
  policies: [],
  apiRelevantTables: []
};

for(const f of files){ 
  const sql=fs.readFileSync(f,'utf8'); 
  const fileName = f.replace(ROOT,'');
  summary.migrationFiles.push(fileName);
  
  // Extract table names
  const tableMatches = [...sql.matchAll(/create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(["\w]+)/gi)];
  const tables = tableMatches.map(m=>m[1].replace(/['"]/g, ''));
  
  // Check for RLS
  const rlsMatches = [...sql.matchAll(/alter\s+table\s+(?:public\.)?(["\w]+)\s+enable\s+row\s+level\s+security/gi)];
  const rlsTables = rlsMatches.map(m=>m[1].replace(/['"]/g, ''));
  
  // Extract policy names
  const policyMatches = [...sql.matchAll(/create\s+policy\s+(?:if\s+not\s+exists\s+)?"?([^"'\s]+)"?\s+on/gi)];
  const policies = policyMatches.map(m=>m[1]);
  
  summary.tables.push(...tables);
  if(rlsTables.length) summary.rlsEnabled.push({file: fileName, tables: rlsTables});
  if(policies.length) summary.policies.push(...policies);
  
  // Categorize tables by purpose
  for(const table of tables) {
    if(/serial|lookup/.test(table)) summary.serialTables.push(table);
    if(/brand|manufacturer/.test(table)) summary.brandTables.push(table);
    if(/parts|products|inventory/.test(table)) summary.partsTables.push(table);
    if(/toyota|hyster|karcher|factory.*cat|tennant|crown|cat_|clark|bobcat|case_|doosan|ep_|gehl|hangcha|haulotte|jlg|linde|manitou|mitsubishi|raymond|sinoboom|skyjack|takeuchi|toro|unicarriers|xcmg|yale/.test(table)) {
      summary.apiRelevantTables.push(table);
    }
  }
}

// Remove duplicates
summary.tables = [...new Set(summary.tables)];
summary.serialTables = [...new Set(summary.serialTables)];
summary.brandTables = [...new Set(summary.brandTables)];
summary.partsTables = [...new Set(summary.partsTables)];
summary.apiRelevantTables = [...new Set(summary.apiRelevantTables)];
summary.policies = [...new Set(summary.policies)];

// Add summary stats
summary.stats = {
  totalMigrations: summary.migrationFiles.length,
  totalTables: summary.tables.length,
  serialTables: summary.serialTables.length,
  brandTables: summary.brandTables.length,
  partsTables: summary.partsTables.length,
  apiRelevantTables: summary.apiRelevantTables.length,
  totalPolicies: summary.policies.length,
  rlsEnabledFiles: summary.rlsEnabled.length
};

// Mask any potential secrets in environment check
const hasSupabaseEnv = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
summary.environment = {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30) + '...' : null
};

fs.writeFileSync(path.join(outDir,'supabase-schema-summary.json'), JSON.stringify(summary,null,2));
console.log('Wrote docs/supabase-schema-summary.json');
console.log(`Found ${summary.stats.totalTables} tables across ${summary.stats.totalMigrations} migrations`);
console.log(`Serial tables: ${summary.stats.serialTables}, API-relevant: ${summary.stats.apiRelevantTables}`);
