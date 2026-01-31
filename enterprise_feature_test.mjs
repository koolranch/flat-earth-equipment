import { chromium } from 'playwright';

const SITE_URL = 'https://www.flatearthequipment.com';
const TEST_PASSWORD = 'TestPass123!';

const TEST_USERS = [
  { email: 'enterprise-owner@flatearthequipment.com', role: 'owner', name: 'Test Owner' },
  { email: 'enterprise-admin@flatearthequipment.com', role: 'admin', name: 'Test Admin' },
  { email: 'enterprise-manager@flatearthequipment.com', role: 'manager', name: 'Test Manager' },
  { email: 'enterprise-member@flatearthequipment.com', role: 'member', name: 'Test Member' },
  { email: 'enterprise-viewer@flatearthequipment.com', role: 'viewer', name: 'Test Viewer' },
  { email: 'single-user@flatearthequipment.com', role: 'single-user', name: 'Single Purchase User' }
];

const TEST_URLS = [
  { path: '/enterprise/dashboard', name: 'Enterprise Dashboard' },
  { path: '/enterprise/analytics', name: 'Analytics' },
  { path: '/enterprise/team', name: 'Team Management' },
  { path: '/enterprise/bulk', name: 'Bulk Operations' },
  { path: '/trainer/dashboard', name: 'Trainer Dashboard' },
  { path: '/training/module-1', name: 'Training Module' }
];

async function testUserAccess(browser, user) {
  console.log(`\\n=== Testing: ${user.email} (${user.role}) ===`);
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to site
    await page.goto(SITE_URL);
    await page.waitForLoadState('networkidle');
    
    // Step 2: Look for login/signup options
    console.log('📱 Looking for login/signup options...');
    
    // Check if already logged in or need to find login button
    const hasAccount = await page.locator('text=/sign.{0,5}in|log.{0,5}in|account/i').first().isVisible().catch(() => false);
    if (hasAccount) {
      await page.locator('text=/sign.{0,5}in|log.{0,5}in|account/i').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Try to find email/password fields
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible()) {
      console.log('🔐 Found login form, attempting login...');
      await emailField.fill(user.email);
      await passwordField.fill(TEST_PASSWORD);
      
      // Look for submit button
      const submitBtn = page.locator('button[type="submit"], input[type="submit"], button:has-text("sign in"), button:has-text("log in")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('ℹ️  No login form found on main page');
    }
    
    // Step 3: Test each URL
    const results = [];
    for (const testUrl of TEST_URLS) {
      console.log(`  Testing: ${testUrl.name} (${testUrl.path})`);
      
      try {
        await page.goto(SITE_URL + testUrl.path);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        const title = await page.title();
        const url = page.url();
        const hasError = await page.locator('text=/error|unauthorized|access.{0,10}denied|404|not.{0,5}found/i').isVisible({ timeout: 2000 }).catch(() => false);
        const hasContent = await page.locator('main, [data-testid], .container, .dashboard').isVisible({ timeout: 2000 }).catch(() => false);
        
        const status = hasError ? 'ERROR' : (hasContent ? 'SUCCESS' : 'UNKNOWN');
        
        results.push({
          path: testUrl.path,
          name: testUrl.name,
          status: status,
          title: title,
          finalUrl: url,
          hasError: hasError,
          hasContent: hasContent
        });
        
        console.log(`    ✅ ${status}: ${title}`);
        
      } catch (error) {
        results.push({
          path: testUrl.path,
          name: testUrl.name, 
          status: 'EXCEPTION',
          error: error.message
        });
        console.log(`    ❌ EXCEPTION: ${error.message}`);
      }
    }
    
    return { user, results };
    
  } catch (error) {
    console.log(`❌ Failed testing ${user.email}:`, error.message);
    return { user, error: error.message };
  } finally {
    await context.close();
  }
}

async function runEnterpriseTests() {
  console.log('🧪 ENTERPRISE FEATURE TESTING STARTED');
  console.log('=====================================\\n');
  
  const browser = await chromium.launch({ headless: true });
  const allResults = [];
  
  try {
    for (const user of TEST_USERS) {
      const result = await testUserAccess(browser, user);
      allResults.push(result);
    }
    
    // Generate summary report
    console.log('\\n\\n📊 TESTING SUMMARY');
    console.log('==================');
    
    for (const result of allResults) {
      if (result.error) {
        console.log(`\\n❌ ${result.user.email} (${result.user.role}): FAILED - ${result.error}`);
        continue;
      }
      
      console.log(`\\n✅ ${result.user.email} (${result.user.role}):`);
      
      for (const pageResult of result.results) {
        const statusIcon = pageResult.status === 'SUCCESS' ? '✅' : 
                          pageResult.status === 'ERROR' ? '❌' : 
                          '⚠️';
        console.log(`  ${statusIcon} ${pageResult.name}: ${pageResult.status}`);
      }
    }
    
    console.log('\\n🏁 Testing completed');
    console.log('\\n📝 NEXT STEPS:');
    console.log('1. Review results above for any access issues');
    console.log('2. Test specific enterprise features manually if needed');
    console.log('3. Verify role-based permissions are working correctly');
    
  } finally {
    await browser.close();
  }
}

// Check if Playwright is available
import('playwright').then(() => {
  runEnterpriseTests().catch(console.error);
}).catch(() => {
  console.log('❌ Playwright not available. Testing enterprise features manually...');
  
  // Manual testing approach
  console.log('\\n📋 MANUAL TESTING CHECKLIST');
  console.log('===========================');
  
  for (const user of TEST_USERS) {
    console.log(`\\n${user.role.toUpperCase()}: ${user.email}`);
    console.log(`Password: ${TEST_PASSWORD}`);
    console.log('Test these URLs:');
    for (const testUrl of TEST_URLS) {
      console.log(`  - ${SITE_URL}${testUrl.path} (${testUrl.name})`);
    }
  }
  
  console.log('\\n✅ READY FOR MANUAL TESTING');
});