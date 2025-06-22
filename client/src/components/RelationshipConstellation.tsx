import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Heart, Star, X, Sparkles, Crown, Eye, 
  Moon, Sun, Coffee, Gift, Sword, Shield,
  MapPin, Calendar, Camera, MessageCircle
} from 'lucide-react';

interface SharedMemory {
  id: string;
  type: 'romantic' | 'adventure' | 'daily' | 'intimate' | 'special';
  title: string;
  description: string;
  location: string;
  timestamp: string;
  affectionGain: number;
  imageUrl?: string;
}

interface ConstellationProps {
  isVisible: boolean;
  onClose: () => void;
  affectionLevel: number;
  intimacyLevel: number;
  sharedMemories: SharedMemory[];
  relationshipMilestones: string[];
  currentMood: 'happy' | 'loving' | 'shy' | 'excited' | 'content';
}

export function RelationshipConstellation({
  isVisible,
  onClose,
  affectionLevel,
  intimacyLevel,
  sharedMemories,
  relationshipMilestones,
  currentMood
}: ConstellationProps) {
  const [selectedMemory, setSelectedMemory] = useState<SharedMemory | null>(null);
  const [activeView, setActiveView] = useState<'constellation' | 'memories' | 'milestones'>('constellation');

  const relationshipProgress = Math.min(100, (affectionLevel / 1000) * 100);
  const intimacyProgress = Math.min(100, (intimacyLevel / 10) * 100);

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'romantic': return Heart;
      case 'adventure': return Sword;
      case 'daily': return Coffee;
      case 'intimate': return Crown;
      case 'special': return Star;
      default: return Sparkles;
    }
  };

  const getMemoryColor = (type: string) => {
    switch (type) {
      case 'romantic': return 'from-pink-500 to-red-500';
      case 'adventure': return 'from-blue-500 to-purple-500';
      case 'daily': return 'from-amber-500 to-orange-500';
      case 'intimate': return 'from-purple-500 to-pink-500';
      case 'special': return 'from-yellow-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getMoodIcon = () => {
    switch (currentMood) {
      case 'happy': return '😊';
      case 'loving': return '💕';
      case 'shy': return '😊';
      case 'excited': return '✨';
      case 'content': return '😌';
      default: return '😊';
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/80 to-pink-900/80 p-4 sm:p-6 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Relationship Constellation</h2>
                <p className="text-purple-200 text-sm sm:text-base">Your bond with Cha Hae-In</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{getMoodIcon()}</div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white/90 hover:bg-white/10 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800/50 border-b border-slate-700/50">
          <div className="flex">
            {[
              { id: 'constellation', label: 'Bond Overview', icon: Heart },
              { id: 'memories', label: 'Shared Memories', icon: Camera },
              { id: 'milestones', label: 'Milestones', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-all min-h-[44px] ${
                  activeView === tab.id
                    ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-900/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'constellation' && (
            <div className="h-full p-4 sm:p-6 overflow-y-auto">
              {/* Relationship Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="bg-gradient-to-br from-pink-900/50 to-red-900/30 rounded-xl p-4 sm:p-6 border border-pink-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">Affection Level</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-pink-200">Progress</span>
                      <span className="text-white font-medium">{affectionLevel}/1000</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${relationshipProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-gradient-to-r from-pink-500 to-red-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-pink-200 text-sm">
                      {relationshipProgress < 20 && "Getting to know each other"}
                      {relationshipProgress >= 20 && relationshipProgress < 40 && "Growing closer"}
                      {relationshipProgress >= 40 && relationshipProgress < 60 && "Strong connection"}
                      {relationshipProgress >= 60 && relationshipProgress < 80 && "Deep bond"}
                      {relationshipProgress >= 80 && "Unbreakable love"}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/30 rounded-xl p-4 sm:p-6 border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Intimacy Level</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-200">Progress</span>
                      <span className="text-white font-medium">{intimacyLevel}/10</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${intimacyProgress}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                      />
                    </div>
                    <p className="text-purple-200 text-sm">
                      {intimacyProgress < 20 && "Building trust"}
                      {intimacyProgress >= 20 && intimacyProgress < 40 && "Comfortable together"}
                      {intimacyProgress >= 40 && intimacyProgress < 60 && "Intimate moments"}
                      {intimacyProgress >= 60 && intimacyProgress < 80 && "Deep intimacy"}
                      {intimacyProgress >= 80 && "Soul connection"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Constellation Visualization */}
              <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/40 rounded-xl p-6 border border-purple-500/30 min-h-[300px] relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Bond Constellation
                </h3>
                
                {/* Constellation Stars */}
                <div className="relative h-64 overflow-hidden">
                  {/* Central Star - Cha Hae-In */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-center text-white text-sm mt-2 font-medium">Cha Hae-In</p>
                  </motion.div>

                  {/* Memory Stars */}
                  {sharedMemories.slice(0, 8).map((memory, index) => {
                    const angle = (index / 8) * 2 * Math.PI;
                    const radius = 80;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const IconComponent = getMemoryIcon(memory.type);
                    
                    return (
                      <motion.div
                        key={memory.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="absolute top-1/2 left-1/2 cursor-pointer"
                        style={{
                          transform: `translate(${x - 12}px, ${y - 12}px)`
                        }}
                        onClick={() => setSelectedMemory(memory)}
                      >
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getMemoryColor(memory.type)} flex items-center justify-center shadow-md hover:scale-110 transition-transform`}>
                          <IconComponent className="w-3 h-3 text-white" />
                        </div>
                        
                        {/* Connection line */}
                        <svg className="absolute top-3 left-3" style={{ width: Math.abs(x), height: Math.abs(y) }}>
                          <line
                            x1={x > 0 ? 0 : Math.abs(x)}
                            y1={y > 0 ? 0 : Math.abs(y)}
                            x2={x > 0 ? Math.abs(x) : 0}
                            y2={y > 0 ? Math.abs(y) : 0}
                            stroke="rgba(168, 85, 247, 0.3)"
                            strokeWidth="1"
                            className="animate-pulse"
                          />
                        </svg>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeView === 'memories' && (
            <div className="h-full p-4 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedMemories.map((memory) => {
                  const IconComponent = getMemoryIcon(memory.type);
                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-gradient-to-br ${getMemoryColor(memory.type)} p-4 rounded-xl cursor-pointer hover:scale-105 transition-transform`}
                      onClick={() => setSelectedMemory(memory)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="w-5 h-5 text-white" />
                        <h4 className="text-white font-medium text-sm">{memory.title}</h4>
                      </div>
                      <p className="text-white/80 text-xs mb-2 line-clamp-2">{memory.description}</p>
                      <div className="flex items-center justify-between text-white/60 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{memory.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>+{memory.affectionGain}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {activeView === 'milestones' && (
            <div className="h-full p-4 sm:p-6 overflow-y-auto">
              <div className="space-y-4">
                {relationshipMilestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{milestone}</p>
                      <p className="text-slate-400 text-sm">Relationship milestone achieved</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                {React.createElement(getMemoryIcon(selectedMemory.type), {
                  className: "w-6 h-6 text-purple-400"
                })}
                <h3 className="text-lg font-bold text-white">{selectedMemory.title}</h3>
              </div>
              <p className="text-slate-300 mb-4">{selectedMemory.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedMemory.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedMemory.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-pink-400">
                  <Heart className="w-4 h-4" />
                  <span>+{selectedMemory.affectionGain} Affection</span>
                </div>
              </div>
              <Button
                onClick={() => setSelectedMemory(null)}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}