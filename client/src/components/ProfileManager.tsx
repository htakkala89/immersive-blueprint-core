import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Crown, 
  Clock, 
  Heart,
  User,
  ArrowLeft,
  Play
} from 'lucide-react';
import { PlayerProfile } from '@/../../shared/schema';

interface ProfileManagerProps {
  isVisible: boolean;
  onClose: () => void;
  onLoadProfile: (profileId: number) => void;
  currentGameState: any;
}

export default function ProfileManager({ isVisible, onClose, onLoadProfile, currentGameState }: ProfileManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['/api/profiles'],
    queryFn: async () => {
      const response = await fetch('/api/profiles');
      if (!response.ok) throw new Error('Failed to fetch profiles');
      return response.json();
    },
    enabled: isVisible
  });

  const createProfileMutation = useMutation({
    mutationFn: async (profileName: string) => {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          profileName,
          gameState: currentGameState 
        })
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      setShowCreateDialog(false);
      setNewProfileName('');
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    }
  });

  const saveCurrentProgressMutation = useMutation({
    mutationFn: async (profileId: number) => {
      const response = await fetch(`/api/profiles/${profileId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState: currentGameState })
      });
      if (!response.ok) throw new Error('Failed to save progress');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgressSummary = (profile: PlayerProfile) => {
    const completedCount = profile.completedEpisodes?.length || 0;
    return {
      level: (profile as any).gameState?.level || 1,
      affection: (profile as any).gameState?.affectionLevel || 0,
      episodes: completedCount,
      currentEpisode: profile.currentEpisode
    };
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-purple-600/50 text-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="text-2xl">Profile Manager</CardTitle>
                <p className="text-purple-200 text-sm">Save, load, and manage your game progress</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[60vh]">
            {isLoading ? (
              <div className="text-center py-8 text-purple-200">Loading profiles...</div>
            ) : !profiles?.profiles?.length ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Saved Profiles</h3>
                <p className="text-purple-300 mb-4">Create your first profile to save your progress</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profiles.profiles.map((profile: PlayerProfile) => {
                  const progress = getProgressSummary(profile);
                  return (
                    <Card key={profile.id} className="bg-white/10 border-purple-600/30 hover:bg-white/15 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{profile.profileName}</h3>
                            <p className="text-sm text-purple-300">
                              {profile.isActive && <Badge className="bg-green-600 text-white text-xs mr-2">Active</Badge>}
                              Last played: {formatDate(profile.lastPlayed)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-purple-200">
                            <Crown className="w-4 h-4 mr-2" />
                            Level {progress.level}
                          </div>
                          <div className="flex items-center text-sm text-purple-200">
                            <Heart className="w-4 h-4 mr-2" />
                            Affection {progress.affection}
                          </div>
                          <div className="flex items-center text-sm text-purple-200">
                            <Play className="w-4 h-4 mr-2" />
                            {progress.episodes} episodes completed
                          </div>
                          {progress.currentEpisode && (
                            <div className="flex items-center text-sm text-purple-200">
                              <Clock className="w-4 h-4 mr-2" />
                              In progress: {progress.currentEpisode}
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => onLoadProfile(profile.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <Load className="w-4 h-4 mr-2" />
                            Load
                          </Button>
                          <Button
                            onClick={() => saveCurrentProgressMutation.mutate(profile.id)}
                            disabled={saveCurrentProgressMutation.isPending}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saveCurrentProgressMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            onClick={() => deleteProfileMutation.mutate(profile.id)}
                            disabled={deleteProfileMutation.isPending}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Profile Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-purple-900 border-purple-600 text-white">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-purple-200 mb-2 block">Profile Name</label>
              <Input
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter profile name..."
                className="bg-purple-800/50 border-purple-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowCreateDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createProfileMutation.mutate(newProfileName)}
                disabled={!newProfileName.trim() || createProfileMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}