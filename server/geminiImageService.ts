import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateImageWithGemini(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 Generating image with Gemini...');
    
    // Use Gemini's image generation capabilities
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a detailed prompt for image generation
    const imagePrompt = `Generate a detailed visual description for this image: ${prompt}. 
    Create a vivid, cinematic description that captures the atmosphere, lighting, colors, and mood. 
    Focus on Solo Leveling manhwa art style with vibrant colors and dramatic lighting.
    Ensure Cha Hae-In has golden blonde hair if she appears in the scene.
    Make it highly detailed and atmospheric.`;
    
    const result = await model.generateContent(imagePrompt);
    const response = await result.response;
    const description = response.text();
    
    console.log('✅ Generated detailed image description with Gemini');
    
    // For now, return the enhanced description as a data URL encoded image
    // In production, this would connect to Google's Imagen API or another image service
    const enhancedPrompt = description.substring(0, 500);
    
    // Create an SVG representation based on the enhanced description
    const svg = createSVGFromDescription(enhancedPrompt, prompt);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    return null;
  }
}

function createSVGFromDescription(description: string, originalPrompt: string): string {
  // Extract key visual elements from the description
  const isNight = description.toLowerCase().includes('night') || originalPrompt.includes('night');
  const isEvening = description.toLowerCase().includes('evening') || originalPrompt.includes('evening');
  const isMorning = description.toLowerCase().includes('morning') || originalPrompt.includes('morning');
  
  // Determine color scheme based on time and location
  let primaryColor = '#3b82f6';
  let secondaryColor = '#60a5fa';
  let backgroundColor = '#1e40af';
  
  if (isNight) {
    primaryColor = '#1e1b4b';
    secondaryColor = '#312e81';
    backgroundColor = '#0f0f23';
  } else if (isEvening) {
    primaryColor = '#dc2626';
    secondaryColor = '#ef4444';
    backgroundColor = '#7f1d1d';
  } else if (isMorning) {
    primaryColor = '#f59e0b';
    secondaryColor = '#fbbf24';
    backgroundColor = '#78350f';
  }
  
  // Location-specific elements
  const isApartment = originalPrompt.includes('apartment');
  const isCafe = originalPrompt.includes('cafe');
  const isAssociation = originalPrompt.includes('association');
  
  return `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${primaryColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.6" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Atmospheric elements -->
      ${isNight ? `
        <circle cx="700" cy="100" r="40" fill="rgba(255,255,255,0.8)" filter="url(#glow)"/>
        <circle cx="720" cy="120" r="2" fill="rgba(255,255,255,0.6)"/>
        <circle cx="680" cy="140" r="1" fill="rgba(255,255,255,0.5)"/>
      ` : ''}
      
      ${isEvening ? `
        <ellipse cx="650" cy="150" rx="80" ry="30" fill="rgba(255,140,0,0.4)"/>
        <ellipse cx="650" cy="150" rx="60" ry="20" fill="rgba(255,165,0,0.6)"/>
      ` : ''}
      
      <!-- Location-specific elements -->
      ${isAssociation ? `
        <rect x="100" y="200" width="600" height="300" rx="20" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <rect x="150" y="250" width="100" height="150" fill="rgba(255,255,255,0.2)"/>
        <rect x="300" y="250" width="100" height="150" fill="rgba(255,255,255,0.2)"/>
        <rect x="450" y="250" width="100" height="150" fill="rgba(255,255,255,0.2)"/>
      ` : ''}
      
      ${isApartment ? `
        <rect x="200" y="150" width="400" height="350" rx="15" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <rect x="250" y="200" width="80" height="120" fill="rgba(255,255,0,0.3)"/>
        <rect x="370" y="200" width="80" height="120" fill="rgba(255,255,0,0.3)"/>
        <rect x="490" y="200" width="80" height="120" fill="rgba(255,255,0,0.3)"/>
      ` : ''}
      
      ${isCafe ? `
        <rect x="150" y="300" width="500" height="200" rx="25" fill="rgba(139,69,19,0.4)" stroke="rgba(160,82,45,0.6)" stroke-width="2"/>
        <circle cx="300" cy="350" r="30" fill="rgba(255,255,255,0.3)"/>
        <circle cx="400" cy="350" r="30" fill="rgba(255,255,255,0.3)"/>
        <circle cx="500" cy="350" r="30" fill="rgba(255,255,255,0.3)"/>
      ` : ''}
      
      <!-- Accent overlay -->
      <rect width="100%" height="100%" fill="url(#accent)"/>
      
      <!-- Title based on enhanced description -->
      <text x="400" y="550" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold" filter="url(#glow)">
        ${originalPrompt.split(',')[0].toUpperCase()}
      </text>
    </svg>
  `;
}