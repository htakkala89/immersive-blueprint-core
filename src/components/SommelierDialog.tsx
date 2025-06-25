import { useState } from 'react';
import { X, Wine, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SommelierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onWineSelected: (wine: WineOption) => void;
  playerGold: number;
}

interface WineOption {
  id: string;
  name: string;
  description: string;
  price: number;
  affectionBoost: number;
  rarity: 'common' | 'rare' | 'legendary';
}

const wineOptions: WineOption[] = [
  {
    id: 'house_wine',
    name: 'House Red',
    description: 'A pleasant everyday wine with notes of cherry and oak.',
    price: 15000,
    affectionBoost: 5,
    rarity: 'common'
  },
  {
    id: 'premium_bordeaux',
    name: 'Premium Bordeaux',
    description: 'An exceptional French wine with complex flavors and perfect balance.',
    price: 50000,
    affectionBoost: 12,
    rarity: 'rare'
  },
  {
    id: 'vintage_collection',
    name: 'Vintage Reserve',
    description: 'A rare vintage from the sommelier\'s private collection. Exquisite and unforgettable.',
    price: 150000,
    affectionBoost: 20,
    rarity: 'legendary'
  }
];

export default function SommelierDialog({ isOpen, onClose, onWineSelected, playerGold }: SommelierDialogProps) {
  const [selectedWine, setSelectedWine] = useState<string | null>(null);

  const handleWineSelect = (wine: WineOption) => {
    if (playerGold >= wine.price) {
      onWineSelected(wine);
      onClose();
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400/30';
      case 'rare': return 'border-blue-400/30';
      case 'legendary': return 'border-purple-400/30';
      default: return 'border-gray-400/30';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black/90 border border-purple-500/20 rounded-xl p-6 max-w-md w-full text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center">
                  <Wine className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-100">Master Sommelier</h3>
                  <p className="text-sm text-gray-400">Wine Recommendations</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sommelier Introduction */}
            <div className="mb-6 p-4 bg-amber-900/20 rounded-lg border border-amber-600/20">
              <p className="text-amber-100 text-sm leading-relaxed">
                "Good evening! I see you're dining with a distinguished guest. Allow me to recommend the perfect wine to complement your evening."
              </p>
            </div>

            {/* Wine Options */}
            <div className="space-y-3 mb-6">
              {wineOptions.map((wine) => {
                const canAfford = playerGold >= wine.price;
                return (
                  <motion.button
                    key={wine.id}
                    onClick={() => canAfford && handleWineSelect(wine)}
                    disabled={!canAfford}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      canAfford 
                        ? `${getRarityBorder(wine.rarity)} hover:bg-white/5 cursor-pointer`
                        : 'border-gray-600/30 opacity-50 cursor-not-allowed'
                    }`}
                    whileHover={canAfford ? { scale: 1.02 } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-semibold ${getRarityColor(wine.rarity)}`}>
                        {wine.name}
                      </h4>
                      <div className="flex items-center gap-2 text-amber-400">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm font-medium">₩{wine.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{wine.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-400">+{wine.affectionBoost} Affection</span>
                      {!canAfford && (
                        <span className="text-xs text-red-400">Insufficient funds</span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Player Gold Display */}
            <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-600/30">
              <span className="text-gray-400 text-sm">Your Gold:</span>
              <div className="flex items-center gap-2 text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="font-medium">₩{playerGold.toLocaleString()}</span>
              </div>
            </div>

            {/* Cancel Button */}
            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors text-gray-300"
              >
                "Perhaps another time"
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}