import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Heart, 
  MessageCircle,
  TreePine,
  Coffee,
  Waves,
  Users,
  Star,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerStats {
  gold: number;
  level: number;
  experience: number;
  affectionLevel: number;
  energy: number;
  maxEnergy: number;
  apartmentTier: number;
}

interface HangangParkWalkModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReturnToHub: () => void;
  playerStats: PlayerStats;
  onStatsUpdate: (updates: { experience?: number; affection?: number; energy?: number }) => void;
  onCreateMemoryStar: (memory: { title: string; description: string; emotion: string }) => void;
}

type ActivityPhase = 'intro' | 'walking' | 'bench_conversation' | 'food_vendor' | 'reflection' | 'conclusion';

interface ConversationTopic {
  id: string;
  topic: string;
  playerPrompt: string;
  chaReaction: string;
  affectionGain: number;
  memoryPotential: boolean;
}

const CONVERSATION_TOPICS: ConversationTopic[] = [
  {
    id: 'hunter_pressure',
    topic: 'The pressure of being a Hunter',
    playerPrompt: 'Ask about the stress of being a high-ranking Hunter',
    chaReaction: '"Sometimes I wonder what my life would be like if I hadn\'t awakened... but then I remember all the people I\'ve been able to protect."',
    affectionGain: 3,
    memoryPotential: true
  },
  {
    id: 'peaceful_moments',
    topic: 'Finding peace in chaos',
    playerPrompt: 'Talk about finding calm moments like this',
    chaReaction: '"Places like this remind me there\'s still beauty in the world, beyond all the gates and monsters. It helps me remember what we\'re fighting for."',
    affectionGain: 4,
    memoryPotential: true
  },
  {
    id: 'future_dreams',
    topic: 'Dreams for the future',
    playerPrompt: 'Ask about her hopes for when the gates are gone',
    chaReaction: '"I used to think only about the next raid, the next threat... but lately, I find myself imagining a world where children can play freely without fear."',
    affectionGain: 5,
    memoryPotential: true
  },
  {
    id: 'simple_happiness',
    topic: 'Simple pleasures in life',
    playerPrompt: 'Share what makes you happy in everyday moments',
    chaReaction: '"Walking like this, talking with someone who understands... these moments are precious. They make all the fighting worthwhile."',
    affectionGain: 3,
    memoryPotential: false
  }
];

export function HangangParkWalkModal({
  isVisible,
  onClose,
  onReturnToHub,
  playerStats,
  onStatsUpdate,
  onCreateMemoryStar
}: HangangParkWalkModalProps) {
  const [activityPhase, setActivityPhase] = useState<ActivityPhase>('intro');
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'character', text: string}>>([]);
  const [memoryCreated, setMemoryCreated] = useState(false);
  const [totalAffectionGained, setTotalAffectionGained] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setActivityPhase('intro');
      setSelectedTopic(null);
      setConversationHistory([]);
      setMemoryCreated(false);
      setTotalAffectionGained(0);
    }
  }, [isVisible]);

  const startWalk = () => {
    if (playerStats.energy < 10) {
      alert('Insufficient energy for park walk');
      return;
    }

    setActivityPhase('walking');
    onStatsUpdate({ energy: playerStats.energy - 10 });
  };

  const selectConversationTopic = (topic: ConversationTopic) => {
    setSelectedTopic(topic);
    setActivityPhase('bench_conversation');
    
    setConversationHistory([
      { type: 'user', text: topic.playerPrompt },
      { type: 'character', text: topic.chaReaction }
    ]);

    // Update affection
    setTotalAffectionGained(prev => prev + topic.affectionGain);
    onStatsUpdate({ affection: topic.affectionGain });

    // Create memory star if applicable
    if (topic.memoryPotential && !memoryCreated) {
      setTimeout(() => {
        onCreateMemoryStar({
          title: `Hangang Park Reflection`,
          description: `A peaceful conversation about ${topic.topic.toLowerCase()} by the river`,
          emotion: 'peaceful'
        });
        setMemoryCreated(true);
      }, 2000);
    }
  };

  const visitFoodVendor = () => {
    setActivityPhase('food_vendor');
    
    if (playerStats.gold >= 8000) {
      onStatsUpdate({ 
        affection: 2,
        experience: 10
      });
      setTotalAffectionGained(prev => prev + 2);
      
      setConversationHistory(prev => [...prev, 
        { type: 'user', text: 'Should we get some hotteok from the vendor?' },
        { type: 'character', text: '"That sounds wonderful. Street food always tastes better when shared with good company."' }
      ]);
    }
  };

  const continueToReflection = () => {
    setActivityPhase('reflection');
    
    // Add final reflection dialogue
    setConversationHistory(prev => [...prev,
      { type: 'character', text: '"Thank you for this walk, Jin-Woo. These quiet moments... they mean more than you know."' }
    ]);
  };

  const completeWalk = () => {
    // Final experience bonus
    onStatsUpdate({ experience: 30 });
    setActivityPhase('conclusion');
    
    setTimeout(() => {
      onClose();
    }, 3000);
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
          className="bg-gradient-to-br from-emerald-900/90 to-blue-900/90 backdrop-blur-xl border border-emerald-400/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
        >
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20" />
            <div className="absolute top-10 left-10">
              <TreePine className="w-20 h-20 text-emerald-300/30" />
            </div>
            <div className="absolute bottom-10 right-10">
              <Waves className="w-16 h-16 text-blue-300/30" />
            </div>
          </div>

          {/* Introduction Phase */}
          {activityPhase === 'intro' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 text-center max-w-2xl"
              >
                <div className="space-y-4">
                  <MapPin className="w-16 h-16 mx-auto text-emerald-300" />
                  <h1 className="text-4xl font-bold text-white">Hangang Park Walk</h1>
                  <p className="text-xl text-emerald-200">
                    A peaceful stroll along Seoul's iconic river
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-white font-semibold">Activity Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Heart className="w-4 h-4" />
                      <span>Affection Focus</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-300">
                      <MessageCircle className="w-4 h-4" />
                      <span>Deep Conversations</span>
                    </div>
                    <div className="flex items-center gap-2 text-yellow-300">
                      <Star className="w-4 h-4" />
                      <span>Memory Creation</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <MapPin className="w-4 h-4" />
                      <span>Scenic Environment</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startWalk}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
                >
                  Begin Walk
                </Button>
              </motion.div>
            </div>
          )}

          {/* Walking Phase */}
          {activityPhase === 'walking' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-3xl w-full"
              >
                <div className="text-center space-y-4">
                  <Waves className="w-16 h-16 mx-auto text-blue-300" />
                  <h2 className="text-3xl font-bold text-white">Strolling by the River</h2>
                  <p className="text-emerald-200">
                    The gentle sound of water and distant city life creates a peaceful atmosphere.
                    Cha Hae-In walks beside you, seeming more relaxed than usual.
                  </p>
                </div>

                <div className="bg-black/20 rounded-lg p-6">
                  <p className="text-white italic text-center">
                    "It's nice to get away from the Association building sometimes. 
                    The river has a way of putting things in perspective."
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold text-center">Interactive Locations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black/30 hover:bg-black/50 border border-emerald-500/30 hover:border-emerald-400 rounded-lg p-4 cursor-pointer"
                      onClick={() => setActivityPhase('bench_conversation')}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-emerald-300" />
                        <h4 className="text-white font-medium">Park Bench</h4>
                      </div>
                      <p className="text-emerald-200 text-sm">Sit and have a deeper conversation</p>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-black/30 hover:bg-black/50 border border-blue-500/30 hover:border-blue-400 rounded-lg p-4 cursor-pointer"
                      onClick={visitFoodVendor}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Coffee className="w-5 h-5 text-blue-300" />
                        <h4 className="text-white font-medium">Food Vendor</h4>
                      </div>
                      <p className="text-blue-200 text-sm">Share some street food together</p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Bench Conversation Phase */}
          {activityPhase === 'bench_conversation' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-6 max-w-3xl w-full"
              >
                <div className="text-center space-y-4">
                  <Users className="w-16 h-16 mx-auto text-emerald-300" />
                  <h2 className="text-3xl font-bold text-white">Riverside Conversation</h2>
                  <p className="text-emerald-200">
                    You both settle on a bench overlooking the river. The atmosphere feels perfect for opening up.
                  </p>
                </div>

                {!selectedTopic ? (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold text-center">Choose a conversation topic:</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {CONVERSATION_TOPICS.map((topic) => (
                        <motion.div
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-black/30 hover:bg-black/50 border border-emerald-500/30 hover:border-emerald-400 rounded-lg p-4 cursor-pointer"
                          onClick={() => selectConversationTopic(topic)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{topic.topic}</h4>
                              <p className="text-emerald-200 text-sm">{topic.playerPrompt}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Heart className="w-3 h-3 text-pink-400" />
                              <span className="text-pink-300">+{topic.affectionGain}</span>
                              {topic.memoryPotential && (
                                <>
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span className="text-yellow-300">Memory</span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-black/20 rounded-lg p-6 space-y-4">
                      {conversationHistory.map((msg, index) => (
                        <div key={index} className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                            msg.type === 'user' 
                              ? 'bg-emerald-600/50 text-white' 
                              : 'bg-black/50 text-emerald-200'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {memoryCreated && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4 text-center"
                      >
                        <Sparkles className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
                        <p className="text-yellow-200 font-medium">Memory Star Created!</p>
                        <p className="text-yellow-300 text-sm">This moment will be remembered</p>
                      </motion.div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        onClick={visitFoodVendor}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Visit Food Vendor
                      </Button>
                      <Button
                        onClick={continueToReflection}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Continue Walking
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Food Vendor Phase */}
          {activityPhase === 'food_vendor' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl w-full text-center"
              >
                <div className="space-y-4">
                  <Coffee className="w-16 h-16 mx-auto text-blue-300" />
                  <h2 className="text-3xl font-bold text-white">Street Food Vendor</h2>
                </div>

                <div className="bg-black/30 rounded-lg p-6 space-y-4">
                  {playerStats.gold >= 8000 ? (
                    <div className="space-y-4">
                      <p className="text-white">
                        You purchase some warm hotteok from the friendly vendor. 
                        The sweet treat fills the air with a delicious aroma.
                      </p>
                      <div className="bg-green-500/20 border border-green-400/30 rounded p-3">
                        <p className="text-green-200">
                          -₩8,000 | +2 Affection | +10 Experience
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-white">
                        The vendor's food smells amazing, but you don't have enough gold.
                        Cha Hae-In notices but doesn't say anything.
                      </p>
                      <div className="bg-red-500/20 border border-red-400/30 rounded p-3">
                        <p className="text-red-200">
                          Need ₩8,000 (You have ₩{playerStats.gold.toLocaleString()})
                        </p>
                      </div>
                    </div>
                  )}

                  {conversationHistory.length > 0 && (
                    <div className="bg-black/20 rounded p-4">
                      <p className="text-emerald-200 italic">
                        {conversationHistory[conversationHistory.length - 1].text}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={continueToReflection}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  Continue Walking
                </Button>
              </motion.div>
            </div>
          )}

          {/* Reflection Phase */}
          {activityPhase === 'reflection' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl w-full text-center"
              >
                <div className="space-y-4">
                  <Heart className="w-16 h-16 mx-auto text-pink-300" />
                  <h2 className="text-3xl font-bold text-white">Peaceful Reflection</h2>
                  <p className="text-emerald-200">
                    As the walk comes to an end, you both pause to watch the river flow by.
                    The city lights begin to twinkle in the distance.
                  </p>
                </div>

                <div className="bg-black/20 rounded-lg p-6">
                  <p className="text-white italic">
                    "Thank you for this walk, Jin-Woo. These quiet moments... they mean more than you know."
                  </p>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-4">Walk Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-pink-300">
                      Total Affection: +{totalAffectionGained}
                    </div>
                    <div className="text-blue-300">
                      Experience: +40
                    </div>
                    <div className="text-yellow-300">
                      Memory Stars: {memoryCreated ? '1' : '0'}
                    </div>
                    <div className="text-emerald-300">
                      Energy Used: 10
                    </div>
                  </div>
                </div>

                <Button
                  onClick={completeWalk}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3"
                >
                  End Walk
                </Button>
              </motion.div>
            </div>
          )}

          {/* Conclusion Phase */}
          {activityPhase === 'conclusion' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center space-y-4"
              >
                <Sparkles className="w-20 h-20 mx-auto text-emerald-300" />
                <h2 className="text-3xl font-bold text-white">Walk Complete</h2>
                <p className="text-emerald-200">
                  A peaceful moment shared by the river
                </p>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}