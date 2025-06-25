import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Target, 
  X, 
  Play, 
  CheckCircle,
  AlertTriangle,
  Scroll,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Episode {
  id: string;
  title: string;
  description: string;
  status: 'inactive' | 'available' | 'active' | 'completed';
  currentBeatIndex: number;
  beats: StoryBeat[];
  prerequisite: {
    player_level?: number;
    affection_level?: number;
    completed_episodes?: string[];
  };
}

interface StoryBeat {
  beat_id: string;
  title: string;
  description: string;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  status: 'active' | 'completed' | 'failed';
}

interface QuestObjective {
  id: string;
  text: string;
  completed: boolean;
  optional?: boolean;
}

interface EpisodicStoryEngineProps {
  isVisible: boolean;
  onClose: () => void;
  playerStats: {
    level: number;
    affectionLevel: number;
    gold: number;
  };
}

export function EpisodicStoryEngine({ isVisible, onClose, playerStats }: EpisodicStoryEngineProps) {
  const [activeTab, setActiveTab] = useState<'episodes' | 'quests' | 'memories'>('episodes');
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleEpisodes: Episode[] = [
      {
        id: 'EP01_Red_Echo',
        title: 'Echoes of the Red Gate',
        description: 'A mysterious A-Rank gate appears with strange energy readings. You and Cha Hae-In must investigate together.',
        status: playerStats.level >= 25 && playerStats.affectionLevel >= 50 ? 'available' : 'inactive',
        currentBeatIndex: 0,
        prerequisite: {
          player_level: 25,
          affection_level: 50
        },
        beats: [
          {
            beat_id: '1.0',
            title: 'Emergency Alert',
            description: 'The Hunter Association sends an urgent alert about a Red Gate anomaly'
          },
          {
            beat_id: '2.0',
            title: 'Meeting at Hunter HQ',
            description: 'Meet Cha Hae-In at the Hunter Association to discuss the mission'
          },
          {
            beat_id: '3.0',
            title: 'Enter the Red Gate',
            description: 'Enter the mysterious Red Gate together'
          },
          {
            beat_id: '4.0',
            title: 'The Echo Phantom',
            description: 'Face the mysterious boss that mimics your past'
          },
          {
            beat_id: '5.0',
            title: 'Aftermath and Revelation',
            description: 'Process what happened and grow closer'
          }
        ]
      },
      {
        id: 'EP02_Shadow_Bonds',
        title: 'Bonds in Shadow',
        description: 'A personal story about trust and vulnerability as your relationship deepens.',
        status: 'inactive',
        currentBeatIndex: 0,
        prerequisite: {
          player_level: 30,
          affection_level: 70,
          completed_episodes: ['EP01_Red_Echo']
        },
        beats: [
          {
            beat_id: '1.0',
            title: 'Quiet Moments',
            description: 'A peaceful evening leads to deeper conversations'
          },
          {
            beat_id: '2.0',
            title: 'Shared Vulnerabilities',
            description: 'Both of you open up about past fears and hopes'
          },
          {
            beat_id: '3.0',
            title: 'Strengthened Bond',
            description: 'Your relationship reaches a new level of intimacy'
          }
        ]
      }
    ];

    const sampleQuests: Quest[] = [
      {
        id: 'daily_training',
        title: 'Daily Hunter Training',
        description: 'Complete training exercises to improve your abilities',
        status: 'active',
        objectives: [
          { id: 'obj1', text: 'Complete sparring session', completed: false },
          { id: 'obj2', text: 'Review raid footage', completed: true },
          { id: 'obj3', text: 'Practice co-op techniques', completed: false }
        ]
      }
    ];

    setEpisodes(sampleEpisodes);
    setQuests(sampleQuests);
  }, [playerStats]);

  const acceptEpisode = (episodeId: string) => {
    setEpisodes(prev => prev.map(ep => 
      ep.id === episodeId ? { ...ep, status: 'active' } : ep
    ));
    
    // Add quest for this episode
    const episode = episodes.find(ep => ep.id === episodeId);
    if (episode) {
      const newQuest: Quest = {
        id: episodeId,
        title: episode.title,
        description: episode.description,
        status: 'active',
        objectives: [
          {
            id: 'start',
            text: 'Begin the episode',
            completed: true
          }
        ]
      };
      setQuests(prev => [...prev, newQuest]);
    }
  };

  const getEpisodesByStatus = (status: Episode['status']) => {
    return episodes.filter(ep => ep.status === status);
  };

  const getStatusColor = (status: Episode['status']) => {
    switch (status) {
      case 'available': return 'text-green-400 bg-green-400/20';
      case 'active': return 'text-blue-400 bg-blue-400/20';
      case 'completed': return 'text-purple-400 bg-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getProgressPercentage = (episode: Episode) => {
    if (episode.status === 'completed') return 100;
    if (episode.status === 'inactive') return 0;
    return (episode.currentBeatIndex / episode.beats.length) * 100;
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-6xl h-full bg-gradient-to-b from-gray-900 to-black p-6 overflow-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-400 flex items-center">
            <BookOpen className="w-8 h-8 mr-3" />
            Story Engine
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <X />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'episodes', label: 'Episodes', icon: BookOpen },
            { id: 'quests', label: 'Active Quests', icon: Target },
            { id: 'memories', label: 'Memory Stars', icon: Star }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Episodes Tab */}
        {activeTab === 'episodes' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Episode List */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Available Episodes</h3>
              
              {['available', 'active', 'completed', 'inactive'].map(status => {
                const statusEpisodes = getEpisodesByStatus(status as Episode['status']);
                if (statusEpisodes.length === 0) return null;
                
                return (
                  <div key={status} className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-300 capitalize">
                      {status} Episodes ({statusEpisodes.length})
                    </h4>
                    {statusEpisodes.map(episode => (
                      <motion.div
                        key={episode.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 rounded-lg p-4 cursor-pointer border border-gray-700 hover:border-purple-500 transition-all"
                        onClick={() => setSelectedEpisode(episode)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-bold text-white">{episode.title}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(episode.status)}`}>
                            {episode.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{episode.description}</p>
                        
                        {episode.status !== 'inactive' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{episode.currentBeatIndex}/{episode.beats.length} beats</span>
                            </div>
                            <Progress value={getProgressPercentage(episode)} className="h-2" />
                          </div>
                        )}
                        
                        {episode.status === 'inactive' && (
                          <div className="text-xs text-red-400 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Requirements: Level {episode.prerequisite.player_level}, Affection {episode.prerequisite.affection_level}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* Episode Detail */}
            <div className="bg-gray-800 rounded-lg p-6">
              {selectedEpisode ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedEpisode.title}</h3>
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${getStatusColor(selectedEpisode.status)}`}>
                        {selectedEpisode.status.toUpperCase()}
                      </span>
                    </div>
                    {selectedEpisode.status === 'available' && (
                      <Button
                        onClick={() => acceptEpisode(selectedEpisode.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Episode
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-gray-300">{selectedEpisode.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Story Beats:</h4>
                    {selectedEpisode.beats.map((beat, index) => (
                      <div 
                        key={beat.beat_id}
                        className={`p-3 rounded border-l-4 ${
                          index < selectedEpisode.currentBeatIndex 
                            ? 'border-green-500 bg-green-900/20' 
                            : index === selectedEpisode.currentBeatIndex
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-gray-600 bg-gray-900/20'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {index < selectedEpisode.currentBeatIndex && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          {index === selectedEpisode.currentBeatIndex && (
                            <Clock className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="font-medium text-white">{beat.title}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{beat.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select an episode to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quests Tab */}
        {activeTab === 'quests' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Active Quests</h3>
            {quests.map(quest => (
              <div key={quest.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white">{quest.title}</h4>
                    <p className="text-gray-400 text-sm">{quest.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    quest.status === 'active' ? 'text-blue-400 bg-blue-400/20' : 'text-green-400 bg-green-400/20'
                  }`}>
                    {quest.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-300">Objectives:</h5>
                  {quest.objectives.map(obj => (
                    <div key={obj.id} className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${obj.completed ? 'text-green-500' : 'text-gray-600'}`} />
                      <span className={`text-sm ${obj.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                        {obj.text}
                      </span>
                      {obj.optional && <span className="text-xs text-gray-500">(Optional)</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Memory Stars Tab */}
        {activeTab === 'memories' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">Memory Stars</h3>
            <div className="text-center text-gray-500 py-12">
              <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Complete episodes to unlock memory stars</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}