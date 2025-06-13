import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Heart, Shield, Zap, Sword, Package } from 'lucide-react';

interface ShadowSoldier {
  id: string;
  name: string;
  type: 'ultimate' | 'marshal' | 'elite';
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  special: string;
  available: boolean;
}

interface RaidEnemy {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  type: 'goblin' | 'orc' | 'demon' | 'boss';
  weakPoint?: string;
}

interface HealingItem {
  id: string;
  name: string;
  healAmount: number;
  target: 'player' | 'cha' | 'both';
  icon: string;
  count: number;
  description: string;
}

interface RaidState {
  phase: 'preparation' | 'battle' | 'victory' | 'defeat';
  currentWave: number;
  totalWaves: number;
  enemies: RaidEnemy[];
  playerHealth: number;
  playerMaxHealth: number;
  chaHaeInHealth: number;
  chaHaeInMaxHealth: number;
  energy: number;
  maxEnergy: number;
  goldEarned: number;
  expEarned: number;
  battleLog: string[];
  shadowSoldiers: ShadowSoldier[];
  activeEffects: string[];
  healingItems: HealingItem[];
  animatingDamage: { id: string; damage: number; x: number; y: number }[];
}

interface RaidSystemProps {
  isVisible: boolean;
  onClose: () => void;
  onVictory: (rewards: { gold: number; exp: number; affection: number; skillPoints: number; statPoints: number }) => void;
  playerLevel: number;
  affectionLevel: number;
}

export function RaidSystem({ isVisible, onClose, onVictory, playerLevel, affectionLevel }: RaidSystemProps) {
  const [raidState, setRaidState] = useState<RaidState | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [animationPhase, setAnimationPhase] = useState<string>('');
  const [combatText, setCombatText] = useState<string[]>([]);
  const [damageAnimations, setDamageAnimations] = useState<any[]>([]);
  const battleLogRef = useRef<HTMLDivElement>(null);

  // Initialize healing items
  const initialHealingItems: HealingItem[] = [
    {
      id: 'health_potion',
      name: 'Health Potion',
      healAmount: 200,
      target: 'player',
      icon: '🧪',
      count: 3,
      description: 'Restores 200 HP to Jin-Woo'
    },
    {
      id: 'mana_crystal',
      name: 'Mana Crystal', 
      healAmount: 150,
      target: 'cha',
      icon: '💎',
      count: 2,
      description: 'Restores 150 HP to Cha Hae-In'
    },
    {
      id: 'elixir',
      name: 'Divine Elixir',
      healAmount: 300,
      target: 'both',
      icon: '✨',
      count: 1,
      description: 'Restores 300 HP to both hunters'
    }
  ];

  const shadowSoldiers: ShadowSoldier[] = [
    {
      id: 'beru',
      name: 'Beru',
      type: 'ultimate',
      health: 1000,
      maxHealth: 1000,
      attack: 250,
      defense: 200,
      special: 'Paralysis Sting',
      available: playerLevel >= 50
    },
    {
      id: 'bellion',
      name: 'Bellion',
      type: 'ultimate',
      health: 1200,
      maxHealth: 1200,
      attack: 300,
      defense: 250,
      special: 'Grand Marshal Strike',
      available: playerLevel >= 60
    },
    {
      id: 'igris',
      name: 'Igris',
      type: 'marshal',
      health: 800,
      maxHealth: 800,
      attack: 200,
      defense: 180,
      special: 'Blood Red Commander',
      available: playerLevel >= 30
    },
    {
      id: 'tank',
      name: 'Tank',
      type: 'elite',
      health: 600,
      maxHealth: 600,
      attack: 150,
      defense: 300,
      special: 'Shield Wall',
      available: playerLevel >= 20
    }
  ];

  const initializeRaid = (difficulty: 'easy' | 'medium' | 'hard' | 'nightmare') => {
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      nightmare: 3
    }[difficulty];

    const baseEnemies: RaidEnemy[] = [
      {
        id: 'goblin1',
        name: 'Goblin Warrior',
        level: Math.floor(playerLevel * 0.8),
        health: Math.floor(200 * difficultyMultiplier),
        maxHealth: Math.floor(200 * difficultyMultiplier),
        attack: Math.floor(50 * difficultyMultiplier),
        type: 'goblin',
        weakPoint: 'head'
      },
      {
        id: 'orc1',
        name: 'Orc Berserker',
        level: Math.floor(playerLevel * 0.9),
        health: Math.floor(400 * difficultyMultiplier),
        maxHealth: Math.floor(400 * difficultyMultiplier),
        attack: Math.floor(80 * difficultyMultiplier),
        type: 'orc',
        weakPoint: 'legs'
      }
    ];

    if (difficulty === 'hard' || difficulty === 'nightmare') {
      baseEnemies.push({
        id: 'boss1',
        name: 'Gate Guardian',
        level: playerLevel,
        health: Math.floor(1000 * difficultyMultiplier),
        maxHealth: Math.floor(1000 * difficultyMultiplier),
        attack: Math.floor(120 * difficultyMultiplier),
        type: 'boss',
        weakPoint: 'core'
      });
    }

    setRaidState({
      phase: 'preparation',
      currentWave: 1,
      totalWaves: 3,
      enemies: baseEnemies,
      playerHealth: 1000,
      playerMaxHealth: 1000,
      chaHaeInHealth: 800,
      chaHaeInMaxHealth: 800,
      energy: 100,
      maxEnergy: 100,
      goldEarned: 0,
      expEarned: 0,
      battleLog: ['Gate detected! Preparing for battle...'],
      shadowSoldiers: shadowSoldiers.filter(s => s.available),
      activeEffects: [],
      healingItems: [...initialHealingItems],
      animatingDamage: []
    });
  };

  // Use healing item function
  const useHealingItem = (itemId: string) => {
    if (!raidState) return;
    
    const item = raidState.healingItems.find(i => i.id === itemId);
    if (!item || item.count <= 0) return;
    
    let updatedState = { ...raidState };
    let newBattleLog = [...raidState.battleLog];
    
    // Apply healing
    if (item.target === 'player' || item.target === 'both') {
      const healAmount = Math.min(item.healAmount, updatedState.playerMaxHealth - updatedState.playerHealth);
      updatedState.playerHealth += healAmount;
      newBattleLog.push(`Jin-Woo restored ${healAmount} HP with ${item.name}!`);
      
      // Add healing animation
      setDamageAnimations(prev => [...prev, {
        id: Date.now().toString(),
        value: `+${healAmount}`,
        x: Math.random() * 200 + 100,
        y: Math.random() * 100 + 200,
        color: 'text-green-400',
        type: 'heal'
      }]);
    }
    
    if (item.target === 'cha' || item.target === 'both') {
      const healAmount = Math.min(item.healAmount, updatedState.chaHaeInMaxHealth - updatedState.chaHaeInHealth);
      updatedState.chaHaeInHealth += healAmount;
      newBattleLog.push(`Cha Hae-In restored ${healAmount} HP with ${item.name}!`);
      
      // Add healing animation
      setDamageAnimations(prev => [...prev, {
        id: Date.now().toString() + '_cha',
        value: `+${healAmount}`,
        x: Math.random() * 200 + 400,
        y: Math.random() * 100 + 200,
        color: 'text-blue-400',
        type: 'heal'
      }]);
    }
    
    // Reduce item count
    updatedState.healingItems = updatedState.healingItems.map(i => 
      i.id === itemId ? { ...i, count: i.count - 1 } : i
    );
    
    updatedState.battleLog = newBattleLog;
    setRaidState(updatedState);
    
    // Clear animation after delay
    setTimeout(() => {
      setDamageAnimations(prev => prev.filter(anim => 
        !anim.id.includes(Date.now().toString())
      ));
    }, 2000);
  };

  const executeAction = async (action: string, target?: string) => {
    if (!raidState) return;

    setAnimationPhase(action);
    let newBattleLog = [...raidState.battleLog];
    let newCombatText = [...combatText];
    let updatedState = { ...raidState };

    switch (action) {
      case 'dagger_strike':
        const damage = Math.floor(150 + Math.random() * 100);
        newBattleLog.push(`Jin-Woo strikes with his Demon King's Daggers for ${damage} damage!`);
        newCombatText.push(`-${damage} DMG`);
        
        // Add damage animation
        setDamageAnimations(prev => [...prev, {
          id: Date.now().toString(),
          value: `-${damage}`,
          x: Math.random() * 200 + 600,
          y: Math.random() * 100 + 150,
          color: 'text-red-400',
          type: 'damage'
        }]);
        
        // Apply damage to first enemy
        if (updatedState.enemies.length > 0) {
          updatedState.enemies[0].health -= damage;
          if (updatedState.enemies[0].health <= 0) {
            newBattleLog.push(`${updatedState.enemies[0].name} has been defeated!`);
            updatedState.enemies.shift();
            updatedState.goldEarned += 50;
            updatedState.expEarned += 25;
          }
        }
        break;

      case 'shadow_exchange':
        newBattleLog.push('Jin-Woo uses Shadow Exchange to reposition tactically!');
        updatedState.activeEffects.push('evasion_boost');
        break;

      case 'summon_beru':
        if (updatedState.shadowSoldiers.find(s => s.id === 'beru')) {
          newBattleLog.push('Beru emerges from the shadows with deadly precision!');
          const beruDamage = Math.floor(250 + Math.random() * 150);
          newBattleLog.push(`Beru's Paralysis Sting deals ${beruDamage} damage and applies paralysis!`);
          if (updatedState.enemies.length > 0) {
            updatedState.enemies[0].health -= beruDamage;
          }
        }
        break;

      case 'heal_cha':
        const healAmount = Math.floor(200 + Math.random() * 100);
        updatedState.chaHaeInHealth = Math.min(
          updatedState.chaHaeInMaxHealth, 
          updatedState.chaHaeInHealth + healAmount
        );
        newBattleLog.push(`Jin-Woo heals Cha Hae-In for ${healAmount} HP!`);
        updatedState.energy -= 20;
        break;

      case 'cha_sword_dance':
        if (affectionLevel >= 70) {
          const chaDamage = Math.floor(300 + Math.random() * 200);
          newBattleLog.push(`Cha Hae-In's elegant sword dance devastates enemies for ${chaDamage} damage!`);
          updatedState.enemies.forEach(enemy => {
            enemy.health -= Math.floor(chaDamage * 0.7);
          });
        }
        break;
    }

    // Enemy turn
    if (updatedState.enemies.length > 0 && updatedState.phase === 'battle') {
      setTimeout(() => {
        updatedState.enemies.forEach(enemy => {
          if (enemy.health > 0) {
            const enemyDamage = Math.floor(enemy.attack * (0.8 + Math.random() * 0.4));
            const target = Math.random() > 0.5 ? 'player' : 'cha';
            
            if (target === 'player') {
              updatedState.playerHealth -= enemyDamage;
              newBattleLog.push(`${enemy.name} attacks Jin-Woo for ${enemyDamage} damage!`);
            } else if (updatedState.chaHaeInHealth > 0) {
              updatedState.chaHaeInHealth -= enemyDamage;
              newBattleLog.push(`${enemy.name} attacks Cha Hae-In for ${enemyDamage} damage!`);
            }
          }
        });
      }, 1000);
    }

    // Check victory/defeat conditions
    if (updatedState.enemies.length === 0) {
      updatedState.phase = 'victory';
      newBattleLog.push('Victory! The gate has been cleared!');
      setTimeout(() => {
        const baseSkillPoints = Math.floor(updatedState.goldEarned / 200) + 1;
        const baseStatPoints = Math.floor(updatedState.goldEarned / 150) + 1;
        onVictory({
          gold: updatedState.goldEarned,
          exp: updatedState.expEarned,
          affection: Math.floor(updatedState.goldEarned / 100),
          skillPoints: baseSkillPoints,
          statPoints: baseStatPoints
        });
      }, 2000);
    } else if (updatedState.playerHealth <= 0) {
      updatedState.phase = 'defeat';
      newBattleLog.push('Defeat... Jin-Woo has fallen in battle.');
    }

    updatedState.battleLog = newBattleLog;
    setRaidState(updatedState);
    setCombatText(newCombatText);

    // Clear combat text after animation
    setTimeout(() => {
      setCombatText([]);
      setAnimationPhase('');
    }, 2000);
  };

  const startBattle = () => {
    if (raidState) {
      setRaidState({ ...raidState, phase: 'battle' });
    }
  };

  useEffect(() => {
    if (battleLogRef.current) {
      battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight;
    }
  }, [raidState?.battleLog]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="w-full max-w-6xl h-full bg-gradient-to-b from-gray-900 to-black p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-400">Gate Raid System</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {!raidState ? (
          <div className="text-center space-y-6">
            <div className="text-xl text-gray-300 mb-8">
              Select a gate difficulty to begin the raid
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'easy', name: 'E-Rank Gate', color: 'bg-green-600', reward: '50-100 Gold' },
                { id: 'medium', name: 'D-Rank Gate', color: 'bg-yellow-600', reward: '100-200 Gold' },
                { id: 'hard', name: 'C-Rank Gate', color: 'bg-red-600', reward: '200-400 Gold' },
                { id: 'nightmare', name: 'B-Rank Gate', color: 'bg-purple-600', reward: '400-800 Gold' }
              ].map(gate => (
                <button
                  key={gate.id}
                  onClick={() => initializeRaid(gate.id as any)}
                  className={`${gate.color} hover:opacity-80 text-white p-6 rounded-lg transition-all transform hover:scale-105`}
                >
                  <div className="text-xl font-bold">{gate.name}</div>
                  <div className="text-sm mt-2">{gate.reward}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Battle Arena */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                
                {/* Combat Effects */}
                {animationPhase && (
                  <div className={`absolute inset-0 flex items-center justify-center text-6xl animate-pulse ${
                    animationPhase.includes('dagger') ? 'text-red-500' :
                    animationPhase.includes('shadow') ? 'text-purple-500' :
                    animationPhase.includes('heal') ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {animationPhase.includes('dagger') ? '⚔️' :
                     animationPhase.includes('shadow') ? '👥' :
                     animationPhase.includes('heal') ? '💚' : '✨'}
                  </div>
                )}

                {/* Floating Damage Numbers */}
                <AnimatePresence>
                  {damageAnimations.map((anim) => (
                    <motion.div
                      key={anim.id}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -50, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                      className={`absolute font-bold text-2xl pointer-events-none ${anim.color}`}
                      style={{ left: anim.x, top: anim.y }}
                    >
                      {anim.value}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Combat Text */}
                <div className="absolute top-4 right-4 space-y-2">
                  {combatText.map((text, index) => (
                    <div key={index} className="text-red-400 font-bold text-xl animate-bounce">
                      {text}
                    </div>
                  ))}
                </div>

                {/* Player Status */}
                <div className="absolute bottom-4 left-4 bg-black/70 rounded p-3">
                  <div className="text-purple-400 font-bold">Jin-Woo</div>
                  <Progress value={(raidState.playerHealth / raidState.playerMaxHealth) * 100} className="w-32 mb-1" />
                  <div className="text-sm text-gray-300">{raidState.playerHealth}/{raidState.playerMaxHealth} HP</div>
                </div>

                {/* Cha Hae-In Status */}
                <div className="absolute bottom-4 left-48 bg-black/70 rounded p-3">
                  <div className="text-pink-400 font-bold">Cha Hae-In</div>
                  <Progress value={(raidState.chaHaeInHealth / raidState.chaHaeInMaxHealth) * 100} className="w-32 mb-1" />
                  <div className="text-sm text-gray-300">{raidState.chaHaeInHealth}/{raidState.chaHaeInMaxHealth} HP</div>
                </div>

                {/* Enemies */}
                <div className="absolute top-4 left-4 space-y-2">
                  {raidState.enemies.map((enemy, index) => (
                    <div key={enemy.id} className="bg-red-900/70 rounded p-2">
                      <div className="text-red-400 font-bold text-sm">{enemy.name}</div>
                      <Progress value={(enemy.health / enemy.maxHealth) * 100} className="w-24" />
                      <div className="text-xs text-gray-300">{enemy.health}/{enemy.maxHealth}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {raidState.phase === 'preparation' && (
                <div className="text-center">
                  <Button
                    onClick={startBattle}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                  >
                    Enter the Gate
                  </Button>
                </div>
              )}

              {raidState.phase === 'battle' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Button
                    onClick={() => executeAction('dagger_strike')}
                    className="bg-red-600 hover:bg-red-700 text-white p-3"
                    disabled={raidState.energy < 10}
                  >
                    <div className="text-center">
                      <div>⚔️</div>
                      <div className="text-xs">Dagger Strike</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => executeAction('shadow_exchange')}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-3"
                    disabled={raidState.energy < 20}
                  >
                    <div className="text-center">
                      <div>👥</div>
                      <div className="text-xs">Shadow Exchange</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => executeAction('heal_cha')}
                    className="bg-green-600 hover:bg-green-700 text-white p-3"
                    disabled={raidState.energy < 20 || raidState.chaHaeInHealth >= raidState.chaHaeInMaxHealth}
                  >
                    <div className="text-center">
                      <div>💚</div>
                      <div className="text-xs">Heal Cha</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => executeAction('cha_sword_dance')}
                    className="bg-pink-600 hover:bg-pink-700 text-white p-3"
                    disabled={affectionLevel < 70}
                  >
                    <div className="text-center">
                      <div>🗡️</div>
                      <div className="text-xs">Sword Dance</div>
                    </div>
                  </Button>

                  {/* Shadow Soldiers */}
                  {raidState.shadowSoldiers.map(soldier => (
                    <Button
                      key={soldier.id}
                      onClick={() => executeAction(`summon_${soldier.id}`)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-3"
                      disabled={raidState.energy < 30}
                    >
                      <div className="text-center">
                        <div>👤</div>
                        <div className="text-xs">{soldier.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Battle Log & Status */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3">Battle Status</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Wave:</span>
                    <span className="text-purple-400">{raidState.currentWave}/{raidState.totalWaves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energy:</span>
                    <span className="text-blue-400">{raidState.energy}/{raidState.maxEnergy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold Earned:</span>
                    <span className="text-yellow-400">{raidState.goldEarned}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EXP Earned:</span>
                    <span className="text-green-400">{raidState.expEarned}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 h-64">
                <h3 className="text-lg font-bold text-purple-400 mb-3">Battle Log</h3>
                <div 
                  ref={battleLogRef}
                  className="h-48 overflow-y-auto text-sm space-y-1 text-gray-300"
                >
                  {raidState.battleLog.map((log, index) => (
                    <div key={index} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}