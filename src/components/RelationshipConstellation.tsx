import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Star, X, Sparkles, Crown, 
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
  const [activeView, setActiveView] = useState<'timeline' | 'moments' | 'bond'>('timeline');

  const relationshipProgress = Math.min(100, (affectionLevel / 1000) * 100);
  const intimacyProgress = Math.min(100, (intimacyLevel / 10) * 100);

  // Create mock memories for demonstration
  const mockMemories: SharedMemory[] = [
    {
      id: '1',
      type: 'romantic',
      title: 'First Coffee Together',
      description: 'Our first quiet moment at the cozy Hongdae cafe, sharing stories over warm coffee.',
      location: 'Hongdae Cafe',
      timestamp: '2024-01-15',
      affectionGain: 15,
    },
    {
      id: '2',
      type: 'adventure',
      title: 'Red Gate Dungeon',
      description: 'Fighting side by side in the dangerous Red Gate, trusting each other completely.',
      location: 'Red Gate Dungeon',
      timestamp: '2024-01-20',
      affectionGain: 25,
    },
    {
      id: '3',
      type: 'intimate',
      title: 'Apartment Evening',
      description: 'A quiet evening together in the apartment, sharing deeper conversations.',
      location: 'Cha Hae-In\'s Apartment',
      timestamp: '2024-01-25',
      affectionGain: 30,
    },
    {
      id: '4',
      type: 'daily',
      title: 'Morning Training',
      description: 'Training together at the Hunter Association, improving our coordination.',
      location: 'Hunter Association',
      timestamp: '2024-01-30',
      affectionGain: 10,
    },
    {
      id: '5',
      type: 'special',
      title: 'N Seoul Tower Date',
      description: 'A romantic evening overlooking the city lights, making promises for the future.',
      location: 'N Seoul Tower',
      timestamp: '2024-02-05',
      affectionGain: 40,
    }
  ];

  const displayMemories = sharedMemories.length > 0 ? sharedMemories : mockMemories;

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
      className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Hearts */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Heart className="w-6 h-6" />
          </motion.div>
        ))}
        
        {/* Sparkling Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.div>
        ))}
      </div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col p-4 sm:p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div className="text-4xl">{getMoodIcon()}</div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Our Bond</h1>
          <p className="text-lg text-purple-200">Cha Hae-In & You</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-black/30 backdrop-blur-sm rounded-full p-1 border border-white/20">
            {[
              { key: 'timeline', label: 'Timeline', icon: Calendar },
              { key: 'moments', label: 'Moments', icon: Camera },
              { key: 'bond', label: 'Bond', icon: Heart },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveView(key as any)}
                className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 ${
                  activeView === key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'text-purple-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeView === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full overflow-y-auto px-4"
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Journey Together</h2>
                  
                  {/* Timeline */}
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
                    
                    {displayMemories.map((memory, index) => {
                      const Icon = getMemoryIcon(memory.type);
                      const colorClass = getMemoryColor(memory.type);
                      
                      return (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                        >
                          {/* Timeline Node */}
                          <div className={`absolute left-6 w-6 h-6 rounded-full bg-gradient-to-r ${colorClass} border-4 border-white shadow-lg z-10`}>
                            <Icon className="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          </div>
                          
                          {/* Memory Card */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={`bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl ${
                              index % 2 === 0 ? 'ml-16' : 'mr-16'
                            } max-w-md cursor-pointer`}
                            onClick={() => setSelectedMemory(memory)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">{memory.title}</h3>
                                <p className="text-sm text-purple-200">{memory.location}</p>
                              </div>
                            </div>
                            <p className="text-slate-300 text-sm mb-3">{memory.description}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-purple-300">{new Date(memory.timestamp).toLocaleDateString()}</span>
                              <span className="text-xs text-pink-300">+{memory.affectionGain} affection</span>
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'moments' && (
              <motion.div
                key="moments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full overflow-y-auto px-4"
              >
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">Precious Moments</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayMemories.map((memory, index) => {
                      const Icon = getMemoryIcon(memory.type);
                      const colorClass = getMemoryColor(memory.type);
                      
                      return (
                        <motion.div
                          key={memory.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-xl cursor-pointer"
                          onClick={() => setSelectedMemory(memory)}
                        >
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center mb-4 mx-auto`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-white text-center mb-2">{memory.title}</h3>
                          <p className="text-sm text-purple-200 text-center mb-3">{memory.location}</p>
                          <p className="text-slate-300 text-sm text-center mb-4">{memory.description}</p>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-purple-300">{new Date(memory.timestamp).toLocaleDateString()}</span>
                            <span className="text-pink-300">+{memory.affectionGain}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'bond' && (
              <motion.div
                key="bond"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="h-full overflow-y-auto px-4"
              >
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold text-white mb-8 text-center">Relationship Status</h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Affection Level */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-pink-500/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Heart className="w-8 h-8 text-pink-500" />
                        <h3 className="text-xl font-bold text-white">Affection Level</h3>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                          <span>Current: {affectionLevel}</span>
                          <span>Max: 1000</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${relationshipProgress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">
                        {relationshipProgress >= 80 ? "Deeply in love" :
                         relationshipProgress >= 60 ? "Very close" :
                         relationshipProgress >= 40 ? "Growing closer" :
                         relationshipProgress >= 20 ? "Getting to know each other" :
                         "Just beginning"}
                      </p>
                    </motion.div>

                    {/* Intimacy Level */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Crown className="w-8 h-8 text-purple-500" />
                        <h3 className="text-xl font-bold text-white">Intimacy Level</h3>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-purple-200 mb-2">
                          <span>Current: {intimacyLevel}</span>
                          <span>Max: 10</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${intimacyProgress}%` }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">
                        {intimacyProgress >= 80 ? "Complete trust" :
                         intimacyProgress >= 60 ? "Very intimate" :
                         intimacyProgress >= 40 ? "Growing trust" :
                         intimacyProgress >= 20 ? "Building intimacy" :
                         "Getting comfortable"}
                      </p>
                    </motion.div>

                    {/* Current Mood */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-yellow-500/30 lg:col-span-2"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sun className="w-8 h-8 text-yellow-500" />
                        <h3 className="text-xl font-bold text-white">Cha Hae-In's Current Mood</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">{getMoodIcon()}</div>
                        <div>
                          <p className="text-2xl font-bold text-white capitalize">{currentMood}</p>
                          <p className="text-slate-300">
                            {currentMood === 'happy' ? "She's enjoying spending time with you" :
                             currentMood === 'loving' ? "Her feelings for you are growing stronger" :
                             currentMood === 'shy' ? "She's feeling a bit bashful around you" :
                             currentMood === 'excited' ? "She's looking forward to your next adventure" :
                             currentMood === 'content' ? "She feels peaceful and comfortable with you" :
                             "She's in a good mood"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Shared Memories Count */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Camera className="w-8 h-8 text-blue-500" />
                        <h3 className="text-xl font-bold text-white">Shared Memories</h3>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-400 mb-2">{displayMemories.length}</div>
                        <p className="text-slate-300">precious moments together</p>
                      </div>
                    </motion.div>

                    {/* Relationship Milestones */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Star className="w-8 h-8 text-amber-500" />
                        <h3 className="text-xl font-bold text-white">Milestones</h3>
                      </div>
                      <div className="space-y-2">
                        {['First conversation', 'First date', 'First intimate moment'].map((milestone, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <span className="text-slate-300 text-sm">{milestone}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-xl p-6 max-w-lg w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{selectedMemory.title}</h3>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-200">{selectedMemory.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-200">{new Date(selectedMemory.timestamp).toLocaleDateString()}</span>
                </div>
                
                <p className="text-slate-300">{selectedMemory.description}</p>
                
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-300">+{selectedMemory.affectionGain} affection gained</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}