import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Crown, Sword, Zap, Heart, Eye, Brain, 
  Plus, Star, Sparkles, Target, Shield,
  Wind, Flame, Bolt, Users, X, Package
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
  onOpenInventory?: () => void;
  onOpenArmory?: () => void;
}

export function PlayerProgressionSystem16({
  isVisible,
  onClose,
  playerData,
  onUpdatePlayer,
  onOpenInventory,
  onOpenArmory
}: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'equipment'>('stats');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-7xl h-[98vh] sm:h-[90vh] mx-2 sm:mx-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(51, 65, 85, 0.9) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 flex items-center justify-center">
              <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-white">Character Command</h2>
              <p className="text-xs sm:text-sm text-slate-400">Player Progression & Skills</p>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-red-600/30 min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === 'stats'
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Core Stats</span>
            <span className="sm:hidden">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === 'skills'
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Monarch's Constellation</span>
            <span className="lg:hidden">Skills</span>
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === 'equipment'
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-900/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            <Package className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Equipment</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'stats' && (
            <div className="h-full overflow-y-auto character-scrollbar p-3 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                {/* Player Info */}
                <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700/50">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Hunter Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Name:</span>
                      <span className="text-white font-medium">{playerData.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Rank:</span>
                      <span className="text-amber-400 font-medium">{playerData.hunterRank}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Level:</span>
                      <span className="text-purple-400 font-bold text-lg">{playerData.level}</span>
                    </div>
                  </div>
                  
                  {/* Experience Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-slate-300 mb-1">
                      <span>Experience</span>
                      <span>{playerData.experience}/{playerData.maxExperience}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(playerData.experience / playerData.maxExperience) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Health and Mana */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm text-red-300 mb-1">
                        <span>Health</span>
                        <span>{playerData.health}/{playerData.maxHealth}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(playerData.health / playerData.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm text-blue-300 mb-1">
                        <span>Mana</span>
                        <span>{playerData.mana}/{playerData.maxMana}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(playerData.mana / playerData.maxMana) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Points Available */}
                {(playerData.unspentStatPoints > 0 || playerData.unspentSkillPoints > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-xl p-3 sm:p-4 border border-purple-500/30"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                      <div>
                        <h4 className="text-amber-300 font-bold text-sm sm:text-base">Points Available!</h4>
                        <p className="text-slate-300 text-xs sm:text-sm">
                          {playerData.unspentStatPoints} Stat Points • {playerData.unspentSkillPoints} Skill Points
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Core Stats */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="p-4 sm:p-6 pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Core Stats</h3>
                  </div>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 max-h-80 sm:max-h-96 overflow-y-auto character-scrollbar">
                    <div className="space-y-2 sm:space-y-3">
                    {Object.entries(playerData.stats).map(([statKey, value]) => {
                      const IconComponent = getStatIcon(statKey as keyof CoreStats);
                      const colorClass = getStatColor(statKey as keyof CoreStats);
                      
                      return (
                        <div key={statKey} className="flex items-center justify-between p-2 sm:p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${colorClass} flex-shrink-0`} />
                            <div className="min-w-0 flex-1">
                              <span className="text-white font-medium capitalize text-sm sm:text-base">{statKey}</span>
                              <div className="text-xs text-slate-400 hidden sm:block">
                                {statKey === 'strength' && 'Physical damage & carrying capacity'}
                                {statKey === 'agility' && 'Attack speed & critical chance'}
                                {statKey === 'vitality' && 'Health & defense'}
                                {statKey === 'intelligence' && 'Mana & magical damage'}
                                {statKey === 'sense' && 'Detection & weak point identification'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <motion.span 
                              className="text-xl sm:text-2xl font-bold text-white"
                              key={`${statKey}-${value}`}
                              initial={{ scale: 1.2, color: '#fbbf24' }}
                              animate={{ scale: 1, color: '#ffffff' }}
                              transition={{ duration: 0.3 }}
                            >
                              {value}
                            </motion.span>
                            {playerData.unspentStatPoints > 0 && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  onClick={() => allocateStatPoint(statKey as keyof CoreStats)}
                                  size="sm"
                                  className="bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 w-8 h-8 sm:w-9 sm:h-9 p-0 shadow-lg border border-purple-400/30 min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px]"
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Skill Constellation View */}
              <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900/50 to-purple-900/30 min-h-[300px] lg:min-h-0">
                {/* Constellation Background */}
                <div className="absolute inset-0">
                  {/* Starfield effect */}
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
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
                  className="relative w-full h-full overflow-auto"
                  style={{
                    transform: `scale(${Math.max(0.4, constellationZoom * 0.8)}) translate(${constellationPan.x}px, ${constellationPan.y}px)`
                  }}
                >
                  {/* Skill Connection Lines */}
                  <svg className="absolute inset-0 pointer-events-none" style={{ width: '800px', height: '600px' }}>
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
                  <div className="relative" style={{ width: '800px', height: '600px' }}>
                    {skills.map(skill => {
                      const IconComponent = skill.icon;
                      
                      return (
                        <motion.div
                          key={skill.id}
                          className="absolute cursor-pointer touch-manipulation"
                          style={{
                            left: skill.position.x - 24,
                            top: skill.position.y - 24
                          }}
                          onClick={() => setSelectedSkill(skill)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Skill Node */}
                          <div
                            className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full border-2 flex items-center justify-center relative ${
                              skill.isUnlocked
                                ? 'bg-gradient-to-br from-purple-600 to-amber-500 border-amber-400 shadow-lg shadow-purple-500/50'
                                : skill.canAfford
                                ? 'bg-gradient-to-br from-purple-700/50 to-purple-600/50 border-purple-400 animate-pulse'
                                : 'bg-slate-700/50 border-slate-600'
                            }`}
                          >
                            <IconComponent 
                              className={`w-5 h-5 lg:w-6 lg:h-6 ${
                                skill.isUnlocked ? 'text-white' : 
                                skill.canAfford ? 'text-purple-300' : 
                                'text-slate-500'
                              }`} 
                            />
                            
                            {/* Level indicator */}
                            {skill.isUnlocked && skill.currentLevel > 0 && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-amber-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
                                {skill.currentLevel}
                              </div>
                            )}
                          </div>
                          
                          {/* Skill Name */}
                          <div className="absolute -bottom-6 lg:-bottom-8 left-1/2 transform -translate-x-1/2 text-center max-w-20 lg:max-w-24">
                            <div className={`text-xs font-medium leading-tight ${
                              skill.isUnlocked ? 'text-amber-300' : 
                              skill.canAfford ? 'text-purple-300' : 
                              'text-slate-500'
                            }`}>
                              {skill.name.split(' ').slice(0, 2).join(' ')}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Zoom Controls */}
                <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 flex flex-col gap-1 lg:gap-2">
                  <Button
                    onClick={() => setConstellationZoom(Math.min(2, constellationZoom + 0.2))}
                    size="sm"
                    className="bg-slate-700/80 hover:bg-slate-600/80 w-8 h-8 p-0 text-xs"
                  >
                    +
                  </Button>
                  <Button
                    onClick={() => setConstellationZoom(Math.max(0.5, constellationZoom - 0.2))}
                    size="sm"
                    className="bg-slate-700/80 hover:bg-slate-600/80 w-8 h-8 p-0 text-xs"
                  >
                    −
                  </Button>
                </div>

                {/* Mobile Skills Summary */}
                <div className="lg:hidden absolute top-3 left-3 right-3 bg-slate-800/80 backdrop-blur-sm rounded-lg p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Available Skills</span>
                    <span className="text-purple-300 font-medium">{skills.filter(s => s.canAfford).length} Ready</span>
                  </div>
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

          {activeTab === 'equipment' && (
            <div className="h-full overflow-y-auto character-scrollbar p-2 sm:p-6">
              <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-6">
                {/* Equipment Management Header */}
                <div className="bg-slate-800/50 rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <h3 className="text-base sm:text-xl font-bold text-white mb-2 sm:mb-4">Equipment Management</h3>
                  <p className="text-slate-300 mb-3 sm:mb-6 text-xs sm:text-base leading-relaxed">
                    Manage your inventory, equipment, and armory from this central hub.
                  </p>

                  {/* Equipment Action Cards - Mobile Optimized */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Inventory Card */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-500/30 cursor-pointer min-h-[60px] sm:min-h-[120px]"
                      onClick={() => {
                        onClose();
                        onOpenInventory?.();
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-lg font-bold text-white">Inventory</h4>
                          <p className="text-purple-200 text-xs sm:text-sm">Items & Resources</p>
                          <p className="text-slate-300 text-xs hidden sm:block mt-1">
                            Access consumables, materials, quest items
                          </p>
                        </div>
                        <div className="text-purple-300 text-lg font-light">
                          →
                        </div>
                      </div>
                    </motion.div>

                    {/* Armory Card */}
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="bg-gradient-to-br from-amber-900/40 to-amber-800/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-500/30 cursor-pointer min-h-[60px] sm:min-h-[120px]"
                      onClick={() => {
                        onClose();
                        onOpenArmory?.();
                      }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-lg font-bold text-white">Armory</h4>
                          <p className="text-amber-200 text-xs sm:text-sm">Weapons & Equipment</p>
                          <p className="text-slate-300 text-xs hidden sm:block mt-1">
                            Equip weapons, armor, accessories
                          </p>
                        </div>
                        <div className="text-amber-300 text-lg font-light">
                          →
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Quick Equipment Overview - Mobile Optimized */}
                <div className="bg-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-6 border border-slate-700/50">
                  <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-purple-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Inventory Items</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-300">24</p>
                          <p className="text-slate-400 text-xs">Items stored</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sword className="w-4 h-4 text-amber-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Equipped Items</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-amber-300">6</p>
                          <p className="text-slate-400 text-xs">Currently equipped</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-green-300 flex-shrink-0" />
                          <span className="text-white font-medium text-sm">Equipment Power</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-300">S+</p>
                          <p className="text-slate-400 text-xs">Overall rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}