import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Crown, Zap, Coins, User, Sword, Star, 
  Camera, Eye, MapPin, Clock, Sun, Moon, CloudRain,
  MessageCircle, Gift, Coffee, Home, Building, Dumbbell,
  ShoppingCart, Calendar, Battery, Award, Package, X, Brain, Target, BookOpen, Wand2, Power, Bell
} from 'lucide-react';

import WorldMap from '@/components/WorldMapSimple';

interface CoreStats {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  sense: number;
}

interface GameState {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  affection: number;
  currentScene: string;
  inventory: any[];
  inCombat: boolean;
  gold?: number;
  energy?: number;
  maxEnergy?: number;
  stats?: CoreStats;
}

export default function SoloLevelingSpatial() {
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    affection: 0,
    currentScene: 'world_map',
    inventory: [],
    inCombat: false,
    gold: 1000,
    energy: 100,
    maxEnergy: 100,
    stats: {
      strength: 10,
      agility: 10,
      vitality: 10,
      intelligence: 10,
      sense: 10
    }
  });
  
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [playerLocation, setPlayerLocation] = useState('player_apartment');
  const [gameTime, setGameTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const getCurrentTimeOfDay = (timeToCheck?: Date) => {
    const time = timeToCheck || gameTime;
    const hour = time.getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };
  
  useEffect(() => {
    setTimeOfDay(getCurrentTimeOfDay());
    const timer = setInterval(() => {
      const newTime = new Date();
      setGameTime(newTime);
      setTimeOfDay(getCurrentTimeOfDay(newTime));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const quickActivities = [
    { id: 'coffee_date', name: 'Coffee Date', icon: Coffee, description: 'Meet Cha Hae-In at a cozy cafe' },
    { id: 'training', name: 'Training', icon: Dumbbell, description: 'Improve your combat abilities' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCart, description: 'Browse the Hunter Market' },
    { id: 'home_life', name: 'Home Life', icon: Home, description: 'Relax at your apartment' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Player Status */}
          <motion.div
            className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white text-sm font-medium">Level {gameState.level}</div>
                <div className="text-purple-300 text-xs">Shadow Monarch</div>
              </div>
            </div>
          </motion.div>

          {/* Health & Mana */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <Progress value={(gameState.health / gameState.maxHealth) * 100} className="w-16 h-2" />
                <span className="text-white text-xs">{gameState.health}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <Progress value={(gameState.mana / gameState.maxMana) * 100} className="w-16 h-2" />
                <span className="text-white text-xs">{gameState.mana}</span>
              </div>
            </div>
          </div>

          {/* Affection */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-white text-sm">Affection: {gameState.affection}</span>
            </div>
          </div>
        </div>

        {/* Time & Weather */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="text-white text-sm">
              {timeOfDay === 'morning' && <Sun className="w-4 h-4 text-yellow-400" />}
              {timeOfDay === 'afternoon' && <Sun className="w-4 h-4 text-orange-400" />}
              {timeOfDay === 'evening' && <CloudRain className="w-4 h-4 text-purple-400" />}
              {timeOfDay === 'night' && <Moon className="w-4 h-4 text-blue-400" />}
            </div>
            <div className="text-white text-sm capitalize">{timeOfDay}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 px-4 pb-4 relative z-10">
        {/* Welcome Screen */}
        {!showWorldMap && !activeModal && (
          <div className="max-w-6xl mx-auto">
            {/* Main Welcome Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <Card className="bg-black/40 backdrop-blur-md border-purple-500/30 p-8">
                <h1 className="text-5xl font-bold text-white mb-4">
                  Welcome to Seoul, <span className="text-purple-400">Shadow Monarch</span>
                </h1>
                <p className="text-purple-200 text-xl mb-8">
                  Your journey with Cha Hae-In continues. The city awaits your presence.
                </p>
                
                {/* Quick Action Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    onClick={() => setShowWorldMap(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-3"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Explore Seoul
                  </Button>
                  <Button
                    onClick={() => setActiveModal('daily_life')}
                    variant="outline"
                    className="border-purple-500/50 hover:bg-purple-500/20 text-lg px-8 py-3"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Daily Life Hub
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Quick Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="bg-black/30 backdrop-blur-md border-purple-500/20 p-6 cursor-pointer hover:border-purple-400/50 transition-colors">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <activity.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{activity.name}</h3>
                      <p className="text-purple-200 text-sm">{activity.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Current Status */}
            <Card className="bg-black/30 backdrop-blur-md border-purple-500/20 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{gameState.gold?.toLocaleString()} Won</div>
                  <div className="text-purple-200 text-sm">Available Funds</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{playerLocation.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-purple-200 text-sm">Current Location</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">{gameState.energy}%</div>
                  <div className="text-purple-200 text-sm">Energy Level</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* World Map */}
        {showWorldMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="mb-4">
              <Button
                onClick={() => setShowWorldMap(false)}
                variant="outline"
                className="border-purple-500/50 hover:bg-purple-500/20"
              >
                <X className="w-4 h-4 mr-2" />
                Back to Hub
              </Button>
            </div>
            <WorldMap
              gameState={gameState}
              playerLocation={playerLocation}
              onLocationSelect={(locationId) => {
                setPlayerLocation(locationId);
                setShowWorldMap(false);
                setGameState(prev => ({ ...prev, affection: prev.affection + 1 }));
              }}
              timeOfDay={timeOfDay}
              gameTime={gameTime}
            />
          </motion.div>
        )}

        {/* Daily Life Modal */}
        {activeModal === 'daily_life' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <Card className="bg-black/80 backdrop-blur-md border-purple-500/30 p-8 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Daily Life Activities</h2>
                <Button
                  onClick={() => setActiveModal(null)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-purple-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActivities.map((activity) => (
                  <Button
                    key={activity.id}
                    onClick={() => {
                      setActiveModal(null);
                      setGameState(prev => ({ ...prev, affection: prev.affection + 2 }));
                    }}
                    variant="outline"
                    className="border-purple-500/30 hover:bg-purple-500/20 p-4 h-auto flex flex-col items-center gap-2"
                  >
                    <activity.icon className="w-6 h-6 text-purple-400" />
                    <span className="text-white">{activity.name}</span>
                    <span className="text-purple-200 text-xs text-center">{activity.description}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Floating Action Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="flex flex-col items-end gap-3">
          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowWorldMap(!showWorldMap)}
              className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
            >
              <MapPin className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveModal('daily_life')}
              className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
            >
              <Home className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveModal('communicator')}
              className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full border border-purple-500/30 flex items-center justify-center text-white hover:bg-purple-500/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Main Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 rounded-full shadow-2xl border-2 border-purple-400/50 flex items-center justify-center relative overflow-hidden"
          >
            <Crown className="w-8 h-8 text-white z-10" />
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Communicator Modal */}
      {activeModal === 'communicator' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <Card className="bg-black/80 backdrop-blur-md border-purple-500/30 p-8 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Hunter's Communicator</h2>
              <Button
                onClick={() => setActiveModal(null)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-purple-500/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/20 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full" />
                  <span className="text-white font-medium">Cha Hae-In</span>
                </div>
                <p className="text-purple-200">Good {timeOfDay}, Jin-Woo. How are you feeling today?</p>
              </div>
              
              <Button
                onClick={() => {
                  setActiveModal(null);
                  setGameState(prev => ({ ...prev, affection: prev.affection + 3 }));
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}