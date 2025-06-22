import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Star, Package, Heart, Sparkles } from 'lucide-react';
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
}

export function PlayerProgressionSystem16Fixed({
  isVisible,
  onClose,
  playerData,
  onUpdatePlayer,
  onOpenInventory,
  onOpenArmory
}: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'equipment'>('stats');

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

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden character-modal-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-slate-900/50 border-b border-slate-700/50 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">{playerData.name}</h2>
                <p className="text-purple-200 text-sm sm:text-base">{playerData.hunterRank} Rank Hunter</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 w-8 h-8 sm:w-10 sm:h-10 p-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 sm:gap-2 mt-4 sm:mt-6">
            {[
              { id: 'stats', label: 'Core Stats', icon: Star },
              { id: 'skills', label: 'Relationship', icon: Heart },
              { id: 'equipment', label: 'Equipment', icon: Package }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'stats' && (
            <div className="h-full p-2 sm:p-6 overflow-y-auto character-scrollbar">
              <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-6">
                {/* Level Progress */}
                <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-xl font-bold text-white">Level Progress</h3>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-bold text-purple-300">Level {playerData.level}</div>
                      <div className="text-xs sm:text-sm text-slate-400">{playerData.experience}/{playerData.maxExperience} EXP</div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2 sm:h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-500"
                      style={{ width: `${(playerData.experience / playerData.maxExperience) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Core Stats */}
                <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3 sm:mb-6">
                    <h3 className="text-base sm:text-xl font-bold text-white">Core Stats</h3>
                    <div className="text-right">
                      <div className="text-lg sm:text-xl font-bold text-amber-300">{playerData.unspentStatPoints}</div>
                      <div className="text-xs sm:text-sm text-slate-400">Unspent Points</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(Object.entries(playerData.stats) as [keyof CoreStats, number][]).map(([stat, value]) => (
                      <div key={stat} className="bg-slate-700/30 rounded-lg p-3 sm:p-4 border border-slate-600/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium text-sm sm:text-base capitalize">{stat}</h4>
                            <p className="text-slate-400 text-xs sm:text-sm">Current: {value}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-lg sm:text-xl font-bold text-purple-300">{value}</div>
                            <Button
                              onClick={() => allocateStat(stat)}
                              disabled={playerData.unspentStatPoints === 0}
                              size="sm"
                              className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed w-8 h-8 p-0"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Health & Mana */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50">
                    <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Health</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-slate-400">{playerData.health}/{playerData.maxHealth}</span>
                      <span className="text-red-400 font-medium text-sm sm:text-base">{Math.round((playerData.health / playerData.maxHealth) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                        style={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-700/50">
                    <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Mana</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm text-slate-400">{playerData.mana}/{playerData.maxMana}</span>
                      <span className="text-blue-400 font-medium text-sm sm:text-base">{Math.round((playerData.mana / playerData.maxMana) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                        style={{ width: `${(playerData.mana / playerData.maxMana) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="h-full p-4 sm:p-6 overflow-y-auto character-scrollbar">
              <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Relationship Constellation Access */}
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl p-4 sm:p-6 border border-purple-500/30">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Relationship Constellation</h3>
                      <p className="text-purple-200 text-sm sm:text-base">Your bond with Cha Hae-In</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed">
                    Explore your deepening relationship through shared memories, affection levels, and intimate moments. 
                    Track your emotional journey and the special connections you've built together.
                  </p>

                  {/* Current Affection Level Display */}
                  <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border border-pink-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm sm:text-base">Current Affection Level</h4>
                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-bold text-pink-300">{playerData.affection || 0}</div>
                        <div className="text-xs sm:text-sm text-pink-200">/ 1000</div>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 sm:h-3 overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((playerData.affection || 0) / 1000) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300">
                      Next unlock: {(playerData.affection || 0) >= 600 ? "All areas unlocked!" : 
                        (playerData.affection || 0) >= 500 ? "Wellness Spa at 600" :
                        (playerData.affection || 0) >= 400 ? "N Seoul Tower at 500" :
                        (playerData.affection || 0) >= 200 ? "Fine Dining at 400" :
                        "Luxury Shopping at 200"}
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-3 sm:p-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-purple-500/25"
                    onClick={() => {
                      onClose();
                      // This would trigger the relationship constellation view
                      console.log('Opening Relationship Constellation...');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        <div>
                          <h4 className="text-white font-medium text-sm sm:text-base">View Constellation</h4>
                          <p className="text-purple-100 text-xs sm:text-sm">Affection: {Math.round((playerData.stats?.intelligence || 10) * 5.5)}/1000</p>
                        </div>
                      </div>
                      <div className="text-white text-lg">→</div>
                    </div>
                  </motion.div>
                </div>

                {/* Placeholder for future skill systems */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <h3 className="text-lg font-bold text-white mb-2">Monarch's Skills</h3>
                    <p className="text-slate-400 text-sm">Advanced skill systems coming soon...</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="h-full overflow-y-auto character-scrollbar p-2 sm:p-6">
              <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-6">
                {/* Equipment Management Header */}
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4">Equipment Management</h3>
                  <p className="text-slate-300 mb-3 sm:mb-6 text-xs sm:text-base leading-relaxed">
                    Manage your inventory, equipment, and armory from this central hub.
                  </p>

                  {/* Equipment Action Cards - Mobile Optimized */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Inventory Card */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/30 cursor-pointer min-h-[60px] sm:min-h-[120px]"
                      onClick={() => {
                        onClose();
                        onOpenInventory?.();
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-lg font-bold text-white">Inventory</h4>
                          <p className="text-purple-200 text-xs sm:text-sm">Items & Resources</p>
                          <p className="text-slate-300 text-xs hidden sm:block mt-1">
                            Access consumables, materials, quest items
                          </p>
                        </div>
                        <div className="text-purple-300 text-lg font-light">
                          →
                        </div>
                      </div>
                    </motion.div>

                    {/* Armory Card */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-500/30 cursor-pointer min-h-[60px] sm:min-h-[120px]"
                      onClick={() => {
                        onClose();
                        onOpenArmory?.();
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-lg font-bold text-white">Armory</h4>
                          <p className="text-amber-200 text-xs sm:text-sm">Weapons & Equipment</p>
                          <p className="text-slate-300 text-xs hidden sm:block mt-1">
                            Equip weapons, armor, accessories
                          </p>
                        </div>
                        <div className="text-amber-300 text-lg font-light">
                          →
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Quick Equipment Overview - Mobile Optimized */}
                <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Inventory Items</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-300">24</p>
                          <p className="text-slate-400 text-xs">Items stored</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Equipped Items</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-300">6</p>
                          <p className="text-slate-400 text-xs">Currently equipped</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Equipment Power</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-300">S+</p>
                          <p className="text-slate-400 text-xs">Overall rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}