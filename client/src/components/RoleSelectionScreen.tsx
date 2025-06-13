import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Settings, User, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileManager from '@/components/ProfileManager';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'player' | 'creator', profileId?: number) => void;
}

export function RoleSelectionScreen({ onSelectRole }: RoleSelectionScreenProps) {
  const [showProfileManager, setShowProfileManager] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const handleLoadProfile = (profileId: number) => {
    setSelectedProfileId(profileId);
    setShowProfileManager(false);
    // Automatically enter player mode with loaded profile
    onSelectRole('player', profileId);
  };

  const handleNewGame = async () => {
    try {
      // Create a new profile with default starting values
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileName: `New Game ${new Date().toLocaleDateString()}`,
          description: 'Fresh start in Solo Leveling',
          gameData: {
            level: 1,
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            affectionLevel: 0,
            intimacyLevel: 1,
            gold: 100,
            currentScene: "hunter_association",
            energy: 100,
            maxEnergy: 100,
            experience: 0,
            maxExperience: 100,
            apartmentTier: 1,
            stats: { strength: 10, agility: 10, vitality: 10, intelligence: 10, sense: 10 },
            statPoints: 0,
            skillPoints: 0,
            storyProgress: 0,
            inventory: [],
            activeQuests: [],
            completedQuests: [],
            unlockedActivities: [],
            sharedMemories: [],
            storyFlags: {}
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create new game');
      
      const { profile } = await response.json();
      
      // Automatically load the new profile and enter player mode
      onSelectRole('player', profile.id);
    } catch (error) {
      console.error('Error creating new game:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23000000;stop-opacity:1" /><stop offset="50%" style="stop-color:%235B21B6;stop-opacity:0.8" /><stop offset="100%" style="stop-color:%23000000;stop-opacity:1" /></linearGradient></defs><rect width="1920" height="1080" fill="url(%23bg)"/></svg>')`
        }}
      />
      
      {/* Glassmorphism Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl mx-auto p-8"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 flex items-center justify-center mr-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Monarch's Shadow</h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-slate-300 mb-2"
          >
            Choose Your Experience
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm text-slate-400"
          >
            Select how you want to interact with the Solo Leveling universe
          </motion.p>
        </div>

        {/* Role Selection Buttons */}
        <div className="space-y-6">
          {/* New Game Button */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Button
              onClick={handleNewGame}
              className="w-full h-20 bg-gradient-to-r from-green-600/80 to-emerald-600/80 hover:from-green-500/90 hover:to-emerald-500/90 border border-white/20 backdrop-blur-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Start New Game</h3>
                  <p className="text-xs text-slate-200 opacity-90">
                    Begin fresh adventure with default starting stats
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Continue Game Button */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              onClick={() => setShowProfileManager(true)}
              className="w-full h-20 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500/90 hover:to-blue-500/90 border border-white/20 backdrop-blur-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-white">Continue Game</h3>
                  <p className="text-xs text-slate-200 opacity-90">
                    Load saved progress and manage profiles
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>

          {/* Creator Portal Button */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <Button
              onClick={() => onSelectRole('creator')}
              className="w-full h-24 bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500/90 hover:to-orange-500/90 border border-white/20 backdrop-blur-sm transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.8) 0%, rgba(234, 88, 12, 0.8) 100%)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white">Open Creator Portal</h3>
                  <p className="text-sm text-slate-200 opacity-90">
                    Access AI-powered episode creation tools
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>


        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-xs text-slate-500">
            Development Environment • Role Selection Mode
          </p>
        </motion.div>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Profile Manager Modal */}
      <ProfileManager
        isVisible={showProfileManager}
        onClose={() => setShowProfileManager(false)}
        onLoadProfile={handleLoadProfile}
        currentGameState={{}} // Empty state for role selection screen
      />
    </div>
  );
}