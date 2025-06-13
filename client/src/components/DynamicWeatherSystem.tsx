import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherParticle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  opacity: number;
  angle?: number;
}

interface DynamicWeatherSystemProps {
  weather: 'clear' | 'rain' | 'snow' | 'cloudy';
  intensity?: 'light' | 'moderate' | 'heavy';
  windSpeed?: number;
}

export const DynamicWeatherSystem: React.FC<DynamicWeatherSystemProps> = ({
  weather,
  intensity = 'moderate',
  windSpeed = 0
}) => {
  const [particles, setParticles] = useState<WeatherParticle[]>([]);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);

  // Particle configuration based on weather type and intensity
  const particleConfig = useMemo(() => {
    const configs = {
      rain: {
        light: { count: 50, speed: { min: 3, max: 6 }, size: { min: 1, max: 2 } },
        moderate: { count: 100, speed: { min: 5, max: 10 }, size: { min: 1, max: 3 } },
        heavy: { count: 200, speed: { min: 8, max: 15 }, size: { min: 2, max: 4 } }
      },
      snow: {
        light: { count: 30, speed: { min: 1, max: 3 }, size: { min: 2, max: 4 } },
        moderate: { count: 60, speed: { min: 2, max: 5 }, size: { min: 3, max: 6 } },
        heavy: { count: 120, speed: { min: 3, max: 7 }, size: { min: 4, max: 8 } }
      }
    };
    
    return weather === 'rain' || weather === 'snow' ? configs[weather][intensity] : null;
  }, [weather, intensity]);

  // Initialize particles
  useEffect(() => {
    if (!particleConfig) {
      setParticles([]);
      return;
    }

    const newParticles: WeatherParticle[] = [];
    for (let i = 0; i < particleConfig.count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * -window.innerHeight,
        speed: Math.random() * (particleConfig.speed.max - particleConfig.speed.min) + particleConfig.speed.min,
        size: Math.random() * (particleConfig.size.max - particleConfig.size.min) + particleConfig.size.min,
        opacity: Math.random() * 0.6 + 0.3,
        angle: weather === 'snow' ? Math.random() * 360 : 0
      });
    }
    setParticles(newParticles);
  }, [weather, intensity, particleConfig]);

  // Animation loop
  useEffect(() => {
    if (!particleConfig || particles.length === 0) return;

    const animate = () => {
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newY = particle.y + particle.speed;
          let newX = particle.x + (windSpeed * 0.5);
          
          // Reset particle when it goes off screen
          if (newY > window.innerHeight + 10) {
            newY = -10;
            newX = Math.random() * window.innerWidth;
          }
          
          if (newX > window.innerWidth + 10) {
            newX = -10;
          } else if (newX < -10) {
            newX = window.innerWidth + 10;
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            angle: weather === 'snow' ? (particle.angle || 0) + 1 : particle.angle
          };
        })
      );

      setAnimationFrame(requestAnimationFrame(animate));
    };

    setAnimationFrame(requestAnimationFrame(animate));

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [particles.length, particleConfig, windSpeed, weather]);

  // Cleanup animation frame
  useEffect(() => {
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [animationFrame]);

  // Weather overlay effects
  const getWeatherOverlay = () => {
    switch (weather) {
      case 'rain':
        return 'bg-gradient-to-b from-slate-900/20 via-slate-700/10 to-slate-600/20';
      case 'snow':
        return 'bg-gradient-to-b from-slate-100/10 via-slate-200/5 to-slate-300/15';
      case 'cloudy':
        return 'bg-gradient-to-b from-gray-400/15 via-gray-500/10 to-gray-600/20';
      default:
        return '';
    }
  };

  // Lightning effect for heavy rain
  const [showLightning, setShowLightning] = useState(false);
  useEffect(() => {
    if (weather === 'rain' && intensity === 'heavy') {
      const lightningInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance every 3 seconds
          setShowLightning(true);
          setTimeout(() => setShowLightning(false), 150);
        }
      }, 3000);
      
      return () => clearInterval(lightningInterval);
    }
  }, [weather, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Weather Overlay */}
      <AnimatePresence>
        {weather !== 'clear' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className={`absolute inset-0 ${getWeatherOverlay()}`}
          />
        )}
      </AnimatePresence>

      {/* Lightning Flash */}
      <AnimatePresence>
        {showLightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.7, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, times: [0, 0.1, 0.3, 0.6, 1] }}
            className="absolute inset-0 bg-white/30"
          />
        )}
      </AnimatePresence>

      {/* Weather Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className={`absolute ${
              weather === 'rain' 
                ? 'bg-blue-200/70 rounded-full' 
                : weather === 'snow'
                ? 'bg-white/80 rounded-full'
                : 'bg-gray-300/50 rounded-full'
            }`}
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: weather === 'rain' ? `${particle.size * 3}px` : `${particle.size}px`,
              opacity: particle.opacity,
              transform: weather === 'snow' ? `rotate(${particle.angle}deg)` : 'none',
              filter: weather === 'rain' ? 'blur(0.5px)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Fog/Mist Effect for Snow */}
      {weather === 'snow' && (
        <motion.div
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent"
        />
      )}

      {/* Rain Sound Visualization */}
      {weather === 'rain' && intensity !== 'light' && (
        <div className="absolute bottom-0 left-0 right-0 h-1">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 w-px bg-blue-300/30"
              style={{
                left: `${(i * 2)}%`,
                height: `${Math.random() * 8 + 2}px`
              }}
              animate={{
                height: [
                  `${Math.random() * 8 + 2}px`,
                  `${Math.random() * 12 + 4}px`,
                  `${Math.random() * 8 + 2}px`
                ]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Auto Weather System Component
interface AutoWeatherSystemProps {
  children: React.ReactNode;
  enableAutoWeather?: boolean;
  weatherDuration?: number; // minutes
  currentWeather?: 'clear' | 'rain' | 'snow' | 'cloudy';
  onWeatherChange?: (weather: 'clear' | 'rain' | 'snow' | 'cloudy') => void;
}

export const AutoWeatherSystem: React.FC<AutoWeatherSystemProps> = ({
  children,
  enableAutoWeather = true,
  weatherDuration = 15,
  currentWeather = 'clear',
  onWeatherChange
}) => {
  const [autoWeather, setAutoWeather] = useState(currentWeather);
  const [intensity, setIntensity] = useState<'light' | 'moderate' | 'heavy'>('moderate');

  // Auto weather cycling
  useEffect(() => {
    if (!enableAutoWeather) return;

    const weatherTypes: Array<'clear' | 'rain' | 'snow' | 'cloudy'> = ['clear', 'cloudy', 'rain', 'clear', 'snow'];
    let currentIndex = weatherTypes.indexOf(currentWeather);

    const weatherInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % weatherTypes.length;
      const newWeather = weatherTypes[currentIndex];
      setAutoWeather(newWeather);
      
      // Random intensity for precipitation
      if (newWeather === 'rain' || newWeather === 'snow') {
        const intensities: Array<'light' | 'moderate' | 'heavy'> = ['light', 'moderate', 'heavy'];
        setIntensity(intensities[Math.floor(Math.random() * intensities.length)]);
      }
      
      onWeatherChange?.(newWeather);
    }, weatherDuration * 60 * 1000);

    return () => clearInterval(weatherInterval);
  }, [enableAutoWeather, weatherDuration, currentWeather, onWeatherChange]);

  return (
    <div className="relative">
      <DynamicWeatherSystem 
        weather={enableAutoWeather ? autoWeather : currentWeather} 
        intensity={intensity}
        windSpeed={Math.random() * 3 - 1.5} // Random wind between -1.5 and 1.5
      />
      {children}
    </div>
  );
};