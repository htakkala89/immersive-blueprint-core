import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, Heart, Star, ArrowLeft } from 'lucide-react';
import { Episode } from '@/../../shared/episodic-story-types';

interface EpisodeSelectorProps {
  onSelectEpisode: (episode: Episode) => void;
  onBack: () => void;
}

export default function EpisodeSelector({ onSelectEpisode, onBack }: EpisodeSelectorProps) {
  const { data: episodesData, isLoading } = useQuery({
    queryKey: ['/api/episodes'],
    queryFn: async () => {
      const response = await fetch('/api/episodes');
      if (!response.ok) throw new Error('Failed to fetch episodes');
      return response.json();
    }
  });

  const episodes = episodesData?.episodes || [];

  const getPrerequisiteText = (prerequisite: any) => {
    const requirements = [];
    if (prerequisite?.player_level) requirements.push(`Level ${prerequisite.player_level}`);
    if (prerequisite?.affection_level) requirements.push(`Affection ${prerequisite.affection_level}`);
    if (prerequisite?.relationship_status) requirements.push(prerequisite.relationship_status);
    if (prerequisite?.time_of_day) requirements.push(prerequisite.time_of_day);
    return requirements.length > 0 ? requirements.join(' • ') : 'No requirements';
  };

  const getRankColor = (title: string) => {
    if (title.toLowerCase().includes('s-rank') || title.toLowerCase().includes('shadow')) return 'bg-purple-600';
    if (title.toLowerCase().includes('winter') || title.toLowerCase().includes('snow')) return 'bg-blue-600';
    if (title.toLowerCase().includes('embrace') || title.toLowerCase().includes('romantic')) return 'bg-pink-600';
    return 'bg-gray-600';
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading episodes...</div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Episodic Stories</h1>
          <p className="text-purple-200">Choose your adventure with Cha Hae-In</p>
        </div>
      </div>

      {/* Episodes Grid */}
      <ScrollArea className="h-full p-6">
        {episodes.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl text-white mb-2">No Episodes Available</h3>
            <p className="text-purple-300">Create episodes in the Creator Portal to see them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {episodes.map((episode: any) => (
              <Card 
                key={episode.id} 
                className="bg-white/10 backdrop-blur-md border-purple-600/30 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                onClick={() => onSelectEpisode(episode)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 group-hover:text-purple-200 transition-colors">
                        {episode.title}
                      </CardTitle>
                      <Badge 
                        className={`${getRankColor(episode.title)} text-white text-xs px-2 py-1`}
                      >
                        {episode.status || 'Available'}
                      </Badge>
                    </div>
                    <Play className="w-6 h-6 text-purple-300 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-purple-200 text-sm leading-relaxed">
                    {episode.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-purple-300 text-xs">
                      <Clock className="w-3 h-3 mr-2" />
                      Requirements: {getPrerequisiteText(episode.prerequisite)}
                    </div>
                    
                    {episode.prerequisite?.affection_level && (
                      <div className="flex items-center text-purple-300 text-xs">
                        <Heart className="w-3 h-3 mr-2" />
                        Affection Level {episode.prerequisite.affection_level}+
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEpisode(episode);
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Episode
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}