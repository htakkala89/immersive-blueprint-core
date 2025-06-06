import { useState, useEffect } from "react";
import type { GameState, Choice } from "@shared/schema";
import { LockPickingGame, RuneSequenceGame, DragonEncounterGame } from "./MiniGames";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface GameUIProps {
  gameState: GameState;
  onChoice: (choice: Choice) => void;
}

export function GameUI({ gameState, onChoice }: GameUIProps) {
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const { speak, stop, toggle, speaking, enabled, supported } = useSpeechSynthesis();

  const handleChoice = (choice: Choice) => {
    console.log('Choice clicked:', choice.id);
    // Check if choice triggers a mini-game
    if (choice.id === 'pick-lock') {
      console.log('Triggering lock-picking mini-game');
      setActiveMinigame('lockpicking');
    } else if (choice.id === 'enhanced-vision') {
      console.log('Triggering rune sequence mini-game');
      setActiveMinigame('rune-sequence');
    } else if (choice.id === 'face-dragon') {
      console.log('Triggering dragon encounter mini-game');
      setActiveMinigame('dragon-encounter');
    } else {
      console.log('Regular choice, no mini-game');
      onChoice(choice);
    }
  };

  // Auto-narration effect when story changes
  useEffect(() => {
    if (enabled && gameState.narration) {
      // Clean the narration text for better speech synthesis
      const cleanNarration = gameState.narration
        .replace(/[""]/g, '"')
        .replace(/['']/g, "'")
        .replace(/\.\.\./g, '... pause ...')
        .replace(/!/g, '.')
        .replace(/\?/g, '.');
      
      speak(cleanNarration);
    }
  }, [gameState.narration, enabled, speak]);

  const handleMinigameComplete = (success: boolean, originalChoice: Choice) => {
    setActiveMinigame(null);
    // Pass the result to the game logic
    onChoice({
      ...originalChoice,
      id: `${originalChoice.id}-${success ? 'success' : 'fail'}`
    });
  };

  return (
    <>
      <div className="flex-1 bg-[hsl(var(--space-darker))] bg-opacity-95" style={{ height: 'calc(700px - 256px - 60px)' }}>
        <div className="p-3 space-y-3 h-full overflow-y-auto">
        
          {/* AI Game Master Message */}
          <div className="mystical-gradient rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-br from-[hsl(var(--mystical-primary))] to-[hsl(var(--mystical-secondary))] rounded-full flex items-center justify-center text-xs">
                  🎭
                </div>
                <span className="text-white text-xs opacity-70">AI Game Master</span>
              </div>
              
              {/* Voice Control Toggle */}
              {supported && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggle}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                      enabled 
                        ? 'bg-green-500 bg-opacity-20 text-green-400 hover:bg-opacity-30' 
                        : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                    }`}
                    title={enabled ? 'Disable voice narration' : 'Enable voice narration'}
                  >
                    {speaking ? '🔊' : enabled ? '🎧' : '🔇'}
                  </button>
                  {speaking && (
                    <button
                      onClick={stop}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-red-500 bg-opacity-20 text-red-400 hover:bg-opacity-30 transition-all duration-200"
                      title="Stop narration"
                    >
                      ⏹️
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-white text-sm leading-relaxed">
              {gameState.narration}
            </p>
          </div>
          
          {/* Choice Buttons */}
          <div className="space-y-2">
            {gameState.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="choice-hover w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white bg-opacity-10 rounded-lg flex items-center justify-center text-sm">
                    {choice.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-white text-sm">{choice.text}</span>
                    {choice.detail && (
                      <div className="text-white text-xs opacity-60 mt-1">
                        {choice.detail}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mini-games */}
      {activeMinigame === 'lockpicking' && (
        <LockPickingGame
          onComplete={(success) => handleMinigameComplete(success, { id: 'pick-lock', icon: '🔓', text: 'Attempt to pick the lock' })}
          onCancel={() => setActiveMinigame(null)}
        />
      )}
      {activeMinigame === 'rune-sequence' && (
        <RuneSequenceGame
          onComplete={(success) => handleMinigameComplete(success, { id: 'enhanced-vision', icon: '✨', text: 'Generate enhanced vision' })}
          onCancel={() => setActiveMinigame(null)}
        />
      )}
      {activeMinigame === 'dragon-encounter' && (
        <DragonEncounterGame
          onComplete={(success) => handleMinigameComplete(success, { id: 'face-dragon', icon: '🐉', text: 'Face the dragon' })}
          onCancel={() => setActiveMinigame(null)}
        />
      )}
    </>
  );
}
