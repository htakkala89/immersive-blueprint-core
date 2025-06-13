import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Heart, 
  Star, 
  Sparkles,
  Calendar,
  Quote,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Camera,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RomanceMemory {
  id: string;
  title: string;
  date: string;
  category: 'first_moments' | 'growing_closer' | 'intimate_bonds' | 'special_occasions' | 'achievements';
  emotionalWeight: number; // 1-10, affects star size and glow
  quote: string;
  description: string;
  unlocked: boolean;
  position: { x: number; y: number; z: number };
  connections: string[]; // IDs of connected memories
  image?: string;
  musicTrack?: string;
}

interface ConstellationProps {
  isVisible: boolean;
  onClose: () => void;
  affectionLevel: number;
  intimacyLevel: number;
  relationshipMilestones: string[];
  onMemoryReplay: (memory: RomanceMemory) => void;
}

// Enhanced memory data with better storytelling
const generateRomanceConstellation = (
  affectionLevel: number, 
  intimacyLevel: number, 
  milestones: string[]
): RomanceMemory[] => {
  const memories: RomanceMemory[] = [
    {
      id: 'first_glance',
      title: 'First Glance',
      date: 'Beginning',
      category: 'first_moments',
      emotionalWeight: 7,
      quote: "Our eyes met across the Hunter Association lobby...",
      description: "The moment that started everything - a simple look that felt like destiny.",
      unlocked: true,
      position: { x: 0, y: 0, z: 0 },
      connections: ['professional_respect'],
      image: 'hunter_association_meeting.jpg'
    },
    {
      id: 'professional_respect',
      title: 'Professional Respect',
      date: 'Week 1',
      category: 'first_moments',
      emotionalWeight: 5,
      quote: "Your abilities as a hunter are truly remarkable.",
      description: "Mutual admiration for each other's skills and dedication.",
      unlocked: true,
      position: { x: -100, y: 80, z: 20 },
      connections: ['first_glance', 'casual_conversation'],
      image: 'training_facility.jpg'
    },
    {
      id: 'casual_conversation',
      title: 'Beyond Work',
      date: 'Week 2',
      category: 'first_moments',
      emotionalWeight: 6,
      quote: "It's nice to talk about something other than dungeons for once.",
      description: "The first time you talked as people, not just hunters.",
      unlocked: affectionLevel >= 10,
      position: { x: 120, y: -60, z: -30 },
      connections: ['professional_respect', 'coffee_date'],
      image: 'hongdae_cafe.jpg'
    },
    {
      id: 'coffee_date',
      title: 'Coffee & Vulnerability',
      date: 'Week 3',
      category: 'growing_closer',
      emotionalWeight: 8,
      quote: "I don't usually share this much about myself...",
      description: "Opening up over coffee, sharing fears and dreams.",
      unlocked: affectionLevel >= 20,
      position: { x: -80, y: -120, z: 40 },
      connections: ['casual_conversation', 'shared_laughter'],
      image: 'intimate_cafe_moment.jpg',
      musicTrack: 'gentle_piano.mp3'
    },
    {
      id: 'shared_laughter',
      title: 'Shared Laughter',
      date: 'Week 4',
      category: 'growing_closer',
      emotionalWeight: 7,
      quote: "I haven't laughed like this in years...",
      description: "A moment of pure joy that brought you closer together.",
      unlocked: affectionLevel >= 25,
      position: { x: 140, y: 100, z: -20 },
      connections: ['coffee_date', 'trust_building'],
      image: 'happy_moment.jpg'
    },
    {
      id: 'trust_building',
      title: 'Growing Trust',
      date: 'Month 1',
      category: 'growing_closer',
      emotionalWeight: 8,
      quote: "I feel safe when I'm with you.",
      description: "The foundation of trust that would support everything to come.",
      unlocked: affectionLevel >= 30,
      position: { x: -160, y: 40, z: 60 },
      connections: ['shared_laughter', 'first_touch'],
      image: 'trust_moment.jpg'
    },
    {
      id: 'first_touch',
      title: 'First Touch',
      date: 'Month 1.5',
      category: 'intimate_bonds',
      emotionalWeight: 9,
      quote: "Your hand in mine feels so right...",
      description: "The electric moment when you first held hands.",
      unlocked: affectionLevel >= 40,
      position: { x: 80, y: -140, z: 80 },
      connections: ['trust_building', 'confession'],
      image: 'hand_holding.jpg',
      musicTrack: 'romantic_strings.mp3'
    },
    {
      id: 'confession',
      title: 'Heart\'s Truth',
      date: 'Month 2',
      category: 'intimate_bonds',
      emotionalWeight: 10,
      quote: "I love you... I've never been more certain of anything.",
      description: "The moment you both spoke your hearts' truth.",
      unlocked: affectionLevel >= 50,
      position: { x: -40, y: 160, z: -40 },
      connections: ['first_touch', 'first_kiss'],
      image: 'confession_scene.jpg',
      musicTrack: 'emotional_crescendo.mp3'
    },
    {
      id: 'first_kiss',
      title: 'First Kiss',
      date: 'Month 2.5',
      category: 'intimate_bonds',
      emotionalWeight: 10,
      quote: "This moment... I want to remember it forever.",
      description: "Your first kiss under the starlit sky.",
      unlocked: affectionLevel >= 60,
      position: { x: 100, y: 180, z: 20 },
      connections: ['confession', 'deepening_bond'],
      image: 'first_kiss.jpg',
      musicTrack: 'tender_melody.mp3'
    },
    {
      id: 'deepening_bond',
      title: 'Deepening Bond',
      date: 'Month 3',
      category: 'intimate_bonds',
      emotionalWeight: 9,
      quote: "Every day with you feels like a gift.",
      description: "The beautiful period of growing closer in love.",
      unlocked: affectionLevel >= 70,
      position: { x: -120, y: -160, z: -60 },
      connections: ['first_kiss'],
      image: 'romantic_evening.jpg'
    }
  ];

  // Add special milestone memories based on achievements
  if (milestones.includes('living_together')) {
    memories.push({
      id: 'moving_in',
      title: 'Moving In Together',
      date: 'Special',
      category: 'special_occasions',
      emotionalWeight: 10,
      quote: "Home isn't a place... it's being with you.",
      description: "The day you decided to share your lives completely.",
      unlocked: affectionLevel >= 80,
      position: { x: 0, y: -200, z: 100 },
      connections: ['deepening_bond'],
      image: 'new_home.jpg',
      musicTrack: 'warm_home.mp3'
    });
  }

  return memories.filter(memory => memory.unlocked);
};

const getCategoryColor = (category: RomanceMemory['category']) => {
  switch (category) {
    case 'first_moments': return 'from-blue-400 to-blue-600';
    case 'growing_closer': return 'from-purple-400 to-purple-600';
    case 'intimate_bonds': return 'from-pink-400 to-pink-600';
    case 'special_occasions': return 'from-yellow-400 to-yellow-600';
    case 'achievements': return 'from-green-400 to-green-600';
    default: return 'from-gray-400 to-gray-600';
  }
};

const getCategoryIcon = (category: RomanceMemory['category']) => {
  switch (category) {
    case 'first_moments': return <Star className="w-4 h-4" />;
    case 'growing_closer': return <Heart className="w-4 h-4" />;
    case 'intimate_bonds': return <Sparkles className="w-4 h-4" />;
    case 'special_occasions': return <Calendar className="w-4 h-4" />;
    case 'achievements': return <Star className="w-4 h-4" />;
    default: return <Star className="w-4 h-4" />;
  }
};

export function EnhancedRomanceConstellation({
  isVisible,
  onClose,
  affectionLevel,
  intimacyLevel,
  relationshipMilestones,
  onMemoryReplay
}: ConstellationProps) {
  const [selectedMemory, setSelectedMemory] = useState<RomanceMemory | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 15, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showConnections, setShowConnections] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const constellationRef = useRef<HTMLDivElement>(null);
  
  const memories = generateRomanceConstellation(affectionLevel, intimacyLevel, relationshipMilestones);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x + deltaY * 0.3)),
      y: prev.y + deltaX * 0.3
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleStarClick = (memory: RomanceMemory) => {
    setSelectedMemory(memory);
  };

  const handleReplayMemory = (memory: RomanceMemory) => {
    onMemoryReplay(memory);
    setSelectedMemory(null);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Our Love Story</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-pink-300">
                  <Heart className="w-4 h-4" />
                  <span>Affection: {affectionLevel}%</span>
                </div>
                <div className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Intimacy: {intimacyLevel}%</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-300">
                  <Star className="w-4 h-4" />
                  <span>{memories.length} Memories</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute top-6 right-20 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(0.3, zoom - 0.2))}
            className="text-white hover:bg-white/10"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(2.5, zoom + 0.2))}
            className="text-white hover:bg-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRotation({ x: 15, y: 0 })}
            className="text-white hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="absolute top-20 left-6 z-10 flex flex-wrap gap-2">
          {['all', 'first_moments', 'growing_closer', 'intimate_bonds', 'special_occasions'].map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={`text-xs ${activeCategory === category ? 'bg-pink-500 text-white' : 'text-white hover:bg-white/10'}`}
            >
              {category.replace('_', ' ').toUpperCase()}
            </Button>
          ))}
        </div>

        {/* 3D Constellation View */}
        <div
          ref={constellationRef}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `
                perspective(1200px) 
                rotateX(${rotation.x}deg) 
                rotateY(${rotation.y}deg) 
                scale(${zoom})
              `,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Connection Lines */}
            {showConnections && memories.map(memory => 
              memory.connections.map(connectionId => {
                const connectedMemory = memories.find(m => m.id === connectionId);
                if (!connectedMemory) return null;

                const dx = connectedMemory.position.x - memory.position.x;
                const dy = connectedMemory.position.y - memory.position.y;
                const dz = connectedMemory.position.z - memory.position.z;
                const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

                return (
                  <div
                    key={`${memory.id}-${connectionId}`}
                    className="absolute pointer-events-none"
                    style={{
                      transform: `translate3d(${memory.position.x}px, ${memory.position.y}px, ${memory.position.z}px)`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    <div
                      className="bg-gradient-to-r from-pink-400/30 to-purple-400/30"
                      style={{
                        width: `${length}px`,
                        height: '2px',
                        transformOrigin: '0 50%',
                        transform: `
                          rotateY(${Math.atan2(dx, dz) * 180 / Math.PI}deg) 
                          rotateX(${-Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)) * 180 / Math.PI}deg)
                        `
                      }}
                    />
                  </div>
                );
              })
            )}

            {/* Memory Stars */}
            {memories
              .filter(memory => activeCategory === 'all' || memory.category === activeCategory)
              .map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="absolute cursor-pointer group"
                style={{
                  transform: `translate3d(${memory.position.x}px, ${memory.position.y}px, ${memory.position.z}px)`,
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => handleStarClick(memory)}
              >
                {/* Star Glow */}
                <div
                  className={`absolute inset-0 rounded-full blur-lg bg-gradient-to-r ${getCategoryColor(memory.category)} opacity-60 group-hover:opacity-80 transition-opacity`}
                  style={{
                    width: `${memory.emotionalWeight * 8}px`,
                    height: `${memory.emotionalWeight * 8}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Star Core */}
                <div
                  className={`relative rounded-full bg-gradient-to-r ${getCategoryColor(memory.category)} border-2 border-white/50 group-hover:border-white/80 transition-all duration-300 group-hover:scale-110`}
                  style={{
                    width: `${memory.emotionalWeight * 4}px`,
                    height: `${memory.emotionalWeight * 4}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Category Icon */}
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    {getCategoryIcon(memory.category)}
                  </div>
                </div>

                {/* Memory Label */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm whitespace-nowrap">
                    <div className="font-semibold">{memory.title}</div>
                    <div className="text-xs text-gray-300">{memory.date}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Memory Detail Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-6 left-6 right-6 z-20"
            >
              <div className="bg-black/90 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-2xl mx-auto">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className={`bg-gradient-to-r ${getCategoryColor(selectedMemory.category)}`}>
                        {selectedMemory.category.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-300">{selectedMemory.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{selectedMemory.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMemory(null)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-2 text-pink-200 italic">
                    <Quote className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>"{selectedMemory.quote}"</span>
                  </div>
                  
                  <p className="text-gray-300">{selectedMemory.description}</p>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleReplayMemory(selectedMemory)}
                      className="bg-pink-500 hover:bg-pink-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Replay Memory
                    </Button>
                    
                    {selectedMemory.image && (
                      <Button variant="outline" className="text-white border-white/20">
                        <Camera className="w-4 h-4 mr-2" />
                        View Image
                      </Button>
                    )}
                    
                    {selectedMemory.musicTrack && (
                      <Button variant="outline" className="text-white border-white/20">
                        <Music className="w-4 h-4 mr-2" />
                        Play Music
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-pink-300 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}