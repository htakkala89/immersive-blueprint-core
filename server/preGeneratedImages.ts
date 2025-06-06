// Scene images using legitimate fantasy artwork sources
export const SCENE_IMAGES = {
  'ancient-door': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1024&h=1024&fit=crop',
  'dragon-chamber': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'magical-lock': 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?q=80&w=1024&h=1024&fit=crop',
  'crystalline-chamber': 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1024&h=1024&fit=crop',
  'mystical-trap': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1024&h=1024&fit=crop',
  'default': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1024&h=1024&fit=crop'
};

export function getSceneImage(gameState: any): string {
  const narration = gameState.narration.toLowerCase();
  
  if (narration.includes("ancient door") || narration.includes("runes")) {
    return SCENE_IMAGES['ancient-door'];
  }
  
  if (narration.includes("dragon") || narration.includes("victory") || narration.includes("combat")) {
    return SCENE_IMAGES['dragon-chamber'];
  }
  
  if (narration.includes("lock") && narration.includes("success")) {
    return SCENE_IMAGES['magical-lock'];
  }
  
  if (narration.includes("chamber") || narration.includes("crystalline")) {
    return SCENE_IMAGES['crystalline-chamber'];
  }
  
  if (narration.includes("shock") || narration.includes("fail") || narration.includes("damage")) {
    return SCENE_IMAGES['mystical-trap'];
  }
  
  return SCENE_IMAGES['default'];
}