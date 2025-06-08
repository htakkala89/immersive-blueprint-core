import { useEffect, useRef, useState } from "react";
import { GameCanvas } from "@/components/GameCanvas";
import { GameUI } from "@/components/GameUI";
import { StoryProgress } from "@/components/StoryProgress";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Inventory } from "@/components/Inventory";
import { EnhancedSkillTree } from "@/components/EnhancedSkillTree";
import { RealtimeChat } from "@/components/RealtimeChat";
import Home from "@/pages/home";
import { useGameState } from "@/hooks/useGameState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home as HomeIcon, Crown, MessageCircle } from "lucide-react";

export default function Game() {
  const { gameState, handleChoice, isLoading, isProcessing } = useGameState();
  const timeRef = useRef<HTMLSpanElement>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [showLifeHub, setShowLifeHub] = useState(false);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [showRealtimeChat, setShowRealtimeChat] = useState(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 via-gray-900 to-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (showLifeHub) {
    return <Home onClose={() => setShowLifeHub(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black flex items-center justify-center p-2">
      {/* iPhone 16 Pro Max Container */}
      <div className="w-full max-w-sm mx-auto bg-black rounded-[55px] overflow-hidden shadow-2xl border-8 border-gray-900 relative" style={{ height: '956px', aspectRatio: '9/19.5' }}>
        
        {/* Status Bar - Glassmorphism */}
        <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-4 bg-black/20 backdrop-blur-md text-white text-sm font-semibold">
          <span ref={timeRef}>9:41</span>
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
            <div className="w-6 h-3 border border-white rounded-sm ml-2">
              <div className="w-4 h-2 bg-green-400 rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>

        {/* Full-Screen Cinematic Game Content */}
        <div className="relative h-full w-full overflow-hidden">
          
          {/* AI-Generated Scene Background with Ken Burns Effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="w-full h-full transform scale-110 animate-ken-burns">
              <GameCanvas sceneData={gameState.sceneData} />
            </div>
          </div>
            
          {/* Story Progress - Glassmorphism */}
          <div className="absolute top-20 left-4 right-4">
            <StoryProgress gameState={gameState} />
          </div>
          
          {/* AI Generated Badge - Glassmorphism */}
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <span className="text-white text-xs drop-shadow-lg">✨ AI-Generated Scene</span>
          </div>

          {/* Status Overlay - Glassmorphism */}
          <div className="absolute top-16 right-4 space-y-2">
            {/* Health Bar */}
            <div className="rounded-lg px-3 py-2 min-w-20 bg-red-500/20 backdrop-blur-md border border-red-400/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-red-400 text-xs drop-shadow-lg">❤️</span>
                <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.health}</span>
              </div>
              <div className="w-14 h-1 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300" 
                  style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Mana Bar */}
            <div className="rounded-lg px-3 py-2 min-w-20 bg-blue-500/20 backdrop-blur-md border border-blue-400/30">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-400 text-xs drop-shadow-lg">💧</span>
                <span className="text-white text-xs drop-shadow-lg font-medium">{gameState.mana}</span>
              </div>
              <div className="w-14 h-1 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                  style={{ width: `${(gameState.mana / gameState.maxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons - Glassmorphism */}
          <div className="absolute top-20 left-4 flex flex-col space-y-3">
            {/* Home Button */}
            <Button
              onClick={() => setShowLifeHub(true)}
              className="rounded-full w-12 h-12 p-0 bg-purple-600/20 backdrop-blur-md hover:bg-purple-700/30 border border-purple-400/30 shadow-lg"
              title="Daily Life Hub"
            >
              <HomeIcon className="h-5 w-5 text-white drop-shadow-lg" />
            </Button>
            
            {/* Skills Button */}
            <Button
              onClick={() => setShowSkillTree(true)}
              className="rounded-full w-12 h-12 p-0 bg-yellow-600/20 backdrop-blur-md hover:bg-yellow-700/30 border border-yellow-400/30 shadow-lg"
              title="Shadow Monarch Skills"
            >
              <Crown className="h-5 w-5 text-white drop-shadow-lg" />
            </Button>
            
            {/* Chat Button */}
            <Button
              onClick={() => setShowRealtimeChat(true)}
              className="rounded-full w-12 h-12 p-0 bg-pink-600/20 backdrop-blur-md hover:bg-pink-700/30 border border-pink-400/30 shadow-lg"
              title="Chat with Cha Hae-In"
            >
              <MessageCircle className="h-5 w-5 text-white drop-shadow-lg" />
            </Button>
          </div>

          {/* Game UI - Glassmorphism */}
          <div className="absolute bottom-0 left-0 right-0">
            <GameUI 
              gameState={gameState} 
              onChoice={handleChoice}
              isProcessing={isProcessing}
              onInventoryToggle={() => setShowInventory(!showInventory)}
            />
          </div>
        </div>
      </div>

      {/* Inventory Modal */}
      <Inventory 
        items={gameState.inventory} 
        isVisible={showInventory}
        onClose={() => setShowInventory(false)}
      />

      {/* Skill Tree Modal */}
      {showSkillTree && gameState && (
        <EnhancedSkillTree
          gameState={gameState}
          onClose={() => setShowSkillTree(false)}
          sessionId={gameState.sessionId}
        />
      )}

      {/* Realtime Chat Modal */}
      <RealtimeChat
        gameState={gameState}
        isVisible={showRealtimeChat}
        onClose={() => setShowRealtimeChat(false)}
        onAffectionChange={(change) => {
          console.log(`Affection changed by: ${change}`);
        }}
      />

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isProcessing} />
    </div>
  );
}