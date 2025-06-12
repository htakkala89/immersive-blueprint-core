import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sword, Shield, Coins, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClearLowRankGateModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGateSelect: (gateId: string) => void;
  backgroundImage?: string;
}

interface GateOption {
  id: string;
  name: string;
  rank: 'D' | 'C';
  type: string;
  description: string;
  difficulty: 'Easy' | 'Medium';
  rewards: {
    gold: number;
    experience: number;
    affection: number;
  };
  estimatedTime: string;
  icon: string;
  color: string;
  chaHaeInComment: string;
}

export function ClearLowRankGateModal({ isVisible, onClose, onGateSelect, backgroundImage }: ClearLowRankGateModalProps) {
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const gateOptions: GateOption[] = [
    {
      id: 'd_rank_goblin_den',
      name: 'Goblin Den',
      rank: 'D',
      type: 'Extermination',
      description: 'A small cave system infested with goblins. Perfect for a quick warm-up.',
      difficulty: 'Easy',
      rewards: {
        gold: 250000,
        experience: 150,
        affection: 8
      },
      estimatedTime: '15 minutes',
      icon: '👹',
      color: 'from-green-500 to-emerald-600',
      chaHaeInComment: 'These should be easy to clear together. Good way to stay sharp.'
    },
    {
      id: 'c_rank_orc_encampment',
      name: 'Orc Encampment',
      rank: 'C',
      type: 'Raid',
      description: 'An organized orc settlement with multiple enemy types and a mini-boss.',
      difficulty: 'Medium',
      rewards: {
        gold: 500000,
        experience: 300,
        affection: 12
      },
      estimatedTime: '25 minutes',
      icon: '⚔️',
      color: 'from-orange-500 to-red-600',
      chaHaeInComment: 'A bit more challenging, but nothing we can\'t handle as a team.'
    },
    {
      id: 'd_rank_crystal_mines',
      name: 'Crystal Mines',
      rank: 'D',
      type: 'Collection',
      description: 'Ancient mines filled with magical crystals and crystal guardians.',
      difficulty: 'Easy',
      rewards: {
        gold: 300000,
        experience: 200,
        affection: 10
      },
      estimatedTime: '20 minutes',
      icon: '💎',
      color: 'from-purple-500 to-blue-600',
      chaHaeInComment: 'I always enjoy the peaceful atmosphere of crystal caves.'
    }
  ];

  const handleGateSelect = (gateId: string) => {
    setSelectedGate(gateId);
    setShowConfirmation(true);
  };

  const confirmGateSelection = () => {
    if (selectedGate) {
      onGateSelect(selectedGate);
      onClose();
    }
  };

  const getSelectedGateData = () => {
    return gateOptions.find(gate => gate.id === selectedGate);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl border border-blue-400/30 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-black/60" />
          
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-900/80 to-purple-900/80 p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                  <Sword className="w-8 h-8 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Low-Rank Gate Selection</h2>
                  <p className="text-blue-200 text-lg">Choose a gate to clear together</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <p className="text-white/90 text-sm italic">
                "Even S-Rank hunters need to stay sharp. Plus, these gates provide good income and experience without the stress of high-stakes combat."
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">CH</span>
                </div>
                <span className="text-blue-200 text-sm font-semibold">Cha Hae-In</span>
              </div>
            </div>
          </div>

          {!showConfirmation ? (
            /* Gate Selection Screen */
            <div className="relative p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-white mb-6">Available Gates</h3>
              
              {gateOptions.map((gate) => (
                <motion.button
                  key={gate.id}
                  onClick={() => handleGateSelect(gate.id)}
                  className="w-full p-6 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-4">
                    {/* Gate Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${gate.color} rounded-xl flex items-center justify-center text-2xl`}>
                      {gate.icon}
                    </div>
                    
                    {/* Gate Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-semibold text-white">{gate.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          gate.rank === 'D' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
                        }`}>
                          {gate.rank}-RANK
                        </span>
                        <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold">
                          {gate.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-300 mb-3">{gate.description}</p>
                      
                      {/* Rewards */}
                      <div className="flex items-center space-x-6 mb-3">
                        <div className="flex items-center space-x-2">
                          <Coins className="w-4 h-4 text-yellow-500" />
                          <span className="text-yellow-500 font-semibold">₩{gate.rewards.gold.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-500 font-semibold">+{gate.rewards.experience} XP</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-pink-500" />
                          <span className="text-pink-500 font-semibold">+{gate.rewards.affection} Affection</span>
                        </div>
                      </div>
                      
                      {/* Meta Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Difficulty: {gate.difficulty}</span>
                          <span>Est. Time: {gate.estimatedTime}</span>
                        </div>
                      </div>
                      
                      {/* Cha Hae-In Comment */}
                      <div className="mt-3 p-3 bg-white/5 rounded-lg border-l-2 border-blue-400">
                        <p className="text-blue-200 text-sm italic">"{gate.chaHaeInComment}"</p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            /* Confirmation Screen */
            <div className="relative p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-6 max-w-2xl">
                {(() => {
                  const gate = getSelectedGateData();
                  if (!gate) return null;
                  
                  return (
                    <>
                      <div className={`w-24 h-24 bg-gradient-to-br ${gate.color} rounded-2xl flex items-center justify-center text-4xl mx-auto`}>
                        {gate.icon}
                      </div>
                      
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">{gate.name}</h3>
                        <p className="text-xl text-blue-200">{gate.rank}-Rank {gate.type} Gate</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 space-y-4">
                        <h4 className="text-xl font-semibold text-white">Mission Briefing</h4>
                        <p className="text-gray-300">{gate.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
                          <div className="text-center">
                            <Coins className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                            <div className="text-yellow-500 font-bold">₩{gate.rewards.gold.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Gold Reward</div>
                          </div>
                          <div className="text-center">
                            <Star className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                            <div className="text-blue-500 font-bold">+{gate.rewards.experience}</div>
                            <div className="text-xs text-gray-400">Experience</div>
                          </div>
                          <div className="text-center">
                            <Zap className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                            <div className="text-pink-500 font-bold">+{gate.rewards.affection}</div>
                            <div className="text-xs text-gray-400">Affection</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 pt-4">
                        <Button
                          onClick={() => setShowConfirmation(false)}
                          variant="outline"
                          className="flex-1 border-white/30 text-white hover:bg-white/10"
                        >
                          Choose Different Gate
                        </Button>
                        <Button
                          onClick={confirmGateSelection}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          <Shield className="w-5 h-5 mr-2" />
                          Enter Gate
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}