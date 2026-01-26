import https from 'https';

// Test a single page to debug the API response
const testUrl = 'https://www.flatearthequipment.com/';
const apiKey = 'AIzaSyA4S4ZemkIXkXjmtmlVCEkh_H-i52jjbRY';

const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&key=${apiKey}&strategy=mobile&category=PERFORMANCE&category=SEO`;

https.get(apiUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('API Response Status:', res.statusCode);
      console.log('Response keys:', Object.keys(result));
      
      if (result.error) {
        console.log('API Error:', result.error);
      } else if (result.lighthouseResult) {
        console.log('Lighthouse Result Available');
        console.log('Categories:', Object.keys(result.lighthouseResult.categories || {}));
        console.log('Performance Score:', result.lighthouseResult.categories?.performance?.score);
      } else {
        console.log('Unexpected response structure');
        console.log('First 500 chars:', JSON.stringify(result).substring(0, 500));
      }
    } catch (error) {
      console.error('JSON Parse Error:', error.message);
      console.log('Raw response (first 500 chars):', data.substring(0, 500));
    }
  });
}).on('error', (error) => {
  console.error('Request Error:', error.message);
});