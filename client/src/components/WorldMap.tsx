import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    id: 'gangnam_tower',
    name: 'Advanced Training Facility',
    description: 'State-of-the-art combat training complex where hunters hone their skills against simulated monsters.',
    x: 55,
    y: 40,
    unlocked: true,
    district: 'gangnam',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Early training sessions with dedicated hunters',
      afternoon: 'High-intensity training in full swing',
      evening: 'Advanced technique practice sessions',
      night: 'Solo training for elite hunters'
    },
    chaHaeInSchedule: {
      morning: 70,
      afternoon: 90,
      evening: 60,
      night: 30
    }
  },
  {
    id: 'hongdae_cafe',
    name: 'Artisan Coffee House',
    description: 'Trendy café in the heart of Hongdae\'s artistic district. A favorite spot for young hunters to relax.',
    x: 25,
    y: 55,
    unlocked: true,
    district: 'hongdae',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Quiet morning atmosphere with specialty coffee',
      afternoon: 'Bustling with artists and young professionals',
      evening: 'Cozy evening conversations over artisan drinks',
      night: 'Late-night study sessions and intimate talks'
    },
    chaHaeInSchedule: {
      morning: 40,
      afternoon: 20,
      evening: 70,
      night: 30
    }
  },
  {
    id: 'myeongdong_restaurant',
    name: 'Traditional Korean Restaurant',
    description: 'Elegant dining establishment known for its authentic Korean cuisine and private rooms.',
    x: 40,
    y: 50,
    unlocked: true,
    district: 'myeongdong',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Preparing fresh ingredients for the day',
      afternoon: 'Lunch service with business crowds',
      evening: 'Romantic dinner atmosphere with soft lighting',
      night: 'Private dining experiences for special occasions'
    },
    chaHaeInSchedule: {
      morning: 10,
      afternoon: 30,
      evening: 80,
      night: 60
    }
  },
  {
    id: 'chahaein_apartment',
    name: 'Cha Hae-In\'s Apartment',
    description: 'Modern apartment in a quiet residential area. A personal space where deeper connections can form.',
    x: 60,
    y: 30,
    unlocked: false,
    district: 'special',
    image: '/api/placeholder/400/250',
    unlockCondition: 'Develop a close personal relationship',
    requiredAffection: 70,
    timeOfDayMood: {
      morning: 'Peaceful morning routines and quiet moments',
      afternoon: 'Comfortable afternoon relaxation',
      evening: 'Intimate dinner conversations',
      night: 'Private moments and deep conversations'
    },
    chaHaeInSchedule: {
      morning: 90,
      afternoon: 60,
      evening: 85,
      night: 95
    }
  }
];

export function WorldMap({ 
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
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isZooming, setIsZooming] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const getLocationState = (location: Location) => {
    if (!location.unlocked) {
      if (location.requiredAffection && playerAffection < location.requiredAffection) {
        return 'locked';
      }
      if (location.requiredStoryProgress && storyProgress < location.requiredStoryProgress) {
        return 'locked';
      }
    }

    if (chaHaeInLocation === location.id) {
      return 'presence';
    }

    return 'default';
  };

  const getNodeColor = (state: string) => {
    switch (state) {
      case 'locked': return 'bg-gray-600/50 border-gray-500/30';
      case 'presence': return 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-400 shadow-lg shadow-yellow-400/50';
      case 'default': return 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-400 shadow-lg shadow-purple-400/30';
      default: return 'bg-gray-500';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setMapOffset(prev => ({
      x: Math.max(-200, Math.min(200, prev.x + deltaX)),
      y: Math.max(-200, Math.min(200, prev.y + deltaY))
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.8, Math.min(1.5, prev + delta)));
  };

  const handleLocationClick = (location: Location) => {
    const state = getLocationState(location);
    if (state === 'locked') return;
    
    setSelectedLocation(location);
  };

  const handleTravel = () => {
    if (selectedLocation) {
      setIsZooming(true);
      
      const targetX = (50 - selectedLocation.x) * 3;
      const targetY = (50 - selectedLocation.y) * 3;
      
      setZoom(3.0);
      setMapOffset({ x: targetX, y: targetY });
      
      setTimeout(() => {
        onLocationSelect(selectedLocation);
        setSelectedLocation(null);
        setIsZooming(false);
        
        setTimeout(() => {
          setZoom(1);
          setMapOffset({ x: 0, y: 0 });
          onClose();
        }, 200);
      }, 1000);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-900 via-purple-950 to-black"
    >
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-[10001] text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="liquid-glass p-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Seoul Map</h2>
          <div className="flex items-center gap-2 text-purple-200">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">{currentTime}</span>
          </div>
        </motion.div>
      </div>

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
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`
          }}
        >
          {LOCATIONS.map((location) => {
            const state = getLocationState(location);
            const isPresent = chaHaeInLocation === location.id;
            
            return (
              <motion.div
                key={location.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  state === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                }}
                whileHover={state !== 'locked' ? { scale: 1.2 } : {}}
                whileTap={state !== 'locked' ? { scale: 0.9 } : {}}
                onClick={() => handleLocationClick(location)}
              >
                <div className={`
                  w-4 h-4 rounded-full border-2 ${getNodeColor(state)}
                  ${isPresent ? 'animate-pulse' : ''}
                  ${state === 'locked' ? 'opacity-50' : 'opacity-100'}
                `}>
                  {state === 'locked' && (
                    <Lock className="w-3 h-3 text-gray-400 absolute -top-1 -left-1" />
                  )}
                  {isPresent && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-300 animate-ping" />
                  )}
                </div>
                
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/60 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                  {location.name}
                  {state === 'locked' && location.unlockCondition && (
                    <div className="text-xs text-gray-400 mt-1">
                      🔒 {location.unlockCondition}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute top-0 right-0 w-96 h-full z-[10000] overflow-y-auto"
          >
            <div className="liquid-glass-enhanced p-6 rounded-2xl border border-purple-400/20 relative shadow-2xl shadow-purple-500/20 overflow-hidden" style={{
              backdropFilter: 'blur(60px) saturate(200%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
              borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)) 1'
            }}>
              <Button
                onClick={() => setSelectedLocation(null)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-[10001] text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="w-full h-40 rounded-lg mb-4 overflow-hidden relative">
                <img 
                  src={`/api/generate-scene-image?location=${selectedLocation.id}&timeOfDay=${currentTime}&preview=true`}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = target.nextElementSibling as HTMLDivElement;
                    target.style.display = 'none';
                    if (fallback) {
                      fallback.style.display = 'flex';
                      fallback.classList.remove('hidden');
                    }
                  }}
                />
                <div className="w-full h-full bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-lg hidden items-center justify-center">
                  <span className="text-3xl">🏢</span>
                </div>
                
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                  {currentTime}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{selectedLocation.name}</h3>
              <p className="text-purple-200 text-sm mb-4">{selectedLocation.description}</p>

              <div className="mb-4">
                <div className="text-purple-300 text-xs mb-1">Current Atmosphere:</div>
                <div className="text-white text-sm italic">
                  {selectedLocation.timeOfDayMood[currentTime]}
                </div>
              </div>

              <div className="mb-4">
                {chaHaeInLocation === selectedLocation.id ? (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                    Cha Hae-In is here
                  </div>
                ) : (
                  <div className="text-gray-400">Cha Hae-In is not here</div>
                )}
              </div>

              <Button
                onClick={handleTravel}
                disabled={isZooming}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
              >
                {isZooming ? 'Traveling...' : 'Travel'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isZooming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <h3 className="text-xl font-bold mb-2">Traveling to {selectedLocation?.name}</h3>
              <p className="text-purple-300">Zooming into location...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}