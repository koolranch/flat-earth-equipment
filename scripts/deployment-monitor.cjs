#!/usr/bin/env node

/**
 * Deployment Monitor for Phase 5 & 6 Implementation
 * Monitors Vercel deployment and checks for build errors
 */

const https = require('https');
const fs = require('fs');

const DEPLOYMENT_CONFIG = {
  VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN || '7KdveSaSDoiUQJ7hiwoi6Osr',
  PROJECT_ID: 'flat-earth-equipment',
  DOMAIN: 'https://www.flatearthequipment.com',
  CHECK_INTERVAL: 30000, // 30 seconds
  MAX_CHECKS: 10
};

class DeploymentMonitor {
  constructor() {
    this.checks = 0;
    this.deploymentId = null;
  }

  /**
   * Check Vercel deployment status
   */
  async checkDeploymentStatus() {
    try {
      console.log(`🔍 Checking deployment status... (${this.checks + 1}/${DEPLOYMENT_CONFIG.MAX_CHECKS})`);
      
      const options = {
        hostname: 'api.vercel.com',
        path: '/v6/deployments?projectId=' + DEPLOYMENT_CONFIG.PROJECT_ID + '&limit=1',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DEPLOYMENT_CONFIG.VERCEL_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      };

      return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              if (response.deployments && response.deployments.length > 0) {
                const latest = response.deployments[0];
                resolve({
                  id: latest.uid,
                  state: latest.state,
                  url: latest.url,
                  createdAt: latest.createdAt,
                  target: latest.target
                });
              } else {
                reject(new Error('No deployments found'));
              }
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.end();
      });

    } catch (error) {
      console.error('❌ Deployment status check failed:', error.message);
      return null;
    }
  }

  /**
   * Test key pages for Phase 5 & 6 functionality
   */
  async testKeyPages() {
    console.log('🧪 Testing key pages functionality...');
    
    const testPages = [
      '/',
      '/parts',
      '/chargers',
      '/chargers/green2-24v-20a', // Example product page
    ];

    const results = [];
    
    for (const page of testPages) {
      try {
        const url = DEPLOYMENT_CONFIG.DOMAIN + page;
        const result = await this.testPage(url);
        results.push({ page, status: result.status, loadTime: result.loadTime });
        
        const status = result.status === 200 ? '✅' : '❌';
        console.log(`  ${status} ${page} - ${result.status} (${result.loadTime}ms)`);
        
      } catch (error) {
        console.log(`  ❌ ${page} - Error: ${error.message}`);
        results.push({ page, status: 'error', error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Test individual page
   */
  testPage(url) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const parsedUrl = new URL(url);
      
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname,
        method: 'GET',
        headers: {
          'User-Agent': 'FEE-Deployment-Monitor/1.0'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        const loadTime = Date.now() - start;
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          // Check for PerformanceMonitor component in the HTML
          const hasPerformanceMonitor = data.includes('PerformanceMonitor') || 
                                        data.includes('performance-monitoring') ||
                                        data.includes('/api/performance');
          
          resolve({
            status: res.statusCode,
            loadTime,
            hasPerformanceMonitor,
            responseSize: data.length
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  /**
   * Test Performance API endpoint
   */
  async testPerformanceAPI() {
    console.log('🔌 Testing Performance API endpoint...');
    
    const testData = {
      name: 'TEST_METRIC',
      value: 1000,
      rating: 'good',
      url: '/test',
      sessionId: 'deployment-test-' + Date.now()
    };

    try {
      const result = await this.postToAPI('/api/performance', testData);
      if (result.status === 200) {
        console.log('  ✅ Performance API endpoint working');
        return true;
      } else {
        console.log(`  ❌ Performance API returned: ${result.status}`);
        return false;
      }
    } catch (error) {
      console.log(`  ❌ Performance API test failed: ${error.message}`);
      return false;
    }
  }

  /**
   * POST data to API endpoint
   */
  postToAPI(endpoint, data) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(data);
      const url = new URL(DEPLOYMENT_CONFIG.DOMAIN + endpoint);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length,
          'User-Agent': 'FEE-Deployment-Monitor/1.0'
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.write(postData);
      req.end();
    });
  }

  /**
   * Main monitoring loop
   */
  async monitor() {
    console.log('🚀 Starting deployment monitoring for Phase 5 & 6...\n');

    while (this.checks < DEPLOYMENT_CONFIG.MAX_CHECKS) {
      try {
        // Check deployment status
        const deployment = await this.checkDeploymentStatus();
        
        if (deployment) {
          console.log(`📦 Latest deployment: ${deployment.state} (${deployment.id})`);
          
          if (deployment.state === 'READY') {
            console.log('🎉 Deployment is READY! Running functionality tests...\n');
            
            // Test key pages
            await this.testKeyPages();
            
            // Test Performance API
            await this.testPerformanceAPI();
            
            console.log('\n✅ Phase 5 & 6 deployment monitoring complete!');
            console.log('📊 Next steps:');
            console.log('1. Monitor performance metrics in /api/performance');
            console.log('2. Check dashboard: ' + DEPLOYMENT_CONFIG.DOMAIN + '/reports/dashboard/');
            console.log('3. Run: node scripts/google-search-console-monitor.cjs');
            
            break;
            
          } else if (deployment.state === 'ERROR' || deployment.state === 'CANCELED') {
            console.error(`❌ Deployment failed: ${deployment.state}`);
            break;
            
          } else {
            console.log(`⏳ Deployment in progress: ${deployment.state}`);
          }
        }

        this.checks++;
        
        if (this.checks < DEPLOYMENT_CONFIG.MAX_CHECKS) {
          console.log(`⏱️  Waiting ${DEPLOYMENT_CONFIG.CHECK_INTERVAL/1000}s for next check...\n`);
          await new Promise(resolve => setTimeout(resolve, DEPLOYMENT_CONFIG.CHECK_INTERVAL));
        }
        
      } catch (error) {
        console.error('❌ Monitoring error:', error.message);
        this.checks++;
      }
    }

    if (this.checks >= DEPLOYMENT_CONFIG.MAX_CHECKS) {
      console.log('⏰ Maximum checks reached. Check deployment manually if needed.');
    }
  }
}

// Main execution
async function main() {
  const monitor = new DeploymentMonitor();
  await monitor.monitor();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { DeploymentMonitor, DEPLOYMENT_CONFIG };