import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Heart, Gift, ShoppingBag, X } from 'lucide-react';
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
  chaHaeInShoppingMode?: boolean;
}

const getChaHaeInCommentary = (item: LuxuryItem): string => {
  const comments: Record<string, string> = {
    'starlight_sapphire_necklace': "That sapphire... it's beautiful. The way it catches the light reminds me of moonlit raids.",
    'moonstone_earrings': "These would complement my hair color perfectly. You have good taste, Jin-Woo.",
    'platinum_bracelet': "Simple yet elegant. I appreciate functional beauty over flashy displays.",
    'exclusive_handbag': "A quality piece that would last for years. I value craftsmanship like this.",
    'silk_evening_dress': "It's lovely, but I wonder when I'd have occasion to wear something so formal...",
    'designer_watch': "Practical and stylish. A hunter needs to keep track of time during missions.",
    'premium_chocolates': "These look delicious. Though I should maintain my training diet...",
    'crystal_vase': "Beautiful, but I'm not sure my apartment needs more decorative pieces right now."
  };
  
  return comments[item.id] || "This catches my eye. What do you think about it?";
};

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
    position: { x: 20, y: 40 },
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
    position: { x: 35, y: 45 },
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
    position: { x: 60, y: 30 },
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
    position: { x: 75, y: 60 },
    displayType: 'shelf'
  },
  {
    id: 'silk_scarf',
    name: 'Pure Silk Scarf',
    description: 'A luxurious accessory woven from the finest silk',
    flavorText: 'Woven by master artisans, this scarf feels like liquid starlight against the skin.',
    price: 6200000,
    category: 'accessories',
    affectionBonus: 10,
    rarity: 'premium',
    position: { x: 45, y: 70 },
    displayType: 'shelf'
  },
  {
    id: 'diamond_bracelet',
    name: 'Diamond Tennis Bracelet',
    description: 'A stunning bracelet set with flawless diamonds',
    flavorText: 'Each diamond was personally selected for its perfect clarity and brilliant fire.',
    price: 75000000,
    category: 'jewelry',
    affectionBonus: 35,
    rarity: 'exclusive',
    position: { x: 25, y: 25 },
    displayType: 'case'
  }
];

export default function LuxuryDepartmentStore({ 
  isVisible, 
  onClose, 
  currentGold, 
  onPurchase,
  backgroundImage,
  chaHaeInShoppingMode = false
}: LuxuryDepartmentStoreProps) {
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [chaCommentary, setChaCommentary] = useState<string | null>(null);

  const handleNodeClick = (item: LuxuryItem) => {
    setSelectedItem(item);
  };

  const handleItemClick = (item: LuxuryItem) => {
    setSelectedItem(item);
    if (chaHaeInShoppingMode) {
      setChaCommentary(getChaHaeInCommentary(item));
    }
  };

  const handleItemHover = (item: LuxuryItem | null) => {
    if (chaHaeInShoppingMode && item) {
      setChaCommentary(getChaHaeInCommentary(item));
    } else if (!item) {
      setChaCommentary(null);
    }
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Store Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Luxury Department Store</h1>
                <p className="text-white/80">Premium gifts and accessories for discerning tastes</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg">
                  <span className="text-yellow-400 font-bold">₩{currentGold.toLocaleString()}</span>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Store Interior - Clean Refined Layout */}
          <div className="relative w-full h-full pt-20 pb-8 px-8">
            {/* Elegant Store Environment */}
            <div className="relative w-full h-full bg-gradient-to-b from-gray-100/95 to-gray-50/95 dark:from-slate-800/95 dark:to-slate-900/95 rounded-2xl backdrop-blur-md border border-white/30">
              
              {/* Refined Store Header */}
              <div className="absolute top-6 left-0 right-0 text-center z-10">
                <p className="text-gray-600 dark:text-gray-300 italic text-lg font-light">
                  "Browse our curated collection of premium gifts"
                </p>
              </div>
              
              {/* Premium Item Displays - Clean Glass Cases, Elegant Mannequins, and Refined Shelves */}
              {LUXURY_ITEMS.map((item) => (
                <motion.div
                  key={item.id}
                  className="absolute cursor-pointer"
                  style={{
                    left: `${item.position.x}%`,
                    top: `${item.position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleItemClick(item)}
                  onHoverStart={() => {
                    setHoveredItem(item.id);
                    handleItemHover(item);
                  }}
                  onHoverEnd={() => {
                    setHoveredItem(null);
                    handleItemHover(null);
                  }}
                >
                  {/* Display Type - Refined Glass Case */}
                  {item.displayType === 'case' && (
                    <div className="relative">
                      {/* Elegant Glass Display Case */}
                      <div className="w-40 h-28 bg-gradient-to-b from-white/90 to-gray-100/80 rounded-xl border border-gray-200/60 backdrop-blur-sm shadow-2xl overflow-hidden">
                        {/* Glass Reflection Effect */}
                        <div className="absolute inset-x-2 top-2 bottom-8 bg-gradient-to-br from-white/40 via-transparent to-white/20 rounded-lg border border-white/60" />
                        
                        {/* Premium Item Display */}
                        <div className="absolute inset-0 flex items-center justify-center pt-2">
                          <motion.div
                            className={`w-12 h-12 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-full flex items-center justify-center shadow-xl border-2 border-white/30`}
                            animate={{ rotateY: [0, 360] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          >
                            <Diamond className="w-6 h-6 text-white drop-shadow-lg" />
                          </motion.div>
                        </div>
                        
                        {/* Sophisticated Lighting */}
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-gradient-to-r from-transparent via-amber-200/80 to-transparent rounded-full" />
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
                      </div>
                      
                      {/* Elegant Name Plate */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg border border-gray-600/50">
                        {item.name}
                      </div>
                    </div>
                  )}

                  {/* Display Type - Mannequin */}
                  {item.displayType === 'mannequin' && (
                    <div className="relative">
                      {/* Mannequin Stand */}
                      <div className="w-24 h-40 bg-gradient-to-b from-slate-200/80 to-slate-300/60 rounded-lg backdrop-blur-sm shadow-xl overflow-hidden">
                        {/* Mannequin Figure */}
                        <div className="absolute inset-x-2 top-4 bottom-8 bg-gradient-to-b from-white/40 to-slate-100/40 rounded-sm">
                          {/* Dress/Clothing Display */}
                          <div className={`absolute inset-2 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded opacity-80`} />
                          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white/60 rounded-full" />
                        </div>
                        
                        {/* Mannequin Base */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-slate-400/60 rounded-b-lg" />
                      </div>
                      
                      {/* Mannequin Label */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap">
                        {item.name}
                      </div>
                    </div>
                  )}

                  {/* Display Type - Shelf */}
                  {item.displayType === 'shelf' && (
                    <div className="relative">
                      {/* Wooden Shelf */}
                      <div className="w-28 h-16 bg-gradient-to-b from-amber-100/80 to-amber-200/60 rounded backdrop-blur-sm shadow-xl border border-amber-300/40">
                        {/* Shelf Surface */}
                        <div className="absolute top-2 left-2 right-2 h-1 bg-amber-300/60 rounded" />
                        
                        {/* Item on Shelf */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <motion.div
                            className={`w-12 h-8 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg flex items-center justify-center shadow-md`}
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Gift className="w-3 h-3 text-white" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Shelf Label */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-1 rounded text-white text-xs font-medium">
                        {item.name}
                      </div>
                    </div>
                  )}

                  {/* Detailed Hover Information */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-64 bg-black/95 backdrop-blur-md rounded-xl p-4 text-white text-sm z-30 border border-white/20"
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          <div className={`px-2 py-1 rounded text-xs bg-gradient-to-r ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3 text-sm italic">"{item.flavorText}"</p>
                        <p className="text-gray-400 mb-3 text-xs">{item.description}</p>
                        
                        <div className="border-t border-white/20 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-400 font-bold text-xl">₩{item.price.toLocaleString()}</span>
                            <span className="text-pink-400 flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              +{item.affectionBonus} Affection
                            </span>
                          </div>
                          <div className="text-center mt-2">
                            <span className="text-gray-400 text-xs">Click to inspect and purchase</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Ambient Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg opacity-10 animate-pulse pointer-events-none`} 
                       style={{ transform: 'scale(1.2)' }} />
                </motion.div>
              ))}

              {/* Store Ambiance Elements */}
              <div className="absolute top-4 left-4 right-4 flex justify-center">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-center">
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                    "Browse our curated collection of premium gifts"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Inspection Modal */}
          {selectedItem && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl h-full max-h-[80vh] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex h-full">
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                    <div className="w-80 h-80 bg-white/20 rounded-lg flex items-center justify-center">
                      <motion.div
                        className={`w-32 h-32 bg-gradient-to-br ${getRarityColor(selectedItem.rarity)} rounded-full flex items-center justify-center shadow-2xl`}
                        animate={{ rotateY: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      >
                        <Diamond className="w-16 h-16 text-white" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <div className="w-96 p-8 bg-white/90 dark:bg-slate-800/90 flex flex-col">
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-4">{selectedItem.name}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{selectedItem.flavorText}"</p>
                      <p className="text-gray-700 dark:text-gray-200 mb-8">{selectedItem.description}</p>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Price:</span>
                          <span className="text-2xl font-bold text-yellow-600">₩{selectedItem.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Affection Bonus:</span>
                          <span className="text-xl font-bold text-pink-600 flex items-center gap-2">
                            <Heart className="w-5 h-5" />
                            +{selectedItem.affectionBonus}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">Rarity:</span>
                          <span className={`px-3 py-1 rounded-lg text-white bg-gradient-to-r ${getRarityColor(selectedItem.rarity)}`}>
                            {selectedItem.rarity}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handlePurchase(selectedItem)}
                      disabled={currentGold < selectedItem.price}
                      className="w-full py-4 text-lg font-bold"
                      size="lg"
                    >
                      {currentGold >= selectedItem.price ? 'Purchase' : 'Insufficient Funds'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cha Hae-In Commentary Panel */}
          {chaHaeInShoppingMode && chaCommentary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 right-6 max-w-md bg-gradient-to-r from-blue-500/95 to-purple-500/95 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-2">Cha Hae-In</h4>
                  <p className="text-white/90 text-sm italic">"{chaCommentary}"</p>
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}