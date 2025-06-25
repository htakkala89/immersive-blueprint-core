import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon, X, Heart, DollarSign, MapPin } from 'lucide-react';
import { ActivityChoiceModal } from './ActivityChoiceModal';

interface EveningWalkActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  backgroundImage?: string;
  onActivityComplete: (results: ActivityResults) => void;
}

interface ActivityResults {
  affectionGained: number;
  goldSpent: number;
  energySpent: number;
  choiceMade: string;
  conversationCompleted: boolean;
}

interface WalkChoice {
  id: string;
  text: string;
  description: string;
  energyCost: number;
  affectionBonus: number;
  intimacyLevel: number;
  scenicValue: number;
}

export function EveningWalkActivityModal({
  isVisible,
  onClose,
  backgroundImage,
  onActivityComplete
}: EveningWalkActivityModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'choice' | 'narrative'>('choice');
  const [selectedChoice, setSelectedChoice] = useState<WalkChoice | null>(null);
  const [narrativeText, setNarrativeText] = useState('');
  const [isShowingNarrative, setIsShowingNarrative] = useState(false);

  // Evening walk choices with different romantic settings
  const walkChoices: WalkChoice[] = [
    {
      id: 'hangang_riverside',
      text: 'Hangang River Walk',
      description: 'Peaceful riverside stroll under city lights',
      energyCost: 10,
      affectionBonus: 6,
      intimacyLevel: 3,
      scenicValue: 5
    },
    {
      id: 'namsan_tower',
      text: 'Namsan Tower Trail',
      description: 'Romantic hilltop walk with panoramic views',
      energyCost: 20,
      affectionBonus: 8,
      intimacyLevel: 4,
      scenicValue: 5
    },
    {
      id: 'gangnam_streets',
      text: 'Gangnam Evening Stroll',
      description: 'Walk through the vibrant nightlife district',
      energyCost: 15,
      affectionBonus: 4,
      intimacyLevel: 2,
      scenicValue: 3
    },
    {
      id: 'quiet_park',
      text: 'Secluded Park Path',
      description: 'Private walk through a peaceful neighborhood park',
      energyCost: 8,
      affectionBonus: 7,
      intimacyLevel: 5,
      scenicValue: 4
    }
  ];

  // Generate contextual narrative based on choice
  const generateNarrative = (choice: WalkChoice): string => {
    const narratives = {
      hangang_riverside: "*You walk along the Han River as the sun sets, the city lights beginning to twinkle across the water. Cha Hae-In seems more relaxed here, away from the bustle of her hunter duties.* \"I come here sometimes when I need to think,\" *she says quietly, her voice softer than usual.* \"Being near the water... it helps clear my mind.\" *You walk in comfortable silence for a while, occasionally brushing hands as you point out the night scenery.*",
      
      namsan_tower: "*The climb to Namsan Tower is invigorating, and the view from the top takes your breath away. Seoul spreads out below like a sea of lights. Cha Hae-In stands close to you at the railing, the cool evening breeze moving her hair.* \"It's beautiful,\" *she murmurs, then glances at you.* \"Thank you for bringing me here. I'd forgotten how peaceful it can be above all the chaos.\" *Her hand finds yours as you both take in the romantic panorama.*",
      
      gangnam_streets: "*The energy of Gangnam at night is infectious - neon signs, bustling crowds, and the pulse of the city. Cha Hae-In walks beside you with confidence, clearly comfortable in this urban environment.* \"This reminds me of when I was younger,\" *she says with a slight smile.* \"Before the hunter life took over everything.\" *You navigate the crowds together, her hand occasionally touching your arm for guidance through the busy streets.*",
      
      quiet_park: "*The secluded park feels like a hidden sanctuary, streetlights casting gentle pools of warmth along the winding path. With no one else around, Cha Hae-In's usual professional demeanor melts away completely.* \"This is nice,\" *she says, moving closer as you walk.* \"Just us, no missions, no responsibilities.\" *When you reach a quiet bench overlooking a small pond, she doesn't hesitate to sit close beside you, her shoulder touching yours.*"
    };

    return narratives[choice.id as keyof typeof narratives] || '';
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice: any) => {
    const walkChoice = walkChoices.find(c => c.id === choice.id);
    if (!walkChoice) return;
    
    setSelectedChoice(walkChoice);
    setCurrentPhase('narrative');
    
    // Generate and display narrative
    const narrative = generateNarrative(walkChoice);
    setNarrativeText(narrative);
    setIsShowingNarrative(true);
  };

  // Complete the activity
  const handleActivityComplete = () => {
    if (selectedChoice) {
      const results: ActivityResults = {
        affectionGained: selectedChoice.affectionBonus,
        goldSpent: 0, // Evening walks are free
        energySpent: selectedChoice.energyCost,
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
          title="Choose Walking Route"
          subtitle="Where would you like to take an evening stroll?"
          choices={walkChoices.map(choice => ({
            id: choice.id,
            text: choice.text,
            description: choice.description,
            affectionBonus: choice.affectionBonus,
            goldCost: 0 // Walks are free
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Evening Walk</h3>
                <p className="text-white/60 text-sm">
                  {selectedChoice?.id === 'hangang_riverside' ? 'Han River Promenade' : 
                   selectedChoice?.id === 'namsan_tower' ? 'Namsan Tower Trail' :
                   selectedChoice?.id === 'gangnam_streets' ? 'Gangnam District' : 'Quiet Neighborhood Park'}
                </p>
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
                    <MapPin className="w-4 h-4" />
                    <span>-{selectedChoice.energyCost} Energy</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>+{selectedChoice.affectionBonus}</span>
                  </div>
                  <div className="text-green-400 text-xs">Free Activity</div>
                  {selectedChoice.intimacyLevel >= 4 && (
                    <span className="text-purple-400 text-xs font-medium">
                      Romantic Setting
                    </span>
                  )}
                  {selectedChoice.scenicValue === 5 && (
                    <span className="text-yellow-400 text-xs font-medium">
                      Beautiful Views
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Complete Activity Button */}
            <Button
              onClick={handleActivityComplete}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium"
            >
              Complete Evening Walk
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}