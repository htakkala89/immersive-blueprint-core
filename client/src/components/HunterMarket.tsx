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
  marketDemand: 'low' | 'medium' | 'high' | 'critical';
}

const MARKET_PRICES = {
  mana_crystal: {
    common: 50000,
    uncommon: 150000,
    rare: 500000,
    epic: 1500000,
    legendary: 5000000
  },
  monster_core: {
    common: 100000,
    uncommon: 300000,
    rare: 1000000,
    epic: 3000000,
    legendary: 10000000
  },
  equipment: {
    common: 25000,
    uncommon: 75000,
    rare: 250000,
    epic: 750000,
    legendary: 2500000
  }
};

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
      .filter(item => ['mana_crystal', 'monster_core', 'equipment'].includes(item.type))
      .map(item => {
        const basePrice = MARKET_PRICES[item.type as keyof typeof MARKET_PRICES];
        const rarityPrice = basePrice ? basePrice[item.rarity || 'common'] : (item.value || 1000);
        
        // Market fluctuation (±20%)
        const fluctuation = 0.8 + (Math.random() * 0.4);
        const estimatedValue = Math.floor(rarityPrice * fluctuation);
        
        const marketDemand = Math.random() > 0.7 ? 'high' : 
                           Math.random() > 0.4 ? 'medium' : 'low';

        return {
          ...item,
          estimatedValue,
          marketDemand
        };
      });
  };

  const sellableItems = getSellableItems();

  const formatGold = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₩', '₩ ');
  };

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
      case 'critical': return 'text-red-400';
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Market Interface */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-600/10 to-yellow-600/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
              <Package className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Hunter Market</h2>
              <p className="text-amber-200 text-sm">Trade valuable resources for gold</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-amber-200 text-xs">Current Wealth</p>
              <p className="text-white text-lg font-mono">{formatGold(currentGold)}</p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              size="icon"
              className="border-gray-600 hover:border-gray-400"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Market Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {sellableItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Sellable Items</h3>
              <p className="text-gray-500">Complete dungeon raids to acquire valuable resources</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sellableItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`${getRarityColor(item.rarity)} border rounded-xl p-4 cursor-pointer transition-all hover:shadow-lg`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5" />
                      <h3 className="font-semibold">{item.name}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span className="text-xs capitalize">{item.rarity || 'common'}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Market Value:</span>
                      <span className="font-mono text-sm">{formatGold(item.estimatedValue)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Quantity:</span>
                      <span className="font-semibold">{item.quantity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Demand:</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className={`text-xs capitalize ${getDemandColor(item.marketDemand)}`}>
                          {item.marketDemand}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-current/20">
                      <span className="text-xs text-gray-400">Total Value: </span>
                      <span className="font-bold">{formatGold(item.estimatedValue * item.quantity)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Sell Dialog */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-xl font-bold text-white mb-4">Sell {selectedItem.name}</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Quantity to Sell</label>
                    <input
                      type="range"
                      min="1"
                      max={selectedItem.quantity}
                      value={sellQuantity}
                      onChange={(e) => setSellQuantity(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span className="text-white font-medium">{sellQuantity}</span>
                      <span>{selectedItem.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Sale Value:</span>
                      <span className="text-green-400 font-bold text-lg">
                        {formatGold(selectedItem.estimatedValue * sellQuantity)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedItem(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSell}
                    className="flex-1 bg-green-600 hover:bg-green-500"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}