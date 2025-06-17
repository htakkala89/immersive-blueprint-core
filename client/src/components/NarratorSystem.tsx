import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Volume2, VolumeX, Eye, Heart, Sparkles } from 'lucide-react';

interface NarratorResponse {
  narrativeText: string;
  tone: 'mysterious' | 'romantic' | 'dramatic' | 'gentle' | 'intense' | 'hopeful';
  guidance?: string;
  worldBuilding?: string;
  characterInsights?: string;
  foreshadowing?: string;
}

interface NarratorSystemProps {
  playerId: string;
  currentLocation: string;
  timeOfDay: string;
  weather: string;
  affectionLevel: number;
  storyProgress: number;
  relationshipStatus: string;
  currentActivity?: string;
  episodeContext?: string;
  isVisible?: boolean;
  onToggle?: () => void;
  autoNarrate?: boolean;
}

export const NarratorSystem: React.FC<NarratorSystemProps> = ({
  playerId,
  currentLocation,
  timeOfDay,
  weather,
  affectionLevel,
  storyProgress,
  relationshipStatus,
  currentActivity,
  episodeContext,
  isVisible = true,
  onToggle,
  autoNarrate = true
}) => {
  const [currentNarration, setCurrentNarration] = useState<NarratorResponse | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [narratorVoiceEnabled, setNarratorVoiceEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [narratorMemory, setNarratorMemory] = useState<string[]>([]);

  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'mysterious': return <Eye className="w-4 h-4 text-purple-400" />;
      case 'romantic': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'dramatic': return <Sparkles className="w-4 h-4 text-red-400" />;
      case 'gentle': return <Heart className="w-4 h-4 text-blue-400" />;
      case 'intense': return <Sparkles className="w-4 h-4 text-orange-400" />;
      case 'hopeful': return <Sparkles className="w-4 h-4 text-green-400" />;
      default: return <BookOpen className="w-4 h-4 text-gray-400" />;
    }
  };

  const getToneColors = (tone: string) => {
    switch (tone) {
      case 'mysterious': return 'from-purple-900/20 to-indigo-900/20 border-purple-500/30';
      case 'romantic': return 'from-pink-900/20 to-rose-900/20 border-pink-500/30';
      case 'dramatic': return 'from-red-900/20 to-orange-900/20 border-red-500/30';
      case 'gentle': return 'from-blue-900/20 to-cyan-900/20 border-blue-500/30';
      case 'intense': return 'from-orange-900/20 to-yellow-900/20 border-orange-500/30';
      case 'hopeful': return 'from-green-900/20 to-emerald-900/20 border-green-500/30';
      default: return 'from-gray-900/20 to-slate-900/20 border-gray-500/30';
    }
  };

  const generateNarration = async () => {
    if (isNarrating) return;
    
    setIsNarrating(true);
    try {
      const response = await fetch('/api/narrator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerId,
          currentLocation,
          timeOfDay,
          weather,
          affectionLevel,
          storyProgress,
          relationshipStatus,
          currentActivity,
          episodeContext,
          recentEvents: narratorMemory.slice(-3),
          playerChoices: []
        }),
      });

      if (response.ok) {
        const narration = await response.json();
        setCurrentNarration(narration);
        
        // Add to memory
        setNarratorMemory(prev => [...prev.slice(-9), narration.narrativeText]);
      }
    } catch (error) {
      console.error('Failed to generate narration:', error);
    } finally {
      setIsNarrating(false);
    }
  };

  // Auto-generate narration when context changes significantly
  useEffect(() => {
    if (autoNarrate && isVisible) {
      const timer = setTimeout(() => {
        generateNarration();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentLocation, timeOfDay, affectionLevel, currentActivity]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40"
    >
      <div className={`bg-gradient-to-br ${currentNarration ? getToneColors(currentNarration.tone) : 'from-gray-900/20 to-slate-900/20 border-gray-500/30'} backdrop-blur-md rounded-xl border shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-white font-medium">Narrator</span>
            {currentNarration && getToneIcon(currentNarration.tone)}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setNarratorVoiceEnabled(!narratorVoiceEnabled)}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              {narratorVoiceEnabled ? 
                <Volume2 className="w-4 h-4 text-white/60" /> : 
                <VolumeX className="w-4 h-4 text-white/60" />
              }
            </button>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Eye className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* Main Narration */}
        <div className="p-4">
          {isNarrating ? (
            <div className="flex items-center space-x-3 text-white/60">
              <div className="animate-spin w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></div>
              <span>The narrator considers the scene...</span>
            </div>
          ) : currentNarration ? (
            <div className="space-y-3">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white leading-relaxed text-sm italic"
              >
                {currentNarration.narrativeText}
              </motion.p>

              {/* Guidance */}
              {currentNarration.guidance && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 rounded-lg p-3 border-l-2 border-amber-400"
                >
                  <p className="text-amber-200 text-xs font-medium mb-1">Narrator's Guidance</p>
                  <p className="text-white/80 text-xs">{currentNarration.guidance}</p>
                </motion.div>
              )}

              {/* Additional Details Toggle */}
              {(currentNarration.worldBuilding || currentNarration.characterInsights || currentNarration.foreshadowing) && (
                <div className="border-t border-white/10 pt-3">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    {showDetails ? 'Hide Details' : 'Show More Details'}
                  </button>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2"
                      >
                        {currentNarration.worldBuilding && (
                          <div className="bg-blue-500/10 rounded p-2">
                            <p className="text-blue-200 text-xs font-medium mb-1">World Context</p>
                            <p className="text-white/70 text-xs">{currentNarration.worldBuilding}</p>
                          </div>
                        )}
                        
                        {currentNarration.characterInsights && (
                          <div className="bg-pink-500/10 rounded p-2">
                            <p className="text-pink-200 text-xs font-medium mb-1">Character Insights</p>
                            <p className="text-white/70 text-xs">{currentNarration.characterInsights}</p>
                          </div>
                        )}
                        
                        {currentNarration.foreshadowing && (
                          <div className="bg-purple-500/10 rounded p-2">
                            <p className="text-purple-200 text-xs font-medium mb-1">Foreshadowing</p>
                            <p className="text-white/70 text-xs">{currentNarration.foreshadowing}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={generateNarration}
              className="w-full text-white/60 hover:text-white/80 transition-colors text-sm py-2"
            >
              Click to hear the narrator's voice...
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center p-3 border-t border-white/10 bg-black/20">
          <button
            onClick={generateNarration}
            disabled={isNarrating}
            className="px-3 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 rounded text-xs transition-colors disabled:opacity-50"
          >
            New Narration
          </button>
          <div className="text-xs text-white/40">
            Tone: {currentNarration?.tone || 'waiting'}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NarratorSystem;