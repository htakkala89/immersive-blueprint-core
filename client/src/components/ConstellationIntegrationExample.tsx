import React, { useState } from 'react';
import { EnhancedRomanceConstellation } from './EnhancedRomanceConstellation';
import { Button } from '@/components/ui/button';
import { Heart, Star, Sparkles } from 'lucide-react';

interface RomanceMemory {
  id: string;
  title: string;
  date: string;
  category: 'first_moments' | 'growing_closer' | 'intimate_bonds' | 'special_occasions' | 'achievements';
  emotionalWeight: number;
  quote: string;
  description: string;
  unlocked: boolean;
  position: { x: number; y: number; z: number };
  connections: string[];
  image?: string;
  musicTrack?: string;
}

export function ConstellationIntegrationExample() {
  const [showConstellation, setShowConstellation] = useState(false);
  const [gameState, setGameState] = useState({
    affectionLevel: 65,
    intimacyLevel: 45,
    relationshipMilestones: ['first_kiss', 'confession', 'trust_building']
  });

  const handleMemoryReplay = (memory: RomanceMemory) => {
    console.log('Replaying memory:', memory.title);
    
    // Enhanced memory replay with contextual integration
    switch (memory.id) {
      case 'first_glance':
        // Navigate to Hunter Association with flashback overlay
        console.log('Starting flashback sequence at Hunter Association');
        break;
      
      case 'coffee_date':
        // Navigate to Hongdae Cafe with memory reconstruction
        console.log('Reconstructing coffee date memory at Hongdae Cafe');
        break;
      
      case 'first_kiss':
        // Special intimate scene replay with enhanced visuals
        console.log('Loading intimate memory replay with enhanced visuals');
        break;
      
      default:
        console.log('Generic memory replay for:', memory.title);
    }
    
    // Award experience for memory replay
    setGameState(prev => ({
      ...prev,
      affectionLevel: Math.min(100, prev.affectionLevel + 2)
    }));
  };

  const simulateProgressionGain = () => {
    setGameState(prev => ({
      ...prev,
      affectionLevel: Math.min(100, prev.affectionLevel + 10),
      intimacyLevel: Math.min(100, prev.intimacyLevel + 5)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Enhanced Romance Constellation</h1>
          <p className="text-gray-300 mb-6">
            A redesigned relationship visualization system that creates a beautiful, interactive story of your romance with Cha Hae-In
          </p>
          
          {/* Current Stats */}
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-pink-500/20">
              <div className="flex items-center gap-2 text-pink-300 mb-2">
                <Heart className="w-5 h-5" />
                <span className="font-semibold">Affection</span>
              </div>
              <div className="text-2xl font-bold text-white">{gameState.affectionLevel}%</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 text-purple-300 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Intimacy</span>
              </div>
              <div className="text-2xl font-bold text-white">{gameState.intimacyLevel}%</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-yellow-500/20">
              <div className="flex items-center gap-2 text-yellow-300 mb-2">
                <Star className="w-5 h-5" />
                <span className="font-semibold">Milestones</span>
              </div>
              <div className="text-2xl font-bold text-white">{gameState.relationshipMilestones.length}</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">Enhanced Features</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• 3D interactive constellation with smooth zoom and rotation</li>
              <li>• Emotional weight determines star size and glow intensity</li>
              <li>• Category-based memory organization with color coding</li>
              <li>• Connection lines showing relationship progression</li>
              <li>• Memory replay system with contextual integration</li>
              <li>• Ambient particle effects and musical integration</li>
            </ul>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-3">Memory Categories</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <span className="text-gray-300">First Moments - Initial connections</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
                <span className="text-gray-300">Growing Closer - Building trust</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-600"></div>
                <span className="text-gray-300">Intimate Bonds - Deep connections</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                <span className="text-gray-300">Special Occasions - Milestones</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={() => setShowConstellation(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
          >
            <Heart className="w-5 h-5 mr-2" />
            View Our Love Story
          </Button>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={simulateProgressionGain}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              Simulate Progress (+10 Affection)
            </Button>
          </div>
        </div>

        {/* Design Comparison */}
        <div className="mt-12 bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Design Improvements</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-300 mb-2">Previous Issues:</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• Static 2D layout with limited interaction</li>
                <li>• Basic star representation without meaning</li>
                <li>• No emotional context or progression narrative</li>
                <li>• Limited visual feedback and engagement</li>
                <li>• Disconnected from gameplay progression</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-300 mb-2">Enhanced Solution:</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li>• Dynamic 3D constellation with intuitive controls</li>
                <li>• Emotional weight system affecting visual representation</li>
                <li>• Meaningful categories telling progression story</li>
                <li>• Rich interactive elements with memory replay</li>
                <li>• Integrated with game systems and achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Romance Constellation */}
      <EnhancedRomanceConstellation
        isVisible={showConstellation}
        onClose={() => setShowConstellation(false)}
        affectionLevel={gameState.affectionLevel}
        intimacyLevel={gameState.intimacyLevel}
        relationshipMilestones={gameState.relationshipMilestones}
        onMemoryReplay={handleMemoryReplay}
      />
    </div>
  );
}