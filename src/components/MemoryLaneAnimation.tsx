import { useState, useEffect } from "react";
import { Heart, Star, Shield, Flame, Crown, X, Calendar, Clock } from "lucide-react";

interface Memory {
  id: string;
  title: string;
  description: string;
  affectionLevel: number;
  timestamp: number;
  emotionalImpact: 'touching' | 'romantic' | 'heroic' | 'playful' | 'intimate';
  scene: string;
  imagePrompt?: string;
}

interface MemoryLaneAnimationProps {
  isVisible: boolean;
  onClose: () => void;
  currentAffectionLevel: number;
  gameState: {
    affection: number;
    level: number;
    currentScene: string;
    previousChoices: string[];
  };
}

const DEFAULT_MEMORIES: Memory[] = [
  {
    id: "first_meeting",
    title: "First Encounter",
    description: "The moment you first met the legendary S-Rank Hunter Cha Hae-In during a guild meeting.",
    affectionLevel: 0,
    timestamp: Date.now() - 1000000,
    emotionalImpact: 'touching',
    scene: "FIRST_MEETING",
    imagePrompt: "First meeting between Jin-Woo and Cha Hae-In in a guild hall"
  },
  {
    id: "mutual_respect",
    title: "Mutual Recognition",
    description: "Cha Hae-In acknowledges your growing strength and potential as a fellow S-Rank Hunter.",
    affectionLevel: 1,
    timestamp: Date.now() - 800000,
    emotionalImpact: 'heroic',
    scene: "RECOGNITION",
    imagePrompt: "Cha Hae-In showing respect to Jin-Woo after witnessing his power"
  },
  {
    id: "trust_building",
    title: "Building Trust",
    description: "Fighting side by side, you've earned her trust through your actions and reliability.",
    affectionLevel: 2,
    timestamp: Date.now() - 600000,
    emotionalImpact: 'heroic',
    scene: "TRUST_MOMENT",
    imagePrompt: "Jin-Woo and Cha Hae-In fighting together against powerful enemies"
  },
  {
    id: "close_friendship",
    title: "Close Friendship",
    description: "Beyond professional respect, a genuine friendship has blossomed between you two.",
    affectionLevel: 3,
    timestamp: Date.now() - 400000,
    emotionalImpact: 'touching',
    scene: "FRIENDSHIP",
    imagePrompt: "Jin-Woo and Cha Hae-In sharing a quiet moment of friendship"
  },
  {
    id: "romantic_awareness",
    title: "Romantic Awakening",
    description: "The moment when friendship transforms into something deeper and more meaningful.",
    affectionLevel: 4,
    timestamp: Date.now() - 200000,
    emotionalImpact: 'romantic',
    scene: "ROMANTIC_MOMENT",
    imagePrompt: "A tender romantic moment between Jin-Woo and Cha Hae-In"
  },
  {
    id: "true_love",
    title: "Declaration of Love",
    description: "The culmination of your journey together - a confession of deep, unbreakable love.",
    affectionLevel: 5,
    timestamp: Date.now(),
    emotionalImpact: 'intimate',
    scene: "LOVE_CONFESSION",
    imagePrompt: "Jin-Woo and Cha Hae-In in an intimate moment of love confession"
  }
];

export function MemoryLaneAnimation({ isVisible, onClose, currentAffectionLevel, gameState }: MemoryLaneAnimationProps) {
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string>>({});
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  if (!isVisible) return null;

  // Filter memories based on current affection level
  const availableMemories = DEFAULT_MEMORIES.filter(memory => 
    memory.affectionLevel <= currentAffectionLevel
  );

  const generateMemoryImage = async (memory: Memory) => {
    if (generatedImages[memory.id] || isGeneratingImage) return;
    
    setIsGeneratingImage(true);
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: {
            currentScene: memory.scene,
            affection: memory.affectionLevel,
            level: gameState.level
          },
          customPrompt: memory.imagePrompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImages(prev => ({
          ...prev,
          [memory.id]: data.imageUrl
        }));
      }
    } catch (error) {
      console.error('Failed to generate memory image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'romantic': return <Heart className="w-4 h-4 text-pink-400" />;
      case 'heroic': return <Shield className="w-4 h-4 text-blue-400" />;
      case 'touching': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'playful': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'intimate': return <Crown className="w-4 h-4 text-purple-400" />;
      default: return <Heart className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'romantic': return 'from-pink-500 to-red-500';
      case 'heroic': return 'from-blue-500 to-cyan-500';
      case 'touching': return 'from-yellow-500 to-amber-500';
      case 'playful': return 'from-orange-500 to-red-500';
      case 'intimate': return 'from-purple-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % availableMemories.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isVisible, availableMemories.length]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md border border-purple-500/30 rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">Memory Lane</h2>
              <p className="text-purple-300">Your journey with Cha Hae-In</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>

          {/* Memory Cards */}
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
            {availableMemories.map((memory, index) => (
              <div
                key={memory.id}
                className={`relative flex items-start gap-4 transition-all duration-500 ${
                  animationPhase === index ? 'scale-105 ring-2 ring-pink-400/50' : ''
                } ${
                  memory.affectionLevel > currentAffectionLevel ? 'opacity-50' : ''
                }`}
              >
                {/* Timeline Node */}
                <div className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-r ${getEmotionColor(memory.emotionalImpact)} flex items-center justify-center border-4 border-gray-900`}>
                  {getEmotionIcon(memory.emotionalImpact)}
                  <div className="absolute -top-1 -right-1 text-xs bg-white text-black rounded-full w-6 h-6 flex items-center justify-center font-bold">
                    {memory.affectionLevel}
                  </div>
                </div>

                {/* Memory Card */}
                <div 
                  className={`flex-1 bg-gray-900/50 border border-purple-500/20 rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-300 ${
                    selectedMemory?.id === memory.id ? 'ring-2 ring-purple-400' : ''
                  }`}
                  onClick={() => {
                    setSelectedMemory(memory);
                    generateMemoryImage(memory);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">{memory.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(memory.timestamp)}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{memory.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEmotionIcon(memory.emotionalImpact)}
                      <span className="text-xs text-gray-400 capitalize">{memory.emotionalImpact}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-sm">
                          {i < memory.affectionLevel ? '❤️' : '🤍'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Memory Image */}
                  {generatedImages[memory.id] && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <img 
                        src={generatedImages[memory.id]} 
                        alt={memory.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  {isGeneratingImage && selectedMemory?.id === memory.id && (
                    <div className="mt-3 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory Details Modal */}
        {selectedMemory && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-60 flex items-center justify-center" onClick={() => setSelectedMemory(null)}>
            <div 
              className="bg-gradient-to-br from-gray-900 to-purple-900 border border-purple-500/30 rounded-xl p-6 max-w-2xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getEmotionIcon(selectedMemory.emotionalImpact)}
                  <h3 className="text-xl font-bold text-white">{selectedMemory.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedMemory(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {generatedImages[selectedMemory.id] && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img 
                    src={generatedImages[selectedMemory.id]} 
                    alt={selectedMemory.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              <p className="text-gray-300 mb-4 leading-relaxed">{selectedMemory.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatTimestamp(selectedMemory.timestamp)}
                </div>
                <div className="flex items-center gap-2">
                  <span>Affection Level:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i}>
                        {i < selectedMemory.affectionLevel ? '❤️' : '🤍'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Relationship Progress</p>
              <p className="text-white font-semibold">
                {availableMemories.length} / {DEFAULT_MEMORIES.length} memories unlocked
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Current Affection</p>
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="text-lg">
                    {i < currentAffectionLevel ? '❤️' : '🤍'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}