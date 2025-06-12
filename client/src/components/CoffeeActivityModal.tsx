import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coffee, X, Heart, DollarSign } from 'lucide-react';
import { ActivityChoiceModal } from './ActivityChoiceModal';

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
      description: 'Safe popular choices',
      goldCost: 12,
      affectionBonus: 2
    },
    {
      id: 'ask_preference',
      text: 'Ask her what she wants',
      description: 'Let her choose what she likes',
      goldCost: 10,
      affectionBonus: 3 // Good for showing consideration
    },
    {
      id: 'specialty_drinks',
      text: 'Two Specialty Drinks',
      description: 'Try something adventurous together',
      goldCost: 15,
      affectionBonus: 1
    }
  ];

  // Generate contextual narrative based on choice
  const generateNarrative = (choice: CoffeeChoice): string => {
    const narratives = {
      two_americanos: "*You confidently order two iced Americanos. Cha Hae-In's eyes light up with surprise and appreciation.* \"You remembered my favorite,\" *she says with a soft smile, her cheeks tinged with a slight blush. You find a quiet table by the window overlooking the bustling Hongdae street. She takes a sip and gives a small, contented sigh.* \"This is perfect.\"",
      
      latte_macchiato: "*You order a latte for yourself and a macchiato for her. She accepts gracefully, though you notice a moment's hesitation.* \"Thank you,\" *she says politely. You settle at a cozy corner table. She sips the macchiato thoughtfully.* \"It's sweet... different from what I usually drink, but nice for a change.\"",
      
      ask_preference: "*\"What would you like to drink?\" you ask, gesturing to the menu. Her expression softens at your consideration.* \"I appreciate you asking,\" *she says warmly.* \"I'll have an iced Americano, please.\" *After ordering, you find a comfortable spot by the window. She takes a satisfied sip.* \"I love how they make it here - not too bitter, not too sweet.\"",
      
      specialty_drinks: "*You decide to be adventurous and order two of the cafe's signature drinks. Cha Hae-In looks curious as the colorful beverages arrive.* \"These look... interesting,\" *she says with an amused smile. You both try them together, sharing reactions. She laughs softly at the unexpected flavors.* \"Well, this is certainly memorable.\""
    };

    return narratives[choice.id as keyof typeof narratives] || '';
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice: any) => {
    const coffeeChoice = coffeeChoices.find(c => c.id === choice.id);
    if (!coffeeChoice) return;
    
    setSelectedChoice(coffeeChoice);
    setCurrentPhase('narrative');
    
    // Generate and display narrative
    const narrative = generateNarrative(coffeeChoice);
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
      {/* Choice Phase */}
      {currentPhase === 'choice' && (
        <ActivityChoiceModal
          isVisible={true}
          onClose={onClose}
          title="What should we order?"
          subtitle="Choose drinks for you and Cha Hae-In"
          choices={coffeeChoices.map(choice => ({
            id: choice.id,
            text: choice.text,
            description: choice.description,
            affectionBonus: choice.affectionBonus,
            goldCost: choice.goldCost
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Coffee Order</h3>
                <p className="text-white/60 text-sm">Cozy Hongdae Cafe</p>
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
                  <div className="flex items-center gap-1 text-yellow-400">
                    <DollarSign className="w-4 h-4" />
                    <span>-${selectedChoice.goldCost}</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>+{selectedChoice.affectionBonus}</span>
                  </div>
                  {selectedChoice.isCorrectGuess && (
                    <span className="text-green-400 text-xs font-medium">Perfect Choice!</span>
                  )}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <Button
              onClick={handleNarrativeContinue}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium"
            >
              Continue Conversation
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Conversation Phase */}
      {currentPhase === 'conversation' && (
        <ChatSystem2
          isVisible={true}
          onClose={handleConversationComplete}
          activityId="grab_coffee"
          activityTitle="Coffee at Hongdae Cafe"
          backgroundImage={backgroundImage}
          initialContext={`You're having coffee together at a cozy Hongdae cafe. ${selectedChoice?.isCorrectGuess ? 'Cha Hae-In is impressed that you remembered her favorite drink.' : 'You\'re both enjoying your drinks in the comfortable atmosphere.'} The conversation flows naturally in this relaxed setting.`}
          onConversationEnd={handleConversationComplete}
        />
      )}
    </AnimatePresence>
  );
}