import { generateLocationSceneImage } from './imageGenerator';

// Define all locations and times for preloading
const LOCATIONS = [
  'hunter_association',
  'chahaein_apartment', 
  'hongdae_cafe',
  'myeongdong_restaurant'
];

const TIME_PERIODS = ['morning', 'afternoon', 'evening', 'night'];

// Cache for preloaded images
const imageCache = new Map<string, string>();

// Generate cache key
function getCacheKey(location: string, timeOfDay: string): string {
  return `${location}_${timeOfDay}`;
}

// Preload all location images during startup
export async function preloadLocationImages(): Promise<void> {
  console.log('🚀 Starting location image preloading...');
  
  const preloadPromises: Promise<void>[] = [];
  
  for (const location of LOCATIONS) {
    for (const timeOfDay of TIME_PERIODS) {
      const promise = preloadSingleImage(location, timeOfDay);
      preloadPromises.push(promise);
      
      // Add small delay between requests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  try {
    await Promise.all(preloadPromises);
    console.log(`✅ Successfully preloaded ${LOCATIONS.length * TIME_PERIODS.length} location images`);
  } catch (error) {
    console.error('❌ Error during image preloading:', error);
  }
}

// Preload a single image and cache it
async function preloadSingleImage(location: string, timeOfDay: string): Promise<void> {
  try {
    const cacheKey = getCacheKey(location, timeOfDay);
    
    console.log(`📸 Preloading: ${location} at ${timeOfDay}`);
    const imageUrl = await generateLocationSceneImage(location, timeOfDay);
    
    if (imageUrl) {
      imageCache.set(cacheKey, imageUrl);
      console.log(`✅ Cached: ${cacheKey}`);
    } else {
      console.log(`⚠️  Failed to generate: ${cacheKey}`);
    }
  } catch (error) {
    console.error(`❌ Error preloading ${location} at ${timeOfDay}:`, error);
  }
}

// Get cached image or generate if not available
export function getCachedLocationImage(location: string, timeOfDay: string): string | null {
  const cacheKey = getCacheKey(location, timeOfDay);
  return imageCache.get(cacheKey) || null;
}

// Check if image is cached
export function isImageCached(location: string, timeOfDay: string): boolean {
  const cacheKey = getCacheKey(location, timeOfDay);
  return imageCache.has(cacheKey);
}

// Get cache statistics
export function getCacheStats(): { total: number; cached: number; percentage: number } {
  const total = LOCATIONS.length * TIME_PERIODS.length;
  const cached = imageCache.size;
  const percentage = Math.round((cached / total) * 100);
  
  return { total, cached, percentage };
}

// Manually add image to cache (for runtime generation)
export function cacheLocationImage(location: string, timeOfDay: string, imageUrl: string): void {
  const cacheKey = getCacheKey(location, timeOfDay);
  imageCache.set(cacheKey, imageUrl);
}