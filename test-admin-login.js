const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  console.log('🔐 Testing Admin Login...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@nexstepai.com',
        password: 'AdminPass123!'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
      console.log('📋 Response structure:');
      console.log('- success:', data.success);
      console.log('- token:', data.token ? 'Present' : 'Missing');
      console.log('- data:', data.data);
      console.log('- user role:', data.data?.role);
      
      if (data.data?.role === 'admin') {
        console.log('🎉 Admin role correctly identified!');
        console.log('✅ Frontend should now redirect to /admin/dashboard');
      } else {
        console.log('❌ Admin role not found in response');
      }
    } else {
      console.log('❌ Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Error during login test:', error.message);
  }
}

// Run the test
testAdminLogin();