import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sword, X, Heart, DollarSign, Zap } from 'lucide-react';
import { ActivityChoiceModal } from './ActivityChoiceModal';

interface TrainingActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  backgroundImage?: string;
  onActivityComplete: (results: ActivityResults) => void;
}

interface ActivityResults {
  affectionGained: number;
  goldSpent: number;
  energySpent: number;
  experienceGained: number;
  choiceMade: string;
  conversationCompleted: boolean;
}

interface TrainingChoice {
  id: string;
  text: string;
  description: string;
  energyCost: number;
  affectionBonus: number;
  experienceGain: number;
  specialEffect?: string;
}

export function TrainingActivityModal({
  isVisible,
  onClose,
  backgroundImage,
  onActivityComplete
}: TrainingActivityModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'choice' | 'narrative'>('choice');
  const [selectedChoice, setSelectedChoice] = useState<TrainingChoice | null>(null);
  const [narrativeText, setNarrativeText] = useState('');
  const [isShowingNarrative, setIsShowingNarrative] = useState(false);

  // Training choices with different approaches and outcomes
  const trainingChoices: TrainingChoice[] = [
    {
      id: 'sparring_match',
      text: 'Sparring Match',
      description: 'Practice combat techniques together',
      energyCost: 25,
      affectionBonus: 4,
      experienceGain: 150,
      specialEffect: 'Shows mutual respect and competitive spirit'
    },
    {
      id: 'shadow_demonstration',
      text: 'Shadow Army Demo',
      description: 'Show her your shadow soldiers',
      energyCost: 20,
      affectionBonus: 6,
      experienceGain: 100,
      specialEffect: 'Reveals your unique abilities, building trust'
    },
    {
      id: 'sword_techniques',
      text: 'Sword Technique Exchange',
      description: 'Learn from each other\'s styles',
      energyCost: 30,
      affectionBonus: 5,
      experienceGain: 200,
      specialEffect: 'Creates intimate learning moments'
    },
    {
      id: 'endurance_training',
      text: 'Endurance Training',
      description: 'Push limits together',
      energyCost: 35,
      affectionBonus: 3,
      experienceGain: 250,
      specialEffect: 'Builds physical and mental toughness'
    }
  ];

  // Generate contextual narrative based on choice
  const generateNarrative = (choice: TrainingChoice): string => {
    const narratives = {
      sparring_match: "*You take your positions in the training area. Cha Hae-In's eyes sharpen with focus as she draws her sword.* \"Don't hold back,\" *she says with a competitive smile. The spar is intense but respectful - each move calculated, each counter precise. When you finally call a draw, both of you are breathing hard but grinning.* \"You're better than I expected,\" *she admits, wiping sweat from her brow.* \"Same time tomorrow?\"",
      
      shadow_demonstration: "*You summon a few of your shadow soldiers, watching Cha Hae-In's reaction carefully. Her eyes widen with genuine fascination rather than fear.* \"Incredible...\" *she breathes, approaching one of the shadows.* \"I've heard rumors, but seeing it firsthand...\" *She looks at you with new understanding.* \"The responsibility you carry must be immense. Thank you for trusting me with this.\"",
      
      sword_techniques: "*You spend the session exchanging techniques, her elegant swordsmanship complementing your raw power. When she adjusts your grip, her touch lingers for a moment.* \"Like this,\" *she says softly, guiding your stance. The proximity creates an electric tension.* \"Your technique is improving rapidly. You're a fast learner.\" *Her praise feels more personal than professional.*",
      
      endurance_training: "*The grueling session pushes both of you to your limits. Side by side, you run, climb, and overcome obstacles. When Cha Hae-In stumbles during the final sprint, you catch her arm.* \"Together,\" *you say, and she nods, finding her second wind. Crossing the finish line together, exhausted but triumphant, she looks at you with newfound respect.* \"I couldn't have done that alone.\""
    };

    return narratives[choice.id as keyof typeof narratives] || '';
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice: any) => {
    const trainingChoice = trainingChoices.find(c => c.id === choice.id);
    if (!trainingChoice) return;
    
    setSelectedChoice(trainingChoice);
    setCurrentPhase('narrative');
    
    // Generate and display narrative
    const narrative = generateNarrative(trainingChoice);
    setNarrativeText(narrative);
    setIsShowingNarrative(true);
  };

  // Complete the activity
  const handleActivityComplete = () => {
    if (selectedChoice) {
      const results: ActivityResults = {
        affectionGained: selectedChoice.affectionBonus,
        goldSpent: 0, // Training is free
        energySpent: selectedChoice.energyCost,
        experienceGained: selectedChoice.experienceGain,
        choiceMade: selectedChoice.id,
        conversationCompleted: true
      };
      onActivityComplete(results);
    }
    onClose();
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setCurrentPhase('choice');
      setSelectedChoice(null);
      setNarrativeText('');
      setIsShowingNarrative(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {/* Choice Phase */}
      {currentPhase === 'choice' && (
        <ActivityChoiceModal
          isVisible={true}
          onClose={onClose}
          title="Choose Training Type"
          subtitle="How do you want to train with Cha Hae-In?"
          choices={trainingChoices.map(choice => ({
            id: choice.id,
            text: choice.text,
            description: choice.description,
            affectionBonus: choice.affectionBonus,
            goldCost: 0 // Training is free
          }))}
          onChoiceSelect={handleChoiceSelect}
          backgroundImage={backgroundImage}
        />
      )}

      {/* Narrative Phase */}
      {currentPhase === 'narrative' && isShowingNarrative && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Background */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>

          {/* Narrative Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl mx-4 w-full"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <Sword className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Training Session</h3>
                <p className="text-white/60 text-sm">Hunter Association Training Grounds</p>
              </div>
            </div>

            {/* Narrative Text */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10">
              <p className="text-white/90 leading-relaxed text-base">
                {narrativeText}
              </p>
            </div>

            {/* Results Summary */}
            {selectedChoice && (
              <div className="flex items-center justify-between mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-blue-400">
                    <Zap className="w-4 h-4" />
                    <span>-{selectedChoice.energyCost} Energy</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <span>+{selectedChoice.experienceGain} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>+{selectedChoice.affectionBonus}</span>
                  </div>
                  {selectedChoice.specialEffect && (
                    <span className="text-purple-400 text-xs font-medium">
                      {selectedChoice.specialEffect}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Complete Activity Button */}
            <Button
              onClick={handleActivityComplete}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium"
            >
              Complete Training Session
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}