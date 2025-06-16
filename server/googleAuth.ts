// Google Cloud authentication utility
import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { join } from 'path';

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
export function createJWT(serviceAccount: ServiceAccountKey, scopes: string[]): string {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: scopes.join(' '),
    aud: serviceAccount.token_uri,
    exp: now + 3600, // 1 hour
    iat: now
  };

  // Ensure private key has proper line breaks and format
  let privateKey = serviceAccount.private_key;
  
  // Handle escaped newlines from JSON
  if (privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  
  // Ensure proper formatting
  if (!privateKey.includes('\n')) {
    // If no line breaks, add them at standard positions
    privateKey = privateKey.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                           .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----');
    
    // Add line breaks every 64 characters for the key content
    const keyContent = privateKey.replace('-----BEGIN PRIVATE KEY-----\n', '')
                                 .replace('\n-----END PRIVATE KEY-----', '');
    const formattedContent = keyContent.match(/.{1,64}/g)?.join('\n') || keyContent;
    privateKey = `-----BEGIN PRIVATE KEY-----\n${formattedContent}\n-----END PRIVATE KEY-----`;
  }
  
  console.log('🔑 Using formatted private key for JWT signing');
  return jwt.sign(payload, privateKey, { algorithm: 'RS256' });
}

// Get OAuth access token from Google
export async function getGoogleAccessToken(): Promise<string | null> {
  try {
    let serviceAccount: ServiceAccountKey;
    
    // Try to read from file first
    try {
      const credentialsPath = join(process.cwd(), 'google-credentials.json');
      const credentialsData = readFileSync(credentialsPath, 'utf8');
      serviceAccount = JSON.parse(credentialsData);
    } catch (fileError) {
      // Fallback to environment variable
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        console.log('Google service account key not available');
        return null;
      }

      const serviceAccountString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountString === 'undefined' || !serviceAccountString || serviceAccountString.trim() === '') {
        console.log('Google service account key is undefined or empty');
        return null;
      }

      try {
        // Additional validation for common JSON issues
        const cleanedString = serviceAccountString.trim();
        if (!cleanedString.startsWith('{') || !cleanedString.endsWith('}')) {
          console.log('Google service account key does not appear to be valid JSON');
          return null;
        }
        
        serviceAccount = JSON.parse(cleanedString);
        
        // Validate required fields
        if (!serviceAccount.private_key || !serviceAccount.client_email) {
          console.log('Google service account missing required fields');
          return null;
        }
      } catch (parseError) {
        console.log('Invalid Google service account JSON format:', parseError instanceof Error ? parseError.message : 'Unknown error');
        return null;
      }
    }
    const scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    
    // Create JWT assertion
    const jwt = createJWT(serviceAccount, scopes);
    
    // Exchange JWT for access token
    return await exchangeJWTForAccessToken(jwt, serviceAccount.token_uri);
  } catch (error) {
    console.error('Error getting Google access token:', error);
    return null;
  }
}

// Exchange JWT for access token
export async function exchangeJWTForAccessToken(jwt: string, tokenUri: string): Promise<string | null> {
  try {
    const response = await fetch(tokenUri, {
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
      console.error('Failed to exchange JWT for access token:', response.status, await response.text());
      return null;
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error exchanging JWT for access token:', error);
    return null;
  }
}

export function getProjectId(): string | null {
  try {
    // Try to read from file first
    try {
      const credentialsPath = join(process.cwd(), 'google-credentials.json');
      const credentialsData = readFileSync(credentialsPath, 'utf8');
      const serviceAccount = JSON.parse(credentialsData);
      return serviceAccount.project_id;
    } catch (fileError) {
      // Fallback to environment variable
      if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
      }
      
      const serviceAccountString = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (serviceAccountString === 'undefined' || serviceAccountString.trim() === '') {
        console.log('Google service account key is undefined or empty in getProjectId');
        return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
      }
      
      let serviceAccount: ServiceAccountKey;
      try {
        serviceAccount = JSON.parse(serviceAccountString);
      } catch (parseError) {
        console.log('Invalid Google service account JSON format in getProjectId');
        return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
      }
      return serviceAccount.project_id;
    }
  } catch (error) {
    console.error('Error getting project ID:', error);
    return process.env.GOOGLE_CLOUD_PROJECT_ID || null;
  }
}