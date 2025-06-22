import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Star, Package, Heart, Sparkles, Sword, Shield, Zap, Eye, Brain, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoreStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

interface PlayerData {
  name: string;
  hunterRank: string;
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stats: CoreStats;
  unspentStatPoints: number;
  unspentSkillPoints: number;
  affection?: number;
}

interface ProgressionProps {
  isVisible: boolean;
  onClose: () => void;
  playerData: PlayerData;
  onUpdatePlayer: (updates: Partial<PlayerData>) => void;
  onOpenInventory?: () => void;
  onOpenArmory?: () => void;
  onOpenRelationshipConstellation?: () => void;
}

export function PlayerProgressionSystemRedesigned({
  isVisible,
  onClose,
  playerData,
  onUpdatePlayer,
  onOpenInventory,
  onOpenArmory,
  onOpenRelationshipConstellation
}: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'relationship' | 'equipment'>('stats');

  const allocateStat = (stat: keyof CoreStats) => {
    if (playerData.unspentStatPoints > 0) {
      onUpdatePlayer({
        stats: {
          ...playerData.stats,
          [stat]: playerData.stats[stat] + 1
        },
        unspentStatPoints: playerData.unspentStatPoints - 1
      });
    }
  };

  const deallocateStat = (stat: keyof CoreStats) => {
    if (playerData.stats[stat] > 1) {
      onUpdatePlayer({
        stats: {
          ...playerData.stats,
          [stat]: playerData.stats[stat] - 1
        },
        unspentStatPoints: playerData.unspentStatPoints + 1
      });
    }
  };

  const getStatIcon = (stat: keyof CoreStats) => {
    switch (stat) {
      case 'strength': return <Sword className="w-5 h-5" />;
      case 'agility': return <Zap className="w-5 h-5" />;
      case 'vitality': return <Shield className="w-5 h-5" />;
      case 'intelligence': return <Brain className="w-5 h-5" />;
      case 'sense': return <Eye className="w-5 h-5" />;
    }
  };

  const getStatColor = (stat: keyof CoreStats) => {
    switch (stat) {
      case 'strength': return 'text-red-400';
      case 'agility': return 'text-green-400';
      case 'vitality': return 'text-blue-400';
      case 'intelligence': return 'text-purple-400';
      case 'sense': return 'text-yellow-400';
    }
  };

  const getNextUnlock = (affection: number) => {
    if (affection >= 600) return "All premium locations unlocked!";
    if (affection >= 500) return "Wellness Spa at 600 affection";
    if (affection >= 400) return "N Seoul Tower at 500 affection";
    if (affection >= 200) return "Fine Dining at 400 affection";
    return "Luxury Shopping at 200 affection";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-b border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{playerData.name}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-purple-300">{playerData.hunterRank}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-blue-300">Level {playerData.level}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Progress Bars */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Experience</span>
                  <span className="text-slate-300">{playerData.experience}/{playerData.maxExperience}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(playerData.experience / playerData.maxExperience) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Health</span>
                  <span className="text-slate-300">{playerData.health}/{playerData.maxHealth}</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-700/50">
            {[
              { id: 'stats', label: 'Core Stats', icon: Star },
              { id: 'relationship', label: 'Relationship', icon: Heart },
              { id: 'equipment', label: 'Equipment', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 sm:p-6">
              <AnimatePresence mode="wait">
              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Available Points */}
                  {playerData.unspentStatPoints > 0 && (
                    <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-medium">
                          {playerData.unspentStatPoints} Stat Points Available
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Debug Stats Info - Using useEffect instead of inline console.log */}
                  {(() => {
                    console.log('🔍 PlayerData stats:', playerData.stats);
                    console.log('🔍 Full PlayerData:', playerData);
                    return null;
                  })()}
                  
                  {/* Stats Grid - Mobile Optimized with Invisible Scroll */}
                  <div className="grid gap-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                    {playerData.stats && Object.keys(playerData.stats).length > 0 ? (Object.keys(playerData.stats) as Array<keyof CoreStats>).map((stat) => (
                      <div 
                        key={stat}
                        className="bg-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`${getStatColor(stat)} flex-shrink-0`}>
                              {getStatIcon(stat)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-white font-medium capitalize text-sm sm:text-base truncate">{stat}</h4>
                              <p className="text-slate-400 text-xs sm:text-sm">Current: {playerData.stats?.[stat]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <button
                              onClick={() => deallocateStat(stat)}
                              disabled={(playerData.stats?.[stat] ?? 0) <= 1}
                              className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-slate-300" />
                            </button>
                            <span className="w-8 sm:w-12 text-center text-white font-bold text-base sm:text-lg">
                              {playerData.stats?.[stat] ?? 0}
                            </span>
                            <button
                              onClick={() => allocateStat(stat)}
                              disabled={playerData.unspentStatPoints === 0}
                              className="w-8 h-8 sm:w-9 sm:h-9 bg-purple-600/50 hover:bg-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <p className="text-slate-400">No stats available</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'relationship' && (
                <motion.div
                  key="relationship"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide"
                >
                  {/* Relationship Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Bond with Cha Hae-In</h3>
                    <p className="text-slate-300 text-sm">S-Rank Hunter • Strongest Female Hunter</p>
                  </div>

                  {/* Affection Display */}
                  <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/30 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Affection Level</h4>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-pink-300">{playerData.affection || 0}</div>
                        <div className="text-sm text-pink-200">/ 1000</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden mb-3">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((playerData.affection || 0) / 1000) * 100)}%` }}
                      />
                    </div>
                    <div className="text-sm text-slate-300">
                      {getNextUnlock(playerData.affection || 0)}
                    </div>
                  </div>

                  {/* Relationship Actions */}
                  <div className="grid gap-3">
                    <button 
                      onClick={() => {
                        onClose();
                        if (onOpenRelationshipConstellation) {
                          onOpenRelationshipConstellation();
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      View Constellation
                    </button>
                    <button className="w-full py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
                      <Heart className="w-4 h-4" />
                      Memory Lane
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'equipment' && (
                <motion.div
                  key="equipment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Equipment Management</h3>
                    <p className="text-slate-300 text-sm">Manage your gear and inventory</p>
                  </div>

                  {/* Equipment Actions */}
                  <div className="grid gap-4">
                    <button
                      onClick={onOpenInventory}
                      className="w-full p-4 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Inventory</h4>
                          <p className="text-slate-400 text-sm">Manage items and consumables</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={onOpenArmory}
                      className="w-full p-4 bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-500/30 hover:border-amber-400/50 rounded-xl transition-all duration-200 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                          <Sword className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Armory</h4>
                          <p className="text-slate-400 text-sm">Equip weapons and armor</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                    <h4 className="text-white font-medium mb-3">Quick Overview</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-300">24</div>
                        <div className="text-slate-400 text-sm">Items</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-300">6</div>
                        <div className="text-slate-400 text-sm">Equipped</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}