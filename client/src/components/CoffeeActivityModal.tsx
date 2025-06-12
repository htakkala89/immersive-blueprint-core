import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coffee, X, Heart, DollarSign } from 'lucide-react';

interface CoffeeActivityModalProps {
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

interface CoffeeChoice {
  id: string;
  text: string;
  description: string;
  goldCost: number;
  affectionBonus: number;
  isCorrectGuess?: boolean;
}

export function CoffeeActivityModal({
  isVisible,
  onClose,
  backgroundImage,
  onActivityComplete
}: CoffeeActivityModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'choice' | 'narrative'>('choice');
  const [selectedChoice, setSelectedChoice] = useState<CoffeeChoice | null>(null);
  const [narrativeText, setNarrativeText] = useState('');
  const [isShowingNarrative, setIsShowingNarrative] = useState(false);

  // Coffee choices with Cha Hae-In's hidden preference (Americano)
  const coffeeChoices: CoffeeChoice[] = [
    {
      id: 'two_americanos',
      text: 'Two Iced Americanos',
      description: 'Order her favorite without asking',
      goldCost: 8,
      affectionBonus: 5, // Bonus for knowing her preference
      isCorrectGuess: true
    },
    {
      id: 'latte_macchiato',
      text: 'A Latte and a Macchiato',
      description: 'Safe, popular choices',
      goldCost: 12,
      affectionBonus: 2
    },
    {
      id: 'ask_preference',
      text: 'Ask her what she wants',
      description: 'Let her choose for herself',
      goldCost: 10,
      affectionBonus: 3
    }
  ];

  // Generate narrative based on choice
  const generateNarrative = (choice: CoffeeChoice): string => {
    const narratives: Record<string, string> = {
      'two_americanos': '*You confidently order two iced Americanos without hesitation. Cha Hae-In raises an eyebrow in pleasant surprise.* "You remembered my favorite," *she says with the hint of a smile, taking a sip and giving a small, contented sigh.* "This is exactly what I needed after that last raid."',
      'latte_macchiato': '*You order a latte for yourself and a macchiato for her. She accepts gracefully and takes a thoughtful sip.* "Not bad," *she says, settling into the window seat.* "Though I usually prefer something stronger. The atmosphere here is nice though."',
      'ask_preference': '*"What would you like to drink?" you ask. She considers for a moment.* "An iced Americano, please. I appreciate you asking." *She seems pleased by your consideration as you place the order and find a quiet table by the window.*'
    };
    return narratives[choice.id] || narratives['ask_preference'];
  };

  // Handle choice selection - follows spec exactly
  const handleChoiceSelect = async (choice: CoffeeChoice) => {
    setSelectedChoice(choice);
    setCurrentPhase('narrative');
    
    // Generate and display narrative (Step 4 of spec)
    const narrative = generateNarrative(choice);
    setNarrativeText(narrative);
    setIsShowingNarrative(true);
  };

  // Complete the activity
  const handleActivityComplete = () => {
    if (selectedChoice) {
      const results: ActivityResults = {
        affectionGained: selectedChoice.affectionBonus,
        goldSpent: selectedChoice.goldCost,
        energySpent: 10,
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
      {/* Choice Phase - Compact overlay for spatial view (Step 3 of spec) */}
      {currentPhase === 'choice' && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[100] max-w-md w-full mx-4"
        >
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-white font-semibold text-lg">What should we order?</h3>
              <p className="text-white/70 text-sm">Choose drinks for you and Cha Hae-In</p>
            </div>
            
            {/* Choice Buttons */}
            <div className="space-y-3">
              {coffeeChoices.map(choice => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelect(choice)}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-4 text-left transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">{choice.text}</h4>
                      <p className="text-white/70 text-sm">{choice.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 text-sm">₩{choice.goldCost}K</div>
                      {choice.isCorrectGuess && (
                        <div className="text-pink-400 text-xs">♡ Bonus</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Narrative Phase - Descriptive resolution (Step 4 of spec) */}
      {currentPhase === 'narrative' && isShowingNarrative && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl"
          >
            {/* Coffee Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center">
                <Coffee className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Narrative Text */}
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <p className="text-white/90 text-lg leading-relaxed italic text-center">
                {narrativeText}
              </p>
            </div>

            {/* Activity Results */}
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-pink-400 text-sm">Affection</div>
                <div className="text-white font-bold">+{selectedChoice?.affectionBonus}</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 text-sm">Cost</div>
                <div className="text-white font-bold">₩{selectedChoice?.goldCost}K</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-sm">Energy</div>
                <div className="text-white font-bold">-10</div>
              </div>
            </div>

            {/* Continue Button - Leads to Standard Dialogue UI (Step 5 of spec) */}
            <Button
              onClick={handleActivityComplete}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
            >
              Continue Conversation
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}