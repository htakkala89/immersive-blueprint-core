import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Sword, 
  Shield, 
  Heart, 
  Gift, 
  Pill,
  Crown,
  Gem,
  Coffee,
  Flower
} from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'weapons' | 'armor' | 'gifts' | 'consumables' | 'special';
  type: 'equipment' | 'gift' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  
  // Equipment stats
  stats?: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    critRate?: number;
    critDamage?: number;
  };
  
  // Gift effects
  affectionGain?: number;
  intimacyGain?: number;
  chaHaeInReaction?: string;
  
  // Consumable effects
  healingPower?: number;
  manaRestore?: number;
  buffDuration?: number;
  
  requirements?: {
    level?: number;
    affectionLevel?: number;
    intimacyLevel?: number;
  };
}

interface UnifiedShopProps {
  isVisible: boolean;
  onClose: () => void;
  playerGold: number;
  playerLevel: number;
  currentAffection: number;
  currentIntimacy: number;
  onPurchase: (item: ShopItem) => void;
}

const SHOP_INVENTORY: ShopItem[] = [
  // Weapons
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A reliable weapon for new hunters. Solid and dependable.',
    price: 500,
    category: 'weapons',
    type: 'equipment',
    rarity: 'common',
    icon: '⚔️',
    stats: { attack: 50, speed: 5 },
    requirements: { level: 1 }
  },
  {
    id: 'hunters_dagger',
    name: "Hunter's Dagger",
    description: 'Swift and precise. Cha Hae-In appreciates the elegant craftsmanship.',
    price: 800,
    category: 'weapons',
    type: 'equipment',
    rarity: 'rare',
    icon: '🗡️',
    stats: { attack: 65, speed: 15, critRate: 20 },
    affectionGain: 1,
    chaHaeInReaction: "This dagger has perfect balance. You have good taste in weapons.",
    requirements: { level: 3 }
  },
  {
    id: 'wind_blade',
    name: 'Wind Blade',
    description: 'A sword that cuts through air itself. Cha Hae-In marvels at its speed.',
    price: 1800,
    category: 'weapons',
    type: 'equipment',
    rarity: 'rare',
    icon: '💨',
    stats: { attack: 95, speed: 20, critRate: 15 },
    affectionGain: 2,
    chaHaeInReaction: "The way this blade moves... it reminds me of my own swordsmanship. We make a good team.",
    requirements: { level: 7 }
  },
  {
    id: 'flame_rapier',
    name: 'Flame Rapier',
    description: 'A elegant weapon wreathed in fire. Perfect for a skilled swordswoman.',
    price: 2800,
    category: 'weapons',
    type: 'equipment',
    rarity: 'epic',
    icon: '🔥',
    stats: { attack: 110, speed: 18, critRate: 25, critDamage: 15 },
    affectionGain: 2,
    intimacyGain: 1,
    chaHaeInReaction: "A rapier... this reminds me of my training days. Would you like to spar sometime?",
    requirements: { level: 9, affectionLevel: 1 }
  },
  {
    id: 'moonlight_sword',
    name: 'Moonlight Sword',
    description: 'Blessed by moonlight, this blade glows with ethereal beauty. Cha Hae-In finds it enchanting.',
    price: 4500,
    category: 'weapons',
    type: 'equipment',
    rarity: 'epic',
    icon: '🌙',
    stats: { attack: 140, speed: 16, critRate: 20, critDamage: 25, mana: 50 },
    affectionGain: 3,
    intimacyGain: 1,
    chaHaeInReaction: "It's beautiful... like moonlight dancing on water. Thank you for thinking of me.",
    requirements: { level: 12, affectionLevel: 2 }
  },
  {
    id: 'dragon_fang',
    name: 'Dragon Fang',
    description: 'Forged from an ancient dragon tooth. Its power impresses even S-rank hunters.',
    price: 7500,
    category: 'weapons',
    type: 'equipment',
    rarity: 'legendary',
    icon: '🐉',
    stats: { attack: 185, speed: 22, critRate: 30, critDamage: 35 },
    affectionGain: 3,
    intimacyGain: 2,
    chaHaeInReaction: "Dragon bone weapons are incredibly rare. Your strength continues to amaze me, Jin-Woo.",
    requirements: { level: 16, affectionLevel: 3 }
  },
  {
    id: 'celestial_blade',
    name: 'Celestial Blade',
    description: 'A weapon blessed by the heavens. Cha Hae-In sees you as her equal.',
    price: 12000,
    category: 'weapons',
    type: 'equipment',
    rarity: 'legendary',
    icon: '⭐',
    stats: { attack: 220, speed: 25, critRate: 28, critDamage: 45, mana: 80 },
    affectionGain: 4,
    intimacyGain: 2,
    chaHaeInReaction: "With weapons like this... we could protect everyone together. I trust you completely.",
    requirements: { level: 18, affectionLevel: 4 }
  },
  {
    id: 'steel_blade',
    name: 'Steel Blade',
    description: 'Enhanced steel construction provides superior cutting power.',
    price: 1200,
    category: 'weapons',
    type: 'equipment',
    rarity: 'rare',
    icon: '🗡️',
    stats: { attack: 80, critRate: 10, speed: 8 },
    requirements: { level: 5 }
  },
  {
    id: 'mithril_sword',
    name: 'Mithril Sword',
    description: 'Forged from rare mithril, this blade glows with inner light.',
    price: 3000,
    category: 'weapons',
    type: 'equipment',
    rarity: 'epic',
    icon: '⚡',
    stats: { attack: 120, critRate: 15, critDamage: 20, speed: 12 },
    requirements: { level: 10 }
  },
  {
    id: 'demon_slayer',
    name: 'Demon Slayer',
    description: 'A legendary blade that has slain countless demons. Cha Hae-In admires its craftsmanship.',
    price: 8000,
    category: 'weapons',
    type: 'equipment',
    rarity: 'legendary',
    icon: '🔥',
    stats: { attack: 200, critRate: 25, critDamage: 40, speed: 18 },
    affectionGain: 3,
    intimacyGain: 1,
    chaHaeInReaction: "This blade... it's magnificent. I can feel its power resonating with my own abilities.",
    requirements: { level: 15, affectionLevel: 2 }
  },
  {
    id: 'shadow_monarch_blade',
    name: 'Shadow Monarch Blade',
    description: 'The ultimate weapon infused with shadow magic. Cha Hae-In is impressed by your strength.',
    price: 15000,
    category: 'weapons',
    type: 'equipment',
    rarity: 'mythic',
    icon: '🌑',
    stats: { attack: 300, critRate: 35, critDamage: 60, speed: 25, mana: 100 },
    affectionGain: 5,
    intimacyGain: 2,
    chaHaeInReaction: "Jin-Woo... with power like this, we could take on any dungeon together. I feel safe knowing you wield such strength.",
    requirements: { level: 20, affectionLevel: 4 }
  },

  // Armor
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Basic protection for dungeon exploration.',
    price: 400,
    category: 'armor',
    type: 'equipment',
    rarity: 'common',
    icon: '🛡️',
    stats: { defense: 30, health: 50 },
    requirements: { level: 1 }
  },
  {
    id: 'knights_plate',
    name: "Knight's Plate",
    description: 'Heavy armor that provides excellent protection.',
    price: 2500,
    category: 'armor',
    type: 'equipment',
    rarity: 'epic',
    icon: '⚔️',
    stats: { defense: 100, health: 150, speed: -5 },
    requirements: { level: 8 }
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'Mystical armor that bends light and shadow. Cha Hae-In finds it fascinating.',
    price: 6000,
    category: 'armor',
    type: 'equipment',
    rarity: 'legendary',
    icon: '🌙',
    stats: { defense: 80, health: 200, mana: 150, speed: 10 },
    affectionGain: 2,
    intimacyGain: 1,
    chaHaeInReaction: "That cloak suits you perfectly. The way it moves with the shadows... it's almost hypnotic.",
    requirements: { level: 12, affectionLevel: 2 }
  },

  // Gifts for Cha Hae-In
  {
    id: 'red_roses',
    name: 'Red Roses',
    description: 'Classic red roses that express deep feelings.',
    price: 150,
    category: 'gifts',
    type: 'gift',
    rarity: 'common',
    icon: '🌹',
    affectionGain: 15,
    intimacyGain: 5,
    chaHaeInReaction: "These are beautiful... red roses always make me think of passionate feelings."
  },
  {
    id: 'diamond_necklace',
    name: 'Diamond Necklace',
    description: 'An exquisite diamond necklace that sparkles like stars.',
    price: 2000,
    category: 'gifts',
    type: 'gift',
    rarity: 'epic',
    icon: '💎',
    affectionGain: 25,
    intimacyGain: 15,
    chaHaeInReaction: "Jin-Woo... this is too much. But it's absolutely gorgeous. Thank you.",
    requirements: { affectionLevel: 2 }
  },
  {
    id: 'promise_ring',
    name: 'Promise Ring',
    description: 'A symbol of eternal commitment and love.',
    price: 5000,
    category: 'gifts',
    type: 'gift',
    rarity: 'legendary',
    icon: '💍',
    affectionGain: 50,
    intimacyGain: 30,
    chaHaeInReaction: "Is this... are you asking me to...? *blushes deeply* Yes, Jin-Woo. Always yes.",
    requirements: { affectionLevel: 4, intimacyLevel: 3 }
  },
  {
    id: 'coffee_beans',
    name: 'Premium Coffee Beans',
    description: 'High-quality coffee beans for the perfect morning brew.',
    price: 80,
    category: 'gifts',
    type: 'gift',
    rarity: 'common',
    icon: '☕',
    affectionGain: 8,
    intimacyGain: 2,
    chaHaeInReaction: "You remembered I love coffee. Want to share a cup together?"
  },

  // Consumables
  {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores health during battles.',
    price: 100,
    category: 'consumables',
    type: 'consumable',
    rarity: 'common',
    icon: '🧪',
    healingPower: 200
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores magical energy.',
    price: 120,
    category: 'consumables',
    type: 'consumable',
    rarity: 'common',
    icon: '💙',
    manaRestore: 150
  },
  {
    id: 'strength_elixir',
    name: 'Strength Elixir',
    description: 'Temporarily increases attack power.',
    price: 300,
    category: 'consumables',
    type: 'consumable',
    rarity: 'rare',
    icon: '💪',
    stats: { attack: 50 },
    buffDuration: 300 // 5 minutes
  }
];

export function UnifiedShop({ 
  isVisible, 
  onClose, 
  playerGold, 
  playerLevel,
  currentAffection,
  currentIntimacy,
  onPurchase 
}: UnifiedShopProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  if (!isVisible) return null;

  const categories = ['all', 'weapons', 'armor', 'gifts', 'consumables'];

  const filteredItems = selectedCategory === 'all' 
    ? SHOP_INVENTORY 
    : SHOP_INVENTORY.filter(item => item.category === selectedCategory);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-orange-500';
      case 'mythic': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weapons': return <Sword className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'gifts': return <Heart className="w-4 h-4" />;
      case 'consumables': return <Pill className="w-4 h-4" />;
      default: return <ShoppingBag className="w-4 h-4" />;
    }
  };

  const canPurchase = (item: ShopItem) => {
    if (playerGold < item.price) return false;
    if (item.requirements?.level && playerLevel < item.requirements.level) return false;
    if (item.requirements?.affectionLevel && currentAffection < item.requirements.affectionLevel) return false;
    if (item.requirements?.intimacyLevel && currentIntimacy < item.requirements.intimacyLevel) return false;
    return true;
  };

  const getRequirementText = (item: ShopItem) => {
    const reqs = [];
    if (item.requirements?.level) reqs.push(`Level ${item.requirements.level}`);
    if (item.requirements?.affectionLevel) reqs.push(`Affection ${item.requirements.affectionLevel}`);
    if (item.requirements?.intimacyLevel) reqs.push(`Intimacy ${item.requirements.intimacyLevel}`);
    return reqs.join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-xl w-full max-w-6xl h-full sm:h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-purple-500/30 shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
            <span className="hidden sm:inline">Hunter's Marketplace</span>
            <span className="sm:hidden">Shop</span>
          </h2>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-white text-sm sm:text-base">
              <span className="text-yellow-400">💰</span>
              {playerGold}
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-purple-500/20">
              ×
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Category Filter */}
          <div className="w-full lg:w-1/4 p-3 sm:p-6 lg:border-r border-purple-500/30 overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Categories</h3>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-2 lg:grid-cols-none">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start text-white text-xs sm:text-sm lg:text-base"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-1 sm:ml-2 capitalize">{category}</span>
                </Button>
              ))}
            </div>


          </div>

          {/* Item Catalog */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredItems.map(item => {
                const canBuy = canPurchase(item);

                return (
                  <Card key={item.id} data-item-id={item.id} className="bg-slate-800/50 border-slate-600 hover:border-purple-500/50 transition-colors">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl sm:text-2xl">{item.icon}</span>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity}
                        </Badge>
                      </div>
                      
                      <h4 className="text-white font-medium mb-2 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-slate-300 text-xs mb-3 line-clamp-2">{item.description}</p>
                      
                      {/* Stats Display */}
                      {item.stats && (
                        <div className="space-y-1 mb-3">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-xs">
                              <span className="text-slate-400 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-green-400">+{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Gift Effects */}
                      {(item.affectionGain || item.intimacyGain) && (
                        <div className="space-y-1 mb-3">
                          {item.affectionGain && (
                            <div className="flex justify-between text-xs">
                              <span className="text-pink-300">Affection</span>
                              <span className="text-pink-400">+{item.affectionGain}</span>
                            </div>
                          )}
                          {item.intimacyGain && (
                            <div className="flex justify-between text-xs">
                              <span className="text-purple-300">Intimacy</span>
                              <span className="text-purple-400">+{item.intimacyGain}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requirements */}
                      {item.requirements && (
                        <div className="text-xs text-slate-400 mb-2">
                          Requires: {getRequirementText(item)}
                        </div>
                      )}

                      <div className="flex justify-between items-center mb-3">
                        <span className="text-yellow-400 font-medium text-xs sm:text-sm">{item.price} Gold</span>
                      </div>

                      <Button
                        onClick={() => onPurchase(item)}
                        disabled={!canBuy}
                        size="sm"
                        className="w-full text-xs sm:text-sm"
                        variant={canBuy ? "default" : "secondary"}
                      >
                        {!canBuy && playerGold < item.price ? 'Need Gold' : 
                         !canBuy ? 'Requirements' : 'Purchase'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SHOP_INVENTORY };
export type { ShopItem };