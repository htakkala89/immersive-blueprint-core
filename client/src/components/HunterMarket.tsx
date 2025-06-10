import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Package, TrendingUp, Star, Gem } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InventoryItem } from '@shared/schema';

interface HunterMarketProps {
  isVisible: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  currentGold: number;
  onSellItem: (itemId: string, quantity: number, totalValue: number) => void;
}

interface SellableItem extends InventoryItem {
  estimatedValue: number;
  marketDemand: 'low' | 'medium' | 'high';
}

export default function HunterMarket({ 
  isVisible, 
  onClose, 
  inventory, 
  currentGold, 
  onSellItem 
}: HunterMarketProps) {
  const [selectedItem, setSelectedItem] = useState<SellableItem | null>(null);
  const [sellQuantity, setSellQuantity] = useState(1);

  const getSellableItems = (): SellableItem[] => {
    return inventory
      .filter(item => ['mana_crystal', 'monster_core', 'weapon', 'armor'].includes(item.type))
      .map(item => ({
        ...item,
        estimatedValue: Math.floor((item.value || 1000) * (0.8 + Math.random() * 0.4)),
        marketDemand: Math.random() > 0.6 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low'
      }));
  };

  const sellableItems = getSellableItems();

  const formatGold = (amount: number) => `₩ ${amount.toLocaleString('ko-KR')}`;

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'epic': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'rare': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'uncommon': return 'text-green-400 border-green-400/30 bg-green-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const handleSell = () => {
    if (!selectedItem) return;
    const totalValue = selectedItem.estimatedValue * sellQuantity;
    onSellItem(selectedItem.id, sellQuantity, totalValue);
    setSelectedItem(null);
    setSellQuantity(1);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          className="relative w-[95%] max-w-6xl h-[90%] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl" />
          
          <div className="absolute inset-0 opacity-5 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full" />
          </div>

          <div className="relative flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
                <Package className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Hunter Market</h2>
                <p className="text-blue-200 text-sm">Trade valuable resources for gold</p>
              </div>
            </div>
            
            <Button onClick={onClose} variant="outline" size="icon" className="border-gray-600 hover:border-gray-400">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative flex h-[calc(90vh-120px)]">
            <div className="flex-1 p-6 border-r border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Your Inventory</h3>
              <div className="space-y-3 h-full overflow-y-auto">
                {sellableItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sellable items in inventory</p>
                  </div>
                ) : (
                  sellableItems.map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedItem?.id === item.id 
                          ? 'border-amber-400 bg-amber-400/10' 
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRarityColor(item.rarity)}`}>
                            {item.type === 'mana_crystal' && <Gem className="w-6 h-6" />}
                            {item.type === 'monster_core' && <Star className="w-6 h-6" />}
                            {(item.type === 'weapon' || item.type === 'armor') && <Package className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-400">x{item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-300 font-mono">{formatGold(item.estimatedValue)} ea.</p>
                          <p className={`text-xs ${getDemandColor(item.marketDemand)}`}>
                            {item.marketDemand} demand
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            <div className="w-80 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sell Items</h3>
              
              {selectedItem ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${getRarityColor(selectedItem.rarity)}`}>
                    <h4 className="text-white font-medium mb-2">{selectedItem.name}</h4>
                    <p className="text-sm text-gray-300 mb-3">{selectedItem.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Quantity to sell</label>
                        <input
                          type="number"
                          min="1"
                          max={selectedItem.quantity}
                          value={sellQuantity}
                          onChange={(e) => setSellQuantity(Math.min(selectedItem.quantity, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
                        />
                      </div>
                      
                      <div className="text-center py-4 bg-black/20 rounded-lg">
                        <p className="text-sm text-gray-400">Total Sale Value</p>
                        <p className="text-2xl font-bold text-amber-300">
                          {formatGold(selectedItem.estimatedValue * sellQuantity)}
                        </p>
                      </div>
                      
                      <Button
                        onClick={handleSell}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-amber-900 font-bold"
                      >
                        <Coins className="w-4 h-4 mr-2" />
                        Confirm Sale
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select an item to sell</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}