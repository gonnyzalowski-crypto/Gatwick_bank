/**
 * Direct login test
 */

import https from 'https';

const API_BASE = 'gatwickbank.up.railway.app';

function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_BASE,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData, isHtml: true });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testLogin() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 DIRECT LOGIN TEST');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // Test 1: Check currencies endpoint
  console.log('Test 1: GET /api/v1/currencies');
  try {
    const result = await makeRequest('/api/v1/currencies', 'GET');
    if (result.isHtml) {
      console.log('❌ Received HTML instead of JSON');
      console.log('   This means the API routes are not working');
      console.log('   Response preview:', result.data.substring(0, 100));
    } else {
      console.log('✅ Status:', result.status);
      console.log('✅ Response:', JSON.stringify(result.data).substring(0, 150));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Try login
  console.log('Test 2: POST /api/v1/auth/login');
  try {
    const loginData = {
      email: 'jonod@gmail.com',
      password: 'Password123!'
    };
    
    const result = await makeRequest('/api/v1/auth/login', 'POST', loginData);
    
    if (result.isHtml) {
      console.log('❌ Received HTML instead of JSON');
      console.log('   Backend API routes are not responding');
    } else {
      console.log('✅ Status:', result.status);
      console.log('✅ Response:', JSON.stringify(result.data, null, 2));
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
}

testLogin();
