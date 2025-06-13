import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sword, Shield, Zap, Target, Crown, Users, Package, Plus } from 'lucide-react';

// Character archetypes with TFT-style traits
interface Character {
  id: string;
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  speed: number;
  x: number;
  y: number;
  facing: 'left' | 'right';
  isPlayer: boolean;
  traits: string[];
  abilities: Ability[];
  cost: number; // For purchasing/upgrading
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  statusEffects: StatusEffect[];
  targetId?: string;
  isAttacking: boolean;
  attackCooldown: number;
}

interface Ability {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon';
  range: number;
  effect: {
    damage?: number;
    heal?: number;
    statusEffect?: StatusEffect;
    summonType?: string;
  };
}

interface StatusEffect {
  type: 'poison' | 'stun' | 'shield' | 'rage' | 'heal_over_time';
  duration: number;
  value: number;
}

interface Synergy {
  trait: string;
  name: string;
  description: string;
  thresholds: Array<{
    count: number;
    bonus: string;
    effect: any;
  }>;
  currentCount: number;
  activeThreshold: number;
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (success: boolean, loot: any[]) => void;
  playerLevel: number;
  affectionLevel: number;
}

export function TFTStyleRaidSystem({ 
  isVisible, 
  onClose, 
  onRaidComplete,
  playerLevel,
  affectionLevel 
}: RaidProps) {
  // Game phases: setup, combat, victory, defeat
  const [gamePhase, setGamePhase] = useState<'setup' | 'combat' | 'victory' | 'defeat'>('setup');
  const [round, setRound] = useState(1);
  const [gold, setGold] = useState(10);
  const [experience, setExperience] = useState(0);
  const [playerLevel_internal, setPlayerLevel_internal] = useState(1);
  
  // Character management
  const [playerTeam, setPlayerTeam] = useState<Character[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<Character[]>([]);
  const [bench, setBench] = useState<Character[]>([]);
  const [shop, setShop] = useState<Character[]>([]);
  
  // Combat state
  const [combatTimer, setCombatTimer] = useState(30);
  const [isAutoCombat, setIsAutoCombat] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  
  // Visual effects
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    type: 'damage' | 'heal' | 'critical';
    timestamp: number;
  }>>([]);
  
  const [synergies, setSynergies] = useState<Synergy[]>([
    {
      trait: 'Hunter',
      name: 'Hunter Association',
      description: 'Hunters gain increased attack speed and coordination',
      thresholds: [
        { count: 2, bonus: '+15% Attack Speed', effect: { attackSpeed: 0.15 } },
        { count: 4, bonus: '+30% Attack Speed, +10% Damage', effect: { attackSpeed: 0.30, damage: 0.10 } },
        { count: 6, bonus: '+50% Attack Speed, +25% Damage, Team Coordination', effect: { attackSpeed: 0.50, damage: 0.25, coordination: true } }
      ],
      currentCount: 0,
      activeThreshold: 0
    },
    {
      trait: 'Shadow',
      name: 'Shadow Army',
      description: 'Shadow units revive with 50% health and summon additional soldiers',
      thresholds: [
        { count: 2, bonus: 'Revive once at 50% HP', effect: { revive: 0.5 } },
        { count: 4, bonus: 'Revive twice, +20% Shadow Damage', effect: { revive: 0.5, reviveCount: 2, shadowDamage: 0.20 } },
        { count: 6, bonus: 'Infinite revives, summon Shadow Soldiers', effect: { revive: 0.5, infiniteRevive: true, summonSoldiers: true } }
      ],
      currentCount: 0,
      activeThreshold: 0
    },
    {
      trait: 'S-Rank',
      name: 'Elite Power',
      description: 'S-Rank hunters have massive stat boosts and special abilities',
      thresholds: [
        { count: 1, bonus: '+50% All Stats', effect: { allStats: 0.5 } },
        { count: 2, bonus: '+100% All Stats, Monarch Powers', effect: { allStats: 1.0, monarchPowers: true } }
      ],
      currentCount: 0,
      activeThreshold: 0
    }
  ]);

  // Initialize default characters
  const initializeCharacters = () => {
    const defaultCharacters: Character[] = [
      {
        id: 'jinwoo',
        name: 'Sung Jin-Woo',
        level: 1,
        health: 150, maxHealth: 150,
        mana: 0, maxMana: 100,
        attack: 45, defense: 25, speed: 8,
        x: 100, y: 200,
        facing: 'right',
        isPlayer: true,
        traits: ['Hunter', 'Shadow', 'S-Rank'],
        cost: 5,
        rarity: 'legendary',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: [
          {
            id: 'shadow_extraction',
            name: 'Shadow Extraction',
            manaCost: 50,
            cooldown: 8000,
            currentCooldown: 0,
            type: 'summon',
            range: 300,
            effect: { summonType: 'shadow_soldier' }
          }
        ]
      },
      {
        id: 'chahaein',
        name: 'Cha Hae-In',
        level: 1,
        health: 120, maxHealth: 120,
        mana: 0, maxMana: 80,
        attack: 55, defense: 20, speed: 10,
        x: 150, y: 150,
        facing: 'right',
        isPlayer: true,
        traits: ['Hunter', 'S-Rank'],
        cost: 4,
        rarity: 'epic',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: [
          {
            id: 'sword_dance',
            name: 'Tempest Slash',
            manaCost: 40,
            cooldown: 6000,
            currentCooldown: 0,
            type: 'damage',
            range: 200,
            effect: { damage: 80 }
          }
        ]
      }
    ];

    setPlayerTeam(defaultCharacters);
    generateShop();
    generateEnemies();
  };

  const generateShop = () => {
    const shopCharacters: Character[] = [
      {
        id: 'shadow_soldier_1',
        name: 'Shadow Soldier',
        level: 1,
        health: 80, maxHealth: 80,
        mana: 0, maxMana: 50,
        attack: 25, defense: 15, speed: 6,
        x: 0, y: 0,
        facing: 'right',
        isPlayer: true,
        traits: ['Shadow'],
        cost: 1,
        rarity: 'common',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: []
      },
      {
        id: 'hunter_mage',
        name: 'Hunter Mage',
        level: 1,
        health: 60, maxHealth: 60,
        mana: 0, maxMana: 100,
        attack: 35, defense: 10, speed: 4,
        x: 0, y: 0,
        facing: 'right',
        isPlayer: true,
        traits: ['Hunter'],
        cost: 2,
        rarity: 'uncommon',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: [
          {
            id: 'fireball',
            name: 'Fireball',
            manaCost: 30,
            cooldown: 4000,
            currentCooldown: 0,
            type: 'damage',
            range: 400,
            effect: { damage: 50 }
          }
        ]
      }
    ];
    setShop(shopCharacters);
  };

  const generateEnemies = () => {
    const enemies: Character[] = [
      {
        id: 'orc_warrior_1',
        name: 'Orc Warrior',
        level: 1,
        health: 100, maxHealth: 100,
        mana: 0, maxMana: 60,
        attack: 30, defense: 20, speed: 5,
        x: 500, y: 200,
        facing: 'left',
        isPlayer: false,
        traits: ['Beast'],
        cost: 0,
        rarity: 'common',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: []
      },
      {
        id: 'shadow_beast_1',
        name: 'Shadow Beast',
        level: 1,
        health: 120, maxHealth: 120,
        mana: 0, maxMana: 80,
        attack: 35, defense: 15, speed: 7,
        x: 550, y: 150,
        facing: 'left',
        isPlayer: false,
        traits: ['Shadow', 'Beast'],
        cost: 0,
        rarity: 'uncommon',
        statusEffects: [],
        isAttacking: false,
        attackCooldown: 0,
        abilities: [
          {
            id: 'shadow_claw',
            name: 'Shadow Claw',
            manaCost: 25,
            cooldown: 3000,
            currentCooldown: 0,
            type: 'damage',
            range: 150,
            effect: { damage: 40 }
          }
        ]
      }
    ];
    setEnemyTeam(enemies);
  };

  // Combat system with auto-battler mechanics
  const startCombat = () => {
    setGamePhase('combat');
    setIsAutoCombat(true);
    setCombatTimer(30);
  };

  const updateSynergies = () => {
    const traitCounts: Record<string, number> = {};
    
    playerTeam.forEach(char => {
      char.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    });

    setSynergies(prev => prev.map(synergy => {
      const count = traitCounts[synergy.trait] || 0;
      const activeThreshold = synergy.thresholds.findLastIndex(t => t.count <= count);
      
      return {
        ...synergy,
        currentCount: count,
        activeThreshold: activeThreshold >= 0 ? activeThreshold : -1
      };
    }));
  };

  // Character purchasing system
  const buyCharacter = (character: Character) => {
    if (gold >= character.cost) {
      setGold(prev => prev - character.cost);
      setBench(prev => [...prev, { ...character, id: `${character.id}_${Date.now()}` }]);
      setShop(prev => prev.filter(c => c.id !== character.id));
    }
  };

  // Combat loop
  useEffect(() => {
    if (!isAutoCombat || gamePhase !== 'combat') return;

    const combatInterval = setInterval(() => {
      // Update character positions and combat
      setPlayerTeam(prev => prev.map(char => {
        if (char.health <= 0) return char;

        // Find nearest enemy
        const nearestEnemy = enemyTeam.reduce((closest, enemy) => {
          if (enemy.health <= 0) return closest;
          const distance = Math.sqrt(Math.pow(enemy.x - char.x, 2) + Math.pow(enemy.y - char.y, 2));
          const closestDistance = closest ? Math.sqrt(Math.pow(closest.x - char.x, 2) + Math.pow(closest.y - char.y, 2)) : Infinity;
          return distance < closestDistance ? enemy : closest;
        }, null as Character | null);

        if (nearestEnemy) {
          const distance = Math.sqrt(Math.pow(nearestEnemy.x - char.x, 2) + Math.pow(nearestEnemy.y - char.y, 2));
          
          // Move towards enemy if too far
          if (distance > 100) {
            const moveX = nearestEnemy.x > char.x ? char.speed : -char.speed;
            return {
              ...char,
              x: char.x + moveX,
              facing: nearestEnemy.x > char.x ? 'right' : 'left'
            };
          }
          
          // Attack if in range and not on cooldown
          if (distance <= 100 && char.attackCooldown <= 0) {
            // Deal damage to enemy
            setEnemyTeam(prevEnemies => prevEnemies.map(enemy => {
              if (enemy.id === nearestEnemy.id) {
                const damage = Math.max(1, char.attack - enemy.defense);
                const newHealth = Math.max(0, enemy.health - damage);
                
                // Add damage number
                setDamageNumbers(prev => [...prev, {
                  id: `damage_${Date.now()}`,
                  damage,
                  x: enemy.x,
                  y: enemy.y - 20,
                  type: damage > char.attack * 1.5 ? 'critical' : 'damage',
                  timestamp: Date.now()
                }]);
                
                return { ...enemy, health: newHealth };
              }
              return enemy;
            }));
            
            return {
              ...char,
              attackCooldown: 1000, // 1 second cooldown
              isAttacking: true,
              mana: Math.min(char.maxMana, char.mana + 10)
            };
          }
        }

        return {
          ...char,
          attackCooldown: Math.max(0, char.attackCooldown - 100),
          isAttacking: false
        };
      }));

      // Update enemy AI similarly
      setEnemyTeam(prev => prev.map(char => {
        if (char.health <= 0) return char;

        const nearestPlayer = playerTeam.reduce((closest, player) => {
          if (player.health <= 0) return closest;
          const distance = Math.sqrt(Math.pow(player.x - char.x, 2) + Math.pow(player.y - char.y, 2));
          const closestDistance = closest ? Math.sqrt(Math.pow(closest.x - char.x, 2) + Math.pow(closest.y - char.y, 2)) : Infinity;
          return distance < closestDistance ? player : closest;
        }, null as Character | null);

        if (nearestPlayer) {
          const distance = Math.sqrt(Math.pow(nearestPlayer.x - char.x, 2) + Math.pow(nearestPlayer.y - char.y, 2));
          
          if (distance > 100) {
            const moveX = nearestPlayer.x > char.x ? char.speed : -char.speed;
            return {
              ...char,
              x: char.x + moveX,
              facing: nearestPlayer.x > char.x ? 'right' : 'left'
            };
          }
          
          if (distance <= 100 && char.attackCooldown <= 0) {
            setPlayerTeam(prevPlayers => prevPlayers.map(player => {
              if (player.id === nearestPlayer.id) {
                const damage = Math.max(1, char.attack - player.defense);
                const newHealth = Math.max(0, player.health - damage);
                
                setDamageNumbers(prev => [...prev, {
                  id: `damage_${Date.now()}`,
                  damage,
                  x: player.x,
                  y: player.y - 20,
                  type: 'damage',
                  timestamp: Date.now()
                }]);
                
                return { ...player, health: newHealth };
              }
              return player;
            }));
            
            return {
              ...char,
              attackCooldown: 1000,
              isAttacking: true
            };
          }
        }

        return {
          ...char,
          attackCooldown: Math.max(0, char.attackCooldown - 100)
        };
      }));

      // Check victory conditions
      const playersAlive = playerTeam.some(char => char.health > 0);
      const enemiesAlive = enemyTeam.some(char => char.health > 0);

      if (!playersAlive) {
        setGamePhase('defeat');
        setIsAutoCombat(false);
      } else if (!enemiesAlive) {
        setGamePhase('victory');
        setIsAutoCombat(false);
        setGold(prev => prev + 5 + round);
        setExperience(prev => prev + 2);
      }
    }, 100);

    return () => clearInterval(combatInterval);
  }, [isAutoCombat, gamePhase, playerTeam, enemyTeam, round]);

  // Cleanup damage numbers
  useEffect(() => {
    const cleanup = setInterval(() => {
      setDamageNumbers(prev => prev.filter(dmg => Date.now() - dmg.timestamp < 2000));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  // Initialize on mount
  useEffect(() => {
    if (isVisible) {
      initializeCharacters();
    }
  }, [isVisible]);

  useEffect(() => {
    updateSynergies();
  }, [playerTeam]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-40">
          <div className="flex items-center gap-4">
            <div className="text-white font-bold text-lg">Round {round}</div>
            <div className="text-yellow-400 font-bold">Gold: {gold}</div>
            <div className="text-blue-400">XP: {experience}/{playerLevel_internal * 2}</div>
          </div>
          
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Synergies Panel */}
        <div className="absolute top-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <h3 className="text-white font-bold mb-2">Active Synergies</h3>
          {synergies.map(synergy => (
            <div key={synergy.trait} className="mb-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">{synergy.name}</span>
                <span className="text-gray-400 text-xs">{synergy.currentCount}</span>
              </div>
              {synergy.activeThreshold >= 0 && (
                <div className="text-green-400 text-xs">
                  {synergy.thresholds[synergy.activeThreshold].bonus}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Combat Arena */}
        <div className="absolute inset-x-4 top-32 bottom-48 bg-gradient-to-b from-slate-800/50 to-slate-900/50 rounded-lg backdrop-blur-sm border border-white/10 overflow-hidden">
          
          {/* Player Characters */}
          {playerTeam.map(char => (
            <motion.div
              key={char.id}
              className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-white font-bold text-xs ${
                char.health <= 0 ? 'bg-gray-600 border-gray-500' : 
                char.rarity === 'legendary' ? 'bg-orange-600 border-orange-400' :
                char.rarity === 'epic' ? 'bg-purple-600 border-purple-400' :
                char.rarity === 'rare' ? 'bg-blue-600 border-blue-400' :
                char.rarity === 'uncommon' ? 'bg-green-600 border-green-400' :
                'bg-gray-600 border-gray-400'
              } ${char.isAttacking ? 'animate-pulse' : ''}`}
              style={{ left: char.x, top: char.y }}
              animate={{ 
                x: char.x, 
                y: char.y,
                scale: char.isAttacking ? 1.2 : 1.0 
              }}
              transition={{ duration: 0.1 }}
            >
              {char.name.substring(0, 2)}
              
              {/* Health bar */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded">
                <div 
                  className="h-full bg-green-500 rounded transition-all duration-200"
                  style={{ width: `${(char.health / char.maxHealth) * 100}%` }}
                />
              </div>
              
              {/* Mana bar */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded">
                <div 
                  className="h-full bg-blue-500 rounded transition-all duration-200"
                  style={{ width: `${(char.mana / char.maxMana) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}

          {/* Enemy Characters */}
          {enemyTeam.map(char => (
            <motion.div
              key={char.id}
              className={`absolute w-12 h-12 rounded-full border-2 border-red-400 bg-red-600 flex items-center justify-center text-white font-bold text-xs ${
                char.health <= 0 ? 'bg-gray-600 border-gray-500' : ''
              } ${char.isAttacking ? 'animate-pulse' : ''}`}
              style={{ left: char.x, top: char.y }}
              animate={{ 
                x: char.x, 
                y: char.y,
                scale: char.isAttacking ? 1.2 : 1.0 
              }}
              transition={{ duration: 0.1 }}
            >
              {char.name.substring(0, 2)}
              
              {/* Health bar */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-700 rounded">
                <div 
                  className="h-full bg-green-500 rounded transition-all duration-200"
                  style={{ width: `${(char.health / char.maxHealth) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}

          {/* Damage Numbers */}
          <AnimatePresence>
            {damageNumbers.map(dmg => (
              <motion.div
                key={dmg.id}
                className={`absolute font-bold text-lg pointer-events-none ${
                  dmg.type === 'critical' ? 'text-yellow-400' :
                  dmg.type === 'heal' ? 'text-green-400' :
                  'text-red-400'
                }`}
                style={{ left: dmg.x, top: dmg.y }}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -50, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2 }}
              >
                {dmg.type === 'heal' ? '+' : '-'}{dmg.damage}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Shop & Management Panel */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
          <div className="flex gap-4">
            
            {/* Shop */}
            <div className="flex-1">
              <h3 className="text-white font-bold mb-2">Shop</h3>
              <div className="flex gap-2">
                {shop.map(char => (
                  <div key={char.id} className="bg-slate-700 rounded p-2 text-center min-w-[80px]">
                    <div className="text-white text-xs font-bold">{char.name}</div>
                    <div className="text-yellow-400 text-xs">{char.cost}g</div>
                    <Button
                      size="sm"
                      onClick={() => buyCharacter(char)}
                      disabled={gold < char.cost}
                      className="mt-1 text-xs"
                    >
                      Buy
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => generateShop()}
                  variant="outline"
                  size="sm"
                  disabled={gold < 2}
                  className="text-white border-white/30"
                >
                  Refresh (2g)
                </Button>
              </div>
            </div>

            {/* Control Panel */}
            <div className="w-48">
              <div className="flex gap-2 mb-2">
                {gamePhase === 'setup' && (
                  <Button onClick={startCombat} className="flex-1">
                    Start Combat
                  </Button>
                )}
                {gamePhase === 'victory' && (
                  <Button onClick={() => {
                    setRound(prev => prev + 1);
                    setGamePhase('setup');
                    generateEnemies();
                  }} className="flex-1">
                    Next Round
                  </Button>
                )}
                {gamePhase === 'defeat' && (
                  <Button onClick={() => onRaidComplete(false, [])} className="flex-1">
                    Retreat
                  </Button>
                )}
              </div>
              
              {gamePhase === 'combat' && (
                <div className="text-center">
                  <div className="text-white font-bold">Combat in Progress</div>
                  <div className="text-gray-400 text-sm">Auto-battling...</div>
                </div>
              )}
            </div>
          </div>

          {/* Bench */}
          {bench.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-bold mb-2">Bench</h4>
              <div className="flex gap-2">
                {bench.map(char => (
                  <div key={char.id} className="bg-slate-600 rounded p-2 text-center min-w-[60px] cursor-pointer"
                       onClick={() => {
                         // Add to team if space available
                         if (playerTeam.length < 6) {
                           setPlayerTeam(prev => [...prev, { ...char, x: 100 + prev.length * 60, y: 200 }]);
                           setBench(prev => prev.filter(c => c.id !== char.id));
                         }
                       }}>
                    <div className="text-white text-xs">{char.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Game Phase Overlay */}
        <AnimatePresence>
          {gamePhase === 'victory' && (
            <motion.div
              className="absolute inset-0 bg-green-900/80 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-green-400 mb-4">Victory!</h2>
                <p className="text-white text-lg mb-4">Round {round} Complete</p>
                <p className="text-yellow-400">+{5 + round} Gold, +2 Experience</p>
              </div>
            </motion.div>
          )}

          {gamePhase === 'defeat' && (
            <motion.div
              className="absolute inset-0 bg-red-900/80 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h2 className="text-4xl font-bold text-red-400 mb-4">Defeated</h2>
                <p className="text-white text-lg mb-4">Better luck next time</p>
                <Button onClick={() => onRaidComplete(false, [])} className="mt-4">
                  Return to Hub
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}