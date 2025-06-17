// Google Cloud authentication utility - Fixed version
import { GoogleAuth } from 'google-auth-library';

export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    // Get service account from environment variable
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('No Google service account credentials found');
      return null;
    }

    const serviceAccountString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountString === 'undefined' || serviceAccountString.trim() === '') {
      console.log('Google service account key is undefined or empty');
      return null;
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountString);
    } catch (parseError) {
      console.log('Invalid Google service account JSON format');
      return null;
    }

    // Use Google Auth Library for proper authentication
    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    console.log('✅ Google authentication successful');
    return accessToken.token || null;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}