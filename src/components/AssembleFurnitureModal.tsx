import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Brain, Wrench, Smile, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssembleFurnitureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (memoryCreated: any) => void;
  furnitureItem: {
    name: string;
    description: string;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  playerIntelligence: number;
  backgroundImage?: string;
}

interface DialogueChoice {
  id: string;
  text: string;
  requiresIntelligence?: number;
  outcome: 'success' | 'struggle' | 'humorous_fail';
  chaResponse: string;
  memoryDescription: string;
}

interface AssemblyPhase {
  id: string;
  title: string;
  description: string;
  choices: DialogueChoice[];
}

export function AssembleFurnitureModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  furnitureItem, 
  playerIntelligence,
  backgroundImage 
}: AssembleFurnitureModalProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [assemblyProgress, setAssemblyProgress] = useState<string[]>([]);
  const [finalMemory, setFinalMemory] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const assemblyPhases: AssemblyPhase[] = [
    {
      id: 'initial_approach',
      title: 'Getting Started',
      description: `A large flat-packed box sits in the middle of your apartment, with "${furnitureItem.name}" printed boldly on the side. Cha Hae-In looks at it with a mix of curiosity and mild concern.`,
      choices: [
        {
          id: 'read_instructions',
          text: 'Read the instructions thoroughly first',
          requiresIntelligence: 30,
          outcome: 'success',
          chaResponse: 'Good thinking. I appreciate your methodical approach to this.',
          memoryDescription: 'Started the assembly project with careful planning and preparation.'
        },
        {
          id: 'wing_it',
          text: 'How hard can it be? Let\'s just start building',
          outcome: 'struggle',
          chaResponse: 'Jin-Woo... are you sure about this? These diagrams look pretty complicated.',
          memoryDescription: 'Jumped into furniture assembly with perhaps too much confidence.'
        },
        {
          id: 'shadow_soldiers',
          text: 'Maybe I should summon some shadow soldiers to help',
          outcome: 'humorous_fail',
          chaResponse: 'Please don\'t. Last time you used shadows for household tasks, they rearranged my entire kitchen.',
          memoryDescription: 'Suggested using supernatural powers for mundane furniture assembly.'
        }
      ]
    },
    {
      id: 'mid_assembly',
      title: 'The Challenge Begins',
      description: 'Pieces are scattered across the floor. Some parts look suspiciously similar, and you\'re pretty sure there are more screws than the diagram suggests.',
      choices: [
        {
          id: 'systematic_approach',
          text: 'Sort all pieces by size and type first',
          requiresIntelligence: 40,
          outcome: 'success',
          chaResponse: 'This is why you\'re the Shadow Monarch - you think ahead. Much more organized than I expected.',
          memoryDescription: 'Demonstrated surprising organizational skills during the assembly process.'
        },
        {
          id: 'trial_and_error',
          text: 'Try connecting pieces until something works',
          outcome: 'struggle',
          chaResponse: 'That... doesn\'t look right. Are you sure that piece goes there?',
          memoryDescription: 'Learned that furniture assembly requires more patience than dungeon raids.'
        },
        {
          id: 'blame_manufacturer',
          text: 'Clearly the manufacturer made an error with these instructions',
          outcome: 'humorous_fail',
          chaResponse: 'Jin-Woo, you just tried to put the door on upside down. I don\'t think it\'s the manufacturer\'s fault.',
          memoryDescription: 'Discovered that even the strongest hunter can be defeated by Swedish furniture.'
        }
      ]
    },
    {
      id: 'final_assembly',
      title: 'The Home Stretch',
      description: 'The furniture is mostly assembled, but there\'s one critical step remaining. You both stand back to assess your work so far.',
      choices: [
        {
          id: 'double_check',
          text: 'Carefully verify each connection before the final step',
          requiresIntelligence: 35,
          outcome: 'success',
          chaResponse: 'I\'m impressed. This actually looks like it\'s supposed to. You\'re better at this than I thought.',
          memoryDescription: 'Successfully completed the furniture assembly with meticulous attention to detail.'
        },
        {
          id: 'rush_finish',
          text: 'We\'re almost done - let\'s just finish it quickly',
          outcome: 'struggle',
          chaResponse: 'Wait, I think we skipped a step... should we go back and check?',
          memoryDescription: 'Rushed the final assembly steps, leading to some minor complications.'
        },
        {
          id: 'victory_dance',
          text: 'Declare victory and do a little celebration dance',
          outcome: 'humorous_fail',
          chaResponse: 'Jin-Woo, you\'re celebrating too early. Look - it\'s wobbling. Did we forget the support brackets?',
          memoryDescription: 'Celebrated furniture assembly victory prematurely, leading to adorable embarrassment.'
        }
      ]
    }
  ];

  const getCurrentPhase = () => assemblyPhases[currentPhase];

  const handleChoiceSelect = (choiceId: string) => {
    const choice = getCurrentPhase().choices.find(c => c.id === choiceId);
    if (!choice) return;

    setSelectedChoice(choiceId);
    
    // Check intelligence requirement
    const passedIntelligenceCheck = !choice.requiresIntelligence || playerIntelligence >= choice.requiresIntelligence;
    const actualOutcome = passedIntelligenceCheck ? choice.outcome : 'struggle';
    
    // Add to progress tracking
    setAssemblyProgress(prev => [...prev, choice.memoryDescription]);

    // Move to next phase or show results
    setTimeout(() => {
      if (currentPhase < assemblyPhases.length - 1) {
        setCurrentPhase(prev => prev + 1);
        setSelectedChoice(null);
      } else {
        // Create final memory based on overall performance
        createFinalMemory();
        setShowResults(true);
      }
    }, 3000);
  };

  const createFinalMemory = () => {
    // Analyze overall performance to create unique memory
    const successCount = assemblyProgress.length;
    const memoryTypes = ['humorous', 'sweet', 'proud'];
    const selectedType = memoryTypes[Math.min(successCount - 1, 2)];

    const memories = {
      humorous: {
        title: 'The Great Furniture Fiasco',
        description: 'Despite being an S-Rank hunter capable of defeating ancient demons, Jin-Woo struggled adorably with furniture assembly. Cha Hae-In found his determination endearing.',
        emotion: 'amused',
        affectionGain: 8
      },
      sweet: {
        title: 'Building Our Home Together',
        description: 'Working together on a simple domestic task, Jin-Woo and Cha Hae-In discovered the joy of creating something for their shared space.',
        emotion: 'content',
        affectionGain: 12
      },
      proud: {
        title: 'Master of All Trades',
        description: 'Jin-Woo approached furniture assembly with the same strategic thinking he brings to raids. Cha Hae-In was impressed by his methodical approach.',
        emotion: 'admiring',
        affectionGain: 15
      }
    };

    setFinalMemory(memories[selectedType as keyof typeof memories]);
  };

  const handleComplete = () => {
    if (finalMemory) {
      onComplete({
        id: `furniture_assembly_${Date.now()}`,
        type: 'fun',
        title: finalMemory.title,
        description: finalMemory.description,
        emotion: finalMemory.emotion,
        timestamp: new Date().toISOString(),
        location: 'apartment',
        affectionGain: finalMemory.affectionGain
      });
    }
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl h-[85vh] bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-3xl overflow-hidden shadow-2xl border border-orange-200"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Warm overlay for cozy home feeling */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-orange-900/30 to-red-900/20" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-orange-800 hover:bg-orange-200/50"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Header */}
          <div className="absolute top-6 left-6 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-orange-900">Furniture Assembly</h1>
                <p className="text-orange-700">Building our home together</p>
              </div>
            </div>
          </div>

          {!showResults ? (
            /* Assembly Phase */
            <div className="flex items-center justify-center h-full pt-20">
              <div className="w-full max-w-3xl space-y-6">
                {/* Progress indicator */}
                <div className="flex justify-center space-x-2 mb-8">
                  {assemblyPhases.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= currentPhase ? 'bg-orange-500' : 'bg-orange-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Current phase */}
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 border border-orange-200 shadow-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-orange-900 mb-2">
                      {getCurrentPhase().title}
                    </h2>
                    <p className="text-orange-700 text-lg leading-relaxed">
                      {getCurrentPhase().description}
                    </p>
                  </div>

                  {!selectedChoice ? (
                    /* Choice selection */
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-orange-800 text-center mb-6">
                        What do you do?
                      </h3>
                      
                      {getCurrentPhase().choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceSelect(choice.id)}
                          className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-all duration-200 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-orange-900 font-medium">{choice.text}</span>
                            {choice.requiresIntelligence && (
                              <div className="flex items-center space-x-2">
                                <Brain className="w-4 h-4 text-blue-600" />
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  playerIntelligence >= choice.requiresIntelligence 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  INT {choice.requiresIntelligence}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Choice response */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-orange-100 rounded-xl p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">CH</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-orange-900 font-semibold mb-2">Cha Hae-In</h4>
                            <p className="text-orange-800 italic">
                              "{getCurrentPhase().choices.find(c => c.id === selectedChoice)?.chaResponse}"
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full">
                          <Wrench className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-800 text-sm font-medium">
                            {currentPhase < assemblyPhases.length - 1 ? 'Moving to next step...' : 'Finishing assembly...'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-2xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🛋️</div>
                  <h2 className="text-3xl font-bold text-orange-900 mb-2">Assembly Complete!</h2>
                  <p className="text-orange-700 text-lg">
                    Your {furnitureItem.name} has been successfully assembled!
                  </p>
                </motion.div>

                {finalMemory && (
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-orange-200 shadow-xl">
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <h3 className="text-xl font-bold text-orange-900">New Memory Created</h3>
                      <Star className="w-6 h-6 text-yellow-500" />
                    </div>
                    
                    <div className="text-center space-y-3">
                      <h4 className="text-lg font-semibold text-orange-800">{finalMemory.title}</h4>
                      <p className="text-orange-700">{finalMemory.description}</p>
                      
                      <div className="flex items-center justify-center space-x-6 pt-4">
                        <div className="flex items-center space-x-2 text-pink-600">
                          <Smile className="w-5 h-5" />
                          <span>+{finalMemory.affectionGain} Affection</span>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <Star className="w-5 h-5" />
                          <span>Fun Memory</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <Button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    Admire Your Work
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}