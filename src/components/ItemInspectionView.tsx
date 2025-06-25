import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, X } from 'lucide-react';

interface ItemData {
  id: string;
  name: string;
  price: number;
  description: string;
  affectionBonus: number;
  category: 'jewelry' | 'clothing' | 'living_room' | 'bedroom';
  rarity: 'common' | 'rare' | 'luxury' | 'premium';
  imagePrompt: string;
  chaHaeInReaction: string;
}

interface ItemInspectionViewProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'jewelry' | 'clothing' | 'living_room' | 'bedroom';
  playerGold: number;
  onPurchase: (item: ItemData) => void;
}

const ITEM_CATALOG: Record<string, ItemData[]> = {
  jewelry: [
    {
      id: 'diamond_necklace',
      name: 'Elegant Diamond Necklace',
      price: 50000,
      description: 'A stunning piece featuring a brilliant-cut diamond pendant on a delicate platinum chain. The craftsmanship is exquisite.',
      affectionBonus: 12,
      category: 'jewelry',
      rarity: 'luxury',
      imagePrompt: 'elegant diamond necklace on black velvet, premium jewelry store display, sparkling under boutique lighting',
      chaHaeInReaction: '"It\'s absolutely beautiful, Jin-Woo... you really didn\'t have to." *her eyes sparkle with genuine appreciation*'
    },
    {
      id: 'pearl_earrings',
      name: 'Cultured Pearl Earrings',
      price: 35000,
      description: 'Lustrous South Sea pearls set in rose gold. Classic elegance that complements any occasion.',
      affectionBonus: 9,
      category: 'jewelry',
      rarity: 'rare',
      imagePrompt: 'cultured pearl earrings in rose gold, luxury jewelry box, elegant lighting',
      chaHaeInReaction: '"These are so sophisticated... they remind me of moonlight on water." *touches her ear gently*'
    },
    {
      id: 'sapphire_bracelet',
      name: 'Royal Sapphire Bracelet',
      price: 75000,
      description: 'Deep blue sapphires alternating with diamonds in a tennis bracelet design. Fit for royalty.',
      affectionBonus: 15,
      category: 'jewelry',
      rarity: 'premium',
      imagePrompt: 'royal sapphire and diamond tennis bracelet, deep blue gemstones, luxury jewelry presentation',
      chaHaeInReaction: '"The blue is so deep... like the ocean depths. This must have cost a fortune." *looks both amazed and concerned*'
    }
  ],
  clothing: [
    {
      id: 'silk_evening_gown',
      name: 'Midnight Silk Evening Gown',
      price: 40000,
      description: 'A flowing evening gown in midnight blue silk with subtle beadwork. Perfect for formal occasions.',
      affectionBonus: 10,
      category: 'clothing',
      rarity: 'luxury',
      imagePrompt: 'midnight blue silk evening gown on mannequin, designer boutique, elegant draping and beadwork',
      chaHaeInReaction: '"It\'s like wearing liquid starlight... I feel so elegant in this." *twirls gracefully*'
    },
    {
      id: 'cashmere_coat',
      name: 'Designer Cashmere Coat',
      price: 30000,
      description: 'Ultra-soft cashmere in pearl gray with minimalist design. Warmth and style combined.',
      affectionBonus: 8,
      category: 'clothing',
      rarity: 'rare',
      imagePrompt: 'pearl gray cashmere coat on designer hanger, luxury fabric texture, boutique setting',
      chaHaeInReaction: '"This is incredibly soft... and the cut is perfect. You have excellent taste." *wraps it around herself*'
    }
  ],
  living_room: [
    {
      id: 'italian_leather_sofa',
      name: 'Italian Leather Sectional',
      price: 80000,
      description: 'Hand-crafted Italian leather sectional in cognac brown. Premium comfort for your living space.',
      affectionBonus: 12,
      category: 'living_room',
      rarity: 'luxury',
      imagePrompt: 'Italian leather sectional sofa in cognac brown, modern furniture showroom, premium quality',
      chaHaeInReaction: '"This leather is so supple... your apartment is going to look amazing with this." *sits and tests the comfort*'
    },
    {
      id: 'marble_coffee_table',
      name: 'Carrara Marble Coffee Table',
      price: 45000,
      description: 'Sleek marble coffee table with black steel legs. Modern elegance for your living room.',
      affectionBonus: 8,
      category: 'living_room',
      rarity: 'rare',
      imagePrompt: 'Carrara marble coffee table with black steel legs, modern furniture display, clean lines',
      chaHaeInReaction: '"The marble veining is beautiful... it\'ll be the perfect centerpiece." *traces the marble pattern*'
    }
  ],
  bedroom: [
    {
      id: 'king_platform_bed',
      name: 'Platform King Bed Frame',
      price: 60000,
      description: 'Minimalist walnut platform bed with integrated nightstands. Modern luxury for your bedroom.',
      affectionBonus: 15,
      category: 'bedroom',
      rarity: 'luxury',
      imagePrompt: 'walnut platform king bed with integrated nightstands, modern bedroom furniture, clean design',
      chaHaeInReaction: '"This is so elegant... and spacious." *blushes slightly at the implication* "Your bedroom will be perfect."'
    },
    {
      id: 'silk_bedding_set',
      name: 'Mulberry Silk Bedding Set',
      price: 25000,
      description: 'Pure mulberry silk sheets, pillowcases, and duvet cover in champagne. Ultimate luxury sleep.',
      affectionBonus: 10,
      category: 'bedroom',
      rarity: 'rare',
      imagePrompt: 'champagne silk bedding set on display, luxurious fabric texture, bedroom furniture store',
      chaHaeInReaction: '"Silk sheets... that\'s so indulgent." *runs her hand over the fabric* "They feel like clouds."'
    }
  ]
};

export default function ItemInspectionView({ isOpen, onClose, category, playerGold, onPurchase }: ItemInspectionViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemImage, setItemImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const items = ITEM_CATALOG[category] || [];
  const currentItem = items[currentIndex];

  // Generate item image when item changes
  useEffect(() => {
    if (currentItem && isOpen) {
      generateItemImage(currentItem.imagePrompt);
    }
  }, [currentItem, isOpen]);

  const generateItemImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `${prompt}, high quality product photography, professional lighting, Solo Leveling art style`,
          preferredProvider: 'NovelAI'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setItemImage(data.imageUrl);
        }
      }
    } catch (error) {
      console.log('Item image generation failed:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const canAfford = currentItem && playerGold >= currentItem.price;

  const handlePurchase = () => {
    if (currentItem && canAfford) {
      onPurchase(currentItem);
      onClose();
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'premium': return 'from-purple-500 to-pink-500';
      case 'luxury': return 'from-amber-500 to-orange-500';
      case 'rare': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'jewelry': return 'Jewelry Collection';
      case 'clothing': return 'Designer Apparel';
      case 'living_room': return 'Living Room Furniture';
      case 'bedroom': return 'Bedroom Collection';
      default: return 'Item Collection';
    }
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-purple-400/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-purple-400/20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{getCategoryTitle(category)}</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex h-[70vh]">
            {/* Image Section */}
            <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-slate-800/50">
              <div className="relative w-full max-w-md aspect-square bg-slate-700/50 rounded-xl overflow-hidden">
                {isGeneratingImage ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  </div>
                ) : itemImage ? (
                  <img
                    src={itemImage}
                    alt={currentItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-4 mt-6">
                <Button
                  onClick={prevItem}
                  variant="outline"
                  size="sm"
                  className="border-purple-400/30"
                  disabled={items.length <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm">
                  {currentIndex + 1} of {items.length}
                </span>
                <Button
                  onClick={nextItem}
                  variant="outline"
                  size="sm"
                  className="border-purple-400/30"
                  disabled={items.length <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Details Section */}
            <div className="w-1/2 p-6 flex flex-col justify-between">
              <div>
                {/* Rarity Badge */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getRarityColor(currentItem.rarity)} mb-4`}>
                  {currentItem.rarity.toUpperCase()}
                </div>

                {/* Item Name */}
                <h3 className="text-3xl font-bold text-white mb-4">{currentItem.name}</h3>

                {/* Description */}
                <p className="text-gray-300 mb-6 leading-relaxed">{currentItem.description}</p>

                {/* Cha Hae-In Reaction */}
                <div className="bg-purple-500/10 border border-purple-400/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-semibold text-purple-300">Cha Hae-In's Reaction</span>
                  </div>
                  <p className="text-gray-200 italic text-sm">{currentItem.chaHaeInReaction}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Price</div>
                    <div className="text-lg font-bold text-white">₩{currentItem.price.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Affection Bonus</div>
                    <div className="text-lg font-bold text-pink-400">+{currentItem.affectionBonus}</div>
                  </div>
                </div>
              </div>

              {/* Purchase Section */}
              <div className="space-y-3">
                <div className="text-sm text-gray-400">
                  Your Gold: ₩{playerGold.toLocaleString()}
                </div>
                <Button
                  onClick={handlePurchase}
                  disabled={!canAfford}
                  className={`w-full ${canAfford 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {canAfford ? 'Purchase Item' : 'Insufficient Funds'}
                </Button>
                {!canAfford && (
                  <div className="text-xs text-red-400 text-center">
                    Need ₩{(currentItem.price - playerGold).toLocaleString()} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}