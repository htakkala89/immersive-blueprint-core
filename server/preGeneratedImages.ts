// Scene images using cached background for optimal loading
export const SCENE_IMAGES = {
  'start': 'cached-cover',
  'first-meeting': 'cached-cover',
  'stats-check': 'cached-cover', 
  'guild-encounter': 'cached-cover',
  'dungeon-entrance': 'cached-cover',
  'gate-entrance': 'cached-cover',
  'combat-scene': 'cached-cover',
  'romantic-moment': 'cached-cover',
  'daily-life-hub': 'cached-cover',
  'default': 'cached-cover'
};

export function getSceneImage(gameState: any): string {
  const currentScene = gameState.currentScene?.toLowerCase() || '';
  const narration = gameState.narration?.toLowerCase() || '';
  
  // Map specific scenes to cached images for instant loading
  if (currentScene.includes('start') || currentScene.includes('beginning')) {
    return SCENE_IMAGES['start'];
  }
  
  if (currentScene.includes('first') || currentScene.includes('meeting') || narration.includes('first time')) {
    return SCENE_IMAGES['first-meeting'];
  }
  
  if (currentScene.includes('stats') || currentScene.includes('check') || narration.includes('abilities')) {
    return SCENE_IMAGES['stats-check'];
  }
  
  if (currentScene.includes('gate') || currentScene.includes('entrance') || narration.includes('dungeon')) {
    return SCENE_IMAGES['gate-entrance'];
  }
  
  if (currentScene.includes('combat') || currentScene.includes('battle') || narration.includes('fight')) {
    return SCENE_IMAGES['combat-scene'];
  }
  
  if (currentScene.includes('romance') || currentScene.includes('love') || narration.includes('heart')) {
    return SCENE_IMAGES['romantic-moment'];
  }
  
  if (currentScene.includes('daily') || currentScene.includes('hub') || narration.includes('living together')) {
    return SCENE_IMAGES['daily-life-hub'];
  }
  
  return SCENE_IMAGES['default'];
}