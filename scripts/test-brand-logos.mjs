import fetch from 'node-fetch';

const brands = [
  { name: "Case Construction", image: "Case.webp" },
  { name: "Caterpillar", image: "Caterpillar.webp" },
  { name: "Clark", image: "Clark.webp" },
  { name: "Crown", image: "Crown.webp" },
  { name: "Doosan", image: "Doosan.webp" },
  { name: "Enersys", image: "Enersys.png" },
  { name: "EP Equipment", image: "EP.webp" },
  { name: "FactoryCat", image: "Factory_Cat.webp" },
  { name: "Gehl", image: "Gehl.webp" },
  { name: "Genie", image: "Genie.webp" },
  { name: "Hangcha", image: "Hangcha.webp" },
  { name: "Heli", image: "Heli.webp" },
  { name: "Hyster", image: "Hyster.webp" },
  { name: "Hyundai", image: "Hyundai.webp" },
  { name: "JCB", image: "JCB.webp" },
  { name: "JLG", image: "JLG.webp" },
  { name: "John Deere", image: "John_Deere.webp" },
  { name: "Kärcher", image: "Karcher.webp" },
  { name: "Komatsu", image: "Komatsu.webp" },
  { name: "Kubota", image: "Kubota.webp" },
  { name: "LCMG", image: "LCMG.webp" },
  { name: "Linde", image: "Linde.webp" },
  { name: "LiuGong", image: "LiuGong.png" },
  { name: "Lull", image: "Lull.webp" },
  { name: "MEC", image: "MEC.webp" },
  { name: "Mitsubishi Forklift", image: "Mitsubishi.webp" },
  { name: "Moffett", image: "Moffett.webp" },
  { name: "Nissan Forklift", image: "Nissan.webp" },
  { name: "PowerBoss", image: "PowerBoss.webp" },
  { name: "Raymond", image: "Raymond.webp" },
  { name: "Skyjack", image: "Skyjack.webp" },
  { name: "SkyTrak", image: "SkyTrak.webp" },
  { name: "Snorkel", image: "Snorkel.webp" },
  { name: "Tailift", image: "Tailift.webp" },
  { name: "TCM", image: "TCM.webp" },
  { name: "Tennant", image: "Tennant.webp" },
  { name: "Toro", image: "Toro.webp" },
  { name: "Toyota Material Handling", image: "Toyota.webp" },
  { name: "UniCarriers", image: "Unicarriers.webp" },
  { name: "XCMG", image: "XCMG.webp" }
];

const BASE_URL = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos';

async function testBrandLogos() {
  console.log('🔍 Testing brand logo URLs...\n');
  
  const results = {
    success: [],
    failed: []
  };

  for (const brand of brands) {
    const url = `${BASE_URL}/${brand.image}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'image/webp,image/png,*/*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        results.success.push({
          brand: brand.name,
          url,
          status: response.status
        });
        console.log(`✅ ${brand.name}: ${response.status} OK`);
      } else {
        results.failed.push({
          brand: brand.name,
          url,
          status: response.status,
          error: `HTTP ${response.status}`
        });
        console.log(`❌ ${brand.name}: ${response.status} Failed`);
      }
    } catch (error) {
      results.failed.push({
        brand: brand.name,
        url,
        error: error.message
      });
      console.log(`❌ ${brand.name}: ${error.message}`);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Total brands: ${brands.length}`);
  console.log(`Successful: ${results.success.length}`);
  console.log(`Failed: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed URLs:');
    results.failed.forEach(({ brand, url, error }) => {
      console.log(`\n${brand}:`);
      console.log(`URL: ${url}`);
      console.log(`Error: ${error}`);
    });
  }
}

testBrandLogos().catch(console.error); 