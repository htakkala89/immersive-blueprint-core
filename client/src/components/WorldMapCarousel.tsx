import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin, Lock, Star, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationNode {
  id: string;
  name: string;
  description: string;
  state: 'default' | 'presence' | 'quest' | 'locked' | 'gate';
  unlockCondition?: string;
  gateRank?: 'C' | 'B' | 'A' | 'S';
  atmosphere?: string;
  hasCharacter?: boolean;
}

interface ZoneData {
  id: string;
  name: string;
  description: string;
  locations: LocationNode[];
  backgroundGradient: string;
  textColor: string;
}

interface WorldMapCarouselProps {
  isVisible: boolean;
  onClose: () => void;
  onLocationSelect: (locationId: string) => void;
  currentTime: 'morning' | 'afternoon' | 'evening' | 'night';
  chaHaeInLocation: string;
  playerAffection: number;
  storyProgress: number;
  activeQuests?: string[];
}

export function WorldMapCarousel({
  isVisible,
  onClose,
  onLocationSelect,
  currentTime,
  chaHaeInLocation,
  playerAffection,
  storyProgress,
  activeQuests = []
}: WorldMapCarouselProps) {
  const [currentZoneIndex, setCurrentZoneIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<LocationNode | null>(null);

  // Define all zones with locations
  const zones: ZoneData[] = [
    {
      id: 'hongdae_district',
      name: 'Hongdae District',
      description: 'Vibrant youth culture and entertainment hub',
      backgroundGradient: 'from-pink-900/40 to-purple-800/20',
      textColor: 'text-pink-300',
      locations: [
        {
          id: 'hongdae_cafe',
          name: 'Cozy Coffee Shop',
          description: 'A warm, intimate café perfect for quiet conversations',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'hongdae_cafe'
        },
        {
          id: 'hongdae_arcade',
          name: 'Retro Arcade',
          description: 'Classic games and competitive fun',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'hongdae_arcade'
        },
        {
          id: 'hongdae_karaoke',
          name: 'Karaoke Room',
          description: 'Private singing rooms for entertainment',
          state: playerAffection >= 300 ? 'default' : 'locked',
          unlockCondition: 'Requires 300+ Affection',
          hasCharacter: chaHaeInLocation === 'hongdae_karaoke'
        }
      ]
    },
    {
      id: 'gangnam_district',
      name: 'Gangnam District',
      description: 'Upscale shopping and dining destination',
      backgroundGradient: 'from-amber-900/40 to-yellow-800/20',
      textColor: 'text-amber-300',
      locations: [
        {
          id: 'luxury_mall',
          name: 'Luxury Shopping Mall',
          description: 'High-end boutiques and designer stores',
          state: playerAffection >= 200 ? 'default' : 'locked',
          unlockCondition: 'Requires 200+ Affection',
          hasCharacter: chaHaeInLocation === 'luxury_mall'
        },
        {
          id: 'fine_dining',
          name: 'Fine Dining Restaurant',
          description: 'Exclusive culinary experiences',
          state: playerAffection >= 400 ? 'default' : 'locked',
          unlockCondition: 'Requires 400+ Affection',
          hasCharacter: chaHaeInLocation === 'fine_dining'
        },
        {
          id: 'spa_wellness',
          name: 'Wellness Spa',
          description: 'Relaxation and rejuvenation center',
          state: playerAffection >= 600 ? 'default' : 'locked',
          unlockCondition: 'Requires 600+ Affection',
          hasCharacter: chaHaeInLocation === 'spa_wellness'
        }
      ]
    },
    {
      id: 'jung_district',
      name: 'Jung District',
      description: 'Historic heart of Seoul with cultural landmarks',
      backgroundGradient: 'from-blue-900/40 to-indigo-800/20',
      textColor: 'text-blue-300',
      locations: [
        {
          id: 'namsan_tower',
          name: 'N Seoul Tower',
          description: 'Romantic observatory with city views',
          state: playerAffection >= 500 ? 'default' : 'locked',
          unlockCondition: 'Requires 500+ Affection',
          hasCharacter: chaHaeInLocation === 'namsan_tower'
        },
        {
          id: 'myeongdong',
          name: 'Myeongdong Street',
          description: 'Bustling shopping and street food district',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'myeongdong'
        },
        {
          id: 'traditional_market',
          name: 'Traditional Market',
          description: 'Authentic Korean culture and cuisine',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'traditional_market'
        }
      ]
    },
    {
      id: 'yeongdeungpo_district',
      name: 'Yeongdeungpo District',
      description: 'Business hub with modern attractions',
      backgroundGradient: 'from-green-900/40 to-emerald-800/20',
      textColor: 'text-green-300',
      locations: [
        {
          id: 'hunter_association',
          name: 'Hunter Association',
          description: 'Official headquarters for hunter activities',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'hunter_association'
        },
        {
          id: 'training_facility',
          name: 'Training Facility',
          description: 'Advanced combat training center',
          state: storyProgress >= 10 ? 'default' : 'locked',
          unlockCondition: 'Story Progress Required',
          hasCharacter: chaHaeInLocation === 'training_facility'
        },
        {
          id: 'hangang_park',
          name: 'Hangang Park',
          description: 'Scenic riverside park for peaceful walks',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'hangang_park'
        },
        {
          id: 'low_rank_gate',
          name: 'Low-Rank Gate',
          description: 'Entry-level dungeon for beginners',
          state: 'gate',
          gateRank: 'C',
          hasCharacter: chaHaeInLocation === 'low_rank_gate'
        }
      ]
    },
    {
      id: 'personal_spaces',
      name: 'Personal Spaces',
      description: 'Private and intimate locations',
      backgroundGradient: 'from-purple-900/40 to-violet-800/20',
      textColor: 'text-purple-300',
      locations: [
        {
          id: 'jinwoo_apartment',
          name: "Jin-Woo's Apartment",
          description: 'Your personal living space',
          state: 'default',
          hasCharacter: chaHaeInLocation === 'jinwoo_apartment'
        },
        {
          id: 'cha_apartment',
          name: "Cha Hae-In's Apartment",
          description: "Cha Hae-In's private residence",
          state: playerAffection >= 800 ? 'default' : 'locked',
          unlockCondition: 'Requires 800+ Affection',
          hasCharacter: chaHaeInLocation === 'cha_apartment'
        }
      ]
    }
  ];

  const currentZone = zones[currentZoneIndex];

  const nextZone = () => {
    setCurrentZoneIndex((prev) => (prev + 1) % zones.length);
  };

  const prevZone = () => {
    setCurrentZoneIndex((prev) => (prev - 1 + zones.length) % zones.length);
  };

  const handleLocationClick = (location: LocationNode) => {
    if (location.state === 'locked') {
      setSelectedLocation(location);
      return;
    }
    onLocationSelect(location.id);
    onClose();
  };

  const getLocationIcon = (location: LocationNode) => {
    if (location.hasCharacter) return Heart;
    if (location.state === 'locked') return Lock;
    if (location.state === 'gate') return Zap;
    if (activeQuests.some(quest => quest.includes(location.id))) return Star;
    return MapPin;
  };

  const getLocationColor = (location: LocationNode) => {
    if (location.hasCharacter) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/50';
    if (location.state === 'locked') return 'text-slate-400 bg-slate-700/30 border-slate-600/50';
    if (location.state === 'gate') return 'text-red-400 bg-red-400/20 border-red-400/50';
    if (activeQuests.some(quest => quest.includes(location.id))) return 'text-blue-400 bg-blue-400/20 border-blue-400/50';
    return 'text-purple-400 bg-purple-400/20 border-purple-400/50';
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl h-[90vh] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <div>
            <h2 className="text-xl font-bold text-white">World Map</h2>
            <p className="text-sm text-slate-400">Navigate to different locations</p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-600/30 min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Zone Navigation */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50">
          <Button
            onClick={prevZone}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700/50 min-h-[44px] min-w-[44px]"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <h3 className={`text-lg font-bold ${currentZone.textColor}`}>
              {currentZone.name}
            </h3>
            <p className="text-xs text-slate-400">{currentZone.description}</p>
            <div className="flex justify-center mt-2 gap-1">
              {zones.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentZoneIndex ? 'bg-purple-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <Button
            onClick={nextZone}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-slate-700/50 min-h-[44px] min-w-[44px]"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Zone Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentZoneIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`h-full bg-gradient-to-br ${currentZone.backgroundGradient} p-4`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full">
                {currentZone.locations.map((location) => {
                  const IconComponent = getLocationIcon(location);
                  const colorClasses = getLocationColor(location);
                  
                  return (
                    <motion.div
                      key={location.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${colorClasses}`}
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-current/20">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-sm">{location.name}</h4>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                            {location.description}
                          </p>
                          
                          {location.state === 'locked' && (
                            <p className="text-xs text-red-300 mt-2">
                              {location.unlockCondition}
                            </p>
                          )}
                          
                          {location.state === 'gate' && location.gateRank && (
                            <span className="inline-block px-2 py-1 mt-2 text-xs bg-red-900/50 text-red-300 rounded">
                              Rank {location.gateRank}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Character Presence Indicator */}
                      {location.hasCharacter && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                        >
                          <Heart className="w-3 h-3 text-yellow-900" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700/50">
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-yellow-400" />
              <span className="text-slate-300">Cha Hae-In</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-purple-400" />
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-400" />
              <span className="text-slate-300">Quest</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span className="text-slate-300">Locked</span>
            </div>
          </div>
        </div>

        {/* Location Detail Modal */}
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedLocation(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="text-white font-bold">{selectedLocation.name}</h3>
                  <p className="text-slate-400 text-sm">Location Locked</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                {selectedLocation.description}
              </p>
              <p className="text-red-300 text-sm mb-4">
                {selectedLocation.unlockCondition}
              </p>
              <Button
                onClick={() => setSelectedLocation(null)}
                className="w-full"
                variant="outline"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}