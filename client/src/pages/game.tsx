import { useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { GameUI } from "@/components/GameUI";
import { StoryProgress } from "@/components/StoryProgress";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Inventory } from "@/components/Inventory";
import { EnhancedSkillTree } from "@/components/EnhancedSkillTree";
import Home from "@/pages/home";
import { useGameState } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home as HomeIcon, Crown } from "lucide-react";

export default function Game() {
  const { gameState, handleChoice, isLoading, isProcessing } = useGameState();
  const timeRef = useRef<HTMLSpanElement>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showLifeHub, setShowLifeHub] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
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
      <div className="w-full max-w-sm mx-auto bg-black rounded-[40px] overflow-hidden shadow-2xl" style={{ height: '950px' }}>
        
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
        <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-black overflow-hidden" style={{ height: '900px' }}>
          
          {/* Character Art Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-black/80">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 via-purple-800/20 to-transparent"></div>
            <div className="absolute inset-0 opacity-10" style={{ 
              backgroundImage: 'radial-gradient(circle at 25% 25%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8b5cf6 0%, transparent 50%)',
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          {/* Character Portrait Area */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-0 w-3/4 h-full bg-gradient-to-l from-blue-900/40 via-purple-800/20 to-transparent">
              <div className="absolute right-4 top-16 w-48 h-64 bg-gradient-to-b from-slate-700/40 to-slate-900/60 rounded-lg border border-blue-400/20 shadow-2xl backdrop-blur-sm">
                <div className="absolute inset-2 bg-gradient-to-b from-blue-900/30 to-purple-900/30 rounded border border-blue-300/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-400/5 to-purple-400/10 rounded"></div>
                  <div className="absolute bottom-2 left-2 right-2 h-8 bg-black/50 rounded flex items-center justify-center">
                    <span className="text-blue-300 text-xs font-medium">Shadow Monarch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Game Scene Canvas */}
          <div className="relative h-full">
            <GameCanvas sceneData={gameState.sceneData} />
            
            {/* Story Progress */}
            <StoryProgress gameState={gameState} />

            {/* Status Overlay - Top Right */}
            <div className="absolute top-16 right-4 space-y-2">
              {/* Health Bar */}
              <div className="rounded-lg px-3 py-2 min-w-20 border border-red-500 border-opacity-30 bg-black bg-opacity-30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-red-400 text-xs drop-shadow-lg">❤️</span>
                  <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.health}</span>
                </div>
                <div className="w-14 h-1 bg-black bg-opacity-30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
              
              {/* Mana Bar */}
              <div className="rounded-lg px-3 py-2 min-w-20 border border-blue-500 border-opacity-30 bg-black bg-opacity-30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-xs drop-shadow-lg">💧</span>
                  <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.mana}</span>
                </div>
                <div className="w-14 h-1 bg-black bg-opacity-30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                    style={{ width: `${(gameState.mana / gameState.maxMana) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons - Top Left */}
            <div className="absolute top-16 left-4 space-y-2">
              {/* Life Hub Button */}
              <Button
                onClick={() => setShowLifeHub(true)}
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border border-purple-400 border-opacity-50 shadow-lg backdrop-blur-sm"
                title="Daily Life Hub"
              >
                <HomeIcon className="h-5 w-5 text-white drop-shadow-lg" />
              </Button>
              
              {/* Skills Button */}
              <Button
                onClick={() => setShowSkillTree(true)}
                className="rounded-full w-12 h-12 p-0 bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 border border-yellow-400 border-opacity-50 shadow-lg backdrop-blur-sm"
                title="Shadow Monarch Skills"
              >
                <Crown className="h-5 w-5 text-white drop-shadow-lg" />
              </Button>
            </div>
          </div>

          {/* Game UI */}
          <GameUI 
            gameState={gameState} 
            onChoice={handleChoice}
            isProcessing={isProcessing}
            onInventoryToggle={() => setShowInventory(!showInventory)}
          />
        </div>
      </div>

      {/* Inventory */}
      <Inventory 
        items={gameState?.inventory || []}
        isVisible={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Life Hub Fullscreen Modal */}
      {showLifeHub && (
        <div className="fixed inset-0 z-50 bg-black">
          <Home />
          <Button
            onClick={() => setShowLifeHub(false)}
            className="fixed top-4 right-4 z-60 rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700"
            title="Close Life Hub"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Skill Tree Modal */}
      {showSkillTree && gameState && (
        <EnhancedSkillTree
          gameState={gameState}
          onClose={() => setShowSkillTree(false)}
          sessionId={gameState.sessionId}
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
}
