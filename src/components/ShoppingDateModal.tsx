import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Sparkles, Heart, Store, Gem, Gift } from 'lucide-react';

interface ShoppingDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoreSelect: (store: 'luxury_department' | 'gangnam_furnishings') => void;
  gameState: {
    affection: number;
    money: number;
    energy: number;
  };
}

export function ShoppingDateModal({ isOpen, onClose, onStoreSelect, gameState }: ShoppingDateModalProps) {
  const [selectedStore, setSelectedStore] = useState<'luxury_department' | 'gangnam_furnishings' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const stores = [
    {
      id: 'luxury_department' as const,
      name: 'Luxury Department Store',
      description: 'High-end fashion, jewelry, and premium lifestyle items',
      icon: Gem,
      color: 'from-purple-400 to-pink-400',
      chaHaeInComment: "I've always wanted to browse the designer collections here...",
      energyCost: 15,
      timeRequired: '45 minutes'
    },
    {
      id: 'gangnam_furnishings' as const,
      name: 'Gangnam Modern Furnishings',
      description: 'Contemporary furniture and home decor',
      icon: Store,
      color: 'from-blue-400 to-cyan-400',
      chaHaeInComment: "It would be nice to see what catches your eye for home decoration.",
      energyCost: 12,
      timeRequired: '30 minutes'
    }
  ];

  const handleStoreSelect = (storeId: 'luxury_department' | 'gangnam_furnishings') => {
    setSelectedStore(storeId);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (selectedStore) {
      onStoreSelect(selectedStore);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-100 to-pink-100 p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/80 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Shopping Date</h2>
                  <p className="text-gray-600 text-sm">Choose where to go together</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Cha Hae-In's Comment */}
            <div className="bg-white/70 rounded-lg p-4 border border-white/30">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 italic">
                    "Shopping together sounds wonderful. I'm curious to see what you'll choose..."
                  </p>
                  <p className="text-xs text-gray-500 mt-1">- Cha Hae-In</p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Selection */}
          <div className="p-6">
            {!showConfirmation ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Which store should we visit?</h3>
                
                {stores.map((store) => {
                  const IconComponent = store.icon;
                  const canAfford = gameState.energy >= store.energyCost;
                  
                  return (
                    <motion.button
                      key={store.id}
                      whileHover={{ scale: canAfford ? 1.02 : 1 }}
                      whileTap={{ scale: canAfford ? 0.98 : 1 }}
                      onClick={() => canAfford && handleStoreSelect(store.id)}
                      disabled={!canAfford}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                        canAfford
                          ? 'border-transparent bg-gradient-to-r ' + store.color + ' text-white hover:shadow-lg cursor-pointer'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${canAfford ? 'bg-white/20' : 'bg-gray-200'}`}>
                          <IconComponent className={`w-6 h-6 ${canAfford ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-semibold text-lg">{store.name}</h4>
                          <p className={`text-sm ${canAfford ? 'text-white/90' : 'text-gray-500'}`}>
                            {store.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`text-xs ${canAfford ? 'text-white/80' : 'text-gray-400'}`}>
                              ⚡ {store.energyCost} Energy
                            </span>
                            <span className={`text-xs ${canAfford ? 'text-white/80' : 'text-gray-400'}`}>
                              ⏱️ {store.timeRequired}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Cha Hae-In's Comment */}
                      <div className={`mt-3 p-3 rounded-lg ${canAfford ? 'bg-white/10' : 'bg-gray-50'}`}>
                        <p className={`text-sm italic ${canAfford ? 'text-white/90' : 'text-gray-500'}`}>
                          "{store.chaHaeInComment}"
                        </p>
                      </div>
                    </motion.button>
                  );
                })}

                {/* Energy Warning */}
                {gameState.energy < Math.min(...stores.map(s => s.energyCost)) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <p className="text-sm text-amber-700">
                        You need more energy to go shopping. Consider resting first.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Confirmation */
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl">
                  <Sparkles className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to go?</h3>
                  <p className="text-gray-600">
                    You've chosen to visit the{' '}
                    <span className="font-semibold text-rose-600">
                      {stores.find(s => s.id === selectedStore)?.name}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Cha Hae-In will provide commentary as you browse items together.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                  >
                    Let's Go Shopping!
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}