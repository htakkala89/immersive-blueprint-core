// Asset-based image service using existing attached assets
export function getAssetLocationImage(location: string, timeOfDay: string, weather?: string): string | null {
  // Map locations to appropriate existing assets
  const locationAssetMap: Record<string, string[]> = {
    hunter_association: [
      '/attached_assets/image_1749547676566.png',
      '/attached_assets/image_1749548558027.png',
      '/attached_assets/image_1749544106450.png'
    ],
    player_apartment: [
      '/attached_assets/image_1749550741541.png',
      '/attached_assets/image_1749550822271.png',
      '/attached_assets/image_1749565005477.png'
    ],
    chahaein_apartment: [
      '/attached_assets/image_1749563222792.png',
      '/attached_assets/image_1749563289311.png',
      '/attached_assets/image_1749565092591.png'
    ],
    hongdae_cafe: [
      '/attached_assets/image_1749569043354.png',
      '/attached_assets/image_1749570502945.png',
      '/attached_assets/image_1749571224907.png'
    ],
    myeongdong_restaurant: [
      '/attached_assets/image_1749572413531.png',
      '/attached_assets/image_1749572578131.png',
      '/attached_assets/image_1749573087992.png'
    ]
  };

  const assets = locationAssetMap[location];
  if (!assets || assets.length === 0) {
    return null;
  }

  // Select asset based on time of day (using hash for consistency)
  const timeIndex = {
    morning: 0,
    afternoon: 1,
    evening: 2,
    night: 0
  };

  const index = timeIndex[timeOfDay as keyof typeof timeIndex] || 0;
  return assets[index % assets.length];
}

export function getAssetCharacterImage(emotion: string): string | null {
  // Map emotions to character portrait assets
  const emotionAssetMap: Record<string, string[]> = {
    romantic_anticipation: [
      '/attached_assets/image_1749577843797.png',
      '/attached_assets/image_1749578564439.png'
    ],
    professional_friendly: [
      '/attached_assets/image_1749584194512.png',
      '/attached_assets/image_1749585595355.png'
    ],
    focused_professional: [
      '/attached_assets/image_1749586382709.png',
      '/attached_assets/image_1749589683420.png'
    ],
    warm_welcoming: [
      '/attached_assets/image_1749591019602.png',
      '/attached_assets/image_1749593857939.png'
    ]
  };

  const assets = emotionAssetMap[emotion];
  if (!assets || assets.length === 0) {
    // Default to first professional asset
    return '/attached_assets/image_1749584194512.png';
  }

  // Rotate through available assets
  return assets[Math.floor(Math.random() * assets.length)];
}