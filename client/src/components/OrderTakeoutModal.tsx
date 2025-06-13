import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils, Clock, Star, Coins, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderTakeoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (goldCost: number, energyRestored: number, affectionGain: number) => void;
  backgroundImage?: string;
}

interface FoodOption {
  id: string;
  name: string;
  description: string;
  price: number;
  energyRestore: number;
  affectionGain: number;
  emoji: string;
  chaResponse: string;
  moodEffect: string;
}

export function OrderTakeoutModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  backgroundImage 
}: OrderTakeoutModalProps) {
  const [selectedFood, setSelectedFood] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const foodOptions: FoodOption[] = [
    {
      id: 'jjajangmyeon',
      name: 'Jjajangmyeon',
      description: 'Classic Korean-Chinese black bean noodles - comfort food at its finest',
      price: 15000,
      energyRestore: 25,
      affectionGain: 3,
      emoji: '🍜',
      chaResponse: 'Perfect choice! Nothing beats jjajangmyeon on a lazy evening. It reminds me of university days.',
      moodEffect: 'nostalgic'
    },
    {
      id: 'fried_chicken',
      name: 'Korean Fried Chicken',
      description: 'Crispy, golden chicken with your choice of sauce - a Korean favorite',
      price: 28000,
      energyRestore: 30,
      affectionGain: 4,
      emoji: '🍗',
      chaResponse: 'Fried chicken! You know exactly what I need after a long day of training. Let\'s get extra crispy.',
      moodEffect: 'satisfied'
    },
    {
      id: 'pizza',
      name: 'Supreme Pizza',
      description: 'Western-style pizza loaded with toppings - easy to share and enjoy together',
      price: 32000,
      energyRestore: 35,
      affectionGain: 5,
      emoji: '🍕',
      chaResponse: 'Pizza sounds perfect for a cozy night in. We can watch something while we eat.',
      moodEffect: 'relaxed'
    },
    {
      id: 'korean_bbq',
      name: 'Korean BBQ Set',
      description: 'Premium bulgogi and banchan delivered hot - restaurant quality at home',
      price: 45000,
      energyRestore: 40,
      affectionGain: 6,
      emoji: '🥩',
      chaResponse: 'BBQ delivery? That\'s quite luxurious! Sometimes it\'s nice to treat ourselves.',
      moodEffect: 'pampered'
    },
    {
      id: 'sushi',
      name: 'Assorted Sushi',
      description: 'Fresh sashimi and rolls from the best Japanese restaurant nearby',
      price: 38000,
      energyRestore: 30,
      affectionGain: 5,
      emoji: '🍣',
      chaResponse: 'Sushi! You have excellent taste. Fresh fish is exactly what I was craving.',
      moodEffect: 'refined'
    }
  ];

  const handleFoodSelection = (foodId: string) => {
    setSelectedFood(foodId);
    setOrderPlaced(true);
    setTimeout(() => {
      setShowDelivery(true);
    }, 2000);
    setTimeout(() => {
      setShowResults(true);
    }, 5000);
  };

  const getSelectedFood = () => {
    return foodOptions.find(food => food.id === selectedFood);
  };

  const handleComplete = () => {
    const food = getSelectedFood();
    if (food) {
      onComplete(food.price, food.energyRestore, food.affectionGain);
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl h-[85vh] bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-3xl overflow-hidden shadow-2xl border border-orange-200"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cozy evening overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-amber-900/30 to-yellow-900/20" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-orange-800 hover:bg-orange-200/50"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Header */}
          <div className="absolute top-6 left-6 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-orange-900">Order Takeout</h1>
                <p className="text-orange-700">Comfort food for a cozy evening</p>
              </div>
            </div>
          </div>

          {/* Evening time indicator */}
          <div className="absolute top-6 right-20 z-40 flex items-center space-x-2 bg-orange-200/60 backdrop-blur-md rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-orange-800 text-sm font-medium">Evening</span>
          </div>

          {!orderPlaced ? (
            /* Food Selection */
            <div className="flex items-center justify-center h-full pt-20">
              <div className="w-full max-w-4xl space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-orange-900 mb-4">What should we get tonight?</h2>
                  <p className="text-orange-700 text-lg">Too tired to cook? Let's order something delicious</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 relative z-50">
                  {foodOptions.map((food) => (
                    <motion.button
                      key={food.id}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`Food selected: ${food.name}`);
                        handleFoodSelection(food.id);
                      }}
                      className="p-6 bg-white/80 hover:bg-white/95 rounded-xl border border-orange-200 transition-all duration-200 text-left shadow-md relative z-50 cursor-pointer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{food.emoji}</div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-orange-900 mb-2">{food.name}</h3>
                          <p className="text-orange-700 text-sm mb-3">{food.description}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Coins className="w-4 h-4 text-yellow-600" />
                                <span className="text-yellow-700 font-semibold">₩{food.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-green-600" />
                                <span className="text-green-700 text-sm">+{food.energyRestore} Energy</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4 text-pink-600" />
                              <span className="text-pink-700 text-sm">+{food.affectionGain} Affection</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <div className="bg-orange-100/80 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-orange-800 italic text-sm">
                      "I'm too tired to cook tonight. Let's just order something and relax together."
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">CH</span>
                      </div>
                      <span className="text-orange-700 text-sm font-medium">Cha Hae-In</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !showDelivery ? (
            /* Order Processing */
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="text-6xl mb-4">📱</div>
                <h2 className="text-3xl font-bold text-orange-900">Order Placed!</h2>
                <p className="text-orange-700 text-lg">
                  Ordering {getSelectedFood()?.name} from your favorite restaurant
                </p>
                
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-700">Estimated delivery: 25-30 minutes</span>
                </div>
              </motion.div>
            </div>
          ) : !showResults ? (
            /* Delivery Scene */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-3xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🚚</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-4">Food's Here!</h2>
                </motion.div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-8 border border-orange-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">CH</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-orange-900 font-semibold mb-3">Cha Hae-In</h4>
                      <p className="text-orange-800 text-lg italic mb-4">
                        "{getSelectedFood()?.chaResponse}"
                      </p>
                      
                      <div className="bg-orange-100 rounded-lg p-4">
                        <p className="text-orange-800 text-sm">
                          You both settle onto the couch with the warm {getSelectedFood()?.name}, 
                          the apartment filled with delicious aromas. It's simple moments like these 
                          that make all the dangerous hunter work worthwhile. Sometimes the best dates 
                          are just staying in together.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                  >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                      <span className="text-green-800 text-sm font-medium">Enjoying a cozy meal together...</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-2xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">{getSelectedFood()?.emoji}</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-2">Perfect Evening In</h2>
                  <p className="text-orange-700 text-lg">
                    Simple comfort and quality time together
                  </p>
                </motion.div>

                <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 border border-orange-200">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <Coins className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                      <div className="text-yellow-700 font-bold">₩{getSelectedFood()?.price.toLocaleString()}</div>
                      <div className="text-xs text-orange-600">Cost</div>
                    </div>
                    <div className="text-center">
                      <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <div className="text-green-700 font-bold">+{getSelectedFood()?.energyRestore}</div>
                      <div className="text-xs text-orange-600">Energy Restored</div>
                    </div>
                    <div className="text-center">
                      <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                      <div className="text-pink-700 font-bold">+{getSelectedFood()?.affectionGain}</div>
                      <div className="text-xs text-orange-600">Affection</div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-4 border-t border-orange-200">
                    <p className="text-orange-800 italic text-sm">
                      "Sometimes the simplest moments are the most precious. Thank you for taking care of dinner tonight."
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    Enjoy the Evening
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}