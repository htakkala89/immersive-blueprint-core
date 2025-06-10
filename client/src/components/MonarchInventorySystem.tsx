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
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [itemToDiscard, setItemToDiscard] = useState<InventoryItem | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventory);
  const [isFilterAnimating, setIsFilterAnimating] = useState(false);

  const filteredItems = inventory.filter(item => 
    activeFilter === 'all' || item.type === activeFilter
  );

  const getFilterCount = (filterType: string) => {
    if (filterType === 'all') return inventory.length;
    return inventory.filter(item => item.type === filterType).length;
  };

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === activeFilter) return;
    
    setIsFilterAnimating(true);
    setSelectedItem(null); // Clear selection when changing filters
    
    // Smooth transition animation
    setTimeout(() => {
      setActiveFilter(newFilter);
      setTimeout(() => setIsFilterAnimating(false), 50);
    }, 100);
  };

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.type !== 'consumable') return;
    
    // Play audio cue (simulated with console log)
    console.log(`🎵 Using ${item.name} - playing potion sound effect`);
    
    // Update inventory quantity
    setInventory(prev => prev.map(invItem => {
      if (invItem.id === item.id) {
        const newQuantity = invItem.quantity - 1;
        if (newQuantity <= 0) {
          // Remove item from inventory if quantity reaches 0
          setSelectedItem(null);
          return null;
        }
        const updatedItem = { ...invItem, quantity: newQuantity };
        if (selectedItem?.id === item.id) {
          setSelectedItem(updatedItem);
        }
        return updatedItem;
      }
      return invItem;
    }).filter(Boolean) as InventoryItem[]);
    
    // Particle effect simulation
    console.log(`✨ Particle effect: ${item.effect} activated`);
  };

  const handleDiscardClick = (item: InventoryItem) => {
    setItemToDiscard(item);
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    if (itemToDiscard) {
      console.log(`🗑️ Discarding ${itemToDiscard.quantity}x ${itemToDiscard.name} - playing disintegrate sound`);
      
      // Remove item from inventory
      setInventory(prev => prev.filter(item => item.id !== itemToDiscard.id));
      
      setShowDiscardConfirm(false);
      setItemToDiscard(null);
      setSelectedItem(null);
    }
  };

  const cancelDiscard = () => {
    setShowDiscardConfirm(false);
    setItemToDiscard(null);
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
                    onClick={() => handleFilterChange(category.id)}
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
                      ({getFilterCount(category.id)})
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Column 2: Item Grid */}
            <div className="flex-1 p-6">
              <h3 className="text-white font-semibold mb-6">
                Items ({filteredItems.length})
              </h3>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeFilter}
                  className="grid grid-cols-2 gap-6 max-h-[calc(100vh-240px)] overflow-y-auto character-scrollbar pr-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {filteredItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`relative p-4 rounded-xl border transition-all duration-200 group ${
                        selectedItem?.id === item.id 
                          ? 'border-purple-400/70 bg-purple-500/20 shadow-lg shadow-purple-500/25' 
                          : 'border-slate-600/50 bg-slate-800/40 hover:border-purple-500/50 hover:bg-purple-500/10'
                      }`}
                      style={{
                        background: selectedItem?.id === item.id 
                          ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(79, 70, 229, 0.15) 50%, rgba(30, 27, 75, 0.15) 100%)'
                          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(30, 41, 59, 0.6) 100%)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: selectedItem?.id === item.id 
                          ? '0 8px 32px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      }}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.4,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        scale: 1.03,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Item Icon */}
                      <div className="text-center mb-3">
                        <div className="text-5xl mb-2 filter drop-shadow-lg">
                          {item.icon}
                        </div>
                      </div>
                      
                      {/* Item Name */}
                      <div className="text-center mb-2">
                        <h4 className={`font-semibold text-sm leading-tight ${getRarityTextColor(item.rarity)}`}>
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-400 capitalize mt-1">
                          {item.type}
                        </p>
                      </div>
                      
                      {/* Quantity Badge */}
                      {item.quantity > 1 && (
                        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                          x{item.quantity}
                        </div>
                      )}
                      
                      {/* Rarity Indicator */}
                      <div className={`absolute top-2 left-2 w-2 h-2 rounded-full ${getRarityColor(item.rarity).replace('border-', 'bg-')}`} />
                      
                      {/* Selection Glow */}
                      {selectedItem?.id === item.id && (
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-blue-400/20 pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              </AnimatePresence>
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
                    <motion.div 
                      key={selectedItem.id}
                      initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className={`w-24 h-24 mx-auto rounded-xl border-2 ${getRarityColor(selectedItem.rarity)} flex items-center justify-center text-6xl mb-4`}
                    >
                      {selectedItem.icon}
                    </motion.div>
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
                      <h4 className="text-white font-medium mb-2">Market Value</h4>
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 font-medium">
                          ₩{selectedItem.sellValue.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">Visit Hunter Market to sell</p>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">Quantity</h4>
                      <span className="text-white text-lg font-bold">{selectedItem.quantity}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4 border-t border-purple-500/20">
                    {selectedItem.type === 'consumable' && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handleUseItem(selectedItem)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Beaker className="w-4 h-4" />
                            Use Item
                          </motion.div>
                        </Button>
                      </motion.div>
                    )}

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        onClick={() => handleDiscardClick(selectedItem)}
                        className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10 hover:border-red-400/70 transition-all duration-200"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Discard
                        </motion.div>
                      </Button>
                    </motion.div>
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

      {/* Safety Confirmation Modal for Discard Action */}
      <AnimatePresence>
        {showDiscardConfirm && itemToDiscard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              style={{
                backdropFilter: 'blur(40px) saturate(180%)',
                borderImage: 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1)) 1'
              }}
            >
              {/* Warning Icon */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Confirm Discard</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Are you sure you want to discard{' '}
                  <span className="text-white font-semibold">
                    {itemToDiscard.quantity}x {itemToDiscard.name}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={cancelDiscard}
                  variant="outline"
                  className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDiscard}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}