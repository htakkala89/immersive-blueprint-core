import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  X, 
  Sword, 
  Shield, 
  Heart, 
  Zap, 
  Star, 
  Trophy,
  TrendingUp,
  Crown,
  Target
} from 'lucide-react';

interface CharacterProfileProps {
  isVisible: boolean;
  onClose: () => void;
  gameState: {
    level: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    affection: number;
    experience?: number;
    statPoints?: number;
    skillPoints?: number;
    stats?: {
      strength: number;
      agility: number;
      intelligence: number;
      vitality: number;
    };
    gold?: number;
  };
  equippedGear: any;
  shadowArmy: any[];
  achievements?: any[];
}

export function CharacterProfile({
  isVisible,
  onClose,
  gameState,
  equippedGear,
  shadowArmy,
  achievements = []
}: CharacterProfileProps) {
  
  const equipmentBonuses = useMemo(() => {
    const bonuses = { attack: 0, defense: 0, health: 0, mana: 0, speed: 0 };
    Object.values(equippedGear || {}).forEach((item: any) => {
      if (item) {
        bonuses.attack += item.stats?.attack || 0;
        bonuses.defense += item.stats?.defense || 0;
        bonuses.health += item.stats?.health || 0;
        bonuses.mana += item.stats?.mana || 0;
        bonuses.speed += item.stats?.speed || 0;
      }
    });
    return bonuses;
  }, [equippedGear]);

  const totalCombatStats = useMemo(() => {
    const baseStats = {
      strength: gameState.stats?.strength || 10,
      agility: gameState.stats?.agility || 10,
      intelligence: gameState.stats?.intelligence || 10,
      vitality: gameState.stats?.vitality || 10
    };

    return {
      totalAttack: (baseStats.strength * 2) + equipmentBonuses.attack,
      totalDefense: (baseStats.vitality * 1.5) + equipmentBonuses.defense,
      totalHealth: gameState.maxHealth + equipmentBonuses.health,
      totalMana: gameState.maxMana + equipmentBonuses.mana,
      totalSpeed: (baseStats.agility * 1.2) + equipmentBonuses.speed
    };
  }, [gameState, equipmentBonuses]);

  const experienceToNextLevel = useMemo(() => {
    return gameState.level * 1000; // Simple formula for next level
  }, [gameState.level]);

  const currentExperience = gameState.experience || 0;
  const experienceProgress = Math.min((currentExperience % experienceToNextLevel) / experienceToNextLevel * 100, 100);

  const affectionProgress = Math.min((gameState.affection / 100) * 100, 100);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/30 rounded-xl w-full max-w-6xl h-full sm:h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500/30 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Sung Jin-Woo - Shadow Monarch
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-white hover:bg-blue-500/20">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Basic Info */}
            <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Character Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Level</span>
                  <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">
                    {gameState.level}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Experience</span>
                    <span className="text-blue-400">{currentExperience} / {experienceToNextLevel}</span>
                  </div>
                  <Progress value={experienceProgress} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Affection with Cha Hae-In</span>
                    <span className="text-pink-400">{gameState.affection}%</span>
                  </div>
                  <Progress value={affectionProgress} className="h-2 bg-pink-900/30" />
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Gold</span>
                  <span className="text-yellow-400 font-medium">{gameState.gold?.toLocaleString() || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Stat Points</span>
                  <span className="text-green-400 font-medium">{gameState.statPoints || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-300">Skill Points</span>
                  <span className="text-purple-400 font-medium">{gameState.skillPoints || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Health & Mana */}
            <Card className="bg-gradient-to-r from-red-900/50 to-green-900/50 border-red-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-400" />
                      Health
                    </span>
                    <span className="text-red-400">{gameState.health} / {totalCombatStats.totalHealth}</span>
                  </div>
                  <Progress 
                    value={(gameState.health / totalCombatStats.totalHealth) * 100} 
                    className="h-3 bg-red-900/30"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-blue-400" />
                      Mana
                    </span>
                    <span className="text-blue-400">{gameState.mana} / {totalCombatStats.totalMana}</span>
                  </div>
                  <Progress 
                    value={(gameState.mana / totalCombatStats.totalMana) * 100} 
                    className="h-3 bg-blue-900/30"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Base Stats */}
            <Card className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 border-orange-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-orange-400" />
                  Base Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Strength</span>
                  <span className="text-red-400 font-medium">{gameState.stats?.strength || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Agility</span>
                  <span className="text-green-400 font-medium">{gameState.stats?.agility || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Intelligence</span>
                  <span className="text-purple-400 font-medium">{gameState.stats?.intelligence || 10}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Vitality</span>
                  <span className="text-pink-400 font-medium">{gameState.stats?.vitality || 10}</span>
                </div>
              </CardContent>
            </Card>

            {/* Combat Stats */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sword className="w-5 h-5 text-purple-400" />
                  Combat Power
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Attack Power</span>
                  <span className="text-red-400 font-bold text-lg">{totalCombatStats.totalAttack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Defense</span>
                  <span className="text-blue-400 font-bold text-lg">{Math.round(totalCombatStats.totalDefense)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Speed</span>
                  <span className="text-green-400 font-bold text-lg">{Math.round(totalCombatStats.totalSpeed)}</span>
                </div>
                <div className="pt-2 border-t border-purple-500/30">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Total Combat Rating</span>
                    <span className="text-yellow-400 font-bold text-xl">
                      {Math.round(totalCombatStats.totalAttack + totalCombatStats.totalDefense + totalCombatStats.totalSpeed)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Summary */}
            <Card className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-400" />
                  Equipment Bonuses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Attack Bonus</span>
                  <span className="text-red-400">+{equipmentBonuses.attack}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Defense Bonus</span>
                  <span className="text-blue-400">+{equipmentBonuses.defense}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Health Bonus</span>
                  <span className="text-green-400">+{equipmentBonuses.health}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Mana Bonus</span>
                  <span className="text-purple-400">+{equipmentBonuses.mana}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Speed Bonus</span>
                  <span className="text-yellow-400">+{equipmentBonuses.speed}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shadow Army Summary */}
            <Card className="bg-gradient-to-r from-gray-900/50 to-slate-900/50 border-gray-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-400" />
                  Shadow Army
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Total Soldiers</span>
                  <span className="text-purple-400 font-medium">{shadowArmy?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Army Power</span>
                  <span className="text-purple-400 font-medium">
                    {shadowArmy?.reduce((total: number, soldier: any) => total + (soldier.attack || 0), 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Legendary+</span>
                  <span className="text-orange-400 font-medium">
                    {shadowArmy?.filter((s: any) => s.rarity === 'legendary' || s.rarity === 'mythic').length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Character Title Section */}
          <Card className="mt-6 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Shadow Monarch's Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{gameState.level}</div>
                  <div className="text-slate-300 text-sm">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{Math.round(totalCombatStats.totalAttack + totalCombatStats.totalDefense)}</div>
                  <div className="text-slate-300 text-sm">Power Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{gameState.affection}%</div>
                  <div className="text-slate-300 text-sm">Relationship Progress</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-slate-300 text-sm text-center italic">
                  "The Shadow Monarch rises, commanding darkness itself. Each victory brings him closer to absolute power and deeper connections with those who matter most."
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}