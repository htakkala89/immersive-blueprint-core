import { useState, useEffect } from "react";
import type { GameState, Choice } from "@shared/schema";
import { LockPickingGame, RuneSequenceGame, DragonEncounterGame } from "./MiniGames";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameUIProps {
  gameState: GameState;
  onChoice: (choice: Choice) => void;
}

export function GameUI({ gameState, onChoice }: GameUIProps) {
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [actionType, setActionType] = useState<"action" | "speak">("action");
  const [isImageLoading, setIsImageLoading] = useState(false);
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

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    if (actionType === "action") {
      // Create a custom action choice
      const customChoice: Choice = {
        id: `custom-${Date.now()}`,
        icon: "💬",
        text: chatInput,
        detail: "Custom action"
      };
      onChoice(customChoice);
    } else {
      // Handle speak action - convert text to speech
      if (supported) {
        speak(chatInput, {
          rate: 0.9,
          pitch: 1.0,
          volume: 0.8
        });
      }
    }
    
    setChatInput("");
  };

  // Monitor for image loading state
  useEffect(() => {
    if (gameState.sceneData?.imageUrl) {
      setIsImageLoading(true);
      const img = new Image();
      img.onload = () => setIsImageLoading(false);
      img.onerror = () => setIsImageLoading(false);
      img.src = gameState.sceneData.imageUrl;
    }
  }, [gameState.sceneData?.imageUrl]);

  return (
    <>
      <div className="flex-1 bg-[hsl(var(--space-darker))] bg-opacity-95 relative" style={{ height: 'calc(700px - 256px - 60px)' }}>
        <div className="p-3 space-y-3 h-full overflow-y-auto pb-16">
        
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
            <div className="space-y-2">
              <p className="text-white text-sm leading-relaxed">
                {gameState.narration}
              </p>
              {isImageLoading && (
                <div className="flex items-center gap-2 text-white text-xs opacity-70">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating scene image...</span>
                </div>
              )}
            </div>
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
        
        {/* Fixed Chat Interface */}
        <div className="absolute bottom-0 left-0 right-0 bg-[hsl(var(--space-darker))] bg-opacity-95 border-t border-white border-opacity-20 p-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActionType(actionType === "action" ? "speak" : "action")}
              className="w-20 h-8 bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-xs rounded hover:bg-opacity-20 transition-all"
            >
              {actionType === "action" ? "Action" : "Speak"}
            </button>
            
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={actionType === "action" ? "Type your action..." : "Type what to say..."}
              className="flex-1 h-8 bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-xs placeholder:text-white placeholder:opacity-50 rounded px-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleChatSubmit();
                }
              }}
            />
            
            <button
              onClick={handleChatSubmit}
              className="h-8 px-3 bg-gradient-to-r from-[hsl(var(--mystical-primary))] to-[hsl(var(--mystical-secondary))] hover:opacity-80 text-white text-xs rounded"
            >
              {actionType === "action" ? "📨" : "🗣️"}
            </button>
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
