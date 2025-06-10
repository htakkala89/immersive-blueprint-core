import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Gem, Beaker, Gift, Scroll, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryItem {
  id: string;
  name: string;
  type: 'consumable' | 'resource' | 'quest' | 'gift';
  quantity: number;
  icon: string;
  description: string;
  effect?: string;
  sellValue: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface MonarchInventorySystemProps {
  isVisible: boolean;
  onClose: () => void;
}

const sampleInventory: InventoryItem[] = [
  {
    id: 'mana_potion_high',
    name: 'High-Grade Mana Potion',
    type: 'consumable',
    quantity: 15,
    icon: '🧪',
    description: 'A potent elixir that rapidly replenishes one\'s mana reserves.',
    effect: 'Restores 1000 MP over 5 seconds',
    sellValue: 50000,
    rarity: 'rare'
  },
  {
    id: 'health_elixir',
    name: 'Vitality Elixir',
    type: 'consumable',
    quantity: 8,
    icon: '❤️',
    description: 'A concentrated healing potion favored by high-rank hunters.',
    effect: 'Restores 2000 HP instantly',
    sellValue: 75000,
    rarity: 'epic'
  },
  {
    id: 'mana_crystal_a',
    name: 'A-Rank Mana Crystal',
    type: 'resource',
    quantity: 23,
    icon: '💎',
    description: 'A crystallized essence of pure mana energy from A-rank monsters.',
    sellValue: 200000,
    rarity: 'epic'
  },
  {
    id: 'shadow_core',
    name: 'Shadow Monarch Core',
    type: 'resource',
    quantity: 3,
    icon: '🌑',
    description: 'An extremely rare core containing the essence of shadow magic.',
    sellValue: 2000000,
    rarity: 'legendary'
  },
  {
    id: 'dungeon_key',
    name: 'Ancient Dungeon Key',
    type: 'quest',
    quantity: 1,
    icon: '🗝️',
    description: 'A mysterious key that opens ancient sealed dungeons.',
    sellValue: 0,
    rarity: 'legendary'
  },
  {
    id: 'luxury_perfume',
    name: 'Chanel No. 5 Perfume',
    type: 'gift',
    quantity: 2,
    icon: '🌸',
    description: 'An elegant French perfume perfect for special occasions.',
    sellValue: 150000,
    rarity: 'rare'
  },
  {
    id: 'jewelry_box',
    name: 'Tiffany Jewelry Box',
    type: 'gift',
    quantity: 1,
    icon: '💍',
    description: 'A luxurious jewelry box containing a beautiful necklace.',
    sellValue: 500000,
    rarity: 'epic'
  }
];

const filterCategories = [
  { id: 'all', label: 'All Items', icon: Package, color: 'text-purple-400' },
  { id: 'consumable', label: 'Consumables', icon: Beaker, color: 'text-green-400' },
  { id: 'resource', label: 'Valuable Resources', icon: Gem, color: 'text-blue-400' },
  { id: 'quest', label: 'Quest Items', icon: Scroll, color: 'text-yellow-400' },
  { id: 'gift', label: 'Gifts', icon: Gift, color: 'text-pink-400' }
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

const getRarityTextColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'text-gray-300';
    case 'rare': return 'text-blue-300';
    case 'epic': return 'text-purple-300';
    case 'legendary': return 'text-amber-300';
    default: return 'text-gray-300';
  }
};

export function MonarchInventorySystem({ isVisible, onClose }: MonarchInventorySystemProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filteredItems = sampleInventory.filter(item => 
    activeFilter === 'all' || item.type === activeFilter
  );

  const handleUseItem = (item: InventoryItem) => {
    console.log(`Using item: ${item.name}`);
    // Implement use item logic
  };

  const handleSellItem = (item: InventoryItem) => {
    console.log(`Selling item: ${item.name} for ₩${item.sellValue.toLocaleString()}`);
    // Implement sell item logic
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="absolute inset-4 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
            boxShadow: '0 0 60px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Monarch's Inventory</h2>
                <p className="text-purple-300 text-sm">Manage your collected items and resources</p>
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

          {/* Main Content - Three Column Layout */}
          <div className="flex h-full">
            {/* Column 1: Filter Tabs */}
            <div className="w-64 border-r border-purple-500/20 p-6">
              <h3 className="text-white font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                {filterCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setActiveFilter(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      activeFilter === category.id
                        ? 'bg-purple-600/30 border border-purple-400/50 text-white'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                    <span className="font-medium">{category.label}</span>
                    <span className="ml-auto text-xs bg-slate-700/50 px-2 py-1 rounded">
                      {category.id === 'all' 
                        ? sampleInventory.length 
                        : sampleInventory.filter(item => item.type === category.id).length
                      }
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Column 2: Item Grid */}
            <div className="flex-1 p-6">
              <h3 className="text-white font-semibold mb-4">
                Items ({filteredItems.length})
              </h3>
              <div className="grid grid-cols-6 gap-4 max-h-[calc(100vh-200px)] overflow-y-auto character-scrollbar">
                {filteredItems.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`aspect-square p-4 rounded-xl border-2 relative group ${getRarityColor(item.rarity)} ${
                      selectedItem?.id === item.id ? 'ring-2 ring-purple-400' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="absolute bottom-2 right-2 bg-slate-800/90 text-white text-xs px-1.5 py-0.5 rounded">
                      {item.quantity > 1 ? `x${item.quantity}` : ''}
                    </div>
                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs px-2 py-1 rounded-b ${getRarityTextColor(item.rarity)} bg-slate-800/90 opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {item.rarity}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Column 3: Item Details */}
            <div className="w-80 border-l border-purple-500/20 p-6">
              {selectedItem ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Item Display */}
                  <div className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-xl border-2 ${getRarityColor(selectedItem.rarity)} flex items-center justify-center text-6xl mb-4`}>
                      {selectedItem.icon}
                    </div>
                    <h3 className={`text-xl font-bold ${getRarityTextColor(selectedItem.rarity)}`}>
                      {selectedItem.name}
                    </h3>
                    <p className="text-slate-400 text-sm capitalize">{selectedItem.type}</p>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Description</h4>
                      <p className="text-slate-300 text-sm">{selectedItem.description}</p>
                    </div>

                    {selectedItem.effect && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Effect</h4>
                        <p className="text-green-300 text-sm">{selectedItem.effect}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-white font-medium mb-2">Sell Value</h4>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 font-bold">
                          ₩{selectedItem.sellValue.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Quantity</h4>
                      <span className="text-white text-lg font-bold">{selectedItem.quantity}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-purple-500/20">
                    {selectedItem.type === 'consumable' && (
                      <Button
                        onClick={() => handleUseItem(selectedItem)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        Use Item
                      </Button>
                    )}
                    
                    {selectedItem.sellValue > 0 && (
                      <Button
                        onClick={() => handleSellItem(selectedItem)}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        Sell for ₩{selectedItem.sellValue.toLocaleString()}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10"
                    >
                      Discard
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Select an item to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}