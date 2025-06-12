import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Lock, Star, Camera, MapPin, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NSeoulTowerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (memoryCreated: any) => void;
  hasLovelock?: boolean;
  backgroundImage?: string;
}

interface TowerNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  description: string;
  requiresItem?: string;
}

export function NSeoulTowerModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  hasLovelock = true,
  backgroundImage 
}: NSeoulTowerModalProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [showLockWall, setShowLockWall] = useState(false);
  const [lockPlaced, setLockPlaced] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const towerNodes: TowerNode[] = [
    {
      id: 'admire_view',
      name: 'Admire the View',
      position: { x: 30, y: 40 },
      description: 'The glittering lights of Seoul stretch endlessly below, creating a breathtaking panorama.'
    },
    {
      id: 'wall_of_locks',
      name: 'The Wall of Locks',
      position: { x: 70, y: 30 },
      description: 'Thousands of padlocks left by couples, each one a promise of eternal love.',
      requiresItem: 'padlock'
    },
    {
      id: 'photo_spot',
      name: 'Perfect Photo Spot',
      position: { x: 50, y: 60 },
      description: 'A scenic spot where couples capture their special moments with the city backdrop.'
    },
    {
      id: 'observation_deck',
      name: 'Observation Deck Rail',
      position: { x: 20, y: 70 },
      description: 'The glass barriers offer an unobstructed view while keeping visitors safe.'
    }
  ];

  const handleNodeInteraction = (nodeId: string) => {
    const node = towerNodes.find(n => n.id === nodeId);
    if (!node) return;

    setSelectedNode(nodeId);

    switch (nodeId) {
      case 'admire_view':
        setCinematicMode(true);
        setTimeout(() => {
          setCinematicMode(false);
          setSelectedNode(null);
        }, 4000);
        break;
      case 'wall_of_locks':
        if (hasLovelock) {
          setShowLockWall(true);
        } else {
          // Show message about needing a padlock
          setTimeout(() => setSelectedNode(null), 3000);
        }
        break;
      case 'photo_spot':
        setTimeout(() => setSelectedNode(null), 3000);
        break;
      case 'observation_deck':
        setTimeout(() => setSelectedNode(null), 3000);
        break;
    }
  };

  const handleLockPlacement = () => {
    setLockPlaced(true);
    setTimeout(() => {
      setShowLockWall(false);
      setShowResults(true);
    }, 3000);
  };

  const createMemory = () => {
    return {
      id: `n_seoul_tower_${Date.now()}`,
      type: 'romantic_milestone',
      title: 'Promise at the Tower',
      description: 'Under the glittering lights of Seoul, Jin-Woo and Cha Hae-In shared a perfect moment at N Seoul Tower, sealing their promise with a love lock among thousands of others.',
      emotion: 'deeply_romantic',
      timestamp: new Date().toISOString(),
      location: 'n_seoul_tower',
      affectionGain: 25,
      memoryRank: 'S',
      specialEffects: ['romantic_milestone', 'city_lights', 'eternal_promise']
    };
  };

  const handleComplete = () => {
    const memory = createMemory();
    onComplete(memory);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl border border-purple-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Night sky overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-purple-900/50 to-black/80" />
          
          {/* Twinkling stars */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 50}%`,
                }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">N Seoul Tower</h1>
                <p className="text-purple-200">Observation Deck - 236m Above Seoul</p>
              </div>
            </div>
          </div>

          {/* Time indicator */}
          <div className="absolute top-6 right-20 z-40 flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-white text-sm font-medium">Night</span>
          </div>

          {!cinematicMode && !showLockWall && !showResults ? (
            /* Main Tower View */
            <div className="relative h-full pt-24">
              {/* City lights backdrop */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-yellow-500/20 via-orange-500/10 to-transparent" />
              
              {/* Interactive nodes */}
              {towerNodes.map((node) => (
                <motion.button
                  key={node.id}
                  onClick={() => handleNodeInteraction(node.id)}
                  className="absolute w-6 h-6 bg-white/80 hover:bg-white rounded-full border-2 border-purple-400 shadow-lg cursor-pointer z-30"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`,
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-full h-full rounded-full bg-purple-400" />
                </motion.button>
              ))}

              {/* Node labels */}
              {towerNodes.map((node) => (
                <div
                  key={`label-${node.id}`}
                  className="absolute text-white text-sm font-medium bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 pointer-events-none z-20"
                  style={{
                    left: `${node.position.x + 3}%`,
                    top: `${node.position.y - 8}%`,
                  }}
                >
                  {node.name}
                </div>
              ))}

              {/* Cha Hae-In position */}
              <div className="absolute bottom-32 right-1/4">
                <div className="w-16 h-20 bg-gradient-to-b from-yellow-300 to-orange-400 rounded-full opacity-80" />
                <div className="text-center mt-2">
                  <span className="text-white text-sm font-semibold bg-black/60 rounded-lg px-2 py-1">
                    Cha Hae-In
                  </span>
                </div>
              </div>

              {/* Selected node interaction */}
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-xl p-6 border border-white/20"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CH</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">Cha Hae-In</h4>
                      <p className="text-white/90 italic">
                        {selectedNode === 'admire_view' && '"This view... it\'s incredible. I can see the entire city from here. Thank you for bringing me to this special place."'}
                        {selectedNode === 'photo_spot' && '"Should we take a picture here? I want to remember this moment forever."'}
                        {selectedNode === 'observation_deck' && '"It\'s so peaceful up here, away from all the chaos of hunting. Just you, me, and the city lights."'}
                        {selectedNode === 'wall_of_locks' && !hasLovelock && '"I\'ve heard about this tradition... couples place locks here as a symbol of their eternal love. Do you have a padlock with you?"'}
                        {selectedNode === 'wall_of_locks' && hasLovelock && '"I\'ve always wanted to do this... placing our own lock among all these promises of love."'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : cinematicMode ? (
            /* Cinematic Mode */
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 max-w-3xl"
              >
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <Music className="w-8 h-8 text-purple-400" />
                  <span className="text-purple-300 text-lg">♪ Romantic Theme Playing ♪</span>
                  <Music className="w-8 h-8 text-purple-400" />
                </div>
                
                <h2 className="text-4xl font-bold text-white mb-6">A Perfect Moment</h2>
                
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 border border-white/20">
                  <p className="text-white text-xl leading-relaxed italic">
                    "The city spreads out before us like a constellation fallen to earth. Seoul's millions of lights twinkle in the darkness, each one representing a life, a dream, a story. But tonight, standing here with you, it feels like our story is the only one that matters."
                  </p>
                  
                  <div className="mt-6 flex items-center justify-center space-x-4">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-white/80">Capturing this eternal moment...</span>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : showLockWall ? (
            /* Love Lock Wall Scene */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-4xl space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-4">The Wall of Eternal Promises</h2>
                  <p className="text-purple-200 text-lg">Thousands of love locks glisten under the tower's lights</p>
                </div>

                <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 border border-white/20">
                  {!lockPlaced ? (
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">CH</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-3">Cha Hae-In</h4>
                          <p className="text-white/90 text-lg italic mb-6">
                            "I've dreamed of this moment... placing our lock here among all these promises. Jin-Woo, this represents our bond, stronger than any magic, more enduring than any hunter's power."
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <Button
                          onClick={handleLockPlacement}
                          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
                        >
                          <Lock className="w-6 h-6 mr-3" />
                          Place Our Love Lock
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-2xl font-bold text-white">Promise Sealed</h3>
                      <p className="text-white/90 text-lg italic">
                        "Our lock now joins the countless others, a testament to our love that will endure for all time. No matter what dangers we face as hunters, this promise will remain."
                      </p>
                      
                      <div className="flex items-center justify-center space-x-6 pt-4">
                        <div className="flex items-center space-x-2 text-pink-400">
                          <Heart className="w-6 h-6" />
                          <span>+25 Affection</span>
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Star className="w-6 h-6" />
                          <span>S-Rank Memory</span>
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
                  <div className="text-6xl mb-4">🌃</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Perfect Evening</h2>
                  <p className="text-purple-200 text-lg">
                    A romantic milestone at Seoul's most iconic landmark
                  </p>
                </motion.div>

                <div className="bg-black/60 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <Star className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-xl font-bold text-white">S-Rank Memory Created</h3>
                    <Star className="w-6 h-6 text-yellow-500" />
                  </div>
                  
                  <div className="text-center space-y-3">
                    <h4 className="text-lg font-semibold text-purple-200">Promise at the Tower</h4>
                    <p className="text-white/80">
                      A perfect romantic evening that will be remembered forever, sealed with an eternal promise among the city lights.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer z-50 relative"
                    style={{ pointerEvents: 'auto' }}
                  >
                    Treasure This Memory
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}