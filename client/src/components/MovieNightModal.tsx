import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Heart, 
  Zap, 
  Film,
  Popcorn,
  Volume2,
  Eye,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerStats {
  gold: number;
  level: number;
  experience: number;
  affectionLevel: number;
  energy: number;
  maxEnergy: number;
  apartmentTier: number;
  hasPlushSofa: boolean;
  hasEntertainmentSystem: boolean;
}

interface MovieNightModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReturnToHub: () => void;
  playerStats: PlayerStats;
  onStatsUpdate: (updates: { experience?: number; affection?: number; energy?: number }) => void;
  onSetFlag: (flag: string) => void;
}

type MovieGenre = 'action' | 'romance' | 'horror';
type ActivityPhase = 'intro' | 'selection' | 'watching' | 'aftermath';

interface MovieOption {
  id: MovieGenre;
  title: string;
  description: string;
  icon: React.ReactNode;
  chaReaction: string;
  affectionBonus: number;
}

const MOVIE_OPTIONS: MovieOption[] = [
  {
    id: 'action',
    title: 'Action Thriller',
    description: 'High-octane fight scenes and explosions',
    icon: <Zap className="w-6 h-6" />,
    chaReaction: "\"Perfect choice. I can critique their combat techniques.\"",
    affectionBonus: 1
  },
  {
    id: 'romance',
    title: 'Romantic Drama',
    description: 'Heartfelt love story with emotional depth',
    icon: <Heart className="w-6 h-6" />,
    chaReaction: "\"These stories are... surprisingly well-crafted. The emotions feel genuine.\"",
    affectionBonus: 3
  },
  {
    id: 'horror',
    title: 'Horror Film',
    description: 'Spine-chilling scares and suspense',
    icon: <Eye className="w-6 h-6" />,
    chaReaction: "\"Really? This is supposed to be scary? I've faced actual monsters.\"",
    affectionBonus: 2
  }
];

export function MovieNightModal({
  isVisible,
  onClose,
  onReturnToHub,
  playerStats,
  onStatsUpdate,
  onSetFlag
}: MovieNightModalProps) {
  const [activityPhase, setActivityPhase] = useState<ActivityPhase>('intro');
  const [selectedMovie, setSelectedMovie] = useState<MovieOption | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{type: 'user' | 'character', text: string}>>([]);
  const [movieProgress, setMovieProgress] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setActivityPhase('intro');
      setSelectedMovie(null);
      setConversationHistory([]);
      setMovieProgress(0);
    }
  }, [isVisible]);

  // Movie watching progress simulation
  useEffect(() => {
    if (activityPhase === 'watching' && movieProgress < 100) {
      const progressTimer = setInterval(() => {
        setMovieProgress(prev => {
          const newProgress = prev + 2;
          if (newProgress >= 100) {
            setActivityPhase('aftermath');
            generateMovieReaction();
            return 100;
          }
          return newProgress;
        });
      }, 200);

      return () => clearInterval(progressTimer);
    }
  }, [activityPhase, movieProgress]);

  const startMovieNight = () => {
    if (playerStats.energy < 15) {
      alert('Insufficient energy for movie night');
      return;
    }

    // Check apartment requirements
    if (playerStats.apartmentTier < 2 || !playerStats.hasPlushSofa || !playerStats.hasEntertainmentSystem) {
      alert('Requires Tier 2+ Apartment with Plush Sectional Sofa and Entertainment System');
      return;
    }

    setActivityPhase('selection');
    onStatsUpdate({ energy: playerStats.energy - 15 });
  };

  const selectMovie = (movie: MovieOption) => {
    setSelectedMovie(movie);
    setActivityPhase('watching');
    setMovieProgress(0);
  };

  const generateMovieReaction = () => {
    if (!selectedMovie) return;

    const reactions = {
      action: [
        "\"Their fighting form is terrible. No wonder they're losing.\"",
        "\"That move would never work in real combat. Too telegraphed.\"",
        "\"At least the choreography is entertaining, even if unrealistic.\""
      ],
      romance: [
        "\"The way they communicate... it's refreshing to see such honesty.\"",
        "\"I didn't expect this to be so... touching. Thank you for choosing this.\"",
        "\"Stories like this remind me there's more to life than hunting.\""
      ],
      horror: [
        "\"I don't understand why people find this frightening. It's clearly fake.\"",
        "\"The 'monster' moves predictably. Easy to defeat in reality.\"",
        "\"Though I admit, the atmosphere creation is quite skillful.\""
      ]
    };

    const reaction = reactions[selectedMovie.id][Math.floor(Math.random() * 3)];
    setConversationHistory([
      { type: 'character', text: selectedMovie.chaReaction },
      { type: 'character', text: reaction }
    ]);
  };

  const completeMovieNight = () => {
    if (!selectedMovie) return;

    // Calculate rewards
    const baseAffection = 2;
    const totalAffection = baseAffection + selectedMovie.affectionBonus;
    const experience = 25;

    onStatsUpdate({
      experience: experience,
      affection: totalAffection
    });

    // Set the relaxed movie night flag for future activities
    onSetFlag('relaxed_movie_night');

    onClose();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl h-[90vh] bg-gradient-to-br from-indigo-900/90 to-purple-900/90 rounded-2xl overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-50" />

          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Introduction Phase */}
          {activityPhase === 'intro' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl"
              >
                <div className="space-y-4">
                  <Film className="w-20 h-20 mx-auto text-indigo-300" />
                  <h1 className="text-5xl font-bold text-white">Movie Night</h1>
                  <p className="text-xl text-indigo-200">
                    Cozy up on your plush sectional sofa for an evening of domestic bliss
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-white font-semibold text-lg">Activity Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-indigo-300">
                        <Zap className="w-4 h-4" />
                        <span>Energy Cost: 15</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-300">
                        <Heart className="w-4 h-4" />
                        <span>Affection Gain: Medium</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-300">
                        <Sparkles className="w-4 h-4" />
                        <span>Unlocks: Cuddling Activities</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-300">
                        <Popcorn className="w-4 h-4" />
                        <span>Setting: Your Apartment</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startMovieNight}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
                >
                  Start Movie Night
                </Button>
              </motion.div>
            </div>
          )}

          {/* Movie Selection Phase */}
          {activityPhase === 'selection' && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-4xl w-full"
              >
                <div className="text-center space-y-4">
                  <h2 className="text-3xl font-bold text-white">Choose Your Movie</h2>
                  <p className="text-indigo-200">What kind of movie should we watch tonight?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {MOVIE_OPTIONS.map((movie) => (
                    <motion.div
                      key={movie.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => selectMovie(movie)}
                        className="w-full h-auto p-6 bg-black/30 hover:bg-black/50 border border-indigo-500/30 hover:border-indigo-400 text-left space-y-4"
                      >
                        <div className="flex items-center gap-4">
                          {movie.icon}
                          <h3 className="text-xl font-semibold text-white">{movie.title}</h3>
                        </div>
                        <p className="text-indigo-200 text-sm">{movie.description}</p>
                        <div className="text-xs text-green-300">
                          +{movie.affectionBonus} bonus affection
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Watching Phase */}
          {activityPhase === 'watching' && selectedMovie && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl w-full text-center"
              >
                <div className="space-y-4">
                  <Play className="w-16 h-16 mx-auto text-indigo-300" />
                  <h2 className="text-3xl font-bold text-white">Now Watching</h2>
                  <h3 className="text-xl text-indigo-200">{selectedMovie.title}</h3>
                </div>

                <div className="bg-black/30 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm text-white">
                    <span>Movie Progress</span>
                    <span>{movieProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${movieProgress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>

                <div className="bg-black/20 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Volume2 className="w-5 h-5 text-indigo-300" />
                    <span className="text-white">Cha Hae-In reacts...</span>
                  </div>
                  <p className="text-indigo-200 italic">
                    {selectedMovie.chaReaction}
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Aftermath Phase */}
          {activityPhase === 'aftermath' && selectedMovie && (
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="space-y-8 max-w-2xl w-full text-center"
              >
                <div className="space-y-4">
                  <Sparkles className="w-16 h-16 mx-auto text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">Perfect Evening</h2>
                  <p className="text-indigo-200">You both enjoyed a cozy night together on the couch</p>
                </div>

                {/* Conversation Display */}
                {conversationHistory.length > 0 && (
                  <div className="bg-black/30 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="text-white font-semibold">Cha Hae-In</div>
                        <div className="text-indigo-300 text-sm">Post-movie thoughts</div>
                      </div>
                    </div>
                    
                    {conversationHistory.map((entry, index) => (
                      <div key={index} className="text-white text-left bg-black/20 p-4 rounded-lg">
                        "{entry.text}"
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Rewards Earned</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-green-300">+25 Experience</div>
                    <div className="text-pink-300">+{2 + selectedMovie.affectionBonus} Affection</div>
                  </div>
                  <div className="text-purple-300 text-xs mt-2">
                    ✨ Unlocked: "relaxed_movie_night" flag - enables cuddling activities tomorrow
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={completeMovieNight}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    Complete Movie Night
                  </Button>
                  
                  <Button
                    onClick={onReturnToHub}
                    variant="outline"
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    Return to Daily Life Hub
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}