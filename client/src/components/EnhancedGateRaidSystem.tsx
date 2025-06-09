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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center battle-glow">
                  <span className="text-sm font-bold text-white">J</span>
                </div>
                {/* Player aura effect */}
                <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            {isAllyPosition && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full border-2 border-white shadow-2xl flex items-center justify-center ally-support">
                  <span className="text-sm font-bold text-white">H</span>
                </div>
                {/* Ally aura effect */}
                <div className="absolute inset-0 bg-pink-400/20 rounded-full animate-ping"></div>
              </div>
            )}
            
            {enemy && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`
                  w-10 h-10 rounded-full border-2 border-red-300 shadow-2xl flex items-center justify-center enemy-threat
                  ${enemy.type === 'goblin' ? 'bg-gradient-to-br from-green-600 to-green-800' : ''}
                  ${enemy.type === 'orc' ? 'bg-gradient-to-br from-orange-600 to-orange-800' : ''}
                  ${enemy.type === 'guardian' ? 'bg-gradient-to-br from-purple-600 to-purple-800' : ''}
                  ${enemy.health < enemy.maxHealth * 0.3 ? 'animate-bounce' : ''}
                `}>
                  <span className="text-sm font-bold text-white">
                    {enemy.type === 'goblin' ? 'G' : enemy.type === 'orc' ? 'O' : 'B'}
                  </span>
                </div>
                
                {/* Health bar above enemy */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-slate-700 rounded-full border border-slate-600">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-500"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
                
                {/* Enemy level indicator */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs bg-slate-800 text-white px-1 rounded">
                  Lv.{enemy.level}
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
                <div className="w-full h-full bg-red-500/30 border-2 border-red-400 rounded target-highlight"></div>
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
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Star className="text-yellow-400" size={24} />
                  <span>Available Gates</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gates.map((gate, index) => (
                    <div
                      key={gate.id}
                      className={`
                        bg-gradient-to-br ${gate.color} p-6 rounded-xl cursor-pointer relative overflow-hidden
                        hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl
                        border border-white/20 group fade-in-scale
                      `}
                      onClick={() => enterGate(gate.id)}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Animated background patterns */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full translate-y-8 -translate-x-8 group-hover:scale-125 transition-transform duration-700"></div>
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                              <span>{gate.name}</span>
                              {gate.difficulty === 'S' && <Star className="text-yellow-300 animate-pulse" size={20} />}
                            </h4>
                            <p className="text-white/90 font-medium">Difficulty: {gate.difficulty}-Rank</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white/80">Energy Cost</div>
                            <div className="text-2xl font-bold text-white drop-shadow-lg">{gate.energy}</div>
                          </div>
                        </div>
                        
                        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-white/90 mb-3 font-semibold">Rewards:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-white">
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span>Gold:</span>
                              </span>
                              <span className="font-bold">{gate.rewards.gold.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-white">
                              <span className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span>EXP:</span>
                              </span>
                              <span className="font-bold">{gate.rewards.exp.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Difficulty indicator */}
                        <div className="absolute top-4 right-4">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${gate.difficulty === 'C' ? 'bg-green-500' : ''}
                            ${gate.difficulty === 'B' ? 'bg-blue-500' : ''}
                            ${gate.difficulty === 'A' ? 'bg-purple-500' : ''}
                            ${gate.difficulty === 'S' ? 'bg-red-500 animate-pulse' : ''}
                          `}>
                            {gate.difficulty}
                          </div>
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
                <div className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 shadow-lg">
                  <h4 className="font-bold text-white mb-6 text-lg flex items-center space-x-2">
                    <Sword className="text-blue-400" size={20} />
                    <span>Battle Actions</span>
                  </h4>
                  
                  {/* Mobile-optimized action grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {battleActions.map((action, index) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionSelect(action.id)}
                        className={`
                          ${action.color} p-4 rounded-xl text-white font-medium relative overflow-hidden group
                          transition-all duration-300 flex flex-col items-center space-y-3
                          ${battleState.selectedAction === action.id ? 'ring-3 ring-yellow-400 scale-105 shadow-lg shadow-yellow-400/30' : ''}
                          ${action.cost > player.mana ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-110 hover:shadow-xl active:scale-95'}
                        `}
                        disabled={action.cost > player.mana}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Action button background effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative z-10 flex flex-col items-center space-y-2">
                          <div className={`
                            p-3 rounded-full bg-white/20 backdrop-blur-sm
                            ${battleState.selectedAction === action.id ? 'action-pulse' : ''}
                          `}>
                            <action.icon size={28} />
                          </div>
                          <span className="text-sm font-bold text-center leading-tight">{action.name}</span>
                          {action.cost > 0 && (
                            <div className="flex items-center space-x-1 text-xs">
                              <Zap size={12} className="text-blue-300" />
                              <span className="text-blue-200">{action.cost}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Disabled overlay */}
                        {action.cost > player.mana && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-xs text-red-300 font-bold">No MP</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Action execution */}
                  {battleState.selectedAction && (
                    <div className="mt-6 space-y-4">
                      <div className="text-center text-sm text-slate-300">
                        {battleState.targetPosition ? 
                          'Target selected - Ready to execute!' : 
                          'Select a target on the battlefield'
                        }
                      </div>
                      
                      {battleState.targetPosition && (
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={executeAction}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 rounded-xl text-white font-bold 
                                     hover:from-purple-700 hover:to-blue-700 transition-all duration-300 
                                     shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
                                     flex items-center space-x-2"
                          >
                            <Zap size={20} />
                            <span>Execute Attack</span>
                          </button>
                          
                          <button
                            onClick={() => setBattleState(prev => ({ ...prev, selectedAction: null, targetPosition: null }))}
                            className="bg-slate-600 hover:bg-slate-500 px-6 py-4 rounded-xl text-white font-medium
                                     transition-all duration-300 flex items-center space-x-2"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Enemy turn indicator */}
              {battleState.turn === 'enemy' && (
                <div className="bg-gradient-to-br from-red-800/70 to-red-900/70 backdrop-blur-sm rounded-xl p-6 border border-red-600/30">
                  <div className="text-center">
                    <h4 className="font-bold text-red-300 mb-3 text-lg">Enemy Turn</h4>
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                      <span className="text-red-200">Enemies are planning their moves...</span>
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-ping animation-delay-300"></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Ally turn indicator */}
              {battleState.turn === 'ally' && (
                <div className="bg-gradient-to-br from-pink-800/70 to-pink-900/70 backdrop-blur-sm rounded-xl p-6 border border-pink-600/30">
                  <div className="text-center">
                    <h4 className="font-bold text-pink-300 mb-3 text-lg">Cha Hae-In's Turn</h4>
                    <div className="flex justify-center items-center space-x-2">
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping"></div>
                      <span className="text-pink-200">Cha Hae-In is preparing her strike...</span>
                      <div className="w-3 h-3 bg-pink-400 rounded-full animate-ping animation-delay-300"></div>
                    </div>
                  </div>
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

export default EnhancedGateRaidSystem;