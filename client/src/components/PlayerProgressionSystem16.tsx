import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Crown, Sword, Zap, Heart, Eye, Brain, 
  Plus, Star, Sparkles, Target, Shield,
  Wind, Flame, Bolt, Users, X
} from 'lucide-react';

interface CoreStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

interface PlayerData {
  name: string;
  hunterRank: string;
  level: number;
  experience: number;
  maxExperience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stats: CoreStats;
  unspentStatPoints: number;
  unspentSkillPoints: number;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  type: 'active' | 'passive';
  icon: any;
  position: { x: number; y: number };
  maxLevel: number;
  currentLevel: number;
  cost: number;
  prerequisites?: string[];
  requiredLevel?: number;
  effects: string[];
  isUnlocked: boolean;
  canAfford: boolean;
}

interface ProgressionProps {
  isVisible: boolean;
  onClose: () => void;
  playerData: PlayerData;
  onUpdatePlayer: (updates: Partial<PlayerData>) => void;
}

export function PlayerProgressionSystem16({
  isVisible,
  onClose,
  playerData,
  onUpdatePlayer
}: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills'>('stats');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [constellationZoom, setConstellationZoom] = useState(1);
  const [constellationPan, setConstellationPan] = useState({ x: 0, y: 0 });

  // Skill constellation data - Monarch's path
  const [skills, setSkills] = useState<Skill[]>([
    // Foundation Skills - Center
    {
      id: 'basic_combat',
      name: 'Basic Combat Mastery',
      description: 'Fundamental combat techniques that increase all damage by 15%.',
      type: 'passive',
      icon: Sword,
      position: { x: 400, y: 300 },
      maxLevel: 5,
      currentLevel: 0,
      cost: 1,
      effects: ['+15% All Damage', '+10% Attack Speed'],
      isUnlocked: false,
      canAfford: false
    },
    // Strength Branch - Left
    {
      id: 'mutilate',
      name: 'Mutilate',
      description: 'A devastating dagger strike that ignores 50% of enemy defense.',
      type: 'active',
      icon: Target,
      position: { x: 200, y: 200 },
      maxLevel: 5,
      currentLevel: 0,
      cost: 2,
      prerequisites: ['basic_combat'],
      effects: ['High Physical Damage', 'Ignores Defense'],
      isUnlocked: false,
      canAfford: false
    },
    {
      id: 'berserker_fury',
      name: "Berserker's Fury",
      description: 'Each kill increases damage by 10% for 30 seconds, stacking up to 10 times.',
      type: 'passive',
      icon: Flame,
      position: { x: 100, y: 150 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 3,
      prerequisites: ['mutilate'],
      requiredLevel: 15,
      effects: ['+10% Damage per Kill', 'Max 10 Stacks'],
      isUnlocked: false,
      canAfford: false
    },
    // Agility Branch - Top Right
    {
      id: 'shadow_step',
      name: 'Shadow Step',
      description: 'Instantly dash to target location, becoming untargetable briefly.',
      type: 'active',
      icon: Wind,
      position: { x: 600, y: 150 },
      maxLevel: 5,
      currentLevel: 0,
      cost: 2,
      prerequisites: ['basic_combat'],
      effects: ['Instant Movement', '0.5s Invulnerability'],
      isUnlocked: false,
      canAfford: false
    },
    {
      id: 'critical_mastery',
      name: 'Critical Strike Mastery',
      description: 'Increases critical hit chance and critical damage.',
      type: 'passive',
      icon: Bolt,
      position: { x: 700, y: 100 },
      maxLevel: 5,
      currentLevel: 0,
      cost: 2,
      prerequisites: ['shadow_step'],
      effects: ['+15% Crit Chance', '+50% Crit Damage'],
      isUnlocked: false,
      canAfford: false
    },
    // Intelligence Branch - Bottom Right
    {
      id: 'dominators_touch',
      name: "Dominator's Touch",
      description: 'Unleash dark magic that damages all enemies in a large area.',
      type: 'active',
      icon: Crown,
      position: { x: 600, y: 450 },
      maxLevel: 5,
      currentLevel: 0,
      cost: 3,
      prerequisites: ['basic_combat'],
      requiredLevel: 10,
      effects: ['AOE Magic Damage', 'Fear Effect'],
      isUnlocked: false,
      canAfford: false
    },
    {
      id: 'mana_efficiency',
      name: 'Mana Efficiency',
      description: 'Reduces all skill mana costs and increases mana regeneration.',
      type: 'passive',
      icon: Sparkles,
      position: { x: 700, y: 500 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 2,
      prerequisites: ['dominators_touch'],
      effects: ['-25% Mana Cost', '+100% Mana Regen'],
      isUnlocked: false,
      canAfford: false
    },
    // Ultimate Skills - Far positions
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      description: 'Command your shadow army to overwhelm enemies with coordinated attacks.',
      type: 'active',
      icon: Users,
      position: { x: 400, y: 100 },
      maxLevel: 3,
      currentLevel: 0,
      cost: 5,
      prerequisites: ['critical_mastery', 'mana_efficiency'],
      requiredLevel: 30,
      effects: ['Ultimate Ability', 'Shadow Army'],
      isUnlocked: false,
      canAfford: false
    }
  ]);

  // Update skill affordability based on player skill points
  useEffect(() => {
    setSkills(prevSkills => 
      prevSkills.map(skill => ({
        ...skill,
        canAfford: playerData.unspentSkillPoints >= skill.cost &&
                  (!skill.requiredLevel || playerData.level >= skill.requiredLevel) &&
                  (!skill.prerequisites || skill.prerequisites.every(prereqId => 
                    prevSkills.find(s => s.id === prereqId)?.isUnlocked))
      }))
    );
  }, [playerData.unspentSkillPoints, playerData.level]);

  const allocateStatPoint = (stat: keyof CoreStats) => {
    if (playerData.unspentStatPoints <= 0) return;
    
    const newStats = { ...playerData.stats };
    newStats[stat] += 1;
    
    // Calculate derived stats
    const healthBonus = stat === 'vitality' ? 20 : 0;
    const manaBonus = stat === 'intelligence' ? 15 : 0;
    
    onUpdatePlayer({
      stats: newStats,
      unspentStatPoints: playerData.unspentStatPoints - 1,
      maxHealth: playerData.maxHealth + healthBonus,
      maxMana: playerData.maxMana + manaBonus,
      health: playerData.health + healthBonus,
      mana: playerData.mana + manaBonus
    });
  };

  const unlockSkill = (skill: Skill) => {
    if (!skill.canAfford || skill.isUnlocked) return;
    
    const updatedSkills = skills.map(s => 
      s.id === skill.id 
        ? { ...s, isUnlocked: true, currentLevel: 1 }
        : s
    );
    
    setSkills(updatedSkills);
    onUpdatePlayer({
      unspentSkillPoints: playerData.unspentSkillPoints - skill.cost
    });
    
    setSelectedSkill(null);
  };

  const upgradeSkill = (skill: Skill) => {
    if (!skill.canAfford || skill.currentLevel >= skill.maxLevel) return;
    
    const updatedSkills = skills.map(s => 
      s.id === skill.id 
        ? { ...s, currentLevel: s.currentLevel + 1 }
        : s
    );
    
    setSkills(updatedSkills);
    onUpdatePlayer({
      unspentSkillPoints: playerData.unspentSkillPoints - skill.cost
    });
    
    setSelectedSkill(null);
  };

  const getStatIcon = (stat: keyof CoreStats) => {
    switch (stat) {
      case 'strength': return Sword;
      case 'agility': return Wind;
      case 'vitality': return Heart;
      case 'intelligence': return Brain;
      case 'sense': return Eye;
      default: return Sword;
    }
  };

  const getStatColor = (stat: keyof CoreStats) => {
    switch (stat) {
      case 'strength': return 'text-red-400';
      case 'agility': return 'text-green-400';
      case 'vitality': return 'text-blue-400';
      case 'intelligence': return 'text-purple-400';
      case 'sense': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-7xl h-[90vh] mx-4 flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Enhanced Header with Power Level Display */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 relative overflow-hidden">
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-amber-900/20" />
          
          <div className="flex items-center gap-6 relative z-10">
            {/* Animated Power Core */}
            <motion.div 
              className="relative"
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(147, 51, 234, 0.5)',
                  '0 0 30px rgba(245, 158, 11, 0.6)',
                  '0 0 20px rgba(147, 51, 234, 0.5)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 flex items-center justify-center relative">
                <Crown className="w-8 h-8 text-white" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 opacity-20 animate-ping" />
              </div>
            </motion.div>
            
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                Monarch's Command
              </h2>
              <p className="text-slate-400 text-lg">Character Progression System</p>
            </div>
          </div>

          {/* Power Level Indicator */}
          <div className="flex items-center gap-4 relative z-10">
            <div className="text-right">
              <div className="text-sm text-slate-400">Total Power Level</div>
              <div className="text-2xl font-bold text-amber-400">
                {Object.values(playerData.stats).reduce((sum, stat) => sum + stat, 0) * playerData.level}
              </div>
            </div>
            
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600/30 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            Core Stats
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-6 py-4 font-medium transition-colors ${
              activeTab === 'skills'
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            Monarch's Constellation
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'stats' && (
            <div className="h-full overflow-y-auto character-scrollbar p-3 md:p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Enhanced Hunter Profile Card */}
                <motion.div 
                  className="relative rounded-xl p-4 md:p-6 border overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/20 to-amber-500/20" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-purple-500/20 rounded-full animate-pulse" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent mb-6">
                      Hunter Profile
                    </h3>
                    
                    {/* Profile Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-sm text-slate-400 mb-1">Hunter Name</div>
                        <div className="text-xl font-bold text-white">{playerData.name}</div>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-sm text-slate-400 mb-1">Hunter Rank</div>
                        <div className="text-xl font-bold text-amber-400">{playerData.hunterRank}</div>
                      </motion.div>
                      
                      <motion.div 
                        className="text-center p-4 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="text-sm text-slate-400 mb-1">Level</div>
                        <div className="text-2xl font-bold text-purple-400">{playerData.level}</div>
                      </motion.div>
                    </div>
                    
                    {/* Enhanced Progress Bars */}
                    <div className="space-y-4">
                      {/* Experience Bar with Glow Effect */}
                      <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                          <span className="font-medium">Experience Progress</span>
                          <span className="text-purple-300">{playerData.experience}/{playerData.maxExperience}</span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                            <motion.div 
                              className="bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 h-3 rounded-full relative"
                              style={{ width: `${(playerData.experience / playerData.maxExperience) * 100}%` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(playerData.experience / playerData.maxExperience) * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </motion.div>
                          </div>
                          <div className="absolute inset-0 rounded-full shadow-inner" />
                        </div>
                      </div>

                      {/* Health and Mana with Enhanced Styling */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between text-sm text-red-300 mb-2">
                            <span className="font-medium flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              Health
                            </span>
                            <span>{playerData.health}/{playerData.maxHealth}</span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-red-600 to-red-400 h-3 rounded-full relative"
                                style={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }}
                                transition={{ duration: 1, delay: 0.7 }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              </motion.div>
                            </div>
                            <div className="absolute inset-0 rounded-full shadow-inner" />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm text-blue-300 mb-2">
                            <span className="font-medium flex items-center gap-1">
                              <Zap className="w-4 h-4" />
                              Mana
                            </span>
                            <span>{playerData.mana}/{playerData.maxMana}</span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                              <motion.div 
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-3 rounded-full relative"
                                style={{ width: `${(playerData.mana / playerData.maxMana) * 100}%` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(playerData.mana / playerData.maxMana) * 100}%` }}
                                transition={{ duration: 1, delay: 0.9 }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                              </motion.div>
                            </div>
                            <div className="absolute inset-0 rounded-full shadow-inner" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Points Available */}
                {(playerData.unspentStatPoints > 0 || playerData.unspentSkillPoints > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-xl p-4 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-6 h-6 text-amber-400" />
                      <div>
                        <h4 className="text-amber-300 font-bold">Points Available!</h4>
                        <p className="text-slate-300 text-sm">
                          {playerData.unspentStatPoints} Stat Points • {playerData.unspentSkillPoints} Skill Points
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Enhanced Core Stats Interface */}
                <motion.div 
                  className="relative rounded-xl border overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* Header with Available Points */}
                  <div className="p-6 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-amber-300 bg-clip-text text-transparent">
                        Core Attributes
                      </h3>
                      {playerData.unspentStatPoints > 0 && (
                        <motion.div 
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/20 to-amber-600/20 border border-amber-400/30"
                          animate={{ 
                            boxShadow: [
                              '0 0 0 rgba(245, 158, 11, 0)',
                              '0 0 10px rgba(245, 158, 11, 0.3)',
                              '0 0 0 rgba(245, 158, 11, 0)'
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-bold text-sm">
                            {playerData.unspentStatPoints} Points Available
                          </span>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="p-3 md:p-6">
                    <div className="grid gap-4">
                      {Object.entries(playerData.stats || {}).length > 0 ? 
                        Object.entries(playerData.stats || {}).map(([statKey, value], index) => {
                          const IconComponent = getStatIcon(statKey as keyof CoreStats);
                          const colorClass = getStatColor(statKey as keyof CoreStats);
                          
                          return (
                            <motion.div 
                              key={statKey}
                              className="relative group"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 + index * 0.1 }}
                            >
                              <div 
                                className="flex items-center justify-between p-4 rounded-xl border transition-all duration-300 group-hover:shadow-lg"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.4) 0%, rgba(30, 41, 59, 0.6) 100%)',
                                  border: '1px solid rgba(148, 163, 184, 0.2)'
                                }}
                              >
                                <div className="flex items-center gap-4">
                                  <motion.div 
                                    className="relative"
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <div 
                                      className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${colorClass.replace('text-', 'border-')} bg-gradient-to-br from-slate-700/50 to-slate-800/50`}
                                      style={{
                                        boxShadow: `0 0 20px ${colorClass.includes('red') ? 'rgba(239, 68, 68, 0.3)' :
                                                                colorClass.includes('green') ? 'rgba(34, 197, 94, 0.3)' :
                                                                colorClass.includes('blue') ? 'rgba(59, 130, 246, 0.3)' :
                                                                colorClass.includes('purple') ? 'rgba(147, 51, 234, 0.3)' :
                                                                'rgba(245, 158, 11, 0.3)'}`
                                      }}
                                    >
                                      <IconComponent className={`w-6 h-6 ${colorClass}`} />
                                    </div>
                                  </motion.div>
                                  
                                  <div>
                                    <h4 className="text-lg font-bold text-white capitalize mb-1">{statKey}</h4>
                                    <p className="text-xs text-slate-400 max-w-xs">
                                      {statKey === 'strength' && 'Increases physical damage and carrying capacity'}
                                      {statKey === 'agility' && 'Improves attack speed and critical hit chance'}
                                      {statKey === 'vitality' && 'Boosts health points and defensive capabilities'}
                                      {statKey === 'intelligence' && 'Enhances mana pool and magical damage'}
                                      {statKey === 'sense' && 'Sharpens detection abilities and weak point identification'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col items-center">
                                    <motion.div 
                                      className="text-3xl font-bold text-white mb-1"
                                      key={`${statKey}-${value}`}
                                      initial={{ scale: 1.3, color: '#fbbf24' }}
                                      animate={{ scale: 1, color: '#ffffff' }}
                                      transition={{ duration: 0.5, type: "spring" }}
                                    >
                                      {value}
                                    </motion.div>
                                    
                                    <div className="flex gap-1">
                                      {[...Array(Math.min(10, value))].map((_, i) => (
                                        <motion.div
                                          key={i}
                                          className={`w-1 h-3 rounded-full ${colorClass.replace('text-', 'bg-')}`}
                                          initial={{ height: 0 }}
                                          animate={{ height: 12 }}
                                          transition={{ delay: 0.8 + i * 0.05 }}
                                        />
                                      ))}
                                      {value > 10 && (
                                        <div className="text-xs text-slate-400 ml-1">+{value - 10}</div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {playerData.unspentStatPoints > 0 && (
                                    <motion.div
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                    >
                                      <Button
                                        onClick={() => allocateStatPoint(statKey as keyof CoreStats)}
                                        className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 border border-purple-400/30 shadow-lg transition-all duration-200"
                                        style={{
                                          boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                        }}
                                      >
                                        <Plus className="w-5 h-5 text-white" />
                                      </Button>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      : (
                        <div className="text-center py-8">
                          <div className="text-slate-400">No stats available</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="h-full flex">
              {/* Skill Constellation View */}
              <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-purple-900/30">
                {/* Constellation Background */}
                <div className="absolute inset-0">
                  {/* Starfield effect */}
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-30"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`
                      }}
                    />
                  ))}
                </div>

                {/* Skills Container */}
                <div 
                  className="relative w-full h-full"
                  style={{
                    transform: `scale(${constellationZoom}) translate(${constellationPan.x}px, ${constellationPan.y}px)`
                  }}
                >
                  {/* Skill Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {skills.map(skill => 
                      skill.prerequisites?.map(prereqId => {
                        const prereq = skills.find(s => s.id === prereqId);
                        if (!prereq) return null;
                        
                        return (
                          <line
                            key={`${skill.id}-${prereqId}`}
                            x1={prereq.position.x}
                            y1={prereq.position.y}
                            x2={skill.position.x}
                            y2={skill.position.y}
                            stroke="rgba(147, 51, 234, 0.4)"
                            strokeWidth="2"
                            strokeDasharray={skill.isUnlocked ? "0" : "5,5"}
                          />
                        );
                      })
                    )}
                  </svg>

                  {/* Skill Nodes */}
                  {skills.map(skill => {
                    const IconComponent = skill.icon;
                    
                    return (
                      <motion.div
                        key={skill.id}
                        className="absolute cursor-pointer"
                        style={{
                          left: skill.position.x - 30,
                          top: skill.position.y - 30
                        }}
                        onClick={() => setSelectedSkill(skill)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Skill Node */}
                        <div
                          className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative ${
                            skill.isUnlocked
                              ? 'bg-gradient-to-br from-purple-600 to-amber-500 border-amber-400 shadow-lg shadow-purple-500/50'
                              : skill.canAfford
                              ? 'bg-gradient-to-br from-purple-700/50 to-purple-600/50 border-purple-400 animate-pulse'
                              : 'bg-slate-700/50 border-slate-600'
                          }`}
                        >
                          <IconComponent 
                            className={`w-6 h-6 ${
                              skill.isUnlocked ? 'text-white' : 
                              skill.canAfford ? 'text-purple-300' : 
                              'text-slate-500'
                            }`} 
                          />
                          
                          {/* Level indicator */}
                          {skill.isUnlocked && skill.currentLevel > 0 && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                              {skill.currentLevel}
                            </div>
                          )}
                        </div>
                        
                        {/* Skill Name */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                          <div className={`text-xs font-medium whitespace-nowrap ${
                            skill.isUnlocked ? 'text-amber-300' : 
                            skill.canAfford ? 'text-purple-300' : 
                            'text-slate-500'
                          }`}>
                            {skill.name}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <Button
                    onClick={() => setConstellationZoom(Math.min(2, constellationZoom + 0.2))}
                    size="sm"
                    className="bg-slate-700/80 hover:bg-slate-600/80"
                  >
                    +
                  </Button>
                  <Button
                    onClick={() => setConstellationZoom(Math.max(0.5, constellationZoom - 0.2))}
                    size="sm"
                    className="bg-slate-700/80 hover:bg-slate-600/80"
                  >
                    −
                  </Button>
                </div>
              </div>

              {/* Skill Details Panel */}
              {selectedSkill && (
                <motion.div
                  initial={{ x: 400, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 400, opacity: 0 }}
                  className="w-96 bg-slate-800/95 border-l border-slate-700/50 p-6 overflow-y-auto constellation-scrollbar"
                >
                  <div className="space-y-6">
                    {/* Skill Header */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                        selectedSkill.isUnlocked
                          ? 'bg-gradient-to-br from-purple-600 to-amber-500 border-amber-400'
                          : 'bg-slate-700 border-slate-600'
                      }`}>
                        <selectedSkill.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedSkill.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedSkill.type === 'active' 
                              ? 'bg-red-900/50 text-red-300 border border-red-700/50'
                              : 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                          }`}>
                            {selectedSkill.type === 'active' ? 'Active Skill' : 'Passive Skill'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Description</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{selectedSkill.description}</p>
                    </div>

                    {/* Effects */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Effects</h4>
                      <div className="space-y-1">
                        {selectedSkill.effects.map((effect, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-amber-400" />
                            <span className="text-slate-300 text-sm">{effect}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Level Progress */}
                    {selectedSkill.isUnlocked && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Level Progress</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-amber-500 h-2 rounded-full"
                              style={{ width: `${(selectedSkill.currentLevel / selectedSkill.maxLevel) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-300">
                            {selectedSkill.currentLevel}/{selectedSkill.maxLevel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Prerequisites */}
                    {selectedSkill.prerequisites && selectedSkill.prerequisites.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Prerequisites</h4>
                        <div className="space-y-1">
                          {selectedSkill.prerequisites.map(prereqId => {
                            const prereq = skills.find(s => s.id === prereqId);
                            return prereq ? (
                              <div key={prereqId} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${prereq.isUnlocked ? 'bg-green-400' : 'bg-red-400'}`} />
                                <span className={`text-sm ${prereq.isUnlocked ? 'text-green-300' : 'text-red-300'}`}>
                                  {prereq.name}
                                </span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {/* Level Requirement */}
                    {selectedSkill.requiredLevel && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Level Requirement</h4>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${playerData.level >= selectedSkill.requiredLevel ? 'bg-green-400' : 'bg-red-400'}`} />
                          <span className={`text-sm ${playerData.level >= selectedSkill.requiredLevel ? 'text-green-300' : 'text-red-300'}`}>
                            Level {selectedSkill.requiredLevel}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {!selectedSkill.isUnlocked ? (
                        <Button
                          onClick={() => unlockSkill(selectedSkill)}
                          disabled={!selectedSkill.canAfford}
                          className={`w-full ${
                            selectedSkill.canAfford
                              ? 'bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600'
                              : 'bg-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {selectedSkill.canAfford 
                            ? `Unlock (${selectedSkill.cost} SP)` 
                            : 'Cannot Unlock'
                          }
                        </Button>
                      ) : selectedSkill.currentLevel < selectedSkill.maxLevel ? (
                        <Button
                          onClick={() => upgradeSkill(selectedSkill)}
                          disabled={!selectedSkill.canAfford}
                          className={`w-full ${
                            selectedSkill.canAfford
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                              : 'bg-slate-700 cursor-not-allowed'
                          }`}
                        >
                          {selectedSkill.canAfford 
                            ? `Upgrade (${selectedSkill.cost} SP)` 
                            : 'Cannot Upgrade'
                          }
                        </Button>
                      ) : (
                        <div className="text-center py-2 text-green-400 font-medium">
                          Max Level Reached
                        </div>
                      )}
                      
                      <Button
                        onClick={() => setSelectedSkill(null)}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}