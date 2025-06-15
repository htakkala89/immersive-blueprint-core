import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, Heart, Star, ArrowLeft, Trash2, MoreVertical } from 'lucide-react';
import { Episode } from '@/../../shared/episodic-story-types';
import { motion, AnimatePresence } from 'framer-motion';

interface EpisodeSelectorProps {
  onSelectEpisode: (episode: Episode) => void;
  onBack: () => void;
}

export default function EpisodeSelector({ onSelectEpisode, onBack }: EpisodeSelectorProps) {
  const [deletingEpisode, setDeletingEpisode] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: episodesData, isLoading } = useQuery({
    queryKey: ['/api/episodes'],
    queryFn: async () => {
      const response = await fetch('/api/episodes');
      if (!response.ok) throw new Error('Failed to fetch episodes');
      return response.json();
    }
  });

  const episodes = episodesData?.episodes || [];

  const deleteEpisode = async (episodeId: string) => {
    setDeletingEpisode(episodeId);
    try {
      const response = await fetch(`/api/episodes/${episodeId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh episodes list
        queryClient.invalidateQueries({ queryKey: ['/api/episodes'] });
        setShowDeleteConfirm(null);
      } else {
        console.error('Failed to delete episode');
      }
    } catch (error) {
      console.error('Delete episode error:', error);
    } finally {
      setDeletingEpisode(null);
    }
  };

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
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Mobile-Optimized Header */}
      <div className="relative p-3 sm:p-6 border-b border-purple-700/50">
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white hover:bg-purple-800/50 h-9 sm:h-10 px-2 sm:px-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="text-center px-14 sm:px-0">
          <h1 className="text-lg sm:text-3xl font-bold text-white mb-1 sm:mb-2">Episodic Stories</h1>
          <p className="text-purple-200 text-xs sm:text-base">Choose your adventure with Cha Hae-In</p>
        </div>
      </div>

      {/* Mobile-First Episodes List */}
      <div className="p-3 sm:p-6 pb-20">
        {episodes.length === 0 ? (
          <div className="text-center py-20">
            <Star className="w-12 sm:w-16 h-12 sm:h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg sm:text-xl text-white mb-2">No Episodes Available</h3>
            <p className="text-purple-300 text-sm sm:text-base">Create episodes in the Creator Portal to see them here</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-6">
            {episodes.map((episode: any, index: number) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 backdrop-blur-md border-purple-600/30 hover:bg-white/15 transition-all duration-300 group">
                  <CardHeader className="pb-2 sm:pb-4 pt-3 sm:pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <CardTitle className="text-white text-base sm:text-xl mb-1 sm:mb-2 group-hover:text-purple-200 transition-colors leading-tight">
                          {episode.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <Badge className={`${getRankColor(episode.title)} text-white text-xs px-2 py-0.5 shrink-0`}>
                            {episode.status || 'draft'}
                          </Badge>
                          <div className="text-purple-300 text-xs hidden sm:block">
                            Created: 6/15/2025 • Plays: 0 • 0% completion
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Mobile Optimized */}
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(episode.id);
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20 h-9 w-9 sm:h-8 sm:w-8 p-0"
                          disabled={deletingEpisode === episode.id}
                        >
                          {deletingEpisode === episode.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                            />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 group-hover:text-white transition-colors opacity-70 group-hover:opacity-100" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 pt-0 sm:pt-0">
                    <CardDescription className="text-purple-200 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {episode.description}
                    </CardDescription>
                    
                    {/* Mobile Stats - Condensed */}
                    <div className="sm:hidden text-purple-300 text-xs">
                      <div>Created: 6/15/2025 • Plays: 0 • 0% completion</div>
                    </div>
                    
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center text-purple-300 text-xs">
                        <Clock className="w-3 h-3 mr-1.5 sm:mr-2 shrink-0" />
                        <span className="truncate">Requirements: {getPrerequisiteText(episode.prerequisite)}</span>
                      </div>
                      
                      {episode.prerequisite?.affection_level && (
                        <div className="flex items-center text-purple-300 text-xs">
                          <Heart className="w-3 h-3 mr-1.5 sm:mr-2 shrink-0" />
                          Affection Level {episode.prerequisite.affection_level}+
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                      <Button 
                        variant="outline"
                        className="bg-purple-800/30 border-purple-600/50 text-purple-200 hover:bg-purple-700/50 hover:text-white transition-colors text-xs sm:text-sm h-9 sm:h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add view episode functionality here
                        }}
                      >
                        <Star className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all text-xs sm:text-sm h-9 sm:h-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEpisode(episode);
                        }}
                      >
                        <Play className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                        Start
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - Mobile Optimized */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-red-900/95 to-purple-900/95 border border-red-500/50 rounded-2xl p-5 sm:p-6 max-w-sm w-full mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Trash2 className="w-7 sm:w-8 h-7 sm:h-8 text-red-400" />
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Delete Episode</h3>
                  <p className="text-red-200 text-sm leading-relaxed">
                    Are you sure you want to delete this episode? This action cannot be undone.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="bg-gray-800/30 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 h-10 sm:h-11 text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => deleteEpisode(showDeleteConfirm)}
                    disabled={deletingEpisode === showDeleteConfirm}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-10 sm:h-11 text-sm"
                  >
                    {deletingEpisode === showDeleteConfirm ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}