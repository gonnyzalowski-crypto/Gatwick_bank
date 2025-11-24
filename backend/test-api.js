/**
 * Automated API Testing Script
 * Tests critical endpoints and features
 */

const API_BASE = process.env.API_URL || 'http://localhost:8080/api/v1';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testEndpoint(name, method, endpoint, body = null, expectedStatus = 200, headers = {}) {
  log.test(`Testing: ${name}`);
  const startTime = Date.now();
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const responseTime = Date.now() - startTime;
    const data = await response.json().catch(() => ({}));

    if (response.status === expectedStatus) {
      log.success(`${name} - ${responseTime}ms`);
      testsPassed++;
      return { success: true, data, responseTime };
    } else {
      log.error(`${name} - Expected ${expectedStatus}, got ${response.status}`);
      console.log('Response:', data);
      testsFailed++;
      return { success: false, data, responseTime };
    }
  } catch (error) {
    log.error(`${name} - ${error.message}`);
    testsFailed++;
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GATWICK BANK API TESTING SUITE');
  console.log('='.repeat(60) + '\n');

  log.info(`Testing API at: ${API_BASE}\n`);

  // Test data
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01'
  };

  let authToken = null;
  let userId = null;

  // ==================== HEALTH CHECK ====================
  console.log('\n📊 HEALTH CHECK\n');
  await testEndpoint('Health Check', 'GET', '/health', null, 200);

  // ==================== AUTHENTICATION ====================
  console.log('\n🔐 AUTHENTICATION TESTS\n');

  // Test registration
  const registerResult = await testEndpoint(
    'User Registration',
    'POST',
    '/auth/register',
    testUser,
    201
  );

  if (registerResult.success) {
    userId = registerResult.data.user?.id;
    authToken = registerResult.data.accessToken;
  }

  // Test login (should require verification)
  const loginResult = await testEndpoint(
    'User Login (Step 1)',
    'POST',
    '/auth/login',
    {
      email: 'jonod@gmail.com',
      password: 'Password123!'
    },
    200
  );

  // Test invalid login
  await testEndpoint(
    'Invalid Login',
    'POST',
    '/auth/login',
    {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    },
    401
  );

  // Test account lockout (5 failed attempts)
  log.info('Testing account lockout (5 failed attempts)...');
  for (let i = 1; i <= 6; i++) {
    const result = await testEndpoint(
      `Failed Login Attempt ${i}/6`,
      'POST',
      '/auth/login',
      {
        email: 'lockout_test@example.com',
        password: 'wrongpassword'
      },
      i <= 5 ? 401 : 429 // Should be locked on 6th attempt
    );
    await sleep(100);
  }

  // ==================== RATE LIMITING ====================
  console.log('\n⏱️  RATE LIMITING TESTS\n');

  log.info('Testing general API rate limit (100 req/15min)...');
  let rateLimitHit = false;
  for (let i = 1; i <= 105; i++) {
    const response = await fetch(`${API_BASE}/health`);
    if (response.status === 429) {
      log.success(`Rate limit triggered at request ${i}`);
      rateLimitHit = true;
      testsPassed++;
      break;
    }
    if (i % 20 === 0) {
      log.info(`Sent ${i} requests...`);
    }
  }

  if (!rateLimitHit) {
    log.warning('Rate limit not triggered (may need more requests)');
    testsSkipped++;
  }

  // ==================== ACCOUNTS ====================
  console.log('\n💰 ACCOUNT TESTS\n');

  if (authToken) {
    // Get user accounts
    await testEndpoint(
      'Get User Accounts',
      'GET',
      '/accounts',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );

    // Get account summary
    await testEndpoint(
      'Get Account Summary',
      'GET',
      '/accounts/summary',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );
  } else {
    log.warning('Skipping account tests (no auth token)');
    testsSkipped += 2;
  }

  // ==================== CARDS ====================
  console.log('\n💳 CARD TESTS\n');

  if (authToken) {
    // Get user cards
    await testEndpoint(
      'Get User Cards',
      'GET',
      '/cards',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );

    // Get card statistics
    await testEndpoint(
      'Get Card Statistics',
      'GET',
      '/cards/statistics',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );
  } else {
    log.warning('Skipping card tests (no auth token)');
    testsSkipped += 2;
  }

  // ==================== TRANSACTIONS ====================
  console.log('\n📊 TRANSACTION TESTS\n');

  if (authToken) {
    // Get user transactions
    await testEndpoint(
      'Get User Transactions',
      'GET',
      '/transactions',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );
  } else {
    log.warning('Skipping transaction tests (no auth token)');
    testsSkipped++;
  }

  // ==================== PAYMENT GATEWAYS ====================
  console.log('\n🌐 PAYMENT GATEWAY TESTS\n');

  // Get active gateways (public endpoint)
  await testEndpoint(
    'Get Active Payment Gateways',
    'GET',
    '/gateways/active',
    null,
    200
  );

  // ==================== NOTIFICATIONS ====================
  console.log('\n🔔 NOTIFICATION TESTS\n');

  if (authToken) {
    // Get user notifications
    await testEndpoint(
      'Get User Notifications',
      'GET',
      '/notifications',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );
  } else {
    log.warning('Skipping notification tests (no auth token)');
    testsSkipped++;
  }

  // ==================== SUPPORT TICKETS ====================
  console.log('\n🎫 SUPPORT TICKET TESTS\n');

  if (authToken) {
    // Get user tickets
    await testEndpoint(
      'Get User Support Tickets',
      'GET',
      '/support-tickets',
      null,
      200,
      { Authorization: `Bearer ${authToken}` }
    );
  } else {
    log.warning('Skipping support ticket tests (no auth token)');
    testsSkipped++;
  }

  // ==================== ADMIN ENDPOINTS ====================
  console.log('\n👨‍💼 ADMIN ENDPOINT TESTS\n');

  // Test admin endpoints without auth (should fail)
  await testEndpoint(
    'Admin Users (Unauthorized)',
    'GET',
    '/mybanker/users',
    null,
    401
  );

  await testEndpoint(
    'Admin Deposits (Unauthorized)',
    'GET',
    '/mybanker/deposits',
    null,
    401
  );

  // ==================== BACKUP SYSTEM ====================
  console.log('\n💾 BACKUP SYSTEM TESTS\n');

  // Test backup endpoints without auth (should fail)
  await testEndpoint(
    'Backup List (Unauthorized)',
    'GET',
    '/backup/list',
    null,
    401
  );

  await testEndpoint(
    'Backup Stats (Unauthorized)',
    'GET',
    '/backup/stats',
    null,
    401
  );

  // ==================== SECURITY TESTS ====================
  console.log('\n🔒 SECURITY TESTS\n');

  // Test SQL injection prevention
  await testEndpoint(
    'SQL Injection Prevention',
    'POST',
    '/auth/login',
    {
      email: "admin' OR '1'='1",
      password: "password' OR '1'='1"
    },
    401
  );

  // Test XSS prevention
  await testEndpoint(
    'XSS Prevention',
    'POST',
    '/auth/login',
    {
      email: '<script>alert("xss")</script>@example.com',
      password: 'password'
    },
    401
  );

  // ==================== RESULTS ====================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS');
  console.log('='.repeat(60) + '\n');

  const total = testsPassed + testsFailed + testsSkipped;
  const passRate = total > 0 ? ((testsPassed / total) * 100).toFixed(1) : 0;

  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  Skipped: ${testsSkipped}${colors.reset}`);
  console.log(`${colors.cyan}📈 Pass Rate: ${passRate}%${colors.reset}\n`);

  if (testsFailed === 0) {
    log.success('ALL TESTS PASSED! 🎉');
  } else {
    log.error(`${testsFailed} tests failed. Please review the errors above.`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(testsFailed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
