import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, ChefHat, Wine, Utensils, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MyeongdongDinnerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (results: any) => void;
  playerGold: number;
  affectionLevel: number;
  backgroundImage?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  affectionBonus: number;
  specialEffect?: string;
}

interface DinnerStage {
  id: string;
  title: string;
  description: string;
}

export function MyeongdongDinnerModal({ 
  isVisible, 
  onClose, 
  onComplete,
  playerGold,
  affectionLevel,
  backgroundImage 
}: MyeongdongDinnerModalProps) {
  const [currentStage, setCurrentStage] = useState<string>('arrival');
  const [selectedItems, setSelectedItems] = useState<MenuItem[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [totalAffection, setTotalAffection] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [dinnerQuality, setDinnerQuality] = useState<'good' | 'great' | 'perfect'>('good');

  const menuItems: MenuItem[] = [
    // Appetizers
    {
      id: 'kimchi_pancake',
      name: 'Crispy Kimchi Pancake',
      description: 'Traditional kimchi jeon with a perfect golden crust, served with soy dipping sauce',
      price: 18000,
      category: 'appetizer',
      affectionBonus: 5,
      specialEffect: 'comfort_food'
    },
    {
      id: 'seafood_pancake',
      name: 'Premium Seafood Pancake',
      description: 'Loaded with fresh squid, shrimp, and scallops in a crispy pancake',
      price: 28000,
      category: 'appetizer',
      affectionBonus: 8
    },

    // Main Courses
    {
      id: 'korean_bbq_set',
      name: 'Premium Korean BBQ Set',
      description: 'Prime marbled beef bulgogi and galbi, grilled to perfection at your table',
      price: 89000,
      category: 'main',
      affectionBonus: 15,
      specialEffect: 'shared_cooking'
    },
    {
      id: 'bibimbap_deluxe',
      name: 'Deluxe Bibimbap',
      description: 'Colorful mixed rice bowl with premium ingredients and perfectly fried egg',
      price: 35000,
      category: 'main',
      affectionBonus: 10
    },
    {
      id: 'bulgogi_hotpot',
      name: 'Royal Bulgogi Hotpot',
      description: 'Tender marinated beef in a rich, aromatic broth with fresh vegetables',
      price: 65000,
      category: 'main',
      affectionBonus: 12,
      specialEffect: 'warming_meal'
    },

    // Desserts
    {
      id: 'korean_shaved_ice',
      name: 'Traditional Patbingsu',
      description: 'Finely shaved ice topped with sweet red beans, condensed milk, and mochi',
      price: 22000,
      category: 'dessert',
      affectionBonus: 6
    },
    {
      id: 'honey_cookies',
      name: 'Honey Yakgwa Cookies',
      description: 'Traditional Korean honey cookies, crispy outside and chewy inside',
      price: 15000,
      category: 'dessert',
      affectionBonus: 4,
      specialEffect: 'sweet_memories'
    },

    // Beverages
    {
      id: 'premium_soju',
      name: 'Premium Aged Soju',
      description: 'Smooth, premium soju aged in oak barrels for a refined taste',
      price: 45000,
      category: 'beverage',
      affectionBonus: 8,
      specialEffect: 'romantic_atmosphere'
    },
    {
      id: 'korean_tea',
      name: 'Traditional Korean Tea',
      description: 'Fragrant jasmine tea served in traditional ceramic cups',
      price: 12000,
      category: 'beverage',
      affectionBonus: 3
    }
  ];

  const dinnerStages: DinnerStage[] = [
    {
      id: 'arrival',
      title: 'Elegant Arrival',
      description: 'You and Cha Hae-In are welcomed into the sophisticated Korean restaurant'
    },
    {
      id: 'ordering',
      title: 'Menu Selection',
      description: 'Choose your dinner courses together'
    },
    {
      id: 'dining',
      title: 'Romantic Dinner',
      description: 'Enjoy your meal and intimate conversation'
    },
    {
      id: 'conclusion',
      title: 'Evening\'s End',
      description: 'A perfect evening comes to a close'
    }
  ];

  const handleItemSelect = (item: MenuItem) => {
    const categoryCount = selectedItems.filter(i => i.category === item.category).length;
    
    // Limit selections per category
    if ((item.category === 'main' && categoryCount >= 1) ||
        (item.category === 'dessert' && categoryCount >= 1) ||
        (item.category === 'beverage' && categoryCount >= 1) ||
        (item.category === 'appetizer' && categoryCount >= 2)) {
      return;
    }

    const newItems = [...selectedItems, item];
    setSelectedItems(newItems);
    setTotalCost(newItems.reduce((sum, i) => sum + i.price, 0));
    setTotalAffection(newItems.reduce((sum, i) => sum + i.affectionBonus, 0));
  };

  const handleItemRemove = (itemId: string) => {
    const newItems = selectedItems.filter(i => i.id !== itemId);
    setSelectedItems(newItems);
    setTotalCost(newItems.reduce((sum, i) => sum + i.price, 0));
    setTotalAffection(newItems.reduce((sum, i) => sum + i.affectionBonus, 0));
  };

  const handleOrderConfirm = () => {
    if (selectedItems.length === 0 || totalCost > playerGold) return;
    
    // Determine dinner quality based on selections
    const hasMain = selectedItems.some(i => i.category === 'main');
    const hasSpecialEffect = selectedItems.some(i => i.specialEffect);
    const isExpensive = totalCost >= 100000;
    
    if (hasMain && hasSpecialEffect && isExpensive) {
      setDinnerQuality('perfect');
    } else if (hasMain && (hasSpecialEffect || isExpensive)) {
      setDinnerQuality('great');
    } else {
      setDinnerQuality('good');
    }
    
    setCurrentStage('dining');
    
    // Transition to results after dining animation
    setTimeout(() => {
      setShowResults(true);
    }, 4000);
  };

  const handleComplete = () => {
    const baseAffection = totalAffection;
    const qualityBonus = dinnerQuality === 'perfect' ? 10 : dinnerQuality === 'great' ? 5 : 0;
    const finalAffection = baseAffection + qualityBonus;
    
    const memory = {
      id: `myeongdong_dinner_${Date.now()}`,
      type: 'romantic_dinner',
      title: `${dinnerQuality === 'perfect' ? 'Perfect' : dinnerQuality === 'great' ? 'Wonderful' : 'Pleasant'} Evening at Myeongdong`,
      description: `A ${dinnerQuality} dinner date at a traditional Korean restaurant, sharing delicious food and intimate conversation.`,
      emotion: dinnerQuality === 'perfect' ? 'deeply_romantic' : 'happy',
      timestamp: new Date().toISOString(),
      location: 'myeongdong_restaurant',
      affectionGain: finalAffection,
      goldSpent: totalCost,
      menuItems: selectedItems.map(i => i.name),
      memoryRank: dinnerQuality === 'perfect' ? 'S' : dinnerQuality === 'great' ? 'A' : 'B'
    };

    onComplete({
      affectionGained: finalAffection,
      goldSpent: totalCost,
      energySpent: 20,
      memory,
      dinnerQuality
    });
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-6xl h-[90vh] bg-gradient-to-br from-orange-900/90 via-red-900/90 to-yellow-900/90 rounded-3xl overflow-hidden shadow-2xl border border-orange-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Header */}
          <div className="bg-black/60 backdrop-blur-md p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <ChefHat className="w-8 h-8 text-orange-300" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Myeongdong Fine Dining</h2>
                  <p className="text-orange-200">An elegant evening of Korean cuisine</p>
                </div>
              </div>
              <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {currentStage === 'arrival' && (
              <div className="h-full flex items-center justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6 max-w-3xl"
                >
                  <div className="text-6xl mb-6">🏮</div>
                  <h3 className="text-3xl font-bold text-white">Welcome to Myeongdong</h3>
                  
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 border border-white/20">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">CH</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-3">Cha Hae-In</h4>
                        <p className="text-white/90 text-lg italic">
                          "This place is beautiful, Jin-Woo. I can smell the amazing Korean barbecue from here. Thank you for bringing me somewhere so special. I've been looking forward to this all day."
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStage('ordering')}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg"
                  >
                    <Utensils className="w-5 h-5 mr-2" />
                    Review the Menu Together
                  </Button>
                </motion.div>
              </div>
            )}

            {currentStage === 'ordering' && !showResults && (
              <div className="h-full overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Menu */}
                    <div className="lg:col-span-2 space-y-6">
                      <h3 className="text-2xl font-bold text-white mb-4">Menu Selection</h3>
                      
                      {['appetizer', 'main', 'dessert', 'beverage'].map(category => (
                        <div key={category} className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                          <h4 className="text-lg font-semibold text-white mb-3 capitalize">
                            {category === 'beverage' ? 'Beverages' : `${category}s`}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {menuItems.filter(item => item.category === category).map(item => (
                              <div
                                key={item.id}
                                onClick={() => handleItemSelect(item)}
                                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                                  selectedItems.some(i => i.id === item.id)
                                    ? 'bg-orange-600/50 border-orange-400'
                                    : 'bg-black/20 border-white/20 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium text-white text-sm">{item.name}</h5>
                                  <span className="text-yellow-300 text-sm">₩{item.price.toLocaleString()}</span>
                                </div>
                                <p className="text-white/70 text-xs">{item.description}</p>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3 text-pink-400" />
                                    <span className="text-pink-300 text-xs">+{item.affectionBonus}</span>
                                  </div>
                                  {item.specialEffect && (
                                    <div className="flex items-center space-x-1">
                                      <Sparkles className="w-3 h-3 text-purple-400" />
                                      <span className="text-purple-300 text-xs">Special</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/20 h-fit sticky top-4">
                      <h3 className="text-xl font-bold text-white mb-4">Your Order</h3>
                      
                      {selectedItems.length === 0 ? (
                        <p className="text-white/60 italic">Select items from the menu</p>
                      ) : (
                        <div className="space-y-3">
                          {selectedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-black/20 rounded">
                              <div>
                                <p className="text-white text-sm">{item.name}</p>
                                <p className="text-white/60 text-xs">+{item.affectionBonus} affection</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-yellow-300 text-sm">₩{item.price.toLocaleString()}</span>
                                <button
                                  onClick={() => handleItemRemove(item.id)}
                                  className="text-red-400 hover:text-red-300 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="border-t border-white/20 mt-4 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white">Total Cost:</span>
                          <span className="text-yellow-300 font-bold">₩{totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-white">Affection Gain:</span>
                          <span className="text-pink-300 font-bold">+{totalAffection}</span>
                        </div>
                        <div className="text-xs text-white/60 mb-4">
                          Available: ₩{playerGold.toLocaleString()}
                        </div>
                        
                        <Button
                          onClick={handleOrderConfirm}
                          disabled={selectedItems.length === 0 || totalCost > playerGold}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3"
                        >
                          {selectedItems.length === 0 
                            ? 'Select Menu Items' 
                            : totalCost > playerGold 
                              ? 'Insufficient Funds' 
                              : 'Confirm Order & Continue'
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStage === 'dining' && !showResults && (
              <div className="h-full flex items-center justify-center p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 max-w-3xl"
                >
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <Utensils className="w-8 h-8 text-orange-400" />
                    <span className="text-orange-300 text-lg">♪ Soft Korean Traditional Music ♪</span>
                    <Wine className="w-8 h-8 text-red-400" />
                  </div>
                  
                  <h2 className="text-4xl font-bold text-white mb-6">Sharing a Meal</h2>
                  
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 border border-white/20">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-white text-xl leading-relaxed italic mb-6"
                    >
                      "The food here is incredible," Cha Hae-In says, taking a delicate bite. "But more than that, I love these quiet moments we can share together, away from all the chaos of hunting."
                    </motion.p>
                    
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                      className="flex items-center justify-center space-x-4"
                    >
                      <Clock className="w-6 h-6 text-white" />
                      <span className="text-white/80">Enjoying your evening together...</span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            )}

            {showResults && (
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full max-w-2xl space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">
                      {dinnerQuality === 'perfect' ? '✨' : dinnerQuality === 'great' ? '🌟' : '⭐'}
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {dinnerQuality === 'perfect' ? 'Perfect Evening' : dinnerQuality === 'great' ? 'Wonderful Dinner' : 'Pleasant Meal'}
                    </h2>
                    <p className="text-orange-200 text-lg">
                      A memorable dinner at Myeongdong's finest restaurant
                    </p>
                  </motion.div>

                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-white">
                        {dinnerQuality === 'perfect' ? 'S-Rank' : dinnerQuality === 'great' ? 'A-Rank' : 'B-Rank'} Memory Created
                      </h3>
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    
                    <div className="text-center space-y-3">
                      <h4 className="text-lg font-semibold text-orange-200">
                        {dinnerQuality === 'perfect' ? 'Perfect' : dinnerQuality === 'great' ? 'Wonderful' : 'Pleasant'} Evening at Myeongdong
                      </h4>
                      <p className="text-white/80">
                        A delightful dinner sharing traditional Korean cuisine, deepening your bond through intimate conversation.
                      </p>
                      
                      <div className="flex items-center justify-center space-x-6 pt-4">
                        <div className="flex items-center space-x-2 text-pink-400">
                          <Heart className="w-6 h-6" />
                          <span>+{totalAffection + (dinnerQuality === 'perfect' ? 10 : dinnerQuality === 'great' ? 5 : 0)} Affection</span>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <span>-₩{totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleComplete}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      Treasure This Evening
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}