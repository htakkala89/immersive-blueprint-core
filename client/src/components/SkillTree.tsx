import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Zap, Sword, Shield, Eye, Users, Crown } from "lucide-react";
import type { GameState, Skill, CharacterStats } from "@shared/schema";

interface SkillTreeProps {
  gameState: GameState;
  onUpgradeSkill: (skillId: string) => void;
  onAllocateStat: (stat: keyof CharacterStats) => void;
  onLevelUp: () => void;
  isVisible: boolean;
  onClose: () => void;
}

const SKILL_ICONS = {
  "shadow-extraction": Crown,
  "dagger-mastery": Sword,
  "stealth": Eye,
  "shadow-armor": Shield,
  "shadow-exchange": Users,
  "monarch-domain": Zap,
};

const STAT_ICONS = {
  strength: Sword,
  agility: Zap,
  intelligence: Eye,
  vitality: Shield,
  sense: Users,
};

export function SkillTree({ 
  gameState, 
  onUpgradeSkill, 
  onAllocateStat, 
  onLevelUp, 
  isVisible, 
  onClose 
}: SkillTreeProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'stats'>('skills');
  
  if (!isVisible) return null;

  const expNeeded = gameState.level * 100;
  const expProgress = (gameState.experience / expNeeded) * 100;
  const canLevelUp = gameState.experience >= expNeeded;

  const getSkillIcon = (skillId: string) => {
    const IconComponent = SKILL_ICONS[skillId as keyof typeof SKILL_ICONS] || Crown;
    return <IconComponent className="w-6 h-6" />;
  };

  const getStatIcon = (stat: keyof CharacterStats) => {
    const IconComponent = STAT_ICONS[stat];
    return <IconComponent className="w-5 h-5" />;
  };

  const getSkillRarityColor = (skill: Skill) => {
    if (skill.type === 'ultimate') return 'bg-purple-500';
    if (skill.type === 'active') return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900/95 border-purple-500/30">
        <CardHeader className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-400" />
                Shadow Monarch Progression
              </CardTitle>
              <CardDescription className="text-purple-200">
                Level {gameState.level} • {gameState.skillPoints} Skill Points • {gameState.statPoints} Stat Points
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              ✕
            </Button>
          </div>
          
          {/* Experience Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-purple-200 mb-2">
              <span>Experience</span>
              <span>{gameState.experience} / {expNeeded}</span>
            </div>
            <Progress value={expProgress} className="h-2 bg-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                style={{ width: `${expProgress}%` }}
              />
            </Progress>
            {canLevelUp && (
              <Button 
                onClick={onLevelUp}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                Level Up!
              </Button>
            )}
          </div>
        </CardHeader>

        <div className="flex border-b border-purple-500/30">
          <Button
            variant={activeTab === 'skills' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('skills')}
            className={`rounded-none flex-1 ${
              activeTab === 'skills' 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-200 hover:bg-purple-900/30'
            }`}
          >
            <Crown className="w-4 h-4 mr-2" />
            Skills
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('stats')}
            className={`rounded-none flex-1 ${
              activeTab === 'stats' 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-200 hover:bg-purple-900/30'
            }`}
          >
            <Sword className="w-4 h-4 mr-2" />
            Stats
          </Button>
        </div>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'skills' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Shadow Monarch Skills</h3>
              <div className="grid gap-4">
                {gameState.skills.map((skill) => (
                  <Card key={skill.id} className="bg-slate-800/50 border-purple-500/20 hover:border-purple-400/40 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${getSkillRarityColor(skill)} bg-opacity-20`}>
                            {getSkillIcon(skill.id)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{skill.name}</h4>
                              <Badge 
                                variant={skill.type === 'ultimate' ? 'default' : 'secondary'}
                                className={`${
                                  skill.type === 'ultimate' 
                                    ? 'bg-purple-600 text-white' 
                                    : skill.type === 'active'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-green-600 text-white'
                                }`}
                              >
                                {skill.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-purple-200 mb-2">{skill.description}</p>
                            <div className="flex items-center gap-4 text-xs text-purple-300">
                              <span>Level {skill.level}/{skill.maxLevel}</span>
                              {skill.manaCost && <span>Mana: {skill.manaCost}</span>}
                              {skill.cooldown && <span>Cooldown: {skill.cooldown}s</span>}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {skill.level < skill.maxLevel ? (
                            <Button
                              size="sm"
                              onClick={() => onUpgradeSkill(skill.id)}
                              disabled={gameState.skillPoints < 1}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Upgrade
                            </Button>
                          ) : (
                            <Badge variant="outline" className="border-green-400 text-green-400">
                              MAX
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Character Stats</h3>
              <div className="grid gap-4">
                {Object.entries(gameState.stats).map(([stat, value]) => (
                  <Card key={stat} className="bg-slate-800/50 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-purple-600/20">
                            {getStatIcon(stat as keyof CharacterStats)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white capitalize">{stat}</h4>
                            <p className="text-sm text-purple-200">
                              {stat === 'strength' && 'Increases physical damage and carrying capacity'}
                              {stat === 'agility' && 'Increases attack speed and movement speed'}
                              {stat === 'intelligence' && 'Increases mana capacity and magical damage'}
                              {stat === 'vitality' && 'Increases health and health regeneration'}
                              {stat === 'sense' && 'Increases perception and critical hit chance'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-white">{value}</span>
                          <Button
                            size="sm"
                            onClick={() => onAllocateStat(stat as keyof CharacterStats)}
                            disabled={gameState.statPoints < 1}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            +1
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}