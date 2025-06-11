// Fallback image service that provides placeholder images while API keys are being resolved
export function getFallbackLocationImage(location: string, timeOfDay: string, weather?: string): string {
  // Generate SVG placeholder images that match the location and time
  const locationColors = {
    hunter_association: { primary: '#1e40af', secondary: '#3b82f6' }, // Blue tones for professional
    player_apartment: { primary: '#059669', secondary: '#10b981' }, // Green tones for home
    chahaein_apartment: { primary: '#7c3aed', secondary: '#a855f7' }, // Purple tones for elegance
    hongdae_cafe: { primary: '#dc2626', secondary: '#ef4444' }, // Red tones for vibrant cafe
    myeongdong_restaurant: { primary: '#d97706', secondary: '#f59e0b' } // Orange tones for restaurant
  };

  const timeGradients = {
    morning: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', // Warm yellow
    afternoon: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)', // Clear blue
    evening: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)', // Orange sunset
    night: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' // Deep purple
  };

  const colors = locationColors[location as keyof typeof locationColors] || locationColors.hunter_association;
  const timeGradient = timeGradients[timeOfDay as keyof typeof timeGradients] || timeGradients.afternoon;

  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.6" />
        </linearGradient>
        <linearGradient id="timeOverlay" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Time overlay -->
      <rect width="100%" height="100%" fill="url(#timeOverlay)"/>
      
      <!-- Location indicator -->
      <circle cx="400" cy="300" r="80" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <circle cx="400" cy="300" r="40" fill="rgba(255,255,255,0.3)"/>
      
      <!-- Weather indicator -->
      ${weather === 'rainy' ? 
        '<g transform="translate(200,100)"><path d="M10,20 Q15,10 20,20 Q25,10 30,20" stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="none"/><path d="M15,30 Q20,20 25,30 Q30,20 35,30" stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="none"/></g>' : 
        '<circle cx="150" cy="150" r="30" fill="rgba(255,255,255,0.4)"/>'
      }
      
      <!-- Location text -->
      <text x="400" y="450" text-anchor="middle" fill="white" font-family="Arial" font-size="24" font-weight="bold">
        ${location.replace('_', ' ').toUpperCase()}
      </text>
      <text x="400" y="480" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="16">
        ${timeOfDay.toUpperCase()} ${weather ? `• ${weather.toUpperCase()}` : ''}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export function getFallbackCharacterImage(emotion: string, location: string): string {
  // Character-specific colors
  const characterColors = {
    romantic: { primary: '#ec4899', secondary: '#f472b6' },
    professional: { primary: '#3b82f6', secondary: '#60a5fa' },
    focused: { primary: '#6366f1', secondary: '#818cf8' },
    warm: { primary: '#f59e0b', secondary: '#fbbf24' }
  };

  const colors = characterColors[emotion as keyof typeof characterColors] || characterColors.professional;

  const svg = `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="charBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.7" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#charBg)"/>
      
      <!-- Character silhouette -->
      <ellipse cx="200" cy="500" rx="60" ry="20" fill="rgba(255,255,255,0.2)"/>
      <rect x="170" y="350" width="60" height="150" rx="30" fill="rgba(255,255,255,0.3)"/>
      <circle cx="200" cy="280" r="50" fill="rgba(255,255,255,0.4)"/>
      
      <!-- Hair indicator (blonde) -->
      <path d="M150,250 Q200,220 250,250 Q200,240 150,250" fill="rgba(255,215,0,0.6)"/>
      
      <!-- Emotion indicator -->
      <text x="200" y="550" text-anchor="middle" fill="white" font-family="Arial" font-size="18" font-weight="bold">
        CHA HAE-IN
      </text>
      <text x="200" y="575" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial" font-size="14">
        ${emotion.toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}