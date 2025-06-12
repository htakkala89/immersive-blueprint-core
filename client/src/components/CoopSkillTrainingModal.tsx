import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, TrendingUp, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoopSkillTrainingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (synergyBonus: number) => void;
  backgroundImage?: string;
}

interface SkillPrompt {
  id: string;
  skill: 'shadow_extraction' | 'sword_strike' | 'rapid_movement' | 'synchronized_attack';
  timing: number;
  duration: number;
  chaAction: string;
}

const SKILL_ICONS = {
  shadow_extraction: '👤',
  sword_strike: '⚔️',
  rapid_movement: '💨',
  synchronized_attack: '🤝'
};

const SKILL_NAMES = {
  shadow_extraction: 'Shadow Extraction',
  sword_strike: 'Precision Strike',
  rapid_movement: 'Swift Movement',
  synchronized_attack: 'Synergy Attack'
};

export function CoopSkillTrainingModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  backgroundImage 
}: CoopSkillTrainingModalProps) {
  const [gamePhase, setGamePhase] = useState<'briefing' | 'countdown' | 'training' | 'results'>('briefing');
  const [currentPrompt, setCurrentPrompt] = useState<SkillPrompt | null>(null);
  const [syncMeter, setSyncMeter] = useState(0);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [promptIndex, setPromptIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [hitResults, setHitResults] = useState<string[]>([]);

  const gameTimerRef = useRef<NodeJS.Timeout>();
  const promptTimerRef = useRef<NodeJS.Timeout>();

  const skillSequence: SkillPrompt[] = [
    { id: '1', skill: 'shadow_extraction', timing: 2000, duration: 1500, chaAction: 'Cha Hae-In draws her sword in preparation' },
    { id: '2', skill: 'rapid_movement', timing: 4000, duration: 1000, chaAction: 'She moves into flanking position' },
    { id: '3', skill: 'sword_strike', timing: 6000, duration: 1200, chaAction: 'Executes a precise blade technique' },
    { id: '4', skill: 'synchronized_attack', timing: 8500, duration: 2000, chaAction: 'Prepares for combined assault' },
    { id: '5', skill: 'shadow_extraction', timing: 11000, duration: 1500, chaAction: 'Maintains defensive stance' },
    { id: '6', skill: 'rapid_movement', timing: 13500, duration: 1000, chaAction: 'Repositions for optimal synergy' },
    { id: '7', skill: 'synchronized_attack', timing: 16000, duration: 2000, chaAction: 'Channels energy for ultimate combo' },
    { id: '8', skill: 'sword_strike', timing: 19000, duration: 1200, chaAction: 'Delivers devastating finishing move' }
  ];

  useEffect(() => {
    if (gamePhase === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => {
        if (countdown === 1) {
          setGamePhase('training');
          startTrainingSequence();
        } else {
          setCountdown(prev => prev - 1);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, countdown]);

  const startTrainingSequence = () => {
    setTimeRemaining(30);
    setPromptIndex(0);
    setMaxScore(skillSequence.length * 100);

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          endTraining();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start skill prompt sequence
    scheduleNextPrompt();
  };

  const scheduleNextPrompt = () => {
    if (promptIndex < skillSequence.length) {
      const prompt = skillSequence[promptIndex];
      
      promptTimerRef.current = setTimeout(() => {
        setCurrentPrompt(prompt);
        
        // Auto-clear prompt after duration
        setTimeout(() => {
          if (currentPrompt?.id === prompt.id) {
            setCurrentPrompt(null);
            setPromptIndex(prev => prev + 1);
            scheduleNextPrompt();
          }
        }, prompt.duration);
      }, prompt.timing - (promptIndex * 2500));
    }
  };

  const handleSkillInput = (skill: string) => {
    if (!currentPrompt) return;

    const isCorrect = currentPrompt.skill === skill;
    const timing = Date.now();
    
    if (isCorrect) {
      const points = 100;
      setScore(prev => prev + points);
      setSyncMeter(prev => Math.min(100, prev + 15));
      setHitResults(prev => [...prev, 'Perfect!']);
    } else {
      setSyncMeter(prev => Math.max(0, prev - 10));
      setHitResults(prev => [...prev, 'Miss!']);
    }

    // Clear current prompt and move to next
    setCurrentPrompt(null);
    setPromptIndex(prev => prev + 1);
    scheduleNextPrompt();
  };

  const endTraining = () => {
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    setGamePhase('results');
  };

  const calculateSynergyBonus = () => {
    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (accuracy >= 90) return 1;
    if (accuracy >= 75) return 0.8;
    if (accuracy >= 60) return 0.6;
    if (accuracy >= 45) return 0.4;
    return 0.2;
  };

  const getPerformanceRating = () => {
    const accuracy = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (accuracy >= 90) return 'Perfect Synchronization';
    if (accuracy >= 75) return 'Excellent Teamwork';
    if (accuracy >= 60) return 'Good Coordination';
    if (accuracy >= 45) return 'Needs Practice';
    return 'Poor Sync';
  };

  const handleComplete = () => {
    const bonus = calculateSynergyBonus();
    onComplete(bonus);
    onClose();
  };

  const handleRestart = () => {
    setGamePhase('countdown');
    setCountdown(3);
    setScore(0);
    setSyncMeter(0);
    setCurrentPrompt(null);
    setPromptIndex(0);
    setHitResults([]);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl border border-cyan-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Tech overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 via-blue-900/70 to-indigo-900/60" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Header */}
          <div className="absolute top-6 left-6 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Elite Training Center</h1>
                <p className="text-cyan-200">Co-op Skill Synchronization</p>
              </div>
            </div>
          </div>

          {gamePhase === 'briefing' ? (
            /* Briefing Phase */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-3xl space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-4">Synergy Training Protocol</h2>
                  <p className="text-cyan-200 text-lg">Synchronize your abilities with Cha Hae-In to improve combat effectiveness</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-cyan-400/30">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {Object.entries(SKILL_NAMES).map(([key, name]) => (
                      <div key={key} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <span className="text-2xl">{SKILL_ICONS[key as keyof typeof SKILL_ICONS]}</span>
                        <span className="text-white font-medium">{name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 text-cyan-100">
                    <p>• Watch for Cha Hae-In's movements and respond with the matching skill</p>
                    <p>• Perfect timing builds your Sync Meter and unlocks combo bonuses</p>
                    <p>• Higher accuracy provides permanent synergy gauge improvement</p>
                    <p>• Training duration: 30 seconds of intensive coordination</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => setGamePhase('countdown')}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-lg"
                  >
                    Begin Training
                  </Button>
                </div>
              </div>
            </div>
          ) : gamePhase === 'countdown' ? (
            /* Countdown Phase */
            <div className="flex items-center justify-center h-full">
              <motion.div
                key={countdown}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="text-center"
              >
                <div className="text-8xl font-bold text-white mb-4">{countdown}</div>
                <div className="text-xl text-cyan-200">Get ready to synchronize...</div>
              </motion.div>
            </div>
          ) : gamePhase === 'training' ? (
            /* Training Phase */
            <div className="flex flex-col h-full pt-20">
              {/* HUD */}
              <div className="flex justify-between items-center px-8 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="text-white">
                    <span className="text-2xl font-bold">{score}</span>
                    <span className="text-cyan-300 ml-2">/ {maxScore}</span>
                  </div>
                  <div className="w-32 h-4 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: `${syncMeter}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-cyan-300 text-sm">Sync: {syncMeter}%</span>
                </div>
                
                <div className="text-white text-xl font-bold">
                  {timeRemaining}s
                </div>
              </div>

              {/* Training Area */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-4xl">
                  {/* Cha Hae-In Action Display */}
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">CH</span>
                    </div>
                    {currentPrompt && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/60 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto"
                      >
                        <p className="text-white italic">{currentPrompt.chaAction}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Skill Input Buttons */}
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    {Object.entries(SKILL_NAMES).map(([key, name]) => (
                      <motion.button
                        key={key}
                        onClick={() => handleSkillInput(key)}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                          currentPrompt?.skill === key
                            ? 'bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-400/50'
                            : 'bg-white/10 border-white/30 hover:bg-white/20'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-3xl mb-2">{SKILL_ICONS[key as keyof typeof SKILL_ICONS]}</div>
                        <div className="text-white font-semibold">{name}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Recent Hit Results */}
                  <div className="mt-6 flex justify-center space-x-2">
                    {hitResults.slice(-5).map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          result === 'Perfect!' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                      >
                        {result}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Results Phase */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-2xl space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Training Complete</h2>
                  <p className="text-cyan-200 text-lg">{getPerformanceRating()}</p>
                </motion.div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-cyan-400/30">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">{score}</div>
                      <div className="text-cyan-300">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{Math.round((score / maxScore) * 100)}%</div>
                      <div className="text-cyan-300">Accuracy</div>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center space-x-4">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                      <span className="text-white font-semibold">
                        +{calculateSynergyBonus()}% Synergy Gauge Fill Rate
                      </span>
                    </div>
                    <p className="text-cyan-200 text-sm">
                      Permanent improvement to combat coordination with Cha Hae-In
                    </p>
                  </div>
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button
                    onClick={handleRestart}
                    variant="outline"
                    className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Train Again
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                  >
                    <Award className="w-5 h-5 mr-2" />
                    Complete Training
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