import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Sword, Shield, Zap, Heart, Star } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  icon: string;
  slot: 'weapon' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'ring' | 'necklace';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
    health?: number;
  };
}

interface MonarchArmory2DProps {
  isVisible: boolean;
  onClose: () => void;
}

const availableEquipment: Equipment[] = [
  {
    id: 'dragon_slayer_sword',
    name: 'Dragon Slayer Sword',
    icon: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 2200, speed: 150 }
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    icon: '🗡️',
    slot: 'chest',
    rarity: 'epic',
    stats: { defense: 800, speed: 200 }
  },
  {
    id: 'iron_boots',
    name: 'Iron Boots',
    icon: '👢',
    slot: 'boots',
    rarity: 'common',
    stats: { defense: 150, speed: 50 }
  }
];

const initialEquippedItems: {[key: string]: Equipment} = {
  weapon: {
    id: 'knight_sword',
    name: 'Knight\'s Sword',
    icon: '⚔️',
    slot: 'weapon',
    rarity: 'rare',
    stats: { attack: 1500, speed: 100 }
  }
};

export function MonarchArmory2D({ isVisible, onClose }: MonarchArmory2DProps) {
  const [equippedItems, setEquippedItems] = useState<{[key: string]: Equipment}>(initialEquippedItems);
  const [animatingStats, setAnimatingStats] = useState<{[key: string]: boolean}>({});
  const [selectedTab, setSelectedTab] = useState<'stats' | 'character' | 'equipment'>('stats');

  const totalStats = {
    attack: Object.values(equippedItems).reduce((sum, item) => sum + (item.stats.attack || 0), 0),
    defense: Object.values(equippedItems).reduce((sum, item) => sum + (item.stats.defense || 0), 0),
    speed: Object.values(equippedItems).reduce((sum, item) => sum + (item.stats.speed || 0), 0),
    magic: Object.values(equippedItems).reduce((sum, item) => sum + (item.stats.magic || 0), 0),
    health: Object.values(equippedItems).reduce((sum, item) => sum + (item.stats.health || 0), 0)
  };

  const handleEquipItem = (item: Equipment) => {
    const previousItem = equippedItems[item.slot];
    setEquippedItems(prev => ({ ...prev, [item.slot]: item }));
    
    // Animate stat changes
    setAnimatingStats(prev => ({ ...prev, ...Object.keys(item.stats).reduce((acc, stat) => ({ ...acc, [stat]: true }), {}) }));
    setTimeout(() => setAnimatingStats({}), 600);
  };

  const handleUnequipItem = (slot: string) => {
    setEquippedItems(prev => {
      const newItems = { ...prev };
      delete newItems[slot];
      return newItems;
    });
    
    // Animate stat changes
    setAnimatingStats(prev => ({ 
      ...prev, 
      attack: true, 
      defense: true, 
      speed: true, 
      magic: true, 
      health: true 
    }));
    setTimeout(() => setAnimatingStats({}), 600);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-yellow-400 bg-yellow-400/10';
      case 'epic': return 'border-purple-400 bg-purple-400/10';
      case 'rare': return 'border-blue-400 bg-blue-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  const getStatIcon = (stat: string) => {
    switch (stat) {
      case 'attack': return <Sword className="w-4 h-4" />;
      case 'defense': return <Shield className="w-4 h-4" />;
      case 'speed': return <Zap className="w-4 h-4" />;
      case 'magic': return <Star className="w-4 h-4" />;
      case 'health': return <Heart className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getStatColor = (stat: string) => {
    switch (stat) {
      case 'attack': return 'text-red-400';
      case 'defense': return 'text-blue-400';
      case 'speed': return 'text-green-400';
      case 'magic': return 'text-purple-400';
      case 'health': return 'text-pink-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[55] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full h-full max-w-md mx-auto bg-slate-900 flex flex-col"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-purple-500/20 relative">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-white font-semibold text-lg">Monarch's Armory</h2>
                  <p className="text-slate-400 text-sm">Equipment Management</p>
                </div>
              </div>
              
              {/* Close Button - Fixed positioning */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors z-[60] shadow-lg"
                aria-label="Close Armory"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Mobile Tab Navigation */}
            <div className="flex border-b border-purple-500/20 bg-slate-800">
              {[
                { id: 'stats', label: 'Stats', icon: '📊' },
                { id: 'character', label: 'Character', icon: '👤' },
                { id: 'equipment', label: 'Equipment', icon: '⚔️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    selectedTab === tab.id
                      ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-400/10'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {selectedTab === 'stats' && (
                <div className="p-4 space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-4">Total Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(totalStats).map(([stat, value]) => (
                      <motion.div
                        key={stat}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4"
                        animate={animatingStats[stat] ? { 
                          backgroundColor: ['rgba(168, 85, 247, 0.2)', 'rgba(30, 41, 59, 0.5)'],
                          scale: [1, 1.05, 1]
                        } : {}}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={getStatColor(stat)}>
                            {getStatIcon(stat)}
                          </div>
                          <span className="text-slate-300 text-sm capitalize font-medium">{stat}</span>
                        </div>
                        <motion.div
                          className={`text-2xl font-bold ${animatingStats[stat] ? 'text-purple-400' : 'text-white'}`}
                          animate={animatingStats[stat] ? { y: [-10, 0] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {value}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'character' && (
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-4">Character Overview</h3>
                  <div className="bg-slate-800/50 border border-purple-500/30 rounded-xl p-6">
                    {/* Character Silhouette */}
                    <div className="relative w-full h-64 mb-6">
                      <svg viewBox="0 0 100 120" className="w-full h-full">
                        <path 
                          d="M50 10 L45 15 L45 25 L40 30 L35 35 L35 45 L30 50 L30 65 L35 70 L35 80 L40 85 L40 95 L45 100 L45 110 L55 110 L55 100 L60 95 L60 85 L65 80 L65 70 L70 65 L70 50 L65 45 L65 35 L60 30 L55 25 L55 15 Z" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1" 
                          className="text-purple-400/30" 
                        />
                      </svg>
                    </div>

                    {/* Equipment Slots */}
                    <div className="space-y-3">
                      {Object.entries(equippedItems).map(([slot, item]) => (
                        <div key={slot} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="flex-1">
                            <div className="text-white font-medium">{item.name}</div>
                            <div className="text-slate-400 text-sm capitalize">{slot}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${getRarityBorder(item.rarity)}`}>
                              {item.rarity}
                            </div>
                            <button
                              onClick={() => handleUnequipItem(slot)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                              Unequip
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'equipment' && (
                <div className="p-4 space-y-4">
                  <h3 className="text-white font-semibold text-lg mb-4">Available Equipment</h3>
                  {availableEquipment.map((item) => (
                    <div
                      key={item.id}
                      className={`w-full p-4 rounded-xl border-2 ${getRarityBorder(item.rarity)} transition-all`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-medium">{item.name}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityBorder(item.rarity)}`}>
                              {item.rarity}
                            </span>
                          </div>
                          <div className="text-slate-400 text-sm capitalize mb-2">{item.slot}</div>
                          <div className="flex gap-3 text-sm mb-3">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <div key={stat} className={`flex items-center gap-1 ${getStatColor(stat)}`}>
                                {getStatIcon(stat)}
                                <span>+{value}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleEquipItem(item)}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Equip Item
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {availableEquipment.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <div className="text-4xl mb-2">⚔️</div>
                      <p>No equipment available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}