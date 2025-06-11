import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { SparkleEffect } from './SparkleEffect';

interface MysticalEyeProps {
  intensity?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'pink' | 'gold' | 'white';
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MysticalEye({ 
  intensity = 'medium',
  size = 'md',
  color = 'purple',
  isActive = false,
  onClick,
  className = ''
}: MysticalEyeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  const colorSchemes = {
    purple: {
      background: 'bg-gradient-to-br from-purple-900/80 to-purple-700/60',
      border: 'border-purple-400/30',
      icon: 'text-purple-200',
      glow: 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.6))',
      activeGlow: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.9))'
    },
    pink: {
      background: 'bg-gradient-to-br from-pink-900/80 to-pink-700/60',
      border: 'border-pink-400/30',
      icon: 'text-pink-200',
      glow: 'drop-shadow(0 0 12px rgba(236, 72, 153, 0.6))',
      activeGlow: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.9))'
    },
    gold: {
      background: 'bg-gradient-to-br from-yellow-900/80 to-yellow-700/60',
      border: 'border-yellow-400/30',
      icon: 'text-yellow-200',
      glow: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))',
      activeGlow: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.9))'
    },
    white: {
      background: 'bg-gradient-to-br from-slate-900/80 to-slate-700/60',
      border: 'border-white/30',
      icon: 'text-white',
      glow: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.6))',
      activeGlow: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.9))'
    }
  };

  const scheme = colorSchemes[color];

  return (
    <SparkleEffect 
      intensity="high"
      color={color}
      className={`${sizeClasses[size]} ${className}`}
    >
      <motion.button
        className={`
          ${sizeClasses[size]} 
          ${scheme.background} 
          ${scheme.border}
          border rounded-xl backdrop-blur-sm
          flex items-center justify-center
          relative overflow-hidden
          transition-all duration-300
          ${onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
        `}
        style={{
          filter: `${isActive ? scheme.activeGlow : scheme.glow} brightness(1.2) contrast(1.1)`,
          boxShadow: isActive 
            ? `0 0 40px ${color === 'purple' ? 'rgba(147, 51, 234, 0.8)' : 
                         color === 'pink' ? 'rgba(236, 72, 153, 0.8)' :
                         color === 'gold' ? 'rgba(251, 191, 36, 0.8)' :
                         'rgba(255, 255, 255, 0.8)'}, 
               0 0 80px ${color === 'purple' ? 'rgba(147, 51, 234, 0.4)' : 
                         color === 'pink' ? 'rgba(236, 72, 153, 0.4)' :
                         color === 'gold' ? 'rgba(251, 191, 36, 0.4)' :
                         'rgba(255, 255, 255, 0.4)'}, 
               inset 0 2px 0 rgba(255, 255, 255, 0.3)`
            : `0 0 25px ${color === 'purple' ? 'rgba(147, 51, 234, 0.5)' : 
                         color === 'pink' ? 'rgba(236, 72, 153, 0.5)' :
                         color === 'gold' ? 'rgba(251, 191, 36, 0.5)' :
                         'rgba(255, 255, 255, 0.5)'}, 
               inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        }}
        animate={{
          scale: isActive ? [1, 1.05, 1] : 1,
          rotate: isActive ? [0, 2, -2, 0] : 0
        }}
        transition={{
          duration: isActive ? 2 : 0.3,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
        whileHover={onClick ? { 
          scale: 1.1,
          filter: scheme.activeGlow
        } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        onClick={onClick}
      >
        {/* Intense Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${color === 'purple' ? 'rgba(147, 51, 234, 0.6)' : 
                         color === 'pink' ? 'rgba(236, 72, 153, 0.6)' :
                         color === 'gold' ? 'rgba(251, 191, 36, 0.6)' :
                         'rgba(255, 255, 255, 0.6)'} 0%, transparent 50%)`
          }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.3, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Outer Magical Ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-xl border-2 opacity-60"
          style={{
            borderColor: color === 'purple' ? '#9333ea' : 
                        color === 'pink' ? '#ec4899' :
                        color === 'gold' ? '#fbbf24' : '#ffffff',
            boxShadow: `0 0 20px ${color === 'purple' ? 'rgba(147, 51, 234, 0.8)' : 
                               color === 'pink' ? 'rgba(236, 72, 153, 0.8)' :
                               color === 'gold' ? 'rgba(251, 191, 36, 0.8)' :
                               'rgba(255, 255, 255, 0.8)'}`
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating Sparkle Particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-80"
            style={{
              background: color === 'purple' ? '#9333ea' : 
                         color === 'pink' ? '#ec4899' :
                         color === 'gold' ? '#fbbf24' : '#ffffff',
              left: `${15 + (i * 10)}%`,
              top: `${20 + (i * 8)}%`,
              boxShadow: `0 0 6px currentColor`
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [0.5, 1.5, 0.5],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Eye Icon */}
        <Eye 
          className={`${iconSizes[size]} ${scheme.icon} relative z-10`}
          style={{
            filter: 'drop-shadow(0 0 4px currentColor)'
          }}
        />

        {/* Enhanced Mystical Pupil Effect */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-current opacity-90 z-20"
          style={{
            background: `radial-gradient(circle, ${color === 'purple' ? '#9333ea' : 
                         color === 'pink' ? '#ec4899' :
                         color === 'gold' ? '#fbbf24' :
                         '#ffffff'} 0%, transparent 80%)`,
            boxShadow: `0 0 15px ${color === 'purple' ? '#9333ea' : 
                                  color === 'pink' ? '#ec4899' :
                                  color === 'gold' ? '#fbbf24' : '#ffffff'}`
          }}
          animate={{
            scale: [0.8, 1.4, 0.8],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Inner Glow Ring */}
        <motion.div
          className="absolute inset-2 rounded-full border border-current opacity-20"
          animate={{
            scale: isActive ? [1, 1.1, 1] : 1,
            opacity: isActive ? [0.2, 0.4, 0.2] : 0.2
          }}
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </SparkleEffect>
  );
}