// Test Google authentication directly
import { getGoogleAccessToken } from './server/googleAuth.js';

async function testAuth() {
  try {
    console.log('Testing Google authentication...');
    const token = await getGoogleAccessToken();
    
    if (token) {
      console.log('✅ Google authentication successful');
      console.log('Token length:', token.length);
      console.log('Token starts with:', token.substring(0, 20) + '...');
    } else {
      console.log('❌ Google authentication failed - no token returned');
    }
  } catch (error) {
    console.log('❌ Google authentication error:', error.message);
  }
}

testAuth();