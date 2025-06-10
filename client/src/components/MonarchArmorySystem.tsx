import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, Crown, Shirt, Gem, Zap, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'helmet';
  slot: 'weapon' | 'chest' | 'helmet' | 'boots' | 'gloves' | 'ring' | 'necklace';
  stats: {
    attack?: number;
    defense?: number;
    strength?: number;
    agility?: number;
    vitality?: number;
    intelligence?: number;
    sense?: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  model: string;
  description: string;
  equipped: boolean;
}

interface MonarchArmorySystemProps {
  isVisible: boolean;
  onClose: () => void;
}

const equipmentSlots = [
  { id: 'helmet', label: 'Helmet', position: { x: 50, y: 15 }, icon: Crown },
  { id: 'weapon', label: 'Weapon', position: { x: 15, y: 35 }, icon: Sword },
  { id: 'chest', label: 'Chest Armor', position: { x: 50, y: 40 }, icon: Shirt },
  { id: 'gloves', label: 'Gloves', position: { x: 85, y: 35 }, icon: Shield },
  { id: 'boots', label: 'Boots', position: { x: 50, y: 75 }, icon: Shield },
  { id: 'ring', label: 'Ring', position: { x: 20, y: 60 }, icon: Gem },
  { id: 'necklace', label: 'Necklace', position: { x: 50, y: 25 }, icon: Gem }
];

const sampleEquipment: Equipment[] = [
  {
    id: 'shadow_blade',
    name: 'Shadow Monarch\'s Blade',
    type: 'weapon',
    slot: 'weapon',
    stats: { attack: 2500, strength: 150, agility: 75 },
    rarity: 'legendary',
    icon: '⚔️',
    model: 'shadow_sword_3d',
    description: 'The legendary blade of the Shadow Monarch, forged from the essence of darkness itself.',
    equipped: true
  },
  {
    id: 'monarch_armor',
    name: 'Monarch\'s Regalia',
    type: 'armor',
    slot: 'chest',
    stats: { defense: 1200, vitality: 200, intelligence: 100 },
    rarity: 'legendary',
    icon: '🛡️',
    model: 'monarch_armor_3d',
    description: 'Royal armor befitting the Shadow Monarch, providing unparalleled protection.',
    equipped: true
  },
  {
    id: 'crown_shadows',
    name: 'Crown of Shadows',
    type: 'accessory',
    slot: 'helmet',
    stats: { intelligence: 250, sense: 150, defense: 500 },
    rarity: 'legendary',
    icon: '👑',
    model: 'shadow_crown_3d',
    description: 'A crown that channels the power of the shadow realm.',
    equipped: false
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer Sword',
    type: 'weapon',
    slot: 'weapon',
    stats: { attack: 2200, strength: 120, vitality: 50 },
    rarity: 'epic',
    icon: '🗡️',
    model: 'dragon_sword_3d',
    description: 'A massive blade forged to slay the mightiest dragons.',
    equipped: false
  },
  {
    id: 'assassin_boots',
    name: 'Shadow Walker Boots',
    type: 'armor',
    slot: 'boots',
    stats: { agility: 180, sense: 120, defense: 300 },
    rarity: 'epic',
    icon: '👢',
    model: 'shadow_boots_3d',
    description: 'Boots that allow silent movement through any terrain.',
    equipped: false
  }
];

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-400 bg-gray-400/10';
    case 'rare': return 'border-blue-400 bg-blue-400/10';
    case 'epic': return 'border-purple-400 bg-purple-400/10';
    case 'legendary': return 'border-amber-400 bg-amber-400/10';
    default: return 'border-gray-400 bg-gray-400/10';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'shadow-lg shadow-gray-500/20';
    case 'rare': return 'shadow-xl shadow-blue-500/30';
    case 'epic': return 'shadow-xl shadow-purple-500/40';
    case 'legendary': return 'shadow-2xl shadow-amber-500/50';
    default: return 'shadow-lg shadow-gray-500/20';
  }
};

export function MonarchArmorySystem({ isVisible, onClose }: MonarchArmorySystemProps) {
  const [draggedItem, setDraggedItem] = useState<Equipment | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [upgradeMode, setUpgradeMode] = useState(false);

  const equippedItems = sampleEquipment.filter(item => item.equipped);
  const availableItems = sampleEquipment.filter(item => !item.equipped);

  const handleDragStart = (item: Equipment) => {
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleEquipItem = (item: Equipment, slot: string) => {
    console.log(`Equipping ${item.name} to ${slot} slot`);
    // Implement equipment logic with visual feedback
  };

  const handleUpgradeItem = (item: Equipment) => {
    setSelectedItem(item);
    setUpgradeMode(true);
  };

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
          className="absolute inset-4 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden"
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
            <div className="relative h-full overflow-hidden">
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
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-64 h-8 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent rounded-full blur-sm" />
                
                {/* 3D Character Model Placeholder */}
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-48 h-80 flex items-center justify-center">
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
                    {Object.entries(equipmentSlots).map(([slot, coords]) => (
                      <motion.div
                        key={slot}
                        className="absolute w-8 h-8 border-2 border-purple-400/50 rounded-lg bg-purple-500/10 cursor-pointer hover:bg-purple-500/20 transition-colors"
                        style={{
                          left: `${coords.x}%`,
                          top: `${coords.y}%`
                        }}
                        whileHover={{ scale: 1.1 }}
                        title={`${slot} slot`}
                      />
                    ))}
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
                <div className="absolute bottom-6 left-6 right-6 h-32">
                  <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 h-full">
                    <h3 className="text-white font-bold mb-3">Available Equipment</h3>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                      {sampleEquipment.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`min-w-20 h-20 rounded-xl border-2 ${getRarityBorder(item.rarity)} bg-slate-800/50 cursor-pointer flex items-center justify-center text-3xl relative group`}
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
                          className={`absolute w-12 h-12 rounded-lg border-2 border-dashed ${
                            equippedItem ? 'border-amber-400 bg-amber-400/20' : 'border-purple-400/50'
                          } flex items-center justify-center text-2xl cursor-pointer`}
                          style={{
                            left: `${slot.position.x}%`,
                            top: `${slot.position.y}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          whileHover={{ scale: 1.1 }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedItem && draggedItem.slot === slot.id) {
                              handleEquipItem(draggedItem, slot.id);
                            }
                          }}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {equippedItem ? (
                            <motion.div
                              className="text-3xl"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              {equippedItem.icon}
                            </motion.div>
                          ) : (
                            <slot.icon className="w-6 h-6 text-purple-400/50" />
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>

                {/* Equipment Stats Display */}
                <div className="absolute top-6 left-6 bg-slate-800/80 backdrop-blur-sm rounded-xl border border-purple-500/30 p-4 min-w-64">
                  <h3 className="text-white font-bold mb-3">Total Stats</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Attack:</span>
                      <span className="text-red-300 font-bold">
                        {equippedItems.reduce((sum, item) => sum + (item.stats.attack || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Defense:</span>
                      <span className="text-blue-300 font-bold">
                        {equippedItems.reduce((sum, item) => sum + (item.stats.defense || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Strength:</span>
                      <span className="text-orange-300 font-bold">
                        {equippedItems.reduce((sum, item) => sum + (item.stats.strength || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Agility:</span>
                      <span className="text-green-300 font-bold">
                        {equippedItems.reduce((sum, item) => sum + (item.stats.agility || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipment Carousel */}
              <div className="w-80 border-l border-purple-500/20 p-6 bg-slate-800/30">
                <h3 className="text-white font-bold mb-4">Available Equipment</h3>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto character-scrollbar">
                  {availableItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`p-4 rounded-xl border-2 cursor-grab active:cursor-grabbing ${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)}`}
                      draggable
                      onDragStart={() => handleDragStart(item)}
                      onDragEnd={handleDragEnd}
                      whileHover={{ scale: 1.02 }}
                      whileDrag={{ scale: 1.1, rotate: 5 }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-sm">{item.name}</h4>
                          <p className="text-slate-400 text-xs capitalize">{item.type}</p>
                        </div>
                        <Button
                          onClick={() => handleUpgradeItem(item)}
                          size="sm"
                          variant="ghost"
                          className="text-amber-400 hover:bg-amber-400/10"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between">
                            <span className="text-slate-400 capitalize">{stat}:</span>
                            <span className="text-white font-bold">+{value}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Shadow Forge Upgrade View */
            <div className="flex items-center justify-center h-full relative">
              <Button
                onClick={() => setUpgradeMode(false)}
                className="absolute top-6 left-6 bg-slate-700/50 hover:bg-slate-700/70"
              >
                Back to Armory
              </Button>
              
              <div className="text-center">
                <h3 className="text-2xl text-white font-bold mb-8">Shadow Forge</h3>
                {selectedItem && (
                  <motion.div
                    className="w-32 h-32 mx-auto mb-8 text-8xl"
                    animate={{
                      y: [0, -10, 0],
                      rotateY: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {selectedItem.icon}
                  </motion.div>
                )}
                <p className="text-amber-300 text-lg mb-4">Drag materials here to upgrade</p>
                <p className="text-slate-400">Upgrade system coming soon...</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}