import React, { useMemo, useState } from 'react';
import { X, User, Crown, Star, Heart, Zap, Sword, Shield, Trophy, Lock, CheckCircle, TrendingUp } from 'lucide-react';

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
  onStatIncrease?: (stat: string) => void;
  onSkillUpgrade?: (skillId: string) => void;
}

export default function CharacterProfile({
  isVisible,
  onClose,
  gameState,
  equippedGear,
  shadowArmy,
  onStatIncrease,
  onSkillUpgrade
}: CharacterProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const affectionPercentage = (gameState.affection / 5) * 100;
  const intimacyPercentage = Math.min(((gameState.intimacyLevel || 0) / 100) * 100, 100);
  const trustPercentage = Math.min(affectionPercentage + 20, 100);

  // Mock achievements data - in real app this would come from props
  const achievements: Achievement[] = [
    {
      id: 'first_meeting',
      title: 'First Encounter',
      description: 'Meet Cha Hae-In for the first time',
      category: 'story',
      icon: '👋',
      rarity: 'common',
      requirements: { type: 'story_progress', target: 1, current: 1 },
      rewards: { experience: 100 },
      unlocked: true
    },
    {
      id: 'romantic_spark',
      title: 'Romantic Spark',
      description: 'Reach affection level 3 with Cha Hae-In',
      category: 'romance',
      icon: '💕',
      rarity: 'rare',
      requirements: { type: 'affection', target: 3, current: gameState.affection },
      rewards: { experience: 200, relationshipBonus: 10 },
      unlocked: gameState.affection >= 3
    },
    {
      id: 'true_love',
      title: 'True Love',
      description: 'Reach maximum affection level with Cha Hae-In',
      category: 'romance',
      icon: '💖',
      rarity: 'legendary',
      requirements: { type: 'affection', target: 5, current: gameState.affection },
      rewards: { experience: 1000, unlockedScenes: ['wedding'], relationshipBonus: 50 },
      unlocked: gameState.affection >= 5
    }
  ];

  // Mock skills data
  const skills: Skill[] = [
    {
      id: 'shadow_extraction',
      name: 'Shadow Extraction',
      description: 'Extract shadows from defeated enemies',
      level: Math.min(gameState.level, 10),
      maxLevel: 10,
      category: 'shadow',
      icon: '👥',
      effects: { attack: 20, defense: 10 },
      unlocked: true
    },
    {
      id: 'monarch_authority',
      name: 'Monarch Authority',
      description: 'Command shadows with absolute authority',
      level: Math.max(0, gameState.level - 5),
      maxLevel: 5,
      category: 'shadow',
      icon: '👑',
      effects: { attack: 50, mana: 100 },
      requirements: { level: 10 },
      unlocked: gameState.level >= 10
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl h-[95vh] bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <User size={36} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Crown size={12} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Sung Jin-Woo</h1>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 backdrop-blur-xl px-3 py-1 rounded-full border border-white/30">
                    <span className="text-white font-semibold">Level {gameState.level}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 px-3 py-1 rounded-full border border-white/20">
                    <span className="text-white font-semibold">Shadow Monarch</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400" />
                    <span className="text-sm">{gameState.experience || 0} XP</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy size={16} className="text-yellow-400" />
                    <span className="text-sm">{gameState.gold || 0} Gold</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex bg-gray-800/50 backdrop-blur-xl border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'equipment', label: 'Equipment', icon: '⚔️' },
            { id: 'skills', label: 'Skills', icon: '🔮' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600/30 text-white border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Core Stats */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Zap className="text-blue-400" size={20} />
                  Core Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Health</span>
                      <span className="text-white">{gameState.health}/{gameState.maxHealth}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Mana</span>
                      <span className="text-white">{gameState.mana}/{gameState.maxMana}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${(gameState.mana / gameState.maxMana) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Relationship Status */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Heart className="text-pink-400" size={20} />
                  Relationship with Cha Hae-In
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Affection</span>
                      <span className="text-pink-400">{Math.round(affectionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all"
                        style={{ width: `${affectionPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Trust</span>
                      <span className="text-blue-400">{Math.round(trustPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                        style={{ width: `${trustPercentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">Intimacy</span>
                      <span className="text-purple-400">{Math.round(intimacyPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all"
                        style={{ width: `${intimacyPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Stats */}
              {gameState.stats && (
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-400" size={20} />
                    Character Stats
                    {(gameState.statPoints || 0) > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {gameState.statPoints} points
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(gameState.stats).map(([stat, value]) => (
                      <div key={stat} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <div className="text-white font-medium capitalize">{stat}</div>
                          <div className="text-2xl font-bold text-blue-400">{value}</div>
                        </div>
                        {onStatIncrease && (gameState.statPoints || 0) > 0 && (
                          <button
                            onClick={() => onStatIncrease(stat)}
                            className="w-8 h-8 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white transition-all"
                          >
                            +
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shadow Army Summary */}
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Crown className="text-purple-400" size={20} />
                  Shadow Army
                </h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {shadowArmy?.length || 0}
                  </div>
                  <div className="text-gray-300">Active Shadows</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 transition-all ${
                    achievement.unlocked 
                      ? 'border-green-400/30 bg-green-900/10' 
                      : 'opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                          {achievement.title}
                          {achievement.unlocked && <CheckCircle size={16} className="text-green-400" />}
                        </h4>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            achievement.rarity === 'legendary' 
                              ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300'
                              : achievement.rarity === 'epic'
                              ? 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                              : achievement.rarity === 'rare'
                              ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
                              : 'bg-gray-500/20 border-gray-400/30 text-gray-300'
                          }`}>
                            {achievement.rarity}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 border border-gray-500/30 text-gray-300">
                            {achievement.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!achievement.unlocked && <Lock size={16} className="text-gray-500" />}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="text-xs text-gray-400 mb-2">
                      Progress: {achievement.requirements.current || 0} / {achievement.requirements.target}
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${Math.min(((achievement.requirements.current || 0) / achievement.requirements.target) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {achievement.unlocked && achievement.rewards && (
                    <div className="text-xs text-green-400 bg-green-900/20 rounded-lg p-2 border border-green-500/20">
                      Rewards: {achievement.rewards.experience && `+${achievement.rewards.experience} XP`}
                      {achievement.rewards.gold && ` +${achievement.rewards.gold} Gold`}
                      {achievement.rewards.relationshipBonus && ` +${achievement.rewards.relationshipBonus}% Relationship`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border border-white/10 p-6 ${
                    skill.unlocked ? '' : 'opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{skill.icon}</div>
                      <div>
                        <h4 className="text-white font-semibold">{skill.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-600/30 border border-gray-500/30 text-gray-300">
                          {skill.category}
                        </span>
                      </div>
                    </div>
                    {skill.unlocked ? (
                      <div className="text-right">
                        <div className="text-sm font-medium text-white mb-1">
                          Level {skill.level}/{skill.maxLevel}
                        </div>
                        {onSkillUpgrade && (gameState.skillPoints || 0) > 0 && skill.level < skill.maxLevel && (
                          <button
                            onClick={() => onSkillUpgrade(skill.id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-full transition-all"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    ) : (
                      <Lock size={16} className="text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{skill.description}</p>
                  {skill.unlocked && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(skill.effects).map(([key, value]) => (
                        <span key={key} className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                          +{value} {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="text-center py-12">
              <Sword size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Equipment system coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}