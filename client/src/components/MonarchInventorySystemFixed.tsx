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
    description: 'A crystallized form of pure mana energy extracted from A-rank dungeons.',
    sellValue: 200000,
    rarity: 'epic'
  },
  {
    id: 'shadow_essence',
    name: 'Shadow Essence',
    type: 'resource',
    quantity: 45,
    icon: '🌙',
    description: 'Concentrated darkness energy that resonates with shadow magic.',
    sellValue: 150000,
    rarity: 'rare'
  },
  {
    id: 'red_gate_key',
    name: 'Red Gate Access Key',
    type: 'quest',
    quantity: 1,
    icon: '🗝️',
    description: 'A mysterious key that grants access to the most dangerous dungeons.',
    sellValue: 0,
    rarity: 'legendary'
  },
  {
    id: 'flowers_bouquet',
    name: 'Premium Flower Bouquet',
    type: 'gift',
    quantity: 3,
    icon: '💐',
    description: 'An elegant arrangement of rare flowers perfect for special occasions.',
    sellValue: 25000,
    rarity: 'rare'
  },
  {
    id: 'chocolate_box',
    name: 'Artisan Chocolate Collection',
    type: 'gift',
    quantity: 2,
    icon: '🍫',
    description: 'Premium handcrafted chocolates from Seoul\'s finest chocolatier.',
    sellValue: 15000,
    rarity: 'common'
  }
];

const filterCategories = [
  { id: 'all', label: 'All Items', icon: Package, color: 'text-white' },
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

  const filteredItems = inventory.filter(item => 
    activeFilter === 'all' || item.type === activeFilter
  );

  const getFilterCount = (filterType: string) => {
    if (filterType === 'all') return inventory.length;
    return inventory.filter(item => item.type === filterType).length;
  };

  const handleFilterChange = (newFilter: string) => {
    if (newFilter === activeFilter) return;
    setSelectedItem(null);
    setActiveFilter(newFilter);
  };

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.type !== 'consumable') return;
    
    console.log(`🎵 Using ${item.name} - playing potion sound effect`);
    
    setInventory(prev => prev.map(invItem => {
      if (invItem.id === item.id) {
        const newQuantity = invItem.quantity - 1;
        if (newQuantity <= 0) {
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
    
    console.log(`✨ Particle effect: ${item.effect} activated`);
  };

  const handleDiscardClick = (item: InventoryItem) => {
    setItemToDiscard(item);
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    if (itemToDiscard) {
      console.log(`🗑️ Discarding ${itemToDiscard.quantity}x ${itemToDiscard.name}`);
      setInventory(prev => prev.filter(item => item.id !== itemToDiscard.id));
      setShowDiscardConfirm(false);
      setItemToDiscard(null);
      if (selectedItem?.id === itemToDiscard.id) {
        setSelectedItem(null);
      }
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
          className="absolute inset-2 sm:inset-4 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-lg sm:rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)',
            boxShadow: '0 0 60px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header - Mobile Optimized */}
          <div className="flex items-center justify-between p-3 sm:p-6 border-b border-purple-500/20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-white">Monarch's Inventory</h2>
                <p className="text-purple-300 text-xs sm:text-sm hidden sm:block">Manage your collected items and resources</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 min-h-[44px] min-w-[44px]"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </div>

          {/* Main Content - Mobile Responsive Layout */}
          <div className="flex flex-col h-[calc(100%-80px)]">
            {/* Mobile: Horizontal Filter Tabs, Desktop: Vertical Sidebar */}
            <div className="border-b lg:border-b-0 lg:border-r border-purple-500/20 p-3 sm:p-6">
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {filterCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => handleFilterChange(category.id)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 p-2 lg:p-3 rounded-lg text-left transition-all min-w-[120px] lg:min-w-0 ${
                      activeFilter === category.id
                        ? 'bg-purple-600/30 border border-purple-400/50 text-white'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <category.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${category.color} flex-shrink-0`} />
                    <span className="font-medium text-xs lg:text-sm">{category.label}</span>
                    <span className="ml-auto text-xs bg-slate-700/50 px-1.5 lg:px-2 py-1 rounded flex-shrink-0">
                      ({getFilterCount(category.id)})
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Main Content Area - Responsive Grid and Detail */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* Item Grid */}
              <div className="flex-1 p-3 sm:p-6 overflow-hidden">
                <h3 className="text-white font-semibold mb-3 sm:mb-6 text-sm sm:text-base">
                  Items ({filteredItems.length})
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeFilter}
                    className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 h-full overflow-y-auto character-scrollbar pr-1 sm:pr-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {filteredItems.map((item, index) => (
                      <motion.button
                        key={item.id}
                        onClick={() => handleItemSelect(item)}
                        className={`relative p-2 sm:p-4 rounded-lg sm:rounded-xl border transition-all duration-200 group h-fit ${
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
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Item Icon */}
                        <div className="text-center mb-2 sm:mb-3">
                          <div className="text-3xl sm:text-5xl mb-1 sm:mb-2 filter drop-shadow-lg">
                            {item.icon}
                          </div>
                        </div>
                        
                        {/* Item Name */}
                        <div className="text-center mb-1 sm:mb-2">
                          <h4 className={`font-semibold text-xs sm:text-sm leading-tight ${getRarityTextColor(item.rarity)}`}>
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-400 capitalize mt-1 hidden sm:block">
                            {item.type}
                          </p>
                        </div>
                        
                        {/* Quantity Badge */}
                        {item.quantity > 1 && (
                          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-slate-900/90 border border-slate-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-lg">
                            x{item.quantity}
                          </div>
                        )}
                        
                        {/* Rarity Indicator */}
                        <div className={`absolute top-1 sm:top-2 left-1 sm:left-2 w-2 h-2 rounded-full ${getRarityColor(item.rarity).replace('border-', 'bg-')}`} />
                        
                        {/* Selection Glow */}
                        {selectedItem?.id === item.id && (
                          <motion.div
                            className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-400/20 to-blue-400/20 pointer-events-none"
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

              {/* Item Details Panel - Mobile Responsive */}
              <div className="lg:w-80 lg:border-l border-purple-500/20 p-3 sm:p-6 bg-slate-900/50 lg:bg-transparent">
                {selectedItem ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Item Display */}
                    <div className="text-center">
                      <motion.div 
                        key={selectedItem.id}
                        initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className={`w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-xl border-2 ${getRarityColor(selectedItem.rarity)} flex items-center justify-center text-4xl sm:text-6xl mb-3 sm:mb-4`}
                      >
                        {selectedItem.icon}
                      </motion.div>
                      <h3 className={`text-lg sm:text-xl font-bold ${getRarityTextColor(selectedItem.rarity)}`}>
                        {selectedItem.name}
                      </h3>
                      <p className="text-slate-400 text-sm capitalize">{selectedItem.type}</p>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Description</h4>
                        <p className="text-slate-300 text-xs sm:text-sm">{selectedItem.description}</p>
                      </div>

                      {selectedItem.effect && (
                        <div>
                          <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Effect</h4>
                          <p className="text-green-300 text-xs sm:text-sm">{selectedItem.effect}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Market Value</h4>
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-semibold">₩{selectedItem.sellValue.toLocaleString()}</span>
                          <span className="text-slate-400 text-xs">Visit Hunter Market to sell</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 sm:space-y-3">
                      {selectedItem.type === 'consumable' && (
                        <Button
                          onClick={() => handleUseItem(selectedItem)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold min-h-[44px]"
                        >
                          Use Item
                        </Button>
                      )}
                      
                      <Button
                        onClick={() => handleDiscardClick(selectedItem)}
                        variant="outline"
                        className="w-full border-red-500/50 text-red-300 hover:bg-red-500/20 hover:border-red-400 min-h-[44px]"
                      >
                        Discard Item
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm">Select an item to view details</p>
                    </div>
                  </div>
                )}
              </div>
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
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-red-500/30 rounded-xl p-6 max-w-md mx-4"
            >
              <h3 className="text-red-300 font-bold text-lg mb-4">Confirm Discard</h3>
              <p className="text-slate-300 mb-6">
                Are you sure you want to discard <span className="text-white font-semibold">{itemToDiscard.quantity}x {itemToDiscard.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={cancelDiscard}
                  variant="outline"
                  className="flex-1 min-h-[44px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDiscard}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[44px]"
                >
                  Discard
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}