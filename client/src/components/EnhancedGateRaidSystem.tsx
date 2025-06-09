import { useState, useEffect } from 'react';
import { X, Sword, Shield, Zap, Heart, Star, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface Enemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  position: { x: number; y: number };
  type: 'goblin' | 'orc' | 'guardian' | 'boss';
  abilities: string[];
}

interface Player {
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: { x: number; y: number };
  level: number;
}

interface Ally {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  position: { x: number; y: number };
  type: 'cha_hae_in';
}

interface BattleState {
  turn: 'player' | 'enemy' | 'ally';
  wave: number;
  totalWaves: number;
  battlePhase: 'positioning' | 'action' | 'animation' | 'victory' | 'defeat';
  selectedAction: string | null;
  targetPosition: { x: number; y: number } | null;
}

interface EnhancedGateRaidSystemProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any;
  setGameState: (state: any) => void;
}

export function EnhancedGateRaidSystem({ isOpen, onClose, gameState, setGameState }: EnhancedGateRaidSystemProps) {
  const [currentView, setCurrentView] = useState<'selection' | 'battle' | 'results'>('selection');
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [battleState, setBattleState] = useState<BattleState>({
    turn: 'player',
    wave: 1,
    totalWaves: 3,
    battlePhase: 'positioning',
    selectedAction: null,
    targetPosition: null
  });

  const [player, setPlayer] = useState<Player>({
    health: 800,
    maxHealth: 800,
    mana: 100,
    maxMana: 100,
    position: { x: 1, y: 4 },
    level: 146
  });

  const [ally, setAlly] = useState<Ally>({
    id: 'cha_hae_in',
    name: 'Cha Hae-In',
    health: 800,
    maxHealth: 800,
    position: { x: 1, y: 3 },
    type: 'cha_hae_in'
  });

  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'goblin1',
      name: 'Goblin Warrior',
      level: 45,
      health: 600,
      maxHealth: 600,
      attack: 120,
      defense: 80,
      position: { x: 6, y: 2 },
      type: 'goblin',
      abilities: ['Slash', 'Block']
    },
    {
      id: 'orc1',
      name: 'Orc Berserker',
      level: 48,
      health: 1200,
      maxHealth: 1200,
      attack: 150,
      defense: 100,
      position: { x: 6, y: 4 },
      type: 'orc',
      abilities: ['Rage', 'Heavy Strike']
    },
    {
      id: 'guardian1',
      name: 'Gate Guardian',
      level: 52,
      health: 3000,
      maxHealth: 3000,
      attack: 200,
      defense: 150,
      position: { x: 7, y: 3 },
      type: 'guardian',
      abilities: ['Magic Shield', 'Earthquake']
    }
  ]);

  const gates = [
    {
      id: 'c_rank_gate',
      name: 'C-Rank Gate',
      difficulty: 'C',
      energy: 30,
      rewards: { gold: 5000, exp: 2000 },
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'b_rank_gate',
      name: 'B-Rank Gate',
      difficulty: 'B',
      energy: 50,
      rewards: { gold: 10000, exp: 4000 },
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'a_rank_gate',
      name: 'A-Rank Gate',
      difficulty: 'A',
      energy: 70,
      rewards: { gold: 20000, exp: 8000 },
      color: 'from-purple-500 to-indigo-600'
    },
    {
      id: 's_rank_gate',
      name: 'S-Rank Gate',
      difficulty: 'S',
      energy: 100,
      rewards: { gold: 50000, exp: 15000 },
      color: 'from-orange-500 to-red-600'
    }
  ];

  const battleActions = [
    { id: 'attack', name: 'Shadow Strike', icon: Sword, cost: 0, color: 'bg-red-600' },
    { id: 'defend', name: 'Shadow Guard', icon: Shield, cost: 0, color: 'bg-blue-600' },
    { id: 'skill1', name: 'Dagger Rush', icon: Zap, cost: 20, color: 'bg-purple-600' },
    { id: 'skill2', name: 'Shadow Exchange', icon: ArrowUp, cost: 30, color: 'bg-indigo-600' },
    { id: 'heal', name: 'Recovery', icon: Heart, cost: 25, color: 'bg-green-600' }
  ];

  const renderBattleGrid = () => {
    const gridSize = 8;
    const cells = [];

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const isPlayerPosition = player.position.x === x && player.position.y === y;
        const isAllyPosition = ally.position.x === x && ally.position.y === y;
        const enemy = enemies.find(e => e.position.x === x && e.position.y === y);
        const isTargetPosition = battleState.targetPosition?.x === x && battleState.targetPosition?.y === y;

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-12 h-12 border border-slate-600/30 relative cursor-pointer transition-all duration-300
              ${isTargetPosition ? 'bg-yellow-500/40 border-yellow-400 shadow-lg shadow-yellow-400/30' : 'bg-slate-800/50'}
              ${(isPlayerPosition || isAllyPosition || enemy) ? 'hover:bg-slate-700/50' : 'hover:bg-slate-700/30'}
              hover:scale-105 hover:shadow-lg
            `}
            onClick={() => handleGridClick(x, y)}
          >
            {/* Grid position indicator */}
            <div className="absolute top-0 left-0 text-xs text-slate-500 p-0.5">
              {x},{y}
            </div>
            
            {isPlayerPosition && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center animate-pulse">
                  <span className="text-sm font-bold text-white">J</span>
                </div>
                {/* Player aura effect */}
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            {isAllyPosition && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                  <span className="text-sm font-bold text-white">H</span>
                </div>
                {/* Ally aura effect */}
                <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            {enemy && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 border-red-300 shadow-2xl flex items-center justify-center
                  ${enemy.type === 'goblin' ? 'bg-gradient-to-br from-green-600 to-green-800' : ''}
                  ${enemy.type === 'orc' ? 'bg-gradient-to-br from-orange-600 to-orange-800' : ''}
                  ${enemy.type === 'guardian' ? 'bg-gradient-to-br from-purple-600 to-purple-800' : ''}
                  ${enemy.health < enemy.maxHealth * 0.3 ? 'animate-bounce' : ''}
                `}>
                  <span className="text-sm font-bold text-white">
                    {enemy.type === 'goblin' ? 'G' : enemy.type === 'orc' ? 'O' : 'B'}
                  </span>
                </div>
                {/* Enemy threat indicator */}
                <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                
                {/* Health bar above enemy */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-slate-700 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-300"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Movement range indicator */}
            {battleState.selectedAction === 'move' && (
              <div className="absolute inset-0 bg-blue-300/10 border border-blue-300/30 rounded"></div>
            )}
            
            {/* Attack range indicator */}
            {battleState.selectedAction === 'attack' && isTargetPosition && (
              <div className="absolute inset-0">
                <div className="w-full h-full bg-red-500/30 border-2 border-red-400 rounded animate-pulse"></div>
                <div className="absolute inset-1 bg-red-400/20 rounded animate-ping"></div>
              </div>
            )}
          </div>
        );
      }
    }

    return (
      <div className="relative">
        <div className="grid grid-cols-8 gap-1 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-4 rounded-lg border border-slate-600 backdrop-blur-sm">
          {cells}
        </div>
        {/* Battle field overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-2 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-50"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-50 animation-delay-500"></div>
        </div>
      </div>
    );
  };

  const handleGridClick = (x: number, y: number) => {
    if (battleState.battlePhase === 'positioning' && battleState.turn === 'player') {
      if (battleState.selectedAction) {
        setBattleState(prev => ({
          ...prev,
          targetPosition: { x, y }
        }));
      }
    }
  };

  const handleActionSelect = (actionId: string) => {
    setBattleState(prev => ({
      ...prev,
      selectedAction: actionId,
      targetPosition: null
    }));
  };

  const executeAction = () => {
    if (!battleState.selectedAction || !battleState.targetPosition) return;

    setBattleState(prev => ({
      ...prev,
      battlePhase: 'animation',
      turn: 'enemy'
    }));

    // Simulate action execution
    setTimeout(() => {
      setBattleState(prev => ({
        ...prev,
        battlePhase: 'positioning',
        selectedAction: null,
        targetPosition: null
      }));
    }, 1500);
  };

  const enterGate = (gateId: string) => {
    setSelectedGate(gateId);
    setCurrentView('battle');
    setBattleState({
      turn: 'player',
      wave: 1,
      totalWaves: 3,
      battlePhase: 'positioning',
      selectedAction: null,
      targetPosition: null
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 border-b border-slate-600/30">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Gate Raid System
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <X size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentView === 'selection' && (
            <div className="space-y-6">
              {/* Gate Selection */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Available Gates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gates.map((gate) => (
                    <div
                      key={gate.id}
                      className={`
                        bg-gradient-to-br ${gate.color} p-6 rounded-xl cursor-pointer
                        hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
                        border border-white/20
                      `}
                      onClick={() => enterGate(gate.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white">{gate.name}</h4>
                          <p className="text-white/90">Difficulty: {gate.difficulty}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/80">Energy Cost</div>
                          <div className="text-lg font-bold text-white">{gate.energy}</div>
                        </div>
                      </div>
                      
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-sm text-white/90 mb-2">Rewards:</div>
                        <div className="flex justify-between text-white">
                          <span>Gold: {gate.rewards.gold.toLocaleString()}</span>
                          <span>EXP: {gate.rewards.exp.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Battle Status */}
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-4">Battle Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-slate-400">Wave</div>
                    <div className="text-xl font-bold text-white">1/3</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Energy</div>
                    <div className="text-xl font-bold text-blue-400">100/100</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Gold Earned</div>
                    <div className="text-xl font-bold text-yellow-400">0</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">EXP Earned</div>
                    <div className="text-xl font-bold text-green-400">0</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'battle' && (
            <div className="space-y-6">
              {/* Battle Grid */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-4">Battle Arena</h3>
                  {renderBattleGrid()}
                </div>

                {/* Battle Info Panel */}
                <div className="w-full lg:w-80 space-y-4">
                  {/* Turn Indicator */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Current Turn</div>
                      <div className={`text-xl font-bold ${
                        battleState.turn === 'player' ? 'text-blue-400' : 
                        battleState.turn === 'ally' ? 'text-pink-400' : 'text-red-400'
                      }`}>
                        {battleState.turn === 'player' ? 'Jin-Woo' : 
                         battleState.turn === 'ally' ? 'Cha Hae-In' : 'Enemies'}
                      </div>
                    </div>
                  </div>

                  {/* Player Stats */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                    <h4 className="font-semibold text-blue-400 mb-3">Jin-Woo</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Health</span>
                          <span>{player.health}/{player.maxHealth}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-red-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Mana</span>
                          <span>{player.mana}/{player.maxMana}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(player.mana / player.maxMana) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ally Stats */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                    <h4 className="font-semibold text-pink-400 mb-3">Cha Hae-In</h4>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Health</span>
                        <span>{ally.health}/{ally.maxHealth}</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(ally.health / ally.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enemy Stats */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                    <h4 className="font-semibold text-red-400 mb-3">Enemies</h4>
                    <div className="space-y-2">
                      {enemies.map((enemy) => (
                        <div key={enemy.id} className="text-sm">
                          <div className="flex justify-between">
                            <span>{enemy.name}</span>
                            <span>{enemy.health}/{enemy.maxHealth}</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-red-600 to-red-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              {battleState.turn === 'player' && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/30">
                  <h4 className="font-semibold text-white mb-4">Battle Actions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {battleActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionSelect(action.id)}
                        className={`
                          ${action.color} p-3 rounded-lg text-white font-medium
                          hover:opacity-80 transition-all duration-200 flex flex-col items-center space-y-2
                          ${battleState.selectedAction === action.id ? 'ring-2 ring-yellow-400' : ''}
                          ${action.cost > player.mana ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                        `}
                        disabled={action.cost > player.mana}
                      >
                        <action.icon size={24} />
                        <span className="text-sm">{action.name}</span>
                        {action.cost > 0 && (
                          <span className="text-xs opacity-75">MP: {action.cost}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {battleState.selectedAction && battleState.targetPosition && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={executeAction}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                      >
                        Execute Action
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Battle Controls */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentView('selection')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Retreat
                </button>
                <div className="text-white">
                  Wave {battleState.wave} / {battleState.totalWaves}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}