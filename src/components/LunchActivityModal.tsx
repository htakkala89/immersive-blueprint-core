import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Utensils, X, Heart, DollarSign } from 'lucide-react';
import { ActivityChoiceModal } from './ActivityChoiceModal';

interface LunchActivityModalProps {
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

interface LunchChoice {
  id: string;
  text: string;
  description: string;
  goldCost: number;
  affectionBonus: number;
  romanticLevel: number;
}

export function LunchActivityModal({
  isVisible,
  onClose,
  backgroundImage,
  onActivityComplete
}: LunchActivityModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'choice' | 'narrative'>('choice');
  const [selectedChoice, setSelectedChoice] = useState<LunchChoice | null>(null);
  const [narrativeText, setNarrativeText] = useState('');
  const [isShowingNarrative, setIsShowingNarrative] = useState(false);

  // Lunch choices with varying romantic intensity and cost
  const lunchChoices: LunchChoice[] = [
    {
      id: 'casual_korean_bbq',
      text: 'Korean BBQ Restaurant',
      description: 'Share grilled meat and banchan together',
      goldCost: 25,
      affectionBonus: 4,
      romanticLevel: 2
    },
    {
      id: 'elegant_restaurant',
      text: 'Upscale Restaurant',
      description: 'Fine dining with city views',
      goldCost: 50,
      affectionBonus: 6,
      romanticLevel: 4
    },
    {
      id: 'street_food_tour',
      text: 'Street Food Adventure',
      description: 'Explore Myeongdong food stalls together',
      goldCost: 15,
      affectionBonus: 5,
      romanticLevel: 1
    },
    {
      id: 'home_cooked_meal',
      text: 'Cook at Your Place',
      description: 'Invite her over for a homemade lunch',
      goldCost: 20,
      affectionBonus: 7,
      romanticLevel: 5
    }
  ];

  // Generate contextual narrative based on choice
  const generateNarrative = (choice: LunchChoice): string => {
    const narratives = {
      casual_korean_bbq: "*You arrive at the bustling Korean BBQ restaurant, the sizzling sounds and rich aromas creating a warm atmosphere. Cha Hae-In smiles as you help her with the banchan.* \"I love places like this,\" *she says, expertly grilling the meat.* \"There's something honest about sharing a meal where you both participate.\" *As you eat together, the conversation flows naturally between bites, her laughter mixing with the restaurant's lively energy.*",
      
      elegant_restaurant: "*The upscale restaurant overlooks the Han River, soft lighting casting a romantic glow. Cha Hae-In looks stunning in this setting, her elegant demeanor perfectly matching the ambiance.* \"This is beautiful,\" *she says, gazing out at the view before meeting your eyes.* \"Thank you for bringing me here.\" *The intimate setting naturally draws you closer together, each course allowing for deeper conversation.*",
      
      street_food_tour: "*You weave through the vibrant Myeongdong food stalls, trying everything from hotteok to tteokbokki. Cha Hae-In's usual composed demeanor gives way to genuine delight as she samples each treat.* \"I haven't done this in years,\" *she admits with a genuine smile, sauce on her cheek that you gently point out.* \"This is exactly what I needed - something real and spontaneous.\"",
      
      home_cooked_meal: "*In your apartment's kitchen, you work together preparing lunch. The domestic intimacy feels natural as she helps with vegetables while you handle the main course.* \"You're quite the cook,\" *she observes, standing closer than strictly necessary to taste the sauce.* \"I could get used to this.\" *The quiet privacy of your home creates an intimate bubble where her guard completely drops.*"
    };

    return narratives[choice.id as keyof typeof narratives] || '';
  };

  // Handle choice selection
  const handleChoiceSelect = async (choice: any) => {
    const lunchChoice = lunchChoices.find(c => c.id === choice.id);
    if (!lunchChoice) return;
    
    setSelectedChoice(lunchChoice);
    setCurrentPhase('narrative');
    
    // Generate and display narrative
    const narrative = generateNarrative(lunchChoice);
    setNarrativeText(narrative);
    setIsShowingNarrative(true);
  };

  // Complete the activity
  const handleActivityComplete = () => {
    if (selectedChoice) {
      const results: ActivityResults = {
        affectionGained: selectedChoice.affectionBonus,
        goldSpent: selectedChoice.goldCost,
        energySpent: 15,
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
          title="Choose Lunch Venue"
          subtitle="Where would you like to take Cha Hae-In for lunch?"
          choices={lunchChoices.map(choice => ({
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Lunch Date</h3>
                <p className="text-white/60 text-sm">
                  {selectedChoice?.id === 'home_cooked_meal' ? 'Your Apartment' : 
                   selectedChoice?.id === 'street_food_tour' ? 'Myeongdong District' :
                   selectedChoice?.id === 'elegant_restaurant' ? 'Upscale Restaurant' : 'Korean BBQ Restaurant'}
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
                  <div className="flex items-center gap-1 text-yellow-400">
                    <DollarSign className="w-4 h-4" />
                    <span>-${selectedChoice.goldCost}</span>
                  </div>
                  <div className="flex items-center gap-1 text-pink-400">
                    <Heart className="w-4 h-4" />
                    <span>+{selectedChoice.affectionBonus}</span>
                  </div>
                  {selectedChoice.romanticLevel >= 4 && (
                    <span className="text-red-400 text-xs font-medium">Romantic Atmosphere</span>
                  )}
                  {selectedChoice.romanticLevel >= 5 && (
                    <span className="text-purple-400 text-xs font-medium">Intimate Setting</span>
                  )}
                </div>
              </div>
            )}

            {/* Complete Activity Button */}
            <Button
              onClick={handleActivityComplete}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
            >
              Complete Lunch Date
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}