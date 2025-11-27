/**
 * Test script to verify backend is running and test login
 */

const API_BASE = 'https://gatwickbank.up.railway.app/api/v1';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: 'jonod@gmail.com',
  password: 'Password123!'
};

const USER_CREDENTIALS = {
  email: 'wilhelmrybak@gmail.com',
  password: 'wilbak007'
};

async function testBackendHealth() {
  console.log('\n🔍 Testing Backend Health...');
  try {
    // Test with currencies endpoint (public)
    const response = await fetch(`${API_BASE}/currencies`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Backend is healthy (${data.currencies?.length || 0} currencies found)`);
      return true;
    } else {
      console.log('❌ Backend health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not reachable:', error.message);
    return false;
  }
}

async function testLogin(credentials, label) {
  console.log(`\n🔐 Testing Login: ${label}`);
  console.log(`   Email: ${credentials.email}`);
  
  try {
    // Step 1: Initial login
    console.log('   Step 1: Sending credentials...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log(`   ❌ Login failed: ${loginData.error || 'Unknown error'}`);
      return null;
    }

    console.log(`   ✅ Step 1 passed: ${loginData.message}`);

    // Check if verification is required
    if (loginData.requiresVerification) {
      console.log(`   ⚠️  Verification required: ${loginData.verificationMethods?.join(', ')}`);
      console.log(`   📧 User email: ${loginData.user?.email}`);
      
      // For testing, we'll use security question if available
      if (loginData.verificationMethods?.includes('security_question')) {
        console.log('   ℹ️  Security question verification available');
        console.log('   ℹ️  Answer: fluffy (for admin) or admin (for test user)');
      }
      
      return { requiresVerification: true, sessionToken: loginData.sessionToken, user: loginData.user };
    }

    // Direct login success
    console.log('   ✅ Login successful!');
    console.log(`   👤 User: ${loginData.user.fullName}`);
    console.log(`   🎫 Token: ${loginData.token.substring(0, 20)}...`);
    
    return { token: loginData.token, user: loginData.user };
  } catch (error) {
    console.log(`   ❌ Login error: ${error.message}`);
    return null;
  }
}

async function testWithdrawal(token) {
  console.log('\n💸 Testing Withdrawal Endpoint...');
  
  try {
    // First get user accounts
    const accountsResponse = await fetch(`${API_BASE}/accounts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!accountsResponse.ok) {
      console.log('   ❌ Failed to fetch accounts');
      return;
    }
    
    const accountsData = await accountsResponse.json();
    const primaryAccount = accountsData.accounts?.find(acc => acc.isPrimary);
    
    if (!primaryAccount) {
      console.log('   ⚠️  No primary account found');
      return;
    }
    
    console.log(`   ✅ Found primary account: ${primaryAccount.accountNumber}`);
    console.log(`   💰 Balance: $${primaryAccount.balance}`);
    
    // Test withdrawal creation (small amount)
    const withdrawalData = {
      accountId: primaryAccount.id,
      amount: 10,
      gatewayId: 'test-gateway',
      description: 'Test withdrawal'
    };
    
    console.log('   📤 Creating test withdrawal request...');
    const withdrawalResponse = await fetch(`${API_BASE}/payments/withdraw`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(withdrawalData)
    });
    
    const withdrawalResult = await withdrawalResponse.json();
    
    if (withdrawalResponse.ok) {
      console.log('   ✅ Withdrawal endpoint is working!');
      console.log(`   📋 Withdrawal ID: ${withdrawalResult.withdrawal?.id}`);
    } else {
      console.log(`   ⚠️  Withdrawal response: ${withdrawalResult.error || withdrawalResult.message}`);
      if (withdrawalResult.error?.includes('Withdrawal model')) {
        console.log('   ℹ️  This is the known Prisma client issue - Railway needs restart');
      }
    }
  } catch (error) {
    console.log(`   ❌ Withdrawal test error: ${error.message}`);
  }
}

async function testAdminEndpoint(token) {
  console.log('\n👑 Testing Admin Endpoint...');
  
  try {
    const response = await fetch(`${API_BASE}/mybanker/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Admin endpoint accessible!');
      console.log(`   📊 Total Users: ${data.totalUsers}`);
      console.log(`   📊 Pending KYC: ${data.pendingKYC}`);
      console.log(`   📊 Active Accounts: ${data.activeAccounts}`);
    } else {
      const error = await response.json();
      console.log(`   ❌ Admin endpoint failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Admin test error: ${error.message}`);
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🚀 GATWICK BANK - BACKEND TEST SUITE');
  console.log('═══════════════════════════════════════════════════════');
  
  // Test 1: Backend Health
  const isHealthy = await testBackendHealth();
  if (!isHealthy) {
    console.log('\n❌ Backend is not running. Aborting tests.');
    return;
  }
  
  // Test 2: Admin Login
  const adminResult = await testLogin(ADMIN_CREDENTIALS, 'Admin User');
  
  if (adminResult?.token) {
    await testAdminEndpoint(adminResult.token);
    await testWithdrawal(adminResult.token);
  }
  
  // Test 3: Regular User Login
  const userResult = await testLogin(USER_CREDENTIALS, 'Test User');
  
  if (userResult?.token) {
    await testWithdrawal(userResult.token);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('✅ TEST SUITE COMPLETE');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run the tests
runTests().catch(console.error);
