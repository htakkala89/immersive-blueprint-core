import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Target,
  Gift,
  Award,
  BookOpen,
  Flame,
  Lock,
  CheckCircle
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'romance' | 'combat' | 'story' | 'special' | 'collection';
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: 'affection' | 'combat_wins' | 'story_progress' | 'shadow_soldiers' | 'choices' | 'scenes_unlocked';
    target: number;
    current?: number;
  };
  rewards: {
    experience?: number;
    gold?: number;
    unlockedScenes?: string[];
    specialAbilities?: string[];
    relationshipBonus?: number;
  };
  unlocked: boolean;
  dateUnlocked?: number;
  secretAchievement?: boolean;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  category: 'combat' | 'shadow' | 'social' | 'passive';
  icon: string;
  effects: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
    criticalRate?: number;
    experienceBonus?: number;
    affectionGainBonus?: number;
  };
  requirements?: {
    level?: number;
    prerequisiteSkills?: string[];
  };
  unlocked: boolean;
}

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
    skills?: Skill[];
    gold?: number;
    intimacyLevel?: number;
  };
  equippedGear: any;
  shadowArmy: any[];
  achievements?: Achievement[];
  onStatPointAllocate?: (stat: string) => void;
  onSkillUpgrade?: (skillId: string) => void;
}

export function CharacterProfile({
  isVisible,
  onClose,
  gameState,
  equippedGear,
  shadowArmy,
  achievements,
  onStatPointAllocate,
  onSkillUpgrade
}: CharacterProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate total stats including equipment bonuses
  const totalStats = useMemo(() => {
    const baseStats = gameState.stats || { strength: 10, agility: 10, intelligence: 10, vitality: 10 };
    const equipmentBonuses = { attack: 0, defense: 0, health: 0, mana: 0 };
    
    // Calculate equipment bonuses
    Object.values(equippedGear || {}).forEach((item: any) => {
      if (item?.stats) {
        equipmentBonuses.attack += item.stats.attack || 0;
        equipmentBonuses.defense += item.stats.defense || 0;
        equipmentBonuses.health += item.stats.health || 0;
        equipmentBonuses.mana += item.stats.mana || 0;
      }
    });

    return {
      ...baseStats,
      attack: baseStats.strength * 2 + equipmentBonuses.attack,
      defense: baseStats.vitality * 1.5 + equipmentBonuses.defense,
      totalHealth: gameState.maxHealth + equipmentBonuses.health,
      totalMana: gameState.maxMana + equipmentBonuses.mana
    };
  }, [gameState.stats, gameState.maxHealth, gameState.maxMana, equippedGear]);

  const experienceToNext = useMemo(() => {
    return gameState.level * 100;
  }, [gameState.level]);

  const experienceProgress = useMemo(() => {
    return ((gameState.experience || 0) / experienceToNext) * 100;
  }, [gameState.experience, experienceToNext]);

  // Sample achievements data if none provided
  const defaultAchievements: Achievement[] = [
    {
      id: 'first_meeting',
      title: 'First Encounter',
      description: 'Meet Cha Hae-In for the first time',
      category: 'romance',
      icon: '💘',
      rarity: 'common',
      requirements: { type: 'affection', target: 1, current: gameState.affection },
      rewards: { experience: 100 },
      unlocked: gameState.affection >= 1
    },
    {
      id: 'growing_closer',
      title: 'Growing Closer',
      description: 'Reach affection level 3 with Cha Hae-In',
      category: 'romance',
      icon: '💖',
      rarity: 'rare',
      requirements: { type: 'affection', target: 3, current: gameState.affection },
      rewards: { experience: 250, relationshipBonus: 10 },
      unlocked: gameState.affection >= 3
    },
    {
      id: 'shadow_monarch',
      title: 'Shadow Monarch',
      description: 'Extract your first shadow soldier',
      category: 'combat',
      icon: '👤',
      rarity: 'epic',
      requirements: { type: 'shadow_soldiers', target: 1, current: shadowArmy?.length || 0 },
      rewards: { experience: 500 },
      unlocked: (shadowArmy?.length || 0) >= 1
    },
    {
      id: 'level_up',
      title: 'Power Growth',
      description: 'Reach level 5',
      category: 'story',
      icon: '⭐',
      rarity: 'common',
      requirements: { type: 'story_progress', target: 5, current: gameState.level },
      rewards: { experience: 200 },
      unlocked: gameState.level >= 5
    }
  ];

  const defaultSkills: Skill[] = [
    {
      id: 'shadow_extraction',
      name: 'Shadow Extraction',
      description: 'Extract defeated enemies as shadow soldiers',
      level: 1,
      maxLevel: 10,
      category: 'shadow',
      icon: '👤',
      effects: { experienceBonus: 10 },
      unlocked: true
    },
    {
      id: 'dagger_mastery',
      name: 'Dagger Mastery',
      description: 'Increased proficiency with dagger weapons',
      level: 3,
      maxLevel: 10,
      category: 'combat',
      icon: '🗡️',
      effects: { attack: 15, criticalRate: 5 },
      unlocked: true
    },
    {
      id: 'stealth',
      name: 'Stealth',
      description: 'Become invisible to enemies for a short duration',
      level: 2,
      maxLevel: 5,
      category: 'combat',
      icon: '👻',
      effects: { speed: 20 },
      unlocked: gameState.level >= 5
    },
    {
      id: 'charm',
      name: 'Natural Charm',
      description: 'Increased effectiveness in social interactions',
      level: 1,
      maxLevel: 5,
      category: 'social',
      icon: '💫',
      effects: { affectionGainBonus: 15 },
      unlocked: gameState.affection >= 2
    }
  ];

  const displayAchievements = achievements || defaultAchievements;
  const displaySkills = gameState.skills || defaultSkills;

  // Calculate relationship metrics
  const intimacyPercentage = ((gameState.intimacyLevel || 0) / 10) * 100;
  const trustPercentage = (gameState.affection / 5) * 100;
  const affectionPercentage = (gameState.affection / 5) * 100;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sung Jin-Woo
            </h2>
            <Badge variant="outline" className="ml-2">
              Level {gameState.level}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="equipment" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Character Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      Character Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Health */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Heart className="w-4 h-4 text-red-500" />
                          Health
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {gameState.health} / {gameState.maxHealth}
                        </span>
                      </div>
                      <Progress 
                        value={(gameState.health / gameState.maxHealth) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Mana */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Zap className="w-4 h-4 text-blue-500" />
                          Mana
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {gameState.mana} / {gameState.maxMana}
                        </span>
                      </div>
                      <Progress 
                        value={(gameState.mana / gameState.maxMana) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Experience */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          Experience
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {gameState.experience || 0} / {experienceToNext}
                        </span>
                      </div>
                      <Progress value={experienceProgress} className="h-2" />
                    </div>

                    {/* Gold */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Gift className="w-4 h-4 text-yellow-500" />
                        Gold
                      </span>
                      <span className="text-sm font-bold text-yellow-600">
                        {gameState.gold || 500}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Relationship Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-500" />
                      Relationship with Cha Hae-In
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Affection */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Heart className="w-4 h-4 text-pink-500" />
                          Affection
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(affectionPercentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={affectionPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Trust */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Shield className="w-4 h-4 text-blue-500" />
                          Trust
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(trustPercentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={trustPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Intimacy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Flame className="w-4 h-4 text-red-500" />
                          Intimacy
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(intimacyPercentage)}%
                        </span>
                      </div>
                      <Progress 
                        value={intimacyPercentage} 
                        className="h-2"
                      />
                    </div>

                    {/* Relationship Status */}
                    <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="text-center">
                        <div className="text-sm font-medium text-pink-800 dark:text-pink-200">
                          {gameState.affection === 0 && "Strangers"}
                          {gameState.affection === 1 && "Acquaintances"}
                          {gameState.affection === 2 && "Friends"}
                          {gameState.affection === 3 && "Close Friends"}
                          {gameState.affection === 4 && "Romantic Interest"}
                          {gameState.affection === 5 && "Lovers"}
                        </div>
                        <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                          Level {gameState.affection} / 5
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Core Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Core Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Available Points */}
                    {((gameState.statPoints || 0) + (gameState.skillPoints || 0)) > 0 && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                          <Crown className="w-4 h-4" />
                          <span className="font-medium">Points Available</span>
                        </div>
                        <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                          {gameState.statPoints || 0} Stat Points • {gameState.skillPoints || 0} Skill Points
                        </div>
                      </div>
                    )}

                    {/* Primary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Strength</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{totalStats.strength}</span>
                            {onStatPointAllocate && (gameState.statPoints || 0) > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatPointAllocate('strength')}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Agility</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{totalStats.agility}</span>
                            {onStatPointAllocate && (gameState.statPoints || 0) > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatPointAllocate('agility')}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Intelligence</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{totalStats.intelligence}</span>
                            {onStatPointAllocate && (gameState.statPoints || 0) > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatPointAllocate('intelligence')}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Vitality</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{totalStats.vitality}</span>
                            {onStatPointAllocate && (gameState.statPoints || 0) > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onStatPointAllocate('vitality')}
                                className="h-6 w-6 p-0"
                              >
                                +
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Combat Stats */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Combat Performance
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Attack Power</span>
                          <span className="text-lg font-bold text-red-600">{Math.round(totalStats.attack)}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Defense</span>
                          <span className="text-lg font-bold text-blue-600">{Math.round(totalStats.defense)}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Health</span>
                          <span className="text-lg font-bold text-green-600">{totalStats.totalHealth}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Mana</span>
                          <span className="text-lg font-bold text-purple-600">{totalStats.totalMana}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shadow Army */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-purple-500" />
                      Shadow Army
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Shadows</span>
                        <span className="text-sm">{shadowArmy?.length || 0}</span>
                      </div>
                      {shadowArmy && shadowArmy.length > 0 ? (
                        <div className="space-y-2">
                          {shadowArmy.slice(0, 5).map((shadow: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm">{shadow.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Level {shadow.level}
                              </Badge>
                            </div>
                          ))}
                          {shadowArmy.length > 5 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{shadowArmy.length - 5} more shadows
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic text-center py-8">No shadows extracted yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-500" />
                      Equipped Gear
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(equippedGear || {}).map(([slot, item]: [string, any]) => (
                        <div key={slot} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <span className="text-sm font-medium capitalize">{slot}</span>
                          {item ? (
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs mb-1">
                                {item.name}
                              </Badge>
                              {item.stats && (
                                <div className="text-xs text-gray-500">
                                  +{item.stats.attack || 0} ATK, +{item.stats.defense || 0} DEF
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Empty</span>
                          )}
                        </div>
                      ))}
                      {Object.keys(equippedGear || {}).length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-8">No equipment equipped</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Equipment Bonuses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Attack Bonus</span>
                        <span className="text-sm font-bold text-red-600">
                          +{Object.values(equippedGear || {}).reduce((total: number, item: any) => 
                            total + (item?.stats?.attack || 0), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Defense Bonus</span>
                        <span className="text-sm font-bold text-blue-600">
                          +{Object.values(equippedGear || {}).reduce((total: number, item: any) => 
                            total + (item?.stats?.defense || 0), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Health Bonus</span>
                        <span className="text-sm font-bold text-green-600">
                          +{Object.values(equippedGear || {}).reduce((total: number, item: any) => 
                            total + (item?.stats?.health || 0), 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Mana Bonus</span>
                        <span className="text-sm font-bold text-purple-600">
                          +{Object.values(equippedGear || {}).reduce((total: number, item: any) => 
                            total + (item?.stats?.mana || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displaySkills.map((skill) => (
                  <Card key={skill.id} className={skill.unlocked ? "" : "opacity-50"}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{skill.icon}</span>
                          <div>
                            <h3 className="font-medium">{skill.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {skill.category}
                            </Badge>
                          </div>
                        </div>
                        {skill.unlocked ? (
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Level {skill.level}/{skill.maxLevel}
                            </div>
                            {onSkillUpgrade && (gameState.skillPoints || 0) > 0 && skill.level < skill.maxLevel && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onSkillUpgrade(skill.id)}
                                className="mt-1 h-6 text-xs"
                              >
                                Upgrade
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {skill.description}
                      </p>
                      {skill.unlocked && (
                        <div className="text-xs text-gray-500">
                          {Object.entries(skill.effects).map(([key, value]) => (
                            <span key={key} className="mr-2">
                              +{value} {key}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {displayAchievements.map((achievement) => (
                  <Card key={achievement.id} className={achievement.unlocked ? "border-green-200 dark:border-green-800" : "opacity-60"}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{achievement.icon}</span>
                          <div>
                            <h3 className="font-medium flex items-center gap-2">
                              {achievement.title}
                              {achievement.unlocked && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </h3>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {achievement.category}
                              </Badge>
                              <Badge 
                                variant={achievement.rarity === 'legendary' ? 'default' : 'secondary'} 
                                className="text-xs"
                              >
                                {achievement.rarity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {!achievement.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {achievement.description}
                      </p>
                      {!achievement.unlocked && (
                        <div className="text-xs text-gray-500">
                          Progress: {achievement.requirements.current || 0} / {achievement.requirements.target}
                        </div>
                      )}
                      {achievement.unlocked && achievement.rewards && (
                        <div className="text-xs text-green-600 dark:text-green-400">
                          Rewards: {achievement.rewards.experience && `+${achievement.rewards.experience} XP`}
                          {achievement.rewards.gold && ` +${achievement.rewards.gold} Gold`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}