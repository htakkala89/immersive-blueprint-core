import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2, SkipBack, SkipForward, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReviewRaidFootageModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: (synergyBuff: boolean) => void;
  backgroundImage?: string;
}

interface FootageSegment {
  id: string;
  title: string;
  timestamp: string;
  description: string;
  performanceRating: 'excellent' | 'good' | 'needs_improvement';
}

export function ReviewRaidFootageModal({ isVisible, onClose, onComplete, backgroundImage }: ReviewRaidFootageModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration] = useState(180); // 3 minutes of footage
  const [currentSegment, setCurrentSegment] = useState(0);
  const [analysisPhase, setAnalysisPhase] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  const footageSegments: FootageSegment[] = [
    {
      id: 'opening',
      title: 'Initial Approach',
      timestamp: '0:15',
      description: 'Coordinated entry into the Red Gate. Both hunters maintained optimal formation.',
      performanceRating: 'excellent'
    },
    {
      id: 'mid_combat',
      title: 'Boss Engagement',
      timestamp: '1:30',
      description: 'Cha Hae-In\'s sword work complemented perfectly with Shadow Army tactics.',
      performanceRating: 'excellent'
    },
    {
      id: 'finale',
      title: 'Final Strike',
      timestamp: '2:45',
      description: 'Synchronized finishing move. Minor timing delay noticed.',
      performanceRating: 'good'
    }
  ];

  const analysisOptions = [
    {
      id: 'tactical',
      title: 'Focus on Tactical Coordination',
      response: 'Your shadow positioning created perfect openings for my sword techniques. We should practice that pincer movement more.',
      synergyBonus: true
    },
    {
      id: 'individual',
      title: 'Analyze Individual Performance',
      response: 'We both performed well individually, but I think there\'s room to improve our communication mid-fight.',
      synergyBonus: false
    },
    {
      id: 'future',
      title: 'Plan Future Improvements',
      response: 'Next time, let\'s establish hand signals for when we need to switch positions quickly. What do you think?',
      synergyBonus: true
    }
  ];

  // Auto-play footage simulation
  useEffect(() => {
    if (isPlaying && currentTime < totalDuration && !analysisPhase) {
      const timer = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          
          // Update current segment based on time
          if (newTime >= 165) setCurrentSegment(2); // 2:45
          else if (newTime >= 90) setCurrentSegment(1); // 1:30
          else if (newTime >= 15) setCurrentSegment(0); // 0:15
          
          // End of footage - start analysis phase
          if (newTime >= totalDuration) {
            setIsPlaying(false);
            setAnalysisPhase(true);
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isPlaying, currentTime, totalDuration, analysisPhase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnalysisSelect = (option: any) => {
    setSelectedAnalysis(option.response);
    setTimeout(() => {
      onComplete(option.synergyBonus);
    }, 3000);
  };

  const restartFootage = () => {
    setCurrentTime(0);
    setCurrentSegment(0);
    setAnalysisPhase(false);
    setSelectedAnalysis(null);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl h-[85vh] bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-3xl overflow-hidden shadow-2xl border border-blue-400/30"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Dark overlay for video player aesthetic */}
          <div className="absolute inset-0 bg-black/70" />
          
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Hunter Association HQ Header */}
          <div className="absolute top-6 left-6 z-40">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Raid Analysis Center</h1>
                <p className="text-blue-200">Hunter Association HQ - Floor 15</p>
              </div>
            </div>
          </div>

          {/* Main Video Player Interface */}
          {!analysisPhase ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-4xl space-y-6">
                {/* Video Display Area */}
                <div className="relative aspect-video bg-black/50 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
                  {/* Simulated video content */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-orange-900/30 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ 
                          scale: isPlaying ? [1, 1.1, 1] : 1,
                          opacity: isPlaying ? [0.8, 1, 0.8] : 0.6
                        }}
                        transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                        className="text-6xl mb-4"
                      >
                        ⚔️
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {footageSegments[currentSegment]?.title || 'Red Gate Raid Footage'}
                      </h3>
                      <p className="text-gray-300 text-sm max-w-md">
                        {footageSegments[currentSegment]?.description || 'High-definition combat footage from your latest S-Rank gate clearance.'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Play button overlay */}
                  {!isPlaying && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsPlaying(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                    >
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </motion.button>
                  )}
                  
                  {/* Current segment indicator */}
                  {isPlaying && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md rounded-lg px-3 py-2">
                      <span className="text-cyan-400 font-semibold">
                        {footageSegments[currentSegment]?.timestamp}
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                    </button>
                    <button
                      onClick={restartFootage}
                      className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <SkipBack className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1 flex items-center space-x-3">
                      <span className="text-white text-sm">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{formatTime(totalDuration)}</span>
                    </div>
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Segment markers */}
                  <div className="flex justify-between text-xs text-gray-400">
                    {footageSegments.map((segment, index) => (
                      <div
                        key={segment.id}
                        className={`text-center ${index === currentSegment ? 'text-cyan-400' : ''}`}
                      >
                        <div className="font-semibold">{segment.title}</div>
                        <div>{segment.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Analysis Phase */
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-3xl space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Performance Analysis</h2>
                  <p className="text-blue-200 text-lg">How would you like to review your teamwork?</p>
                </div>

                {!selectedAnalysis ? (
                  <div className="space-y-4">
                    {analysisOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnalysisSelect(option)}
                        className="w-full p-6 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl border border-white/20 transition-all duration-200 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">{option.title}</h3>
                            <p className="text-gray-300 text-sm">Click to discuss this aspect of your performance</p>
                          </div>
                          {option.synergyBonus && (
                            <div className="flex items-center space-x-2 text-green-400">
                              <TrendingUp className="w-5 h-5" />
                              <span className="text-sm font-semibold">+5% Synergy</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold">CH</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-2">Cha Hae-In</h4>
                        <p className="text-white/90 text-sm italic">"{selectedAnalysis}"</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/20">
                      <div className="flex items-center justify-center space-x-6">
                        <div className="flex items-center space-x-2 text-green-400">
                          <Award className="w-5 h-5" />
                          <span>Professional Development</span>
                        </div>
                        <div className="flex items-center space-x-2 text-blue-400">
                          <TrendingUp className="w-5 h-5" />
                          <span>+5% Raid Synergy Bonus</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}