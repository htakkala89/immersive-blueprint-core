import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Crown, Heart, MessageCircle } from 'lucide-react';
import { Episode, StoryBeat } from '@/../../shared/episodic-story-types';

interface EpisodePlayerProps {
  episodeId: string;
  onBack: () => void;
  onComplete?: (episodeId: string) => void;
}

export default function EpisodePlayer({ episodeId, onBack, onComplete }: EpisodePlayerProps) {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [playerChoices, setPlayerChoices] = useState<Record<string, any>>({});

  const { data: episodeData, isLoading } = useQuery({
    queryKey: ['/api/episodes', episodeId],
    queryFn: async () => {
      const response = await fetch(`/api/episodes/${episodeId}`);
      if (!response.ok) throw new Error('Failed to fetch episode');
      return response.json();
    }
  });

  const episode: Episode = episodeData?.episode;
  const currentBeat: StoryBeat = episode?.beats?.[currentBeatIndex];

  const handleChoice = (choice: any) => {
    setPlayerChoices(prev => ({ ...prev, [currentBeat.beat_id]: choice }));
    
    // Move to next beat
    if (currentBeatIndex < episode.beats.length - 1) {
      setCurrentBeatIndex(prev => prev + 1);
    } else {
      // Episode completed
      onComplete?.(episodeId);
    }
  };

  const handleContinue = () => {
    if (currentBeatIndex < episode.beats.length - 1) {
      setCurrentBeatIndex(prev => prev + 1);
    } else {
      onComplete?.(episodeId);
    }
  };

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
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 overflow-hidden">
      {/* Header */}
      <div className="relative p-6 border-b border-purple-700/50">
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
              Beat {currentBeatIndex + 1} of {episode.beats.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {currentBeat && (
          <div className="max-w-4xl mx-auto">
            {/* Beat Title */}
            {currentBeat.title && (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{currentBeat.title}</h2>
              </div>
            )}

            {/* Story Description */}
            <Card className="bg-white/10 backdrop-blur-md border-purple-600/30 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed">
                      {currentBeat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beat Actions/Choices */}
            <div className="space-y-4">
              {currentBeat.actions?.map((action, index) => {
                // Handle narrative text
                if (action.type === 'narrative_text') {
                  return (
                    <Card key={index} className="bg-white/5 backdrop-blur-md border-purple-600/20">
                      <CardContent className="p-4">
                        <p className="text-white text-lg leading-relaxed">{action.content}</p>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle system messages
                if (action.type === 'system_message') {
                  return (
                    <Card key={index} className="bg-blue-500/10 backdrop-blur-md border-blue-600/30">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="w-5 h-5 text-blue-400" />
                          <p className="text-blue-200">{action.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle location changes
                if (action.type === 'set_location') {
                  return (
                    <Card key={index} className="bg-green-500/10 backdrop-blur-md border-green-600/30">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm">📍</span>
                          </div>
                          <div>
                            <p className="text-green-200 font-medium">Location: {action.location}</p>
                            {action.time && <p className="text-green-300 text-sm">Time: {action.time}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle shop displays
                if (action.type === 'show_shop') {
                  return (
                    <Card key={index} className="bg-yellow-500/10 backdrop-blur-md border-yellow-600/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="text-yellow-200 font-bold text-lg">{action.shop_data?.name}</h3>
                          <div className="grid gap-2">
                            {action.shop_data?.items?.map((item: any, itemIndex: number) => (
                              <div key={itemIndex} className="bg-black/20 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium">{item.name}</p>
                                    <p className="text-gray-300 text-sm">{item.description}</p>
                                    <p className="text-green-400 text-sm">{item.effect}</p>
                                  </div>
                                  <p className="text-yellow-400 font-bold">₩{item.price?.toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle choice nodes
                if (action.type === 'choice_node') {
                  return (
                    <Card key={index} className="bg-purple-500/10 backdrop-blur-md border-purple-600/30">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <p className="text-white font-medium">{action.prompt}</p>
                          <div className="space-y-2">
                            {action.choices?.map((choice: any, choiceIndex: number) => (
                              <Button
                                key={choiceIndex}
                                onClick={() => handleChoice({ action, choice, index })}
                                variant="outline"
                                className="w-full text-left justify-start bg-white/5 border-purple-400 text-white hover:bg-purple-600/30"
                              >
                                {choice.text}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle dialogue sequences
                if (action.type === 'dialogue_sequence') {
                  return (
                    <Card key={index} className="bg-pink-500/10 backdrop-blur-md border-pink-600/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-pink-400" />
                            <p className="text-pink-200 font-medium">{action.character}</p>
                          </div>
                          {action.dialogue?.map((line: any, lineIndex: number) => (
                            <div key={lineIndex} className="bg-black/20 rounded p-3">
                              <p className="text-white">{line.text}</p>
                              {line.emotion && (
                                <p className="text-pink-300 text-sm italic mt-1">*{line.emotion}*</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle intimate moments
                if (action.type === 'intimate_moment') {
                  return (
                    <Card key={index} className="bg-red-500/10 backdrop-blur-md border-red-600/30">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-red-400" />
                            <h3 className="text-red-200 font-bold">{action.moment?.name}</h3>
                          </div>
                          <p className="text-white">{action.moment?.description}</p>
                          <div className="space-y-2">
                            {action.moment?.choices?.map((choice: any, choiceIndex: number) => (
                              <Button
                                key={choiceIndex}
                                onClick={() => handleChoice({ action, choice, index })}
                                variant="outline"
                                className="w-full text-left justify-start bg-white/5 border-red-400 text-white hover:bg-red-600/30"
                              >
                                {choice.text}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Handle relationship progression
                if (action.type === 'relationship_progression') {
                  return (
                    <Card key={index} className="bg-gold-500/10 backdrop-blur-md border-yellow-600/30">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-yellow-200 font-bold">{action.milestone?.name}</h3>
                          </div>
                          <p className="text-white">{action.milestone?.description}</p>
                          {action.milestone?.rewards && (
                            <div className="bg-black/20 rounded p-3">
                              <p className="text-green-400 text-sm font-medium">Rewards:</p>
                              <ul className="text-green-300 text-sm space-y-1">
                                {Object.entries(action.milestone.rewards).map(([key, value]) => (
                                  <li key={key}>+{value} {key.replace('_', ' ')}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                // Default fallback for unknown actions
                return (
                  <Card key={index} className="bg-gray-500/10 backdrop-blur-md border-gray-600/30">
                    <CardContent className="p-4">
                      <p className="text-gray-300">Action: {action.type}</p>
                      {action.content && <p className="text-white mt-2">{action.content}</p>}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Continue Button */}
              <div className="text-center pt-6">
                <Button 
                  onClick={handleContinue}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                >
                  {currentBeatIndex < episode.beats.length - 1 ? 'Continue Story' : 'Complete Episode'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="p-6 border-t border-purple-700/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between text-sm text-purple-200 mb-2">
            <span>Episode Progress</span>
            <span>{Math.round(((currentBeatIndex + 1) / episode.beats.length) * 100)}%</span>
          </div>
          <div className="w-full bg-purple-900/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentBeatIndex + 1) / episode.beats.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}