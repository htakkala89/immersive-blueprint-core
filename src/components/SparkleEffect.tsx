import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface SparkleEffectProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  color?: 'gold' | 'pink' | 'purple' | 'white';
  className?: string;
}

interface Sparkle {
  id: string;
  x: number;
  y: number;
  delay: number;
  type: 'twinkle' | 'orbit' | 'burst';
}

export function SparkleEffect({ 
  children, 
  intensity = 'medium', 
  color = 'gold',
  className = '' 
}: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const sparkleCount = {
    low: 3,
    medium: 6,
    high: 10
  }[intensity];

  const colorClasses = {
    gold: 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500',
    pink: 'bg-gradient-to-r from-pink-300 via-pink-400 to-pink-500',
    purple: 'bg-gradient-to-r from-purple-300 via-purple-400 to-purple-500',
    white: 'bg-gradient-to-r from-white via-gray-100 to-white'
  }[color];

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles: Sparkle[] = [];
      
      for (let i = 0; i < sparkleCount; i++) {
        const sparkleTypes: ('twinkle' | 'orbit' | 'burst')[] = ['twinkle', 'orbit', 'burst'];
        
        newSparkles.push({
          id: `sparkle-${i}`,
          x: Math.random() * 100, // Percentage
          y: Math.random() * 100, // Percentage
          delay: Math.random() * 2,
          type: sparkleTypes[Math.floor(Math.random() * sparkleTypes.length)]
        });
      }
      
      setSparkles(newSparkles);
    };

    generateSparkles();
    
    // Regenerate sparkles periodically for variety
    const interval = setInterval(generateSparkles, 4000);
    
    return () => clearInterval(interval);
  }, [sparkleCount]);

  return (
    <div className={`sparkle-container relative ${className}`}>
      {children}
      
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className={`absolute pointer-events-none z-10 w-1 h-1 rounded-full ${colorClasses}`}
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            filter: 'drop-shadow(0 0 2px currentColor)'
          }}
          initial={{ 
            opacity: 0, 
            scale: 0,
            rotate: 0
          }}
          animate={{
            opacity: sparkle.type === 'twinkle' ? [0, 1, 0, 1, 0] : [0, 1, 0],
            scale: sparkle.type === 'burst' ? [0, 1.5, 0.8, 0] : [0, 1, 0],
            rotate: sparkle.type === 'orbit' ? [0, 360] : [0, 180, 0],
            x: sparkle.type === 'orbit' ? [0, 10, -10, 0] : 0,
            y: sparkle.type === 'orbit' ? [0, -10, 10, 0] : 0
          }}
          transition={{
            duration: sparkle.type === 'twinkle' ? 2 : sparkle.type === 'orbit' ? 3 : 1.5,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: sparkle.type === 'burst' ? 'easeOut' : 'easeInOut'
          }}
        />
      ))}
      
      {/* Additional floating sparkles for high intensity */}
      {intensity === 'high' && (
        <>
          <motion.div
            className={`absolute top-0 right-0 w-2 h-2 rounded-full ${colorClasses}`}
            style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          <motion.div
            className={`absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full ${colorClasses}`}
            style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.3, 1.2, 0.3],
              x: [0, 5, 0],
              y: [0, -5, 0]
            }}
            transition={{
              duration: 1.8,
              delay: 1,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </>
      )}
    </div>
  );
}