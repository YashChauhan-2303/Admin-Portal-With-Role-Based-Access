const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testRegistration() {
  try {
    console.log('🔥 Testing User Registration...\n');

    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    const registerData = {
      name: 'John Smith',
      email: 'john.smith@university.com',
      password: 'password123',
      role: 'viewer'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);

    console.log('✅ Registration successful!');
    console.log('New User:', registerResponse.data.data.user.name);
    console.log('Email:', registerResponse.data.data.user.email);
    console.log('Role:', registerResponse.data.data.user.role);
    console.log('Access Token (first 50 chars):', registerResponse.data.data.token.substring(0, 50) + '...');
    console.log('Refresh Token (first 50 chars):', registerResponse.data.data.refreshToken.substring(0, 50) + '...\n');

    const { token } = registerResponse.data.data;

    // Test 2: Verify the new user can access protected routes
    console.log('2. Testing New User Access to Protected Routes...');
    const protectedResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Protected route access successful!');
    console.log('User data:', protectedResponse.data.data.user.name, '(' + protectedResponse.data.data.user.email + ')\n');

    // Test 3: Try to register with same email (should fail)
    console.log('3. Testing Duplicate Email Registration (should fail)...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('❌ This should have failed - duplicate email allowed!');
    } catch (error) {
      console.log('✅ Duplicate email correctly rejected!');
      console.log('Error:', error.response.data.message + '\n');
    }

    // Test 4: Test invalid data validation
    console.log('4. Testing Registration Validation...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        name: 'X', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      });
      console.log('❌ This should have failed - invalid data allowed!');
    } catch (error) {
      console.log('✅ Invalid registration data correctly rejected!');
      console.log('Error:', error.response.data.message + '\n');
    }

    // Test 5: Login with the newly registered user
    console.log('5. Testing Login with New User...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });

    console.log('✅ Login with new user successful!');
    console.log('User:', loginResponse.data.data.user.name);
    console.log('Role:', loginResponse.data.data.user.role + '\n');

    console.log('🎉 All Registration Tests Passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
testRegistration();