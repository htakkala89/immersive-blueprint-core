import type { GameState } from "@shared/schema";

interface StoryProgressProps {
  gameState: GameState;
}

export function StoryProgress({ gameState }: StoryProgressProps) {
  const isEnding = gameState.choices.length === 0;
  const storyPath = gameState.storyPath || "entrance";
  
  // Map story paths to readable names
  const pathNames: Record<string, string> = {
    entrance: "Ancient Entrance",
    mystical_path: "Mystical Path",
    combat_path: "Combat Path", 
    inner_sanctum: "Inner Sanctum",
    power_ending: "Power Ascension",
    balance_ending: "Cosmic Balance",
    knowledge_ending: "Knowledge Liberation",
    sacrifice_ending: "Ultimate Sacrifice",
    dragon_ally_ending: "Dragon Alliance",
    spiritual_ascension_ending: "Spiritual Transcendence"
  };

  const endingTypes: Record<string, { icon: string; color: string; title: string }> = {
    victory: { icon: "👑", color: "text-yellow-400", title: "Victory" },
    defeat: { icon: "💀", color: "text-red-400", title: "Heroic End" },
    neutral: { icon: "⚖️", color: "text-blue-400", title: "Balanced Path" },
    secret: { icon: "✨", color: "text-purple-400", title: "Secret Ending" }
  };

  const currentPathName = pathNames[storyPath] || "Unknown Path";
  
  // Determine ending type based on story path
  let endingType: string | null = null;
  if (storyPath.includes("power_ending")) endingType = "victory";
  else if (storyPath.includes("balance_ending")) endingType = "victory";
  else if (storyPath.includes("knowledge_ending")) endingType = "neutral";
  else if (storyPath.includes("sacrifice_ending")) endingType = "defeat";
  else if (storyPath.includes("dragon_ally_ending")) endingType = "secret";
  else if (storyPath.includes("spiritual_ascension_ending")) endingType = "secret";

  const choiceCount = gameState.choiceHistory?.length || 0;
  const storyFlags = gameState.storyFlags || {};
  const flagCount = Object.values(storyFlags).filter(Boolean).length;

  return (
    <div className="absolute top-4 left-4 rounded-lg p-2 max-w-48 border border-white border-opacity-20 bg-black bg-opacity-30">
      <div className="text-white text-xs space-y-1">
        {/* Current Story Section */}
        <div className="border-b border-white border-opacity-20 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 text-sm">📖</span>
            <span className="font-semibold text-sm">Story Progress</span>
          </div>
          <div className="text-white opacity-80">{currentPathName}</div>
        </div>

        {/* Story Statistics */}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="opacity-70">Choices Made:</span>
            <span className="text-blue-400">{choiceCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">Story Flags:</span>
            <span className="text-green-400">{flagCount}</span>
          </div>
        </div>

        {/* Active Story Flags */}
        {flagCount > 0 && (
          <div className="border-t border-white border-opacity-20 pt-2">
            <div className="text-xs opacity-70 mb-1">Active Flags:</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(storyFlags).map(([flag, active]) => (
                active && (
                  <span 
                    key={flag}
                    className="bg-green-500 bg-opacity-20 text-green-400 px-1 py-0.5 rounded text-xs"
                  >
                    {flag.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Ending Display */}
        {isEnding && endingType && (
          <div className="border-t border-white border-opacity-20 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{endingTypes[endingType].icon}</span>
              <div>
                <div className={`font-semibold ${endingTypes[endingType].color}`}>
                  {endingTypes[endingType].title}
                </div>
                <div className="text-xs opacity-70">Story Complete</div>
              </div>
            </div>
          </div>
        )}

        {/* Restart Option for Endings */}
        {isEnding && (
          <button 
            onClick={() => window.location.reload()}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs py-1 px-2 rounded transition-all duration-200"
          >
            🔄 New Adventure
          </button>
        )}
      </div>
    </div>
  );
}