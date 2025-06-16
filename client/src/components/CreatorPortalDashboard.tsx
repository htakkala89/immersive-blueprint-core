import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  BarChart3, 
  Calendar,
  LogOut,
  X
} from 'lucide-react';
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
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const totalEpisodes = episodes.length;
  const totalPlays = episodes.reduce((sum, ep) => sum + ep.plays, 0);
  const avgCompletionRate = episodes.length > 0 
    ? episodes.reduce((sum, ep) => sum + ep.completionRate, 0) / episodes.length 
    : 0;

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
        editingEpisode={editingEpisode}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-white">{viewingEpisode.title}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewingEpisode(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-300">{viewingEpisode.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingEpisode.status)}`}>
                    {viewingEpisode.status}
                  </span>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Created</p>
                  <p className="text-white font-medium">{viewingEpisode.created.toLocaleDateString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Plays</p>
                  <p className="text-white font-medium">{viewingEpisode.plays.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Completion</p>
                  <p className="text-white font-medium">{viewingEpisode.completionRate}%</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={() => handleEditEpisode(viewingEpisode)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Episode
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingEpisode(null)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Creator Portal
            </h1>
            <p className="text-slate-400 mt-2">Build immersive Solo Leveling episodes with AI</p>
          </div>
          <Button
            onClick={onLogout}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Episodes</p>
                <p className="text-2xl font-bold text-white">{totalEpisodes}</p>
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
                          <span>Created: {episode.created.toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Plays: {episode.plays}</span>
                          <span>•</span>
                          <span>Completion: {episode.completionRate}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewEpisode(episode)}
                          className="text-slate-400 hover:text-white"
                          title="View Episode"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEpisode(episode)}
                          className="text-slate-400 hover:text-white"
                          title="Edit Episode"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEpisode(episode.id)}
                          className="text-slate-400 hover:text-red-400"
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
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Episode
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Template Library
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>No recent activity</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}