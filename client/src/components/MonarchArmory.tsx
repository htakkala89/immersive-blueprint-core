import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Crown, Zap, X, Gem, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'rune';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  stats: {
    attack?: number;
    defense?: number;
    speed?: number;
    mana?: number;
  };
  description: string;
  image: string;
  equipped: boolean;
  upgradable: boolean;
}

interface ArmoryProps {
  isVisible: boolean;
  onClose: () => void;
  playerLevel: number;
  equipment: Equipment[];
  onEquip: (itemId: string, slot: string) => void;
  onUpgrade: (itemId: string) => void;
  onGiftToChaHaeIn?: (itemId: string) => void;
}

export function MonarchArmory({ 
  isVisible, 
  onClose, 
  playerLevel, 
  equipment = [],
  onEquip,
  onUpgrade,
  onGiftToChaHaeIn 
}: ArmoryProps) {
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [viewMode, setViewMode] = useState<'equip' | 'upgrade' | 'gift'>('equip');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const modelRef = useRef<HTMLDivElement>(null);

  // Sample equipment data
  const sampleEquipment: Equipment[] = equipment.length > 0 ? equipment : [
    {
      id: 'kasaka_fang',
      name: "Kasaka's Fang",
      type: 'weapon',
      rarity: 'legendary',
      stats: { attack: 150, speed: 20 },
      description: 'A legendary dagger that thirsts for the blood of demons.',
      image: '/dagger.png',
      equipped: true,
      upgradable: true
    },
    {
      id: 'shadow_armor',
      name: 'Shadow Monarch Coat',
      type: 'armor',
      rarity: 'mythic',
      stats: { defense: 200, mana: 50 },
      description: 'The legendary coat of the Shadow Monarch himself.',
      image: '/coat.png',
      equipped: true,
      upgradable: false
    },
    {
      id: 'demon_ring',
      name: 'Ring of Eternal Shadows',
      type: 'accessory',
      rarity: 'epic',
      stats: { attack: 30, mana: 40 },
      description: 'A ring imbued with the power of shadow magic.',
      image: '/ring.png',
      equipped: false,
      upgradable: true
    }
  ];

  const activeEquipment = sampleEquipment;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!modelRef.current) return;
    const rect = modelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotationY = (e.clientX - centerX) / rect.width * 60;
    const rotationX = (e.clientY - centerY) / rect.height * -30;
    
    setRotation({ x: rotationX, y: rotationY });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'mythic': return 'from-red-400 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-lg shadow-gray-500/30';
      case 'rare': return 'shadow-lg shadow-blue-500/50';
      case 'epic': return 'shadow-lg shadow-purple-500/50';
      case 'legendary': return 'shadow-lg shadow-yellow-500/50';
      case 'mythic': return 'shadow-lg shadow-red-500/50';
      default: return 'shadow-lg shadow-gray-500/30';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-950 via-purple-950 to-black"
    >
      {/* Header */}
      <div className="relative z-10 p-4 flex justify-between items-center">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="liquid-glass p-4"
        >
          <h2 className="text-2xl font-bold text-white mb-1">Monarch's Armory</h2>
          <p className="text-purple-300 text-sm">Level {playerLevel} Shadow Monarch</p>
        </motion.div>

        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('equip')}
            variant={viewMode === 'equip' ? 'default' : 'ghost'}
            className="text-white"
          >
            <Sword className="w-4 h-4 mr-1" />
            Equip
          </Button>
          <Button
            onClick={() => setViewMode('upgrade')}
            variant={viewMode === 'upgrade' ? 'default' : 'ghost'}
            className="text-white"
          >
            <Gem className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
          <Button
            onClick={() => setViewMode('gift')}
            variant={viewMode === 'gift' ? 'default' : 'ghost'}
            className="text-white"
          >
            <Crown className="w-4 h-4 mr-1" />
            Gift
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-500/20 border border-white/20 liquid-glass"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex h-full pt-20 pb-4">
        {/* 3D Character Model Area */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            ref={modelRef}
            className="relative w-96 h-96 backdrop-blur-md bg-white/5 rounded-xl border border-purple-500/30 overflow-hidden"
            onMouseMove={handleMouseMove}
            style={{
              transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
            }}
          >
            {/* Character Silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-48 h-80 bg-gradient-to-b from-purple-600/30 to-black/50 rounded-full"
                animate={{ 
                  boxShadow: selectedItem 
                    ? `0 0 40px ${selectedItem.rarity === 'legendary' ? '#f59e0b' : 
                        selectedItem.rarity === 'mythic' ? '#ef4444' : '#8b5cf6'}80`
                    : '0 0 20px rgba(139, 92, 246, 0.3)'
                }}
              >
                {/* Equipment Slots */}
                <motion.div 
                  className="absolute top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-purple-400 rounded-full bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => console.log('Head slot')}
                >
                  <Crown className="w-4 h-4 text-purple-300" />
                </motion.div>

                <motion.div 
                  className="absolute top-20 left-1/2 transform -translate-x-1/2 w-12 h-16 border-2 border-purple-400 rounded bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => console.log('Armor slot')}
                >
                  <Shield className="w-6 h-6 text-purple-300" />
                </motion.div>

                <motion.div 
                  className="absolute top-24 -left-4 w-6 h-12 border-2 border-purple-400 rounded bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => console.log('Weapon slot')}
                >
                  <Sword className="w-4 h-4 text-purple-300" />
                </motion.div>

                <motion.div 
                  className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-purple-400 rounded-full bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => console.log('Ring slot')}
                >
                  <div className="w-2 h-2 bg-purple-300 rounded-full" />
                </motion.div>
              </motion.div>
            </div>

            {/* Floating Equipment Preview */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div 
                    className={`w-32 h-32 rounded-lg bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} ${getRarityGlow(selectedItem.rarity)} flex items-center justify-center`}
                  >
                    <Sword className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Equipment Inventory */}
        <div className="w-96 p-4">
          <div className="backdrop-blur-md bg-black/40 rounded-xl border border-purple-500/30 h-full p-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {viewMode === 'equip' ? 'Equipment' : 
               viewMode === 'upgrade' ? 'Shadow Forge' : 
               'Gift to Cha Hae-In'}
            </h3>

            <div className="space-y-3 h-96 overflow-y-auto">
              {activeEquipment.map((item) => (
                <motion.div
                  key={item.id}
                  className={`backdrop-blur-sm bg-white/5 rounded-lg p-3 border cursor-pointer transition-all ${
                    selectedItem?.id === item.id 
                      ? `border-${item.rarity === 'legendary' ? 'yellow' : item.rarity === 'mythic' ? 'red' : 'purple'}-400 bg-white/10` 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-12 h-12 rounded bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center`}
                    >
                      {item.type === 'weapon' && <Sword className="w-6 h-6 text-white" />}
                      {item.type === 'armor' && <Shield className="w-6 h-6 text-white" />}
                      {item.type === 'accessory' && <div className="w-4 h-4 bg-white rounded-full" />}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-white text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-300 capitalize">{item.rarity} {item.type}</p>
                      {item.equipped && (
                        <span className="text-xs text-green-400">Equipped</span>
                      )}
                    </div>

                    {viewMode === 'upgrade' && item.upgradable && (
                      <Plus className="w-4 h-4 text-yellow-400" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Item Details */}
            <AnimatePresence>
              {selectedItem && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="mt-4 backdrop-blur-sm bg-white/5 rounded-lg p-4 border border-white/20"
                >
                  <h4 className="font-bold text-white mb-2">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-300 mb-3">{selectedItem.description}</p>
                  
                  <div className="space-y-1">
                    {selectedItem.stats.attack && (
                      <div className="flex justify-between text-sm">
                        <span className="text-red-300">Attack</span>
                        <span className="text-white">+{selectedItem.stats.attack}</span>
                      </div>
                    )}
                    {selectedItem.stats.defense && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-300">Defense</span>
                        <span className="text-white">+{selectedItem.stats.defense}</span>
                      </div>
                    )}
                    {selectedItem.stats.speed && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-300">Speed</span>
                        <span className="text-white">+{selectedItem.stats.speed}</span>
                      </div>
                    )}
                    {selectedItem.stats.mana && (
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-300">Mana</span>
                        <span className="text-white">+{selectedItem.stats.mana}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    {viewMode === 'equip' && !selectedItem.equipped && (
                      <Button 
                        onClick={() => onEquip(selectedItem.id, selectedItem.type)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        size="sm"
                      >
                        Equip
                      </Button>
                    )}
                    
                    {viewMode === 'upgrade' && selectedItem.upgradable && (
                      <Button 
                        onClick={() => onUpgrade(selectedItem.id)}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        size="sm"
                      >
                        <Gem className="w-3 h-3 mr-1" />
                        Upgrade
                      </Button>
                    )}
                    
                    {viewMode === 'gift' && onGiftToChaHaeIn && (
                      <Button 
                        onClick={() => onGiftToChaHaeIn(selectedItem.id)}
                        className="flex-1 bg-pink-600 hover:bg-pink-700"
                        size="sm"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Gift to Hae-In
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}