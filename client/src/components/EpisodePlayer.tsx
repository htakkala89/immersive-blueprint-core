import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Crown, Heart, MessageCircle, Sword, Shield, Star, MapPin } from 'lucide-react';
import { Episode, StoryBeat } from '@/../../shared/episodic-story-types';
import { motion, AnimatePresence } from 'framer-motion';

interface EpisodePlayerProps {
  episodeId: string;
  onBack?: () => void;
  onComplete?: (episodeId: string) => void;
  gameState?: any;
  onGameStateUpdate?: (gameState: any) => void;
}

interface GameState {
  currentLocation: string;
  timeOfDay: string;
  characterMood: string;
  playerStats: Record<string, number>;
  inventory: string[];
  flags: Record<string, boolean>;
}

export default function EpisodePlayer({ episodeId, onBack, onComplete, gameState: externalGameState, onGameStateUpdate }: EpisodePlayerProps) {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>({
    currentLocation: 'default',
    timeOfDay: 'day',
    characterMood: 'neutral',
    playerStats: { affection: 50, intimacy: 25, money: 100000 },
    inventory: [],
    flags: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [narrative, setNarrative] = useState<string[]>([]);
  const [pendingChoices, setPendingChoices] = useState<any[]>([]);

  const { data: episodeData, isLoading, error } = useQuery({
    queryKey: ['/api/episodes', episodeId],
    queryFn: async () => {
      const response = await fetch(`/api/episodes/${episodeId}`);
      if (!response.ok) throw new Error('Failed to fetch episode');
      const data = await response.json();
      
      // Validate episode data structure - handle both beats and commands formats
      if (!data.episode || !data.episode.id) {
        throw new Error('Invalid episode data: missing episode or id');
      }
      
      // Support episodes with either beats or commands structure
      if (!data.episode.beats && !data.episode.commands) {
        throw new Error('Invalid episode data: missing beats or commands');
      }
      
      return data;
    },
    retry: 1,
    enabled: !!episodeId
  });

  const episode = episodeData?.episode;
  
  // Extract all actions from beats for command processing
  const allActions = episode?.beats?.flatMap((beat: any) => beat.actions || []) || [];
  const currentCommand = allActions[currentCommandIndex];

  const processCommand = (command: any) => {
    setIsProcessing(true);
    
    const autoAdvanceAfter = (delay: number) => {
      setTimeout(() => {
        setIsProcessing(false);
        setTimeout(() => {
          advanceStory();
        }, 500);
      }, delay);
    };
    
    switch (command.command) {
      case 'DELIVER_MESSAGE':
        const sender = command.params?.sender || 'System';
        const messageId = command.params?.message_id || 'Unknown';
        setNarrative(prev => [...prev, `📨 Message from ${sender}: ${messageId}`]);
        autoAdvanceAfter(2500); // Auto-advance after 2.5 seconds
        return;
        
      case 'ACTIVATE_QUEST':
        const questTitle = command.params?.title || 'New Quest';
        setNarrative(prev => [...prev, `⚔️ Quest Activated: ${questTitle}`]);
        autoAdvanceAfter(3000); // Longer for quest activation
        return;
        
      case 'SET_CHA_MOOD':
        const mood = command.params?.mood || 'neutral';
        setNarrative(prev => [...prev, `💭 Cha Hae-In's mood: ${mood}`]);
        setGameState(prev => ({ ...prev, characterMood: mood }));
        autoAdvanceAfter(2000); // Quick mood change
        return;
        
      case 'FORCE_CHA_LOCATION':
        const location = command.params?.location_id || 'Unknown Location';
        setNarrative(prev => [...prev, `📍 Cha Hae-In moves to: ${location}`]);
        setGameState(prev => ({ ...prev, currentLocation: location }));
        autoAdvanceAfter(2500); // Location change with transition time
        return;
        
      case 'START_DIALOGUE_SCENE':
        const dialogueId = command.params?.dialogue_id || 'Unknown Dialogue';
        setNarrative(prev => [...prev, `💬 Starting dialogue: ${dialogueId}`]);
        autoAdvanceAfter(3500); // Longer for dialogue setup
        return;
        
      case 'COMPLETE_EPISODE':
        const reward = command.params?.reward || 0;
        setNarrative(prev => [...prev, `🎉 Episode Complete! Reward: ${reward}`]);
        setTimeout(() => {
          setIsProcessing(false);
          onComplete?.(episodeId);
        }, 4000); // Final episode completion
        return;
        
      // Legacy support for old command format
      case 'system_message':
        setNarrative(prev => [...prev, `🎮 ${command.content}`]);
        break;
        
      case 'set_location':
        setGameState(prev => ({ 
          ...prev, 
          currentLocation: command.location,
          timeOfDay: command.time || prev.timeOfDay
        }));
        setNarrative(prev => [...prev, `📍 Moving to ${command.location}${command.time ? ` (${command.time})` : ''}`]);
        break;
        
      case 'narrative_text':
        setNarrative(prev => [...prev, command.content]);
        break;
        
      case 'add_quest':
        setNarrative(prev => [...prev, `⚔️ New Quest: ${command.quest.title}`]);
        setNarrative(prev => [...prev, command.quest.description]);
        break;
        
      case 'choice_node':
        setPendingChoices(command.choices || []);
        setNarrative(prev => [...prev, command.prompt]);
        setIsProcessing(false);
        return; // Stop processing until choice is made
        
      case 'dialogue_sequence':
        const character = command.character === 'cha_haein' ? 'Cha Hae-In' : command.character;
        command.dialogue?.forEach((line: any) => {
          setNarrative(prev => [...prev, `💬 ${character}: "${line.text}"`]);
          if (line.emotion) {
            setNarrative(prev => [...prev, `*${line.emotion}*`]);
          }
        });
        break;
        
      case 'intimate_moment':
        setNarrative(prev => [...prev, `💕 ${command.moment?.name}`]);
        setNarrative(prev => [...prev, command.moment?.description]);
        if (command.moment?.choices) {
          setPendingChoices(command.moment.choices);
          setIsProcessing(false);
          return;
        }
        break;
        
      case 'relationship_progression':
        setNarrative(prev => [...prev, `✨ ${command.milestone?.name}`]);
        setNarrative(prev => [...prev, command.milestone?.description]);
        if (command.milestone?.rewards) {
          const rewards = Object.entries(command.milestone.rewards)
            .map(([key, value]) => `+${value} ${key.replace('_', ' ')}`)
            .join(', ');
          setNarrative(prev => [...prev, `🎁 Rewards: ${rewards}`]);
        }
        break;
        
      case 'episode_completion':
        setNarrative(prev => [...prev, '🏆 Episode Complete!']);
        if (command.rewards) {
          const rewards = Object.entries(command.rewards)
            .map(([key, value]) => `+${value} ${key.replace('_', ' ')}`)
            .join(', ');
          setNarrative(prev => [...prev, `🎁 Final Rewards: ${rewards}`]);
        }
        setTimeout(() => onComplete?.(episodeId), 3000);
        break;
    }
    
    // Auto-advance to next command after processing
    setTimeout(() => {
      setIsProcessing(false);
      advanceStory();
    }, 1000);
  };

  const handleChoice = (choice: any) => {
    setNarrative(prev => [...prev, `👤 You chose: ${choice.text}`]);
    
    // Apply choice effects
    if (choice.effects) {
      setGameState(prev => {
        const newState = { ...prev };
        if (choice.effects.add_affection) {
          newState.playerStats.affection += choice.effects.add_affection;
        }
        if (choice.effects.add_intimacy) {
          newState.playerStats.intimacy += choice.effects.add_intimacy;
        }
        if (choice.effects.remove_money) {
          newState.playerStats.money -= choice.effects.remove_money;
        }
        if (choice.effects.add_inventory) {
          newState.inventory.push(choice.effects.add_inventory);
        }
        return newState;
      });
    }
    
    setPendingChoices([]);
    advanceStory();
  };

  const advanceStory = () => {
    if (currentCommandIndex < allActions.length - 1) {
      setCurrentCommandIndex(prev => prev + 1);
    } else {
      onComplete?.(episodeId);
    }
  };

  // Only auto-process initial command, then wait for explicit player actions
  useEffect(() => {
    if (currentCommandIndex === 0 && currentCommand && pendingChoices.length === 0 && !isProcessing) {
      // Only auto-process the first beat to set up the episode
      const timer = setTimeout(() => {
        processCommand(currentCommand);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentCommandIndex, currentCommand, pendingChoices, isProcessing]);

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading episode...</div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Episode not found</div>
          <Button onClick={onBack} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative p-6 border-b border-purple-700/50 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:bg-purple-800/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Crown className="w-6 h-6 text-yellow-400 mr-2" />
            <h1 className="text-2xl font-bold text-white">{episode.title}</h1>
          </div>
          <div className="flex items-center justify-center space-x-4 text-sm text-purple-200">
            <Badge variant="outline" className="border-purple-400 text-purple-200">
              Beat {currentCommandIndex + 1} of {allActions.length}
            </Badge>
            <Badge variant="outline" className="border-green-400 text-green-200">
              {gameState.currentLocation}
            </Badge>
            <Badge variant="outline" className="border-blue-400 text-blue-200">
              Affection: {gameState.playerStats.affection}
            </Badge>
            {isProcessing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsProcessing(false);
                  setTimeout(() => advanceStory(), 100);
                }}
                className="text-purple-300 hover:text-white border border-purple-500 hover:bg-purple-600/20"
              >
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Story Narrative */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {narrative.map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-md border-purple-600/20">
                  <CardContent className="p-4">
                    <p className="text-white leading-relaxed">{text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Card className="bg-purple-600/20 backdrop-blur-md border-purple-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-purple-200 font-medium">Story progressing...</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Pending Choices */}
            {pendingChoices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full">
                    <Heart className="w-4 h-4 text-purple-300 mr-2" />
                    <span className="text-purple-200 font-medium">Choose your response</span>
                  </div>
                </div>
                {pendingChoices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    variant="outline"
                    className="w-full text-left justify-start bg-white/5 border-purple-400 text-white hover:bg-purple-600/30 p-4 h-auto"
                  >
                    <div>
                      <div className="font-medium">{choice.text}</div>
                      {choice.effects && (
                        <div className="text-sm text-purple-300 mt-1">
                          Effects: {Object.entries(choice.effects)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </motion.div>
            )}

            {/* Gameplay Instructions - Show after initial beat */}
            {currentCommandIndex > 0 && pendingChoices.length === 0 && !isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-6"
              >
                <Card className="bg-blue-600/20 backdrop-blur-md border-blue-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-blue-300 mr-2" />
                      <h3 className="text-xl font-semibold text-white">Quest Objective</h3>
                    </div>
                    <p className="text-blue-200 mb-4">
                      To continue this episode, complete the following action in the game world:
                    </p>
                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                      <p className="text-white font-medium">
                        Visit the Hunter Association and speak with Cha Hae-In
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 text-sm text-blue-300">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>Use spatial navigation</span>
                      </div>
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        <span>Chat with Cha Hae-In</span>
                      </div>
                    </div>
                    <Button 
                      onClick={onBack}
                      variant="outline"
                      className="mt-4 border-blue-400 text-blue-200 hover:bg-blue-600/30"
                    >
                      Return to Game World
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Continue Button - Only show for initial setup */}
            {pendingChoices.length === 0 && !isProcessing && currentCommandIndex === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center pt-6"
              >
                <Button 
                  onClick={() => processCommand(currentCommand)}
                  disabled={isProcessing}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  {isProcessing ? 'Processing...' : 'Continue Story'}
                </Button>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Progress Bar */}
      <div className="p-6 border-t border-purple-700/50 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
            <span>Episode Progress</span>
            <span>{Math.round(((currentCommandIndex + 1) / (episode.commands?.length || 1)) * 100)}%</span>
          </div>
          <div className="w-full bg-purple-900/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentCommandIndex + 1) / (episode.commands?.length || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}