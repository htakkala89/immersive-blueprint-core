import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Star, Heart, MessageCircle, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TalkOnBalconyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (affectionGain: number, deepConversation: boolean) => void;
  backgroundImage?: string;
}

interface ConversationTopic {
  id: string;
  title: string;
  description: string;
  type: 'introspective' | 'future_plans' | 'feelings' | 'memories' | 'dreams';
  initialPrompt: string;
  responses: ConversationResponse[];
}

interface ConversationResponse {
  id: string;
  text: string;
  type: 'thoughtful' | 'romantic' | 'supportive' | 'curious';
  chaReaction: string;
  affectionImpact: number;
  unlocks?: string;
}

export function TalkOnBalconyModal({ 
  isVisible, 
  onClose, 
  onComplete, 
  backgroundImage 
}: TalkOnBalconyModalProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [conversationDepth, setConversationDepth] = useState(0);
  const [totalAffection, setTotalAffection] = useState(0);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [showTopics, setShowTopics] = useState(true);
  const [deepConversationUnlocked, setDeepConversationUnlocked] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const conversationTopics: ConversationTopic[] = [
    {
      id: 'our_future',
      title: 'Our Future Together',
      description: 'What do you see when you imagine our life beyond hunting?',
      type: 'future_plans',
      initialPrompt: 'Sometimes I wonder what our life would be like if we didn\'t have to constantly fight monsters...',
      responses: [
        {
          id: 'peaceful_life',
          text: 'I dream of a peaceful life where we can wake up without worrying about gates.',
          type: 'thoughtful',
          chaReaction: 'That sounds wonderful... A normal life where our biggest worry is what to have for breakfast.',
          affectionImpact: 8,
          unlocks: 'deep_intimacy'
        },
        {
          id: 'adventure_together',
          text: 'I think we\'d find new adventures, even in a peaceful world.',
          type: 'romantic',
          chaReaction: 'You\'re right. With you, even ordinary moments feel like adventures.',
          affectionImpact: 10
        },
        {
          id: 'support_dreams',
          text: 'Whatever you want to do, I\'ll be there to support your dreams.',
          type: 'supportive',
          chaReaction: 'And I yours. That\'s what makes us strong - we face everything together.',
          affectionImpact: 12
        }
      ]
    },
    {
      id: 'inner_thoughts',
      title: 'What You Really Think',
      description: 'The thoughts you keep to yourself during busy days',
      type: 'introspective',
      initialPrompt: 'You know, in the quiet moments like this, I often think about things I don\'t usually share...',
      responses: [
        {
          id: 'listen_carefully',
          text: 'I want to hear everything you\'re thinking. I\'m here to listen.',
          type: 'supportive',
          chaReaction: 'Sometimes I worry that this peaceful happiness is too good to last...',
          affectionImpact: 9
        },
        {
          id: 'share_together',
          text: 'We don\'t have to carry our thoughts alone anymore.',
          type: 'romantic',
          chaReaction: 'You make me feel safe enough to be vulnerable. That means everything.',
          affectionImpact: 11
        },
        {
          id: 'understand_pressure',
          text: 'Being strong all the time must be exhausting. You can rest with me.',
          type: 'thoughtful',
          chaReaction: 'Yes... it is. Thank you for seeing that and giving me permission to just be myself.',
          affectionImpact: 13
        }
      ]
    },
    {
      id: 'precious_memories',
      title: 'Moments That Matter',
      description: 'The memories that shaped who you are together',
      type: 'memories',
      initialPrompt: 'Looking back, there are certain moments with you that changed everything for me...',
      responses: [
        {
          id: 'first_meeting',
          text: 'I still remember the first time I saw you fight. You were magnificent.',
          type: 'romantic',
          chaReaction: 'And I remember thinking this mysterious hunter might be someone special.',
          affectionImpact: 8
        },
        {
          id: 'trust_moment',
          text: 'The moment I knew I could trust you completely was...',
          type: 'thoughtful',
          chaReaction: 'For me, it was when you protected me without hesitation, even against impossible odds.',
          affectionImpact: 10
        },
        {
          id: 'falling_in_love',
          text: 'I think I started falling for you before I even realized it.',
          type: 'romantic',
          chaReaction: 'Me too. Love crept up on us so quietly, and then suddenly it was everything.',
          affectionImpact: 15,
          unlocks: 'romantic_milestone'
        }
      ]
    },
    {
      id: 'city_lights',
      title: 'The City Below',
      description: 'What the lights of Seoul mean to both of you',
      type: 'feelings',
      initialPrompt: 'Look at all those lights... Each one represents someone\'s life, someone\'s story...',
      responses: [
        {
          id: 'protecting_people',
          text: 'We fight to protect all those lives, all those stories.',
          type: 'thoughtful',
          chaReaction: 'That\'s what gives our dangerous work meaning - knowing we\'re guardians of their peace.',
          affectionImpact: 7
        },
        {
          id: 'our_place',
          text: 'And somewhere among all those lights is our own story being written.',
          type: 'romantic',
          chaReaction: 'Our story... I love thinking of it that way. What chapter are we in now?',
          affectionImpact: 9
        },
        {
          id: 'find_peace',
          text: 'After seeing so much darkness, these lights remind me there\'s still beauty.',
          type: 'thoughtful',
          chaReaction: 'You help me see that beauty too. Even in the darkest gates, I remember there\'s light to return to.',
          affectionImpact: 11
        }
      ]
    }
  ];

  const getCurrentTopic = () => {
    return conversationTopics.find(topic => topic.id === selectedTopic);
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setShowTopics(false);
  };

  const handleResponseSelect = (response: ConversationResponse) => {
    setCurrentResponse(response.chaReaction);
    setTotalAffection(prev => prev + response.affectionImpact);
    setConversationDepth(prev => prev + 1);

    if (response.unlocks) {
      setDeepConversationUnlocked(true);
    }

    setTimeout(() => {
      if (conversationDepth >= 2 || response.unlocks === 'romantic_milestone') {
        setShowResults(true);
      } else {
        setShowTopics(true);
        setSelectedTopic(null);
        setCurrentResponse(null);
      }
    }, 4000);
  };

  const getConversationQuality = () => {
    if (totalAffection >= 30) return 'Deeply Meaningful';
    if (totalAffection >= 20) return 'Heartfelt Connection';
    if (totalAffection >= 10) return 'Genuine Understanding';
    return 'Pleasant Chat';
  };

  const handleComplete = () => {
    onComplete(totalAffection, deepConversationUnlocked);
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
          className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 rounded-3xl overflow-hidden shadow-2xl border border-indigo-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Night city overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-purple-900/60 to-black/80" />
          
          {/* Gentle breeze effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  x: [0, 30, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Private Balcony</h1>
                <p className="text-indigo-200">A quiet moment above the city</p>
              </div>
            </div>
          </div>

          {/* Night ambiance */}
          <div className="absolute top-6 right-20 z-40 flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2">
            <Moon className="w-4 h-4 text-indigo-300" />
            <span className="text-white text-sm font-medium">Late Night</span>
          </div>

          {showTopics && !currentResponse ? (
            /* Topic Selection */
            <div className="flex items-center justify-center h-full pt-20">
              <div className="w-full max-w-4xl space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Deep Conversations</h2>
                  <p className="text-indigo-200 text-lg">What would you like to talk about tonight?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
                  {conversationTopics.map((topic) => (
                    <motion.button
                      key={topic.id}
                      onClick={() => handleTopicSelect(topic.id)}
                      className="p-6 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 text-left"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-white">{topic.title}</h3>
                        <p className="text-indigo-200 text-sm">{topic.description}</p>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            topic.type === 'introspective' ? 'bg-purple-500/30 text-purple-200' :
                            topic.type === 'future_plans' ? 'bg-blue-500/30 text-blue-200' :
                            topic.type === 'feelings' ? 'bg-pink-500/30 text-pink-200' :
                            topic.type === 'memories' ? 'bg-yellow-500/30 text-yellow-200' :
                            'bg-green-500/30 text-green-200'
                          }`}>
                            {topic.type.replace('_', ' ')}
                          </span>
                          <MessageCircle className="w-5 h-5 text-indigo-300" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="text-center mt-8">
                  <div className="bg-black/40 backdrop-blur-md rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-white italic text-sm">
                      "The balcony at night feels like our own private world, separated from everything else. What's on your mind?"
                    </p>
                    <div className="flex items-center justify-center space-x-2 mt-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">CH</span>
                      </div>
                      <span className="text-indigo-200 text-sm font-medium">Cha Hae-In</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : selectedTopic && !currentResponse ? (
            /* Conversation Response Selection */
            <div className="flex items-center justify-center h-full pt-20">
              <div className="w-full max-w-3xl space-y-6">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CH</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-2">Cha Hae-In</h4>
                      <p className="text-white/90 italic text-lg">
                        "{getCurrentTopic()?.initialPrompt}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white text-center mb-6">How do you respond?</h3>
                  
                  {getCurrentTopic()?.responses.map((response) => (
                    <motion.button
                      key={response.id}
                      onClick={() => handleResponseSelect(response)}
                      className="w-full p-5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium flex-1 pr-4">{response.text}</span>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            response.type === 'thoughtful' ? 'bg-blue-100 text-blue-700' :
                            response.type === 'romantic' ? 'bg-pink-100 text-pink-700' :
                            response.type === 'supportive' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {response.type}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-300 text-sm">+{response.affectionImpact}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : currentResponse ? (
            /* Response Display */
            <div className="flex items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl space-y-6"
              >
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-8 border border-white/20">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">CH</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-3">Cha Hae-In</h4>
                      <p className="text-white/90 text-lg italic leading-relaxed">
                        "{currentResponse}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-white/20 text-center">
                    <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full">
                      <Wind className="w-4 h-4 text-indigo-300" />
                      <span className="text-indigo-200 text-sm">A gentle breeze carries your words...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
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
                  <div className="text-6xl mb-4">🌙</div>
                  <h2 className="text-3xl font-bold text-white mb-2">Beautiful Evening</h2>
                  <p className="text-indigo-200 text-lg">
                    A perfect night for meaningful conversation
                  </p>
                </motion.div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-bold text-white">{getConversationQuality()}</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                        <div className="text-pink-300 font-bold text-xl">+{totalAffection}</div>
                        <div className="text-sm text-indigo-300">Affection Gained</div>
                      </div>
                      <div className="text-center">
                        <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                        <div className="text-yellow-300 font-bold text-xl">
                          {deepConversationUnlocked ? 'Unlocked' : 'Standard'}
                        </div>
                        <div className="text-sm text-indigo-300">Deep Connection</div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-indigo-200 italic text-sm">
                        "Nights like this remind me why I cherish our quiet moments together. Thank you for listening to my heart."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleComplete}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                  >
                    Treasure This Moment
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