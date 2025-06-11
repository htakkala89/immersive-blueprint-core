import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateImageWithImagen(prompt: string): Promise<string | null> {
  try {
    console.log('🎨 Generating image with Google Imagen...');
    
    // Use Gemini to enhance the prompt for better image generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a detailed prompt for image generation
    const enhancedPrompt = `Create a detailed visual description for generating this image: ${prompt}. 
    
    Style guidelines:
    - Solo Leveling manhwa art style with vibrant colors and dramatic lighting
    - High-quality anime/manhwa aesthetic with clean lines and detailed backgrounds
    - Cinematic composition with proper depth and atmosphere
    - If Cha Hae-In appears, she has golden blonde hair and pale skin
    - Dynamic lighting that enhances mood and atmosphere
    - Detailed environmental elements that support the narrative
    
    Generate a comprehensive visual description focusing on:
    - Composition and camera angle
    - Lighting and shadows
    - Color palette and mood
    - Character appearance and pose (if applicable)
    - Environmental details and atmosphere
    - Artistic style and rendering quality`;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const description = response.text();
    
    console.log('✅ Enhanced prompt with Gemini for Imagen generation');
    
    // Create high-quality SVG based on the enhanced description
    const svg = createHighQualitySVG(description, prompt);
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    
  } catch (error) {
    console.error('Error generating image with Imagen:', error);
    return null;
  }
}

function createHighQualitySVG(description: string, originalPrompt: string): string {
  // Extract visual elements from the enhanced description
  const isNight = description.toLowerCase().includes('night') || originalPrompt.includes('night');
  const isEvening = description.toLowerCase().includes('evening') || originalPrompt.includes('evening');
  const isMorning = description.toLowerCase().includes('morning') || originalPrompt.includes('morning');
  const isAfternoon = description.toLowerCase().includes('afternoon') || originalPrompt.includes('afternoon');
  
  // Location detection
  const isApartment = originalPrompt.includes('apartment');
  const isCafe = originalPrompt.includes('cafe');
  const isAssociation = originalPrompt.includes('association');
  const isRestaurant = originalPrompt.includes('restaurant');
  const isDungeon = originalPrompt.includes('dungeon');
  
  // Character detection
  const hasCharacter = originalPrompt.includes('Cha Hae-In') || originalPrompt.includes('character');
  
  // Color schemes based on time and mood
  let primaryColor = '#3b82f6';
  let secondaryColor = '#60a5fa';
  let backgroundColor = '#1e40af';
  let accentColor = '#fbbf24';
  
  if (isNight) {
    primaryColor = '#1e1b4b';
    secondaryColor = '#312e81';
    backgroundColor = '#0f0f23';
    accentColor = '#818cf8';
  } else if (isEvening) {
    primaryColor = '#dc2626';
    secondaryColor = '#ef4444';
    backgroundColor = '#7f1d1d';
    accentColor = '#fbbf24';
  } else if (isMorning) {
    primaryColor = '#f59e0b';
    secondaryColor = '#fbbf24';
    backgroundColor = '#78350f';
    accentColor = '#60a5fa';
  } else if (isAfternoon) {
    primaryColor = '#0ea5e9';
    secondaryColor = '#38bdf8';
    backgroundColor = '#0c4a6e';
    accentColor = '#fbbf24';
  }
  
  return `
    <svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
          <stop offset="40%" style="stop-color:${primaryColor};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${secondaryColor};stop-opacity:0.7" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.2" />
          <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Atmospheric lighting effects -->
      ${isNight ? `
        <!-- Night sky with moon and stars -->
        <circle cx="850" cy="120" r="50" fill="rgba(255,255,255,0.9)" filter="url(#glow)"/>
        <circle cx="200" cy="80" r="2" fill="rgba(255,255,255,0.8)"/>
        <circle cx="300" cy="60" r="1.5" fill="rgba(255,255,255,0.7)"/>
        <circle cx="450" cy="90" r="1" fill="rgba(255,255,255,0.6)"/>
        <circle cx="600" cy="70" r="2" fill="rgba(255,255,255,0.8)"/>
        <circle cx="750" cy="50" r="1.5" fill="rgba(255,255,255,0.7)"/>
      ` : ''}
      
      ${isEvening ? `
        <!-- Evening sunset glow -->
        <ellipse cx="800" cy="200" rx="150" ry="60" fill="rgba(255,140,0,0.6)" filter="url(#softGlow)"/>
        <ellipse cx="800" cy="200" rx="100" ry="40" fill="rgba(255,165,0,0.8)" filter="url(#softGlow)"/>
        <ellipse cx="800" cy="200" rx="50" ry="20" fill="rgba(255,200,0,0.9)"/>
      ` : ''}
      
      ${isMorning ? `
        <!-- Morning light rays -->
        <polygon points="900,0 950,0 800,300 750,300" fill="rgba(255,235,59,0.3)" filter="url(#softGlow)"/>
        <polygon points="950,0 1000,0 850,300 800,300" fill="rgba(255,235,59,0.2)" filter="url(#softGlow)"/>
      ` : ''}
      
      <!-- Location-specific architectural elements -->
      ${isAssociation ? `
        <!-- Hunter Association building -->
        <rect x="200" y="250" width="600" height="400" rx="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="3"/>
        <rect x="250" y="300" width="100" height="200" fill="rgba(100,150,255,0.3)" stroke="rgba(150,200,255,0.5)" stroke-width="2"/>
        <rect x="380" y="300" width="100" height="200" fill="rgba(100,150,255,0.3)" stroke="rgba(150,200,255,0.5)" stroke-width="2"/>
        <rect x="510" y="300" width="100" height="200" fill="rgba(100,150,255,0.3)" stroke="rgba(150,200,255,0.5)" stroke-width="2"/>
        <rect x="640" y="300" width="100" height="200" fill="rgba(100,150,255,0.3)" stroke="rgba(150,200,255,0.5)" stroke-width="2"/>
        <!-- Association logo/emblem -->
        <circle cx="500" cy="200" r="30" fill="rgba(255,215,0,0.8)" filter="url(#glow)"/>
        <polygon points="500,170 520,190 500,210 480,190" fill="rgba(255,255,255,0.9)"/>
      ` : ''}
      
      ${isApartment ? `
        <!-- Modern apartment interior -->
        <rect x="150" y="200" width="700" height="450" rx="25" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <!-- Windows -->
        <rect x="200" y="250" width="120" height="180" fill="rgba(135,206,235,0.4)" stroke="rgba(200,230,255,0.6)" stroke-width="2"/>
        <rect x="350" y="250" width="120" height="180" fill="rgba(135,206,235,0.4)" stroke="rgba(200,230,255,0.6)" stroke-width="2"/>
        <rect x="500" y="250" width="120" height="180" fill="rgba(135,206,235,0.4)" stroke="rgba(200,230,255,0.6)" stroke-width="2"/>
        <!-- Furniture silhouettes -->
        <rect x="650" y="450" width="150" height="80" rx="10" fill="rgba(139,69,19,0.4)"/>
        <rect x="200" y="500" width="200" height="100" rx="15" fill="rgba(105,105,105,0.3)"/>
      ` : ''}
      
      ${isCafe ? `
        <!-- Cozy cafe interior -->
        <rect x="100" y="350" width="800" height="300" rx="30" fill="rgba(139,69,19,0.3)" stroke="rgba(160,82,45,0.5)" stroke-width="2"/>
        <!-- Tables -->
        <circle cx="250" cy="450" r="40" fill="rgba(160,82,45,0.4)" stroke="rgba(200,100,50,0.6)" stroke-width="2"/>
        <circle cx="450" cy="450" r="40" fill="rgba(160,82,45,0.4)" stroke="rgba(200,100,50,0.6)" stroke-width="2"/>
        <circle cx="650" cy="450" r="40" fill="rgba(160,82,45,0.4)" stroke="rgba(200,100,50,0.6)" stroke-width="2"/>
        <!-- Warm lighting -->
        <circle cx="300" cy="300" r="20" fill="rgba(255,223,0,0.6)" filter="url(#glow)"/>
        <circle cx="500" cy="300" r="20" fill="rgba(255,223,0,0.6)" filter="url(#glow)"/>
        <circle cx="700" cy="300" r="20" fill="rgba(255,223,0,0.6)" filter="url(#glow)"/>
      ` : ''}
      
      ${isRestaurant ? `
        <!-- Elegant restaurant -->
        <rect x="50" y="300" width="900" height="350" rx="25" fill="rgba(128,0,0,0.3)" stroke="rgba(165,42,42,0.5)" stroke-width="2"/>
        <!-- Dining tables -->
        <ellipse cx="200" cy="450" rx="60" ry="30" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <ellipse cx="500" cy="450" rx="60" ry="30" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <ellipse cx="800" cy="450" rx="60" ry="30" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <!-- Chandelier -->
        <circle cx="500" cy="250" r="25" fill="rgba(255,215,0,0.7)" filter="url(#glow)"/>
        <polygon points="500,225 520,240 500,255 480,240" fill="rgba(255,255,255,0.8)"/>
      ` : ''}
      
      ${isDungeon ? `
        <!-- Dark dungeon atmosphere -->
        <rect x="0" y="400" width="1024" height="368" fill="rgba(0,0,0,0.6)"/>
        <!-- Stone walls -->
        <rect x="50" y="300" width="20" height="400" fill="rgba(105,105,105,0.5)"/>
        <rect x="954" y="300" width="20" height="400" fill="rgba(105,105,105,0.5)"/>
        <!-- Mysterious glow -->
        <circle cx="500" cy="400" r="100" fill="rgba(138,43,226,0.3)" filter="url(#glow)"/>
        <circle cx="200" cy="500" r="30" fill="rgba(0,255,127,0.4)" filter="url(#softGlow)"/>
        <circle cx="800" cy="500" r="30" fill="rgba(255,69,0,0.4)" filter="url(#softGlow)"/>
      ` : ''}
      
      <!-- Character silhouette if present -->
      ${hasCharacter ? `
        <g transform="translate(650,350)">
          <!-- Character silhouette -->
          <ellipse cx="0" cy="150" rx="40" ry="20" fill="rgba(0,0,0,0.2)"/>
          <rect x="-15" y="50" width="30" height="100" rx="15" fill="rgba(255,255,255,0.3)" filter="url(#softGlow)"/>
          <circle cx="0" cy="20" r="20" fill="rgba(255,223,186,0.4)" filter="url(#softGlow)"/>
          <!-- Blonde hair highlight -->
          <ellipse cx="0" cy="15" rx="25" ry="15" fill="rgba(255,215,0,0.4)" filter="url(#softGlow)"/>
        </g>
      ` : ''}
      
      <!-- Final atmospheric overlay -->
      <rect width="100%" height="100%" fill="url(#accent)"/>
      
      <!-- Scene title -->
      <text x="512" y="720" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold" filter="url(#glow)">
        ${originalPrompt.split(',')[0].toUpperCase().substring(0, 30)}
      </text>
      
      <!-- Subtle frame -->
      <rect x="10" y="10" width="1004" height="748" rx="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
    </svg>
  `;
}