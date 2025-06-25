import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface Gift {
  id: string;
  name: string;
  description: string;
  price: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  affectionBonus: number;
  icon: string;
  category: 'flowers' | 'jewelry' | 'food' | 'books' | 'equipment';
}

interface PlayerData {
  gold: number;
  affectionLevel: number;
}

const MARKETPLACE_GIFTS: Gift[] = [
  // Common Gifts
  {
    id: 'white_roses',
    name: 'White Roses',
    description: 'Beautiful white roses that remind her of her pure sword technique.',
    price: 50,
    rarity: 'common',
    affectionBonus: 1,
    icon: '🌹',
    category: 'flowers'
  },
  {
    id: 'coffee_beans',
    name: 'Premium Coffee Beans',
    description: 'High-quality coffee beans from a famous hunter café.',
    price: 75,
    rarity: 'common',
    affectionBonus: 1,
    icon: '☕',
    category: 'food'
  },
  {
    id: 'sword_care_kit',
    name: 'Sword Maintenance Kit',
    description: 'Professional equipment for keeping blades in perfect condition.',
    price: 100,
    rarity: 'common',
    affectionBonus: 2,
    icon: '🗡️',
    category: 'equipment'
  },
  
  // Rare Gifts
  {
    id: 'mana_crystal_necklace',
    name: 'Mana Crystal Necklace',
    description: 'A delicate necklace with a pure mana crystal that enhances magical abilities.',
    price: 200,
    rarity: 'rare',
    affectionBonus: 3,
    icon: '💎',
    category: 'jewelry'
  },
  {
    id: 'ancient_cookbook',
    name: 'Ancient Hunter\'s Cookbook',
    description: 'Rare recipes used by legendary hunters to maintain their strength.',
    price: 150,
    rarity: 'rare',
    affectionBonus: 2,
    icon: '📚',
    category: 'books'
  },
  {
    id: 'cherry_blossoms',
    name: 'Magical Cherry Blossoms',
    description: 'Enchanted sakura petals that never wilt, symbolizing eternal beauty.',
    price: 180,
    rarity: 'rare',
    affectionBonus: 3,
    icon: '🌸',
    category: 'flowers'
  },
  
  // Epic Gifts
  {
    id: 'moonstone_earrings',
    name: 'Moonstone Earrings',
    description: 'Elegant earrings that glow with soft moonlight, enhancing her grace.',
    price: 400,
    rarity: 'epic',
    affectionBonus: 5,
    icon: '👂',
    category: 'jewelry'
  },
  {
    id: 'legendary_sword_manual',
    name: 'Legendary Sword Manual',
    description: 'Contains advanced techniques from the greatest swordmasters in history.',
    price: 350,
    rarity: 'epic',
    affectionBonus: 4,
    icon: '📖',
    category: 'books'
  },
  
  // Legendary Gifts
  {
    id: 'eternal_flame_ring',
    name: 'Eternal Flame Ring',
    description: 'A ring containing an eternal flame that represents undying love.',
    price: 800,
    rarity: 'legendary',
    affectionBonus: 8,
    icon: '💍',
    category: 'jewelry'
  },
  {
    id: 'phoenix_feather_bouquet',
    name: 'Phoenix Feather Bouquet',
    description: 'Incredibly rare phoenix feathers arranged in a stunning bouquet.',
    price: 1000,
    rarity: 'legendary',
    affectionBonus: 10,
    icon: '🔥',
    category: 'flowers'
  }
];

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [playerData, setPlayerData] = useState<PlayerData>({
    gold: 500,
    affectionLevel: 3
  });
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [showGiftScene, setShowGiftScene] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Load player data from localStorage if available
    const savedGold = localStorage.getItem('playerGold');
    const savedAffection = localStorage.getItem('playerAffection');
    
    if (savedGold || savedAffection) {
      setPlayerData({
        gold: savedGold ? parseInt(savedGold) : 500,
        affectionLevel: savedAffection ? parseInt(savedAffection) : 3
      });
    }
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300 border-gray-500';
      case 'rare': return 'text-blue-300 border-blue-500';
      case 'epic': return 'text-purple-300 border-purple-500';
      case 'legendary': return 'text-yellow-300 border-yellow-500';
      default: return 'text-gray-300 border-gray-500';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20';
      case 'rare': return 'bg-blue-500/20';
      case 'epic': return 'bg-purple-500/20';
      case 'legendary': return 'bg-yellow-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const filteredGifts = selectedCategory === 'all' 
    ? MARKETPLACE_GIFTS 
    : MARKETPLACE_GIFTS.filter(gift => gift.category === selectedCategory);

  const categories = ['all', 'flowers', 'jewelry', 'food', 'books', 'equipment'];

  const handlePurchase = (gift: Gift) => {
    if (playerData.gold < gift.price) return;

    // Deduct gold and increase affection
    const newPlayerData = {
      gold: playerData.gold - gift.price,
      affectionLevel: Math.min(10, playerData.affectionLevel + gift.affectionBonus)
    };

    setPlayerData(newPlayerData);
    setSelectedGift(gift);
    setShowGiftScene(true);

    // Save to localStorage
    localStorage.setItem('playerGold', newPlayerData.gold.toString());
    localStorage.setItem('playerAffection', newPlayerData.affectionLevel.toString());
    localStorage.setItem('lastGift', JSON.stringify(gift));
  };

  const getGiftGivingDialogue = (gift: Gift) => {
    const responses = {
      common: [
        "This is lovely, Jin-Woo. Thank you for thinking of me.",
        "How thoughtful! I really appreciate this."
      ],
      rare: [
        "Jin-Woo... this must have been expensive. You didn't have to do this for me.",
        "This is beautiful! You have excellent taste."
      ],
      epic: [
        "I... I don't know what to say. This is incredible!",
        "Jin-Woo, this is too much! But I love it."
      ],
      legendary: [
        "Jin-Woo... are you serious? This is... this is amazing!",
        "I can't believe you got this for me. This means everything to me."
      ]
    };

    return responses[gift.rarity][Math.floor(Math.random() * responses[gift.rarity].length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">Hunter Marketplace</h1>
            <button
              onClick={() => setLocation('/daily-life-hub')}
              className="px-4 py-2 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg transition-colors"
            >
              ← Back to Hub
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Find the perfect gift for Cha Hae-In</p>
            <div className="flex items-center gap-4">
              <div className="text-yellow-400 font-semibold">💰 {playerData.gold} Gold</div>
              <div className="text-pink-400 font-semibold">💕 {playerData.affectionLevel}/10 Affection</div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGifts.map(gift => {
            const canAfford = playerData.gold >= gift.price;
            
            return (
              <div
                key={gift.id}
                className={`p-4 rounded-xl backdrop-blur-md border-2 transition-all duration-300 ${
                  canAfford
                    ? `bg-white/10 ${getRarityColor(gift.rarity)} hover:bg-white/15 cursor-pointer transform hover:scale-105`
                    : 'bg-gray-800/50 border-gray-600/30 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canAfford && handlePurchase(gift)}
              >
                <div className={`p-2 rounded-lg ${getRarityBg(gift.rarity)} mb-3`}>
                  <div className="text-3xl text-center">{gift.icon}</div>
                </div>
                
                <h3 className={`font-semibold mb-2 ${getRarityColor(gift.rarity).split(' ')[0]}`}>
                  {gift.name}
                </h3>
                
                <p className="text-gray-300 text-sm mb-3">{gift.description}</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-yellow-400 font-semibold">💰 {gift.price}</div>
                  <div className="text-pink-400 text-sm">+{gift.affectionBonus} 💕</div>
                </div>
                
                <div className={`text-xs mt-2 px-2 py-1 rounded ${getRarityBg(gift.rarity)} ${getRarityColor(gift.rarity).split(' ')[0]} text-center`}>
                  {gift.rarity.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gift Giving Scene Modal */}
      {showGiftScene && selectedGift && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 max-w-lg mx-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{selectedGift.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">Gift Given!</h3>
              <p className="text-gray-300">You gave Cha Hae-In: {selectedGift.name}</p>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div className="flex-1">
                  <div className="text-purple-300 font-semibold mb-1">Cha Hae-In</div>
                  <p className="text-white">{getGiftGivingDialogue(selectedGift)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-center">
              <div className="text-pink-300">💕 Affection increased by {selectedGift.affectionBonus}!</div>
              <div className="text-pink-400 font-semibold">Current Affection: {playerData.affectionLevel}/10</div>
              <div className="text-yellow-300">💰 Remaining Gold: {playerData.gold}</div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowGiftScene(false);
                  setSelectedGift(null);
                }}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => {
                  setShowGiftScene(false);
                  setSelectedGift(null);
                  setLocation('/daily-life-hub');
                }}
                className="flex-1 px-4 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors"
              >
                Return to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}