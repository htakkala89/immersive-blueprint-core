import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Component to fetch and display generated location scene images
const LocationSceneImage = ({ locationId, timeOfDay }: { locationId: string; timeOfDay: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<{ cached: number; total: number; percentage: number } | null>(null);

  useEffect(() => {
    // Check cache status first
    const checkCacheStatus = async () => {
      try {
        const response = await fetch('/api/cache-status');
        const status = await response.json();
        setCacheStatus(status);
      } catch (error) {
        console.log('Failed to check cache status');
      }
    };

    const fetchLocationImage = async () => {
      try {
        const response = await fetch('/api/generate-scene-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: locationId,
            timeOfDay
          })
        });
        
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.log('Failed to load location image');
      } finally {
        setLoading(false);
      }
    };

    checkCacheStatus();
    fetchLocationImage();
  }, [locationId, timeOfDay]);

  if (loading) {
    return (
      <div className="w-full h-48 rounded-2xl mb-6 bg-gradient-to-br from-purple-600/20 via-blue-600/15 to-purple-800/20 flex flex-col items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl mb-3"
        >
          🏢
        </motion.div>
        {cacheStatus && (
          <div className="text-xs text-purple-300 text-center">
            <div className="mb-1">Loading scene...</div>
            <div className="text-purple-400">
              Cache: {cacheStatus.cached}/{cacheStatus.total} ({cacheStatus.percentage}%)
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden relative group">
      {imageUrl ? (
        <motion.img 
          src={imageUrl}
          alt={`${locationId} at ${timeOfDay}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          whileHover={{ scale: 1.02 }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-purple-800/30 rounded-2xl flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-4xl"
          >
            🏢
          </motion.div>
        </div>
      )}
      
      {/* Image Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      
      {/* Time Badge */}
      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-medium border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          <span className="capitalize">{timeOfDay}</span>
        </div>
      </div>
    </div>
  );
};

interface Location {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  unlocked: boolean;
  unlockCondition?: string;
  district: 'gangnam' | 'hongdae' | 'myeongdong' | 'itaewon' | 'dongdaemun' | 'special';
  image: string;
  ambientSound?: string;
  timeOfDayMood: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  chaHaeInSchedule: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  requiredAffection?: number;
  requiredStoryProgress?: number;
}

interface WorldMapProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  currentTime: 'morning' | 'afternoon' | 'evening' | 'night';
  chaHaeInLocation: string | null;
  playerAffection: number;
  storyProgress: number;
}

const LOCATIONS: Location[] = [
  {
    id: 'hunter_association',
    name: 'Hunter Association Guild Hall',
    description: 'The nerve center of all hunter activities in Korea. A towering glass structure where hunters gather for missions and training.',
    x: 45,
    y: 35,
    unlocked: true,
    district: 'gangnam',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Busy with early morning briefings and mission assignments',
      afternoon: 'Peak activity with hunters coming and going',
      evening: 'Winding down but still active with late missions',
      night: 'Quiet hours with only emergency operations'
    },
    chaHaeInSchedule: {
      morning: 80,
      afternoon: 60,
      evening: 40,
      night: 20
    }
  },
  {
    id: 'chahaein_apartment',
    name: 'Cha Hae-In\'s Apartment',
    description: 'A peaceful sanctuary where Korea\'s top female hunter finds solace away from the chaos of gate raids and guild politics.',
    x: 65,
    y: 25,
    unlocked: false,
    unlockCondition: 'Reach 60+ affection with Cha Hae-In',
    requiredAffection: 60,
    district: 'gangnam',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Peaceful morning routine with coffee and stretching',
      afternoon: 'Quiet reading time or light training',
      evening: 'Relaxing evening with herbal tea',
      night: 'Deep, restful sleep in familiar surroundings'
    },
    chaHaeInSchedule: {
      morning: 90,
      afternoon: 20,
      evening: 80,
      night: 95
    }
  },
  {
    id: 'hongdae_cafe',
    name: 'Artisan Coffee & Books',
    description: 'A cozy hideaway in the heart of Hongdae where the aroma of freshly ground coffee mingles with the quiet turning of pages.',
    x: 25,
    y: 50,
    unlocked: true,
    district: 'hongdae',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Fresh pastries and morning coffee ritual',
      afternoon: 'Busy student crowd and lively conversations',
      evening: 'Intimate atmosphere with soft jazz music',
      night: 'Late night study sessions and quiet contemplation'
    },
    chaHaeInSchedule: {
      morning: 30,
      afternoon: 70,
      evening: 60,
      night: 40
    }
  },
  {
    id: 'myeongdong_restaurant',
    name: 'Traditional Korean BBQ House',
    description: 'An authentic dining experience where premium marbled beef sizzles over charcoal grills, creating memories over shared meals.',
    x: 55,
    y: 60,
    unlocked: true,
    district: 'myeongdong',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Preparation for the day ahead with traditional breakfast',
      afternoon: 'Lunch rush with business crowd',
      evening: 'Romantic dinner atmosphere with soft lighting',
      night: 'Late night conversations over soju'
    },
    chaHaeInSchedule: {
      morning: 20,
      afternoon: 40,
      evening: 90,
      night: 30
    }
  }
];

export default function WorldMap({ 
  isVisible, 
  onClose, 
  onLocationSelect, 
  currentTime, 
  chaHaeInLocation, 
  playerAffection, 
  storyProgress 
}: WorldMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const getLocationState = (location: Location) => {
    if (location.requiredAffection && playerAffection < location.requiredAffection) return 'locked';
    if (location.requiredStoryProgress && storyProgress < location.requiredStoryProgress) return 'locked';
    return location.unlocked ? 'unlocked' : 'locked';
  };

  const handleLocationClick = (location: Location) => {
    if (getLocationState(location) !== 'locked') {
      setSelectedLocation(location);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setMapOffset(prev => ({
      x: Math.max(-500, Math.min(500, prev.x + deltaX)),
      y: Math.max(-300, Math.min(300, prev.y + deltaY))
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.5, Math.min(2, zoom + (e.deltaY > 0 ? -0.1 : 0.1)));
    setZoom(newZoom);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Enhanced Liquid Glassmorphism Background - Full Coverage */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        style={{
          backdropFilter: 'blur(120px) saturate(300%)',
          background: `
            linear-gradient(135deg, 
              rgba(0, 0, 0, 0.85) 0%, 
              rgba(30, 41, 59, 0.8) 15%,
              rgba(139, 92, 246, 0.25) 30%,
              rgba(30, 41, 59, 0.75) 45%,
              rgba(59, 130, 246, 0.2) 60%,
              rgba(30, 41, 59, 0.8) 75%,
              rgba(0, 0, 0, 0.85) 100%
            ),
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 60%),
            radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.18) 0%, transparent 60%)
          `
        }}
      />

      {/* Floating Header with Liquid Design */}
      <div className="absolute top-8 left-8 z-[10001]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-purple-400/30 px-8 py-4"
          style={{
            backdropFilter: 'blur(80px) saturate(200%)',
            background: `
              linear-gradient(135deg, 
                rgba(255,255,255,0.2) 0%, 
                rgba(255,255,255,0.1) 25%,
                rgba(139,92,246,0.1) 50%,
                rgba(255,255,255,0.05) 75%,
                rgba(255,255,255,0.15) 100%
              )
            `
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10">
            Monarch's Seoul
          </h2>
          <div className="flex items-center gap-3 text-purple-200 relative z-10">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="capitalize font-medium">{currentTime}</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Map Container */}
      <div
        ref={mapRef}
        className="absolute inset-0 overflow-hidden cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`,
            background: `
              radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 50% 70%, rgba(168, 85, 247, 0.05) 0%, transparent 50%),
              linear-gradient(45deg, transparent 30%, rgba(139, 92, 246, 0.03) 50%, transparent 70%)
            `
          }}
        >
          {/* Enhanced Location Nodes */}
          {LOCATIONS.map((location) => {
            const state = getLocationState(location);
            const isPresent = chaHaeInLocation === location.id;
            
            return (
              <motion.div
                key={location.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
                  state === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                }}
                whileHover={state !== 'locked' ? { scale: 1.3 } : { scale: 1.05 }}
                whileTap={state !== 'locked' ? { scale: 0.9 } : {}}
                onClick={() => handleLocationClick(location)}
              >
                <div className="relative">
                  {/* Presence Aura */}
                  {isPresent && (
                    <motion.div
                      className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400/30 via-yellow-500/20 to-orange-400/30 blur-md" />
                    </motion.div>
                  )}

                  {/* Main Node */}
                  <div className={`
                    relative w-6 h-6 rounded-full border-2 transition-all duration-300
                    ${state === 'locked' 
                      ? 'bg-gray-700/50 border-gray-600/30 opacity-50' 
                      : isPresent 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 shadow-lg shadow-yellow-400/50' 
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-300 shadow-lg shadow-purple-400/30'
                    }
                  `}>
                    {/* Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {state === 'locked' ? (
                        <Lock className="w-3 h-3 text-gray-400" />
                      ) : (
                        <MapPin className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Always Visible Location Label */}
                  <motion.div
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-30"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + Math.random() * 0.2 }}
                  >
                    <div 
                      className="text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-xl text-center"
                      style={{
                        backdropFilter: 'blur(40px) saturate(200%)',
                        background: `
                          linear-gradient(135deg, 
                            rgba(0, 0, 0, 0.8) 0%, 
                            rgba(30, 41, 59, 0.7) 25%,
                            rgba(0, 0, 0, 0.75) 50%,
                            rgba(15, 23, 42, 0.8) 75%,
                            rgba(0, 0, 0, 0.75) 100%
                          )
                        `,
                        border: '1px solid rgba(139, 92, 246, 0.4)'
                      }}
                    >
                      <div className="font-medium">{location.name}</div>
                      {state === 'locked' && location.unlockCondition && (
                        <div className="text-gray-400 text-xs mt-1">
                          {location.unlockCondition}
                        </div>
                      )}
                      {isPresent && (
                        <div className="text-xs text-yellow-300 mt-1 flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                          Cha Hae-In is here
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 w-96 h-full z-[10000] overflow-y-auto p-6"
          >
            <div className="relative h-full">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl border border-purple-400/30 shadow-2xl shadow-purple-500/20"
                style={{
                  backdropFilter: 'blur(80px) saturate(200%)',
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.15) 0%, 
                      rgba(255,255,255,0.05) 25%,
                      rgba(139,92,246,0.08) 50%,
                      rgba(255,255,255,0.03) 75%,
                      rgba(255,255,255,0.08) 100%
                    )
                  `
                }}
              >
                {/* Close Button */}
                <Button
                  onClick={() => setSelectedLocation(null)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-[10001] text-white/80 hover:text-white hover:bg-white/10 w-8 h-8 p-0 rounded-full backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </Button>

                <div className="p-8 relative z-10">
                  {/* Generated Location Scene Image */}
                  <LocationSceneImage 
                    locationId={selectedLocation.id}
                    timeOfDay={currentTime}
                  />

                  {/* Enhanced Location Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {selectedLocation.name}
                      </h3>
                      <p className="text-purple-200/90 text-sm leading-relaxed">
                        {selectedLocation.description}
                      </p>
                    </div>

                    {/* Atmosphere Section - Maximum Readability Frosted Glass */}
                    <div 
                      className="rounded-xl p-4"
                      style={{
                        backdropFilter: 'blur(120px) saturate(300%)',
                        background: `
                          linear-gradient(135deg, 
                            rgba(0, 0, 0, 0.6) 0%, 
                            rgba(30, 41, 59, 0.5) 25%,
                            rgba(139, 92, 246, 0.2) 50%,
                            rgba(30, 41, 59, 0.45) 75%,
                            rgba(0, 0, 0, 0.55) 100%
                          ),
                          linear-gradient(45deg, 
                            rgba(255, 255, 255, 0.1) 0%, 
                            rgba(255, 255, 255, 0.05) 50%,
                            rgba(255, 255, 255, 0.08) 100%
                          )
                        `,
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <div className="text-purple-300 text-xs font-medium mb-2 uppercase tracking-wide">
                        Current Atmosphere
                      </div>
                      <div className="text-white text-sm italic leading-relaxed">
                        {selectedLocation.timeOfDayMood[currentTime]}
                      </div>
                    </div>

                    {/* Presence Status - Maximum Readability Frosted Glass */}
                    <div 
                      className="rounded-xl p-4"
                      style={{
                        backdropFilter: 'blur(120px) saturate(300%)',
                        background: `
                          linear-gradient(135deg, 
                            rgba(0, 0, 0, 0.6) 0%, 
                            rgba(30, 41, 59, 0.5) 25%,
                            rgba(139, 92, 246, 0.2) 50%,
                            rgba(30, 41, 59, 0.45) 75%,
                            rgba(0, 0, 0, 0.55) 100%
                          ),
                          linear-gradient(45deg, 
                            rgba(255, 255, 255, 0.1) 0%, 
                            rgba(255, 255, 255, 0.05) 50%,
                            rgba(255, 255, 255, 0.08) 100%
                          )
                        `,
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {chaHaeInLocation === selectedLocation.id ? (
                        <motion.div 
                          className="flex items-center gap-3 text-yellow-400"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <div className="relative">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-3 h-3 bg-yellow-400/40 rounded-full animate-ping" />
                          </div>
                          <span className="font-medium">Cha Hae-In is here</span>
                        </motion.div>
                      ) : (
                        <div className="text-gray-400 text-sm">
                          Cha Hae-In is not currently here
                        </div>
                      )}
                    </div>

                    {/* Travel Button - Maximum Readability Frosted Glass */}
                    <motion.button
                      onClick={() => {
                        onLocationSelect(selectedLocation);
                        setSelectedLocation(null);
                      }}
                      className="w-full text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50"
                      style={{
                        backdropFilter: 'blur(120px) saturate(300%)',
                        background: getLocationState(selectedLocation) === 'locked' 
                          ? `
                            linear-gradient(135deg, 
                              rgba(0, 0, 0, 0.7) 0%, 
                              rgba(75, 85, 99, 0.6) 25%,
                              rgba(107, 114, 128, 0.5) 50%,
                              rgba(75, 85, 99, 0.6) 75%,
                              rgba(0, 0, 0, 0.7) 100%
                            ),
                            linear-gradient(45deg, 
                              rgba(255, 255, 255, 0.08) 0%, 
                              rgba(255, 255, 255, 0.04) 50%,
                              rgba(255, 255, 255, 0.06) 100%
                            )
                          `
                          : `
                            linear-gradient(135deg, 
                              rgba(139, 92, 246, 0.9) 0%, 
                              rgba(124, 58, 237, 0.8) 25%,
                              rgba(59, 130, 246, 0.8) 50%,
                              rgba(124, 58, 237, 0.8) 75%,
                              rgba(139, 92, 246, 0.9) 100%
                            ),
                            linear-gradient(45deg, 
                              rgba(255, 255, 255, 0.15) 0%, 
                              rgba(255, 255, 255, 0.08) 50%,
                              rgba(255, 255, 255, 0.12) 100%
                            )
                          `,
                        border: '1px solid rgba(255, 255, 255, 0.5)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                      }}
                      whileHover={getLocationState(selectedLocation) !== 'locked' ? {
                        scale: 1.02,
                        background: `
                          linear-gradient(135deg, 
                            rgba(139, 92, 246, 1) 0%, 
                            rgba(124, 58, 237, 0.9) 25%,
                            rgba(59, 130, 246, 0.9) 50%,
                            rgba(124, 58, 237, 0.9) 75%,
                            rgba(139, 92, 246, 1) 100%
                          ),
                          linear-gradient(45deg, 
                            rgba(255, 255, 255, 0.2) 0%, 
                            rgba(255, 255, 255, 0.1) 50%,
                            rgba(255, 255, 255, 0.15) 100%
                          )
                        `,
                        boxShadow: '0 12px 40px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                      } : {}}
                      whileTap={{ scale: 0.98 }}
                      disabled={getLocationState(selectedLocation) === 'locked'}
                    >
                      {getLocationState(selectedLocation) === 'locked' ? 'Locked' : 'Travel Here'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}