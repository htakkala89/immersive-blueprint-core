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
                if (action.type === 'START_DIALOGUE_SCENE') {
                  return (
                    <Card key={index} className="bg-white/5 backdrop-blur-md border-purple-600/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-pink-400" />
                            <span className="text-white">Dialogue Scene Available</span>
                          </div>
                          <Button 
                            onClick={() => handleChoice({ action, index })}
                            className="bg-pink-600 hover:bg-pink-700 text-white"
                          >
                            Start Conversation
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                if (action.type === 'DELIVER_MESSAGE') {
                  return (
                    <Card key={index} className="bg-white/5 backdrop-blur-md border-purple-600/20">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-blue-300">Message from {action.sender}</span>
                          </div>
                          <p className="text-white">{action.message_content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return null;
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