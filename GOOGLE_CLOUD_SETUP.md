# Google Cloud Imagen Setup for Solo Leveling RPG

## Current Status
The Solo Leveling RPG is configured to use Google Cloud's Imagen 3.0 Fast model for high-quality scene and character generation, but requires a Google API key to function.

## Authentication Issues Identified
1. **Private Key Format Error**: The service account JSON private key has encoding issues (`ERR_OSSL_UNSUPPORTED`)
2. **Missing GOOGLE_API_KEY**: Environment variable needed for Vertex AI access
3. **Model Configuration**: Set to use `imagen-3.0-fast-generate-001` (closest to Imagen 4 capabilities)

## Setup Instructions

### 1. Get Google API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Vertex AI API for your project
3. Navigate to "APIs & Services" > "Credentials"
4. Create an API key
5. Copy the key (starts with "AIza...")

### 2. Set Environment Variable
Add the API key to your environment:
```bash
export GOOGLE_API_KEY="your-api-key-here"
```

### 3. Test Image Generation
Once the key is set, test with:
```bash
curl -X POST http://localhost:5000/api/generate-scene-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Korean office building", "location": "hunter_association", "timeOfDay": "morning"}'
```

## Features Enabled
- **Location Scenes**: Hunter Association, apartments, cafes, restaurants
- **Character Images**: Cha Hae-In and Jin-Woo with accurate appearances
- **Time-of-Day Variations**: Morning, afternoon, evening, night lighting
- **Weather Effects**: Clear, cloudy, rainy atmospheres
- **Manhwa Art Style**: Solo Leveling aesthetic with proper character designs

## Current Fallback
Without Google Cloud, the system falls back to OpenAI DALL-E 3, but content policy restrictions limit character generation quality.