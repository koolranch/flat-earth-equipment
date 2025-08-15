/* Quick check to ensure imports resolve in the deployed bundle */
(async()=>{
  try {
    const s = await import('../../lib/specsStruct.js');
    const g = await import('../../lib/greenView.js');
    const f = await import('../../lib/greenFilter.js');
    console.log('Imports OK:', Boolean(s), Boolean(g), Boolean(f));
  } catch(e){
    console.error('Import resolution failed:', e);
    process.exit(1);
  }
})();
