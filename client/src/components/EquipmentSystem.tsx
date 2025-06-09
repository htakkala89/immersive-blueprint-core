import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Crown, Shirt, Gem, TrendingUp } from 'lucide-react';

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
  setBonus?: string;
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

interface EquipmentSystemProps {
  isVisible: boolean;
  onClose: () => void;
  playerLevel: number;
  equippedGear: EquippedGear;
  availableEquipment: Equipment[];
  onEquip: (equipment: Equipment) => void;
  onUnequip: (slot: string) => void;
}

const STARTING_EQUIPMENT: Equipment[] = [
  {
    id: 'demon_king_daggers',
    name: "Demon King's Daggers",
    type: 'weapon',
    slot: 'weapon',
    rarity: 'mythic',
    stats: {
      attack: 250,
      critRate: 25,
      critDamage: 50,
      speed: 15
    },
    description: 'Ancient daggers forged in the depths of hell. They hunger for battle and grow stronger with each kill.',
    requirements: { level: 1 }
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Monarch Cloak',
    type: 'armor',
    slot: 'chest',
    rarity: 'legendary',
    stats: {
      defense: 100,
      health: 200,
      mana: 150
    },
    description: 'A cloak that seems to absorb light itself. Worn by the Shadow Monarch.',
    requirements: { level: 1 }
  }
];

export function EquipmentSystem({ 
  isVisible, 
  onClose, 
  playerLevel,
  equippedGear,
  availableEquipment,
  onEquip,
  onUnequip
}: EquipmentSystemProps) {
  const [selectedTab, setSelectedTab] = useState<'equipped' | 'inventory'>('equipped');

  if (!isVisible) return null;

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

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'helmet': return <Crown className="w-4 h-4" />;
      case 'chest': return <Shirt className="w-4 h-4" />;
      case 'legs': return <Shirt className="w-4 h-4" />;
      case 'boots': return <Shirt className="w-4 h-4" />;
      case 'ring': return <Gem className="w-4 h-4" />;
      case 'necklace': return <Gem className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const calculateTotalStats = () => {
    const stats = {
      attack: 0,
      defense: 0,
      health: 0,
      mana: 0,
      speed: 0,
      critRate: 0,
      critDamage: 0
    };

    Object.values(equippedGear).forEach(item => {
      if (item) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (value && stat in stats && typeof value === 'number') {
            (stats as any)[stat] += value;
          }
        });
      }
    });

    return stats;
  };

  const totalStats = calculateTotalStats();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-xl w-full max-w-6xl h-full sm:h-5/6 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-purple-500/30 shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
            <span className="hidden sm:inline">Equipment System</span>
            <span className="sm:hidden">Equipment</span>
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-purple-500/20">
            ×
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-full overflow-hidden">
          {/* Equipment Slots */}
          <div className="w-full lg:w-1/3 p-3 sm:p-6 lg:border-r border-purple-500/30 overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Equipped Gear</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {['weapon', 'helmet', 'chest', 'legs', 'boots', 'ring', 'necklace'].map(slot => {
                const equipped = equippedGear[slot as keyof EquippedGear];
                return (
                  <Card key={slot} className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex items-center gap-1 sm:gap-2 mb-2">
                        {getSlotIcon(slot)}
                        <span className="text-xs sm:text-sm text-white capitalize truncate">{slot}</span>
                      </div>
                      
                      {equipped ? (
                        <div>
                          <div className="flex items-center gap-1 sm:gap-2 mb-1">
                            <Badge className={`${getRarityColor(equipped.rarity)} text-white text-xs`}>
                              {equipped.rarity}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-white font-medium truncate">{equipped.name}</p>
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
                            className="mt-2 text-xs w-full"
                          >
                            Unequip
                          </Button>
                        </div>
                      ) : (
                        <div className="text-slate-400 text-xs sm:text-sm">Empty</div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Total Stats */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Total Combat Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(totalStats).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-sm">
                    <span className="text-slate-300 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-white font-medium">+{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Available Equipment */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto">
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
                      <p className="text-slate-300 text-xs mb-3">{item.description}</p>
                      
                      <div className="space-y-1 mb-3">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between text-xs">
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
                        onClick={() => onEquip(item)}
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
        </div>
      </div>
    </div>
  );
}

export { STARTING_EQUIPMENT };
export type { Equipment, EquippedGear };