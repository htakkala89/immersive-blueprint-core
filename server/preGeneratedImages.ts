// Pre-generated Solo Leveling style images to work around API rate limits
export const SCENE_IMAGES = {
  'ancient-door': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'dragon-chamber': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'magical-lock': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'crystalline-chamber': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'mystical-trap': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop',
  'default': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1024&h=1024&fit=crop'
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