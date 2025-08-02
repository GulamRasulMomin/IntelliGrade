// Test script to verify username existence error
const API_BASE_URL = 'http://localhost:8000/api';

async function testUsernameError() {
  try {
    // Test 1: Try to register with an existing username
    const testData = {
      username: 'testuser123', // This username already exists
      email: 'test@example.com',
      password: 'TestPass123!',
      password_confirm: 'TestPass123!'
    };

    console.log('Testing username existence error...');
    console.log('Attempting to register with existing username:', testData.username);

    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Error response received:', response.status);
      console.log('Error data:', result);
      
      if (result.username && result.username.includes('already exists')) {
        console.log('✅ Username existence error properly detected!');
        console.log('Error message:', result.username[0]);
      } else {
        console.log('❌ Username existence error not properly formatted');
        console.log('Actual error:', result);
      }
    } else {
      console.log('❌ Registration successful (should have failed)');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUsernameError(); 