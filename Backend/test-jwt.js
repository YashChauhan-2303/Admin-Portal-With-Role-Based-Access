const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testJWTAuthentication() {
  try {
    console.log('🔑 Testing JWT Authentication...\n');

    // Test 1: Login with admin credentials
    console.log('1. Testing Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@university.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.data.user.name);
    console.log('Role:', loginResponse.data.data.user.role);
    console.log('Access Token (first 50 chars):', loginResponse.data.data.token.substring(0, 50) + '...');
    console.log('Refresh Token (first 50 chars):', loginResponse.data.data.refreshToken.substring(0, 50) + '...\n');

    const { token, refreshToken } = loginResponse.data.data;

    // Test 2: Access protected route with token
    console.log('2. Testing Protected Route Access...');
    const protectedResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Protected route access successful!');
    console.log('User data:', protectedResponse.data.data.user.name, '(' + protectedResponse.data.data.user.email + ')\n');

    // Test 3: Access universities with token
    console.log('3. Testing Universities API with JWT...');
    const universitiesResponse = await axios.get(`${BASE_URL}/universities`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Universities API access successful!');
    console.log('Number of universities:', universitiesResponse.data.data.universities.length);
    console.log('First university:', universitiesResponse.data.data.universities[0].name + '\n');

    // Test 4: Test refresh token
    console.log('4. Testing Refresh Token...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken
    });

    console.log('✅ Token refresh successful!');
    console.log('New Access Token (first 50 chars):', refreshResponse.data.data.token.substring(0, 50) + '...');
    console.log('New Refresh Token (first 50 chars):', refreshResponse.data.data.refreshToken.substring(0, 50) + '...\n');

    // Test 5: Test invalid token
    console.log('5. Testing Invalid Token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
    } catch (error) {
      console.log('✅ Invalid token correctly rejected!');
      console.log('Error:', error.response.data.message + '\n');
    }

    console.log('🎉 All JWT Authentication Tests Passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error.message);
  }
}

// Run the tests
testJWTAuthentication();