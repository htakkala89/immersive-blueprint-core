import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  X, Star, Lock, CheckCircle, TrendingUp, Zap, Shield, Sword, Brain, Users, 
  Crown, Eye, Ghost, Flame, Target, Bolt, Swords, UserPlus 
} from "lucide-react";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GameState, SkillNode, CharacterProgression } from "@shared/schema";

interface EnhancedSkillTreeProps {
  gameState: GameState;
  onClose: () => void;
  sessionId: string;
}

export function EnhancedSkillTree({ gameState, onClose, sessionId }: EnhancedSkillTreeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("shadow");
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const queryClient = useQueryClient();

  // Fetch skill tree data
  const { data: skillTree, isLoading: skillTreeLoading } = useQuery<Record<string, SkillNode>>({
    queryKey: [`/api/skill-tree/${sessionId}`],
  });

  // Fetch character progression
  const { data: progression, isLoading: progressionLoading } = useQuery<CharacterProgression>({
    queryKey: [`/api/character-progression/${sessionId}`],
  });

  // Unlock skill mutation
  const unlockSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const response = await apiRequest('POST', '/api/unlock-skill', {
        sessionId,
        skillId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/skill-tree/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/character-progression/${sessionId}`] });
    }
  });

  // Add experience mutation (for testing)
  const addExperienceMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest('POST', '/api/add-experience', {
        sessionId,
        amount,
        source: "skill tree test"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/game-state/${sessionId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/character-progression/${sessionId}`] });
    }
  });

  const categories = [
    { id: "shadow", name: "Shadow Arts", icon: Ghost, color: "purple" },
    { id: "combat", name: "Combat", icon: Sword, color: "red" },
    { id: "physical", name: "Physical", icon: Zap, color: "orange" },
    { id: "mental", name: "Mental", icon: Brain, color: "blue" },
    { id: "leadership", name: "Leadership", icon: Users, color: "green" }
  ];

  const getSkillIcon = (skillId: string) => {
    const iconMap: Record<string, any> = {
      shadow_extraction: Ghost,
      dagger_mastery: Swords,
      enhanced_strength: Zap,
      stealth: Eye,
      shadow_preservation: Shield,
      shadow_storage: Target,
      enhanced_agility: Lightning,
      shadow_exchange: Flame,
      shadow_armor: Shield,
      enhanced_senses: Eye,
      shadow_army: Users,
      murderous_intent: Flame,
      monarch_domain: Crown,
      shadow_monarch: Crown,
      necromancer: Ghost,
      shadow_knight: Sword,
      tactical_command: UserPlus,
      inspiring_presence: Star
    };
    return iconMap[skillId] || Star;
  };

  const getSkillsByCategory = (category: string): SkillNode[] => {
    if (!skillTree) return [];
    return Object.values(skillTree).filter(skill => skill.category === category);
  };

  const getSkillCost = (skill: SkillNode): number => {
    const baseCost = skill.tier;
    return baseCost + Math.floor(skill.level * 1.5);
  };

  const canUnlockSkill = (skill: SkillNode): boolean => {
    if (!gameState || !skillTree) return false;
    
    // Check if skill is already at max level
    if (skill.level >= skill.maxLevel) return false;
    
    // Check if player has enough skill points
    const cost = getSkillCost(skill);
    if (gameState.skillPoints < cost) return false;
    
    // Check prerequisites
    const unlockedSkills = gameState.skills.filter(s => s.level > 0).map(s => s.id);
    const prerequisitesMet = skill.prerequisites.every(prereq => unlockedSkills.includes(prereq));
    
    return prerequisitesMet;
  };

  const handleUnlockSkill = (skillId: string) => {
    unlockSkillMutation.mutate(skillId);
  };

  const renderSkillGrid = (skills: SkillNode[]) => {
    // Group skills by tier
    const skillsByTier = skills.reduce((acc, skill) => {
      if (!acc[skill.tier]) acc[skill.tier] = [];
      acc[skill.tier].push(skill);
      return acc;
    }, {} as Record<number, SkillNode[]>);

    const maxTier = Math.max(...Object.keys(skillsByTier).map(Number));

    return (
      <div className="space-y-8">
        {Array.from({ length: maxTier }, (_, i) => i + 1).map(tier => {
          const tierSkills = skillsByTier[tier] || [];
          return (
            <div key={tier} className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900">
                  Tier {tier}
                </Badge>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tierSkills.map(skill => {
                  const IconComponent = getSkillIcon(skill.id);
                  const isUnlocked = skill.level > 0;
                  const canUnlock = canUnlockSkill(skill);
                  const cost = getSkillCost(skill);

                  return (
                    <Card 
                      key={skill.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedSkill?.id === skill.id ? 'ring-2 ring-purple-500' : ''
                      } ${isUnlocked ? 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950' : ''}`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <CardTitle className="text-sm">{skill.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            {isUnlocked && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {!isUnlocked && !canUnlock && <Lock className="h-4 w-4 text-gray-400" />}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">{skill.description}</p>
                        
                        <div className="flex items-center justify-between text-xs">
                          <span>Level {skill.level}/{skill.maxLevel}</span>
                          <Badge variant="secondary" className="text-xs">
                            {skill.type.charAt(0).toUpperCase() + skill.type.slice(1)}
                          </Badge>
                        </div>

                        {skill.level > 0 && (
                          <Progress value={(skill.level / skill.maxLevel) * 100} className="h-1" />
                        )}

                        {skill.level < skill.maxLevel && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">
                              Cost: {cost} SP
                            </span>
                            <Button
                              size="sm"
                              variant={canUnlock ? "default" : "secondary"}
                              disabled={!canUnlock || unlockSkillMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnlockSkill(skill.id);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              {isUnlocked ? "Upgrade" : "Unlock"}
                            </Button>
                          </div>
                        )}

                        {skill.prerequisites.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Requires: {skill.prerequisites.join(", ")}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (skillTreeLoading || progressionLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-600" />
                Shadow Monarch Skill Tree
              </CardTitle>
              <CardDescription>
                Develop Jin-Woo's abilities across multiple disciplines
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {progression && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{progression.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{progression.experience}</div>
                <div className="text-xs text-muted-foreground">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{gameState.statPoints}</div>
                <div className="text-xs text-muted-foreground">Stat Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{gameState.skillPoints}</div>
                <div className="text-xs text-muted-foreground">Skill Points</div>
              </div>
              <div className="text-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addExperienceMutation.mutate(100)}
                  disabled={addExperienceMutation.isPending}
                >
                  +100 XP (Test)
                </Button>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="p-6 max-h-[60vh] overflow-y-auto">
                {renderSkillGrid(getSkillsByCategory(category.id))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>

        {selectedSkill && (
          <div className="border-t p-4 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="font-semibold flex items-center gap-2">
                  {React.createElement(getSkillIcon(selectedSkill.id), { className: "h-4 w-4" })}
                  {selectedSkill.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedSkill.description}</p>
                
                {Object.keys(selectedSkill.effects).length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium">Effects:</h5>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {Object.entries(selectedSkill.effects).map(([effect, value]) => (
                        <div key={effect} className="text-xs">
                          {effect.replace(/([A-Z])/g, ' $1').toLowerCase()}: +{value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-right space-y-1">
                <div className="text-sm">
                  <span className="text-muted-foreground">Tier:</span> {selectedSkill.tier}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Level:</span> {selectedSkill.level}/{selectedSkill.maxLevel}
                </div>
                {selectedSkill.cooldown && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cooldown:</span> {selectedSkill.cooldown}s
                  </div>
                )}
                {selectedSkill.manaCost && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Mana Cost:</span> {selectedSkill.manaCost}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}