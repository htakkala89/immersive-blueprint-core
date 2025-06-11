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
      intensity={isActive ? 'high' : intensity} 
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
          filter: isActive ? scheme.activeGlow : scheme.glow,
          boxShadow: isActive 
            ? '0 0 30px rgba(147, 51, 234, 0.5), inset 0 2px 0 rgba(255, 255, 255, 0.2)'
            : '0 0 20px rgba(147, 51, 234, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
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
        {/* Background Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${color === 'purple' ? 'rgba(147, 51, 234, 0.3)' : 
                         color === 'pink' ? 'rgba(236, 72, 153, 0.3)' :
                         color === 'gold' ? 'rgba(251, 191, 36, 0.3)' :
                         'rgba(255, 255, 255, 0.3)'} 0%, transparent 70%)`
          }}
          animate={{
            opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
            scale: isActive ? [1, 1.2, 1] : 1
          }}
          transition={{
            duration: 3,
            repeat: isActive ? Infinity : 0,
            ease: "easeInOut"
          }}
        />

        {/* Eye Icon */}
        <Eye 
          className={`${iconSizes[size]} ${scheme.icon} relative z-10`}
          style={{
            filter: 'drop-shadow(0 0 4px currentColor)'
          }}
        />

        {/* Mystical Pupil Effect */}
        <motion.div
          className="absolute w-2 h-2 rounded-full bg-current opacity-80 z-20"
          style={{
            background: `radial-gradient(circle, ${color === 'purple' ? '#9333ea' : 
                         color === 'pink' ? '#ec4899' :
                         color === 'gold' ? '#fbbf24' :
                         '#ffffff'} 0%, transparent 100%)`
          }}
          animate={{
            scale: isActive ? [0.8, 1.2, 0.8] : [0.8, 1, 0.8],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
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