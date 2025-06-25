import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Moon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackRubActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (affectionGain: number, moodBoost: boolean) => void;
  backgroundImage?: string;
}

interface DialogueChoice {
  id: string;
  text: string;
  type: 'gentle' | 'caring' | 'romantic' | 'thoughtful';
  chaResponse: string;
  affectionImpact: number;
  moodImpact: boolean;
  nextPhase?: string;
}

interface ActivityPhase {
  id: string;
  title: string;
  description: string;
  choices: DialogueChoice[];
  atmosphere: 'calm' | 'intimate' | 'peaceful' | 'tender';
}

export function BackRubActivityModal({ isVisible, onClose, onComplete, backgroundImage }: BackRubActivityModalProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [totalAffection, setTotalAffection] = useState(0);
  const [moodBoostAchieved, setMoodBoostAchieved] = useState(false);
  const [activityProgress, setActivityProgress] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const activityPhases: ActivityPhase[] = [
    {
      id: 'setting_mood',
      title: 'Setting the Scene',
      description: 'The apartment is quiet in the evening light. Cha Hae-In sits on the couch, rolling her shoulders with a tired sigh after a long day of hunter duties. You notice the tension in her posture.',
      atmosphere: 'calm',
      choices: [
        {
          id: 'gentle_offer',
          text: '*Sit beside her quietly* "You look tired. Would you like me to help with that tension?"',
          type: 'caring',
          chaResponse: 'That would be... really nice, actually. Today was particularly draining.',
          affectionImpact: 8,
          moodImpact: true,
          nextPhase: 'beginning_massage'
        },
        {
          id: 'direct_approach',
          text: '"Come here. Let me take care of you for a while."',
          type: 'romantic',
          chaResponse: 'Jin-Woo... you always know exactly what I need. Thank you.',
          affectionImpact: 10,
          moodImpact: true,
          nextPhase: 'beginning_massage'
        },
        {
          id: 'thoughtful_observation',
          text: '"You\'ve been carrying a lot of stress in your shoulders. May I?"',
          type: 'thoughtful',
          chaResponse: 'You notice everything, don\'t you? I didn\'t realize it was that obvious.',
          affectionImpact: 12,
          moodImpact: true,
          nextPhase: 'beginning_massage'
        }
      ]
    },
    {
      id: 'beginning_massage',
      title: 'Gentle Touch',
      description: 'Cha Hae-In settles comfortably as you position yourself to help ease her tension. The room feels peaceful, with soft light filtering through the windows.',
      atmosphere: 'intimate',
      choices: [
        {
          id: 'start_gentle',
          text: '*Place hands gently on her shoulders* "Is the pressure okay?"',
          type: 'caring',
          chaResponse: 'Perfect. Your hands are so warm... this feels wonderful.',
          affectionImpact: 8,
          moodImpact: true,
          nextPhase: 'deepening_care'
        },
        {
          id: 'check_comfort',
          text: '*Begin with light touches* "Tell me if anything feels uncomfortable."',
          type: 'thoughtful',
          chaResponse: 'You\'re being so careful with me. I feel completely safe in your hands.',
          affectionImpact: 10,
          moodImpact: true,
          nextPhase: 'deepening_care'
        },
        {
          id: 'focus_tension',
          text: '*Work carefully at the knots of tension* "I can feel how hard you\'ve been working."',
          type: 'gentle',
          chaResponse: 'Mmm... you have magic fingers. How did you know exactly where it hurt?',
          affectionImpact: 9,
          moodImpact: true,
          nextPhase: 'deepening_care'
        }
      ]
    },
    {
      id: 'deepening_care',
      title: 'Deeper Connection',
      description: 'As you continue, Cha Hae-In relaxes more deeply. Her breathing becomes slower and more peaceful. The intimacy of the moment grows naturally.',
      atmosphere: 'tender',
      choices: [
        {
          id: 'whisper_caring',
          text: '*Whisper softly* "You deserve to relax. You do so much for everyone."',
          type: 'romantic',
          chaResponse: 'Jin-Woo... hearing you say that means everything to me. Thank you for seeing me.',
          affectionImpact: 15,
          moodImpact: true,
          nextPhase: 'peaceful_conclusion'
        },
        {
          id: 'gentle_praise',
          text: '"You\'re always so strong for everyone else. Let me be strong for you tonight."',
          type: 'caring',
          chaResponse: 'Sometimes I forget what it feels like to be taken care of. You remind me.',
          affectionImpact: 12,
          moodImpact: true,
          nextPhase: 'peaceful_conclusion'
        },
        {
          id: 'continue_silently',
          text: '*Continue massaging in comfortable silence, letting actions speak louder than words*',
          type: 'thoughtful',
          chaResponse: 'This quiet moment with you... it\'s exactly what my heart needed.',
          affectionImpact: 10,
          moodImpact: true,
          nextPhase: 'peaceful_conclusion'
        }
      ]
    },
    {
      id: 'peaceful_conclusion',
      title: 'Gentle Conclusion',
      description: 'The massage comes to a natural end. Cha Hae-In looks completely relaxed, her usual tension melted away. The atmosphere is filled with warmth and care.',
      atmosphere: 'peaceful',
      choices: [
        {
          id: 'tender_finish',
          text: '*Gently rest hands on her shoulders* "How do you feel?"',
          type: 'caring',
          chaResponse: 'Like I could melt. I haven\'t felt this relaxed in months. Thank you, my love.',
          affectionImpact: 10,
          moodImpact: true
        },
        {
          id: 'loving_gesture',
          text: '*Softly kiss the top of her head* "I love taking care of you."',
          type: 'romantic',
          chaResponse: 'And I love how safe you make me feel. In your hands, I can let go of everything.',
          affectionImpact: 18,
          moodImpact: true
        },
        {
          id: 'quiet_appreciation',
          text: '*Sit quietly beside her, enjoying the peaceful moment together*',
          type: 'thoughtful',
          chaResponse: 'Sometimes the most beautiful moments are the quiet ones like this.',
          affectionImpact: 12,
          moodImpact: true
        }
      ]
    }
  ];

  const getCurrentPhase = () => activityPhases[currentPhase];

  const handleChoiceSelect = (choiceId: string) => {
    const choice = getCurrentPhase().choices.find(c => c.id === choiceId);
    if (!choice) return;

    setSelectedChoice(choiceId);
    setTotalAffection(prev => prev + choice.affectionImpact);
    if (choice.moodImpact) setMoodBoostAchieved(true);
    setActivityProgress(prev => [...prev, choice.type]);

    setTimeout(() => {
      if (currentPhase < activityPhases.length - 1) {
        setCurrentPhase(prev => prev + 1);
        setSelectedChoice(null);
      } else {
        setShowResults(true);
      }
    }, 3500);
  };

  const handleComplete = () => {
    onComplete(totalAffection, moodBoostAchieved);
    onClose();
  };

  const getAtmosphereColor = (atmosphere: string) => {
    switch (atmosphere) {
      case 'calm': return 'from-blue-50 to-indigo-50';
      case 'intimate': return 'from-purple-50 to-pink-50';
      case 'peaceful': return 'from-green-50 to-blue-50';
      case 'tender': return 'from-rose-50 to-orange-50';
      default: return 'from-gray-50 to-blue-50';
    }
  };

  const getCareQuality = () => {
    const gentleCount = activityProgress.filter(type => type === 'gentle' || type === 'caring').length;
    const romanticCount = activityProgress.filter(type => type === 'romantic').length;
    const thoughtfulCount = activityProgress.filter(type => type === 'thoughtful').length;

    if (romanticCount >= 2) return 'Deeply Romantic';
    if (thoughtfulCount >= 2) return 'Exceptionally Thoughtful';
    if (gentleCount >= 2) return 'Wonderfully Gentle';
    return 'Beautifully Caring';
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-4xl h-[85vh] bg-gradient-to-br ${getAtmosphereColor(getCurrentPhase()?.atmosphere || 'calm')} rounded-3xl overflow-hidden shadow-2xl border border-white/30`}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Soft overlay for intimate atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-pink-900/15 to-blue-900/10" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-purple-700 hover:bg-purple-100/50"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Header */}
          <div className="absolute top-6 left-6 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-purple-900">Gentle Care</h1>
                <p className="text-purple-700">A moment of tender intimacy</p>
              </div>
            </div>
          </div>

          {/* Evening atmosphere indicator */}
          <div className="absolute top-6 right-20 z-40 flex items-center space-x-2 bg-white/20 backdrop-blur-md rounded-full px-3 py-2">
            <Moon className="w-4 h-4 text-purple-600" />
            <span className="text-purple-800 text-sm font-medium">Evening</span>
          </div>

          {!showResults ? (
            /* Activity Phase */
            <div className="flex items-center justify-center h-full pt-20">
              <div className="w-full max-w-3xl space-y-6">
                {/* Progress indicator */}
                <div className="flex justify-center space-x-2 mb-8">
                  {activityPhases.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${
                        index <= currentPhase ? 'bg-pink-500' : 'bg-pink-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Current phase */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 border border-white/40 shadow-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-900 mb-4">
                      {getCurrentPhase().title}
                    </h2>
                    <p className="text-purple-800 text-lg leading-relaxed italic">
                      {getCurrentPhase().description}
                    </p>
                  </div>

                  {!selectedChoice ? (
                    /* Choice selection */
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-purple-800 text-center mb-6">
                        How do you respond?
                      </h3>
                      
                      {getCurrentPhase().choices.map((choice) => (
                        <button
                          key={choice.id}
                          onClick={() => handleChoiceSelect(choice.id)}
                          className="w-full p-5 bg-white/60 hover:bg-white/80 rounded-xl border border-purple-200/50 transition-all duration-200 text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-purple-900 font-medium group-hover:text-purple-700">
                              {choice.text}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                choice.type === 'romantic' ? 'bg-pink-100 text-pink-700' :
                                choice.type === 'caring' ? 'bg-purple-100 text-purple-700' :
                                choice.type === 'gentle' ? 'bg-blue-100 text-blue-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {choice.type}
                              </span>
                              <Heart className="w-4 h-4 text-pink-500" />
                              <span className="text-pink-600 text-sm font-bold">+{choice.affectionImpact}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    /* Choice response */
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="bg-gradient-to-r from-pink-100/80 to-purple-100/80 rounded-xl p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold">CH</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-purple-900 font-semibold mb-2">Cha Hae-In</h4>
                            <p className="text-purple-800 italic leading-relaxed">
                              "{getCurrentPhase().choices.find(c => c.id === selectedChoice)?.chaResponse}"
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-200/60 to-purple-200/60 rounded-full">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <span className="text-purple-800 font-medium">
                            {currentPhase < activityPhases.length - 1 ? 'Continuing gentle care...' : 'Completing this tender moment...'}
                          </span>
                          <Sparkles className="w-5 h-5 text-purple-600" />
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
                  <div className="text-6xl mb-4">💆‍♀️</div>
                  <h2 className="text-3xl font-bold text-purple-900 mb-2">Perfect Care</h2>
                  <p className="text-purple-700 text-lg">
                    You provided exactly what Cha Hae-In needed tonight
                  </p>
                </motion.div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/40 shadow-xl">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-bold text-purple-900">Intimate Care Experience</h3>
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full">
                      <span className="text-purple-800 font-semibold">{getCareQuality()}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <div className="text-center">
                        <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                        <div className="text-pink-600 font-bold text-xl">+{totalAffection}</div>
                        <div className="text-sm text-purple-700">Affection Gained</div>
                      </div>
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                        <div className="text-purple-600 font-bold text-xl">
                          {moodBoostAchieved ? 'Achieved' : 'Standard'}
                        </div>
                        <div className="text-sm text-purple-700">Mood Enhancement</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-purple-200">
                      <p className="text-purple-800 italic">
                        "Moments like these remind me why I fell in love with you. Thank you for always knowing how to care for my heart."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    Cherish This Moment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Floating decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-pink-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}