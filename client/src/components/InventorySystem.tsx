import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Heart, Zap, Gem, Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  quantity: number;
  description: string;
  effects: {
    damage?: number;
    defense?: number;
    healing?: number;
    mana?: number;
    buff?: string;
    duration?: number;
  };
  usableInCombat: boolean;
  value: number;
}

interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  slot: 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'ring' | 'necklace';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    critRate?: number;
    critDamage?: number;
  };
  description: string;
  requirements?: {
    level?: number;
    strength?: number;
  };
}

interface EquippedGear {
  weapon?: Equipment;
  helmet?: Equipment;
  chest?: Equipment;
  legs?: Equipment;
  boots?: Equipment;
  ring?: Equipment;
  necklace?: Equipment;
}

interface InventorySystemProps {
  isVisible: boolean;
  onClose: () => void;
  items: InventoryItem[];
  onItemUse: (item: InventoryItem) => void;
  inCombat?: boolean;
  playerGold: number;
  equippedGear?: EquippedGear;
  availableEquipment?: Equipment[];
}

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'health_potion',
    name: 'Health Potion',
    type: 'consumable',
    rarity: 'common',
    quantity: 5,
    description: 'Restores 50 HP instantly',
    effects: { healing: 50 },
    usableInCombat: true,
    value: 100
  },
  {
    id: 'mana_potion',
    name: 'Mana Potion',
    type: 'consumable',
    rarity: 'common',
    quantity: 3,
    description: 'Restores 30 MP instantly',
    effects: { mana: 30 },
    usableInCombat: true,
    value: 150
  },
  {
    id: 'shadow_crystal',
    name: 'Shadow Enhancement Crystal',
    type: 'consumable',
    rarity: 'rare',
    quantity: 2,
    description: 'Temporarily boosts shadow soldier damage by 50%',
    effects: { buff: 'shadow_damage', duration: 5 },
    usableInCombat: true,
    value: 500
  },
  {
    id: 'berserker_elixir',
    name: 'Berserker Elixir',
    type: 'consumable',
    rarity: 'epic',
    quantity: 1,
    description: 'Doubles attack power for 3 turns',
    effects: { buff: 'berserker', duration: 3 },
    usableInCombat: true,
    value: 1000
  },
  {
    id: 'demon_blade',
    name: 'Demon Noble Sword',
    type: 'weapon',
    rarity: 'legendary',
    quantity: 1,
    description: 'A legendary blade that grows stronger with each kill',
    effects: { damage: 75, buff: 'vampiric' },
    usableInCombat: false,
    value: 5000
  }
];

export function InventorySystem({ 
  isVisible, 
  onClose, 
  items = INITIAL_INVENTORY, 
  onItemUse, 
  inCombat = false, 
  playerGold,
  equippedGear,
  availableEquipment = []
}: InventorySystemProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'consumables' | 'equipment'>('all');

  if (!isVisible) return null;

  // Convert equipped gear to inventory items for display
  const convertEquipmentToInventoryItem = (equipment: Equipment): InventoryItem => ({
    id: equipment.id,
    name: equipment.name,
    type: equipment.type === 'weapon' ? 'weapon' : 'armor',
    rarity: equipment.rarity,
    quantity: 1,
    description: equipment.description,
    effects: {
      damage: equipment.stats.attack,
      defense: equipment.stats.defense,
      healing: equipment.stats.health,
      mana: equipment.stats.mana
    },
    usableInCombat: false,
    value: equipment.rarity === 'legendary' ? 5000 : equipment.rarity === 'epic' ? 2500 : 1000
  });

  // Get equipped items for display
  const equippedItems: InventoryItem[] = equippedGear ? Object.values(equippedGear)
    .filter(item => item !== undefined)
    .map(item => convertEquipmentToInventoryItem(item!)) : [];

  // Get available equipment as inventory items
  const availableEquipmentItems: InventoryItem[] = availableEquipment
    .map(equipment => convertEquipmentToInventoryItem(equipment));

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      case 'mythic': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'consumable': return <Heart className="w-4 h-4" />;
      case 'material': return <Gem className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  // Combine all items for filtering
  const allItems = selectedTab === 'equipment' 
    ? [...equippedItems, ...availableEquipmentItems, ...items.filter(item => item.type === 'weapon' || item.type === 'armor')]
    : items;

  const filteredItems = allItems.filter(item => {
    if (selectedTab === 'consumables') return item.type === 'consumable';
    if (selectedTab === 'equipment') return item.type === 'weapon' || item.type === 'armor';
    return true;
  });

  const usableItems = inCombat ? filteredItems.filter(item => item.usableInCombat) : filteredItems;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Package className="text-purple-400" />
            Inventory
            {inCombat && <Badge variant="outline" className="text-red-400 border-red-400">Combat Mode</Badge>}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-yellow-400 font-semibold">
              Gold: {playerGold.toLocaleString()}
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={selectedTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('all')}
          >
            All Items
          </Button>
          <Button
            variant={selectedTab === 'consumables' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('consumables')}
          >
            Consumables
          </Button>
          <Button
            variant={selectedTab === 'equipment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTab('equipment')}
          >
            Equipment
          </Button>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {usableItems.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className={`text-lg flex items-center gap-2 ${getRarityColor(item.rarity)}`}>
                  {getTypeIcon(item.type)}
                  {item.name}
                  {item.quantity > 1 && (
                    <Badge variant="outline" className="text-gray-400">
                      x{item.quantity}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                
                {/* Effects */}
                <div className="space-y-1 mb-4">
                  {item.effects.damage && (
                    <div className="text-red-400 text-sm">
                      <Sword className="w-3 h-3 inline mr-1" />
                      Damage: +{item.effects.damage}
                    </div>
                  )}
                  {item.effects.defense && (
                    <div className="text-blue-400 text-sm">
                      <Shield className="w-3 h-3 inline mr-1" />
                      Defense: +{item.effects.defense}
                    </div>
                  )}
                  {item.effects.healing && (
                    <div className="text-green-400 text-sm">
                      <Heart className="w-3 h-3 inline mr-1" />
                      Healing: {item.effects.healing} HP
                    </div>
                  )}
                  {item.effects.mana && (
                    <div className="text-purple-400 text-sm">
                      <Zap className="w-3 h-3 inline mr-1" />
                      Mana: {item.effects.mana} MP
                    </div>
                  )}
                  {item.effects.buff && (
                    <div className="text-yellow-400 text-sm">
                      <Gem className="w-3 h-3 inline mr-1" />
                      Effect: {item.effects.buff} ({item.effects.duration} turns)
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {item.usableInCombat || !inCombat ? (
                  <Button
                    onClick={() => onItemUse(item)}
                    className="w-full"
                    variant={item.type === 'consumable' ? 'default' : 'outline'}
                    disabled={item.quantity === 0}
                  >
                    {item.type === 'consumable' ? 'Use' : 'Equip'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full">
                    Not usable in combat
                  </Button>
                )}
                
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Value: {item.value} gold
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {usableItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {inCombat ? 'No combat-usable items available' : 'No items in inventory'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}