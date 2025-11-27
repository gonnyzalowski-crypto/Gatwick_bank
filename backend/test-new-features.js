/**
 * Test Script for New Features: External Transfers & Recurring Payments
 * Tests against production API
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

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`)
};

let authToken = null;
let testsPassed = 0;
let testsFailed = 0;

async function makeRequest(method, endpoint, body = null, expectStatus = 200) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json().catch(() => ({}));
    
    if (response.status === expectStatus) {
      testsPassed++;
      return { success: true, status: response.status, data };
    } else {
      testsFailed++;
      return { success: false, status: response.status, data };
    }
  } catch (error) {
    testsFailed++;
    return { success: false, error: error.message };
  }
}

async function login() {
  console.log('\n🔐 LOGGING IN...\n');
  
  // Step 1: Login
  const loginRes = await makeRequest('POST', '/auth/login', {
    email: 'jonod@gmail.com',
    password: 'Password123!'
  });
  
  if (!loginRes.success) {
    log.error('Login Step 1 failed');
    console.log(loginRes);
    return false;
  }
  
  log.success('Login Step 1 passed');
  
  // Step 2: Verify with security answer
  const verifyRes = await makeRequest('POST', '/auth/verify-login', {
    email: 'jonod@gmail.com',
    securityAnswer: 'fluffy',
    tempToken: loginRes.data.tempToken
  });
  
  if (!verifyRes.success || !verifyRes.data.accessToken) {
    log.error('Login Step 2 failed');
    console.log(verifyRes);
    return false;
  }
  
  authToken = verifyRes.data.accessToken;
  log.success('Login Step 2 passed - Token obtained');
  return true;
}

async function testRecurringPayments() {
  console.log('\n' + '='.repeat(50));
  console.log('📅 RECURRING PAYMENTS API TESTS');
  console.log('='.repeat(50) + '\n');
  
  // Get accounts first
  log.test('Getting user accounts...');
  const accountsRes = await makeRequest('GET', '/accounts');
  if (!accountsRes.success) {
    log.error('Failed to get accounts');
    return;
  }
  log.success(`Found ${accountsRes.data.accounts?.length || 0} accounts`);
  
  const fromAccountId = accountsRes.data.accounts?.[0]?.id;
  if (!fromAccountId) {
    log.warning('No accounts found, skipping recurring payment tests');
    return;
  }
  
  // Test 1: Get all recurring payments
  log.test('GET /recurring-payments');
  const getRes = await makeRequest('GET', '/recurring-payments');
  if (getRes.success) {
    log.success(`Got ${getRes.data.payments?.length || 0} recurring payments`);
  } else {
    log.error('Failed to get recurring payments');
    console.log(getRes);
  }
  
  // Test 2: Create a recurring payment
  log.test('POST /recurring-payments (Create)');
  const createRes = await makeRequest('POST', '/recurring-payments', {
    fromAccountId,
    paymentType: 'EXTERNAL',
    recipientName: 'Test Recipient',
    recipientBank: 'Test Bank',
    recipientAccount: '123456789',
    recipientRouting: '021000021',
    amount: 100,
    description: 'Test recurring payment',
    frequency: 'MONTHLY',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
  }, 201);
  
  let paymentId = null;
  if (createRes.success) {
    paymentId = createRes.data.payment?.id;
    log.success(`Created recurring payment: ${paymentId}`);
  } else {
    log.error('Failed to create recurring payment');
    console.log(createRes);
  }
  
  if (paymentId) {
    // Test 3: Get specific payment
    log.test(`GET /recurring-payments/${paymentId}`);
    const getOneRes = await makeRequest('GET', `/recurring-payments/${paymentId}`);
    if (getOneRes.success) {
      log.success('Got payment details');
    } else {
      log.error('Failed to get payment details');
    }
    
    // Test 4: Update payment
    log.test(`PUT /recurring-payments/${paymentId}`);
    const updateRes = await makeRequest('PUT', `/recurring-payments/${paymentId}`, {
      amount: 150,
      description: 'Updated test payment'
    });
    if (updateRes.success) {
      log.success('Updated payment');
    } else {
      log.error('Failed to update payment');
    }
    
    // Test 5: Pause payment
    log.test(`POST /recurring-payments/${paymentId}/pause`);
    const pauseRes = await makeRequest('POST', `/recurring-payments/${paymentId}/pause`);
    if (pauseRes.success) {
      log.success('Paused payment');
    } else {
      log.error('Failed to pause payment');
    }
    
    // Test 6: Resume payment
    log.test(`POST /recurring-payments/${paymentId}/resume`);
    const resumeRes = await makeRequest('POST', `/recurring-payments/${paymentId}/resume`);
    if (resumeRes.success) {
      log.success('Resumed payment');
    } else {
      log.error('Failed to resume payment');
    }
    
    // Test 7: Cancel payment
    log.test(`POST /recurring-payments/${paymentId}/cancel`);
    const cancelRes = await makeRequest('POST', `/recurring-payments/${paymentId}/cancel`);
    if (cancelRes.success) {
      log.success('Cancelled payment');
    } else {
      log.error('Failed to cancel payment');
    }
  }
}

async function testExternalTransfers() {
  console.log('\n' + '='.repeat(50));
  console.log('🏦 EXTERNAL TRANSFERS API TESTS');
  console.log('='.repeat(50) + '\n');
  
  // Test 1: Get beneficiaries
  log.test('GET /beneficiaries');
  const benRes = await makeRequest('GET', '/beneficiaries');
  if (benRes.success) {
    log.success(`Got ${benRes.data.beneficiaries?.length || 0} beneficiaries`);
  } else {
    log.error('Failed to get beneficiaries');
  }
  
  // Test 2: Create beneficiary
  log.test('POST /beneficiaries (Create)');
  const createBenRes = await makeRequest('POST', '/beneficiaries', {
    bankName: 'Chase Bank',
    routingNumber: '021000021',
    accountNumber: '987654321',
    accountName: 'Test Beneficiary',
    nickname: 'Test Ben'
  }, 201);
  
  let beneficiaryId = null;
  if (createBenRes.success) {
    beneficiaryId = createBenRes.data.beneficiary?.id;
    log.success(`Created beneficiary: ${beneficiaryId}`);
  } else {
    log.error('Failed to create beneficiary');
    console.log(createBenRes);
  }
  
  // Test 3: Get transfers
  log.test('GET /transfers');
  const transfersRes = await makeRequest('GET', '/transfers');
  if (transfersRes.success) {
    log.success(`Got ${transfersRes.data.transfers?.length || 0} transfers`);
  } else {
    log.error('Failed to get transfers');
  }
  
  // Test 4: Get banks list
  log.test('GET /transfers/banks');
  const banksRes = await makeRequest('GET', '/transfers/banks');
  if (banksRes.success) {
    log.success(`Got ${banksRes.data.banks?.length || 0} banks`);
  } else {
    log.warning('Banks endpoint may not be available');
  }
  
  // Clean up - delete beneficiary
  if (beneficiaryId) {
    log.test(`DELETE /beneficiaries/${beneficiaryId}`);
    const deleteRes = await makeRequest('DELETE', `/beneficiaries/${beneficiaryId}`);
    if (deleteRes.success) {
      log.success('Deleted test beneficiary');
    } else {
      log.warning('Failed to delete beneficiary');
    }
  }
}

async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(50));
  console.log('👑 ADMIN API TESTS');
  console.log('='.repeat(50) + '\n');
  
  // Test admin recurring payments endpoint
  log.test('GET /recurring-payments/admin/all');
  const adminRecRes = await makeRequest('GET', '/recurring-payments/admin/all');
  if (adminRecRes.success) {
    log.success(`Admin: Got ${adminRecRes.data.payments?.length || 0} recurring payments`);
  } else {
    log.error('Admin recurring payments failed');
    console.log(adminRecRes);
  }
  
  // Test admin transfers endpoint
  log.test('GET /transfers/admin/all');
  const adminTransRes = await makeRequest('GET', '/transfers/admin/all');
  if (adminTransRes.success) {
    log.success(`Admin: Got ${adminTransRes.data.transfers?.length || 0} transfers`);
  } else {
    log.error('Admin transfers failed');
    console.log(adminTransRes);
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 GATWICK BANK - NEW FEATURES API TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Testing against: ${API_BASE}\n`);
  
  // Login first
  const loggedIn = await login();
  if (!loggedIn) {
    log.error('Cannot proceed without authentication');
    return;
  }
  
  // Run tests
  await testRecurringPayments();
  await testExternalTransfers();
  await testAdminEndpoints();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log('='.repeat(60) + '\n');
}

runAllTests().catch(console.error);
