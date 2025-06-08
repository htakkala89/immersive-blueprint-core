import { useState } from "react";
import { Heart, X, Star, Flame, Shield } from "lucide-react";

interface RelationshipSystemProps {
  isVisible: boolean;
  onClose: () => void;
  gameState: {
    affection: number;
    level: number;
    currentScene: string;
  };
}

export function RelationshipSystem({ isVisible, onClose, gameState }: RelationshipSystemProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  const affectionLevel = gameState.affection;
  
  const getRelationshipTitle = (affectionLevel: number): string => {
    if (affectionLevel === 0) return "Cha Hae-In";
    if (affectionLevel === 1) return "Fellow S-Rank Hunter";
    if (affectionLevel === 2) return "Trusted Partner";
    if (affectionLevel === 3) return "Close Friend";
    if (affectionLevel === 4) return "Romantic Interest";
    if (affectionLevel >= 5) return "Beloved";
    return "Cha Hae-In";
  };

  const getStatusDescription = (affectionLevel: number): string => {
    if (affectionLevel === 0) return "You've just met the legendary S-Rank Hunter Cha Hae-In";
    if (affectionLevel === 1) return "Building mutual respect as fellow hunters";
    if (affectionLevel === 2) return "Growing trust through shared battles";
    if (affectionLevel === 3) return "Developing a close friendship";
    if (affectionLevel === 4) return "Romantic feelings are blossoming";
    if (affectionLevel >= 5) return "Deep love and unbreakable bond";
    return "Unknown relationship status";
  };

  // Convert 0-5 affection to percentage systems
  const affectionPercent = Math.round((affectionLevel / 5) * 100);
  const intimacyPercent = Math.max(0, Math.round((affectionLevel / 5) * 100 * 0.8));
  const trustPercent = Math.min(100, Math.round((affectionLevel / 5) * 100 * 1.2));

  const ProgressBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md border border-purple-500/30 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-pink-400" />
            <div>
              <h3 className="text-xl font-bold text-white">
                {getRelationshipTitle(affectionLevel)}
              </h3>
              <p className="text-purple-300 text-sm">S-Rank Hunter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Relationship Status */}
        <div className="mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            {getStatusDescription(affectionLevel)}
          </p>
        </div>

        {/* Hearts Display */}
        <div className="flex justify-center mb-6">
          <div className="flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span 
                key={i}
                className={`text-2xl transition-all duration-300 ${
                  i < affectionLevel 
                    ? 'filter drop-shadow-[0_0_8px_rgba(255,107,157,0.8)] scale-110' 
                    : 'opacity-30'
                }`}
              >
                {i < affectionLevel ? '❤️' : '🤍'}
              </span>
            ))}
          </div>
        </div>

        {/* Relationship Stats */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-pink-300 flex items-center gap-1">
                <Heart className="w-4 h-4" />
                Affection
              </span>
              <span className="text-pink-300">{affectionPercent}%</span>
            </div>
            <ProgressBar value={affectionPercent} color="bg-gradient-to-r from-pink-500 to-red-500" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-300 flex items-center gap-1">
                <Flame className="w-4 h-4" />
                Intimacy
              </span>
              <span className="text-purple-300">{intimacyPercent}%</span>
            </div>
            <ProgressBar value={intimacyPercent} color="bg-gradient-to-r from-purple-500 to-pink-500" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-300 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Trust
              </span>
              <span className="text-blue-300">{trustPercent}%</span>
            </div>
            <ProgressBar value={trustPercent} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
          </div>
        </div>

        {/* Relationship Milestones */}
        {affectionLevel > 0 && (
          <div className="mt-6 pt-4 border-t border-purple-500/20">
            <h4 className="text-sm font-semibold text-purple-300 mb-3">Relationship Milestones</h4>
            <div className="space-y-2 text-xs">
              {affectionLevel >= 1 && (
                <div className="flex items-center gap-2 text-green-400">
                  <Star className="w-3 h-3" />
                  <span>First meeting completed</span>
                </div>
              )}
              {affectionLevel >= 2 && (
                <div className="flex items-center gap-2 text-green-400">
                  <Shield className="w-3 h-3" />
                  <span>Trust established</span>
                </div>
              )}
              {affectionLevel >= 3 && (
                <div className="flex items-center gap-2 text-green-400">
                  <Heart className="w-3 h-3" />
                  <span>Close friendship formed</span>
                </div>
              )}
              {affectionLevel >= 4 && (
                <div className="flex items-center gap-2 text-pink-400">
                  <Flame className="w-3 h-3" />
                  <span>Romantic feelings awakened</span>
                </div>
              )}
              {affectionLevel >= 5 && (
                <div className="flex items-center gap-2 text-red-400">
                  <Heart className="w-3 h-3" />
                  <span>Deep love confession</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-purple-500/20">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Continue Story
          </button>
        </div>
      </div>
    </div>
  );
}