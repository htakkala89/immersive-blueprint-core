import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Location {
  id: string;
  name: string;
  description: string;
  x: number; // Position on map (percentage)
  y: number; // Position on map (percentage)
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
    morning: number; // 0-100 probability
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

// Seoul locations with realistic positioning
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
      morning: 'Busy with morning briefings and mission assignments',
      afternoon: 'Peak activity with hunters coming and going',
      evening: 'Quieter, with only dedicated staff remaining',
      night: 'Nearly empty, emergency personnel only'
    },
    chaHaeInSchedule: {
      morning: 30,
      afternoon: 85,
      evening: 25,
      night: 5
    }
  },
  {
    id: 'training_facility',
    name: 'Advanced Training Facility',
    description: 'State-of-the-art combat training complex where hunters hone their skills against simulated monsters.',
    x: 52,
    y: 42,
    unlocked: true,
    district: 'gangnam',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Fresh energy, hunters warming up for intense sessions',
      afternoon: 'High-intensity training in full swing',
      evening: 'Cool-down sessions and technique refinement',
      night: 'Closed for regular training'
    },
    chaHaeInSchedule: {
      morning: 70,
      afternoon: 40,
      evening: 60,
      night: 0
    }
  },
  {
    id: 'chahaein_apartment',
    name: "Cha Hae-In's Apartment",
    description: 'A elegant, minimalist apartment in an upscale district. Her private sanctuary away from the hunter world.',
    x: 38,
    y: 28,
    unlocked: false,
    district: 'gangnam',
    image: '/api/placeholder/400/250',
    unlockCondition: 'Reach 70+ affection with Cha Hae-In',
    requiredAffection: 70,
    timeOfDayMood: {
      morning: 'Soft morning light through large windows, peaceful atmosphere',
      afternoon: 'Quiet and serene, perfect for intimate conversations',
      evening: 'Warm ambient lighting, cozy and romantic',
      night: 'Intimate and private, only for those she truly trusts'
    },
    chaHaeInSchedule: {
      morning: 80,
      afternoon: 20,
      evening: 70,
      night: 95
    }
  },
  {
    id: 'hangang_park',
    name: 'Hangang Park',
    description: 'A scenic riverside park offering breathtaking views of Seoul. Perfect for quiet walks and heartfelt conversations.',
    x: 35,
    y: 55,
    unlocked: true,
    district: 'special',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Fresh air and joggers, peaceful start to the day',
      afternoon: 'Families and couples enjoying picnics under the sun',
      evening: 'Romantic sunset views over the Han River',
      night: 'Quiet and intimate under the city lights'
    },
    chaHaeInSchedule: {
      morning: 25,
      afternoon: 15,
      evening: 45,
      night: 20
    }
  },
  {
    id: 'hongdae_cafe',
    name: 'Hongdae Coffee District',
    description: 'Trendy coffee shops and cozy cafes where hunters often meet for casual conversations away from work.',
    x: 25,
    y: 40,
    unlocked: true,
    district: 'hongdae',
    image: '/api/placeholder/400/250',
    timeOfDayMood: {
      morning: 'Aromatic coffee and quiet morning conversations',
      afternoon: 'Bustling with students and young professionals',
      evening: 'Artistic atmosphere with live music and intimate lighting',
      night: 'Cozy late-night study spots and deep conversations'
    },
    chaHaeInSchedule: {
      morning: 40,
      afternoon: 30,
      evening: 35,
      night: 15
    }
  },
  {
    id: 'myeongdong_restaurant',
    name: 'Myeongdong Fine Dining',
    description: 'Upscale restaurants perfect for special occasions and romantic dinners.',
    x: 42,
    y: 48,
    unlocked: false,
    district: 'myeongdong',
    image: '/api/placeholder/400/250',
    unlockCondition: 'Plan a special date with Cha Hae-In',
    requiredAffection: 40,
    timeOfDayMood: {
      morning: 'Closed for preparation',
      afternoon: 'Elegant lunch service for business meetings',
      evening: 'Romantic dinner atmosphere with soft lighting',
      night: 'Intimate late-night dining for special occasions'
    },
    chaHaeInSchedule: {
      morning: 0,
      afternoon: 10,
      evening: 60,
      night: 30
    }
  },
  {
    id: 'secret_dungeon_entrance',
    name: 'Hidden Gate Entrance',
    description: 'A mysterious portal that appears only to the Shadow Monarch. Gateway to dangerous but rewarding adventures.',
    x: 65,
    y: 30,
    unlocked: false,
    district: 'special',
    image: '/api/placeholder/400/250',
    unlockCondition: 'Unlock Shadow Monarch powers',
    requiredStoryProgress: 5,
    timeOfDayMood: {
      morning: 'Ethereal energy visible in morning mist',
      afternoon: 'Portal energy dims in bright daylight',
      evening: 'Glowing intensely as shadows lengthen',
      night: 'Peak portal activity, darkness amplifies the gate'
    },
    chaHaeInSchedule: {
      morning: 5,
      afternoon: 15,
      evening: 25,
      night: 10
    }
  },
  {
    id: 'seoul_tower',
    name: 'N Seoul Tower Observatory',
    description: 'The highest point in Seoul, offering panoramic city views. A symbol of the city where important moments unfold.',
    x: 40,
    y: 45,
    unlocked: false,
    district: 'special',
    image: '/api/placeholder/400/250',
    unlockCondition: 'Reach a major relationship milestone',
    requiredAffection: 85,
    timeOfDayMood: {
      morning: 'Clear morning views across all of Seoul',
      afternoon: 'Busy with tourists and sightseers',
      evening: 'Breathtaking sunset views over the metropolis',
      night: 'Romantic city lights stretching to the horizon'
    },
    chaHaeInSchedule: {
      morning: 10,
      afternoon: 20,
      evening: 80,
      night: 50
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
  const mapRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const getLocationState = (location: Location) => {
    // Check if location is unlocked
    if (!location.unlocked) {
      if (location.requiredAffection && playerAffection < location.requiredAffection) {
        return 'locked';
      }
      if (location.requiredStoryProgress && storyProgress < location.requiredStoryProgress) {
        return 'locked';
      }
    }

    // Check if Cha Hae-In is present
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

  const [isZooming, setIsZooming] = useState(false);

  const handleTravel = () => {
    if (selectedLocation) {
      setIsZooming(true);
      
      // Calculate center offset for the selected location
      const targetX = (50 - selectedLocation.x) * 3;
      const targetY = (50 - selectedLocation.y) * 3;
      
      // Animate zoom and pan to location
      setZoom(3.0);
      setMapOffset({ x: targetX, y: targetY });
      
      // Wait for zoom animation then travel
      setTimeout(() => {
        onLocationSelect(selectedLocation);
        setSelectedLocation(null);
        setIsZooming(false);
        
        // Reset map state for next visit
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
      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-[10001] text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Map Title */}
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

      {/* Map Container */}
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
        {/* Stylized Seoul Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translate(${mapOffset.x}px, ${mapOffset.y}px) scale(${zoom})`,
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)
            `
          }}
        >
          {/* Location Nodes */}
          {LOCATIONS.map((location) => {
            const state = getLocationState(location);
            const isPresent = chaHaeInLocation === location.id;
            
            return (
              <motion.div
                key={location.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * LOCATIONS.indexOf(location) }}
                className="absolute"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Presence Aura */}
                {isPresent && (
                  <motion.div
                    className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400/30 to-orange-500/30 -translate-x-1/2 -translate-y-1/2 blur-lg"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Node */}
                <motion.button
                  onClick={() => handleLocationClick(location)}
                  disabled={state === 'locked'}
                  className={`
                    relative w-8 h-8 rounded-full border-2 transition-all duration-300
                    ${getNodeColor(state)}
                    ${state === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
                  `}
                  whileHover={state !== 'locked' ? { scale: 1.2 } : {}}
                  whileTap={state !== 'locked' ? { scale: 0.95 } : {}}
                >
                  {state === 'locked' && (
                    <Lock className="w-4 h-4 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                  
                  {/* Pulsing effect for accessible nodes */}
                  {state !== 'locked' && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-current opacity-20"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0, 0.2]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.button>

                {/* Location Label */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-center">
                  <span className="text-xs text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded whitespace-nowrap">
                    {location.name}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dismissible Overlay */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[15]"
            onClick={() => setSelectedLocation(null)}
          />
        )}
      </AnimatePresence>

      {/* Location Card */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="absolute bottom-6 left-6 right-6 max-w-lg mx-auto z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="liquid-glass-enhanced p-6 rounded-2xl border border-purple-400/20 relative shadow-2xl shadow-purple-500/20 overflow-hidden" style={{
              backdropFilter: 'blur(60px) saturate(200%)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
              borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)) 1'
            }}>
              {/* Flowing Liquid Highlights */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-blue-400/10 animate-pulse" />
              </div>
              
              {/* Subtle Distortion Effect */}
              <div className="absolute inset-0 rounded-2xl" style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(168,85,247,0.1) 0%, transparent 50%)'
              }} />
              {/* Close Button */}
              <Button
                onClick={() => setSelectedLocation(null)}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-[10001] text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>

              {/* Location Preview Image */}
              <div className="w-full h-40 rounded-lg mb-4 overflow-hidden relative">
                <img 
                  src={`/api/generate-scene-image?location=${selectedLocation.id}&timeOfDay=${currentTime}&preview=true`}
                  alt={selectedLocation.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient background if image fails to load
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
                
                {/* Time of Day Overlay */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                  {currentTime}
                </div>
                
                {/* Atmospheric Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Location Info */}
              <h3 className="text-xl font-bold text-white mb-2">{selectedLocation.name}</h3>
              <p className="text-purple-200 text-sm mb-4">{selectedLocation.description}</p>

              {/* Current Mood */}
              <div className="mb-4">
                <div className="text-purple-300 text-xs mb-1">Current Atmosphere:</div>
                <div className="text-white text-sm italic">
                  {selectedLocation.timeOfDayMood[currentTime]}
                </div>
              </div>

              {/* Presence Info */}
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

              {/* Travel Button */}
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

      {/* Zoom Travel Overlay */}
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

      {/* Map Controls */}
      <div className="absolute bottom-4 right-4 z-10 space-y-2">
        <Button
          onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
          variant="outline"
          size="sm"
          className="w-10 h-10 text-white border-white/30 hover:bg-white/10"
        >
          +
        </Button>
        <Button
          onClick={() => setZoom(prev => Math.max(0.8, prev - 0.1))}
          variant="outline"
          size="sm"
          className="w-10 h-10 text-white border-white/30 hover:bg-white/10"
        >
          -
        </Button>
      </div>
    </motion.div>
  );
}