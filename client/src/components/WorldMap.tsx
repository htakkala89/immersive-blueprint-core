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
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-purple-950/80 to-black overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.15) 0%, rgba(0, 0, 0, 0.9) 40%, rgba(0, 0, 0, 1) 100%)'
      }}
    >
      {/* Ethereal background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-yellow-500/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-600/8 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-6 right-6 z-[10001] text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Enhanced Header */}
      <div className="absolute top-6 left-6 z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="liquid-glass-enhanced p-6 rounded-2xl border border-purple-400/20 relative shadow-2xl shadow-purple-500/20"
          style={{
            backdropFilter: 'blur(60px) saturate(200%)',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
            borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1)) 1'
          }}
        >
          {/* Flowing Liquid Highlights */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60" />
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-transparent to-yellow-400/10 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3 relative z-10" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
            Monarch's Seoul
          </h2>
          <div className="flex items-center gap-3 text-purple-200 relative z-10">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="capitalize font-medium">{currentTime}</span>
            <div className="w-1 h-4 bg-gradient-to-b from-transparent via-purple-400/50 to-transparent" />
            <span className="text-sm text-purple-300">Ethereal Projection</span>
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
        {/* Ethereal Seoul Background */}
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
          {/* District Shading */}
          <div className="absolute inset-0">
            <div className="absolute" style={{ left: '35%', top: '25%', width: '30%', height: '35%' }}>
              <div className="w-full h-full bg-purple-600/5 rounded-3xl blur-xl" />
              <div className="absolute inset-2 bg-gradient-to-br from-purple-400/8 to-transparent rounded-2xl" />
            </div>
            <div className="absolute" style={{ left: '15%', top: '45%', width: '25%', height: '25%' }}>
              <div className="w-full h-full bg-blue-600/5 rounded-3xl blur-xl" />
              <div className="absolute inset-2 bg-gradient-to-br from-blue-400/8 to-transparent rounded-2xl" />
            </div>
          </div>

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
                {/* Node Base */}
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
                    {/* Inner Glow */}
                    <div className={`
                      absolute inset-1 rounded-full transition-all duration-300
                      ${state === 'locked' 
                        ? 'bg-gray-600/30' 
                        : isPresent 
                          ? 'bg-gradient-to-r from-yellow-300/60 to-orange-400/60' 
                          : 'bg-gradient-to-r from-purple-400/60 to-blue-400/60'
                      }
                    `} />

                    {/* Pulsing Animation */}
                    {state !== 'locked' && (
                      <motion.div
                        className={`absolute inset-0 rounded-full ${
                          isPresent 
                            ? 'bg-gradient-to-r from-yellow-400/40 to-orange-500/40' 
                            : 'bg-gradient-to-r from-purple-500/40 to-blue-500/40'
                        }`}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}

                    {/* Lock Icon */}
                    {state === 'locked' && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-800/80 rounded-full flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-purple-300" />
                      </div>
                    )}

                    {/* Presence Indicator */}
                    {isPresent && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-300"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>

                  {/* Hover Label */}
                  <motion.div
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    whileHover={{ opacity: 1, y: -5 }}
                  >
                    <div className="bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-400/30 whitespace-nowrap">
                      <div className="text-xs text-white font-medium">{location.name}</div>
                      {state === 'locked' && location.unlockCondition && (
                        <div className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {location.unlockCondition}
                        </div>
                      )}
                      {isPresent && (
                        <div className="text-xs text-yellow-300 mt-1 flex items-center gap-1">
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
              {/* Enhanced Location Card */}
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
                {/* Flowing Liquid Border Effects */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-60" />
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/30 to-transparent opacity-40" />
                  <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-purple-400/40 to-transparent opacity-60" />
                  <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-transparent via-purple-400/30 to-transparent opacity-40" />
                  
                  {/* Animated Liquid Highlights */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-400/5 via-transparent to-yellow-400/5"
                    animate={{ 
                      background: [
                        'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, transparent 50%, rgba(251,191,36,0.05) 100%)',
                        'linear-gradient(225deg, rgba(251,191,36,0.05) 0%, transparent 50%, rgba(139,92,246,0.05) 100%)',
                        'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, transparent 50%, rgba(251,191,36,0.05) 100%)'
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

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
                  {/* Enhanced Preview Image - Cha Hae-In Emotional State */}
                  <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden relative group">
                    <motion.img 
                      src={`/api/chat-scene-image?emotion=${chaHaeInLocation === selectedLocation.id ? 'present_confident' : 'absent_contemplative'}&location=${selectedLocation.id}&timeOfDay=${currentTime}`}
                      alt={`Cha Hae-In ${chaHaeInLocation === selectedLocation.id ? 'at' : 'away from'} ${selectedLocation.name}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      whileHover={{ scale: 1.02 }}
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
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-purple-800/30 rounded-2xl hidden items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="text-4xl"
                      >
                        👤
                      </motion.div>
                    </div>
                    
                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    
                    {/* Time Badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-white font-medium border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="capitalize">{currentTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Location Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}>
                        {selectedLocation.name}
                      </h3>
                      <p className="text-purple-200/90 text-sm leading-relaxed">
                        {selectedLocation.description}
                      </p>
                    </div>

                    {/* Atmosphere Section */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-purple-300 text-xs font-medium mb-2 uppercase tracking-wide">
                        Current Atmosphere
                      </div>
                      <div className="text-white text-sm italic leading-relaxed">
                        {selectedLocation.timeOfDayMood[currentTime]}
                      </div>
                    </div>

                    {/* Presence Status */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
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
                        <div className="flex items-center gap-3 text-gray-400">
                          <div className="w-3 h-3 bg-gray-500 rounded-full opacity-50" />
                          <span>Cha Hae-In is not here</span>
                        </div>
                      )}
                    </div>

                    {/* Enhanced Travel Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={handleTravel}
                        disabled={isZooming}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 text-white disabled:opacity-50 rounded-xl font-medium text-base transition-all duration-300 shadow-lg shadow-purple-500/25 border border-purple-400/30"
                        style={{
                          background: isZooming 
                            ? 'linear-gradient(45deg, rgba(139,92,246,0.8), rgba(59,130,246,0.8))'
                            : 'linear-gradient(45deg, rgba(139,92,246,1), rgba(59,130,246,1), rgba(139,92,246,1))'
                        }}
                      >
                        {isZooming ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            />
                            Traveling...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Travel
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
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