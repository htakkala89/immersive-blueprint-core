import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Target, Trophy, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArcadeVisitModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (outcome: 'win' | 'loss', score: number) => void;
  backgroundImage?: string;
}

interface GameTarget {
  id: string;
  x: number;
  y: number;
  active: boolean;
  hit: boolean;
}

export function ArcadeVisitModal({ isVisible, onClose, onComplete, backgroundImage }: ArcadeVisitModalProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<'selection' | 'shooting' | 'results'>('selection');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<GameTarget[]>([]);
  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);

  // Generate random targets
  const generateTarget = useCallback(() => {
    const newTarget: GameTarget = {
      id: `target-${Date.now()}-${Math.random()}`,
      x: Math.random() * 80 + 10, // 10-90% of screen width
      y: Math.random() * 60 + 20, // 20-80% of screen height
      active: true,
      hit: false
    };
    return newTarget;
  }, []);

  // Start shooting gallery game
  const startShootingGame = () => {
    setGameMode('shooting');
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([generateTarget()]);
  };

  // Handle target hit
  const hitTarget = (targetId: string) => {
    setTargets(prev => prev.map(target => 
      target.id === targetId ? { ...target, hit: true, active: false } : target
    ));
    setScore(prev => prev + 100);
    
    // Add new target after a short delay
    setTimeout(() => {
      setTargets(prev => [...prev.filter(t => t.id !== targetId), generateTarget()]);
    }, 500);
  };

  // Game timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && gameMode === 'shooting') {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameMode === 'shooting') {
      // Game over
      const result = score >= 1000 ? 'win' : 'loss';
      setGameResult(result);
      setGameMode('results');
      setGameStarted(false);
    }
  }, [gameStarted, timeLeft, gameMode, score]);

  // Auto-spawn targets during game
  useEffect(() => {
    if (gameMode === 'shooting' && gameStarted) {
      const spawnInterval = setInterval(() => {
        setTargets(prev => {
          // Remove old targets and add new ones
          const activTargets = prev.filter(t => t.active);
          if (activTargets.length < 3) {
            return [...activTargets, generateTarget()];
          }
          return prev;
        });
      }, 2000);
      
      return () => clearInterval(spawnInterval);
    }
  }, [gameMode, gameStarted, generateTarget]);

  const handleComplete = () => {
    if (gameResult) {
      onComplete(gameResult, score);
    }
    onClose();
  };

  const resetGame = () => {
    setGameMode('selection');
    setGameStarted(false);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    setGameResult(null);
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
          className="relative w-full max-w-6xl h-[80vh] bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 rounded-3xl overflow-hidden shadow-2xl border border-cyan-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Neon overlay for arcade aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/60 to-cyan-900/80" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Arcade Title */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-40">
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400"
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(6, 182, 212, 0.8)',
                  '0 0 20px rgba(168, 85, 247, 0.8)',
                  '0 0 10px rgba(6, 182, 212, 0.8)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎮 NEON ARCADE 🎮
            </motion.h1>
          </div>

          {/* Game Selection Screen */}
          {gameMode === 'selection' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center space-y-8">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🎯
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">Choose Your Game!</h2>
                <p className="text-cyan-200 text-lg mb-8">Time to show off your skills to Cha Hae-In</p>
                
                <div className="space-y-4">
                  <Button
                    onClick={startShootingGame}
                    className="w-64 py-4 text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-2 border-yellow-400 shadow-lg"
                  >
                    <Target className="w-6 h-6 mr-3" />
                    TARGET SHOOTER
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Shooting Game Screen */}
          {gameMode === 'shooting' && (
            <div className="relative h-full">
              {/* Game HUD */}
              <div className="absolute top-20 left-6 right-6 flex justify-between items-center z-40">
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-cyan-400/30">
                  <div className="flex items-center space-x-4">
                    <div className="text-cyan-400 font-bold">SCORE: {score}</div>
                    <div className="text-red-400 font-bold">TIME: {timeLeft}s</div>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-purple-400/30">
                  <div className="text-purple-400 font-bold">TARGET: 1000 points to win!</div>
                </div>
              </div>

              {/* Game Area */}
              <div className="relative h-full pt-32">
                {targets.map(target => (
                  <AnimatePresence key={target.id}>
                    {target.active && !target.hit && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0, rotate: 180 }}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => hitTarget(target.id)}
                        className="absolute w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-4 border-yellow-400 shadow-lg cursor-crosshair flex items-center justify-center"
                        style={{
                          left: `${target.x}%`,
                          top: `${target.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <Target className="w-8 h-8 text-white" />
                      </motion.button>
                    )}
                    {target.hit && (
                      <motion.div
                        initial={{ scale: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        className="absolute text-yellow-400 font-bold text-2xl pointer-events-none"
                        style={{
                          left: `${target.x}%`,
                          top: `${target.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        +100
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>
          )}

          {/* Results Screen */}
          {gameMode === 'results' && gameResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center space-y-6 bg-black/60 backdrop-blur-md rounded-3xl p-12 border border-cyan-400/30">
                <motion.div
                  animate={{ rotate: gameResult === 'win' ? [0, 360] : [0, -10, 10, -10, 0] }}
                  transition={{ duration: gameResult === 'win' ? 2 : 0.5 }}
                  className="text-8xl mb-6"
                >
                  {gameResult === 'win' ? '🏆' : '😅'}
                </motion.div>
                
                <h2 className={`text-4xl font-bold ${gameResult === 'win' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {gameResult === 'win' ? 'VICTORY!' : 'NICE TRY!'}
                </h2>
                
                <div className="space-y-2">
                  <p className="text-white text-xl">Final Score: {score}</p>
                  <p className="text-cyan-200">
                    {gameResult === 'win' 
                      ? "Impressive! Cha Hae-In looks impressed by your skills."
                      : "Don't worry, even hunters have off days. Cha Hae-In seems amused."
                    }
                  </p>
                </div>

                <div className="flex items-center justify-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2 text-pink-400">
                    <Heart className="w-5 h-5" />
                    <span>+{gameResult === 'win' ? '15' : '10'} Affection</span>
                  </div>
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Star className="w-5 h-5" />
                    <span>Fun Memory</span>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6">
                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="px-6 py-3 border-cyan-400 text-cyan-400 hover:bg-cyan-400/20"
                  >
                    Play Again
                  </Button>
                  <Button
                    onClick={handleComplete}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Continue Date
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Decorative neon effects */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
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