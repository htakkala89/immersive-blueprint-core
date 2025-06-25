import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Coffee, X } from 'lucide-react';

interface ActivityChoice {
  id: string;
  text: string;
  description: string;
  affectionBonus?: number;
  goldCost?: number;
}

interface ActivityChoiceModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  choices: ActivityChoice[];
  onChoiceSelect: (choice: ActivityChoice) => void;
  backgroundImage?: string;
}

export function ActivityChoiceModal({
  isVisible,
  onClose,
  title,
  subtitle,
  choices,
  onChoiceSelect,
  backgroundImage
}: ActivityChoiceModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<ActivityChoice | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleChoiceSelect = async (choice: ActivityChoice) => {
    setSelectedChoice(choice);
    setIsTransitioning(true);
    
    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onChoiceSelect(choice);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Background with optional image */}
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

        {/* Choice Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: isTransitioning ? 0.7 : 1, 
            scale: isTransitioning ? 0.95 : 1,
            y: isTransitioning ? -10 : 0
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-black/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md mx-4 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/60 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">{title}</h2>
            <p className="text-white/70 text-sm">{subtitle}</p>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            {choices.map((choice, index) => (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={isTransitioning}
                  variant="ghost"
                  className="w-full p-4 h-auto text-left bg-white/5 hover:bg-white/10 border border-white/20 transition-all duration-300"
                >
                  <div>
                    <div className="text-white font-medium mb-1">{choice.text}</div>
                    {choice.description && (
                      <div className="text-white/60 text-xs">{choice.description}</div>
                    )}
                    <div className="flex gap-2 mt-2 text-xs">
                      {choice.goldCost && (
                        <span className="text-yellow-400">-${choice.goldCost}</span>
                      )}
                      {choice.affectionBonus && (
                        <span className="text-pink-400">+{choice.affectionBonus} Affection</span>
                      )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Processing State */}
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/40 rounded-3xl flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                <p className="text-white/80 text-sm">Processing choice...</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}