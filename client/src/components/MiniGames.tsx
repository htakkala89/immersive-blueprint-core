import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LockPickingGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function LockPickingGame({ onComplete, onCancel }: LockPickingGameProps) {
  const [sweetSpot] = useState(Math.random() * 60 + 20);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(8);
  const [attempts, setAttempts] = useState(3);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(false);
    }
  }, [timeLeft, onComplete]);

  const attemptPick = () => {
    if (!isMoving) return;
    
    setIsMoving(false);
    const distance = Math.abs(currentPosition - sweetSpot);
    
    if (distance < 6) {
      onComplete(true);
    } else {
      setAttempts(prev => prev - 1);
      if (attempts <= 1) {
        onComplete(false);
      } else {
        setCurrentPosition(0);
      }
    }
  };

  useEffect(() => {
    if (isMoving) {
      const interval = setInterval(() => {
        setCurrentPosition(prev => (prev + 2) % 100);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isMoving]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isMoving) {
        e.preventDefault();
        attemptPick();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMoving, attemptPick]);

  const startPicking = () => {
    if (!isMoving) {
      setIsMoving(true);
      setCurrentPosition(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-80 border border-gray-700">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">🔓 Lock Picking</h3>
          <p className="text-gray-300 text-sm">Press SPACE when the pick reaches the sweet spot!</p>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-red-400">Time: {timeLeft}s</span>
            <span className="text-yellow-400">Attempts: {attempts}</span>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative h-8 bg-gray-800 rounded-full mb-4">
            {/* Sweet spot indicator */}
            <div 
              className="absolute top-0 h-full w-3 bg-green-500 rounded-full animate-pulse"
              style={{ left: `${sweetSpot - 1.5}%` }}
            />
            {/* Moving pick */}
            <div 
              className="absolute top-1 h-6 w-6 bg-blue-500 rounded-full border-2 border-white transition-all duration-75"
              style={{ left: `${currentPosition - 3}%` }}
            />
          </div>
          
          <div className="text-center text-gray-400 text-sm mb-4">
            {!isMoving ? "Click 'Start Picking' then press SPACE at the right moment" : "Press SPACE now!"}
          </div>
        </div>

        <div className="flex gap-3">
          {!isMoving ? (
            <Button onClick={startPicking} className="flex-1">
              Start Picking
            </Button>
          ) : (
            <Button onClick={attemptPick} className="flex-1 bg-green-600 hover:bg-green-700">
              SPACE - Pick Now!
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

interface DragonEncounterGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function DragonEncounterGame({ onComplete, onCancel }: DragonEncounterGameProps) {
  const [dragonHealth, setDragonHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(80);
  const [isAttacking, setIsAttacking] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>(['A fierce dragon blocks your path!']);
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(false);
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (dragonHealth <= 0) {
      setCombatLog(prev => [...prev, 'Victory! The dragon retreats in defeat!']);
      setTimeout(() => onComplete(true), 2000);
    } else if (playerHealth <= 0) {
      setCombatLog(prev => [...prev, 'Defeat! You retreat to recover...']);
      setTimeout(() => onComplete(false), 2000);
    }
  }, [dragonHealth, playerHealth, onComplete]);

  const attack = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    const playerDamage = Math.floor(Math.random() * 25) + 15;
    const dragonDamage = Math.floor(Math.random() * 20) + 10;
    
    setDragonHealth(prev => Math.max(0, prev - playerDamage));
    setCombatLog(prev => [...prev, `You deal ${playerDamage} damage!`]);
    
    setTimeout(() => {
      if (dragonHealth - playerDamage > 0) {
        setPlayerHealth(prev => Math.max(0, prev - dragonDamage));
        setCombatLog(prev => [...prev, `Dragon breathes fire for ${dragonDamage} damage!`]);
      }
      setIsAttacking(false);
    }, 1000);
  };

  const defend = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    const dragonDamage = Math.floor(Math.random() * 10) + 5;
    const healAmount = Math.floor(Math.random() * 15) + 10;
    
    setPlayerHealth(prev => Math.min(100, Math.max(0, prev - dragonDamage + healAmount)));
    setCombatLog(prev => [...prev, `You defend and recover ${healAmount - dragonDamage} health!`]);
    
    setTimeout(() => {
      setIsAttacking(false);
    }, 1000);
  };

  const cast = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    const spellSuccess = Math.random() > 0.3;
    if (spellSuccess) {
      const spellDamage = Math.floor(Math.random() * 35) + 20;
      setDragonHealth(prev => Math.max(0, prev - spellDamage));
      setCombatLog(prev => [...prev, `Lightning spell hits for ${spellDamage} damage!`]);
    } else {
      setCombatLog(prev => [...prev, 'Spell fizzles out harmlessly...']);
    }
    
    setTimeout(() => {
      if (spellSuccess && dragonHealth - 35 > 0) {
        const dragonDamage = Math.floor(Math.random() * 25) + 15;
        setPlayerHealth(prev => Math.max(0, prev - dragonDamage));
        setCombatLog(prev => [...prev, `Dragon retaliates for ${dragonDamage} damage!`]);
      }
      setIsAttacking(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-96 border border-gray-700">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">🐉 Dragon Encounter</h3>
          <p className="text-red-400 text-sm">Time: {timeLeft}s</p>
        </div>

        {/* Health bars */}
        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">Dragon</span>
              <span className="text-red-400">{dragonHealth}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${dragonHealth}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">You</span>
              <span className="text-green-400">{playerHealth}/100</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${playerHealth}%` }}
              />
            </div>
          </div>
        </div>

        {/* Combat log */}
        <div className="bg-gray-800 rounded-lg p-3 h-24 overflow-y-auto mb-4">
          {combatLog.slice(-3).map((log, index) => (
            <div key={index} className="text-gray-300 text-sm">{log}</div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button 
            onClick={attack} 
            disabled={isAttacking || dragonHealth <= 0 || playerHealth <= 0}
            className="bg-red-600 hover:bg-red-700"
          >
            ⚔️ Attack
          </Button>
          <Button 
            onClick={defend} 
            disabled={isAttacking || dragonHealth <= 0 || playerHealth <= 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            🛡️ Defend
          </Button>
          <Button 
            onClick={cast} 
            disabled={isAttacking || dragonHealth <= 0 || playerHealth <= 0}
            className="bg-purple-600 hover:bg-purple-700"
          >
            ⚡ Cast
          </Button>
        </div>

        <Button variant="outline" onClick={onCancel} className="w-full">
          Retreat
        </Button>
      </div>
    </div>
  );
}