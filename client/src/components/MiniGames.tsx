import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LockPickingGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function LockPickingGame({ onComplete, onCancel }: LockPickingGameProps) {
  const [position, setPosition] = useState(50);
  const [sweetSpot] = useState(Math.random() * 60 + 20); // Random sweet spot between 20-80
  const [timeLeft, setTimeLeft] = useState(10);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && isActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(false);
    }
  }, [timeLeft, isActive, onComplete]);

  const handleAttempt = () => {
    const distance = Math.abs(position - sweetSpot);
    if (distance < 8) {
      onComplete(true);
    } else {
      setTimeLeft(timeLeft - 2);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-80 border border-gray-700">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">🔓 Lock Picking</h3>
          <p className="text-gray-300 text-sm">Find the sweet spot and pick the lock!</p>
          <p className="text-red-400 text-sm">Time: {timeLeft}s</p>
        </div>

        <div className="mb-6">
          <div className="relative h-8 bg-gray-800 rounded-full mb-4">
            {/* Sweet spot indicator (hidden) */}
            <div 
              className="absolute top-0 h-full w-4 bg-green-500 opacity-30 rounded-full"
              style={{ left: `${sweetSpot - 2}%` }}
            />
            {/* Current position */}
            <div 
              className="absolute top-1 h-6 w-6 bg-blue-500 rounded-full border-2 border-white transition-all duration-200"
              style={{ left: `${position - 3}%` }}
            />
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="w-full"
            onMouseDown={() => setIsActive(true)}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleAttempt} className="flex-1">
            Pick Lock
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RuneSequenceGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function RuneSequenceGame({ onComplete, onCancel }: RuneSequenceGameProps) {
  const [sequence] = useState(() => {
    const runes = ['🔮', '⭐', '🌙', '⚡', '🔥'];
    return Array.from({ length: 4 }, () => runes[Math.floor(Math.random() * runes.length)]);
  });
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [showSequence, setShowSequence] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (showSequence) {
      const timer = setTimeout(() => setShowSequence(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSequence]);

  useEffect(() => {
    if (!showSequence && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(false);
    }
  }, [timeLeft, showSequence, onComplete]);

  useEffect(() => {
    if (playerSequence.length === sequence.length) {
      const isCorrect = playerSequence.every((rune, index) => rune === sequence[index]);
      onComplete(isCorrect);
    }
  }, [playerSequence, sequence, onComplete]);

  const handleRuneClick = (rune: string) => {
    if (showSequence) return;
    setPlayerSequence([...playerSequence, rune]);
  };

  const runes = ['🔮', '⭐', '🌙', '⚡', '🔥'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-80 border border-gray-700">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">✨ Rune Sequence</h3>
          <p className="text-gray-300 text-sm">
            {showSequence ? "Memorize the sequence!" : "Repeat the sequence"}
          </p>
          {!showSequence && <p className="text-red-400 text-sm">Time: {timeLeft}s</p>}
        </div>

        <div className="mb-6">
          {/* Display sequence */}
          <div className="flex justify-center gap-2 mb-4 h-12">
            {showSequence ? (
              sequence.map((rune, index) => (
                <div key={index} className="text-3xl animate-pulse">
                  {rune}
                </div>
              ))
            ) : (
              playerSequence.map((rune, index) => (
                <div key={index} className="text-3xl">
                  {rune}
                </div>
              ))
            )}
          </div>

          {/* Rune buttons */}
          {!showSequence && (
            <div className="grid grid-cols-5 gap-2">
              {runes.map((rune) => (
                <button
                  key={rune}
                  onClick={() => handleRuneClick(rune)}
                  className="text-2xl p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={playerSequence.length >= sequence.length}
                >
                  {rune}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!showSequence && (
            <Button 
              variant="outline" 
              onClick={() => setPlayerSequence([])}
              className="flex-1"
            >
              Reset
            </Button>
          )}
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}