import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Heart, Sword, Crown, Lock, Unlock } from "lucide-react";

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

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_meeting',
    title: 'First Encounter',
    description: 'Meet Cha Hae-In for the first time',
    category: 'story',
    icon: '👋',
    rarity: 'common',
    requirements: { type: 'story_progress', target: 1 },
    rewards: { experience: 100 },
    unlocked: false
  },
  {
    id: 'heart_flutter',
    title: 'Heart Flutter',
    description: 'Reach 25% affection with Cha Hae-In',
    category: 'romance',
    icon: '💖',
    rarity: 'common',
    requirements: { type: 'affection', target: 25 },
    rewards: { experience: 200, unlockedScenes: ['romantic_conversation_1'] },
    unlocked: false
  },
  {
    id: 'shadow_master',
    title: 'Shadow Master',
    description: 'Successfully extract 5 shadow soldiers',
    category: 'combat',
    icon: '👤',
    rarity: 'rare',
    requirements: { type: 'shadow_soldiers', target: 5 },
    rewards: { experience: 500, specialAbilities: ['shadow_command'] },
    unlocked: false
  },
  {
    id: 'romantic_interest',
    title: 'More Than Friends',
    description: 'Reach romantic interest status',
    category: 'romance',
    icon: '💕',
    rarity: 'rare',
    requirements: { type: 'affection', target: 50 },
    rewards: { experience: 300, unlockedScenes: ['date_scene_1', 'intimate_moment_1'] },
    unlocked: false
  },
  {
    id: 'combat_veteran',
    title: 'Combat Veteran',
    description: 'Win 10 combat encounters',
    category: 'combat',
    icon: '⚔️',
    rarity: 'rare',
    requirements: { type: 'combat_wins', target: 10 },
    rewards: { experience: 400, gold: 1000 },
    unlocked: false
  },
  {
    id: 'deep_connection',
    title: 'Deep Connection',
    description: 'Reach 75% affection and unlock intimate scenes',
    category: 'romance',
    icon: '💗',
    rarity: 'epic',
    requirements: { type: 'affection', target: 75 },
    rewards: { 
      experience: 750, 
      unlockedScenes: ['intimate_scene_1', 'private_moment', 'confession_scene'],
      relationshipBonus: 10
    },
    unlocked: false
  },
  {
    id: 'shadow_monarch',
    title: 'True Shadow Monarch',
    description: 'Command an army of 20 shadow soldiers',
    category: 'combat',
    icon: '👑',
    rarity: 'legendary',
    requirements: { type: 'shadow_soldiers', target: 20 },
    rewards: { 
      experience: 1000, 
      specialAbilities: ['monarch_domain', 'shadow_realm'],
      gold: 5000
    },
    unlocked: false
  },
  {
    id: 'soulmate',
    title: 'Eternal Bond',
    description: 'Reach maximum relationship status with Cha Hae-In',
    category: 'romance',
    icon: '💎',
    rarity: 'legendary',
    requirements: { type: 'affection', target: 100 },
    rewards: { 
      experience: 2000,
      unlockedScenes: ['wedding_scene', 'forever_together', 'ultimate_romance'],
      specialAbilities: ['lovers_bond'],
      relationshipBonus: 25
    },
    unlocked: false,
    secretAchievement: true
  },
  {
    id: 'perfect_choices',
    title: 'Master of Hearts',
    description: 'Make 50 optimal romantic choices',
    category: 'special',
    icon: '🎯',
    rarity: 'epic',
    requirements: { type: 'choices', target: 50 },
    rewards: { 
      experience: 600,
      unlockedScenes: ['perfect_date', 'ideal_moment'],
      relationshipBonus: 15
    },
    unlocked: false,
    secretAchievement: true
  },
  {
    id: 'scene_collector',
    title: 'Memory Keeper',
    description: 'Unlock 25 special scenes',
    category: 'collection',
    icon: '📚',
    rarity: 'epic',
    requirements: { type: 'scenes_unlocked', target: 25 },
    rewards: { 
      experience: 800,
      unlockedScenes: ['memory_gallery', 'special_compilation'],
      gold: 2000
    },
    unlocked: false
  }
];

interface AchievementSystemProps {
  isVisible: boolean;
  onClose: () => void;
  playerStats: {
    affectionLevel: number;
    combatWins: number;
    shadowSoldiers: number;
    scenesUnlocked: number;
    optimalChoices: number;
    storyProgress: number;
  };
  onAchievementUnlock: (achievement: Achievement) => void;
}

export function AchievementSystem({ isVisible, onClose, playerStats, onAchievementUnlock }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'romance' | 'combat' | 'story' | 'special' | 'collection'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);

  const checkAchievements = () => {
    const updatedAchievements = achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let currentProgress = 0;
      let isUnlocked = false;

      switch (achievement.requirements.type) {
        case 'affection':
          currentProgress = playerStats.affectionLevel;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
        case 'combat_wins':
          currentProgress = playerStats.combatWins;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
        case 'shadow_soldiers':
          currentProgress = playerStats.shadowSoldiers;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
        case 'scenes_unlocked':
          currentProgress = playerStats.scenesUnlocked;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
        case 'choices':
          currentProgress = playerStats.optimalChoices;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
        case 'story_progress':
          currentProgress = playerStats.storyProgress;
          isUnlocked = currentProgress >= achievement.requirements.target;
          break;
      }

      if (isUnlocked && !achievement.unlocked) {
        setNewUnlocks(prev => [...prev, achievement.id]);
        onAchievementUnlock({ ...achievement, unlocked: true, dateUnlocked: Date.now() });
        return { 
          ...achievement, 
          unlocked: true, 
          dateUnlocked: Date.now(),
          requirements: { ...achievement.requirements, current: currentProgress }
        };
      }

      return { 
        ...achievement, 
        requirements: { ...achievement.requirements, current: currentProgress }
      };
    });

    setAchievements(updatedAchievements);
  };

  useEffect(() => {
    checkAchievements();
  }, [playerStats]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-300 border-gray-500';
      case 'rare': return 'text-blue-300 border-blue-500';
      case 'epic': return 'text-purple-300 border-purple-500';
      case 'legendary': return 'text-yellow-300 border-yellow-500';
      default: return 'text-gray-300 border-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'romance': return <Heart className="w-4 h-4" />;
      case 'combat': return <Sword className="w-4 h-4" />;
      case 'story': return <Star className="w-4 h-4" />;
      case 'special': return <Crown className="w-4 h-4" />;
      case 'collection': return <Trophy className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (showUnlockedOnly && !achievement.unlocked) return false;
    if (achievement.secretAchievement && !achievement.unlocked) return false;
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.filter(a => !a.secretAchievement).length;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-purple-300">Achievements</h2>
            <p className="text-gray-400 text-sm">
              {unlockedCount}/{totalCount} Unlocked ({Math.floor((unlockedCount / totalCount) * 100)}%)
            </p>
          </div>
          <Button onClick={onClose} variant="outline" className="border-gray-500 text-gray-300">
            Close
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-purple-300">Overall Progress</span>
            <span className="text-purple-300">{unlockedCount}/{totalCount}</span>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="h-3 bg-gray-700">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500" 
                 style={{ width: `${(unlockedCount / totalCount) * 100}%` }} />
          </Progress>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            All
          </Button>
          {['romance', 'combat', 'story', 'special', 'collection'].map(category => (
            <Button 
              key={category}
              onClick={() => setSelectedCategory(category as any)}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
            >
              {getCategoryIcon(category)}
              <span className="ml-1">{category}</span>
            </Button>
          ))}
          <Button 
            onClick={() => setShowUnlockedOnly(!showUnlockedOnly)}
            variant={showUnlockedOnly ? 'default' : 'outline'}
            size="sm"
          >
            {showUnlockedOnly ? 'Show All' : 'Unlocked Only'}
          </Button>
        </div>

        {/* New Unlocks Banner */}
        {newUnlocks.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 font-semibold">
                New Achievement{newUnlocks.length > 1 ? 's' : ''} Unlocked!
              </span>
              <Button 
                onClick={() => setNewUnlocks([])}
                size="sm"
                variant="ghost"
                className="ml-auto text-yellow-300"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={`border rounded-lg p-4 transition-all duration-300 ${
                achievement.unlocked 
                  ? `${getRarityColor(achievement.rarity)} bg-gradient-to-br from-gray-800/50 to-gray-900/50` 
                  : 'border-gray-700 bg-gray-800/30'
              } ${newUnlocks.includes(achievement.id) ? 'animate-pulse ring-2 ring-yellow-400' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{achievement.unlocked ? achievement.icon : '🔒'}</span>
                  <div>
                    <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getCategoryIcon(achievement.category)}
                  {achievement.unlocked ? <Unlock className="w-4 h-4 text-green-400" /> : <Lock className="w-4 h-4 text-gray-500" />}
                </div>
              </div>

              <h3 className={`font-semibold mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                {achievement.title}
              </h3>
              
              <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!achievement.unlocked && achievement.requirements.current !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-gray-400">
                      {achievement.requirements.current}/{achievement.requirements.target}
                    </span>
                  </div>
                  <Progress 
                    value={(achievement.requirements.current / achievement.requirements.target) * 100} 
                    className="h-2 bg-gray-700"
                  >
                    <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300" 
                         style={{ width: `${(achievement.requirements.current / achievement.requirements.target) * 100}%` }} />
                  </Progress>
                </div>
              )}

              {/* Rewards */}
              {achievement.unlocked && (
                <div className="text-xs space-y-1">
                  <div className="text-gray-400">Rewards:</div>
                  {achievement.rewards.experience && (
                    <div className="text-blue-300">+{achievement.rewards.experience} EXP</div>
                  )}
                  {achievement.rewards.gold && (
                    <div className="text-yellow-300">+{achievement.rewards.gold} Gold</div>
                  )}
                  {achievement.rewards.unlockedScenes && (
                    <div className="text-purple-300">
                      {achievement.rewards.unlockedScenes.length} scenes unlocked
                    </div>
                  )}
                  {achievement.rewards.specialAbilities && (
                    <div className="text-red-300">
                      {achievement.rewards.specialAbilities.length} abilities unlocked
                    </div>
                  )}
                  {achievement.dateUnlocked && (
                    <div className="text-gray-500 text-xs">
                      Unlocked: {new Date(achievement.dateUnlocked).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No achievements found with current filters.
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for achievement system integration
export function useAchievementSystem() {
  const [playerStats, setPlayerStats] = useState({
    affectionLevel: 0,
    combatWins: 0,
    shadowSoldiers: 0,
    scenesUnlocked: 0,
    optimalChoices: 0,
    storyProgress: 0
  });

  const updateStats = (updates: Partial<typeof playerStats>) => {
    setPlayerStats(prev => ({ ...prev, ...updates }));
  };

  const trackChoice = (choice: any, isOptimal: boolean) => {
    if (isOptimal) {
      updateStats({ optimalChoices: playerStats.optimalChoices + 1 });
    }
  };

  const trackCombatWin = () => {
    updateStats({ combatWins: playerStats.combatWins + 1 });
  };

  const trackShadowExtraction = () => {
    updateStats({ shadowSoldiers: playerStats.shadowSoldiers + 1 });
  };

  const trackSceneUnlock = () => {
    updateStats({ scenesUnlocked: playerStats.scenesUnlocked + 1 });
  };

  const trackStoryProgress = () => {
    updateStats({ storyProgress: playerStats.storyProgress + 1 });
  };

  const trackAffectionChange = (newLevel: number) => {
    updateStats({ affectionLevel: newLevel });
  };

  return {
    playerStats,
    updateStats,
    trackChoice,
    trackCombatWin,
    trackShadowExtraction,
    trackSceneUnlock,
    trackStoryProgress,
    trackAffectionChange
  };
}