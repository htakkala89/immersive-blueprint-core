import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Flame, Crown } from "lucide-react";

interface RelationshipData {
  affectionLevel: number;
  intimacyPoints: number;
  trustLevel: number;
  romanticProgression: 'stranger' | 'acquaintance' | 'friend' | 'close_friend' | 'romantic_interest' | 'dating' | 'committed' | 'soulmate';
  personalityTraits: {
    confidence: number;
    playfulness: number;
    vulnerability: number;
    protectiveness: number;
  };
  memoryBank: Array<{
    event: string;
    impact: number;
    timestamp: number;
    emotion: 'happy' | 'sad' | 'excited' | 'touched' | 'grateful' | 'impressed';
  }>;
  unlockedScenes: string[];
  favoriteActivities: string[];
}

interface RelationshipSystemProps {
  relationshipData: RelationshipData;
  onRelationshipUpdate: (data: Partial<RelationshipData>) => void;
  currentScene: string;
}

export function RelationshipSystem({ relationshipData, onRelationshipUpdate, currentScene }: RelationshipSystemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getRelationshipTitle = (affectionLevel: number): string => {
    if (affectionLevel === 0) return "Cha Hae-In";
    if (affectionLevel === 1) return "Fellow S-Rank Hunter";
    if (affectionLevel === 2) return "Trusted Partner";
    if (affectionLevel === 3) return "Close Friend";
    if (affectionLevel === 4) return "Romantic Interest";
    if (affectionLevel >= 5) return "Beloved";
    return "Cha Hae-In";
  };

  const getProgressionIcon = (progression: string) => {
    const icons = {
      stranger: <Star className="w-4 h-4" />,
      acquaintance: <Star className="w-4 h-4" />,
      friend: <Heart className="w-4 h-4" />,
      close_friend: <Heart className="w-4 h-4 text-pink-500" />,
      romantic_interest: <Flame className="w-4 h-4 text-red-500" />,
      dating: <Crown className="w-4 h-4 text-purple-500" />,
      committed: <Crown className="w-4 h-4 text-gold-500" />,
      soulmate: <Crown className="w-4 h-4 text-yellow-500" />
    };
    return icons[progression as keyof typeof icons] || <Star className="w-4 h-4" />;
  };

  const calculatePersonalityResponse = (choice: any): string => {
    const { personalityTraits } = relationshipData;
    
    // Dynamic personality based on accumulated traits
    if (personalityTraits.confidence > 70) {
      return "chaHaeIn_confident";
    } else if (personalityTraits.playfulness > 60) {
      return "chaHaeIn_playful";
    } else if (personalityTraits.vulnerability > 50) {
      return "chaHaeIn_vulnerable";
    } else {
      return "chaHaeIn_balanced";
    }
  };

  const processChoiceImpact = (choice: any) => {
    let affectionChange = 0;
    let intimacyChange = 0;
    let trustChange = 0;
    let traitChanges = { confidence: 0, playfulness: 0, vulnerability: 0, protectiveness: 0 };

    // Analyze choice type and content to determine impact
    if (choice.type.includes('romantic')) {
      affectionChange = 5;
      intimacyChange = 3;
      traitChanges.vulnerability = 2;
    } else if (choice.type.includes('protective')) {
      trustChange = 4;
      traitChanges.protectiveness = 3;
      affectionChange = 3;
    } else if (choice.type.includes('playful')) {
      traitChanges.playfulness = 4;
      affectionChange = 2;
    } else if (choice.type.includes('confident')) {
      traitChanges.confidence = 3;
      affectionChange = 2;
    }

    // Add memory
    const newMemory = {
      event: choice.text,
      impact: affectionChange,
      timestamp: Date.now(),
      emotion: affectionChange > 3 ? 'touched' : 'happy' as const
    };

    // Update relationship data
    onRelationshipUpdate({
      affectionLevel: Math.min(100, relationshipData.affectionLevel + affectionChange),
      intimacyPoints: Math.min(100, relationshipData.intimacyPoints + intimacyChange),
      trustLevel: Math.min(100, relationshipData.trustLevel + trustChange),
      personalityTraits: {
        confidence: Math.min(100, relationshipData.personalityTraits.confidence + traitChanges.confidence),
        playfulness: Math.min(100, relationshipData.personalityTraits.playfulness + traitChanges.playfulness),
        vulnerability: Math.min(100, relationshipData.personalityTraits.vulnerability + traitChanges.vulnerability),
        protectiveness: Math.min(100, relationshipData.personalityTraits.protectiveness + traitChanges.protectiveness),
      },
      memoryBank: [...relationshipData.memoryBank, newMemory].slice(-50) // Keep last 50 memories
    });
  };

  const checkProgressionUnlock = () => {
    const { affectionLevel, intimacyPoints, trustLevel } = relationshipData;
    let newProgression = relationshipData.romanticProgression;

    if (affectionLevel >= 80 && intimacyPoints >= 70 && trustLevel >= 80) {
      newProgression = 'soulmate';
    } else if (affectionLevel >= 70 && intimacyPoints >= 60) {
      newProgression = 'committed';
    } else if (affectionLevel >= 60 && intimacyPoints >= 40) {
      newProgression = 'dating';
    } else if (affectionLevel >= 40 && trustLevel >= 50) {
      newProgression = 'romantic_interest';
    } else if (affectionLevel >= 30) {
      newProgression = 'close_friend';
    } else if (affectionLevel >= 15) {
      newProgression = 'friend';
    } else if (affectionLevel >= 5) {
      newProgression = 'acquaintance';
    }

    if (newProgression !== relationshipData.romanticProgression) {
      onRelationshipUpdate({ romanticProgression: newProgression });
      return true; // Progression unlocked
    }
    return false;
  };

  return (
    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getProgressionIcon(relationshipData.romanticProgression)}
          <span className="text-purple-300 font-medium">
            {getRelationshipTitle(relationshipData.romanticProgression)}
          </span>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-400 hover:text-purple-300 text-sm"
        >
          {showDetails ? 'Hide' : 'Details'}
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-pink-300">Affection</span>
            <span className="text-pink-300">{relationshipData.affectionLevel}%</span>
          </div>
          <Progress value={relationshipData.affectionLevel} className="h-2 bg-gray-700">
            <div className="h-full bg-gradient-to-r from-pink-500 to-red-500 rounded-full transition-all duration-300" 
                 style={{ width: `${relationshipData.affectionLevel}%` }} />
          </Progress>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-purple-300">Intimacy</span>
            <span className="text-purple-300">{relationshipData.intimacyPoints}%</span>
          </div>
          <Progress value={relationshipData.intimacyPoints} className="h-2 bg-gray-700">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300" 
                 style={{ width: `${relationshipData.intimacyPoints}%` }} />
          </Progress>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-blue-300">Trust</span>
            <span className="text-blue-300">{relationshipData.trustLevel}%</span>
          </div>
          <Progress value={relationshipData.trustLevel} className="h-2 bg-gray-700">
            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300" 
                 style={{ width: `${relationshipData.trustLevel}%` }} />
          </Progress>
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 pt-3 border-t border-purple-500/30">
          <div className="space-y-2">
            <div className="text-sm">
              <span className="text-gray-300">Personality Traits:</span>
              <div className="grid grid-cols-2 gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  Confident: {relationshipData.personalityTraits.confidence}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Playful: {relationshipData.personalityTraits.playfulness}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Vulnerable: {relationshipData.personalityTraits.vulnerability}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Protective: {relationshipData.personalityTraits.protectiveness}%
                </Badge>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-300">Recent Memories:</span>
              <div className="mt-1 max-h-20 overflow-y-auto">
                {relationshipData.memoryBank.slice(-3).map((memory, index) => (
                  <div key={index} className="text-xs text-gray-400 truncate">
                    • {memory.event}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for relationship system integration
export function useRelationshipSystem() {
  const [relationshipData, setRelationshipData] = useState<RelationshipData>({
    affectionLevel: 0,
    intimacyPoints: 0,
    trustLevel: 0,
    romanticProgression: 'stranger',
    personalityTraits: {
      confidence: 50,
      playfulness: 30,
      vulnerability: 20,
      protectiveness: 40
    },
    memoryBank: [],
    unlockedScenes: [],
    favoriteActivities: []
  });

  const updateRelationship = (updates: Partial<RelationshipData>) => {
    setRelationshipData(prev => ({ ...prev, ...updates }));
  };

  const processChoice = (choice: any) => {
    // Process choice impact on relationship
    let affectionChange = 0;
    let intimacyChange = 0;
    let trustChange = 0;

    // Determine impact based on choice
    if (choice.type.includes('romantic')) {
      affectionChange = 5;
      intimacyChange = 3;
    } else if (choice.type.includes('caring')) {
      affectionChange = 3;
      trustChange = 4;
    } else if (choice.type.includes('playful')) {
      affectionChange = 2;
    }

    updateRelationship({
      affectionLevel: Math.min(100, relationshipData.affectionLevel + affectionChange),
      intimacyPoints: Math.min(100, relationshipData.intimacyPoints + intimacyChange),
      trustLevel: Math.min(100, relationshipData.trustLevel + trustChange),
    });
  };

  return {
    relationshipData,
    updateRelationship,
    processChoice
  };
}