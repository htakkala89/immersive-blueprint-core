import type { GameState, Choice } from "@shared/schema";

interface GameUIProps {
  gameState: GameState;
  onChoice: (choice: Choice) => void;
}

export function GameUI({ gameState, onChoice }: GameUIProps) {
  return (
    <div className="flex-1 bg-[hsl(var(--space-darker))] bg-opacity-95 overflow-y-auto" style={{ height: 'calc(600px - 384px - 88px)' }}>
      <div className="p-4 space-y-5">
        
        {/* AI Game Master Message */}
        <div className="mystical-gradient rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-5 h-5 bg-gradient-to-br from-[hsl(var(--mystical-primary))] to-[hsl(var(--mystical-secondary))] rounded-full flex items-center justify-center text-xs">
              🎭
            </div>
            <span className="text-white text-xs opacity-70">AI Game Master</span>
          </div>
          <p className="text-white text-sm leading-relaxed">
            {gameState.narration}
          </p>
        </div>
        
        {/* Choice Buttons */}
        <div className="space-y-3">
          {gameState.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => onChoice(choice)}
              className="choice-hover w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-4 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-10 rounded-lg flex items-center justify-center text-lg">
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
  );
}
