// Google Cloud authentication utility
import { createHash } from 'crypto';

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain: string;
}

// Create JWT for Google Cloud authentication
function createJWT(serviceAccount: ServiceAccountKey, scopes: string[]): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: serviceAccount.token_uri,
    exp: now + 3600, // 1 hour
    iat: now
  };

  const header = { alg: 'RS256', typ: 'JWT' };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signInput = `${encodedHeader}.${encodedPayload}`;
  
  // Simple signature placeholder - in production would use proper crypto signing
  const signature = createHash('sha256').update(signInput + serviceAccount.private_key_id).digest('base64url');
  
  return `${signInput}.${signature}`;
}

// Get OAuth access token from Google
export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('Google service account key not available');
      return null;
    }

    const serviceAccount: ServiceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    const scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    
    // Create JWT assertion
    const jwt = createJWT(serviceAccount, scopes);
    
    // Exchange JWT for access token
    const response = await fetch(serviceAccount.token_uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      })
    });

    if (!response.ok) {
      console.error('Failed to get Google access token:', response.status, await response.text());
      return null;
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

export function getProjectId(): string | null {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
    }
    
    const serviceAccount: ServiceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    return serviceAccount.project_id;
  } catch (error) {
    console.error('Error getting project ID:', error);
    return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
  }
}