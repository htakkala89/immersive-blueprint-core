import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Gift, Flower, Gem, Coffee, Book, Sparkles, ShoppingBag } from 'lucide-react';

interface GiftItem {
  id: string;
  name: string;
  description: string;
  price: number;
  affectionGain: number;
  intimacyGain: number;
  category: 'flowers' | 'jewelry' | 'books' | 'food' | 'experiences' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  chaHaeInReaction: string;
  unlockRequirement?: {
    affectionLevel?: number;
    intimacyLevel?: number;
    specialEvent?: string;
  };
}

interface GiftSystemProps {
  isVisible: boolean;
  onClose: () => void;
  playerGold: number;
  currentAffection: number;
  currentIntimacy: number;
  onPurchaseGift: (gift: GiftItem) => void;
}

const GIFT_CATALOG: GiftItem[] = [
  // Flowers
  {
    id: 'red_roses',
    name: 'Red Roses',
    description: 'Classic red roses that express deep feelings. Perfect for romantic moments.',
    price: 150,
    affectionGain: 15,
    intimacyGain: 5,
    category: 'flowers',
    rarity: 'common',
    icon: '🌹',
    chaHaeInReaction: "These are beautiful... red roses always make me think of passionate feelings."
  },
  {
    id: 'white_lilies',
    name: 'White Lilies',
    description: 'Pure white lilies symbolizing elegance and grace.',
    price: 200,
    affectionGain: 20,
    intimacyGain: 8,
    category: 'flowers',
    rarity: 'rare',
    icon: '🤍',
    chaHaeInReaction: "Lilies are my favorite... how did you know? They remind me of quiet strength."
  },
  {
    id: 'exotic_orchids',
    name: 'Exotic Orchids',
    description: 'Rare orchids that bloom once a year. A symbol of refined taste.',
    price: 500,
    affectionGain: 35,
    intimacyGain: 15,
    category: 'flowers',
    rarity: 'epic',
    icon: '🌺',
    chaHaeInReaction: "These orchids are extraordinary! I've never seen such rare varieties. You really understand beauty.",
    unlockRequirement: { affectionLevel: 50 }
  },

  // Jewelry
  {
    id: 'silver_necklace',
    name: 'Silver Necklace',
    description: 'Elegant silver necklace with a delicate chain.',
    price: 300,
    affectionGain: 25,
    intimacyGain: 10,
    category: 'jewelry',
    rarity: 'common',
    icon: '💎',
    chaHaeInReaction: "It's lovely... silver suits me better than gold. Thank you for noticing my preferences."
  },
  {
    id: 'sapphire_earrings',
    name: 'Sapphire Earrings',
    description: 'Beautiful sapphire earrings that match her eyes.',
    price: 800,
    affectionGain: 40,
    intimacyGain: 20,
    category: 'jewelry',
    rarity: 'rare',
    icon: '💙',
    chaHaeInReaction: "These sapphires... they're the same color as my eyes, aren't they? You pay such close attention to details."
  },
  {
    id: 'moonstone_ring',
    name: 'Moonstone Ring',
    description: 'A mystical moonstone ring that glows softly in moonlight.',
    price: 1200,
    affectionGain: 50,
    intimacyGain: 25,
    category: 'jewelry',
    rarity: 'epic',
    icon: '🌙',
    chaHaeInReaction: "This moonstone... it's magical. When I wear it, I feel like we're connected under the same moon.",
    unlockRequirement: { affectionLevel: 70, intimacyLevel: 30 }
  },

  // Books
  {
    id: 'poetry_collection',
    name: 'Poetry Collection',
    description: 'A collection of romantic poetry from famous authors.',
    price: 100,
    affectionGain: 18,
    intimacyGain: 12,
    category: 'books',
    rarity: 'common',
    icon: '📖',
    chaHaeInReaction: "Poetry... I love how words can capture feelings that are hard to express. Will you read some to me?"
  },
  {
    id: 'hunter_memoirs',
    name: 'Hunter Memoirs',
    description: 'Memoirs of legendary hunters and their adventures.',
    price: 250,
    affectionGain: 30,
    intimacyGain: 15,
    category: 'books',
    rarity: 'rare',
    icon: '⚔️',
    chaHaeInReaction: "These stories of hunters... they inspire me. It's nice to read about others who understand our world."
  },

  // Food & Experiences
  {
    id: 'premium_coffee',
    name: 'Premium Coffee Beans',
    description: 'Rare coffee beans from the mountains. Perfect for quiet moments together.',
    price: 180,
    affectionGain: 22,
    intimacyGain: 18,
    category: 'food',
    rarity: 'common',
    icon: '☕',
    chaHaeInReaction: "This coffee smells amazing... let's brew some together. I love these peaceful moments with you."
  },
  {
    id: 'spa_day',
    name: 'Spa Day Voucher',
    description: 'A day of relaxation and pampering at a luxury spa.',
    price: 600,
    affectionGain: 45,
    intimacyGain: 30,
    category: 'experiences',
    rarity: 'rare',
    icon: '🧖‍♀️',
    chaHaeInReaction: "A spa day... that sounds wonderful. The stress of hunting takes its toll. Thank you for thinking of my wellbeing.",
    unlockRequirement: { affectionLevel: 40 }
  },

  // Special Items
  {
    id: 'shadow_crystal',
    name: 'Shadow Crystal Pendant',
    description: 'A pendant containing a fragment of shadow energy, symbolizing your connection.',
    price: 2000,
    affectionGain: 80,
    intimacyGain: 50,
    category: 'special',
    rarity: 'legendary',
    icon: '🔮',
    chaHaeInReaction: "This shadow crystal... it resonates with your power. Wearing it makes me feel closer to you, even when we're apart.",
    unlockRequirement: { affectionLevel: 90, intimacyLevel: 60 }
  },
  {
    id: 'promise_ring',
    name: 'Promise Ring',
    description: 'A ring that symbolizes your deepening commitment to each other.',
    price: 1500,
    affectionGain: 100,
    intimacyGain: 80,
    category: 'special',
    rarity: 'legendary',
    icon: '💍',
    chaHaeInReaction: "A promise ring... Jin-Woo, this means so much to me. I promise to treasure this, and you, always.",
    unlockRequirement: { affectionLevel: 85, intimacyLevel: 70 }
  }
];

export function GiftSystem({ 
  isVisible, 
  onClose, 
  playerGold, 
  currentAffection, 
  currentIntimacy,
  onPurchaseGift 
}: GiftSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  if (!isVisible) return null;

  const categories = ['all', 'flowers', 'jewelry', 'books', 'food', 'experiences', 'special'];

  const filteredGifts = GIFT_CATALOG.filter(gift => {
    if (selectedCategory !== 'all' && gift.category !== selectedCategory) return false;
    
    // Check unlock requirements
    if (gift.unlockRequirement) {
      if (gift.unlockRequirement.affectionLevel && currentAffection < gift.unlockRequirement.affectionLevel) return false;
      if (gift.unlockRequirement.intimacyLevel && currentIntimacy < gift.unlockRequirement.intimacyLevel) return false;
    }
    
    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flowers': return <Flower className="w-4 h-4" />;
      case 'jewelry': return <Gem className="w-4 h-4" />;
      case 'books': return <Book className="w-4 h-4" />;
      case 'food': return <Coffee className="w-4 h-4" />;
      case 'experiences': return <Sparkles className="w-4 h-4" />;
      case 'special': return <Heart className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-pink-900/90 to-purple-900/90 border border-pink-500/30 rounded-xl w-full max-w-6xl h-5/6 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-pink-500/30">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-400" />
            Gift Shop for Cha Hae-In
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Gold: {playerGold}
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-pink-500/20">
              ×
            </Button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Category Filter */}
          <div className="w-1/4 p-6 border-r border-pink-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start text-white"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2 capitalize">{category}</span>
                </Button>
              ))}
            </div>

            {/* Current Relationship Status */}
            <Card className="mt-6 bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-pink-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Relationship Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-pink-300">Affection</span>
                  <span className="text-white">{currentAffection}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-300">Intimacy</span>
                  <span className="text-white">{currentIntimacy}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gift Catalog */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredGifts.map(gift => {
                const canAfford = playerGold >= gift.price;

                return (
                  <Card key={gift.id} className="bg-slate-800/50 border-slate-600 hover:border-pink-500/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{gift.icon}</span>
                        <Badge className={`${getRarityColor(gift.rarity)} text-white text-xs`}>
                          {gift.rarity}
                        </Badge>
                      </div>
                      
                      <h4 className="text-white font-medium mb-2">{gift.name}</h4>
                      <p className="text-slate-300 text-xs mb-3">{gift.description}</p>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-pink-300">Affection</span>
                          <span className="text-pink-400">+{gift.affectionGain}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-300">Intimacy</span>
                          <span className="text-purple-400">+{gift.intimacyGain}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-yellow-400 font-medium">{gift.price} Gold</span>
                      </div>

                      <Button
                        onClick={() => setSelectedGift(gift)}
                        disabled={!canAfford}
                        size="sm"
                        className="w-full mb-2"
                        variant={canAfford ? "default" : "secondary"}
                      >
                        {canAfford ? 'Preview Gift' : 'Not Enough Gold'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gift Preview Modal */}
        {selectedGift && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <Card className="bg-gradient-to-br from-pink-900 to-purple-900 border-pink-500/50 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <span className="text-2xl">{selectedGift.icon}</span>
                  {selectedGift.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-200">{selectedGift.description}</p>
                
                <div className="bg-pink-900/30 p-3 rounded">
                  <p className="text-pink-200 italic">"{selectedGift.chaHaeInReaction}"</p>
                  <p className="text-pink-300 text-sm mt-2">- Cha Hae-In's reaction</p>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Cost: {selectedGift.price} Gold</span>
                  <span>Your Gold: {playerGold}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      onPurchaseGift(selectedGift);
                      setSelectedGift(null);
                    }}
                    disabled={playerGold < selectedGift.price}
                    className="flex-1"
                  >
                    Give Gift
                  </Button>
                  <Button
                    onClick={() => setSelectedGift(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export { GIFT_CATALOG };
export type { GiftItem };