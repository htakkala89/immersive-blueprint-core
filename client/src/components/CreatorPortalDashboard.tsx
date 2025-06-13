import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  BarChart3, 
  Settings, 
  LogOut, 
  Clock, 
  Users,
  Eye,
  Edit3,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NarrativeArchitectAI } from './NarrativeArchitectAI';

interface Episode {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  created: Date;
  lastModified: Date;
  plays: number;
  completionRate: number;
}

interface CreatorPortalDashboardProps {
  onLogout: () => void;
}

export function CreatorPortalDashboard({ onLogout }: CreatorPortalDashboardProps) {
  const [showEpisodeBuilder, setShowEpisodeBuilder] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [viewingEpisode, setViewingEpisode] = useState<Episode | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getStatusColor = (status: Episode['status']) => {
    switch (status) {
      case 'published': return 'text-green-400 bg-green-400/20';
      case 'draft': return 'text-yellow-400 bg-yellow-400/20';
      case 'archived': return 'text-gray-400 bg-gray-400/20';
    }
  };

  const totalPlays = episodes.reduce((sum, ep) => sum + ep.plays, 0);
  const avgCompletionRate = episodes.filter(ep => ep.plays > 0).reduce((sum, ep) => sum + ep.completionRate, 0) / episodes.filter(ep => ep.plays > 0).length || 0;

  const handleEditEpisode = (episode: Episode) => {
    setEditingEpisode(episode);
    setShowEpisodeBuilder(true);
  };

  const handleViewEpisode = (episode: Episode) => {
    setViewingEpisode(episode);
  };

  const handleDeleteEpisode = (episodeId: string) => {
    if (confirm('Are you sure you want to delete this episode? This action cannot be undone.')) {
      setEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
    }
  };

  // Load episodes from the API
  const loadEpisodes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/episodes');
      if (!response.ok) {
        throw new Error('Failed to fetch episodes');
      }
      const data = await response.json();
      
      // Transform API data to match our Episode interface
      const transformedEpisodes = data.episodes.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        status: ep.status || 'draft',
        created: new Date(), // Episodes don't have creation dates in current schema
        lastModified: new Date(),
        plays: 0, // Not tracked yet in the system
        completionRate: 0 // Not tracked yet in the system
      }));
      
      setEpisodes(transformedEpisodes);
    } catch (error) {
      console.error('Failed to load episodes:', error);
      // Keep empty episodes array if loading fails
      setEpisodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load episodes when component mounts
  React.useEffect(() => {
    loadEpisodes();
  }, []);

  if (showEpisodeBuilder) {
    return (
      <NarrativeArchitectAI
        isVisible={true}
        onClose={() => {
          setShowEpisodeBuilder(false);
          setEditingEpisode(null);
          loadEpisodes(); // Refresh episodes when closing builder
        }}
      />
    );
  }

  // Episode Details Modal
  if (viewingEpisode) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{viewingEpisode.title}</h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingEpisode.status)}`}>
                    {viewingEpisode.status}
                  </span>
                  <span className="text-slate-400 text-sm">
                    Created: {viewingEpisode.created.toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingEpisode(null)}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-300">{viewingEpisode.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{viewingEpisode.plays}</div>
                  <div className="text-sm text-slate-400">Total Plays</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{viewingEpisode.completionRate}%</div>
                  <div className="text-sm text-slate-400">Completion Rate</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round((Date.now() - viewingEpisode.created.getTime()) / (1000 * 60 * 60 * 24))}d
                  </div>
                  <div className="text-sm text-slate-400">Days Old</div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setViewingEpisode(null);
                    handleEditEpisode(viewingEpisode);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Episode
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingEpisode(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Creator Portal</h1>
                <p className="text-sm text-slate-400">Episode Management Dashboard</p>
              </div>
            </div>
            
            <Button
              onClick={onLogout}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Exit Portal
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Episodes</p>
                <p className="text-2xl font-bold text-white">{episodes.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Plays</p>
                <p className="text-2xl font-bold text-white">{totalPlays.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg. Completion</p>
                <p className="text-2xl font-bold text-white">{Math.round(avgCompletionRate)}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-white">{episodes.filter(ep => ep.status === 'published').length}</p>
              </div>
              <Eye className="w-8 h-8 text-amber-400" />
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Episodes List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Episodes</h2>
              <Button
                onClick={() => setShowEpisodeBuilder(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Episode
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/60">Loading episodes...</div>
              </div>
            ) : episodes.length === 0 ? (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
                <BookOpen className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Episodes Yet</h3>
                <p className="text-slate-400 mb-6">Create your first AI-generated episode to bring your Solo Leveling stories to life.</p>
                <Button
                  onClick={() => setShowEpisodeBuilder(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Episode
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {episodes.map((episode, index) => (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{episode.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(episode.status)}`}>
                          {episode.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{episode.description}</p>
                      
                      <div className="flex items-center space-x-6 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {episode.lastModified.toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {episode.plays} plays
                        </span>
                        <span className="flex items-center">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          {episode.completionRate}% completion
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        onClick={() => handleEditEpisode(episode)}
                        title="Edit Episode"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        onClick={() => handleViewEpisode(episode)}
                        title="View Episode Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/10"
                        onClick={() => handleDeleteEpisode(episode.id)}
                        title="Delete Episode"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => setShowEpisodeBuilder(true)}
                  className="w-full justify-start bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Episode
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start border-white/20 text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-2">AI Creator Tools</h3>
              <p className="text-slate-300 text-sm mb-4">
                Use natural language to create complex episodes with our Narrative Architect AI.
              </p>
              <Button
                onClick={() => setShowEpisodeBuilder(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Launch AI Creator
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Episode published: "Echoes of the Red Gate"</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Draft saved: "Starlit Confessions"</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  <span className="text-slate-300">Analytics updated</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}