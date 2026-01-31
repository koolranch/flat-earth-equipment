import https from 'https';

const BASE_URL = 'https://www.flatearthequipment.com';
const TEST_ROUTES = [
  '/enterprise/dashboard',
  '/enterprise/analytics', 
  '/enterprise/team',
  '/enterprise/bulk',
  '/trainer/dashboard',
  '/training/module-1'
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    const url = BASE_URL + path;
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const hasLoginForm = data.includes('type="email"') || data.includes('type="password"') || data.includes('sign') || data.includes('login');
        const hasEnterpriseContent = data.includes('enterprise') || data.includes('dashboard') || data.includes('analytics');
        const hasError = data.includes('404') || data.includes('Not Found') || data.includes('error');
        const hasContent = data.length > 1000; // Basic content check
        
        resolve({
          path,
          statusCode: res.statusCode,
          contentLength: data.length,
          hasLoginForm,
          hasEnterpriseContent,
          hasError,
          hasContent,
          title: (data.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || 'No title found'
        });
      });
    });
    
    req.on('error', (error) => {
      resolve({
        path,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        path,
        error: 'Request timeout'
      });
    });
  });
}

async function verifyRoutes() {
  console.log('🔍 ENTERPRISE ROUTE VERIFICATION');
  console.log('================================\\n');
  
  for (const route of TEST_ROUTES) {
    console.log(`Testing: ${route}`);
    
    const result = await checkRoute(route);
    
    if (result.error) {
      console.log(`  ❌ ERROR: ${result.error}`);
    } else {
      const statusIcon = result.statusCode === 200 ? '✅' : 
                        result.statusCode === 302 || result.statusCode === 301 ? '🔄' : '❌';
      
      console.log(`  ${statusIcon} Status: ${result.statusCode}`);
      console.log(`  📄 Title: ${result.title}`);
      console.log(`  📏 Content: ${result.contentLength} bytes`);
      
      if (result.hasLoginForm) console.log(`  🔐 Has login form`);
      if (result.hasEnterpriseContent) console.log(`  🏢 Contains enterprise content`);
      if (result.hasError) console.log(`  ⚠️  Contains error indicators`);
    }
    
    console.log('');
  }
  
  console.log('✅ Route verification complete');
  console.log('\\n📋 NEXT STEPS:');
  console.log('1. Use the manual testing checklist in enterprise_test_manual.md');
  console.log('2. Start with single-user regression testing');
  console.log('3. Test enterprise features with each role systematically');
  console.log('4. Report any issues found');
  
  console.log('\\n🔐 TEST CREDENTIALS:');
  console.log('Password for all test users: TestPass123!');
  console.log('\\n👥 TEST USERS:');
  console.log('- enterprise-owner@flatearthequipment.com (Owner)');
  console.log('- enterprise-admin@flatearthequipment.com (Admin)');  
  console.log('- enterprise-manager@flatearthequipment.com (Manager)');
  console.log('- enterprise-member@flatearthequipment.com (Member)');
  console.log('- enterprise-viewer@flatearthequipment.com (Viewer)');
  console.log('- single-user@flatearthequipment.com (Regression test)');
}

verifyRoutes().catch(console.error);