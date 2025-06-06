import { useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { GameUI } from "@/components/GameUI";
import { StoryProgress } from "@/components/StoryProgress";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Inventory } from "@/components/Inventory";
import { useGameState } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Game() {
  const { gameState, handleChoice, isLoading, isProcessing } = useGameState();
  const timeRef = useRef<HTMLSpanElement>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      if (timeRef.current) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
        timeRef.current.textContent = timeString;
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading mystical adventure...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black flex items-center justify-center p-4">
      {/* iOS Device Frame */}
      <div className="w-full max-w-sm mx-auto bg-black rounded-[40px] overflow-hidden shadow-2xl">
        
        {/* Status Bar */}
        <div className="flex justify-between items-center px-7 py-3 bg-black bg-opacity-80 text-white text-sm font-semibold">
          <span ref={timeRef}>9:41</span>
          <div className="flex space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.5 2A1.5 1.5 0 002 3.5v.5a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-.5A1.5 1.5 0 003.5 2zM5.5 4A1.5 1.5 0 004 5.5v9A1.5 1.5 0 005.5 16h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0014.5 4h-9z" />
            </svg>
          </div>
        </div>

        {/* Main Game Content */}
        <div className="relative bg-[hsl(var(--space-darker))] overflow-hidden" style={{ height: '700px' }}>
          
          {/* Animated Game Scene */}
          <div className="relative h-64 scene-gradient overflow-hidden">
            <GameCanvas sceneData={gameState.sceneData} />
            
            {/* Story Progress */}
            <StoryProgress gameState={gameState} />
            
            {/* AI Generated Badge */}
            <div className="absolute top-4 right-4 px-3 py-1.5 border border-white border-opacity-20 rounded-full">
              <span className="text-white text-xs drop-shadow-lg">✨ AI-Generated Scene</span>
            </div>

            {/* Status Overlay - Transparent */}
            <div className="absolute top-5 left-4 space-y-2">
              {/* Health Bar */}
              <div className="rounded-lg px-3 py-2 min-w-24 border border-red-500 border-opacity-30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-400 text-xs drop-shadow-lg">❤️</span>
                  <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.health}</span>
                  <span className="text-white text-xs opacity-70 drop-shadow-lg">/ {gameState.maxHealth}</span>
                </div>
                <div className="w-16 h-1 bg-black bg-opacity-30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Mana Bar */}
              <div className="rounded-lg px-3 py-2 min-w-24 border border-blue-500 border-opacity-30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-xs drop-shadow-lg">💧</span>
                  <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.mana}</span>
                  <span className="text-white text-xs opacity-70 drop-shadow-lg">/ {gameState.maxMana}</span>
                </div>
                <div className="w-16 h-1 bg-black bg-opacity-30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(gameState.mana / gameState.maxMana) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Game UI */}
          <GameUI 
            gameState={gameState} 
            onChoice={handleChoice}
          />

          {/* Inventory Button */}
          <div className="absolute bottom-4 right-4">
            <Button 
              onClick={() => setShowInventory(!showInventory)}
              className="w-11 h-11 bg-white bg-opacity-10 rounded-full flex items-center justify-center text-white hover:bg-opacity-20 transition-all duration-200 border-0"
            >
              🎒
            </Button>
          </div>
        </div>
      </div>

      {/* Inventory */}
      <Inventory 
        items={gameState?.inventory || []}
        isVisible={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Loading Overlay */}
      <LoadingOverlay 
        isVisible={isProcessing} 
        message="Generating AI Story & Artwork"
      />
    </div>
  );
}
