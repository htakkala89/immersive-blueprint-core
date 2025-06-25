import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Crown, X, Sword, Shield, Zap, Heart } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  icon: string;
  slot: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
  };
}

interface MonarchArmorySystemProps {
  isVisible: boolean;
  onClose: () => void;
}

const sampleEquipment: Equipment[] = [
  {
    id: 'shadow-blade',
    name: 'Shadow Monarch\'s Blade',
    icon: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 350, speed: 50 }
  },
  {
    id: 'void-armor',
    name: 'Void Knight Armor',
    icon: '🛡️',
    slot: 'chest',
    rarity: 'epic',
    stats: { defense: 280, magic: 40 }
  },
  {
    id: 'shadow-cloak',
    name: 'Cloak of Shadows',
    icon: '🧥',
    slot: 'cloak',
    rarity: 'rare',
    stats: { speed: 60, defense: 30 }
  }
];

const equipmentSlots = {
  weapon: { x: 30, y: 20 },
  helmet: { x: 50, y: 10 },
  chest: { x: 50, y: 30 },
  gloves: { x: 20, y: 40 },
  boots: { x: 50, y: 60 }
};

const baseStats = {
  strength: 500,
  agility: 300,
  vitality: 400,
  intelligence: 200,
  sense: 100
};

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return 'border-amber-400 bg-amber-400/10';
    case 'epic': return 'border-purple-400 bg-purple-400/10';
    case 'rare': return 'border-blue-400 bg-blue-400/10';
    default: return 'border-gray-400 bg-gray-400/10';
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

const getStatColor = (stat: string) => {
  switch (stat) {
    case 'strength': return 'bg-red-500';
    case 'agility': return 'bg-green-500';
    case 'vitality': return 'bg-blue-500';
    case 'intelligence': return 'bg-purple-500';
    case 'sense': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export function MonarchArmorySystemFixed({ isVisible, onClose }: MonarchArmorySystemProps) {
  const [upgradeMode, setUpgradeMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [equippedItems, setEquippedItems] = useState<{[key: string]: Equipment}>({});

  const handleEquipItem = (item: Equipment, slot: string) => {
    console.log(`Equipping ${item.name} to ${slot} slot`);
    setEquippedItems(prev => ({
      ...prev,
      [slot]: item
    }));
  };

  const handleUpgradeItem = (item: Equipment) => {
    setSelectedItem(item);
    setUpgradeMode(true);
  };

  const handleUnequipItem = (slot: string) => {
    setEquippedItems(prev => {
      const newEquipped = { ...prev };
      delete newEquipped[slot];
      return newEquipped;
    });
  };

  // Calculate total stats including equipped items
  const calculateTotalStats = () => {
    const totalStats = { ...baseStats };
    
    Object.values(equippedItems).forEach(item => {
      if (item.stats.attack) totalStats.strength += item.stats.attack;
      if (item.stats.defense) totalStats.vitality += item.stats.defense;
      if (item.stats.speed) totalStats.agility += item.stats.speed;
      if (item.stats.magic) totalStats.intelligence += item.stats.magic;
    });

    return {
      strength: totalStats.strength,
      agility: totalStats.agility,
      vitality: totalStats.vitality,
      intelligence: totalStats.intelligence,
      sense: totalStats.sense
    };
  };

  const totalStats = calculateTotalStats();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="absolute inset-4 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(30, 27, 75, 0.95) 0%, rgba(15, 23, 42, 0.95) 70%)',
            boxShadow: '0 0 80px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Monarch's Armory</h2>
                <p className="text-amber-300 text-sm">Equip and upgrade your legendary gear</p>
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

          {!upgradeMode ? (
            /* Immersive 3D Armory Environment */
            <div className="flex-1 relative overflow-hidden">
              {/* 3D Shadow Dimension Environment */}
              <div className="absolute inset-0">
                {/* Dynamic Ethereal Background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
                      radial-gradient(circle at 40% 80%, rgba(168, 85, 247, 0.25) 0%, transparent 50%),
                      linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 27, 75, 0.9) 50%, rgba(15, 23, 42, 0.9) 100%)
                    `
                  }}
                />
                
                {/* Mystical Floating Particles */}
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-30"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              {/* Character Platform */}
              <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rounded-full blur-sm" />
              
              {/* 3D Character Model Placeholder */}
              <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 w-48 h-64 flex items-center justify-center">
                <motion.div
                  className="w-32 h-64 bg-gradient-to-b from-purple-600/30 to-purple-800/30 rounded-lg border border-purple-400/30 flex items-center justify-center relative"
                  animate={{
                    y: [0, -5, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-6xl">🤴</div>
                  
                  {/* Equipment Slots Overlay */}
                  {Object.entries(equipmentSlots).map(([slot, coords]) => {
                    const equippedItem = equippedItems[slot];
                    return (
                      <motion.div
                        key={slot}
                        className={`absolute w-8 h-8 border-2 rounded-lg cursor-pointer transition-colors ${
                          equippedItem 
                            ? 'border-amber-400 bg-amber-400/20 hover:bg-amber-400/30' 
                            : 'border-purple-400/50 bg-purple-500/10 hover:bg-purple-500/20'
                        }`}
                        style={{
                          left: `${coords.x}%`,
                          top: `${coords.y}%`
                        }}
                        whileHover={{ scale: 1.1 }}
                        title={equippedItem ? `${equippedItem.name} (${slot})` : `${slot} slot`}
                        onClick={() => {
                          if (equippedItem) {
                            handleUnequipItem(slot);
                          }
                        }}
                      >
                        {equippedItem && (
                          <motion.div
                            className="text-lg flex items-center justify-center w-full h-full"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            {equippedItem.icon}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
              
              {/* Floating Total Stats Panel - Top Right */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="absolute top-6 right-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl"
                style={{
                  backdropFilter: 'blur(40px) saturate(180%)',
                  borderImage: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(168,85,247,0.1)) 1'
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Total Stats</h3>
                </div>
                
                {/* Stat Bars */}
                <div className="space-y-4">
                  {Object.entries(totalStats).map(([stat, value]) => (
                    <div key={stat} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 capitalize text-sm font-medium">{stat}</span>
                        <span className="text-white font-bold">{value}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <motion.div
                          className={`h-2 rounded-full ${getStatColor(stat)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((value / 1000) * 100, 100)}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Equipment Carousel at Bottom */}
              <div className="absolute bottom-2 left-6 right-6 h-24">
                <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-3 h-full">
                  <h3 className="text-white font-bold mb-2 text-sm">Available Equipment</h3>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide h-14">
                    {sampleEquipment.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`min-w-14 h-14 rounded-xl border-2 ${getRarityBorder(item.rarity)} bg-slate-800/50 cursor-pointer flex items-center justify-center text-2xl relative group`}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onClick={() => handleEquipItem(item, item.slot)}
                      >
                        {item.icon}
                        
                        {/* Hover Tooltip using the designed card layout */}
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          whileHover={{ opacity: 1, y: 0, scale: 1 }}
                          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-10"
                        >
                          <div className="text-center mb-3">
                            <div className={`w-16 h-16 mx-auto rounded-xl border-2 ${getRarityBorder(item.rarity)} flex items-center justify-center text-4xl mb-2`}>
                              {item.icon}
                            </div>
                            <h4 className={`font-bold ${getRarityTextColor(item.rarity)}`}>{item.name}</h4>
                            <p className="text-slate-400 text-sm capitalize">{item.slot}</p>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            {Object.entries(item.stats).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between">
                                <span className="text-slate-300 capitalize">{stat}:</span>
                                <span className="text-green-400 font-bold">+{value}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-purple-500/20">
                            <Button
                              size="sm"
                              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEquipItem(item, item.slot);
                              }}
                            >
                              Equip
                            </Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Shadow Forge Upgrade Mode */
            <div className="p-6 h-full overflow-y-auto">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-2">Shadow Forge</h3>
                <p className="text-purple-300">Enhance your legendary equipment</p>
              </div>
              
              {selectedItem && (
                <div className="max-w-md mx-auto">
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-purple-500/30">
                    <div className="text-center mb-6">
                      <div className={`w-24 h-24 mx-auto rounded-xl border-2 ${getRarityBorder(selectedItem.rarity)} flex items-center justify-center text-6xl mb-4`}>
                        {selectedItem.icon}
                      </div>
                      <h4 className={`text-xl font-bold ${getRarityTextColor(selectedItem.rarity)}`}>
                        {selectedItem.name}
                      </h4>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-white font-medium mb-2">Current Stats</h5>
                        {Object.entries(selectedItem.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between text-sm">
                            <span className="text-slate-300 capitalize">{stat}:</span>
                            <span className="text-green-400">+{value}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => setUpgradeMode(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button
                          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}