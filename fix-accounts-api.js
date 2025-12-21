// Node.js script to fix Brokard Williams account types via API
import https from 'https';

const API_BASE = 'https://gatwickbank-production.up.railway.app/api/v1';

function makeRequest(url, method, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch (e) {
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function fixAccounts() {
  console.log('\n🔧 Fixing Brokard Williams Account Types\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in as admin...');
    const step1Data = await makeRequest(
      `${API_BASE}/auth/login`,
      'POST',
      {
        email: 'jonod@gmail.com',
        password: 'Password123!'
      }
    );

    console.log('Response:', JSON.stringify(step1Data, null, 2));

    if (!step1Data.userId) {
      console.log('\n❌ ERROR: Login failed - no userId received');
      return;
    }

    const userId = step1Data.userId;
    const questionId = step1Data.securityQuestion?.id;

    // Step 2: Security question
    console.log('\n🔐 Step 2: Answering security question...');
    const step2Data = await makeRequest(
      `${API_BASE}/auth/login/verify`,
      'POST',
      {
        userId: userId,
        method: 'question',
        questionId: questionId,
        answer: 'fluffy'
      }
    );

    console.log('Response:', JSON.stringify(step2Data, null, 2));

    if (!step2Data.token) {
      console.log('\n❌ ERROR: Verification failed - no token received');
      return;
    }

    console.log('\n✅ Authentication successful!');
    console.log('Token:', step2Data.token.substring(0, 20) + '...');

    // Step 3: Fix accounts
    console.log('\n🔧 Step 3: Fixing account types...');
    const fixData = await makeRequest(
      `${API_BASE}/mybanker/fix-brokard-accounts`,
      'POST',
      null,
      step2Data.token
    );

    console.log('\n📊 Fix Response:');
    console.log(JSON.stringify(fixData, null, 2));

    if (fixData.success) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ SUCCESS! Account types fixed!');
      console.log('='.repeat(60));
      console.log('\nResults:');
      fixData.results.forEach((result, index) => {
        console.log(`\n${index + 1}. User: ${result.email}`);
        console.log(`   Status: ${result.status}`);
        if (result.changes) {
          console.log('   Changes:');
          result.changes.forEach(change => {
            console.log(`     - Account ${change.accountNumber}: ${change.oldType} → ${change.newType}`);
          });
        }
      });
      console.log('\n' + '='.repeat(60));
    } else {
      console.log('\n❌ ERROR: Fix failed');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

// Run the script
fixAccounts()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
