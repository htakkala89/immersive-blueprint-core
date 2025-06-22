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
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-indigo-950 via-purple-950 to-black overflow-y-auto"
    >
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-10 p-3 sm:p-4 bg-gradient-to-br from-indigo-950/90 via-purple-950/90 to-black/90 backdrop-blur-md border-b border-purple-500/30">
        <div className="flex justify-between items-center mb-3">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex-1"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Monarch's Armory</h2>
            <p className="text-purple-300 text-xs sm:text-sm">Level {playerLevel} Shadow Monarch</p>
          </motion.div>

          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-500/20 border border-white/20 h-10 w-10 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex gap-1 sm:gap-2">
          <Button
            onClick={() => setViewMode('equip')}
            variant={viewMode === 'equip' ? 'default' : 'ghost'}
            className="flex-1 text-xs sm:text-sm text-white h-9"
          >
            <Sword className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Equip
          </Button>
          <Button
            onClick={() => setViewMode('upgrade')}
            variant={viewMode === 'upgrade' ? 'default' : 'ghost'}
            className="flex-1 text-xs sm:text-sm text-white h-9"
          >
            <Gem className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Upgrade
          </Button>
          <Button
            onClick={() => setViewMode('gift')}
            variant={viewMode === 'gift' ? 'default' : 'ghost'}
            className="flex-1 text-xs sm:text-sm text-white h-9"
          >
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Gift
          </Button>
        </div>
      </div>

      {/* Mobile-Optimized Content */}
      <div className="p-3 sm:p-4 pb-20 space-y-4">
        {/* Total Stats Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="backdrop-blur-md bg-white/5 rounded-xl border border-purple-500/30 p-4"
        >
          <h3 className="text-lg font-bold text-white mb-3">Total Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 text-center">
              <div className="w-2 h-2 bg-red-400 rounded-full mx-auto mb-2"></div>
              <p className="text-red-300 text-xs mb-1">Attack</p>
              <p className="text-white font-bold text-lg">1500</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 text-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mx-auto mb-2"></div>
              <p className="text-blue-300 text-xs mb-1">Defense</p>
              <p className="text-white font-bold text-lg">200</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 text-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto mb-2"></div>
              <p className="text-green-300 text-xs mb-1">Speed</p>
              <p className="text-white font-bold text-lg">0</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 text-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mx-auto mb-2"></div>
              <p className="text-purple-300 text-xs mb-1">Magic</p>
              <p className="text-white font-bold text-lg">0</p>
            </div>
          </div>
        </motion.div>

        {/* Character Schematic - Mobile Optimized */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}
          className="backdrop-blur-md bg-white/5 rounded-xl border border-purple-500/30 p-4"
        >
          <h3 className="text-lg font-bold text-white mb-3">Monarch's Schematic</h3>
          <div className="flex justify-center">
            <motion.div
              ref={modelRef}
              className="relative w-64 h-80 sm:w-80 sm:h-96 backdrop-blur-sm bg-white/5 rounded-xl border border-purple-500/20 overflow-hidden"
              onMouseMove={handleMouseMove}
              style={{
                transform: `perspective(1000px) rotateX(${rotation.x * 0.5}deg) rotateY(${rotation.y * 0.5}deg)`
              }}
            >
              {/* Character Silhouette */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="w-32 h-64 sm:w-48 sm:h-80 bg-gradient-to-b from-purple-600/30 to-black/50 rounded-full relative"
                  animate={{ 
                    boxShadow: selectedItem 
                      ? `0 0 40px ${selectedItem.rarity === 'legendary' ? '#f59e0b' : 
                          selectedItem.rarity === 'mythic' ? '#ef4444' : '#8b5cf6'}80`
                      : '0 0 20px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {/* Equipment Slots - Mobile Optimized */}
                  <motion.div 
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 border-2 border-purple-400 rounded-full bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => console.log('Head slot')}
                  >
                    <Crown className="w-4 h-4 text-purple-300" />
                  </motion.div>

                  <motion.div 
                    className="absolute top-16 left-1/2 transform -translate-x-1/2 w-10 h-12 border-2 border-purple-400 rounded bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => console.log('Armor slot')}
                  >
                    <Shield className="w-5 h-5 text-purple-300" />
                  </motion.div>

                  <motion.div 
                    className="absolute top-20 -left-3 w-6 h-10 border-2 border-purple-400 rounded bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => console.log('Weapon slot')}
                  >
                    <Sword className="w-3 h-3 text-purple-300" />
                  </motion.div>

                  <motion.div 
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-6 h-6 border-2 border-purple-400 rounded-full bg-purple-900/50 flex items-center justify-center cursor-pointer hover:bg-purple-800/50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
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
                      className={`w-20 h-20 sm:w-32 sm:h-32 rounded-lg bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} ${getRarityGlow(selectedItem.rarity)} flex items-center justify-center`}
                    >
                      <Sword className="w-10 h-10 sm:w-16 sm:h-16 text-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* Equipment List - Mobile Optimized */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
          className="backdrop-blur-md bg-white/5 rounded-xl border border-purple-500/30 p-4"
        >
          <h3 className="text-lg font-bold text-white mb-3">
            {viewMode === 'equip' ? 'Available Equipment' : 
             viewMode === 'upgrade' ? 'Shadow Forge' : 
             'Gift to Cha Hae-In'}
          </h3>

          <div className="space-y-3">
            {activeEquipment.map((item) => (
              <motion.div
                key={item.id}
                className={`backdrop-blur-sm bg-white/5 rounded-lg p-3 border cursor-pointer transition-all ${
                  selectedItem?.id === item.id 
                    ? `border-${item.rarity === 'legendary' ? 'yellow' : item.rarity === 'mythic' ? 'red' : 'purple'}-400 bg-white/10` 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => setSelectedItem(item)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-12 h-12 rounded bg-gradient-to-br ${getRarityColor(item.rarity)} flex items-center justify-center`}
                  >
                    {item.type === 'weapon' && <Sword className="w-6 h-6 text-white" />}
                    {item.type === 'armor' && <Shield className="w-6 h-6 text-white" />}
                    {item.type === 'accessory' && <div className="w-4 h-4 bg-white rounded-full" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-300 capitalize">{item.rarity} {item.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.equipped && (
                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">Equipped</span>
                      )}
                      {viewMode === 'upgrade' && item.upgradable && (
                        <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">Upgradable</span>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="text-right text-xs">
                    {item.stats.attack && <div className="text-red-300">ATK +{item.stats.attack}</div>}
                    {item.stats.defense && <div className="text-blue-300">DEF +{item.stats.defense}</div>}
                    {item.stats.speed && <div className="text-green-300">SPD +{item.stats.speed}</div>}
                    {item.stats.mana && <div className="text-purple-300">MP +{item.stats.mana}</div>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Item Details - Mobile Optimized */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="backdrop-blur-md bg-white/5 rounded-xl border border-purple-500/30 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} flex items-center justify-center`}
                >
                  {selectedItem.type === 'weapon' && <Sword className="w-8 h-8 text-white" />}
                  {selectedItem.type === 'armor' && <Shield className="w-8 h-8 text-white" />}
                  {selectedItem.type === 'accessory' && <div className="w-6 h-6 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white text-lg">{selectedItem.name}</h4>
                  <p className="text-sm text-gray-300 capitalize">{selectedItem.rarity} {selectedItem.type}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-300 mb-4">{selectedItem.description}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {selectedItem.stats.attack && (
                  <div className="backdrop-blur-sm bg-red-900/20 rounded-lg p-3 text-center">
                    <div className="text-red-300 text-xs mb-1">Attack</div>
                    <div className="text-white font-bold">+{selectedItem.stats.attack}</div>
                  </div>
                )}
                {selectedItem.stats.defense && (
                  <div className="backdrop-blur-sm bg-blue-900/20 rounded-lg p-3 text-center">
                    <div className="text-blue-300 text-xs mb-1">Defense</div>
                    <div className="text-white font-bold">+{selectedItem.stats.defense}</div>
                  </div>
                )}
                {selectedItem.stats.speed && (
                  <div className="backdrop-blur-sm bg-green-900/20 rounded-lg p-3 text-center">
                    <div className="text-green-300 text-xs mb-1">Speed</div>
                    <div className="text-white font-bold">+{selectedItem.stats.speed}</div>
                  </div>
                )}
                {selectedItem.stats.mana && (
                  <div className="backdrop-blur-sm bg-purple-900/20 rounded-lg p-3 text-center">
                    <div className="text-purple-300 text-xs mb-1">Mana</div>
                    <div className="text-white font-bold">+{selectedItem.stats.mana}</div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {viewMode === 'equip' && !selectedItem.equipped && (
                  <Button 
                    onClick={() => onEquip(selectedItem.id, selectedItem.type)}
                    className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  >
                    <Sword className="w-4 h-4 mr-2" />
                    Equip Item
                  </Button>
                )}
                
                {viewMode === 'upgrade' && selectedItem.upgradable && (
                  <Button 
                    onClick={() => onUpgrade(selectedItem.id)}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 h-12"
                  >
                    <Gem className="w-4 h-4 mr-2" />
                    Upgrade Item
                  </Button>
                )}
                
                {viewMode === 'gift' && onGiftToChaHaeIn && (
                  <Button 
                    onClick={() => onGiftToChaHaeIn(selectedItem.id)}
                    className="w-full bg-pink-600 hover:bg-pink-700 h-12"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Gift to Cha Hae-In
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}