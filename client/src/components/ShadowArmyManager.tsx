import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sword, Shield, Zap, Eye, Heart, Skull, Crown, Star, 
  TrendingUp, Users, Target, Award, ChevronUp
} from "lucide-react";

interface ShadowSoldier {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  intelligence: number;
  type: 'knight' | 'archer' | 'mage' | 'assassin' | 'beast' | 'elite' | 'boss';
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  abilities: Array<{
    id: string;
    name: string;
    damage: number;
    manaCost: number;
    cooldown: number;
    description: string;
    type: 'attack' | 'defense' | 'support' | 'ultimate';
  }>;
  experience: number;
  maxExperience: number;
  skillPoints: number;
  equipment?: Array<{
    slot: 'weapon' | 'armor' | 'accessory';
    name: string;
    bonuses: Record<string, number>;
  }>;
  loyalty: number;
  combatStats: {
    battlesWon: number;
    damageDealt: number;
    damageReceived: number;
    killCount: number;
  };
  evolutionPossible: boolean;
  evolutionRequirements?: {
    level: number;
    materials: Array<{ name: string; quantity: number }>;
  };
}

interface Formation {
  id: string;
  name: string;
  positions: Array<{
    shadowId: string | null;
    role: 'frontline' | 'midline' | 'backline';
    position: number;
  }>;
  bonuses: Array<{
    name: string;
    description: string;
    effect: Record<string, number>;
  }>;
}

interface ShadowArmyManagerProps {
  isVisible: boolean;
  onClose: () => void;
  shadowArmy: ShadowSoldier[];
  onShadowUpdate: (shadows: ShadowSoldier[]) => void;
  playerLevel: number;
  availableMaterials: Array<{ name: string; quantity: number }>;
}

export function ShadowArmyManager({ 
  isVisible, 
  onClose, 
  shadowArmy, 
  onShadowUpdate, 
  playerLevel,
  availableMaterials 
}: ShadowArmyManagerProps) {
  const [selectedShadow, setSelectedShadow] = useState<ShadowSoldier | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [formations, setFormations] = useState<Formation[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [sortBy, setSortBy] = useState<'level' | 'rarity' | 'type' | 'combat'>('level');

  const sortedShadows = [...shadowArmy].sort((a, b) => {
    switch (sortBy) {
      case 'level':
        return b.level - a.level;
      case 'rarity':
        const rarityOrder = { 'mythic': 5, 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      case 'type':
        return a.type.localeCompare(b.type);
      case 'combat':
        return b.combatStats.battlesWon - a.combatStats.battlesWon;
      default:
        return 0;
    }
  });

  const levelUpShadow = (shadowId: string) => {
    const updatedArmy = shadowArmy.map(shadow => {
      if (shadow.id === shadowId && shadow.experience >= shadow.maxExperience) {
        const newLevel = shadow.level + 1;
        const statGains = calculateStatGains(shadow);
        
        return {
          ...shadow,
          level: newLevel,
          experience: 0,
          maxExperience: Math.floor(shadow.maxExperience * 1.2),
          attack: shadow.attack + statGains.attack,
          defense: shadow.defense + statGains.defense,
          health: shadow.health + statGains.health,
          maxHealth: shadow.maxHealth + statGains.health,
          speed: shadow.speed + statGains.speed,
          intelligence: shadow.intelligence + statGains.intelligence,
          skillPoints: shadow.skillPoints + 2,
          evolutionPossible: checkEvolutionPossible(shadow, newLevel)
        };
      }
      return shadow;
    });
    
    onShadowUpdate(updatedArmy);
  };

  const calculateStatGains = (shadow: ShadowSoldier) => {
    const baseGains = {
      attack: Math.floor(shadow.attack * 0.1) + 2,
      defense: Math.floor(shadow.defense * 0.1) + 1,
      health: Math.floor(shadow.maxHealth * 0.15) + 5,
      speed: Math.floor(shadow.speed * 0.08) + 1,
      intelligence: Math.floor(shadow.intelligence * 0.1) + 1
    };

    // Rarity multipliers
    const multipliers = {
      'common': 1,
      'rare': 1.2,
      'epic': 1.5,
      'legendary': 2,
      'mythic': 3
    };

    const multiplier = multipliers[shadow.rarity];
    
    return {
      attack: Math.floor(baseGains.attack * multiplier),
      defense: Math.floor(baseGains.defense * multiplier),
      health: Math.floor(baseGains.health * multiplier),
      speed: Math.floor(baseGains.speed * multiplier),
      intelligence: Math.floor(baseGains.intelligence * multiplier)
    };
  };

  const checkEvolutionPossible = (shadow: ShadowSoldier, level: number) => {
    if (shadow.rarity === 'mythic') return false;
    
    const evolutionLevels = {
      'common': 20,
      'rare': 35,
      'epic': 50,
      'legendary': 75
    };
    
    return level >= evolutionLevels[shadow.rarity];
  };

  const evolveShadow = (shadowId: string) => {
    const shadow = shadowArmy.find(s => s.id === shadowId);
    if (!shadow || !shadow.evolutionPossible) return;

    const rarityProgression: Record<string, string> = {
      'common': 'rare',
      'rare': 'epic', 
      'epic': 'legendary',
      'legendary': 'mythic'
    };

    const newRarity = rarityProgression[shadow.rarity];
    if (!newRarity) return;

    const updatedArmy = shadowArmy.map(s => {
      if (s.id === shadowId) {
        return {
          ...s,
          rarity: newRarity,
          attack: Math.floor(s.attack * 1.5),
          defense: Math.floor(s.defense * 1.5),
          maxHealth: Math.floor(s.maxHealth * 1.3),
          health: Math.floor(s.maxHealth * 1.3),
          speed: Math.floor(s.speed * 1.2),
          intelligence: Math.floor(s.intelligence * 1.4),
          evolutionPossible: false,
          abilities: [...s.abilities, generateNewAbility(newRarity)]
        };
      }
      return s;
    });

    onShadowUpdate(updatedArmy);
  };

  const generateNewAbility = (rarity: string) => {
    const abilityNames = {
      'rare': ['Enhanced Strike', 'Defensive Stance', 'Quick Recovery'],
      'epic': ['Shadow Burst', 'Phantom Shield', 'Death Mark'],
      'legendary': ['Void Rend', 'Immortal Guard', 'Soul Harvest'],
      'mythic': ['Reality Tear', 'Absolute Defense', 'Existence Drain']
    };

    const names = abilityNames[rarity as keyof typeof abilityNames] || ['Basic Attack'];
    const name = names[Math.floor(Math.random() * names.length)];

    return {
      id: `ability_${Date.now()}`,
      name,
      damage: 50 + (Math.random() * 100),
      manaCost: 20 + (Math.random() * 30),
      cooldown: 3 + Math.floor(Math.random() * 5),
      description: `A powerful ${rarity} ability`,
      type: 'attack' as const
    };
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-red-500 bg-red-500/10 border-red-500';
      case 'legendary': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500';
      case 'epic': return 'text-purple-500 bg-purple-500/10 border-purple-500';
      case 'rare': return 'text-blue-500 bg-blue-500/10 border-blue-500';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'knight': return <Shield className="w-4 h-4" />;
      case 'archer': return <Target className="w-4 h-4" />;
      case 'mage': return <Zap className="w-4 h-4" />;
      case 'assassin': return <Eye className="w-4 h-4" />;
      case 'beast': return <Skull className="w-4 h-4" />;
      case 'elite': return <Crown className="w-4 h-4" />;
      case 'boss': return <Star className="w-4 h-4" />;
      default: return <Sword className="w-4 h-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-purple-500/30 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="text-purple-400" />
                Shadow Army Management
              </h2>
              <p className="text-gray-400">
                Manage your {shadowArmy.length} shadow soldiers • Total Power: {shadowArmy.reduce((sum, s) => sum + s.attack + s.defense, 0)}
              </p>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="overview">Army Overview</TabsTrigger>
              <TabsTrigger value="management">Shadow Management</TabsTrigger>
              <TabsTrigger value="formations">Battle Formations</TabsTrigger>
              <TabsTrigger value="evolution">Evolution Lab</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{shadowArmy.length}</p>
                    <p className="text-gray-400 text-sm">Total Shadows</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {Math.floor(shadowArmy.reduce((sum, s) => sum + s.level, 0) / shadowArmy.length) || 0}
                    </p>
                    <p className="text-gray-400 text-sm">Avg Level</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {shadowArmy.filter(s => s.rarity === 'legendary' || s.rarity === 'mythic').length}
                    </p>
                    <p className="text-gray-400 text-sm">Elite Shadows</p>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <ChevronUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">
                      {shadowArmy.filter(s => s.evolutionPossible).length}
                    </p>
                    <p className="text-gray-400 text-sm">Ready to Evolve</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-4 mb-4">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded"
                >
                  <option value="level">Sort by Level</option>
                  <option value="rarity">Sort by Rarity</option>
                  <option value="type">Sort by Type</option>
                  <option value="combat">Sort by Combat Stats</option>
                </select>
              </div>

              <div className="grid gap-3">
                {sortedShadows.map((shadow) => (
                  <Card 
                    key={shadow.id}
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => setSelectedShadow(shadow)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(shadow.type)}
                            <Badge className={getRarityColor(shadow.rarity)}>
                              {shadow.rarity.toUpperCase()}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{shadow.name}</h4>
                            <p className="text-gray-400 text-sm">
                              Level {shadow.level} {shadow.type.charAt(0).toUpperCase() + shadow.type.slice(1)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex gap-4 text-sm">
                            <span className="text-red-400">ATK: {shadow.attack}</span>
                            <span className="text-blue-400">DEF: {shadow.defense}</span>
                            <span className="text-green-400">HP: {shadow.health}/{shadow.maxHealth}</span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Progress 
                              value={(shadow.experience / shadow.maxExperience) * 100} 
                              className="w-24 h-2"
                            />
                            <span className="text-xs text-gray-400">
                              {shadow.experience}/{shadow.maxExperience} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="management" className="space-y-4">
              {selectedShadow ? (
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        {getTypeIcon(selectedShadow.type)}
                        {selectedShadow.name}
                        <Badge className={getRarityColor(selectedShadow.rarity)}>
                          {selectedShadow.rarity.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Level</p>
                            <p className="text-white text-xl font-bold">{selectedShadow.level}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Skill Points</p>
                            <p className="text-white text-xl font-bold">{selectedShadow.skillPoints}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-400 text-sm mb-2">Experience</p>
                          <Progress 
                            value={(selectedShadow.experience / selectedShadow.maxExperience) * 100} 
                            className="w-full"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {selectedShadow.experience} / {selectedShadow.maxExperience}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-sm">Attack</p>
                            <p className="text-red-400 text-lg font-semibold">{selectedShadow.attack}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Defense</p>
                            <p className="text-blue-400 text-lg font-semibold">{selectedShadow.defense}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Speed</p>
                            <p className="text-yellow-400 text-lg font-semibold">{selectedShadow.speed}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Intelligence</p>
                            <p className="text-purple-400 text-lg font-semibold">{selectedShadow.intelligence}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => levelUpShadow(selectedShadow.id)}
                            disabled={selectedShadow.experience < selectedShadow.maxExperience}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Level Up
                          </Button>
                          
                          {selectedShadow.evolutionPossible && (
                            <Button 
                              onClick={() => evolveShadow(selectedShadow.id)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              Evolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Combat Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Battles Won</span>
                          <span className="text-white">{selectedShadow.combatStats.battlesWon}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage Dealt</span>
                          <span className="text-white">{selectedShadow.combatStats.damageDealt.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage Received</span>
                          <span className="text-white">{selectedShadow.combatStats.damageReceived.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kill Count</span>
                          <span className="text-white">{selectedShadow.combatStats.killCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Loyalty</span>
                          <span className="text-white">{selectedShadow.loyalty}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">Select a shadow soldier to manage</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="formations" className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <h3 className="text-white text-lg font-semibold mb-2">Battle Formations</h3>
                  <p className="text-gray-400">Strategic shadow deployment system coming soon</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evolution" className="space-y-4">
              <div className="grid gap-4">
                {shadowArmy.filter(s => s.evolutionPossible).map((shadow) => (
                  <Card key={shadow.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        {getTypeIcon(shadow.type)}
                        {shadow.name}
                        <Badge className={getRarityColor(shadow.rarity)}>
                          {shadow.rarity.toUpperCase()}
                        </Badge>
                        <ChevronUp className="w-4 h-4 text-green-400" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-400 text-sm">Ready for evolution to higher rarity</p>
                          <p className="text-green-400 text-sm">+50% all stats, new abilities unlocked</p>
                        </div>
                        <Button 
                          onClick={() => evolveShadow(shadow.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Evolve Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {shadowArmy.filter(s => s.evolutionPossible).length === 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-400">No shadows ready for evolution</p>
                      <p className="text-gray-500 text-sm mt-2">Level up your shadows to unlock evolution</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}