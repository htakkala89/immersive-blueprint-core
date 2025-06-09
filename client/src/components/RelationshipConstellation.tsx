import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  importance: number; // 1-5, affects star brightness
  category: 'first_meeting' | 'intimate_moment' | 'combat_synergy' | 'gift_exchange' | 'confession' | 'milestone';
  x: number;
  y: number;
  z: number;
}

interface ConstellationProps {
  isVisible: boolean;
  onClose: () => void;
  affectionLevel: number;
  memories: Memory[];
  onMemorySelect?: (memory: Memory) => void;
}

export function RelationshipConstellation({ 
  isVisible, 
  onClose, 
  affectionLevel, 
  memories = [],
  onMemorySelect 
}: ConstellationProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Generate sample memories if none provided
  const sampleMemories: Memory[] = memories.length > 0 ? memories : [
    {
      id: '1',
      title: 'First Meeting',
      description: 'The moment our eyes first met at the Hunter Association.',
      date: '2024-01-15',
      importance: 5,
      category: 'first_meeting',
      x: 0,
      y: 0,
      z: 0
    },
    {
      id: '2', 
      title: 'Training Together',
      description: 'Our first sparring session revealed perfect combat synergy.',
      date: '2024-02-03',
      importance: 4,
      category: 'combat_synergy',
      x: 150,
      y: -80,
      z: 50
    },
    {
      id: '3',
      title: 'Coffee Date',
      description: 'A quiet moment sharing stories over warm coffee.',
      date: '2024-02-14',
      importance: 3,
      category: 'intimate_moment',
      x: -120,
      y: 100,
      z: -30
    },
    {
      id: '4',
      title: 'First Gift',
      description: 'The silver pendant that made her eyes light up.',
      date: '2024-02-20',
      importance: 4,
      category: 'gift_exchange',
      x: 80,
      y: 120,
      z: 80
    }
  ];

  const activeMemories = sampleMemories;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setCameraPosition(prev => ({
      ...prev,
      x: prev.x + deltaX * 0.5,
      y: prev.y + deltaY * 0.5
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setCameraPosition(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + e.deltaY * -0.001))
    }));
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-purple-950 to-black"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 200 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Constellation Title */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="liquid-glass p-4"
        >
          <h2 className="text-2xl font-bold text-white mb-2">Our Constellation</h2>
          <div className="flex items-center gap-2 text-purple-200">
            <Heart className="w-4 h-4" />
            <span>Affection: {affectionLevel}%</span>
          </div>
        </motion.div>
      </div>

      {/* Memory Stars */}
      <div 
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${cameraPosition.x}px, ${cameraPosition.y}px) scale(${cameraPosition.zoom})`
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {activeMemories.map((memory, index) => {
            const brightness = (memory.importance / 5) * (affectionLevel / 100);
            const size = 8 + (memory.importance * 4);
            
            return (
              <motion.div
                key={memory.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: `brightness(${brightness + 0.3})`
                }}
                transition={{ delay: index * 0.2 }}
                className="absolute cursor-pointer group"
                style={{
                  left: `calc(50% + ${memory.x}px)`,
                  top: `calc(50% + ${memory.y}px)`,
                  transform: `translateZ(${memory.z}px)`
                }}
                onClick={() => setSelectedMemory(memory)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className={`relative transition-all duration-300 ${
                    memory.category === 'first_meeting' ? 'text-gold-400' :
                    memory.category === 'intimate_moment' ? 'text-pink-400' :
                    memory.category === 'combat_synergy' ? 'text-red-400' :
                    memory.category === 'gift_exchange' ? 'text-green-400' :
                    memory.category === 'confession' ? 'text-purple-400' :
                    'text-blue-400'
                  }`}
                  style={{ 
                    width: `${size}px`, 
                    height: `${size}px`,
                    filter: `drop-shadow(0 0 ${size/2}px currentColor)`
                  }}
                >
                  <Star className="w-full h-full fill-current" />
                  
                  {/* Connecting Lines */}
                  {index < activeMemories.length - 1 && (
                    <div
                      className="absolute top-1/2 left-1/2 origin-left bg-gradient-to-r from-current to-transparent opacity-30"
                      style={{
                        width: `${Math.sqrt(
                          Math.pow(activeMemories[index + 1].x - memory.x, 2) +
                          Math.pow(activeMemories[index + 1].y - memory.y, 2)
                        )}px`,
                        height: '1px',
                        transform: `rotate(${Math.atan2(
                          activeMemories[index + 1].y - memory.y,
                          activeMemories[index + 1].x - memory.x
                        )}rad)`
                      }}
                    />
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="backdrop-blur-md bg-black/50 rounded px-2 py-1 text-white text-xs whitespace-nowrap border border-white/20">
                    {memory.title}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-4 flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 max-w-md w-full pointer-events-auto"
              layoutId={`memory-${selectedMemory.id}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{selectedMemory.title}</h3>
                <Button
                  onClick={() => setSelectedMemory(null)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-purple-100 mb-4">{selectedMemory.description}</p>
              
              <div className="flex justify-between items-center text-sm text-purple-200">
                <span>{selectedMemory.date}</span>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-3 h-3 ${
                        i < selectedMemory.importance 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {onMemorySelect && (
                <Button
                  onClick={() => onMemorySelect(selectedMemory)}
                  className="w-full mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Relive Memory
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-purple-200 text-sm">
        <p>Drag to explore • Scroll to zoom • Click stars to view memories</p>
      </div>
    </motion.div>
  );
}