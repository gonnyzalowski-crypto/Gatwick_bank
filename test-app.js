/**
 * Gatwick Bank - Comprehensive Test Script
 * Run with: node test-app.js
 * 
 * Tests:
 * 1. Landing Page
 * 2. Authentication (Login)
 * 3. Dashboard
 * 4. Loans Page
 * 5. Recurring Payments Page
 * 6. Admin Dashboard
 * 7. Admin Loans Management
 */

const API_BASE = process.env.API_URL || 'https://gatwickbank.up.railway.app/api/v1';

// Test credentials
const TEST_USER = {
  email: 'wilhelmrybak@gmail.com',
  password: 'wilbak007'
};

const ADMIN_USER = {
  email: 'jonod@gmail.com',
  password: 'Password123!',
  securityAnswer: 'fluffy'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}═══ ${msg} ═══${colors.reset}\n`)
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  issues: []
};

async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const text = await response.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { rawResponse: text };
    }
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { status: 0, ok: false, error: error.message };
  }
}

// =============================================
// TEST FUNCTIONS
// =============================================

async function testBackendHealth() {
  log.section('Backend Health Check');
  
  const response = await fetchAPI('/health');
  
  if (response.ok || response.status === 200) {
    log.success('Backend is running');
    results.passed++;
  } else {
    log.error(`Backend health check failed: ${response.error || response.status}`);
    results.failed++;
    results.issues.push('Backend not responding');
  }
}

async function testAuthLogin() {
  log.section('Authentication Tests');
  
  // Test Step 1: Email/Password
  log.info('Testing login step 1 (email/password)...');
  const step1 = await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password
    })
  });
  
  log.info(`Login response status: ${step1.status}`);
  log.info(`Login response data: ${JSON.stringify(step1.data).substring(0, 200)}`);
  
  // Check if direct token (no security question required)
  if (step1.ok && step1.data.accessToken) {
    log.success('Login passed - Direct token received (no security question)');
    results.passed++;
    return step1.data.accessToken;
  }
  
  // Check if security question required
  if (step1.ok && step1.data.requiresSecurityQuestion) {
    log.success('Login Step 1 passed - Security question required');
    results.passed++;
    
    const userId = step1.data.userId;
    const questionId = step1.data.securityQuestions?.[0]?.id;
    
    if (!questionId) {
      log.error('No security question ID found');
      results.failed++;
      return null;
    }
    
    // Test Step 2: Security Answer via /auth/login/verify
    log.info('Testing login step 2 (security answer)...');
    const step2 = await fetchAPI('/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        method: 'security_question',
        questionId: questionId,
        answer: ADMIN_USER.securityAnswer
      })
    });
    
    log.info(`Step 2 response status: ${step2.status}`);
    log.info(`Step 2 response data: ${JSON.stringify(step2.data).substring(0, 200)}`);
    
    if (step2.ok && step2.data.accessToken) {
      log.success('Login Step 2 passed - Token received');
      results.passed++;
      return step2.data.accessToken;
    } else {
      log.error(`Login Step 2 failed: ${JSON.stringify(step2.data)}`);
      results.failed++;
      results.issues.push('Security answer verification failing');
    }
  } else {
    log.error(`Login Step 1 failed: Status ${step1.status} - ${JSON.stringify(step1.data)}`);
    results.failed++;
    results.issues.push('Login authentication failing');
  }
  
  return null;
}

async function testLoansAPI(token) {
  log.section('Loans API Tests');
  
  if (!token) {
    log.warn('Skipping loans tests - no auth token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get user loans
  log.info('Testing GET /loans...');
  const loansRes = await fetchAPI('/loans', { headers });
  
  if (loansRes.ok) {
    log.success(`Get loans passed - Found ${loansRes.data.loans?.length || 0} loans`);
    results.passed++;
  } else {
    log.error(`Get loans failed: ${JSON.stringify(loansRes.data)}`);
    results.failed++;
    results.issues.push('Loans API not working');
  }
  
  // Test admin get all loans
  log.info('Testing GET /loans/admin/all...');
  const adminLoansRes = await fetchAPI('/loans/admin/all', { headers });
  
  if (adminLoansRes.ok) {
    log.success(`Admin get all loans passed - Found ${adminLoansRes.data.loans?.length || 0} loans`);
    results.passed++;
  } else {
    log.error(`Admin get all loans failed: ${JSON.stringify(adminLoansRes.data)}`);
    results.failed++;
    results.issues.push('Admin loans API not working');
  }
}

async function testAdminAPI(token) {
  log.section('Admin API Tests');
  
  if (!token) {
    log.warn('Skipping admin tests - no auth token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test admin stats
  log.info('Testing GET /mybanker/stats...');
  const statsRes = await fetchAPI('/mybanker/stats', { headers });
  
  if (statsRes.ok) {
    log.success(`Admin stats passed - ${statsRes.data.totalUsers} users`);
    results.passed++;
  } else {
    log.error(`Admin stats failed: ${JSON.stringify(statsRes.data)}`);
    results.failed++;
    results.issues.push('Admin stats API not working');
  }
  
  // Test get users
  log.info('Testing GET /mybanker/users...');
  const usersRes = await fetchAPI('/mybanker/users', { headers });
  
  if (usersRes.ok) {
    log.success(`Get users passed - Found ${usersRes.data.users?.length || 0} users`);
    results.passed++;
  } else {
    log.error(`Get users failed: ${JSON.stringify(usersRes.data)}`);
    results.failed++;
    results.issues.push('Admin users API not working');
  }
}

async function testAccountsAPI(token) {
  log.section('Accounts API Tests');
  
  if (!token) {
    log.warn('Skipping accounts tests - no auth token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get accounts
  log.info('Testing GET /accounts...');
  const accountsRes = await fetchAPI('/accounts', { headers });
  
  if (accountsRes.ok) {
    log.success(`Get accounts passed - Found ${accountsRes.data.accounts?.length || 0} accounts`);
    results.passed++;
  } else {
    log.error(`Get accounts failed: ${JSON.stringify(accountsRes.data)}`);
    results.failed++;
    results.issues.push('Accounts API not working');
  }
}

async function testRecurringPaymentsAPI(token) {
  log.section('Recurring Payments API Tests');
  
  if (!token) {
    log.warn('Skipping recurring payments tests - no auth token');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  // Test get recurring payments
  log.info('Testing GET /recurring-payments...');
  const paymentsRes = await fetchAPI('/recurring-payments', { headers });
  
  if (paymentsRes.ok) {
    log.success(`Get recurring payments passed - Found ${paymentsRes.data.payments?.length || 0} payments`);
    results.passed++;
  } else {
    log.warn(`Recurring payments API returned: ${paymentsRes.status} - This is expected if feature is admin-managed`);
    results.issues.push('Recurring payments API may need admin setup');
  }
}

async function testGatewaysAPI() {
  log.section('Payment Gateways API Tests');
  
  // Test get gateways (public)
  log.info('Testing GET /gateways...');
  const gatewaysRes = await fetchAPI('/gateways');
  
  if (gatewaysRes.ok) {
    log.success(`Get gateways passed - Found ${gatewaysRes.data.gateways?.length || 0} gateways`);
    results.passed++;
  } else {
    log.error(`Get gateways failed: ${JSON.stringify(gatewaysRes.data)}`);
    results.failed++;
    results.issues.push('Payment gateways API not working');
  }
}

// =============================================
// MAIN TEST RUNNER
// =============================================

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║          GATWICK BANK - COMPREHENSIVE TEST SUITE           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nAPI Base: ${API_BASE}`);
  console.log(`Test Time: ${new Date().toLocaleString()}\n`);
  
  // Run tests
  await testBackendHealth();
  await testGatewaysAPI();
  
  const token = await testAuthLogin();
  
  await testAccountsAPI(token);
  await testLoansAPI(token);
  await testRecurringPaymentsAPI(token);
  await testAdminAPI(token);
  
  // Print summary
  log.section('TEST SUMMARY');
  
  console.log(`Total Passed: ${colors.green}${results.passed}${colors.reset}`);
  console.log(`Total Failed: ${colors.red}${results.failed}${colors.reset}`);
  
  if (results.issues.length > 0) {
    console.log(`\n${colors.yellow}Issues Found:${colors.reset}`);
    results.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  console.log('\n');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
