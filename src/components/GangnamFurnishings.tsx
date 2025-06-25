import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sofa, Monitor, Palette, Home, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemInspectionView from './ItemInspectionView';

interface FurnitureItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  price: number;
  category: 'furniture' | 'decoration' | 'technology';
  livingSpaceTier: 1 | 2 | 3;
  position: { x: number; y: number };
  displayType: 'showroom' | 'display' | 'tech_demo';
}

interface GangnamFurnishingsProps {
  isVisible: boolean;
  onClose: () => void;
  currentGold: number;
  onPurchase: (item: FurnitureItem) => void;
  backgroundImage?: string;
  chaHaeInShoppingMode?: boolean;
}

const getChaHaeInFurnitureCommentary = (item: FurnitureItem): string => {
  const comments: Record<string, string> = {
    'luxury_sectional_sofa': "This looks incredibly comfortable. Perfect for relaxing after long missions.",
    'smart_home_system': "Impressive technology. I appreciate efficiency in all aspects of life.",
    'modern_coffee_table': "Simple and functional. It would complement the apartment well.",
    'designer_bookshelf': "I could see myself reading here on quiet evenings.",
    'premium_dining_set': "Beautiful craftsmanship. It would be nice to share meals together here.",
    'home_theater_system': "This could make movie nights even more enjoyable.",
    'workspace_desk': "A clean, organized workspace is essential for productivity.",
    'ambient_lighting': "The right lighting can transform a space completely."
  };
  
  return comments[item.id] || "This piece has potential. What draws you to it?";
};

const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'luxury_sectional_sofa',
    name: 'Designer Sectional Sofa',
    description: 'Premium Italian leather seating for your living space',
    flavorText: 'Handcrafted in Milan with supple leather that ages beautifully. Each piece tells a story of European artisanship.',
    price: 35000000,
    category: 'furniture',
    livingSpaceTier: 2,
    position: { x: 25, y: 45 },
    displayType: 'showroom'
  },
  {
    id: 'king_platform_bed',
    name: 'Platform King Bed',
    description: 'Minimalist platform bed with integrated storage',
    flavorText: 'Clean lines meet practical design. Hidden compartments provide storage while maintaining aesthetic purity.',
    price: 28000000,
    category: 'furniture',
    livingSpaceTier: 2,
    position: { x: 60, y: 35 },
    displayType: 'showroom'
  },
  {
    id: 'modern_art_collection',
    name: 'Contemporary Art Collection',
    description: 'Curated modern art pieces to elevate your space',
    flavorText: 'Three pieces by emerging Korean artists, each capturing the dynamic spirit of modern Seoul.',
    price: 45000000,
    category: 'decoration',
    livingSpaceTier: 3,
    position: { x: 20, y: 70 },
    displayType: 'display'
  },
  {
    id: 'smart_entertainment_system',
    name: 'Smart Entertainment Hub',
    description: 'Premium audio-visual system with AI integration',
    flavorText: 'Crystal-clear 8K display with surround sound that transforms your space into a private cinema.',
    price: 55000000,
    category: 'technology',
    livingSpaceTier: 3,
    position: { x: 75, y: 50 },
    displayType: 'tech_demo'
  },
  {
    id: 'marble_dining_set',
    name: 'Carrara Marble Dining Set',
    description: 'Elegant dining table with matching chairs',
    flavorText: 'Carved from a single block of Carrara marble, this table has hosted conversations that shaped empires.',
    price: 40000000,
    category: 'furniture',
    livingSpaceTier: 2,
    position: { x: 45, y: 60 },
    displayType: 'showroom'
  },
  {
    id: 'indoor_garden_system',
    name: 'Automated Indoor Garden',
    description: 'Self-maintaining hydroponic garden system',
    flavorText: 'Brings nature indoors with automated care. Fresh herbs and flowers year-round without effort.',
    price: 22000000,
    category: 'decoration',
    livingSpaceTier: 1,
    position: { x: 70, y: 25 },
    displayType: 'display'
  }
];

export default function GangnamFurnishings({ 
  isVisible, 
  onClose, 
  currentGold, 
  onPurchase,
  backgroundImage 
}: GangnamFurnishingsProps) {
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleItemClick = (item: FurnitureItem) => {
    setSelectedItem(item);
  };

  const handlePurchase = (item: FurnitureItem) => {
    if (currentGold >= item.price) {
      onPurchase(item);
      setSelectedItem(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'furniture': return <Sofa className="w-4 h-4" />;
      case 'technology': return <Monitor className="w-4 h-4" />;
      case 'decoration': return <Palette className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'from-green-600 to-emerald-600';
      case 2: return 'from-blue-600 to-cyan-600';
      case 3: return 'from-purple-600 to-pink-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? FURNITURE_ITEMS 
    : FURNITURE_ITEMS.filter(item => item.category === selectedCategory);

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
                <h1 className="text-3xl font-bold text-white mb-2">Gangnam Modern Furnishings</h1>
                <p className="text-white/80">Premium furniture and decor for sophisticated living</p>
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

          {/* Category Filter */}
          <div className="absolute top-24 left-6 right-6 z-20">
            <div className="flex gap-2 justify-center">
              {['all', 'furniture', 'decoration', 'technology'].map((category) => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  className={`${
                    selectedCategory === category 
                      ? 'bg-white/90 text-slate-800' 
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                  }`}
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2 capitalize">{category}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Store Showroom */}
          <div className="relative w-full h-full pt-36 pb-6 px-6">
            <div className="relative w-full h-full bg-gradient-to-b from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-xl backdrop-blur-sm border border-white/20">
              
              {/* Interactive Items Display */}
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${item.position.x}%`,
                    top: `${item.position.y}%`
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleItemClick(item)}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  layout
                >
                  {/* Item Display */}
                  <div className={`relative w-32 h-24 bg-gradient-to-br ${getTierColor(item.livingSpaceTier)} rounded-lg p-1 shadow-lg`}>
                    <div className="w-full h-full bg-white/90 dark:bg-slate-800/90 rounded-md flex items-center justify-center backdrop-blur-sm">
                      {getCategoryIcon(item.category)}
                    </div>
                    
                    {/* Tier Indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold border-2 border-current">
                      {item.livingSpaceTier}
                    </div>
                  </div>

                  {/* Hover Details */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-black/90 backdrop-blur-md rounded-lg p-4 text-white text-sm z-30"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <h4 className="font-bold mb-1">{item.name}</h4>
                        <p className="text-gray-300 mb-2 text-xs">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-bold">₩{item.price.toLocaleString()}</span>
                          <span className="text-blue-400 text-xs">Tier {item.livingSpaceTier}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Showroom Ambiance */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg inline-block">
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                    "Transform your living space with designer furniture"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Inspection Modal */}
          <ItemInspectionView
            item={selectedItem as any}
            currentGold={currentGold}
            onPurchase={(item) => handlePurchase(item as FurnitureItem)}
            onClose={() => setSelectedItem(null)}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}