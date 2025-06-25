import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Lock, Unlock, Heart, Star, Coins, Zap, Home, Sword, Eye, MapPin, Utensils, Wind, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DevToolsPanelProps {
  isVisible: boolean;
  onClose: () => void;
  gameState: any;
  onGameStateUpdate: (updates: any) => void;
}

interface ActivityRequirement {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: 'casual' | 'training' | 'home' | 'intimate' | 'special';
  currentRequirement: string;
  unlockConditions: {
    level?: number;
    affection?: number;
    gold?: number;
    apartmentTier?: number;
    items?: string[];
    storyFlags?: string[];
  };
  currentlyUnlocked: boolean;
}

export function DevToolsPanel({ isVisible, onClose, gameState, onGameStateUpdate }: DevToolsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const activityRequirements: ActivityRequirement[] = [
    // Casual Activities
    {
      id: 'grab_coffee',
      name: 'Grab a Coffee',
      icon: <Utensils className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Always Available',
      unlockConditions: {},
      currentlyUnlocked: true
    },
    {
      id: 'hangang_walk',
      name: 'Walk in Hangang Park',
      icon: <Wind className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Always Available',
      unlockConditions: {},
      currentlyUnlocked: true
    },
    {
      id: 'shopping_for_gifts',
      name: 'Go Shopping for Gifts',
      icon: <Package className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Always Available',
      unlockConditions: {},
      currentlyUnlocked: true
    },
    {
      id: 'visit_arcade',
      name: 'Visit an Arcade',
      icon: <Star className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Evening Time',
      unlockConditions: {},
      currentlyUnlocked: gameState?.currentTime !== 'morning'
    },
    {
      id: 'see_movie',
      name: 'See a Movie',
      icon: <Star className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Affection Level 3+',
      unlockConditions: { affection: 30 },
      currentlyUnlocked: gameState?.affection >= 30
    },
    {
      id: 'dinner_myeongdong',
      name: 'Dinner at Myeongdong',
      icon: <Utensils className="w-4 h-4" />,
      category: 'casual',
      currentRequirement: 'Affection Level 5+ & Evening',
      unlockConditions: { affection: 50 },
      currentlyUnlocked: gameState?.affection >= 50
    },
    {
      id: 'n_seoul_tower',
      name: 'Visit N Seoul Tower',
      icon: <MapPin className="w-4 h-4" />,
      category: 'special',
      currentRequirement: 'Affection Level 8+ (Ultimate Romantic Date)',
      unlockConditions: { affection: 80 },
      currentlyUnlocked: gameState?.affection >= 80
    },

    // Training Activities
    {
      id: 'sparring_session',
      name: 'Sparring Session',
      icon: <Sword className="w-4 h-4" />,
      category: 'training',
      currentRequirement: 'Always Available',
      unlockConditions: {},
      currentlyUnlocked: true
    },
    {
      id: 'review_raid_footage',
      name: 'Review Raid Footage',
      icon: <Eye className="w-4 h-4" />,
      category: 'training',
      currentRequirement: 'Level 5+ (Complete First Major Raid)',
      unlockConditions: { level: 5 },
      currentlyUnlocked: gameState?.level >= 5
    },
    {
      id: 'clear_low_rank_gate',
      name: 'Clear a Low-Rank Gate',
      icon: <Sword className="w-4 h-4" />,
      category: 'training',
      currentRequirement: 'Level 3+ (Hunter Certification)',
      unlockConditions: { level: 3 },
      currentlyUnlocked: gameState?.level >= 3
    },
    {
      id: 'coop_skill_training',
      name: 'Co-op Skill Training',
      icon: <Zap className="w-4 h-4" />,
      category: 'training',
      currentRequirement: 'Affection Level 3+ (Synergy System)',
      unlockConditions: { affection: 30 },
      currentlyUnlocked: gameState?.affection >= 30
    },

    // Home Life Activities
    {
      id: 'order_takeout',
      name: 'Order Takeout',
      icon: <Utensils className="w-4 h-4" />,
      category: 'home',
      currentRequirement: 'Affection Level 6+ (Her Apartment Access)',
      unlockConditions: { affection: 60 },
      currentlyUnlocked: gameState?.affection >= 60
    },
    {
      id: 'cook_dinner_together',
      name: 'Cook Dinner Together',
      icon: <Utensils className="w-4 h-4" />,
      category: 'home',
      currentRequirement: 'Tier 2 Apartment (Modern Kitchen)',
      unlockConditions: { apartmentTier: 2 },
      currentlyUnlocked: gameState?.apartmentTier >= 2
    },
    {
      id: 'assemble_furniture',
      name: 'Assemble New Furniture',
      icon: <Home className="w-4 h-4" />,
      category: 'home',
      currentRequirement: 'After Buying Furniture (₩2M+ Gold)',
      unlockConditions: { gold: 2000000 },
      currentlyUnlocked: gameState?.gold >= 2000000
    },
    {
      id: 'talk_on_balcony',
      name: 'Talk on the Balcony',
      icon: <Wind className="w-4 h-4" />,
      category: 'home',
      currentRequirement: 'Tier 2+ Apartment (Private Balcony)',
      unlockConditions: { apartmentTier: 2 },
      currentlyUnlocked: gameState?.apartmentTier >= 2
    },
    {
      id: 'swim_private_pool',
      name: 'Swim in Private Pool',
      icon: <Star className="w-4 h-4" />,
      category: 'home',
      currentRequirement: 'Tier 3 Penthouse (Ultimate Luxury)',
      unlockConditions: { apartmentTier: 3 },
      currentlyUnlocked: gameState?.apartmentTier >= 3
    },

    // Intimate Activities
    {
      id: 'give_back_rub',
      name: 'Give a Back Rub',
      icon: <Heart className="w-4 h-4" />,
      category: 'intimate',
      currentRequirement: 'Affection Level 7+ (Physical Intimacy)',
      unlockConditions: { affection: 70 },
      currentlyUnlocked: gameState?.affection >= 70
    },
    {
      id: 'cuddle_all_morning',
      name: 'Cuddle All Morning',
      icon: <Heart className="w-4 h-4" />,
      category: 'intimate',
      currentRequirement: 'Affection Level 8+ & Tier 2 Apartment',
      unlockConditions: { affection: 80, apartmentTier: 2 },
      currentlyUnlocked: gameState?.affection >= 80 && gameState?.apartmentTier >= 2
    },
    {
      id: 'shower_together',
      name: 'Take a Shower Together',
      icon: <Heart className="w-4 h-4" />,
      category: 'intimate',
      currentRequirement: 'Affection Level 9+ & Tier 2 Apartment',
      unlockConditions: { affection: 90, apartmentTier: 2 },
      currentlyUnlocked: gameState?.affection >= 90 && gameState?.apartmentTier >= 2
    },
    {
      id: 'passionate_night',
      name: 'A Passionate Night',
      icon: <Heart className="w-4 h-4" />,
      category: 'intimate',
      currentRequirement: 'Max Affection (Level 10) & Tier 2 Apartment',
      unlockConditions: { affection: 100, apartmentTier: 2 },
      currentlyUnlocked: gameState?.affection >= 100 && gameState?.apartmentTier >= 2
    }
  ];

  const categories = [
    { id: 'all', name: 'All Activities', count: activityRequirements.length },
    { id: 'casual', name: 'Casual Outings', count: activityRequirements.filter(a => a.category === 'casual').length },
    { id: 'training', name: 'Training & Hunter Life', count: activityRequirements.filter(a => a.category === 'training').length },
    { id: 'home', name: 'Home Life', count: activityRequirements.filter(a => a.category === 'home').length },
    { id: 'intimate', name: 'Intimate Activities', count: activityRequirements.filter(a => a.category === 'intimate').length },
    { id: 'special', name: 'Special Events', count: activityRequirements.filter(a => a.category === 'special').length }
  ];

  const filteredActivities = selectedCategory === 'all' 
    ? activityRequirements 
    : activityRequirements.filter(a => a.category === selectedCategory);

  const handleUnlockActivity = (activityId: string) => {
    const activity = activityRequirements.find(a => a.id === activityId);
    if (!activity) return;

    const updates: any = {};
    
    if (activity.unlockConditions.level) {
      updates.level = Math.max(gameState?.level || 1, activity.unlockConditions.level);
    }
    if (activity.unlockConditions.affection) {
      updates.affection = Math.max(gameState?.affection || 0, activity.unlockConditions.affection);
    }
    if (activity.unlockConditions.gold) {
      updates.gold = Math.max(gameState?.gold || 0, activity.unlockConditions.gold);
    }
    if (activity.unlockConditions.apartmentTier) {
      updates.apartmentTier = Math.max(gameState?.apartmentTier || 1, activity.unlockConditions.apartmentTier);
    }

    onGameStateUpdate(updates);
  };

  const handleUnlockAll = () => {
    const updates = {
      level: 20,
      affection: 100,
      gold: 10000000,
      apartmentTier: 3,
      energy: 100,
      maxEnergy: 100
    };
    onGameStateUpdate(updates);
  };

  const handleResetProgress = () => {
    const updates = {
      level: 1,
      affection: 0,
      gold: 50000,
      apartmentTier: 1,
      energy: 80,
      maxEnergy: 100
    };
    onGameStateUpdate(updates);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-6xl h-[90vh] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border border-blue-400/30"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-blue-300" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Activity Unlock Requirements</h2>
                  <p className="text-blue-200">Manage activity availability and progression requirements</p>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
                ×
              </Button>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <Button
                onClick={handleUnlockAll}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Unlock All Activities
              </Button>
              <Button
                onClick={handleResetProgress}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                Reset Progress
              </Button>
            </div>
          </div>

          <div className="flex h-full">
            {/* Category Sidebar */}
            <div className="w-80 bg-black/20 border-r border-white/20 p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm opacity-75">{category.count}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Current Stats */}
              <div className="mt-6 p-4 bg-white/10 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Current Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-blue-200">
                    <span>Level:</span>
                    <span>{gameState?.level || 1}</span>
                  </div>
                  <div className="flex justify-between text-pink-200">
                    <span>Affection:</span>
                    <span>{gameState?.affection || 0}/100</span>
                  </div>
                  <div className="flex justify-between text-yellow-200">
                    <span>Gold:</span>
                    <span>₩{(gameState?.gold || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>Apartment:</span>
                    <span>Tier {gameState?.apartmentTier || 1}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities List */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`p-4 rounded-xl border transition-all ${
                      activity.currentlyUnlocked
                        ? 'bg-green-900/20 border-green-400/30'
                        : 'bg-red-900/20 border-red-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          activity.currentlyUnlocked ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          {activity.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{activity.name}</h4>
                          <p className={`text-sm ${
                            activity.currentlyUnlocked ? 'text-green-300' : 'text-red-300'
                          }`}>
                            {activity.currentRequirement}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                          activity.currentlyUnlocked
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {activity.currentlyUnlocked ? (
                            <><Unlock className="w-4 h-4" /> Unlocked</>
                          ) : (
                            <><Lock className="w-4 h-4" /> Locked</>
                          )}
                        </div>

                        {!activity.currentlyUnlocked && (
                          <Button
                            onClick={() => handleUnlockActivity(activity.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Quick Unlock
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Detailed Requirements */}
                    {Object.keys(activity.unlockConditions).length > 0 && (
                      <div className="mt-3 p-3 bg-black/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-2">Requirements:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {activity.unlockConditions.level && (
                            <div className={`flex items-center space-x-1 ${
                              gameState?.level >= activity.unlockConditions.level ? 'text-green-300' : 'text-red-300'
                            }`}>
                              <Star className="w-3 h-3" />
                              <span>Level {activity.unlockConditions.level}+</span>
                            </div>
                          )}
                          {activity.unlockConditions.affection && (
                            <div className={`flex items-center space-x-1 ${
                              gameState?.affection >= activity.unlockConditions.affection ? 'text-green-300' : 'text-red-300'
                            }`}>
                              <Heart className="w-3 h-3" />
                              <span>Affection {activity.unlockConditions.affection}+</span>
                            </div>
                          )}
                          {activity.unlockConditions.gold && (
                            <div className={`flex items-center space-x-1 ${
                              gameState?.gold >= activity.unlockConditions.gold ? 'text-green-300' : 'text-red-300'
                            }`}>
                              <Coins className="w-3 h-3" />
                              <span>₩{activity.unlockConditions.gold.toLocaleString()}</span>
                            </div>
                          )}
                          {activity.unlockConditions.apartmentTier && (
                            <div className={`flex items-center space-x-1 ${
                              gameState?.apartmentTier >= activity.unlockConditions.apartmentTier ? 'text-green-300' : 'text-red-300'
                            }`}>
                              <Home className="w-3 h-3" />
                              <span>Tier {activity.unlockConditions.apartmentTier} Apartment</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}