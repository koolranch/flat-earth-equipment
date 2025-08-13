/* Batch test the recommender across common scenarios (GREEN-only via API). */
import fs from 'fs'; 
import path from 'path';

const BASE=process.env.BASE_URL||'http://localhost:3000';

async function post(body:any){ 
  const r=await fetch(`${BASE}/api/recommend-chargers`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(body)
  }); 
  return r.json(); 
}

function ampsFor(voltage:number, speed:'overnight'|'fast'){ 
  const map:Record<number,number>={24:600,36:750,48:750,80:1000}; 
  const ah=map[voltage]; 
  const den=speed==='overnight'?10:5; 
  return ah?Math.max(10,Math.round(ah/den)):null; 
}

(async()=>{
  console.log('🧪 Starting GREEN Series scenario testing...\n');
  console.log(`🌐 Testing against: ${BASE}\n`);
  
  const volts=[24,36,48,80] as const; 
  const speeds=['overnight','fast'] as const; 
  const phases:('1P'|'3P'|null)[]=['1P','3P',null];
  
  const rows:any[]=[]; 
  const header=['voltage','speed','phase','target_amps','total','best','alt','top_slug'];
  
  let totalTests = 0;
  let successfulTests = 0;
  
  for(const v of volts){ 
    for(const sp of speeds){ 
      const amps=ampsFor(v, sp as any); 
      for(const ph of phases){
        totalTests++;
        const testName = `${v}V ${sp} ${ph||'any'}`;
        console.log(`   Testing ${testName}...`);
        
        const body={ voltage:v, amps, phase:ph, limit:12 };
        
        try {
          const json=await post(body); 
          
          if (json?.ok) {
            successfulTests++;
            const items=(json?.items)||[]; 
            const best=items.filter((i:any)=>i.matchType==='best'); 
            const alt=items.filter((i:any)=>i.matchType!=='best');
            
            console.log(`     ✅ ${items.length} total (${best.length} best, ${alt.length} alt)`);
            rows.push([v,sp,ph??'—',amps,items.length,best.length,alt.length, items[0]?.slug||'']);
          } else {
            console.log(`     ❌ API Error: ${json?.error}`);
            rows.push([v,sp,ph??'—',amps,0,0,0,'ERROR']);
          }
        } catch (e) {
          console.log(`     💥 Request failed: ${e}`);
          rows.push([v,sp,ph??'—',amps,0,0,0,'FAILED']);
        }
      }
    }
  }
  
  console.log(`\n📊 Test Results: ${successfulTests}/${totalTests} successful\n`);
  
  // Write CSV report
  fs.mkdirSync('reports',{recursive:true});
  const csvContent = [header.join(','), ...rows.map(r=>r.join(','))].join('\n');
  fs.writeFileSync(path.join('reports','recs_scenarios.csv'), csvContent);
  console.log('📄 Wrote reports/recs_scenarios.csv');
  
  // Quick analysis
  const bestCounts = rows.map(r => r[5]).filter(count => count > 0);
  const noBestCases = rows.filter(r => r[5] === 0);
  
  console.log(`\n📈 Quick Analysis:`);
  console.log(`   Scenarios with BEST matches: ${bestCounts.length}/${rows.length}`);
  console.log(`   Average BEST per scenario: ${bestCounts.length > 0 ? Math.round(bestCounts.reduce((a,b) => a+b, 0) / bestCounts.length) : 0}`);
  
  if (noBestCases.length > 0) {
    console.log(`\n⚠️  Scenarios with 0 BEST matches:`);
    noBestCases.slice(0, 5).forEach(row => {
      console.log(`   - ${row[0]}V ${row[1]} ${row[2]} (${row[4]} total items)`);
    });
  } else {
    console.log(`\n✅ All scenarios found BEST matches!`);
  }
})();