import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, X, User, Package, Shield, MapPin, Heart, 
  Sparkles, Zap, Eye
} from 'lucide-react';

interface MonarchsAuraMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSystemSelect: (systemId: string) => void;
}

interface RuneSystem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  angle: number;
  gradient: string;
  glowColor: string;
}

const runeSystem: RuneSystem[] = [
  {
    id: 'character',
    title: 'Character',
    description: 'Stats, Skills, Progression',
    icon: <User className="w-8 h-8" />,
    angle: 0,
    gradient: 'from-purple-500 to-purple-700',
    glowColor: '#9370DB'
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Items and Artifacts',
    icon: <Package className="w-8 h-8" />,
    angle: 72,
    gradient: 'from-indigo-500 to-indigo-700',
    glowColor: '#6366F1'
  },
  {
    id: 'quests',
    title: 'Quest Log',
    description: 'Active Missions & Memories',
    icon: <Shield className="w-8 h-8" />,
    angle: 144,
    gradient: 'from-blue-500 to-blue-700',
    glowColor: '#3B82F6'
  },
  {
    id: 'worldmap',
    title: 'World Map',
    description: 'Seoul Locations & Gates',
    icon: <MapPin className="w-8 h-8" />,
    angle: 216,
    gradient: 'from-teal-500 to-teal-700',
    glowColor: '#14B8A6'
  },
  {
    id: 'affection',
    title: 'Heart Constellation',
    description: 'Relationship Memories',
    icon: <Heart className="w-8 h-8" />,
    angle: 288,
    gradient: 'from-pink-500 to-pink-700',
    glowColor: '#EC4899'
  }
];

export function MonarchsAuraMenu({ isVisible, onClose, onSystemSelect }: MonarchsAuraMenuProps) {
  const [hoveredRune, setHoveredRune] = useState<string | null>(null);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-16"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(147,51,234,0.15), rgba(0,0,0,0.8))',
          backdropFilter: 'blur(20px) saturate(180%)'
        }}
        onClick={onClose}
      >
        {/* Monarch's Aura Radial Menu */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Central Crown */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <motion.div
              className="w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(147,51,234,0.3))',
                border: '2px solid rgba(255,215,0,0.6)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 30px rgba(255,215,0,0.4), inset 0 0 20px rgba(147,51,234,0.2)'
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
            >
              <Crown 
                className="w-10 h-10 text-yellow-300" 
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.6))'
                }}
              />
            </motion.div>
          </div>

          {/* Radial Runes */}
          {runeSystem.map((rune, index) => {
            const radius = 140;
            const x = Math.cos((rune.angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((rune.angle - 90) * Math.PI / 180) * radius;
            const isHovered = hoveredRune === rune.id;

            return (
              <motion.div
                key={rune.id}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px - 40px)`,
                  top: `calc(50% + ${y}px - 40px)`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  rotate: isHovered ? 360 : 0
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  duration: 0.6,
                  rotate: { duration: isHovered ? 0.8 : 0 }
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setHoveredRune(rune.id)}
                onHoverEnd={() => setHoveredRune(null)}
                onClick={() => {
                  console.log('Rune selected:', rune.id);
                  onSystemSelect(rune.id);
                  onClose();
                }}
              >
                {/* Rune Container */}
                <div
                  className="w-20 h-20 rounded-full border-2 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${rune.gradient.replace('from-', 'rgba(').replace('to-', ', 0.3), rgba(').replace('-500', ', 0.5)').replace('-700', ', 0.7)')})`,
                    border: `2px solid ${rune.glowColor}60`,
                    backdropFilter: 'blur(20px)',
                    boxShadow: isHovered 
                      ? `0 0 40px ${rune.glowColor}80, inset 0 0 20px ${rune.glowColor}40`
                      : `0 0 20px ${rune.glowColor}40, inset 0 0 10px ${rune.glowColor}20`
                  }}
                >
                  {/* Animated background glow */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-30"
                    style={{
                      background: `radial-gradient(circle, ${rune.glowColor}40, transparent 70%)`,
                      animation: isHovered ? 'pulse 1s infinite' : 'none'
                    }}
                  />
                  
                  {/* Rune Icon */}
                  <div 
                    className="relative z-10"
                    style={{
                      color: rune.glowColor,
                      filter: `drop-shadow(0 0 8px ${rune.glowColor})`
                    }}
                  >
                    {rune.icon}
                  </div>

                  {/* Sparkle effects for hovered rune */}
                  {isHovered && (
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white rounded-full"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`
                          }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Rune Label */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 pointer-events-none"
                    >
                      <div 
                        className="px-3 py-2 rounded-lg text-center min-w-max"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9))',
                          backdropFilter: 'blur(10px)',
                          border: `1px solid ${rune.glowColor}40`,
                          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 10px ${rune.glowColor}20`
                        }}
                      >
                        <div 
                          className="text-sm font-bold mb-1"
                          style={{ color: rune.glowColor }}
                        >
                          {rune.title}
                        </div>
                        <div className="text-xs text-slate-300">
                          {rune.description}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Connecting Energy Lines */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {runeSystem.map((rune, index) => {
              const radius = 140;
              const x = Math.cos((rune.angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((rune.angle - 90) * Math.PI / 180) * radius;
              const length = Math.sqrt(x * x + y * y) - 60;
              const angle = Math.atan2(y, x) * 180 / Math.PI;

              return (
                <motion.div
                  key={`line-${rune.id}`}
                  className="absolute"
                  style={{
                    width: `${length}px`,
                    height: '2px',
                    background: `linear-gradient(90deg, rgba(255,215,0,0.6), ${rune.glowColor}60)`,
                    transformOrigin: '0 50%',
                    transform: `rotate(${angle}deg)`,
                    boxShadow: `0 0 8px rgba(255,215,0,0.3)`
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Instruction Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
        >
          <div 
            className="px-6 py-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
            }}
          >
            <div className="text-slate-300 text-sm mb-1">
              Select a rune to access system
            </div>
            <div className="text-yellow-300 text-xs">
              Tap the crown to close
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}