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
  const [combatLog, setCombatLog] = useState<string[]>([
    'A mighty dragon emerges from the shadows!',
    '"Mortal... you dare enter my domain?"',
    'The dragon\'s eyes glow with ancient fury.'
  ]);
  const [timeLeft, setTimeLeft] = useState(30);

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
    
    const attackMessages = [
      `Your blade strikes true for ${playerDamage} damage!`,
      `A critical hit! You deal ${playerDamage} damage!`,
      `Your attack finds its mark, dealing ${playerDamage} damage!`
    ];
    
    const dragonResponses = [
      `"Insignificant mortal!" The dragon retaliates with ${dragonDamage} fire damage!`,
      `The dragon roars in pain and breathes fire for ${dragonDamage} damage!`,
      `"You will pay for that!" Dragon's claws rake you for ${dragonDamage} damage!`
    ];
    
    setDragonHealth(prev => Math.max(0, prev - playerDamage));
    setCombatLog(prev => [...prev, attackMessages[Math.floor(Math.random() * attackMessages.length)]]);
    
    setTimeout(() => {
      if (dragonHealth - playerDamage > 0) {
        setPlayerHealth(prev => Math.max(0, prev - dragonDamage));
        setCombatLog(prev => [...prev, dragonResponses[Math.floor(Math.random() * dragonResponses.length)]]);
      }
      setIsAttacking(false);
    }, 1000);
  };

  const defend = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    const dragonDamage = Math.floor(Math.random() * 10) + 5;
    const healAmount = Math.floor(Math.random() * 15) + 10;
    
    const defendMessages = [
      `You raise your shield, blocking most damage and recovering ${healAmount - dragonDamage} health!`,
      `Your defensive stance pays off! You recover ${healAmount - dragonDamage} health!`,
      `You channel healing energy while defending, gaining ${healAmount - dragonDamage} health!`
    ];
    
    setPlayerHealth(prev => Math.min(100, Math.max(0, prev - dragonDamage + healAmount)));
    setCombatLog(prev => [...prev, defendMessages[Math.floor(Math.random() * defendMessages.length)]]);
    
    setTimeout(() => {
      setCombatLog(prev => [...prev, '"Coward! Face me with courage!" the dragon taunts.']);
      setIsAttacking(false);
    }, 1000);
  };

  const cast = () => {
    if (isAttacking) return;
    setIsAttacking(true);
    
    const spellSuccess = Math.random() > 0.3;
    if (spellSuccess) {
      const spellDamage = Math.floor(Math.random() * 35) + 20;
      const spellMessages = [
        `"By the ancient words!" Lightning strikes for ${spellDamage} damage!`,
        `Your arcane power surges, dealing ${spellDamage} magical damage!`,
        `"Feel my wrath!" Flames engulf the dragon for ${spellDamage} damage!`
      ];
      setDragonHealth(prev => Math.max(0, prev - spellDamage));
      setCombatLog(prev => [...prev, spellMessages[Math.floor(Math.random() * spellMessages.length)]]);
    } else {
      const failMessages = [
        '"Your magic is weak!" The spell fails to manifest.',
        'The dragon\'s presence disrupts your concentration!',
        '"Pathetic mortal magic!" Your spell fizzles out.'
      ];
      setCombatLog(prev => [...prev, failMessages[Math.floor(Math.random() * failMessages.length)]]);
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

interface ShadowExtractGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function ShadowExtractGame({ onComplete, onCancel }: ShadowExtractGameProps) {
  const [shadows, setShadows] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      extracted: false,
      moving: true
    }))
  );
  const [timeLeft, setTimeLeft] = useState(12);
  const [extracted, setExtracted] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(extracted >= 6);
    }
  }, [timeLeft, extracted, onComplete]);

  useEffect(() => {
    if (extracted >= 6) {
      onComplete(true);
    }
  }, [extracted, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShadows(prev => prev.map(shadow => 
        shadow.moving && !shadow.extracted ? {
          ...shadow,
          x: Math.max(20, Math.min(380, shadow.x + (Math.random() - 0.5) * 40)),
          y: Math.max(20, Math.min(280, shadow.y + (Math.random() - 0.5) * 40))
        } : shadow
      ));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const extractShadow = (shadowId: number) => {
    if (isExtracting) return;
    setIsExtracting(true);
    
    setShadows(prev => prev.map(shadow => 
      shadow.id === shadowId ? { ...shadow, extracted: true, moving: false } : shadow
    ));
    setExtracted(prev => prev + 1);
    
    setTimeout(() => setIsExtracting(false), 300);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-[500px] border border-purple-500/50">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">👤 Shadow Extraction</h3>
          <p className="text-purple-300 text-sm">Extract 6 shadows before time runs out!</p>
          <p className="text-red-400 text-sm">Time: {timeLeft}s | Extracted: {extracted}/6</p>
        </div>

        <div className="relative bg-gray-800 rounded-lg h-80 overflow-hidden mb-4 border border-purple-500/30">
          {shadows.map((shadow) => (
            <button
              key={shadow.id}
              onClick={() => extractShadow(shadow.id)}
              disabled={shadow.extracted || isExtracting}
              className={`absolute w-8 h-8 rounded-full transition-all duration-300 ${
                shadow.extracted 
                  ? 'bg-purple-500 scale-110 shadow-purple-500/50 shadow-lg' 
                  : 'bg-gray-600 hover:bg-purple-400 hover:scale-125'
              }`}
              style={{ 
                left: `${shadow.x}px`, 
                top: `${shadow.y}px`,
                transform: shadow.extracted ? 'scale(0)' : 'scale(1)'
              }}
            >
              {shadow.extracted ? '✨' : '👤'}
            </button>
          ))}
          
          {isExtracting && (
            <div className="absolute inset-0 bg-purple-500/20 animate-pulse pointer-events-none" />
          )}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onComplete(false)}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Retreat
          </button>
        </div>
      </div>
    </div>
  );
}

interface DungeonNavigationGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function DungeonNavigationGame({ onComplete, onCancel }: DungeonNavigationGameProps) {
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [goalPos] = useState({ x: 4, y: 4 });
  const [obstacles] = useState(() => {
    const obs = new Set();
    for (let i = 0; i < 8; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * 5);
        y = Math.floor(Math.random() * 5);
      } while ((x === 0 && y === 0) || (x === 4 && y === 4) || obs.has(`${x},${y}`));
      obs.add(`${x},${y}`);
    }
    return obs;
  });
  const [moves, setMoves] = useState(0);
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
    if (playerPos.x === goalPos.x && playerPos.y === goalPos.y) {
      onComplete(true);
    }
  }, [playerPos, goalPos, onComplete]);

  const movePlayer = (dx: number, dy: number) => {
    const newX = Math.max(0, Math.min(4, playerPos.x + dx));
    const newY = Math.max(0, Math.min(4, playerPos.y + dy));
    
    if (!obstacles.has(`${newX},${newY}`)) {
      setPlayerPos({ x: newX, y: newY });
      setMoves(prev => prev + 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': movePlayer(0, -1); break;
        case 'ArrowDown': movePlayer(0, 1); break;
        case 'ArrowLeft': movePlayer(-1, 0); break;
        case 'ArrowRight': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playerPos]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-96 border border-blue-500/50">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">🗺️ Dungeon Navigation</h3>
          <p className="text-blue-300 text-sm">Reach the exit without hitting obstacles!</p>
          <p className="text-red-400 text-sm">Time: {timeLeft}s | Moves: {moves}</p>
        </div>

        <div className="grid grid-cols-5 gap-1 mb-4 bg-gray-800 p-4 rounded-lg">
          {Array.from({ length: 25 }, (_, i) => {
            const x = i % 5;
            const y = Math.floor(i / 5);
            const isPlayer = playerPos.x === x && playerPos.y === y;
            const isGoal = goalPos.x === x && goalPos.y === y;
            const isObstacle = obstacles.has(`${x},${y}`);
            
            return (
              <div
                key={i}
                className={`w-12 h-12 rounded border-2 flex items-center justify-center text-lg font-bold ${
                  isPlayer ? 'bg-green-500 border-green-300' :
                  isGoal ? 'bg-yellow-500 border-yellow-300' :
                  isObstacle ? 'bg-red-500 border-red-300' :
                  'bg-gray-700 border-gray-600'
                }`}
              >
                {isPlayer ? '🤺' : isGoal ? '🚪' : isObstacle ? '🗿' : ''}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div></div>
          <button 
            onClick={() => movePlayer(0, -1)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            ⬆️
          </button>
          <div></div>
          <button 
            onClick={() => movePlayer(-1, 0)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            ⬅️
          </button>
          <div></div>
          <button 
            onClick={() => movePlayer(1, 0)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            ➡️
          </button>
          <div></div>
          <button 
            onClick={() => movePlayer(0, 1)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            ⬇️
          </button>
          <div></div>
        </div>

        <p className="text-gray-400 text-xs text-center mb-3">Use arrow keys or buttons to move</p>

        <button 
          onClick={() => onComplete(false)}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Give Up
        </button>
      </div>
    </div>
  );
}

interface ReflexTestGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function ReflexTestGame({ onComplete, onCancel }: ReflexTestGameProps) {
  const [stage, setStage] = useState<'waiting' | 'ready' | 'go' | 'success' | 'failed'>('waiting');
  const [countdown, setCountdown] = useState(3);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);

  useEffect(() => {
    if (stage === 'ready' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'ready' && countdown === 0) {
      const delay = Math.random() * 3000 + 1000;
      const timer = setTimeout(() => {
        setStage('go');
        setStartTime(Date.now());
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [stage, countdown]);

  const startTest = () => {
    setStage('ready');
    setCountdown(3);
    setReactionTime(null);
  };

  const handleClick = () => {
    if (stage === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setAttempts(prev => prev + 1);
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      
      if (time < 300) {
        setStage('success');
        setTimeout(() => onComplete(true), 2000);
      } else if (attempts >= 2) {
        setStage('failed');
        setTimeout(() => onComplete(false), 2000);
      } else {
        setStage('waiting');
      }
    } else if (stage === 'ready') {
      setStage('failed');
      setTimeout(() => onComplete(false), 1500);
    }
  };

  const getMessage = () => {
    switch (stage) {
      case 'waiting': return 'Click "Start Test" when ready';
      case 'ready': return `Get ready... ${countdown || 'Wait for it...'}`;
      case 'go': return 'CLICK NOW!';
      case 'success': return `Excellent! ${reactionTime}ms reaction time!`;
      case 'failed': return reactionTime ? `Too slow: ${reactionTime}ms. Need < 300ms` : 'Too early! Wait for "CLICK NOW!"';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-96 border border-green-500/50">
        <div className="text-center mb-6">
          <h3 className="text-white text-lg font-semibold mb-2">⚡ Reflex Test</h3>
          <p className="text-green-300 text-sm">React in under 300ms to succeed!</p>
          <p className="text-gray-400 text-xs">Attempts: {attempts}/3</p>
          {bestTime && <p className="text-yellow-400 text-sm">Best: {bestTime}ms</p>}
        </div>

        <div 
          className={`relative h-48 rounded-lg mb-4 cursor-pointer transition-all duration-200 flex items-center justify-center ${
            stage === 'go' ? 'bg-green-500' : 
            stage === 'ready' ? 'bg-yellow-500' :
            stage === 'success' ? 'bg-blue-500' :
            stage === 'failed' ? 'bg-red-500' :
            'bg-gray-700'
          }`}
          onClick={handleClick}
        >
          <div className="text-center">
            <p className="text-white text-lg font-bold mb-2">{getMessage()}</p>
            {reactionTime && (
              <p className="text-white text-2xl font-bold">{reactionTime}ms</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          {stage === 'waiting' && (
            <button 
              onClick={startTest}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Start Test
            </button>
          )}
          <button 
            onClick={() => onComplete(false)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface MagicCircleGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function MagicCircleGame({ onComplete, onCancel }: MagicCircleGameProps) {
  const [circles, setCircles] = useState(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      angle: (i * 60) * Math.PI / 180,
      rotation: 0,
      active: false,
      completed: false
    }))
  );
  const [timeLeft, setTimeLeft] = useState(15);
  const [activationOrder, setActivationOrder] = useState<number[]>([]);
  const [targetOrder] = useState(() => {
    const order = [0, 1, 2, 3, 4, 5];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });
  const [showPattern, setShowPattern] = useState(true);

  useEffect(() => {
    if (showPattern) {
      const timer = setTimeout(() => setShowPattern(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showPattern]);

  useEffect(() => {
    if (!showPattern && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      onComplete(false);
    }
  }, [timeLeft, showPattern, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCircles(prev => prev.map(circle => ({
        ...circle,
        rotation: (circle.rotation + 2) % 360
      })));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activationOrder.length === targetOrder.length) {
      const isCorrect = activationOrder.every((id, index) => id === targetOrder[index]);
      onComplete(isCorrect);
    }
  }, [activationOrder, targetOrder, onComplete]);

  const activateCircle = (circleId: number) => {
    if (showPattern || activationOrder.includes(circleId)) return;
    
    setActivationOrder(prev => [...prev, circleId]);
    setCircles(prev => prev.map(circle => 
      circle.id === circleId ? { ...circle, active: true, completed: true } : circle
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-[500px] border border-cyan-500/50">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">🔮 Magic Circle Ritual</h3>
          <p className="text-cyan-300 text-sm">
            {showPattern ? "Memorize the activation sequence!" : "Activate circles in the correct order"}
          </p>
          {!showPattern && <p className="text-red-400 text-sm">Time: {timeLeft}s</p>}
        </div>

        <div className="relative w-80 h-80 mx-auto mb-4 bg-gray-800 rounded-full border border-cyan-500/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-500">
              <span className="text-cyan-300 text-2xl">✨</span>
            </div>
          </div>

          {circles.map((circle) => {
            const x = 120 + Math.cos(circle.angle) * 100;
            const y = 120 + Math.sin(circle.angle) * 100;
            const isTarget = showPattern && targetOrder[activationOrder.length] === circle.id;
            const showOrder = showPattern && targetOrder.indexOf(circle.id) + 1;
            
            return (
              <button
                key={circle.id}
                onClick={() => activateCircle(circle.id)}
                disabled={showPattern || circle.completed}
                className={`absolute w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                  circle.completed 
                    ? 'bg-cyan-500 border-cyan-300 scale-110' 
                    : isTarget
                    ? 'bg-yellow-500/50 border-yellow-300 animate-pulse'
                    : 'bg-gray-700 border-gray-500 hover:bg-cyan-400/30 hover:border-cyan-400'
                }`}
                style={{ 
                  left: `${x}px`, 
                  top: `${y}px`,
                  transform: `rotate(${circle.rotation}deg) ${circle.completed ? 'scale(1.1)' : 'scale(1)'}`
                }}
              >
                <div className="text-white font-bold">
                  {showPattern && showOrder ? showOrder : circle.completed ? '✓' : '◯'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">
            Progress: {activationOrder.length}/{targetOrder.length}
          </p>
        </div>

        <button 
          onClick={() => onComplete(false)}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Abandon Ritual
        </button>
      </div>
    </div>
  );
}

interface BossRaidGameProps {
  onComplete: (success: boolean) => void;
  onCancel: () => void;
}

export function BossRaidGame({ onComplete, onCancel }: BossRaidGameProps) {
  const [bossHealth, setBossHealth] = useState(300);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMana, setPlayerMana] = useState(50);
  const [bossPhase, setBossPhase] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatLog, setCombatLog] = useState<string[]>(['The Ancient Guardian awakens...']);
  const [timeLeft, setTimeLeft] = useState(45);
  const [specialCooldown, setSpecialCooldown] = useState(0);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete(false);
    }
  }, [timeLeft, onComplete]);

  useEffect(() => {
    if (bossHealth <= 0) {
      setCombatLog(prev => [...prev, '🏆 VICTORY! The Ancient Guardian falls!']);
      setTimeout(() => onComplete(true), 2000);
    } else if (playerHealth <= 0) {
      setCombatLog(prev => [...prev, '💀 DEFEAT! You have been overwhelmed...']);
      setTimeout(() => onComplete(false), 2000);
    }
  }, [bossHealth, playerHealth, onComplete]);

  useEffect(() => {
    const newPhase = bossHealth > 200 ? 1 : bossHealth > 100 ? 2 : 3;
    if (newPhase !== bossPhase) {
      setBossPhase(newPhase);
      const phaseMessages = {
        2: 'The Guardian enters Phase 2! Its attacks intensify!',
        3: 'FINAL PHASE! The Guardian unleashes its full power!'
      };
      setCombatLog(prev => [...prev, phaseMessages[newPhase as keyof typeof phaseMessages]]);
    }
  }, [bossHealth, bossPhase]);

  useEffect(() => {
    if (!isPlayerTurn && bossHealth > 0 && playerHealth > 0) {
      const timer = setTimeout(() => {
        bossAttack();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, bossHealth, playerHealth]);

  useEffect(() => {
    if (specialCooldown > 0) {
      const timer = setTimeout(() => setSpecialCooldown(specialCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [specialCooldown]);

  const bossAttack = () => {
    const attackType = Math.random();
    let damage = 0;
    let message = '';

    if (bossPhase === 3 && attackType < 0.4) {
      damage = Math.floor(Math.random() * 35) + 25;
      message = `💥 DEVASTATION BLAST! ${damage} damage!`;
    } else if (bossPhase >= 2 && attackType < 0.3) {
      damage = Math.floor(Math.random() * 25) + 20;
      message = `🌪️ Whirlwind Attack! ${damage} damage!`;
    } else {
      damage = Math.floor(Math.random() * 20) + 10;
      message = `⚔️ Basic Attack! ${damage} damage!`;
    }

    setPlayerHealth(prev => Math.max(0, prev - damage));
    setCombatLog(prev => [...prev, message]);
    setIsPlayerTurn(true);
  };

  const playerAttack = () => {
    const damage = Math.floor(Math.random() * 25) + 15;
    setBossHealth(prev => Math.max(0, prev - damage));
    setCombatLog(prev => [...prev, `⚔️ Your attack deals ${damage} damage!`]);
    setPlayerMana(prev => Math.min(50, prev + 5));
    setIsPlayerTurn(false);
  };

  const healSpell = () => {
    if (playerMana < 15) return;
    const healing = Math.floor(Math.random() * 25) + 20;
    setPlayerHealth(prev => Math.min(100, prev + healing));
    setPlayerMana(prev => prev - 15);
    setCombatLog(prev => [...prev, `🌟 Healing Light restores ${healing} HP!`]);
    setIsPlayerTurn(false);
  };

  const specialAttack = () => {
    if (playerMana < 25 || specialCooldown > 0) return;
    const damage = Math.floor(Math.random() * 45) + 35;
    setBossHealth(prev => Math.max(0, prev - damage));
    setPlayerMana(prev => prev - 25);
    setSpecialCooldown(3);
    setCombatLog(prev => [...prev, `⚡ SHADOW STRIKE! Critical hit for ${damage} damage!`]);
    setIsPlayerTurn(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-[600px] border border-red-500/50">
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold mb-2">⚔️ Boss Raid: Ancient Guardian</h3>
          <p className="text-red-400 text-sm">Time: {timeLeft}s | Phase: {bossPhase}/3</p>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white">Ancient Guardian</span>
              <span className="text-red-400">{bossHealth}/300</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  bossPhase === 3 ? 'bg-red-600' : bossPhase === 2 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(bossHealth / 300) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">Health</span>
                <span className="text-green-400">{playerHealth}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white">Mana</span>
                <span className="text-blue-400">{playerMana}/50</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(playerMana / 50) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3 h-32 overflow-y-auto mb-4 border border-gray-600">
          {combatLog.slice(-5).map((log, index) => (
            <div key={index} className="text-gray-300 text-sm mb-1">{log}</div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <button 
            onClick={playerAttack} 
            disabled={!isPlayerTurn || bossHealth <= 0 || playerHealth <= 0}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ⚔️ Attack
          </button>
          <button 
            onClick={healSpell} 
            disabled={!isPlayerTurn || playerMana < 15 || bossHealth <= 0 || playerHealth <= 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            🌟 Heal (15 MP)
          </button>
          <button 
            onClick={specialAttack} 
            disabled={!isPlayerTurn || playerMana < 25 || specialCooldown > 0 || bossHealth <= 0 || playerHealth <= 0}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            ⚡ Special {specialCooldown > 0 ? `(${specialCooldown}s)` : '(25 MP)'}
          </button>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-sm">
            {isPlayerTurn ? "Your turn - Choose an action" : "Boss is attacking..."}
          </p>
        </div>

        <button 
          onClick={() => onComplete(false)}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Retreat from Battle
        </button>
      </div>
    </div>
  );
}