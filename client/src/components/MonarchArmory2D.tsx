import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, X, Sword, Shield, Zap, Heart, ArrowUp } from 'lucide-react';

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
    id: 'dragon-slayer-sword',
    name: 'Dragon Slayer Sword',
    icon: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 2200, speed: 150 }
  },
  {
    id: 'shadow-blade',
    name: 'Shadow Monarch\'s Blade',
    icon: '🗡️',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 1800, magic: 200, speed: 180 }
  },
  {
    id: 'void-knight-armor',
    name: 'Void Knight Armor',
    icon: '🛡️',
    slot: 'chest',
    rarity: 'epic',
    stats: { defense: 450, health: 800 }
  },
  {
    id: 'shadow-helm',
    name: 'Shadow Monarch\'s Crown',
    icon: '👑',
    slot: 'helmet',
    rarity: 'legendary',
    stats: { magic: 300, defense: 200 }
  },
  {
    id: 'speed-boots',
    name: 'Wind Walker Boots',
    icon: '👢',
    slot: 'boots',
    rarity: 'epic',
    stats: { speed: 250, defense: 150 }
  },
  {
    id: 'power-gloves',
    name: 'Titan\'s Grasp',
    icon: '🧤',
    slot: 'gloves',
    rarity: 'rare',
    stats: { attack: 300, defense: 100 }
  }
];

const initialEquippedItems: {[key: string]: Equipment} = {
  weapon: {
    id: 'basic-sword',
    name: 'Basic Iron Sword',
    icon: '⚔️',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 1500 }
  },
  helmet: {
    id: 'basic-helm',
    name: 'Iron Helmet',
    icon: '⛑️',
    slot: 'helmet',
    rarity: 'common',
    stats: { defense: 200 }
  }
};

const slotIcons = {
  weapon: '⚔️',
  helmet: '⛑️',
  chest: '🛡️',
  gloves: '🧤',
  boots: '👢',
  ring: '💍',
  necklace: '📿'
};

const slotPositions = {
  helmet: { x: 50, y: 15 },
  weapon: { x: 25, y: 35 },
  chest: { x: 50, y: 40 },
  gloves: { x: 75, y: 35 },
  boots: { x: 50, y: 65 },
  ring: { x: 20, y: 60 },
  necklace: { x: 50, y: 25 }
};

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'border-amber-400 bg-amber-400/20';
    case 'epic': return 'border-purple-400 bg-purple-400/20';
    case 'rare': return 'border-blue-400 bg-blue-400/20';
    default: return 'border-gray-400 bg-gray-400/20';
  }
};

const getRarityTextColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'text-amber-400';
    case 'epic': return 'text-purple-400';
    case 'rare': return 'text-blue-400';
    default: return 'text-gray-400';
  }
};

export function MonarchArmory2D({ isVisible, onClose }: MonarchArmory2DProps) {
  const [equippedItems, setEquippedItems] = useState<{[key: string]: Equipment}>(initialEquippedItems);
  const [hoveredItem, setHoveredItem] = useState<Equipment | null>(null);
  const [animatingStats, setAnimatingStats] = useState<{[key: string]: boolean}>({});

  const calculateTotalStats = () => {
    let totalStats = { attack: 0, defense: 0, speed: 0, magic: 0, health: 0 };
    
    Object.values(equippedItems).forEach(item => {
      totalStats.attack += item.stats.attack || 0;
      totalStats.defense += item.stats.defense || 0;
      totalStats.speed += item.stats.speed || 0;
      totalStats.magic += item.stats.magic || 0;
      totalStats.health += item.stats.health || 0;
    });
    
    return totalStats;
  };

  const handleEquipItem = (item: Equipment) => {
    const currentEquipped = equippedItems[item.slot];
    const newEquipped = { ...equippedItems, [item.slot]: item };
    
    // Calculate stat changes for animation
    const oldStats = calculateTotalStats();
    setEquippedItems(newEquipped);
    
    // Trigger stat change animations
    setTimeout(() => {
      const newStats = calculateTotalStats();
      const changedStats: {[key: string]: boolean} = {};
      
      Object.keys(newStats).forEach(stat => {
        if (oldStats[stat as keyof typeof oldStats] !== newStats[stat as keyof typeof newStats]) {
          changedStats[stat] = true;
        }
      });
      
      setAnimatingStats(changedStats);
      
      // Clear animations after 1 second
      setTimeout(() => setAnimatingStats({}), 1000);
    }, 300);
  };

  const getStatComparison = (newItem: Equipment, currentItem: Equipment | undefined) => {
    if (!currentItem) return null;
    
    const comparison: {[key: string]: {old: number, new: number, change: number}} = {};
    
    Object.keys(newItem.stats).forEach(stat => {
      const newValue = newItem.stats[stat as keyof typeof newItem.stats] || 0;
      const oldValue = currentItem.stats[stat as keyof typeof currentItem.stats] || 0;
      const change = newValue - oldValue;
      
      if (change !== 0) {
        comparison[stat] = { old: oldValue, new: newValue, change };
      }
    });
    
    return comparison;
  };

  const totalStats = calculateTotalStats();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-7xl h-[90vh] bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Monarch's Armory</h2>
              <p className="text-purple-300 text-sm">Maximum Clarity and Speed</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Main Content - Mobile-First Responsive Layout */}
        <div className="flex flex-col lg:flex-row h-[calc(100%-80px)] overflow-hidden">
          {/* Column 1: Total Stats Panel */}
          <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-purple-500/20 p-4 lg:p-6 flex-shrink-0">
            <h3 className="text-white font-semibold mb-6 text-lg">Total Stats</h3>
            <div className="space-y-4">
              {Object.entries(totalStats).map(([stat, value]) => (
                <motion.div
                  key={stat}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  animate={animatingStats[stat] ? { 
                    backgroundColor: ['rgba(251, 191, 36, 0.2)', 'rgba(30, 41, 59, 0.5)'],
                    scale: [1, 1.05, 1]
                  } : {}}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      stat === 'attack' ? 'bg-red-400' :
                      stat === 'defense' ? 'bg-blue-400' :
                      stat === 'speed' ? 'bg-green-400' :
                      stat === 'magic' ? 'bg-purple-400' :
                      'bg-pink-400'
                    }`} />
                    <span className="text-white font-medium capitalize">{stat}</span>
                  </div>
                  <motion.span
                    className={`text-lg font-bold ${animatingStats[stat] ? 'text-amber-400' : 'text-white'}`}
                    animate={animatingStats[stat] ? { y: [-10, 0] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {value}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Column 2: Monarch's Schematic (Paper Doll) */}
          <div className="flex-1 p-4 lg:p-6 flex flex-col items-center justify-center min-h-0">
            <h3 className="text-white font-semibold mb-4 lg:mb-6 text-lg">Monarch's Schematic</h3>
            <div className="relative w-64 h-80 lg:w-80 lg:h-96 border border-purple-500/30 rounded-xl bg-slate-800/30 overflow-hidden">
              {/* Stylized Jin-Woo Silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 120" className="w-full h-full opacity-20">
                  <path d="M50 10 L45 15 L45 25 L40 30 L35 35 L35 45 L30 50 L30 65 L35 70 L35 80 L40 85 L40 95 L45 100 L45 110 L55 110 L55 100 L60 95 L60 85 L65 80 L65 70 L70 65 L70 50 L65 45 L65 35 L60 30 L55 25 L55 15 Z" 
                        fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
                </svg>
              </div>
              
              {/* Equipment Slots */}
              {Object.entries(slotPositions).map(([slot, position]) => {
                const equippedItem = equippedItems[slot];
                const isGlowing = hoveredItem && hoveredItem.slot === slot;
                
                return (
                  <motion.div
                    key={slot}
                    className={`absolute w-12 h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                      equippedItem 
                        ? `${getRarityBorder(equippedItem.rarity)} border-solid` 
                        : 'border-slate-600 bg-slate-800/50'
                    } ${isGlowing ? 'ring-2 ring-purple-400 shadow-lg shadow-purple-400/30' : ''}`}
                    style={{ 
                      left: `${position.x}%`, 
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={isGlowing ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {equippedItem ? (
                      <span className="text-2xl">{equippedItem.icon}</span>
                    ) : (
                      <span className="text-slate-500 text-xl">{slotIcons[slot as keyof typeof slotIcons]}</span>
                    )}
                  </motion.div>
                );
              })}

              {/* Stat Comparison Tooltip */}
              {hoveredItem && equippedItems[hoveredItem.slot] && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-4 top-4 bg-slate-900/95 border border-purple-400/50 rounded-lg p-3 min-w-48"
                >
                  <h4 className="text-white font-medium mb-2 text-sm">Stat Comparison</h4>
                  {Object.entries(getStatComparison(hoveredItem, equippedItems[hoveredItem.slot]) || {}).map(([stat, comparison]) => (
                    <div key={stat} className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 capitalize">{stat}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{comparison.old}</span>
                        <ArrowUp className={`w-3 h-3 ${comparison.change > 0 ? 'text-green-400' : 'text-red-400'}`} />
                        <span className={comparison.change > 0 ? 'text-green-400' : 'text-red-400'} font-medium>
                          {comparison.new}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Column 3: Available Equipment */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-purple-500/20 p-4 lg:p-6 flex flex-col min-h-0">
            <h3 className="text-white font-semibold mb-4 lg:mb-6 text-lg flex-shrink-0">Available Equipment</h3>
            <div className="space-y-3 flex-1 overflow-y-auto character-scrollbar touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
              {availableEquipment.map((item) => (
                <motion.button
                  key={item.id}
                  className={`w-full p-4 rounded-xl border-2 ${getRarityBorder(item.rarity)} text-left transition-all hover:scale-[1.02] min-h-[60px] touch-manipulation`}
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onTouchStart={() => setHoveredItem(item)}
                  onTouchEnd={() => setHoveredItem(null)}
                  onClick={() => handleEquipItem(item)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1">
                      <h4 className={`font-medium ${getRarityTextColor(item.rarity)}`}>{item.name}</h4>
                      <p className="text-slate-400 text-xs capitalize">{item.slot}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <span key={stat} className="text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                        {stat}: +{value}
                      </span>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}