import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Sword, Shirt, TrendingUp, User, X } from 'lucide-react';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  type: 'weapon' | 'armor' | 'accessory';
  slot: 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'ring' | 'necklace';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    criticalRate?: number;
    criticalDamage?: number;
  };
  requirements?: {
    level: number;
  };
  value: number;
}

export interface EquippedGear {
  weapon?: Equipment;
  helmet?: Equipment;
  chest?: Equipment;
  legs?: Equipment;
  boots?: Equipment;
  ring?: Equipment;
  necklace?: Equipment;
}

interface EquipmentSystemProps {
  isVisible: boolean;
  onClose: () => void;
  playerLevel: number;
  equippedGear: EquippedGear;
  availableEquipment: Equipment[];
  playerStats: {
    level: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stats: {
      strength: number;
      agility: number;
      intelligence: number;
      vitality: number;
    };
  };
  onEquip: (equipment: Equipment) => void;
  onUnequip: (slot: string) => void;
}

export const STARTING_EQUIPMENT: Equipment[] = [
  {
    id: 'starter_sword',
    name: 'Reinforced Steel Sword',
    description: 'A well-balanced sword made from reinforced steel.',
    type: 'weapon',
    slot: 'weapon',
    rarity: 'common',
    stats: { attack: 120, criticalRate: 5 },
    value: 1000
  },
  {
    id: 'knight_helmet',
    name: 'Knight Captain Helmet',
    description: 'A sturdy helmet worn by elite knight captains.',
    type: 'armor',
    slot: 'helmet',
    rarity: 'rare',
    stats: { defense: 45, health: 100 },
    value: 1000
  },
  {
    id: 'hunter_boots',
    name: 'Hunter Leather Boots',
    description: 'Comfortable boots favored by dungeon hunters.',
    type: 'armor',
    slot: 'boots',
    rarity: 'common',
    stats: { defense: 25, speed: 15 },
    value: 1000
  },
  {
    id: 'mana_ring',
    name: 'Ring of Mana Flow',
    description: 'A mystical ring that enhances mana circulation.',
    type: 'accessory',
    slot: 'ring',
    rarity: 'epic',
    stats: { mana: 200 },
    value: 1000
  },
  {
    id: 'demon_daggers',
    name: 'Demon King\'s Daggers',
    description: 'Twin daggers imbued with demonic power.',
    type: 'weapon',
    slot: 'weapon',
    rarity: 'legendary',
    stats: { attack: 250, criticalRate: 25, criticalDamage: 50 },
    requirements: { level: 15 },
    value: 5000
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Monarch Cloak',
    description: 'A cloak that grants the power of shadows.',
    type: 'armor',
    slot: 'chest',
    rarity: 'mythic',
    stats: { defense: 150, health: 300, mana: 150, speed: 30 },
    requirements: { level: 20 },
    value: 10000
  }
];

const getSlotIcon = (slot: string) => {
  switch (slot) {
    case 'weapon': return <Sword className="w-4 h-4 text-red-400" />;
    case 'helmet': return <Shield className="w-4 h-4 text-blue-400" />;
    case 'chest': return <Shirt className="w-4 h-4 text-green-400" />;
    default: return <Shield className="w-4 h-4 text-gray-400" />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-600';
    case 'rare': return 'bg-blue-600';
    case 'epic': return 'bg-purple-600';
    case 'legendary': return 'bg-orange-600';
    case 'mythic': return 'bg-red-600';
    default: return 'bg-gray-600';
  }
};

export function EquipmentSystem({
  isVisible,
  onClose,
  playerLevel,
  equippedGear,
  availableEquipment,
  playerStats,
  onEquip,
  onUnequip
}: EquipmentSystemProps) {
  const [selectedTab, setSelectedTab] = useState<'equipped' | 'inventory'>('inventory');

  const hasEquippedItems = useMemo(() => {
    return Object.values(equippedGear).some(item => item !== undefined);
  }, [equippedGear]);

  const equipmentBonuses = useMemo(() => {
    const bonuses = { attack: 0, defense: 0, health: 0, mana: 0, speed: 0 };
    Object.values(equippedGear).forEach(item => {
      if (item) {
        bonuses.attack += item.stats.attack || 0;
        bonuses.defense += item.stats.defense || 0;
        bonuses.health += item.stats.health || 0;
        bonuses.mana += item.stats.mana || 0;
        bonuses.speed += item.stats.speed || 0;
      }
    });
    return bonuses;
  }, [equippedGear]);

  const totalCombatStats = useMemo(() => {
    const baseStats = {
      strength: playerStats.stats?.strength || 10,
      agility: playerStats.stats?.agility || 10,
      intelligence: playerStats.stats?.intelligence || 10,
      vitality: playerStats.stats?.vitality || 10
    };

    return {
      totalAttack: (baseStats.strength * 2) + equipmentBonuses.attack,
      totalDefense: (baseStats.vitality * 1.5) + equipmentBonuses.defense,
      totalHealth: playerStats.maxHealth + equipmentBonuses.health,
      totalMana: playerStats.maxMana + equipmentBonuses.mana
    };
  }, [playerStats, equipmentBonuses]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-xl w-full max-w-6xl h-full sm:h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-purple-500/30 shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
            <span className="hidden sm:inline">Equipment System</span>
            <span className="sm:hidden">Equipment</span>
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-purple-500/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Equipment Tabs */}
        <div className="p-4 border-b border-purple-500/30 shrink-0">
          <div className="flex gap-2 sm:gap-4">
            <Button
              onClick={() => setSelectedTab('equipped')}
              variant={selectedTab === 'equipped' ? 'default' : 'outline'}
              className="text-white text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Equipped
            </Button>
            <Button
              onClick={() => setSelectedTab('inventory')}
              variant={selectedTab === 'inventory' ? 'default' : 'outline'}
              className="text-white text-xs sm:text-sm flex-1 sm:flex-none"
            >
              Inventory
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {selectedTab === 'equipped' && (
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Equipped Gear</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {['weapon', 'helmet', 'chest', 'legs', 'boots', 'ring', 'necklace'].map(slot => {
                  const equipped = equippedGear[slot as keyof EquippedGear];
                  return (
                    <Card key={slot} className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          {getSlotIcon(slot)}
                          <span className="text-sm text-white capitalize truncate">{slot}</span>
                        </div>
                        
                        {equipped ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${getRarityColor(equipped.rarity)} text-white text-xs`}>
                                {equipped.rarity}
                              </Badge>
                            </div>
                            <p className="text-sm text-white font-medium truncate">{equipped.name}</p>
                            <div className="text-xs text-slate-300 mt-1 space-y-1">
                              {Object.entries(equipped.stats).slice(0, 2).map(([stat, value]) => (
                                <div key={stat} className="truncate">{stat}: +{value}</div>
                              ))}
                              {Object.entries(equipped.stats).length > 2 && (
                                <div className="text-slate-400">+{Object.entries(equipped.stats).length - 2} more</div>
                              )}
                            </div>
                            <Button 
                              onClick={() => onUnequip(slot)}
                              size="sm" 
                              variant="outline"
                              className="w-full mt-2 text-xs"
                            >
                              Unequip
                            </Button>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-xs text-center py-4">
                            Empty
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Stats Display */}
              {hasEquippedItems && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Total Combat Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Attack Power</span>
                        <span className="text-red-400 font-medium">{totalCombatStats.totalAttack}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Defense</span>
                        <span className="text-blue-400 font-medium">{totalCombatStats.totalDefense}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Max Health</span>
                        <span className="text-green-400 font-medium">{totalCombatStats.totalHealth}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Max Mana</span>
                        <span className="text-purple-400 font-medium">{totalCombatStats.totalMana}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-500/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Equipment Bonuses
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Attack Bonus</span>
                        <span className="text-green-400 font-medium">+{equipmentBonuses.attack}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Defense Bonus</span>
                        <span className="text-green-400 font-medium">+{equipmentBonuses.defense}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Health Bonus</span>
                        <span className="text-green-400 font-medium">+{equipmentBonuses.health}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Mana Bonus</span>
                        <span className="text-green-400 font-medium">+{equipmentBonuses.mana}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Speed Bonus</span>
                        <span className="text-green-400 font-medium">+{equipmentBonuses.speed}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'inventory' && (
            <div className="h-full p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-white mb-4">Available Equipment</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableEquipment.length === 0 && (
                  <div className="col-span-full text-center text-slate-400 py-8">
                    No equipment available in inventory
                  </div>
                )}
                
                {availableEquipment.map(item => {
                  const canEquip = (!item.requirements?.level || playerLevel >= item.requirements.level);
                  const isEquipped = Object.values(equippedGear).some(equipped => equipped?.id === item.id);

                  return (
                    <Card key={item.id} className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getSlotIcon(item.slot)}
                          <Badge className={`${getRarityColor(item.rarity)} text-white text-xs`}>
                            {item.rarity}
                          </Badge>
                        </div>
                        
                        <h4 className="text-white font-medium mb-2">{item.name}</h4>
                        <p className="text-slate-300 text-sm mb-3">{item.description}</p>
                        
                        <div className="space-y-1 mb-3">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-sm">
                              <span className="text-slate-400 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-green-400">+{value}</span>
                            </div>
                          ))}
                        </div>

                        {item.requirements && (
                          <div className="text-xs text-slate-400 mb-2">
                            Requires: Level {item.requirements.level}
                          </div>
                        )}

                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Equip button clicked for:', item.name);
                            onEquip(item);
                          }}
                          disabled={!canEquip || isEquipped}
                          size="sm"
                          className="w-full"
                          variant={isEquipped ? "secondary" : "default"}
                        >
                          {isEquipped ? 'Equipped' : canEquip ? 'Equip' : 'Level Required'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}