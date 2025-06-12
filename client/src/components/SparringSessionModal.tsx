import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Zap, Target, Clock, Trophy, X, Heart, Gamepad2 } from 'lucide-react';

interface SparringSessionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReturnToHub: () => void;
  playerStats: {
    level: number;
    strength: number;
    agility: number;
    vitality: number;
    energy: number;
  };
  onStatsUpdate: (updates: { energy?: number; experience?: number; affection?: number }) => void;
}

interface CombatAction {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  damage: number;
  accuracy: number;
  cooldown: number;
  description: string;
}

interface SparringStats {
  playerScore: number;
  chaScore: number;
  playerHits: number;
  chaHits: number;
  timeRemaining: number;
  round: number;
}

const COMBAT_ACTIONS: CombatAction[] = [
  {
    id: 'quick_strike',
    name: 'Quick Strike',
    icon: Sword,
    damage: 15,
    accuracy: 85,
    cooldown: 1000,
    description: 'Fast, precise attack'
  },
  {
    id: 'power_attack',
    name: 'Power Attack',
    icon: Target,
    damage: 25,
    accuracy: 65,
    cooldown: 2000,
    description: 'Slower but devastating blow'
  },
  {
    id: 'defensive_counter',
    name: 'Counter',
    icon: Shield,
    damage: 20,
    accuracy: 70,
    cooldown: 1500,
    description: 'Parry and riposte'
  },
  {
    id: 'shadow_step',
    name: 'Shadow Step',
    icon: Zap,
    damage: 18,
    accuracy: 80,
    cooldown: 1800,
    description: 'Evasive strike'
  }
];

export function SparringSessionModal({
  isVisible,
  onClose,
  onReturnToHub,
  playerStats,
  onStatsUpdate
}: SparringSessionModalProps) {
  const [gamePhase, setGamePhase] = useState<'intro' | 'combat' | 'aftermath'>('intro');
  const [sparringStats, setSparringStats] = useState<SparringStats>({
    playerScore: 0,
    chaScore: 0,
    playerHits: 0,
    chaHits: 0,
    timeRemaining: 90,
    round: 1
  });
  const [actionCooldowns, setActionCooldowns] = useState<Record<string, number>>({});
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [sessionResult, setSessionResult] = useState<'victory' | 'defeat' | 'draw' | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'character', text: string}>>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Start combat timer
  useEffect(() => {
    if (gamePhase === 'combat' && sparringStats.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSparringStats(prev => {
          const newTime = prev.timeRemaining - 1;
          if (newTime <= 0) {
            setGamePhase('aftermath');
            determineWinner(prev.playerScore, prev.chaScore);
            return { ...prev, timeRemaining: 0 };
          }
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gamePhase, sparringStats.timeRemaining]);

  // AI opponent actions
  useEffect(() => {
    if (gamePhase === 'combat' && !isPlayerTurn && sparringStats.timeRemaining > 0) {
      const aiActionTimer = setTimeout(() => {
        executeAIAction();
        setIsPlayerTurn(true);
      }, 1500 + Math.random() * 1000);

      return () => clearTimeout(aiActionTimer);
    }
  }, [isPlayerTurn, gamePhase]);

  const startSparring = () => {
    if (playerStats.energy < 30) {
      setCombatLog(['Insufficient energy for sparring session']);
      return;
    }

    setGamePhase('combat');
    setSparringStats({
      playerScore: 0,
      chaScore: 0,
      playerHits: 0,
      chaHits: 0,
      timeRemaining: 90,
      round: 1
    });
    setCombatLog(['Sparring session begins!', 'First to 5 hits or highest score wins!']);
    onStatsUpdate({ energy: playerStats.energy - 30 });
  };

  const executePlayerAction = (action: CombatAction) => {
    if (!isPlayerTurn || actionCooldowns[action.id] > 0) return;

    const isHit = Math.random() * 100 < action.accuracy;
    const damage = isHit ? action.damage + Math.floor(Math.random() * 5) : 0;
    
    if (isHit) {
      setSparringStats(prev => {
        const newPlayerHits = prev.playerHits + 1;
        
        // Check win condition with updated hits
        if (newPlayerHits >= 5) {
          setGamePhase('aftermath');
          setSessionResult('victory');
        }
        
        return {
          ...prev,
          playerScore: prev.playerScore + damage,
          playerHits: newPlayerHits
        };
      });
      setCombatLog(prev => [...prev, `You landed ${action.name} for ${damage} points!`]);
    } else {
      setCombatLog(prev => [...prev, `Your ${action.name} missed!`]);
    }

    // Set cooldown
    setActionCooldowns(prev => ({ ...prev, [action.id]: action.cooldown }));
    cooldownRef.current[action.id] = setTimeout(() => {
      setActionCooldowns(prev => ({ ...prev, [action.id]: 0 }));
    }, action.cooldown);

    setIsPlayerTurn(false);
  };

  const executeAIAction = () => {
    const action = COMBAT_ACTIONS[Math.floor(Math.random() * COMBAT_ACTIONS.length)];
    const isHit = Math.random() * 100 < (action.accuracy - 10); // Slightly reduced AI accuracy
    const damage = isHit ? action.damage + Math.floor(Math.random() * 5) : 0;
    
    if (isHit) {
      setSparringStats(prev => {
        const newChaHits = prev.chaHits + 1;
        
        // Check lose condition with updated hits
        if (newChaHits >= 5) {
          setGamePhase('aftermath');
          setSessionResult('defeat');
        }
        
        return {
          ...prev,
          chaScore: prev.chaScore + damage,
          chaHits: newChaHits
        };
      });
      setCombatLog(prev => [...prev, `Cha Hae-In's ${action.name} hits for ${damage} points!`]);
    } else {
      setCombatLog(prev => [...prev, `Cha Hae-In's ${action.name} missed!`]);
    }
  };

  const determineWinner = (playerScore: number, chaScore: number) => {
    if (playerScore > chaScore) {
      setSessionResult('victory');
    } else if (chaScore > playerScore) {
      setSessionResult('defeat');
    } else {
      setSessionResult('draw');
    }
  };

  const completeSession = () => {
    // Calculate rewards based on performance
    const performanceRatio = sparringStats.playerScore / Math.max(sparringStats.chaScore, 1);
    const baseXP = 50;
    const bonusXP = Math.floor(performanceRatio * 25);
    const affectionGain = sessionResult === 'draw' ? 3 : sessionResult === 'victory' ? 2 : 1;

    onStatsUpdate({
      experience: baseXP + bonusXP,
      affection: affectionGain
    });

    // Generate aftermath conversation if not already shown
    if (conversationHistory.length === 0) {
      generateAftermathConversation();
    } else {
      // If conversation already shown, close the session
      onClose();
    }
  };

  const generateAftermathConversation = () => {
    const responses = {
      victory: [
        "Impressive technique. You've been training.",
        "That was... unexpected. Well fought.",
        "I see why you're advancing so quickly."
      ],
      defeat: [
        "Good effort, but your defense needs work.",
        "Don't be discouraged. Growth comes from challenge.",
        "Your potential is clear, even in defeat."
      ],
      draw: [
        "Perfectly matched. This was exactly what I hoped for.",
        "A draw between equals. Remarkable.",
        "We both pushed each other to improve."
      ]
    };

    const response = responses[sessionResult || 'draw'][Math.floor(Math.random() * 3)];
    setConversationHistory([
      { type: 'character', text: response }
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-400/30 rounded-2xl overflow-hidden relative"
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="absolute top-4 right-4 z-10 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Training Center Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-800/50 via-slate-900/70 to-black/80" />
          
          {gamePhase === 'intro' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <Gamepad2 className="w-16 h-16 text-purple-400 mx-auto" />
                  <h2 className="text-4xl font-bold text-white">Elite Training Center</h2>
                  <p className="text-xl text-purple-200">Sparring Session with Cha Hae-In</p>
                </div>

                <div className="space-y-4 max-w-2xl">
                  <p className="text-white/80">
                    Test your skills in a friendly but intense sparring match. 
                    This isn't about winning or losing—it's about mutual respect and growth.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <h4 className="text-purple-300 font-semibold">Objective</h4>
                      <p className="text-white/70">First to 5 hits or highest score in 90 seconds</p>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <h4 className="text-purple-300 font-semibold">Energy Cost</h4>
                      <p className="text-white/70">30 Energy Points</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={startSparring}
                    disabled={playerStats.energy < 30}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                  >
                    Begin Sparring Session
                  </Button>
                  
                  {playerStats.energy < 30 && (
                    <p className="text-red-400">Insufficient energy (Need 30, have {playerStats.energy})</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {gamePhase === 'combat' && (
            <div className="relative z-10 h-full flex flex-col">
              {/* Combat UI Header */}
              <div className="bg-black/50 p-4 border-b border-purple-400/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{sparringStats.playerScore}</div>
                      <div className="text-sm text-purple-300">Your Score</div>
                    </div>
                    <div className="text-white text-xl">VS</div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{sparringStats.chaScore}</div>
                      <div className="text-sm text-purple-300">Cha Hae-In</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5" />
                      <span className="text-xl font-mono">{formatTime(sparringStats.timeRemaining)}</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-lg text-white">{sparringStats.playerHits}/5 - {sparringStats.chaHits}/5</div>
                    <div className="text-sm text-purple-300">Hits Landed</div>
                  </div>
                </div>
              </div>

              {/* Combat Arena */}
              <div className="flex-1 flex">
                {/* Combat Actions */}
                <div className="w-80 bg-black/30 p-6 space-y-4">
                  <h3 className="text-white font-semibold text-lg">Combat Actions</h3>
                  
                  {COMBAT_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    const onCooldown = (actionCooldowns[action.id] || 0) > 0;
                    
                    return (
                      <Button
                        key={action.id}
                        onClick={() => executePlayerAction(action)}
                        disabled={!isPlayerTurn || onCooldown}
                        className={`w-full p-4 h-auto flex items-start gap-3 ${
                          !isPlayerTurn || onCooldown 
                            ? 'bg-gray-600/50 cursor-not-allowed' 
                            : 'bg-purple-600/80 hover:bg-purple-600'
                        }`}
                      >
                        <Icon className="w-5 h-5 mt-1" />
                        <div className="text-left">
                          <div className="font-semibold">{action.name}</div>
                          <div className="text-xs opacity-80">{action.description}</div>
                          <div className="text-xs mt-1">
                            {action.damage} dmg | {action.accuracy}% acc
                          </div>
                          {onCooldown && (
                            <div className="text-xs text-yellow-300">
                              Cooldown: {Math.ceil(actionCooldowns[action.id] / 1000)}s
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                  
                  {!isPlayerTurn && (
                    <div className="text-center text-purple-300 p-4">
                      <div className="animate-pulse">Cha Hae-In's turn...</div>
                    </div>
                  )}
                </div>

                {/* Combat Log */}
                <div className="flex-1 p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Combat Log</h3>
                  <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto space-y-2">
                    {combatLog.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-white/80 text-sm"
                      >
                        {log}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'aftermath' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl"
              >
                <div className="space-y-4">
                  <Trophy className={`w-16 h-16 mx-auto ${
                    sessionResult === 'victory' ? 'text-yellow-400' :
                    sessionResult === 'draw' ? 'text-purple-400' : 'text-gray-400'
                  }`} />
                  
                  <h2 className="text-4xl font-bold text-white">
                    {sessionResult === 'victory' ? 'Victory!' :
                     sessionResult === 'draw' ? 'Perfect Match!' : 'Valiant Effort!'}
                  </h2>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{sparringStats.playerScore}</div>
                      <div className="text-sm text-purple-300">Your Score</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{sparringStats.chaScore}</div>
                      <div className="text-sm text-purple-300">Cha Hae-In's Score</div>
                    </div>
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-white">{sparringStats.playerHits}/{sparringStats.chaHits}</div>
                      <div className="text-sm text-purple-300">Hits Landed</div>
                    </div>
                  </div>
                </div>

                {/* Aftermath Conversation */}
                {conversationHistory.length > 0 && (
                  <div className="bg-black/30 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">Cha Hae-In</div>
                        <div className="text-purple-300 text-sm">Post-sparring reflection</div>
                      </div>
                    </div>
                    
                    {conversationHistory.map((entry, index) => (
                      <div key={index} className="text-white text-left bg-black/20 p-4 rounded-lg">
                        "{entry.text}"
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    onClick={completeSession}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
                  >
                    {conversationHistory.length === 0 ? 'Complete Training Session' : 'Finish & Return'}
                  </Button>
                  
                  <Button
                    onClick={onReturnToHub}
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Return to Daily Life Hub
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}