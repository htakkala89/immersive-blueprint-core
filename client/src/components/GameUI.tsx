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
  isProcessing?: boolean;
  onInventoryToggle: () => void;
}

export function GameUI({ gameState, onChoice, isProcessing = false, onInventoryToggle }: GameUIProps) {
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [actionType, setActionType] = useState<"action" | "speak">("action");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{id: string, text: string, type: 'user' | 'system', timestamp: number}>>([]);
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

  // Manual speech control - removed auto-narration to prevent conflicts

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
    
    // Add user message to chat history
    const userMessage = {
      id: `user-${Date.now()}`,
      text: chatInput,
      type: 'user' as const,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMessage]);
    
    if (actionType === "action") {
      // Create a custom action choice
      const customChoice: Choice = {
        id: `custom-${Date.now()}`,
        icon: "⚔️",
        text: chatInput,
        detail: "Custom action"
      };
      onChoice(customChoice);
    } else {
      // Handle speak action - send to Maya and also speak aloud
      const speakChoice: Choice = {
        id: `speak-${Date.now()}`,
        icon: "💬",
        text: chatInput,
        detail: "Speaking to characters"
      };
      onChoice(speakChoice);
      
      // Also convert text to speech if supported
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
        
          {/* Chat History */}
          {chatHistory.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
              {message.type === 'user' ? (
                <div className="bg-blue-600 rounded-2xl rounded-br-md px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">{message.text}</p>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">{message.text}</p>
                </div>
              )}
            </div>
          ))}

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
            {/* Show loading indicator when processing */}
            {isProcessing && (
              <div className="w-full bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-4 h-4 border-2 border-blue-500 border-opacity-20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <span className="text-blue-300 text-sm">🎨 AI is generating your adventure...</span>
                    <div className="text-blue-400 text-xs opacity-70 mt-1">
                      Creating story and artwork
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {gameState.choices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                disabled={isProcessing}
                className={`choice-hover w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-3 text-left transition-opacity ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-10'
                }`}
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
          {/* Inventory Button */}
          <div className="absolute -top-14 right-3">
            <Button 
              onClick={onInventoryToggle}
              className="w-12 h-12 bg-white bg-opacity-15 rounded-full flex items-center justify-center text-white hover:bg-opacity-25 transition-all duration-200 border border-white border-opacity-20 shadow-lg"
            >
              🎒
            </Button>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Action/Speak Toggle */}
            <div className="flex bg-white bg-opacity-10 rounded-lg p-1">
              <button
                onClick={() => setActionType("action")}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  actionType === "action" 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
                title="Take action to move the story forward"
              >
                Action
              </button>
              <button
                onClick={() => setActionType("speak")}
                className={`px-3 py-1 text-xs rounded transition-all ${
                  actionType === "speak" 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
                title="Speak to characters in the story"
              >
                Speak
              </button>
            </div>
            
            {/* Input Field */}
            <div className="flex-1 relative">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={actionType === "action" ? "Take an action..." : "Say something..."}
                className="w-full h-10 bg-white bg-opacity-10 border border-white border-opacity-20 text-white text-sm placeholder:text-white placeholder:opacity-50 rounded-lg px-4 pr-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleChatSubmit();
                  }
                }}
              />
              
              {/* iOS-style Send Button */}
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim()}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  chatInput.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                title={actionType === "action" ? "Send action" : "Send message"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
            
            {/* Manual Speech Control */}
            <button
              onClick={() => {
                if (speaking) {
                  stop();
                } else {
                  const cleanNarration = gameState.narration
                    .replace(/[""]/g, '"')
                    .replace(/['']/g, "'")
                    .replace(/\.\.\./g, '... pause ...')
                    .replace(/!/g, '.')
                    .replace(/\?/g, '.');
                  speak(cleanNarration, {
                    rate: 0.8,
                    pitch: 1.0,
                    volume: 0.9
                  });
                }
              }}
              className="w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center"
              title="Play/Stop narration"
            >
              {speaking ? "⏸️" : "🔊"}
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
