import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, X, Sword, Package, Star, MapPin, MessageCircle, 
  Zap, Users, Eye, Settings, ChevronRight, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonarchsAuraMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onSystemSelect: (systemId: string) => void;
}

interface MenuSystem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'power' | 'world' | 'social';
  unlocked: boolean;
  gradient: string;
}

const menuSystems: MenuSystem[] = [
  // Power Systems
  {
    id: 'armory',
    title: 'Monarch\'s Armory',
    description: 'Manage legendary equipment and shadow weapons',
    icon: <Sword className="w-6 h-6" />,
    category: 'power',
    unlocked: true,
    gradient: 'from-red-600 to-red-800'
  },
  {
    id: 'inventory',
    title: 'Shadow Vault',
    description: 'Dimensional storage for items and artifacts',
    icon: <Package className="w-6 h-6" />,
    category: 'power',
    unlocked: true,
    gradient: 'from-purple-600 to-purple-800'
  },
  {
    id: 'progression',
    title: 'Monarch\'s Evolution',
    description: 'Enhance abilities and unlock new powers',
    icon: <Star className="w-6 h-6" />,
    category: 'power',
    unlocked: true,
    gradient: 'from-indigo-600 to-indigo-800'
  },
  
  // World Systems
  {
    id: 'worldmap',
    title: 'Dimensional Gates',
    description: 'Travel across Seoul and beyond',
    icon: <MapPin className="w-6 h-6" />,
    category: 'world',
    unlocked: true,
    gradient: 'from-teal-600 to-teal-800'
  },
  {
    id: 'dungeons',
    title: 'Shadow Dungeons',
    description: 'Challenge gates and earn rewards',
    icon: <Zap className="w-6 h-6" />,
    category: 'world',
    unlocked: true,
    gradient: 'from-orange-600 to-orange-800'
  },
  
  // Social Systems
  {
    id: 'communicator',
    title: 'Hunter Network',
    description: 'Connect with other hunters and guilds',
    icon: <MessageCircle className="w-6 h-6" />,
    category: 'social',
    unlocked: true,
    gradient: 'from-cyan-600 to-cyan-800'
  },
  {
    id: 'relationships',
    title: 'Bond Constellation',
    description: 'Deepen connections and shared memories',
    icon: <Users className="w-6 h-6" />,
    category: 'social',
    unlocked: true,
    gradient: 'from-pink-600 to-pink-800'
  }
];

const categoryTitles = {
  power: 'Monarch\'s Power',
  world: 'World Dominion',
  social: 'Human Connections'
};

export function MonarchsAuraMenu({ isVisible, onClose, onSystemSelect }: MonarchsAuraMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('power');
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);

  const filteredSystems = menuSystems.filter(system => system.category === selectedCategory);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-[90vw] max-w-4xl h-[80vh] bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 rounded-3xl border border-white/20 overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-indigo-900/50 to-slate-900/50">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent)] animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.2),transparent)] animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <div className="relative z-10 p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Monarch's Aura</h1>
                <p className="text-purple-200 text-sm">Access your legendary powers and connections</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="relative z-10 p-6 border-b border-white/10">
          <div className="flex gap-4">
            {Object.entries(categoryTitles).map(([key, title]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === key
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>

        {/* Systems Grid */}
        <div className="relative z-10 p-8 h-full overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {filteredSystems.map((system, index) => (
                <motion.div
                  key={system.id}
                  className={`relative group cursor-pointer`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredSystem(system.id)}
                  onMouseLeave={() => setHoveredSystem(null)}
                  onClick={() => {
                    onSystemSelect(system.id);
                    onClose();
                  }}
                >
                  <div className={`
                    h-40 rounded-2xl border border-white/20 overflow-hidden
                    transition-all duration-300 group-hover:scale-105 group-hover:border-white/40
                    bg-gradient-to-br ${system.gradient} ${
                      hoveredSystem === system.id ? 'shadow-2xl shadow-purple-500/20' : 'shadow-lg'
                    }
                  `}>
                    {/* Sparkle Animation */}
                    {hoveredSystem === system.id && (
                      <div className="absolute inset-0 overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-4 h-4 text-white/60 animate-pulse" />
                        <Sparkles className="absolute bottom-6 left-6 w-3 h-3 text-white/40 animate-pulse delay-500" />
                      </div>
                    )}

                    <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                          {system.icon}
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{system.title}</h3>
                        <p className="text-white/70 text-sm leading-relaxed">{system.description}</p>
                      </div>
                    </div>

                    {/* Unlock Status */}
                    {!system.unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-8 h-8 text-white/60 mx-auto mb-2" />
                          <p className="text-white/80 font-semibold">Locked</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}