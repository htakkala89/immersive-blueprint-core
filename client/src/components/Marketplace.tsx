import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'consumable' | 'weapon' | 'gift' | 'equipment';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  effects?: {
    health?: number;
    mana?: number;
    energy?: number;
    affection?: number;
    attack?: number;
    defense?: number;
    duration?: number;
  };
  stock: number;
  unlockLevel?: number;
}

interface MarketplaceProps {
  isVisible: boolean;
  onClose: () => void;
  onPurchase: (item: MarketplaceItem, quantity: number) => void;
  playerGold: number;
  playerLevel: number;
  affectionLevel: number;
}

export function Marketplace({ isVisible, onClose, onPurchase, playerGold, playerLevel, affectionLevel }: MarketplaceProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [quantity, setQuantity] = useState(1);

  const marketplaceItems: MarketplaceItem[] = [
    // Consumables for raids
    {
      id: 'health_potion',
      name: 'Health Potion',
      description: 'Restores 200 HP instantly during battle',
      price: 50,
      category: 'consumable',
      rarity: 'common',
      icon: '🧪',
      effects: { health: 200 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'mana_potion',
      name: 'Mana Potion',
      description: 'Restores 100 MP instantly during battle',
      price: 60,
      category: 'consumable',
      rarity: 'common',
      icon: '🔵',
      effects: { mana: 100 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'hunter_healing_elixir',
      name: 'Hunter Healing Elixir',
      description: 'Restores both Jin-Woo and Cha Hae-In health during raids',
      price: 120,
      category: 'consumable',
      rarity: 'rare',
      icon: '🍶',
      effects: { health: 300 },
      stock: 50,
      unlockLevel: 10
    },
    {
      id: 'dual_mana_potion',
      name: 'Dual Mana Potion',
      description: 'Restores mana for both Jin-Woo and Cha Hae-In during combat',
      price: 150,
      category: 'consumable',
      rarity: 'rare',
      icon: '🔷',
      effects: { mana: 200 },
      stock: 50,
      unlockLevel: 12
    },
    {
      id: 'combat_energy_boost',
      name: 'Combat Energy Boost',
      description: 'Instantly restores energy during battle for special attacks',
      price: 80,
      category: 'consumable',
      rarity: 'uncommon',
      icon: '⚡',
      effects: { energy: 100 },
      stock: 75,
      unlockLevel: 8
    },
    {
      id: 'shadow_enhancement_potion',
      name: 'Shadow Enhancement Potion',
      description: 'Temporarily boosts shadow soldier effectiveness in raids',
      price: 200,
      category: 'consumable',
      rarity: 'epic',
      icon: '🌑',
      effects: { attack: 50, duration: 600 },
      stock: 20,
      unlockLevel: 15
    },
    {
      id: 'energy_drink',
      name: 'Energy Drink',
      description: 'Restores 50 energy points',
      price: 30,
      category: 'consumable',
      rarity: 'common',
      icon: '⚡',
      effects: { energy: 50 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'korean_ginseng_tea',
      name: 'Korean Ginseng Tea',
      description: 'Rejuvenating tea that restores energy after intimate activities',
      price: 40,
      category: 'consumable',
      rarity: 'common',
      icon: '🍵',
      effects: { energy: 80 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'royal_honey',
      name: 'Royal Honey',
      description: 'Premium honey that boosts stamina and energy',
      price: 75,
      category: 'consumable',
      rarity: 'rare',
      icon: '🍯',
      effects: { energy: 120, duration: 180 },
      stock: 30,
      unlockLevel: 5
    },
    {
      id: 'protein_smoothie',
      name: 'Hunter Protein Smoothie',
      description: 'Nutritious drink that restores energy for both hunters',
      price: 50,
      category: 'consumable',
      rarity: 'common',
      icon: '🥤',
      effects: { energy: 90 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'energy_bars',
      name: 'High-Energy Bars',
      description: 'Quick snacks for post-activity energy recovery',
      price: 25,
      category: 'consumable',
      rarity: 'common',
      icon: '🍫',
      effects: { energy: 60 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'mana_crystal',
      name: 'Mana Crystal',
      description: 'Restores both mana and energy simultaneously',
      price: 100,
      category: 'consumable',
      rarity: 'rare',
      icon: '💎',
      effects: { mana: 100, energy: 50, duration: 300 },
      stock: 50,
      unlockLevel: 10
    },
    {
      id: 'shadow_essence',
      name: 'Shadow Essence',
      description: 'Enhances shadow soldier summoning power',
      price: 200,
      category: 'consumable',
      rarity: 'epic',
      icon: '🌑',
      effects: { attack: 50, duration: 600 },
      stock: 20,
      unlockLevel: 25
    },
    
    // Weapons and Equipment
    {
      id: 'iron_dagger',
      name: 'Iron Dagger',
      description: 'Basic weapon for early hunters',
      price: 150,
      category: 'weapon',
      rarity: 'common',
      icon: '🗡️',
      effects: { attack: 25 },
      stock: 10,
      unlockLevel: 1
    },
    {
      id: 'demon_blade',
      name: 'Demon King\'s Blade',
      description: 'Legendary weapon with immense power',
      price: 5000,
      category: 'weapon',
      rarity: 'legendary',
      icon: '⚔️',
      effects: { attack: 200, defense: 50 },
      stock: 1,
      unlockLevel: 50
    },
    {
      id: 'armor_vest',
      name: 'Hunter\'s Vest',
      description: 'Protective gear for dangerous raids',
      price: 300,
      category: 'equipment',
      rarity: 'rare',
      icon: '🛡️',
      effects: { defense: 40, health: 100 },
      stock: 15,
      unlockLevel: 15
    },
    
    // Gifts for Cha Hae-In
    {
      id: 'flower_bouquet',
      name: 'Elegant Bouquet',
      description: 'Beautiful flowers that Cha Hae-In loves',
      price: 80,
      category: 'gift',
      rarity: 'common',
      icon: '💐',
      effects: { affection: 5 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'jewelry_box',
      name: 'Jewelry Box',
      description: 'Exquisite jewelry that sparkles like her eyes',
      price: 500,
      category: 'gift',
      rarity: 'rare',
      icon: '💍',
      effects: { affection: 15 },
      stock: 20,
      unlockLevel: 20
    },
    {
      id: 'sword_accessory',
      name: 'Sword Charm',
      description: 'A charm for her beloved sword',
      price: 300,
      category: 'gift',
      rarity: 'rare',
      icon: '🎗️',
      effects: { affection: 10 },
      stock: 25,
      unlockLevel: 15
    },
    {
      id: 'love_letter',
      name: 'Handwritten Letter',
      description: 'Your heartfelt feelings written in elegant script',
      price: 200,
      category: 'gift',
      rarity: 'epic',
      icon: '💌',
      effects: { affection: 20 },
      stock: 10,
      unlockLevel: 30
    },
    {
      id: 'couple_ring',
      name: 'Promise Ring',
      description: 'A symbol of your eternal bond',
      price: 2000,
      category: 'gift',
      rarity: 'legendary',
      icon: '💎',
      effects: { affection: 50 },
      stock: 1,
      unlockLevel: 60
    },
    
    // Special food items
    {
      id: 'coffee',
      name: 'Premium Coffee',
      description: 'Cha Hae-In\'s favorite morning beverage',
      price: 25,
      category: 'consumable',
      rarity: 'common',
      icon: '☕',
      effects: { energy: 20, affection: 2 },
      stock: 99,
      unlockLevel: 1
    },
    {
      id: 'cake',
      name: 'Strawberry Cake',
      description: 'Sweet dessert perfect for special moments',
      price: 120,
      category: 'consumable',
      rarity: 'rare',
      icon: '🎂',
      effects: { energy: 30, affection: 8 },
      stock: 30,
      unlockLevel: 10
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items', icon: '🏪' },
    { id: 'consumable', name: 'Consumables', icon: '🧪' },
    { id: 'weapon', name: 'Weapons', icon: '⚔️' },
    { id: 'equipment', name: 'Equipment', icon: '🛡️' },
    { id: 'gift', name: 'Gifts', icon: '🎁' }
  ];

  const filteredItems = marketplaceItems.filter(item => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (item.unlockLevel && item.unlockLevel > playerLevel) return false;
    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-600';
      case 'rare': return 'bg-blue-600';
      case 'epic': return 'bg-purple-600';
      case 'legendary': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  const handlePurchase = () => {
    if (selectedItem && playerGold >= selectedItem.price * quantity) {
      onPurchase(selectedItem, quantity);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const canAfford = (item: MarketplaceItem) => {
    return playerGold >= item.price * quantity;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-full bg-gradient-to-b from-gray-900 to-black p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-purple-400">Hunter's Marketplace</h2>
            <div className="text-lg text-yellow-400 mt-2">💰 Gold: {playerGold.toLocaleString()}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Categories */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-purple-400 mb-4">Categories</h3>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-purple-400">
              {categories.find(c => c.id === selectedCategory)?.name || 'All Items'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-700 border-2 ${
                    selectedItem?.id === item.id ? 'border-purple-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-white">{item.name}</div>
                        <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                          {item.rarity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{item.price}💰</div>
                      <div className="text-xs text-gray-400">Stock: {item.stock}</div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300 mb-2">
                    {item.description}
                  </div>
                  
                  {item.effects && (
                    <div className="flex flex-wrap gap-1">
                      {item.effects.health && (
                        <Badge className="bg-red-600 text-white text-xs">+{item.effects.health} HP</Badge>
                      )}
                      {item.effects.energy && (
                        <Badge className="bg-blue-600 text-white text-xs">+{item.effects.energy} Energy</Badge>
                      )}
                      {item.effects.affection && (
                        <Badge className="bg-pink-600 text-white text-xs">+{item.effects.affection} Love</Badge>
                      )}
                      {item.effects.attack && (
                        <Badge className="bg-orange-600 text-white text-xs">+{item.effects.attack} ATK</Badge>
                      )}
                      {item.effects.defense && (
                        <Badge className="bg-green-600 text-white text-xs">+{item.effects.defense} DEF</Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="space-y-4">
            {selectedItem ? (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-4">Purchase Item</h3>
                
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-4xl">{selectedItem.icon}</span>
                    <div className="font-bold text-white mt-2">{selectedItem.name}</div>
                    <Badge className={`${getRarityColor(selectedItem.rarity)} text-white mt-1`}>
                      {selectedItem.rarity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    {selectedItem.description}
                  </div>
                  
                  {selectedItem.effects && (
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-purple-400">Effects:</div>
                      {selectedItem.effects.health && (
                        <div className="text-sm text-red-400">❤️ Health: +{selectedItem.effects.health}</div>
                      )}
                      {selectedItem.effects.energy && (
                        <div className="text-sm text-blue-400">⚡ Energy: +{selectedItem.effects.energy}</div>
                      )}
                      {selectedItem.effects.affection && (
                        <div className="text-sm text-pink-400">💕 Affection: +{selectedItem.effects.affection}</div>
                      )}
                      {selectedItem.effects.attack && (
                        <div className="text-sm text-orange-400">⚔️ Attack: +{selectedItem.effects.attack}</div>
                      )}
                      {selectedItem.effects.defense && (
                        <div className="text-sm text-green-400">🛡️ Defense: +{selectedItem.effects.defense}</div>
                      )}
                      {selectedItem.effects.duration && (
                        <div className="text-sm text-gray-400">⏱️ Duration: {selectedItem.effects.duration}s</div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Quantity:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="bg-gray-700 text-white px-2 py-1 rounded"
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <span className="text-white font-bold px-3">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(selectedItem.stock, quantity + 1))}
                          className="bg-gray-700 text-white px-2 py-1 rounded"
                          disabled={quantity >= selectedItem.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">Total Cost:</span>
                      <span className="text-yellow-400 font-bold">
                        {(selectedItem.price * quantity).toLocaleString()}💰
                      </span>
                    </div>
                    
                    <Button
                      onClick={handlePurchase}
                      disabled={!canAfford(selectedItem) || selectedItem.stock < quantity}
                      className={`w-full ${
                        canAfford(selectedItem) && selectedItem.stock >= quantity
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      } text-white`}
                    >
                      {canAfford(selectedItem) 
                        ? selectedItem.stock >= quantity 
                          ? 'Purchase'
                          : 'Out of Stock'
                        : 'Insufficient Gold'
                      }
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                Select an item to view details and purchase
              </div>
            )}

            {/* Special Offers */}
            <div className="bg-gradient-to-r from-purple-900 to-pink-900 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-2">💝 Special Offers</h3>
              <div className="text-sm text-gray-200 space-y-1">
                <div>🎁 Buy 3 gifts, get 10% off!</div>
                <div>⚔️ Weapon upgrade available at Lv.25</div>
                {affectionLevel >= 80 && (
                  <div className="text-pink-400">💍 Engagement ring now available!</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}