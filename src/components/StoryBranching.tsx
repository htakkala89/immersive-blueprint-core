import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Lock, Star, Crown, Flame } from "lucide-react";

interface StoryPath {
  id: string;
  title: string;
  description: string;
  requirements: {
    affectionLevel: number;
    intimacyLevel?: number;
    trustLevel?: number;
    specificChoices?: string[];
    achievements?: string[];
  };
  unlocked: boolean;
  scenes: string[];
  pathType: 'main' | 'romantic' | 'intimate' | 'friendship' | 'secret';
  consequences: {
    affectionModifier: number;
    storyFlags: string[];
    futureChoicesUnlocked: string[];
  };
}

const STORY_PATHS: StoryPath[] = [
  {
    id: 'main_story',
    title: 'Hunter Partnership',
    description: 'Continue the main storyline as professional partners',
    requirements: { affectionLevel: 0 },
    unlocked: true,
    scenes: ['professional_meeting', 'dungeon_mission', 'hunter_association'],
    pathType: 'main',
    consequences: {
      affectionModifier: 0.5,
      storyFlags: ['professional_path'],
      futureChoicesUnlocked: ['colleague_route']
    }
  },
  {
    id: 'friendship_path',
    title: 'Growing Friendship',
    description: 'Develop a deeper friendship with mutual respect',
    requirements: { affectionLevel: 20, trustLevel: 30 },
    unlocked: false,
    scenes: ['casual_conversation', 'training_together', 'shared_meal'],
    pathType: 'friendship',
    consequences: {
      affectionModifier: 1.0,
      storyFlags: ['friendship_established'],
      futureChoicesUnlocked: ['best_friend_route', 'romantic_transition']
    }
  },
  {
    id: 'romantic_interest',
    title: 'Romantic Tension',
    description: 'Navigate the growing attraction between you',
    requirements: { affectionLevel: 40, intimacyLevel: 25 },
    unlocked: false,
    scenes: ['lingering_glances', 'accidental_touch', 'moment_of_vulnerability'],
    pathType: 'romantic',
    consequences: {
      affectionModifier: 1.5,
      storyFlags: ['romantic_tension'],
      futureChoicesUnlocked: ['confession_scene', 'dating_path']
    }
  },
  {
    id: 'dating_phase',
    title: 'New Relationship',
    description: 'Explore your new romantic relationship',
    requirements: { 
      affectionLevel: 60, 
      intimacyLevel: 40,
      specificChoices: ['confession_accepted']
    },
    unlocked: false,
    scenes: ['first_date', 'official_couple', 'public_acknowledgment'],
    pathType: 'romantic',
    consequences: {
      affectionModifier: 2.0,
      storyFlags: ['officially_dating'],
      futureChoicesUnlocked: ['intimate_moments', 'relationship_milestones']
    }
  },
  {
    id: 'intimate_relationship',
    title: 'Deepening Bond',
    description: 'Experience intimate moments and deeper connection',
    requirements: { 
      affectionLevel: 75, 
      intimacyLevel: 60,
      trustLevel: 70,
      specificChoices: ['ready_for_intimacy']
    },
    unlocked: false,
    scenes: ['intimate_evening', 'private_moments', 'emotional_vulnerability'],
    pathType: 'intimate',
    consequences: {
      affectionModifier: 2.5,
      storyFlags: ['intimate_relationship'],
      futureChoicesUnlocked: ['living_together', 'marriage_consideration']
    }
  },
  {
    id: 'committed_partnership',
    title: 'Life Partners',
    description: 'Build a life together as committed partners',
    requirements: { 
      affectionLevel: 90, 
      intimacyLevel: 80,
      trustLevel: 90,
      achievements: ['deep_connection', 'perfect_choices']
    },
    unlocked: false,
    scenes: ['moving_in_together', 'meeting_families', 'future_planning'],
    pathType: 'romantic',
    consequences: {
      affectionModifier: 3.0,
      storyFlags: ['life_partners'],
      futureChoicesUnlocked: ['marriage_proposal', 'eternal_bond']
    }
  },
  {
    id: 'secret_monarch_path',
    title: 'Shadow Monarch\'s Queen',
    description: 'Cha Hae-In learns about your true power and accepts her role',
    requirements: { 
      affectionLevel: 85, 
      intimacyLevel: 70,
      trustLevel: 95,
      specificChoices: ['reveal_true_power'],
      achievements: ['shadow_monarch']
    },
    unlocked: false,
    scenes: ['power_revelation', 'acceptance_of_truth', 'shadow_queen_awakening'],
    pathType: 'secret',
    consequences: {
      affectionModifier: 4.0,
      storyFlags: ['shadow_queen', 'ultimate_power_couple'],
      futureChoicesUnlocked: ['rule_together', 'protect_world_together']
    }
  }
];

interface StoryChoice {
  id: string;
  text: string;
  pathId: string;
  requirements?: {
    affectionLevel?: number;
    previousChoices?: string[];
    storyFlags?: string[];
  };
  impact: {
    affectionChange: number;
    intimacyChange?: number;
    trustChange?: number;
    pathProgression: number;
  };
  optimalChoice: boolean;
}

const DYNAMIC_CHOICES: Record<string, StoryChoice[]> = {
  'FIRST_MEETING': [
    {
      id: 'professional_greeting',
      text: 'Maintain professional distance',
      pathId: 'main_story',
      impact: { affectionChange: 1, pathProgression: 10 },
      optimalChoice: false
    },
    {
      id: 'warm_greeting',
      text: 'Offer a genuine, warm greeting',
      pathId: 'friendship_path',
      impact: { affectionChange: 3, trustChange: 2, pathProgression: 15 },
      optimalChoice: true
    },
    {
      id: 'charming_greeting',
      text: 'Use your natural charm',
      pathId: 'romantic_interest',
      requirements: { affectionLevel: 5 },
      impact: { affectionChange: 5, intimacyChange: 2, pathProgression: 20 },
      optimalChoice: true
    }
  ],
  'CARING_RESPONSE': [
    {
      id: 'listen_actively',
      text: 'Listen intently to her concerns',
      pathId: 'friendship_path',
      impact: { affectionChange: 4, trustChange: 5, pathProgression: 20 },
      optimalChoice: true
    },
    {
      id: 'offer_support',
      text: 'Offer emotional support',
      pathId: 'romantic_interest',
      requirements: { affectionLevel: 15 },
      impact: { affectionChange: 6, intimacyChange: 3, trustChange: 3, pathProgression: 25 },
      optimalChoice: true
    },
    {
      id: 'protective_instinct',
      text: 'Show protective instincts',
      pathId: 'romantic_interest',
      requirements: { affectionLevel: 20 },
      impact: { affectionChange: 8, intimacyChange: 5, pathProgression: 30 },
      optimalChoice: true
    }
  ],
  'ROMANTIC_MOMENT': [
    {
      id: 'gentle_approach',
      text: 'Take things slowly and gently',
      pathId: 'dating_phase',
      requirements: { affectionLevel: 40 },
      impact: { affectionChange: 5, intimacyChange: 4, trustChange: 6, pathProgression: 25 },
      optimalChoice: true
    },
    {
      id: 'passionate_moment',
      text: 'Express your passionate feelings',
      pathId: 'intimate_relationship',
      requirements: { affectionLevel: 60, intimacyLevel: 30 },
      impact: { affectionChange: 8, intimacyChange: 8, pathProgression: 35 },
      optimalChoice: true
    },
    {
      id: 'respectful_distance',
      text: 'Maintain respectful boundaries',
      pathId: 'friendship_path',
      impact: { affectionChange: 2, trustChange: 8, pathProgression: 15 },
      optimalChoice: false
    }
  ]
};

interface StoryBranchingProps {
  currentScene: string;
  playerStats: {
    affectionLevel: number;
    intimacyLevel: number;
    trustLevel: number;
  };
  unlockedPaths: string[];
  storyFlags: string[];
  onPathChange: (pathId: string) => void;
  onChoiceSelect: (choice: StoryChoice) => void;
}

export function StoryBranching({ 
  currentScene, 
  playerStats, 
  unlockedPaths, 
  storyFlags,
  onPathChange, 
  onChoiceSelect 
}: StoryBranchingProps) {
  const [availablePaths, setAvailablePaths] = useState<StoryPath[]>([]);
  const [dynamicChoices, setDynamicChoices] = useState<StoryChoice[]>([]);

  const checkPathRequirements = (path: StoryPath): boolean => {
    const { requirements } = path;
    
    if (playerStats.affectionLevel < requirements.affectionLevel) return false;
    if (requirements.intimacyLevel && playerStats.intimacyLevel < requirements.intimacyLevel) return false;
    if (requirements.trustLevel && playerStats.trustLevel < requirements.trustLevel) return false;
    
    if (requirements.specificChoices) {
      const hasRequiredChoices = requirements.specificChoices.every(choice => 
        storyFlags.includes(choice)
      );
      if (!hasRequiredChoices) return false;
    }
    
    return true;
  };

  const getAvailableChoices = (): StoryChoice[] => {
    const sceneChoices = DYNAMIC_CHOICES[currentScene] || [];
    
    return sceneChoices.filter(choice => {
      if (!choice.requirements) return true;
      
      const { requirements } = choice;
      if (requirements.affectionLevel && playerStats.affectionLevel < requirements.affectionLevel) return false;
      if (requirements.previousChoices) {
        const hasRequired = requirements.previousChoices.every(prev => storyFlags.includes(prev));
        if (!hasRequired) return false;
      }
      if (requirements.storyFlags) {
        const hasFlags = requirements.storyFlags.every(flag => storyFlags.includes(flag));
        if (!hasFlags) return false;
      }
      
      return true;
    });
  };

  const getPathIcon = (pathType: string) => {
    switch (pathType) {
      case 'main': return <Star className="w-4 h-4" />;
      case 'romantic': return <Heart className="w-4 h-4" />;
      case 'intimate': return <Flame className="w-4 h-4" />;
      case 'friendship': return <Star className="w-4 h-4" />;
      case 'secret': return <Crown className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getPathColor = (pathType: string) => {
    switch (pathType) {
      case 'main': return 'text-blue-300 border-blue-500';
      case 'romantic': return 'text-pink-300 border-pink-500';
      case 'intimate': return 'text-red-300 border-red-500';
      case 'friendship': return 'text-green-300 border-green-500';
      case 'secret': return 'text-purple-300 border-purple-500';
      default: return 'text-gray-300 border-gray-500';
    }
  };

  useEffect(() => {
    // Update available paths based on current stats
    const updatedPaths = STORY_PATHS.map(path => ({
      ...path,
      unlocked: path.unlocked || checkPathRequirements(path)
    }));
    
    setAvailablePaths(updatedPaths);
    
    // Update dynamic choices for current scene
    const choices = getAvailableChoices();
    setDynamicChoices(choices);
  }, [currentScene, playerStats, storyFlags]);

  return {
    availablePaths,
    dynamicChoices,
    getPathRequirements: checkPathRequirements,
    getOptimalChoices: () => dynamicChoices.filter(choice => choice.optimalChoice)
  };
}

// Enhanced Choice Component with Path Indicators
export function EnhancedChoiceButton({ 
  choice, 
  onSelect, 
  disabled = false 
}: { 
  choice: StoryChoice; 
  onSelect: (choice: StoryChoice) => void;
  disabled?: boolean;
}) {
  const getChoiceColor = () => {
    if (choice.optimalChoice) return 'border-green-400/50 bg-green-900/20';
    return 'border-purple-400/30 bg-purple-900/10';
  };

  const getPathTypeDisplay = () => {
    const path = STORY_PATHS.find(p => p.id === choice.pathId);
    return path ? path.pathType : 'main';
  };

  return (
    <button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className={`relative group p-4 rounded-lg border transition-all duration-300 ${getChoiceColor()} 
        hover:border-opacity-70 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed
        ${choice.optimalChoice ? 'ring-1 ring-green-400/20' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {choice.optimalChoice && <Star className="w-4 h-4 text-green-400" />}
          <Badge variant="outline" className="text-xs capitalize">
            {getPathTypeDisplay()}
          </Badge>
        </div>
        {choice.requirements && (
          <Lock className="w-3 h-3 text-gray-500" />
        )}
      </div>
      
      <p className="text-white text-sm text-left mb-3">{choice.text}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-2">
          {choice.impact.affectionChange > 0 && (
            <span className="text-pink-400">+{choice.impact.affectionChange} Affection</span>
          )}
          {choice.impact.intimacyChange && choice.impact.intimacyChange > 0 && (
            <span className="text-red-400">+{choice.impact.intimacyChange} Intimacy</span>
          )}
          {choice.impact.trustChange && choice.impact.trustChange > 0 && (
            <span className="text-blue-400">+{choice.impact.trustChange} Trust</span>
          )}
        </div>
        <div className="text-gray-400">
          {choice.impact.pathProgression}% Progress
        </div>
      </div>
    </button>
  );
}

// Path Progress Display Component
export function PathProgressDisplay({ 
  paths, 
  currentPath 
}: { 
  paths: StoryPath[]; 
  currentPath?: string;
}) {
  const activePath = paths.find(p => p.id === currentPath);
  
  if (!activePath) return null;

  return (
    <div className="bg-black/50 border border-gray-600 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        {getPathIcon(activePath.pathType)}
        <h3 className="text-white font-semibold">{activePath.title}</h3>
        <Badge variant="outline" className={getPathColor(activePath.pathType)}>
          {activePath.pathType}
        </Badge>
      </div>
      
      <p className="text-gray-300 text-sm mb-3">{activePath.description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Path Progress</span>
          <span className="text-gray-400">75%</span>
        </div>
        <Progress value={75} className="h-2 bg-gray-700">
          <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500" 
               style={{ width: '75%' }} />
        </Progress>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Unlocked Scenes: {activePath.scenes.length}
      </div>
    </div>
  );
}