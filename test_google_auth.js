import jwt from 'jsonwebtoken';
import fs from 'fs';

// Test Google authentication with the service account
try {
  console.log('Testing Google service account authentication...');
  
  const serviceAccount = JSON.parse(fs.readFileSync('google-service-account.json', 'utf8'));
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now
  };

  console.log('Service account email:', serviceAccount.client_email);
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Private key length:', serviceAccount.private_key.length);
  console.log('Private key starts with:', serviceAccount.private_key.substring(0, 50));

  // Create JWT token
  const token = jwt.sign(payload, serviceAccount.private_key, { algorithm: 'RS256' });
  console.log('✅ JWT created successfully');
  console.log('Token length:', token.length);
  
  // Test token exchange
  const testTokenExchange = async () => {
    try {
      const response = await fetch(serviceAccount.token_uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: token
        })
      });

      if (response.ok) {
        const tokenData = await response.json();
        console.log('✅ Access token obtained successfully');
        console.log('Token type:', tokenData.token_type);
        console.log('Expires in:', tokenData.expires_in);
        
        // Test Vertex AI endpoint
        const location = 'us-central1';
        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${serviceAccount.project_id}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
        
        const imageResponse = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            instances: [{
              prompt: "A beautiful Korean hunter in Seoul cityscape, Solo Leveling art style"
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              safetyFilterLevel: "block_only_high"
            }
          })
        });
        
        console.log('Vertex AI response status:', imageResponse.status);
        if (imageResponse.ok) {
          console.log('✅ Vertex AI Imagen endpoint accessible');
        } else {
          const errorText = await imageResponse.text();
          console.log('❌ Vertex AI error:', errorText);
        }
        
      } else {
        const errorText = await response.text();
        console.log('❌ Token exchange failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Token exchange error:', error.message);
    }
  };
  
  testTokenExchange();
  
} catch (error) {
  console.error('❌ Authentication test failed:', error.message);
}