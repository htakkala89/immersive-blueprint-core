import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Play,
  Calendar,
  Quote,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MemoryStar {
  id: string;
  title: string;
  date: string;
  type: 'social' | 'achievement' | 'intimacy';
  keyImage?: string;
  keyQuote: string;
  sceneText?: string;
  position: { x: number; y: number; z: number };
  brightness: number;
  unlocked: boolean;
}

interface RelationshipConstellationSystem6Props {
  isVisible: boolean;
  onClose: () => void;
  affectionLevel: number;
  memories: MemoryStar[];
  onMemorySelect: (memory: MemoryStar) => void;
}

const CONSTELLATION_SIZE = 800;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;

// Generate constellation based on affection level and memories
const generateConstellation = (affectionLevel: number, memories: MemoryStar[]): MemoryStar[] => {
  const baseMemories: MemoryStar[] = [
    {
      id: 'first_meeting',
      title: 'First Meeting at Hunter Association',
      date: 'Day 1',
      type: 'social',
      keyQuote: "You're the Shadow Monarch... I've heard so much about you.",
      position: { x: 0, y: 0, z: 0 },
      brightness: 0.8,
      unlocked: true
    },
    {
      id: 'first_coffee',
      title: 'Coffee at Hongdae Café',
      date: 'Day 3',
      type: 'social',
      keyQuote: "This is nice... just talking like normal people for once.",
      position: { x: -120, y: 80, z: -50 },
      brightness: 0.7,
      unlocked: affectionLevel >= 5
    },
    {
      id: 'hangang_walk',
      title: 'Evening Walk at Hangang Park',
      date: 'Day 7',
      type: 'social',
      keyQuote: "The city lights look beautiful from here... almost as beautiful as this moment.",
      position: { x: 100, y: -60, z: 30 },
      brightness: 0.9,
      unlocked: affectionLevel >= 10
    },
    {
      id: 'first_raid_together',
      title: 'First Joint Raid Victory',
      date: 'Day 12',
      type: 'achievement',
      keyQuote: "We make a good team. I feel like I can trust you with my life.",
      position: { x: -80, y: -120, z: 80 },
      brightness: 1.0,
      unlocked: affectionLevel >= 15
    },
    {
      id: 'cooking_disaster',
      title: 'Cooking Disaster at Home',
      date: 'Day 18',
      type: 'social',
      keyQuote: "Well... at least we have takeout. And each other's company.",
      position: { x: 150, y: 100, z: -80 },
      brightness: 0.8,
      unlocked: affectionLevel >= 20
    },
    {
      id: 'first_kiss',
      title: 'First Kiss Under the Stars',
      date: 'Day 25',
      type: 'intimacy',
      keyQuote: "I've been waiting for this moment... I never want it to end.",
      position: { x: -50, y: 150, z: 60 },
      brightness: 1.2,
      unlocked: affectionLevel >= 25
    },
    {
      id: 'movie_night',
      title: 'Movie Night on the Couch',
      date: 'Day 32',
      type: 'social',
      keyQuote: "I don't care what we're watching. I just want to be close to you.",
      position: { x: 80, y: -80, z: -100 },
      brightness: 0.9,
      unlocked: affectionLevel >= 30
    },
    {
      id: 'boss_raid_victory',
      title: 'Defeating the Demon King Baran',
      date: 'Day 40',
      type: 'achievement',
      keyQuote: "We did it! Together, we're unstoppable!",
      position: { x: -150, y: -50, z: 120 },
      brightness: 1.5,
      unlocked: affectionLevel >= 35
    },
    {
      id: 'intimate_evening',
      title: 'Intimate Evening Together',
      date: 'Day 48',
      type: 'intimacy',
      keyQuote: "Being with you like this... it feels like home.",
      position: { x: 120, y: 80, z: -120 },
      brightness: 1.3,
      unlocked: affectionLevel >= 40
    },
    {
      id: 'morning_after',
      title: 'Waking Up Together',
      date: 'Day 49',
      type: 'intimacy',
      keyQuote: "Good morning, my love. Every day with you is a gift.",
      position: { x: -100, y: 120, z: -60 },
      brightness: 1.4,
      unlocked: affectionLevel >= 45
    }
  ];

  // Merge with custom memories and filter unlocked ones
  const allMemories = [...baseMemories, ...memories];
  return allMemories.filter(memory => memory.unlocked);
};

const getStarColor = (type: string): string => {
  switch (type) {
    case 'social': return '#FFD700'; // Gold
    case 'achievement': return '#9333EA'; // Purple
    case 'intimacy': return '#DC2626'; // Deep Red
    default: return '#FFD700';
  }
};

const getConstellationAmbientLight = (affectionLevel: number): number => {
  return Math.min(1, affectionLevel / 100) * 0.8 + 0.2;
};

export function RelationshipConstellationSystem6({
  isVisible,
  onClose,
  affectionLevel,
  memories,
  onMemorySelect
}: RelationshipConstellationSystem6Props) {
  const [selectedMemory, setSelectedMemory] = useState<MemoryStar | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showReplayModal, setShowReplayModal] = useState(false);
  const constellationRef = useRef<HTMLDivElement>(null);

  const constellation = generateConstellation(affectionLevel, memories);
  const ambientLight = getConstellationAmbientLight(affectionLevel);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5
    }));
    
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleStarClick = (memory: MemoryStar) => {
    setSelectedMemory(memory);
    onMemorySelect(memory);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9999]"
      >
        {/* Cosmic Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, ${ambientLight * 0.3}) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(255, 215, 0, ${ambientLight * 0.2}) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(220, 38, 127, ${ambientLight * 0.1}) 0%, transparent 70%),
              linear-gradient(180deg, #000000 0%, #111827 100%)
            `
          }}
        />

        {/* Constellation Container */}
        <div
          ref={constellationRef}
          className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 3D Constellation View */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `
                perspective(1000px) 
                rotateX(${rotation.x}deg) 
                rotateY(${rotation.y}deg) 
                scale(${zoom})
              `,
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Memory Stars */}
            {constellation.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute cursor-pointer"
                style={{
                  transform: `
                    translate3d(${memory.position.x}px, ${memory.position.y}px, ${memory.position.z}px)
                  `,
                  transformStyle: 'preserve-3d'
                }}
                onClick={() => handleStarClick(memory)}
              >
                {/* Star Glow */}
                <div
                  className="absolute inset-0 rounded-full animate-pulse"
                  style={{
                    width: `${20 + memory.brightness * 10}px`,
                    height: `${20 + memory.brightness * 10}px`,
                    background: `radial-gradient(circle, ${getStarColor(memory.type)}${Math.floor(memory.brightness * 50).toString(16)} 0%, transparent 70%)`,
                    filter: `blur(${memory.brightness * 3}px)`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                
                {/* Star Core */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: `${8 + memory.brightness * 4}px`,
                    height: `${8 + memory.brightness * 4}px`,
                    backgroundColor: getStarColor(memory.type),
                    transform: 'translate(-50%, -50%)',
                    boxShadow: `0 0 ${memory.brightness * 10}px ${getStarColor(memory.type)}`
                  }}
                />

                {/* Star Icon */}
                <div
                  className="absolute text-white"
                  style={{
                    transform: 'translate(-50%, -50%)',
                    fontSize: `${memory.brightness * 8 + 8}px`
                  }}
                >
                  <Star className="w-full h-full fill-current" />
                </div>
              </motion.div>
            ))}

            {/* Connecting Lines */}
            {constellation.map((memory, index) => {
              const nextMemory = constellation[index + 1];
              if (!nextMemory) return null;
              
              const distance = Math.sqrt(
                Math.pow(nextMemory.position.x - memory.position.x, 2) +
                Math.pow(nextMemory.position.y - memory.position.y, 2) +
                Math.pow(nextMemory.position.z - memory.position.z, 2)
              );
              
              const midX = (memory.position.x + nextMemory.position.x) / 2;
              const midY = (memory.position.y + nextMemory.position.y) / 2;
              const midZ = (memory.position.z + nextMemory.position.z) / 2;
              
              return (
                <div
                  key={`line-${memory.id}-${nextMemory.id}`}
                  className="absolute"
                  style={{
                    transform: `translate3d(${midX}px, ${midY}px, ${midZ}px)`,
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div
                    style={{
                      width: `${distance}px`,
                      height: '2px',
                      background: `linear-gradient(90deg, ${getStarColor(memory.type)}40, ${getStarColor(nextMemory.type)}40)`,
                      transformOrigin: 'left center',
                      opacity: ambientLight * 0.5
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* UI Controls */}
        <div className="absolute top-6 left-6 flex gap-3">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl text-white/80 hover:bg-white/10 border border-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={resetView}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl text-white/80 hover:bg-white/10 border border-white/20"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            onClick={() => handleZoom(0.2)}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl text-white/80 hover:bg-white/10 border border-white/20"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={() => handleZoom(-0.2)}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl text-white/80 hover:bg-white/10 border border-white/20"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Affection Level Indicator */}
        <div className="absolute bottom-6 left-6">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/20">
            <div className="text-white/60 text-sm mb-2">Relationship Strength</div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${affectionLevel}%` }}
                />
              </div>
              <span className="text-white font-bold">{affectionLevel}%</span>
            </div>
            <div className="text-white/40 text-xs mt-1">
              {constellation.length} memories collected
            </div>
          </div>
        </div>

        {/* Memory Card Modal */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-[10000]"
              onClick={() => setSelectedMemory(null)}
            >
              <motion.div
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-lg mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Memory Type Indicator */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getStarColor(selectedMemory.type) }}
                  />
                  <span className="text-white/60 text-sm capitalize">
                    {selectedMemory.type === 'social' ? 'Social Memory' : 
                     selectedMemory.type === 'achievement' ? 'Achievement' : 'Intimate Memory'}
                  </span>
                </div>

                {/* Memory Title */}
                <h2 className="text-white text-2xl font-bold mb-3">
                  {selectedMemory.title}
                </h2>

                {/* Date */}
                <div className="flex items-center gap-2 mb-4 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{selectedMemory.date}</span>
                </div>

                {/* Key Quote */}
                <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
                  <div className="flex items-start gap-3">
                    <Quote className="w-5 h-5 text-white/40 mt-1 flex-shrink-0" />
                    <p className="text-white italic leading-relaxed">
                      "{selectedMemory.keyQuote}"
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedMemory.sceneText && (
                    <Button
                      onClick={() => setShowReplayModal(true)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Replay Scene
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => setSelectedMemory(null)}
                    variant="ghost"
                    className="text-white/60 hover:bg-white/10"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scene Replay Modal */}
        <AnimatePresence>
          {showReplayModal && selectedMemory?.sceneText && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10001]"
              onClick={() => setShowReplayModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-2xl max-h-[80vh] mx-4 overflow-y-auto custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white text-xl font-bold">Scene Replay</h3>
                  <Button
                    onClick={() => setShowReplayModal(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.sceneText}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}