const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api/auth';

// Test admin user creation
async function testAdminCreation() {
  console.log('🧪 Testing Admin User Creation...\n');
  
  const adminData = {
    name: 'Admin User',
    email: 'admin@nexstepai.com',
    password: 'AdminPass123!'
  };

  try {
    console.log('📝 Creating admin user...');
    const response = await fetch(`${BASE_URL}/register-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin user created successfully!');
      console.log('📊 Response data:', {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
        hasToken: !!data.token
      });
      return { success: true, token: data.token };
    } else {
      console.log('❌ Admin creation failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test admin login
async function testAdminLogin() {
  console.log('\n🔐 Testing Admin Login...\n');
  
  const loginData = {
    email: 'admin@nexstepai.com',
    password: 'AdminPass123!'
  };

  try {
    console.log('🔑 Logging in admin user...');
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('📊 Login response:', {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
        hasToken: !!data.token
      });
      return { success: true, token: data.token, user: data.data };
    } else {
      console.log('❌ Admin login failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

// Test regular user creation for comparison
async function testRegularUserCreation() {
  console.log('\n👤 Testing Regular User Creation...\n');
  
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'TestPass123!'
  };

  try {
    console.log('📝 Creating regular user...');
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Regular user created successfully!');
      console.log('📊 Response data:', {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        role: data.data.role,
        hasToken: !!data.token
      });
      return { success: true, token: data.token };
    } else {
      console.log('❌ Regular user creation failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('💥 Network error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Authentication Tests\n');
  console.log('=' .repeat(50));
  
  // Test 1: Create admin user
  const adminCreation = await testAdminCreation();
  
  // Test 2: Login admin user
  const adminLogin = await testAdminLogin();
  
  // Test 3: Create regular user for comparison
  const regularUserCreation = await testRegularUserCreation();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary:');
  console.log(`Admin Creation: ${adminCreation.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Admin Login: ${adminLogin.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Regular User Creation: ${regularUserCreation.success ? '✅ PASS' : '❌ FAIL'}`);
  
  if (adminLogin.success) {
    console.log('\n🎉 Admin authentication system is working correctly!');
    console.log(`🔑 Admin role confirmed: ${adminLogin.user.role}`);
  }
}

// Install node-fetch if not available and run tests
runTests().catch(console.error);