import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Heart, Gift, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LuxuryItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  price: number;
  category: 'jewelry' | 'clothing' | 'chocolates' | 'accessories';
  affectionBonus: number;
  rarity: 'premium' | 'luxury' | 'exclusive';
  position: { x: number; y: number };
  displayType: 'case' | 'mannequin' | 'shelf';
}

interface LuxuryDepartmentStoreProps {
  isVisible: boolean;
  onClose: () => void;
  currentGold: number;
  onPurchase: (item: LuxuryItem) => void;
  backgroundImage?: string;
}

const LUXURY_ITEMS: LuxuryItem[] = [
  {
    id: 'starlight_sapphire_necklace',
    name: 'Starlight Sapphire Necklace',
    description: 'A special gift that greatly increases affection with Cha Hae-In',
    flavorText: 'A brilliant-cut sapphire said to hold the light of a captured star. It hums with faint mana.',
    price: 45000000,
    category: 'jewelry',
    affectionBonus: 25,
    rarity: 'exclusive',
    position: { x: 25, y: 40 },
    displayType: 'case'
  },
  {
    id: 'moonstone_earrings',
    name: 'Moonstone Earrings',
    description: 'Elegant earrings that enhance natural beauty',
    flavorText: 'Carved from authentic moonstone, these earrings seem to glow with their own inner light.',
    price: 28000000,
    category: 'jewelry',
    affectionBonus: 18,
    rarity: 'luxury',
    position: { x: 45, y: 35 },
    displayType: 'case'
  },
  {
    id: 'designer_evening_dress',
    name: 'Designer Evening Dress',
    description: 'An exquisite dress perfect for special occasions',
    flavorText: 'Hand-tailored by Seoul\'s most renowned fashion house, this dress embodies elegance.',
    price: 15000000,
    category: 'clothing',
    affectionBonus: 15,
    rarity: 'luxury',
    position: { x: 70, y: 30 },
    displayType: 'mannequin'
  },
  {
    id: 'artisan_chocolates',
    name: 'Artisan Chocolate Collection',
    description: 'Premium chocolates from a master chocolatier',
    flavorText: 'Each piece is a work of art, crafted with rare cocoa beans and infused with subtle mana.',
    price: 8500000,
    category: 'chocolates',
    affectionBonus: 12,
    rarity: 'premium',
    position: { x: 80, y: 65 },
    displayType: 'shelf'
  },
  {
    id: 'pure_silk_scarf',
    name: 'Pure Silk Scarf',
    description: 'Luxurious silk scarf with an intricate pattern',
    flavorText: 'Woven from the finest silk threads, this scarf tells the story of ancient craftsmanship.',
    price: 3200000,
    category: 'accessories',
    affectionBonus: 8,
    rarity: 'premium',
    position: { x: 55, y: 70 },
    displayType: 'shelf'
  }
];

export default function LuxuryDepartmentStore({ 
  isVisible, 
  onClose, 
  currentGold, 
  onPurchase,
  backgroundImage 
}: LuxuryDepartmentStoreProps) {
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleNodeClick = (item: LuxuryItem) => {
    setSelectedItem(item);
  };

  const handlePurchase = (item: LuxuryItem) => {
    if (currentGold >= item.price) {
      onPurchase(item);
      setSelectedItem(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'exclusive': return 'from-purple-600 to-pink-600';
      case 'luxury': return 'from-blue-600 to-purple-600';
      case 'premium': return 'from-green-600 to-blue-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Spatial Store Interior Background */}
        <div 
          className="relative w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : 
              `linear-gradient(135deg, 
                rgba(245, 245, 245, 0.95) 0%, 
                rgba(250, 250, 250, 0.9) 50%, 
                rgba(240, 240, 240, 0.95) 100%
              )`
          }}
        >
          {/* Atmospheric Store Interior Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 via-transparent to-slate-100/30" />
          
          {/* Store Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/30 to-transparent z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Luxury Department Store</h1>
                <p className="text-gray-600 dark:text-gray-300 italic">Browse our curated collection of premium gifts</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg border border-gray-200/50">
                  <span className="text-amber-600 font-bold">₩{currentGold.toLocaleString()}</span>
                </div>
                <Button 
                  onClick={onClose}
                  variant="ghost" 
                  size="icon"
                  className="text-gray-800 dark:text-white hover:bg-white/20 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Interactive Item Discovery Nodes */}
          <div className="relative w-full h-full pt-24">
            {LUXURY_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                className="absolute cursor-pointer"
                style={{
                  left: `${item.position.x}%`,
                  top: `${item.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNodeClick(item)}
                onHoverStart={() => setHoveredNode(item.id)}
                onHoverEnd={() => setHoveredNode(null)}
              >
                {/* Glowing Purple Discovery Dot */}
                <div className="relative">
                  <motion.div
                    className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-2xl border-2 border-white/60"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(147, 51, 234, 0.6)',
                        '0 0 40px rgba(147, 51, 234, 0.8)',
                        '0 0 20px rgba(147, 51, 234, 0.6)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Pulse Ring */}
                  <motion.div
                    className="absolute inset-0 w-6 h-6 border-2 border-purple-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.8, 1],
                      opacity: [0.8, 0, 0.8]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>

                {/* Hover Tooltip */}
                <AnimatePresence>
                  {hoveredNode === item.id && (
                    <motion.div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 w-64 bg-black/90 backdrop-blur-md rounded-xl p-4 text-white text-sm z-30 border border-purple-400/30"
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    >
                      <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                      <p className="text-gray-300 mb-3 italic">"{item.flavorText}"</p>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-bold">₩{item.price.toLocaleString()}</span>
                        <span className="text-pink-400 flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          +{item.affectionBonus}
                        </span>
                      </div>
                      <div className="text-center mt-2 text-purple-300 text-xs">
                        Click to inspect and purchase
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Premium Item Inspection View */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="relative w-full max-w-6xl h-full max-h-[85vh] bg-white/95 dark:bg-slate-900/95 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl border border-white/20"
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: 50 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-6 right-6 w-12 h-12 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 z-10 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  {/* Two-Column Layout */}
                  <div className="flex h-full">
                    {/* Left Side - 3D Item Showcase */}
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                      {/* Ambient Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500 rounded-full blur-3xl" />
                      </div>
                      
                      {/* 3D Item Display */}
                      <div className="relative z-10">
                        <motion.div
                          className={`w-80 h-80 bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} rounded-full flex items-center justify-center shadow-2xl border-4 border-white/30`}
                          animate={{ rotateY: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                          <Diamond className="w-32 h-32 text-white drop-shadow-2xl" />
                        </motion.div>
                        
                        {/* Floating Particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white/60 rounded-full"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`
                            }}
                            animate={{
                              y: [0, -20, 0],
                              opacity: [0.3, 1, 0.3]
                            }}
                            transition={{
                              duration: 3 + Math.random() * 2,
                              repeat: Infinity,
                              delay: Math.random() * 2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Right Side - Item Details */}
                    <div className="w-96 p-8 bg-white/90 dark:bg-slate-800/90 flex flex-col backdrop-blur-xl">
                      <div className="flex-1">
                        {/* Item Header */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedItem.name}</h2>
                            <div className={`px-3 py-1 rounded-full text-white text-sm bg-gradient-to-r ${getRarityColor(selectedItem.rarity)}`}>
                              {selectedItem.rarity}
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 italic text-lg leading-relaxed">
                            "{selectedItem.flavorText}"
                          </p>
                        </div>
                        
                        {/* Item Description */}
                        <div className="mb-8">
                          <p className="text-gray-700 dark:text-gray-200 leading-relaxed">{selectedItem.description}</p>
                        </div>
                        
                        {/* Item Stats */}
                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Price</span>
                            <span className="text-2xl font-bold text-amber-600">₩{selectedItem.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Affection Bonus</span>
                            <span className="text-xl font-bold text-pink-600 flex items-center gap-2">
                              <Heart className="w-5 h-5" />
                              +{selectedItem.affectionBonus}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Purchase Button */}
                      <Button
                        onClick={() => handlePurchase(selectedItem)}
                        disabled={currentGold < selectedItem.price}
                        className="w-full py-4 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500"
                        size="lg"
                      >
                        {currentGold >= selectedItem.price ? 'Purchase' : 'Insufficient Funds'}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}