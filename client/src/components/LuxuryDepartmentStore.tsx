import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Diamond, Heart, Gift, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemInspectionView from './ItemInspectionView';

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
  backgroundImage 
}: LuxuryDepartmentStoreProps) {
  const [selectedItem, setSelectedItem] = useState<LuxuryItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (item: LuxuryItem) => {
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

  const getDisplayIcon = (displayType: string, category: string) => {
    if (displayType === 'case') return <Diamond className="w-3 h-3" />;
    if (displayType === 'mannequin') return <ShoppingBag className="w-3 h-3" />;
    return <Gift className="w-3 h-3" />;
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

          {/* Store Interior - Interactive Spatial View */}
          <div className="relative w-full h-full pt-24 pb-6 px-6">
            {/* Luxury Store Environment */}
            <div className="relative w-full h-full bg-gradient-to-b from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-xl backdrop-blur-sm border border-white/20">
              
              {/* Interactive Items Display */}
              {LUXURY_ITEMS.map((item) => (
                <motion.div
                  key={item.id}
                  className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
                  style={{
                    left: `${item.position.x}%`,
                    top: `${item.position.y}%`
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleItemClick(item)}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                >
                  {/* Item Display Container */}
                  <div className={`relative w-24 h-24 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg p-1 shadow-lg`}>
                    <div className="w-full h-full bg-white/90 dark:bg-slate-800/90 rounded-md flex items-center justify-center backdrop-blur-sm">
                      {getDisplayIcon(item.displayType, item.category)}
                    </div>
                    
                    {/* Hover Info */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-black/90 backdrop-blur-md rounded-lg p-3 text-white text-sm z-30"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <h4 className="font-bold mb-1">{item.name}</h4>
                          <p className="text-gray-300 mb-2 text-xs">{item.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-yellow-400 font-bold">₩{item.price.toLocaleString()}</span>
                            <span className="text-pink-400 flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              +{item.affectionBonus}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Rarity Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} rounded-lg opacity-20 animate-pulse`} />
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
          <ItemInspectionView
            item={selectedItem}
            currentGold={currentGold}
            onPurchase={handlePurchase}
            onClose={() => setSelectedItem(null)}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}