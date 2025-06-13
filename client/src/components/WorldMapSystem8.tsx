import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Lock, MapPin, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationNode {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  state: 'default' | 'presence' | 'quest' | 'locked' | 'gate';
  unlockCondition?: string;
  gateRank?: 'C' | 'B' | 'A' | 'S';
  atmosphere?: string;
}

interface ZonePanel {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  locations: LocationNode[];
}

interface WorldMapSystem8Props {
  isVisible: boolean;
  onClose: () => void;
  onLocationSelect: (locationId: string) => void;
  currentTime: 'morning' | 'afternoon' | 'evening' | 'night';
  chaHaeInLocation: string;
  playerAffection: number;
  storyProgress: number;
  activeQuests?: string[];
}

export function WorldMapSystem8({
  isVisible,
  onClose,
  onLocationSelect,
  currentTime,
  chaHaeInLocation,
  playerAffection,
  storyProgress,
  activeQuests = []
}: WorldMapSystem8Props) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusedZone, setFocusedZone] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);
  const [locationImage, setLocationImage] = useState<string | null>(null);

  // Responsive grid system for different screen sizes
  const getResponsiveLayout = () => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    if (screenWidth < 640) { // Mobile
      return {
        grid: { cols: 1, rows: 5 },
        zoneSize: { width: 85, height: 16 },
        gap: 2
      };
    } else if (screenWidth < 1024) { // Tablet
      return {
        grid: { cols: 2, rows: 3 },
        zoneSize: { width: 45, height: 28 },
        gap: 5
      };
    } else { // Desktop
      return {
        grid: { cols: 2, rows: 3 },
        zoneSize: { width: 40, height: 40 },
        gap: 8
      };
    }
  };

  // Anti-overlap positioning system with responsive touch targets
  const applyAntiOverlapPositions = (locations: LocationNode[]): LocationNode[] => {
    if (locations.length <= 1) return locations;
    
    const layout = getResponsiveLayout();
    const isMobile = layout.grid.cols === 1;
    
    const SAFE_POSITIONS = isMobile ? [
      { x: 15, y: 20 },   // Mobile: Left-aligned
      { x: 85, y: 20 },   // Mobile: Right-aligned
      { x: 50, y: 50 },   // Mobile: Center
      { x: 15, y: 80 },   // Mobile: Bottom-left
      { x: 85, y: 80 }    // Mobile: Bottom-right
    ] : [
      { x: 10, y: 15 },   // Desktop: Top-left
      { x: 90, y: 15 },   // Desktop: Top-right  
      { x: 10, y: 85 },   // Desktop: Bottom-left
      { x: 90, y: 85 },   // Desktop: Bottom-right
      { x: 50, y: 15 },   // Desktop: Top-center
      { x: 50, y: 85 },   // Desktop: Bottom-center
      { x: 10, y: 50 },   // Desktop: Left-center
      { x: 90, y: 50 },   // Desktop: Right-center
      { x: 30, y: 30 },   // Desktop: Inner positions
      { x: 70, y: 30 },
      { x: 30, y: 70 },
      { x: 70, y: 70 }
    ];
    
    return locations.map((location, index) => ({
      ...location,
      position: SAFE_POSITIONS[index % SAFE_POSITIONS.length]
    }));
  };

  // Generate responsive zone layout
  const generateResponsiveZones = (): ZonePanel[] => {
    const layout = getResponsiveLayout();
    const { grid, zoneSize, gap } = layout;
    
    const calculatePosition = (index: number) => {
      if (grid.cols === 1) { // Mobile: vertical stack
        return {
          x: (100 - zoneSize.width) / 2,
          y: gap + (index * (zoneSize.height + gap))
        };
      } else { // Desktop/Tablet: 2x3 grid
        const row = Math.floor(index / grid.cols);
        const col = index % grid.cols;
        return {
          x: gap + (col * (zoneSize.width + gap)),
          y: gap + (row * (zoneSize.height + gap))
        };
      }
    };

    return [
      {
        id: 'hongdae',
        name: 'Hongdae District',
        description: 'Youth culture and entertainment hub',
        position: calculatePosition(0),
        size: zoneSize,
        locations: applyAntiOverlapPositions([
          {
            id: 'hongdae_cafe',
            name: 'Cozy Hongdae Cafe',
            description: 'Perfect spot for intimate conversations',
            position: { x: 0, y: 0 },
            state: getLocationState('hongdae_cafe'),
            atmosphere: 'Warm and romantic ambiance'
          },
          {
            id: 'hangang_park',
            name: 'Hangang River Park',
            description: 'Scenic riverside walks and picnics',
            position: { x: 0, y: 0 },
            state: getLocationState('hangang_park'),
            atmosphere: 'Peaceful evening breeze'
          }
        ])
      },
      {
        id: 'gangnam',
        name: 'Gangnam District', 
        description: 'Luxury shopping and business center',
        position: calculatePosition(1),
        size: zoneSize,
        locations: applyAntiOverlapPositions([
          {
            id: 'luxury_department_store',
            name: 'Luxury Department Store',
            description: 'High-end fashion and premium gifts',
            position: { x: 0, y: 0 },
            state: getLocationState('luxury_department_store'),
            atmosphere: 'Bustling with sophisticated shoppers'
          },
          {
            id: 'gangnam_furnishings',
            name: 'Gangnam Furnishings',
            description: 'Premium home decoration specialists',
            position: { x: 0, y: 0 },
            state: getLocationState('gangnam_furnishings'),
            atmosphere: 'Elegant showroom atmosphere'
          },
          {
            id: 'luxury_realtor',
            name: 'Luxury Realtor',
            description: 'Exclusive property investments',
            position: { x: 0, y: 0 },
            state: storyProgress >= 3 ? getLocationState('luxury_realtor') : 'locked',
            unlockCondition: 'Reach level 3 relationship',
            atmosphere: 'Professional and exclusive'
          }
        ])
      },
      {
        id: 'jung_district',
        name: 'Jung District',
        description: 'Historic center and dining',
        position: calculatePosition(2),
        size: zoneSize,
        locations: applyAntiOverlapPositions([
          {
            id: 'myeongdong_restaurant',
            name: 'Myeongdong Restaurant',
            description: 'Traditional Korean fine dining',
            position: { x: 0, y: 0 },
            state: getLocationState('myeongdong_restaurant'),
            atmosphere: 'Elegant traditional setting'
          },
          {
            id: 'namsan_tower',
            name: 'N Seoul Tower',
            description: 'Romantic city views and love locks',
            position: { x: 0, y: 0 },
            state: playerAffection >= 5 ? getLocationState('namsan_tower') : 'locked',
            unlockCondition: 'Build deeper affection with Cha Hae-In',
            atmosphere: 'Breathtaking panoramic views'
          }
        ])
      },
      {
        id: 'yeongdeungpo',
        name: 'Yeongdeungpo District',
        description: 'Hunter Association headquarters',
        position: calculatePosition(3),
        size: zoneSize,
        locations: applyAntiOverlapPositions([
          {
            id: 'hunter_association',
            name: 'Hunter Association HQ',
            description: 'Official hunter business and meetings',
            position: { x: 0, y: 0 },
            state: getLocationState('hunter_association'),
            atmosphere: 'Professional and bustling with activity'
          },
          {
            id: 'training_facility',
            name: 'Elite Training Center',
            description: 'Advanced combat training with Cha Hae-In',
            position: { x: 0, y: 0 },
            state: playerAffection >= 3 ? getLocationState('training_facility') : 'locked',
            unlockCondition: 'Gain Cha Hae-In\'s trust through missions',
            atmosphere: 'Intense training environment'
          },
          {
            id: 'hunter_market',
            name: 'Hunter Market',
            description: 'Trading hub for monster materials and equipment',
            position: { x: 0, y: 0 },
            state: getLocationState('hunter_market'),
            atmosphere: 'Bustling marketplace with rare treasures'
          }
        ])
      },
      {
        id: 'personal',
        name: 'Personal Spaces',
        description: 'Private and intimate locations',
        position: calculatePosition(4),
        size: zoneSize,
        locations: applyAntiOverlapPositions([
          {
            id: 'player_apartment',
            name: 'Your Apartment',
            description: 'Your private sanctuary',
            position: { x: 0, y: 0 },
            state: getLocationState('player_apartment'),
            atmosphere: 'Comfortable and personal'
          },
          {
            id: 'chahaein_apartment',
            name: 'Cha Hae-In\'s Apartment',
            description: 'Her intimate private space',
            position: { x: 0, y: 0 },
            state: playerAffection >= 7 ? getLocationState('chahaein_apartment') : 'locked',
            unlockCondition: 'Develop deep intimacy with Cha Hae-In',
            atmosphere: 'Warm and inviting sanctuary'
          }
        ])
      }
    ];
  };

  // Use responsive zones
  const zones = generateResponsiveZones();

  function getLocationState(locationId: string): 'default' | 'presence' | 'quest' | 'gate' {
    // Check if Cha Hae-In is present
    if (chaHaeInLocation === locationId) return 'presence';
    
    // Check for active quests
    if (activeQuests.includes(locationId)) return 'quest';
    
    // Check for gates (random chance for demonstration)
    if (locationId === 'hunter_association' && Math.random() > 0.7) return 'gate';
    
    return 'default';
  }

  const getLocationIcon = (state: string, gateRank?: string) => {
    switch (state) {
      case 'presence':
        return (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ 
              boxShadow: [
                '0 0 10px rgba(255, 215, 0, 0.6)',
                '0 0 20px rgba(255, 215, 0, 0.8)',
                '0 0 10px rgba(255, 215, 0, 0.6)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        );
      case 'quest':
        return (
          <motion.div
            className="absolute -top-1 -right-1 text-yellow-400"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            !
          </motion.div>
        );
      case 'gate':
        return (
          <motion.div
            className={`absolute inset-0 rounded-full ${
              gateRank === 'S' ? 'bg-red-500/30' :
              gateRank === 'A' ? 'bg-orange-500/30' :
              gateRank === 'B' ? 'bg-yellow-500/30' : 'bg-green-500/30'
            }`}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        );
      default:
        return null;
    }
  };

  const getTimeDescription = () => {
    const timeDescriptions = {
      morning: 'Dawn breaks across the city',
      afternoon: 'The city bustles with activity',
      evening: 'Twilight settles over Seoul',
      night: 'The city lights illuminate the darkness'
    };
    return timeDescriptions[currentTime];
  };

  const fetchLocationImage = async (locationId: string) => {
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: locationId, timeOfDay: currentTime })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setLocationImage(data.imageUrl);
      }
    } catch (error) {
      console.log('Failed to load location image');
    }
  };

  const handleLocationSelect = (location: LocationNode) => {
    if (location.state === 'locked') return;
    
    // If this is a quest location, navigate directly without confirmation for streamlined quest flow
    if (location.state === 'quest' && activeQuests.includes(location.id)) {
      onLocationSelect(location.id);
      return;
    }
    
    setSelectedLocation(location);
    fetchLocationImage(location.id);
  };

  const handleTravel = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.id);
      setSelectedLocation(null);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9999]"
      >
        {/* Monarch's Sanctum Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black/80 to-black"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.05) 0%, transparent 70%)
            `
          }}
        />

        {/* Enhanced Header Panel */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-6 left-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-[280px]"
        >
          <h1 className="text-white text-2xl font-bold mb-2">Monarch's Seoul</h1>
          <div className="text-white/60 text-sm space-y-1">
            <div className="capitalize">{currentTime} • Ethereal Projection</div>
            <div>{getTimeDescription()}</div>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10">
              <div className="text-xs">Affection: {playerAffection}/10</div>
              <div className="flex-1 bg-white/10 rounded-full h-1">
                <div 
                  className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${(playerAffection / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Legend Panel */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute top-6 right-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
        >
          <h3 className="text-white text-sm font-medium mb-3">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-200"></div>
              <span className="text-white/80">Cha Hae-In Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border border-purple-300"></div>
              <span className="text-white/80">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-300"></div>
              <span className="text-white/80">Quest Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-600 border border-gray-500"></div>
              <span className="text-white/80">Locked</span>
            </div>
          </div>
        </motion.div>

        {/* Zoom Controls */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute bottom-6 right-6 flex flex-col gap-2"
        >
          <Button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-white/10"
          >
            <Minus className="w-4 h-4" />
          </Button>
        </motion.div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-6 right-6 text-white/60 hover:bg-white/10 z-10"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Responsive Map Container */}
        <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-20">
          <motion.div
            className="relative w-full h-full max-w-7xl max-h-5xl"
            style={{ transform: `scale(${zoomLevel})` }}
          >


            {/* Zone Panels */}
            {zones.map((zone) => (
              <motion.div
                key={zone.id}
                className={`absolute bg-black/30 backdrop-blur-sm border border-white/20 rounded-3xl p-6 transition-all duration-300 cursor-pointer ${
                  focusedZone === zone.id ? 'bg-black/50 border-white/40 shadow-2xl' : ''
                }`}
                style={{
                  left: `${zone.position.x}%`,
                  top: `${zone.position.y}%`,
                  width: `${zone.size.width}%`,
                  height: `${zone.size.height}%`,
                  transform: focusedZone === zone.id ? 'translateZ(10px) scale(1.02)' : 'translateZ(0px) scale(1)'
                }}
                onMouseEnter={() => setFocusedZone(zone.id)}
                onMouseLeave={() => {
                  setFocusedZone(null);
                  setHoveredLocation(null);
                }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Zone Title - Simplified */}
                <div className="absolute -top-4 left-2 right-2">
                  <motion.div
                    className={`bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md border transition-all duration-300 ${
                      focusedZone === zone.id 
                        ? 'border-white/50' 
                        : 'border-white/20'
                    }`}
                  >
                    <h3 className="text-white text-[10px] font-medium text-center">{zone.name}</h3>
                  </motion.div>
                </div>

                {/* Location Nodes */}
                {zone.locations.map((location) => (
                  <motion.div
                    key={location.id}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${location.position.x}%`,
                      top: `${location.position.y}%`
                    }}
                    onClick={() => handleLocationSelect(location)}
                    onMouseEnter={() => setHoveredLocation(location.id)}
                    onMouseLeave={() => setHoveredLocation(null)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Enhanced Location Orb */}
                    <div className="relative">
                      <motion.div
                        className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full relative border-2 min-w-[40px] min-h-[40px] ${
                          location.state === 'locked' 
                            ? 'bg-gray-600 border-gray-500' :
                          location.state === 'presence' 
                            ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200' :
                          location.state === 'quest' 
                            ? 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300' :
                          location.state === 'gate' 
                            ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300' 
                            : 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300'
                        }`}
                        animate={
                          location.state === 'presence' ? {
                            boxShadow: [
                              '0 0 15px rgba(255, 215, 0, 0.7)',
                              '0 0 25px rgba(255, 215, 0, 0.9)',
                              '0 0 15px rgba(255, 215, 0, 0.7)'
                            ],
                            scale: [1, 1.1, 1]
                          } :
                          location.state !== 'locked' ? {
                            boxShadow: [
                              '0 0 8px rgba(147, 51, 234, 0.6)',
                              '0 0 18px rgba(147, 51, 234, 0.8)',
                              '0 0 8px rgba(147, 51, 234, 0.6)'
                            ]
                          } : {}
                        }
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {getLocationIcon(location.state, location.gateRank)}
                        
                        {location.state === 'locked' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/70" />
                          </div>
                        )}
                      </motion.div>

                      {/* Enhanced Location Label */}
                      <AnimatePresence>
                        {hoveredLocation === location.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.9 }}
                            className="absolute top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap z-20"
                          >
                            <div className={`backdrop-blur-md px-4 py-2 rounded-xl text-sm border-2 shadow-xl ${
                              location.state === 'presence' 
                                ? 'bg-gradient-to-br from-yellow-400/30 to-yellow-500/20 border-yellow-400/60 text-yellow-100'
                                : location.state === 'locked'
                                ? 'bg-gradient-to-br from-gray-600/30 to-gray-700/20 border-gray-500/60 text-gray-200'
                                : 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 border-purple-400/60 text-white'
                            }`}>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-xs opacity-80 mt-1">{location.description}</div>
                              {location.state === 'presence' && (
                                <div className="text-yellow-300 text-xs mt-1 flex items-center gap-1">
                                  <span className="animate-pulse">✨</span> Cha Hae-In is here
                                </div>
                              )}
                              {location.state === 'locked' && (
                                <div className="text-gray-400 text-xs mt-1">{location.unlockCondition}</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Location Confirmation Panel */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10"
              onClick={() => setSelectedLocation(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black/60 backdrop-blur-xl border border-white/30 rounded-3xl p-8 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Preview Image */}
                <div className="w-full h-64 rounded-2xl mb-6 overflow-hidden">
                  {locationImage ? (
                    <img 
                      src={locationImage} 
                      alt={selectedLocation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-purple-800/30 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-4xl"
                      >
                        🏢
                      </motion.div>
                    </div>
                  )}
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                  <h2 className="text-white text-2xl font-bold">{selectedLocation.name}</h2>
                  <p className="text-white/80">{selectedLocation.description}</p>
                  
                  {selectedLocation.atmosphere && (
                    <div className="text-purple-300 text-sm">
                      Current Atmosphere: {selectedLocation.atmosphere}
                    </div>
                  )}

                  <div className={`text-sm ${
                    chaHaeInLocation === selectedLocation.id ? 'text-yellow-400' : 'text-white/60'
                  }`}>
                    {chaHaeInLocation === selectedLocation.id ? 
                      '✨ Cha Hae-In is here' : 
                      'Cha Hae-In is not here'
                    }
                  </div>

                  {selectedLocation.state === 'locked' && (
                    <div className="text-red-400 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      {selectedLocation.unlockCondition}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                  <Button
                    onClick={() => setSelectedLocation(null)}
                    variant="ghost"
                    className="flex-1 text-white/60 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTravel}
                    disabled={selectedLocation.state === 'locked'}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                  >
                    Travel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}