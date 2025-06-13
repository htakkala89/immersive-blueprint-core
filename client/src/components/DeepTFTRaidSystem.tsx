import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sword, Shield, Zap, Target, Crown, Users, Package, Plus, RefreshCw, Star, Lock } from 'lucide-react';

// Deep TFT Character System
interface Character {
  id: string;
  name: string;
  baseName: string; // For combining units
  level: number;
  stars: number; // 1, 2, or 3 stars
  tier: number; // Cost tier (1-5)
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  x: number;
  y: number;
  hexX: number; // Hex grid position
  hexY: number;
  facing: 'left' | 'right';
  isPlayer: boolean;
  traits: string[];
  abilities: Ability[];
  items: Item[];
  statusEffects: StatusEffect[];
  targetId?: string;
  isAttacking: boolean;
  attackCooldown: number;
  critChance: number;
  dodgeChance: number;
  range: number;
}

interface Ability {
  id: string;
  name: string;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'aoe';
  range: number;
  targeting: 'single' | 'area' | 'all' | 'self';
  effect: {
    damage?: number;
    heal?: number;
    statusEffect?: StatusEffect;
    summonType?: string;
    aoeRadius?: number;
  };
}

interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  tier: 'basic' | 'combined' | 'radiant';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    critChance?: number;
    dodgeChance?: number;
    attackSpeed?: number;
  };
  passive?: string;
  components?: string[]; // For item combining
}

interface StatusEffect {
  type: 'poison' | 'stun' | 'shield' | 'rage' | 'heal_over_time' | 'burn' | 'frozen' | 'disarm';
  duration: number;
  value: number;
  source?: string;
}

interface Trait {
  name: string;
  description: string;
  color: string;
  thresholds: TraitThreshold[];
  currentCount: number;
  activeLevel: number;
}

interface TraitThreshold {
  count: number;
  name: string;
  effect: string;
  bonuses: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    critChance?: number;
    special?: string;
  };
}

interface ShopSlot {
  character: Character | null;
  locked: boolean;
  cost: number;
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (success: boolean, loot: any[]) => void;
  playerLevel: number;
  affectionLevel: number;
}

// TFT Shop Odds by Level (Modified to show legendary shadows earlier)
const SHOP_ODDS = {
  1: [60, 25, 10, 4, 1],   // Level 1: 60% tier 1, 25% tier 2, 10% tier 3, 4% tier 4, 1% tier 5
  2: [70, 20, 8, 2, 0],    // Level 2: 70% tier 1, 20% tier 2, 8% tier 3, 2% tier 4
  3: [75, 25, 0, 0, 0],    // Level 3: 75% tier 1, 25% tier 2
  4: [55, 30, 15, 0, 0],   // Level 4: 55% tier 1, 30% tier 2, 15% tier 3
  5: [45, 33, 20, 2, 0],   // Level 5: 45% tier 1, 33% tier 2, 20% tier 3, 2% tier 4
  6: [30, 40, 25, 5, 0],   // Level 6: 30% tier 1, 40% tier 2, 25% tier 3, 5% tier 4
  7: [19, 30, 35, 15, 1],  // Level 7: 19% tier 1, 30% tier 2, 35% tier 3, 15% tier 4, 1% tier 5
  8: [18, 25, 32, 22, 3],  // Level 8: 18% tier 1, 25% tier 2, 32% tier 3, 22% tier 4, 3% tier 5
  9: [10, 15, 25, 35, 15], // Level 9: 10% tier 1, 15% tier 2, 25% tier 3, 35% tier 4, 15% tier 5
};

// Character Pool Sizes (limited supply like real TFT)
const CHARACTER_POOLS = {
  1: 29, // Tier 1 units: 29 copies each
  2: 22, // Tier 2 units: 22 copies each  
  3: 18, // Tier 3 units: 18 copies each
  4: 12, // Tier 4 units: 12 copies each
  5: 10, // Tier 5 units: 10 copies each
};

export function DeepTFTRaidSystem({ 
  isVisible, 
  onClose, 
  onRaidComplete,
  playerLevel,
  affectionLevel 
}: RaidProps) {
  // Core TFT Game State
  const [gamePhase, setGamePhase] = useState<'setup' | 'combat' | 'victory' | 'defeat'>('setup');
  const [round, setRound] = useState(1);
  const [gold, setGold] = useState(10);
  const [experience, setExperience] = useState(0);
  const [level, setLevel] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(1); // Increases with level
  const [interest, setInterest] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [loseStreak, setLoseStreak] = useState(0);
  
  // Team Management
  const [board, setBoard] = useState<(Character | null)[]>(Array(28).fill(null)); // 7x4 hex grid
  const [bench, setBench] = useState<(Character | null)[]>(Array(9).fill(null)); // 9 bench slots
  const [shop, setShop] = useState<ShopSlot[]>([]);
  const [lockedSlots, setLockedSlots] = useState<boolean[]>(Array(5).fill(false));
  
  // Combat State
  const [enemyBoard, setEnemyBoard] = useState<(Character | null)[]>(Array(28).fill(null));
  const [combatTimer, setCombatTimer] = useState(30);
  const [isAutoCombat, setIsAutoCombat] = useState(false);
  const [combatUnits, setCombatUnits] = useState<Character[]>([]);
  
  // Character Pool Tracking (shared resource)
  const [characterPool, setCharacterPool] = useState<{[key: string]: number}>({});
  
  // Items and Traits
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [activeTraits, setActiveTraits] = useState<Trait[]>([]);
  
  // Drag and Drop State
  const [draggedUnit, setDraggedUnit] = useState<Character | null>(null);
  const [dragSource, setDragSource] = useState<'board' | 'bench' | null>(null);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Visual Effects
  const [damageNumbers, setDamageNumbers] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);

  // Level up mechanics - determines max team size
  const LEVEL_REQUIREMENTS = [0, 2, 6, 10, 20, 36, 56, 80, 100]; // XP needed for each level
  const TEAM_SIZE_BY_LEVEL = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Max units on board

  // Initialize character pool
  useEffect(() => {
    if (!isVisible) return;
    
    console.log('🏗️ Initializing Deep TFT System...');
    const pool: {[key: string]: number} = {};
    // Initialize all character pools
    CHAMPION_DATA.forEach(champ => {
      pool[champ.baseName] = CHARACTER_POOLS[champ.tier as keyof typeof CHARACTER_POOLS];
    });
    setCharacterPool(pool);
    
    // Generate initial shop immediately
    setTimeout(() => {
      generateShop();
    }, 100);
    
    console.log('✅ Deep TFT System initialized');
  }, [isVisible]);

  // Calculate interest (1 gold per 10 gold saved, max 5)
  const calculateInterest = (currentGold: number) => {
    return Math.min(Math.floor(currentGold / 10), 5);
  };

  // Level up system
  const buyExperience = () => {
    if (gold >= 4 && level < 9) {
      setGold(prev => prev - 4);
      setExperience(prev => {
        const newExp = prev + 4;
        const nextLevelReq = LEVEL_REQUIREMENTS[level];
        if (newExp >= nextLevelReq && level < 9) {
          setLevel(prevLevel => {
            const newLevel = prevLevel + 1;
            setMaxTeamSize(TEAM_SIZE_BY_LEVEL[newLevel]);
            return newLevel;
          });
          return newExp - nextLevelReq;
        }
        return newExp;
      });
    }
  };

  // Shop refresh mechanics
  const refreshShop = () => {
    if (gold >= 2) {
      setGold(prev => prev - 2);
      generateShop();
    }
  };

  const generateShop = () => {
    const newShop: ShopSlot[] = [];
    const odds = SHOP_ODDS[level as keyof typeof SHOP_ODDS] || SHOP_ODDS[1];
    
    for (let i = 0; i < 5; i++) {
      if (lockedSlots[i] && shop[i]?.character) {
        // Keep locked slot
        newShop.push(shop[i]);
        continue;
      }
      
      // Roll for tier based on level odds
      const roll = Math.random() * 100;
      let cumulativeOdds = 0;
      let selectedTier = 1;
      
      for (let tier = 1; tier <= 5; tier++) {
        cumulativeOdds += odds[tier - 1];
        if (roll <= cumulativeOdds) {
          selectedTier = tier;
          break;
        }
      }
      
      // Get available champions of that tier
      const availableChamps = CHAMPION_DATA.filter(champ => 
        champ.tier === selectedTier && (characterPool[champ.baseName] || 10) > 0
      );
      
      if (availableChamps.length > 0) {
        const randomChamp = availableChamps[Math.floor(Math.random() * availableChamps.length)];
        const character = createCharacterFromData(randomChamp);
        newShop.push({
          character,
          locked: lockedSlots[i] || false,
          cost: randomChamp.tier
        });
      } else {
        // Fallback to tier 1 champions
        const tier1Champs = CHAMPION_DATA.filter(champ => champ.tier === 1);
        if (tier1Champs.length > 0) {
          const randomChamp = tier1Champs[Math.floor(Math.random() * tier1Champs.length)];
          const character = createCharacterFromData(randomChamp);
          newShop.push({
            character,
            locked: lockedSlots[i] || false,
            cost: 1
          });
        } else {
          newShop.push({ character: null, locked: false, cost: 0 });
        }
      }
    }
    
    console.log('Generated shop with', newShop.filter(s => s.character).length, 'units');
    setShop(newShop);
  };

  // Buy character from shop
  const buyCharacter = (shopIndex: number) => {
    const shopSlot = shop[shopIndex];
    if (!shopSlot.character || gold < shopSlot.cost) return;
    
    const character = shopSlot.character;
    setGold(prev => prev - shopSlot.cost);
    
    // Reduce character pool
    setCharacterPool(prev => ({
      ...prev,
      [character.baseName]: prev[character.baseName] - 1
    }));
    
    // Check for combining (3-star system)
    const existingCopies = [...bench, ...board.filter(c => c !== null)]
      .filter(c => c && c.baseName === character.baseName && c.stars === character.stars);
    
    if (existingCopies.length === 2) {
      // Combine into higher star unit
      combineUnits(character, existingCopies as Character[]);
    } else {
      // Add to bench
      addToBench(character);
    }
    
    // Remove from shop
    const newShop = [...shop];
    newShop[shopIndex] = { character: null, locked: false, cost: 0 };
    setShop(newShop);
  };

  const combineUnits = (newUnit: Character, existingUnits: Character[]) => {
    if (existingUnits.length !== 2) return;
    
    // Remove existing units
    const newBench = [...bench];
    const newBoard = [...board];
    
    existingUnits.forEach(unit => {
      const benchIndex = newBench.findIndex(c => c?.id === unit.id);
      if (benchIndex !== -1) {
        newBench[benchIndex] = null;
      } else {
        const boardIndex = newBoard.findIndex(c => c?.id === unit.id);
        if (boardIndex !== -1) {
          newBoard[boardIndex] = null;
        }
      }
    });
    
    // Create upgraded unit
    const upgradedUnit: Character = {
      ...newUnit,
      id: `${newUnit.baseName}_${newUnit.stars + 1}_${Date.now()}`,
      stars: newUnit.stars + 1,
      health: Math.floor(newUnit.health * 1.8),
      maxHealth: Math.floor(newUnit.maxHealth * 1.8),
      attack: Math.floor(newUnit.attack * 1.8),
      defense: Math.floor(newUnit.defense * 1.8),
    };
    
    // Add upgraded unit to bench
    const emptyBenchSlot = newBench.findIndex(slot => slot === null);
    if (emptyBenchSlot !== -1) {
      newBench[emptyBenchSlot] = upgradedUnit;
    }
    
    setBench(newBench);
    setBoard(newBoard);
  };

  const addToBench = (character: Character) => {
    const emptySlot = bench.findIndex(slot => slot === null);
    if (emptySlot !== -1) {
      const newBench = [...bench];
      newBench[emptySlot] = character;
      setBench(newBench);
    }
  };

  // Trait calculation system
  const calculateTraits = () => {
    const allUnits = [...board.filter(c => c !== null)] as Character[];
    const traitCounts: {[key: string]: number} = {};
    
    allUnits.forEach(unit => {
      unit.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    });
    
    const activeTraits: Trait[] = TRAIT_DATA.map(trait => {
      const count = traitCounts[trait.name] || 0;
      let activeLevel = 0;
      
      trait.thresholds.forEach((threshold, index) => {
        if (count >= threshold.count) {
          activeLevel = index + 1;
        }
      });
      
      return {
        ...trait,
        currentCount: count,
        activeLevel
      };
    }).filter(trait => trait.currentCount > 0);
    
    setActiveTraits(activeTraits);
  };

  // Combat system with positioning
  const startCombat = () => {
    const playerUnits = board.filter(unit => unit !== null);
    if (playerUnits.length === 0) {
      alert('Place at least one unit on the board!');
      return;
    }

    // Generate enemy team
    const enemyUnits = generateEnemyTeam();
    
    // Position units for TFT-style top-down combat based on board positions
    const combatPlayerUnits = board
      .map((unit, boardIndex) => {
        if (!unit) return null;
        
        // Convert board index to grid coordinates (7x4 grid)
        const col = boardIndex % 7;
        const row = Math.floor(boardIndex / 7);
        
        return {
          ...unit,
          x: 100 + (col * 60), // 60px spacing between units
          y: 100 + (row * 60),
          hexX: col,
          hexY: row,
          facing: 'right' as const,
          isPlayer: true,
          isAttacking: false,
          targetId: undefined
        };
      })
      .filter(unit => unit !== null);

    const combatEnemyUnits = enemyUnits.map((unit, index) => ({
      ...unit,
      // Position enemies on right side of battlefield
      x: 500 + ((index % 3) * 60),
      y: 100 + (Math.floor(index / 3) * 60),
      hexX: 6 + (index % 2), // Right side of grid
      hexY: Math.floor(index / 3),
      facing: 'left' as const,
      isPlayer: false,
      isAttacking: false,
      targetId: undefined
    }));

    setCombatUnits([...combatPlayerUnits, ...combatEnemyUnits]);
    setGamePhase('combat');
    setCombatTimer(30);
    setIsAutoCombat(true);
  };

  const generateEnemyTeam = (): Character[] => {
    // Generate enemy team based on round using dungeon monsters
    const enemyStrength = Math.min(round + 2, 6);
    const enemies: Character[] = [];
    
    for (let i = 0; i < enemyStrength; i++) {
      const enemyTier = Math.min(Math.floor(round / 2) + 1, 5);
      const availableEnemies = ENEMY_DATA.filter(enemy => enemy.tier <= enemyTier);
      const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      
      const enemy = createCharacterFromData({
        ...randomEnemy,
        id: `enemy_${i}_${Date.now()}`,
        isPlayer: false
      });
      
      enemies.push(enemy);
    }
    
    // Position enemies on their side of the board
    const newEnemyBoard = Array(28).fill(null);
    enemies.forEach((enemy, index) => {
      const position = 21 + (index % 7); // Right side of board
      newEnemyBoard[position] = enemy;
    });
    
    setEnemyBoard(newEnemyBoard);
    return enemies;
  };

  // Combat simulation with real-time health updates
  useEffect(() => {
    let combatInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;
    
    if (gamePhase === 'combat' && isAutoCombat && combatUnits.length > 0) {
      // Combat timer countdown
      timerInterval = setInterval(() => {
        setCombatTimer(prev => {
          if (prev <= 1) {
            // Combat timeout - determine winner based on remaining units
            const playerAlive = combatUnits.filter(u => u.isPlayer && u.health > 0).length;
            const enemyAlive = combatUnits.filter(u => !u.isPlayer && u.health > 0).length;
            
            // Player wins ties or when they have more units alive
            if (playerAlive >= enemyAlive) {
              handleVictory();
            } else {
              handleDefeat();
            }
            
            setIsAutoCombat(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // TFT-style distance-based combat simulation
      combatInterval = setInterval(() => {
        setCombatUnits(prevUnits => {
          return prevUnits.map(unit => {
            if (unit.health <= 0) return { ...unit, isAttacking: false, targetId: undefined };
            
            const isPlayerUnit = unit.isPlayer;
            const enemies = prevUnits.filter(u => u.isPlayer !== isPlayerUnit && u.health > 0);
            
            if (enemies.length > 0) {
              // Find nearest enemy using grid distance (TFT-style)
              const nearestEnemy = enemies.reduce((closest, enemy) => {
                const distToCurrent = Math.sqrt(
                  Math.pow(unit.hexX - enemy.hexX, 2) + Math.pow(unit.hexY - enemy.hexY, 2)
                );
                const distToClosest = Math.sqrt(
                  Math.pow(unit.hexX - closest.hexX, 2) + Math.pow(unit.hexY - closest.hexY, 2)
                );
                return distToCurrent < distToClosest ? enemy : closest;
              });
              
              const distance = Math.sqrt(
                Math.pow(unit.hexX - nearestEnemy.hexX, 2) + Math.pow(unit.hexY - nearestEnemy.hexY, 2)
              );
              
              // Attack if in range (range based on unit type)
              const attackRange = unit.range || 1.5; // Default melee range
              const canAttack = distance <= attackRange;
              
              if (canAttack) {
                // Attack current target
                return {
                  ...unit,
                  isAttacking: true,
                  targetId: nearestEnemy.id,
                  attackCooldown: Math.max(0, (unit.attackCooldown || 0) - 800)
                };
              } else {
                // Move toward target (TFT-style movement)
                const moveX = nearestEnemy.hexX > unit.hexX ? 0.2 : nearestEnemy.hexX < unit.hexX ? -0.2 : 0;
                const moveY = nearestEnemy.hexY > unit.hexY ? 0.2 : nearestEnemy.hexY < unit.hexY ? -0.2 : 0;
                
                return {
                  ...unit,
                  isAttacking: false,
                  targetId: nearestEnemy.id,
                  x: unit.x + (moveX * 30),
                  y: unit.y + (moveY * 30),
                  hexX: unit.hexX + moveX,
                  hexY: unit.hexY + moveY
                };
              }
            }
            
            return { ...unit, isAttacking: false, targetId: undefined };
          });
        });

        // Apply damage based on attacking units targeting specific enemies
        setCombatUnits(prevUnits => {
          return prevUnits.map(unit => {
            if (unit.health <= 0) return unit;
            
            // Find all units attacking this specific unit
            const attackers = prevUnits.filter(attacker => 
              attacker.isAttacking && 
              attacker.targetId === unit.id && 
              attacker.health > 0 &&
              (attacker.attackCooldown || 0) <= 0
            );
            
            if (attackers.length > 0) {
              // Calculate total damage from all attackers
              const totalDamage = attackers.reduce((damage, attacker) => {
                const baseDamage = 15 + (attacker.attack * 0.3);
                const traitBonus = attacker.isPlayer ? activeTraits.reduce((sum, trait) => 
                  sum + (trait.activeLevel * 5), 0) : 0;
                const unitDamage = Math.max(5, baseDamage + traitBonus + (Math.random() * 10 - 5));
                return damage + unitDamage;
              }, 0);
              
              return {
                ...unit,
                health: Math.max(0, unit.health - totalDamage)
              };
            }
            
            return unit;
          });
        });
      }, 600); // Smooth 60fps-style updates

      // Check for battle end conditions every tick
      const victoryCheckInterval = setInterval(() => {
        setCombatUnits(currentUnits => {
          const playerAlive = currentUnits.filter(u => u.isPlayer && u.health > 0).length;
          const enemyAlive = currentUnits.filter(u => !u.isPlayer && u.health > 0).length;
          
          // End battle immediately if one side is eliminated
          if (playerAlive > 0 && enemyAlive === 0) {
            setTimeout(() => {
              handleVictory();
              setIsAutoCombat(false);
            }, 500); // Small delay for visual clarity
          } else if (enemyAlive > 0 && playerAlive === 0) {
            setTimeout(() => {
              handleDefeat();
              setIsAutoCombat(false);
            }, 500);
          }
          
          return currentUnits;
        });
      }, 500); // Check every 0.5 seconds

      return () => {
        clearInterval(combatInterval);
        clearInterval(timerInterval);
        clearInterval(victoryCheckInterval);
      };
    }
    
    return () => {
      clearInterval(combatInterval);
      clearInterval(timerInterval);
    };
  }, [gamePhase, isAutoCombat, combatUnits]);

  // Drag and Drop Handlers
  const handleDragStart = (unit: Character, source: 'board' | 'bench', sourceIndex: number) => {
    setDraggedUnit(unit);
    setDragSource(source);
    setDragSourceIndex(sourceIndex);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setDraggedUnit(null);
    setDragSource(null);
    setDragSourceIndex(null);
    setIsDragging(false);
  };

  const handleDrop = (targetIndex: number, targetType: 'board' | 'bench') => {
    if (!draggedUnit || dragSource === null || dragSourceIndex === null) return;

    const newBoard = [...board];
    const newBench = [...bench];

    // Remove unit from source
    if (dragSource === 'board') {
      newBoard[dragSourceIndex] = null;
    } else {
      newBench[dragSourceIndex] = null;
    }

    // Place unit at target
    if (targetType === 'board') {
      // Check if target board position is valid
      if (newBoard.filter(u => u !== null).length < 7 || newBoard[targetIndex] !== null) {
        if (newBoard[targetIndex] !== null) {
          // Swap units if target is occupied
          const swappedUnit = newBoard[targetIndex];
          if (dragSource === 'board') {
            newBoard[dragSourceIndex] = swappedUnit;
          } else {
            // Find empty bench slot for swapped unit
            const emptyBenchSlot = newBench.findIndex(slot => slot === null);
            if (emptyBenchSlot !== -1) {
              newBench[emptyBenchSlot] = swappedUnit;
            }
          }
        }
        newBoard[targetIndex] = draggedUnit;
      }
    } else {
      // Place on bench
      if (newBench[targetIndex] !== null) {
        // Swap units
        const swappedUnit = newBench[targetIndex];
        if (dragSource === 'board') {
          newBoard[dragSourceIndex] = swappedUnit;
        } else {
          newBench[dragSourceIndex] = swappedUnit;
        }
      }
      newBench[targetIndex] = draggedUnit;
    }

    setBoard(newBoard);
    setBench(newBench);
    calculateTraits();
    handleDragEnd();
  };

  const runCombatSimulation = () => {
    // Combat is now handled by useEffect above
    console.log('Combat simulation started with', combatUnits.length, 'units');
  };

  const handleVictory = () => {
    setGamePhase('victory');
    const goldReward = 5 + Math.floor(round / 2) + calculateInterest(gold);
    const expReward = 2;
    
    setGold(prev => prev + goldReward);
    setExperience(prev => prev + expReward);
    setWinStreak(prev => prev + 1);
    setLoseStreak(0);
  };

  const handleDefeat = () => {
    setGamePhase('defeat');
    setWinStreak(0);
    setLoseStreak(prev => prev + 1);
  };

  if (!isVisible) return null;

  console.log('🎮 Deep TFT Modal is rendering with isVisible:', isVisible);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="w-full h-full max-w-7xl max-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex gap-4 text-white">
            <div className="bg-black/50 px-3 py-1 rounded">Round {round}</div>
            <div className="bg-yellow-600/80 px-3 py-1 rounded flex items-center gap-1">
              <span className="text-yellow-200">Gold:</span> {gold}
            </div>
            <div className="bg-blue-600/80 px-3 py-1 rounded flex items-center gap-1">
              <span className="text-blue-200">Level:</span> {level}
            </div>
            <div className="bg-purple-600/80 px-3 py-1 rounded flex items-center gap-1">
              <span className="text-purple-200">XP:</span> {experience}/{LEVEL_REQUIREMENTS[level]}
            </div>
            <div className="bg-green-600/80 px-3 py-1 rounded flex items-center gap-1">
              <span className="text-green-200">Interest:</span> +{calculateInterest(gold)}
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Traits Panel */}
        <div className="absolute top-20 left-4 bg-black/70 rounded-lg p-3 min-w-[250px]">
          <h3 className="text-white font-bold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Synergies
          </h3>
          {activeTraits.length === 0 ? (
            <div className="text-gray-400 text-sm">No active traits</div>
          ) : (
            <div className="space-y-1">
              {activeTraits.map(trait => (
                <div key={trait.name} className="flex items-center justify-between">
                  <span className={`text-sm font-medium`} style={{ color: trait.color }}>
                    {trait.name}
                  </span>
                  <span className="text-white text-sm">
                    {trait.currentCount}
                    {trait.activeLevel > 0 && (
                      <span className="ml-1 text-yellow-400">
                        ({trait.thresholds[trait.activeLevel - 1].name})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Board Area */}
        <div className="absolute inset-x-4 top-32 bottom-32 bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-600 overflow-hidden">
          {gamePhase === 'setup' && (
            /* Setup Phase - TFT Authentic Board Layout */
            <div className="absolute inset-4">
              {/* Full 8x7 TFT Board Grid */}
              <div className="grid grid-cols-7 grid-rows-8 gap-1 h-full">
                {Array.from({ length: 56 }).map((_, index) => {
                  const col = index % 7;
                  const row = Math.floor(index / 7);
                  const isPlayerRow = row >= 4; // Bottom 4 rows are player area
                  const isEnemyRow = row < 4; // Top 4 rows are enemy area
                  const boardIndex = isPlayerRow ? (row - 4) * 7 + col : -1;
                  const unit = isPlayerRow && boardIndex >= 0 ? board[boardIndex] : null;
                  
                  return (
                    <div
                      key={index}
                      className={`relative aspect-square rounded-lg border-2 ${
                        isEnemyRow 
                          ? 'border-red-600/50 bg-red-900/20' // Enemy area - more visible
                          : unit 
                            ? 'border-blue-400 bg-blue-900/40' 
                            : 'border-slate-500 bg-slate-800/50' // Player area more distinct
                      } ${
                        isPlayerRow ? 'hover:border-blue-300 transition-colors' : ''
                      } ${
                        isDragging && isPlayerRow ? 'border-yellow-400' : ''
                      }`}
                      onDragOver={isPlayerRow ? (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-yellow-400', 'bg-yellow-900/20');
                      } : undefined}
                      onDragLeave={isPlayerRow ? (e) => {
                        e.currentTarget.classList.remove('border-yellow-400', 'bg-yellow-900/20');
                      } : undefined}
                      onDrop={isPlayerRow ? (e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-yellow-400', 'bg-yellow-900/20');
                        handleDrop(boardIndex, 'board');
                      } : undefined}
                    >
                      {/* Player Area Units */}
                      {unit && isPlayerRow && (
                        <div
                          draggable
                          onDragStart={() => handleDragStart(unit, 'board', boardIndex)}
                          onDragEnd={handleDragEnd}
                          className={`absolute inset-0 flex flex-col items-center justify-center text-white cursor-move ${
                            isDragging && draggedUnit?.id === unit.id ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="text-xs font-bold truncate w-full text-center px-1">
                            {unit.name.split(' ')[0]}
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: unit.stars }).map((_, i) => (
                              <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="text-xs text-gray-300">T{unit.tier}</div>
                        </div>
                      )}
                      
                      {/* Enemy Area Indicator */}
                      {isEnemyRow && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-red-400/50 text-xs font-bold">ENEMY</div>
                        </div>
                      )}
                      
                      {/* Row Labels */}
                      {col === 0 && (
                        <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                          {row + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Column Labels */}
              <div className="absolute -top-6 left-0 right-0 grid grid-cols-7 gap-1">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter, index) => (
                  <div key={letter} className="text-center text-xs text-gray-400">
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gamePhase === 'combat' && (
            /* Combat Phase - TFT-Style Arena */
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
              {/* Combat Timer */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
                <div className="bg-black/80 px-4 py-2 rounded-lg border border-gold-400">
                  <div className="text-gold-300 font-bold text-lg">Combat: {combatTimer}s</div>
                </div>
              </div>

              {/* TFT-Style Unit Arena */}
              <div className="absolute inset-8 bg-gradient-to-r from-blue-900/10 to-red-900/10 rounded-lg border border-slate-600">
                {combatUnits.map((unit, index) => (
                  <div
                    key={unit.id}
                    className={`absolute transition-all duration-700 ease-in-out ${
                      unit.isAttacking ? 'scale-110' : 'scale-100'
                    }`}
                    style={{
                      left: `${unit.x}px`,
                      top: `${unit.y}px`,
                      transform: unit.isAttacking ? 'translateX(20px)' : 'translateX(0)',
                      zIndex: unit.health <= 0 ? 1 : 10
                    }}
                  >
                    {/* Unit Icon */}
                    <div className={`relative w-12 h-12 rounded-lg border-2 ${
                      unit.isPlayer 
                        ? 'bg-blue-600 border-blue-400 shadow-blue-400/50' 
                        : 'bg-red-600 border-red-400 shadow-red-400/50'
                    } shadow-lg flex items-center justify-center ${
                      unit.health <= 0 ? 'opacity-30 grayscale' : ''
                    }`}>
                      <div className="text-white font-bold text-sm">
                        {unit.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      {/* Tier Stars */}
                      <div className="absolute -top-1 -right-1 flex">
                        {Array.from({ length: unit.stars }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Compact Health Bar */}
                    <div className="absolute -bottom-3 left-0 right-0">
                      <div className="bg-black/60 rounded-full h-1.5 border border-gray-600">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            unit.health / unit.maxHealth > 0.6 ? 'bg-green-500' :
                            unit.health / unit.maxHealth > 0.3 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(0, (unit.health / unit.maxHealth) * 100)}%` }}
                        />
                      </div>
                      {/* Health Numbers */}
                      <div className="text-center text-xs text-white bg-black/50 rounded px-1 mt-0.5">
                        {Math.ceil(Math.max(0, unit.health))}
                      </div>
                    </div>

                    {/* Attack Animation Effect */}
                    {unit.isAttacking && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="w-full h-full bg-yellow-400/30 rounded-lg animate-pulse" />
                        <div className="absolute -top-2 -right-2 text-yellow-400 font-bold animate-bounce">
                          ⚡
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Battle Info Overlay */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-lg px-6 py-3 border border-slate-600">
                <div className="text-center text-white">
                  <div className="text-sm font-bold">⚔️ SHADOW ARMY vs DUNGEON FORCES ⚔️</div>
                  <div className="text-xs text-gray-300 mt-1">
                    Player: {combatUnits.filter(u => u.isPlayer && u.health > 0).length} | 
                    Enemy: {combatUnits.filter(u => !u.isPlayer && u.health > 0).length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Panel */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-4">
          {/* Shop */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold">Shop</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={buyExperience}
                  disabled={gold < 4 || level >= 9}
                  size="sm"
                  className="text-xs"
                >
                  Buy XP (4g)
                </Button>
                <Button 
                  onClick={refreshShop}
                  disabled={gold < 2}
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh (2g)
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              {shop.map((slot, index) => (
                <div 
                  key={index}
                  className={`relative bg-slate-700 rounded-lg p-2 min-w-[100px] ${
                    slot.locked ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {slot.character ? (
                    <>
                      <div className="text-white text-xs font-bold text-center mb-1">
                        {slot.character.name}
                      </div>
                      <div className="flex justify-center mb-1">
                        {Array.from({ length: slot.character.stars }).map((_, i) => (
                          <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-400 text-xs mb-1">
                          {slot.cost}g
                        </div>
                        <Button
                          size="sm"
                          onClick={() => buyCharacter(index)}
                          disabled={gold < slot.cost}
                          className="text-xs w-full"
                        >
                          Buy
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="h-16 flex items-center justify-center text-gray-500 text-xs">
                      Empty
                    </div>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-1 right-1 w-4 h-4 p-0"
                    onClick={() => {
                      const newLocked = [...lockedSlots];
                      newLocked[index] = !newLocked[index];
                      setLockedSlots(newLocked);
                    }}
                  >
                    <Lock className={`w-2 h-2 ${slot.locked ? 'text-yellow-400' : 'text-gray-400'}`} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Draggable Bench */}
          <div>
            <h4 className="text-white font-bold mb-2">Bench ({bench.filter(u => u !== null).length}/9)</h4>
            <div className="flex gap-2">
              {bench.map((unit, index) => (
                <div
                  key={index}
                  className={`relative w-16 h-16 rounded border-2 ${
                    unit ? 'border-green-400 bg-green-900/30' : 'border-slate-600 bg-slate-700/30'
                  } hover:border-green-300 transition-colors ${
                    isDragging ? 'border-yellow-400' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-yellow-400', 'bg-yellow-900/20');
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove('border-yellow-400', 'bg-yellow-900/20');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-yellow-400', 'bg-yellow-900/20');
                    handleDrop(index, 'bench');
                  }}
                >
                  {unit && (
                    <div
                      draggable
                      onDragStart={() => handleDragStart(unit, 'bench', index)}
                      onDragEnd={handleDragEnd}
                      className={`absolute inset-0 flex flex-col items-center justify-center text-white cursor-move ${
                        isDragging && draggedUnit?.id === unit.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="text-xs font-bold truncate w-full text-center px-1">
                        {unit.name.substring(0, 4)}
                      </div>
                      <div className="flex">
                        {Array.from({ length: unit.stars }).map((_, i) => (
                          <Star key={i} className="w-1.5 h-1.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Drop Zone Indicator */}
                  {!unit && isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-yellow-400 text-xs font-bold">DROP</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center mt-4">
            {gamePhase === 'setup' && (
              <Button onClick={startCombat} className="px-8 py-2">
                Start Combat
              </Button>
            )}
            {gamePhase === 'combat' && (
              <div className="text-white text-center">
                <div className="font-bold">Combat in Progress</div>
                <div className="text-sm text-gray-400">Auto-battling...</div>
              </div>
            )}
          </div>
        </div>

        {/* Victory/Defeat Overlays */}
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
                <p className="text-yellow-400 mb-6">
                  +{5 + Math.floor(round / 2) + calculateInterest(gold)} Gold, +2 Experience
                </p>
                <Button 
                  onClick={() => {
                    setRound(prev => prev + 1);
                    setGamePhase('setup');
                    generateShop();
                  }} 
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                >
                  Next Round
                </Button>
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
                <Button 
                  onClick={() => onRaidComplete(false, [])} 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                >
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

// Helper function to create characters
const createCharacterFromData = (data: any): Character => {
  return {
    id: data.id || `${data.baseName}_${Date.now()}`,
    name: data.name,
    baseName: data.baseName,
    level: data.level || 1,
    stars: data.stars || 1,
    tier: data.tier,
    health: data.health,
    maxHealth: data.health,
    mana: 0,
    maxMana: data.maxMana || 100,
    attack: data.attack,
    defense: data.defense,
    attackSpeed: data.attackSpeed || 1.0,
    x: 0,
    y: 0,
    hexX: 0,
    hexY: 0,
    facing: data.isPlayer === false ? 'left' : 'right',
    isPlayer: data.isPlayer !== false,
    traits: data.traits || [],
    abilities: data.abilities || [],
    items: [],
    statusEffects: [],
    isAttacking: false,
    attackCooldown: 0,
    critChance: 25,
    dodgeChance: 0,
    range: data.range || 1,
  };
};

// Champion Data (Solo Leveling themed with Jin-Woo's Shadow Army)
const CHAMPION_DATA = [
  // Tier 1 Champions - Basic Shadows
  {
    baseName: 'shadow_soldier',
    name: 'Shadow Soldier',
    tier: 1,
    health: 500,
    attack: 50,
    defense: 25,
    traits: ['Shadow', 'Warrior'],
    abilities: [],
  },
  {
    baseName: 'igris_base',
    name: 'Igris (Base)',
    tier: 1,
    health: 650,
    attack: 55,
    defense: 35,
    traits: ['Shadow', 'Knight'],
    abilities: [{
      id: 'sword_mastery',
      name: 'Sword Mastery',
      manaCost: 40,
      cooldown: 4000,
      currentCooldown: 0,
      type: 'damage',
      range: 150,
      targeting: 'single',
      effect: { damage: 80 }
    }],
  },
  {
    baseName: 'tank',
    name: 'Tank',
    tier: 1,
    health: 700,
    attack: 35,
    defense: 50,
    traits: ['Shadow', 'Tank'],
    abilities: [{
      id: 'shield_bash',
      name: 'Shield Bash',
      manaCost: 30,
      cooldown: 3000,
      currentCooldown: 0,
      type: 'damage',
      range: 100,
      targeting: 'single',
      effect: { damage: 60 }
    }],
  },
  
  // Tier 2 Champions - Elite Shadows
  {
    baseName: 'iron',
    name: 'Iron',
    tier: 2,
    health: 800,
    attack: 70,
    defense: 40,
    traits: ['Shadow', 'Warrior'],
    abilities: [{
      id: 'berserker_rage',
      name: 'Berserker Rage',
      manaCost: 50,
      cooldown: 5000,
      currentCooldown: 0,
      type: 'buff',
      range: 0,
      targeting: 'self',
      effect: { damage: 50 }
    }],
  },
  {
    baseName: 'kaisel_young',
    name: 'Kaisel (Young)',
    tier: 2,
    health: 650,
    attack: 85,
    defense: 30,
    traits: ['Shadow', 'Dragon'],
    abilities: [{
      id: 'dragon_breath',
      name: 'Dragon Breath',
      manaCost: 60,
      cooldown: 6000,
      currentCooldown: 0,
      type: 'aoe',
      range: 200,
      targeting: 'area',
      effect: { damage: 70, aoeRadius: 150 }
    }],
  },
  {
    baseName: 'jima',
    name: 'Jima',
    tier: 2,
    health: 700,
    attack: 75,
    defense: 35,
    traits: ['Shadow', 'Archer'],
    abilities: [{
      id: 'poison_arrow',
      name: 'Poison Arrow',
      manaCost: 45,
      cooldown: 4000,
      currentCooldown: 0,
      type: 'damage',
      range: 300,
      targeting: 'single',
      effect: { damage: 60 }
    }],
  },
  
  // Tier 3 Champions - Named Generals
  {
    baseName: 'igris_knight',
    name: 'Igris, Blood Red Commander',
    tier: 3,
    health: 1100,
    attack: 120,
    defense: 70,
    traits: ['Shadow', 'Knight', 'Elite'],
    abilities: [{
      id: 'red_blade',
      name: 'Crimson Blade',
      manaCost: 70,
      cooldown: 5000,
      currentCooldown: 0,
      type: 'damage',
      range: 150,
      targeting: 'single',
      effect: { damage: 140 }
    }],
  },
  {
    baseName: 'tusk',
    name: 'Tusk, High Orc Commander',
    tier: 3,
    health: 1200,
    attack: 110,
    defense: 80,
    traits: ['Shadow', 'Orc', 'Elite'],
    abilities: [{
      id: 'warcry',
      name: 'Warcry',
      manaCost: 60,
      cooldown: 8000,
      currentCooldown: 0,
      type: 'buff',
      range: 250,
      targeting: 'all',
      effect: { damage: 30 }
    }],
  },
  {
    baseName: 'greed',
    name: 'Greed',
    tier: 3,
    health: 950,
    attack: 130,
    defense: 55,
    traits: ['Shadow', 'Assassin'],
    abilities: [{
      id: 'shadow_step',
      name: 'Shadow Step',
      manaCost: 50,
      cooldown: 4000,
      currentCooldown: 0,
      type: 'damage',
      range: 200,
      targeting: 'single',
      effect: { damage: 150 }
    }],
  },
  
  // Tier 4 Champions - Elite Shadows & S-Rank Hunters
  {
    baseName: 'beru',
    name: 'Beru, The Ant King',
    tier: 4,
    health: 1500,
    attack: 180,
    defense: 100,
    traits: ['Shadow', 'Ant', 'Marshal'],
    abilities: [{
      id: 'healing_shout',
      name: 'Healing Shout',
      manaCost: 90,
      cooldown: 8000,
      currentCooldown: 0,
      type: 'heal',
      range: 250,
      targeting: 'all',
      effect: { heal: 200 }
    }],
  },
  {
    baseName: 'kamish',
    name: 'Kamish, The Calamity Dragon',
    tier: 4,
    health: 1600,
    attack: 200,
    defense: 80,
    traits: ['Shadow', 'Dragon', 'Calamity'],
    abilities: [{
      id: 'dragons_breath',
      name: "Dragon's Breath",
      manaCost: 120,
      cooldown: 10000,
      currentCooldown: 0,
      type: 'aoe',
      range: 400,
      targeting: 'area',
      effect: { damage: 180, aoeRadius: 250 }
    }],
  },
  {
    baseName: 'cha_haein',
    name: 'Cha Hae-In',
    tier: 4,
    health: 1200,
    attack: 170,
    defense: 70,
    traits: ['S-Rank', 'Hunter', 'Swordsman'],
    abilities: [{
      id: 'sword_dance',
      name: 'Sword Dance',
      manaCost: 90,
      cooldown: 7000,
      currentCooldown: 0,
      type: 'damage',
      range: 180,
      targeting: 'single',
      effect: { damage: 200 }
    }],
  },
  {
    baseName: 'greed',
    name: 'Greed, S-Rank Hunter Shadow',
    tier: 4,
    health: 1300,
    attack: 160,
    defense: 75,
    traits: ['Shadow', 'Hunter', 'S-Rank'],
    abilities: [{
      id: 'shadow_burst',
      name: 'Shadow Burst',
      manaCost: 75,
      cooldown: 6000,
      currentCooldown: 0,
      type: 'damage',
      range: 200,
      targeting: 'single',
      effect: { damage: 180 }
    }],
  },
  
  // Tier 5 Champions - The Ultimate Powers
  {
    baseName: 'bellion',
    name: 'Bellion, The Grand Marshal',
    tier: 5,
    health: 2200,
    attack: 280,
    defense: 150,
    traits: ['Shadow', 'Marshal', 'Grand Marshal'],
    abilities: [{
      id: 'centipede_blade',
      name: 'Centipede Blade Extension',
      manaCost: 140,
      cooldown: 8000,
      currentCooldown: 0,
      type: 'damage',
      range: 350,
      targeting: 'single',
      effect: { damage: 320 }
    }],
  },
  {
    baseName: 'jinwoo',
    name: 'Sung Jin-Woo, Shadow Monarch',
    tier: 5,
    health: 2500,
    attack: 300,
    defense: 180,
    traits: ['Shadow Monarch', 'S-Rank', 'Ruler'],
    abilities: [{
      id: 'arise',
      name: 'Arise',
      manaCost: 200,
      cooldown: 15000,
      currentCooldown: 0,
      type: 'summon',
      range: 500,
      targeting: 'area',
      effect: { summonType: 'shadow_army', damage: 250 }
    }],
  },
];

// Enemy Monster Data - Dungeon creatures and rival hunters
const ENEMY_DATA = [
  // Tier 1 - Basic Dungeon Monsters
  {
    baseName: 'goblin_warrior',
    name: 'Goblin Warrior',
    tier: 1,
    health: 450,
    attack: 45,
    defense: 25,
    traits: ['Goblin', 'Beast'],
    abilities: [{
      id: 'club_smash',
      name: 'Club Smash',
      manaCost: 50,
      cooldown: 4000,
      currentCooldown: 0,
      type: 'damage',
      range: 100,
      targeting: 'single',
      effect: { damage: 60 }
    }],
  },
  {
    baseName: 'orc_grunt',
    name: 'Orc Grunt',
    tier: 1,
    health: 500,
    attack: 50,
    defense: 30,
    traits: ['Orc', 'Beast'],
    abilities: [{
      id: 'rage_strike',
      name: 'Rage Strike',
      manaCost: 60,
      cooldown: 5000,
      currentCooldown: 0,
      type: 'damage',
      range: 120,
      targeting: 'single',
      effect: { damage: 70 }
    }],
  },
  {
    baseName: 'skeleton_soldier',
    name: 'Skeleton Soldier',
    tier: 1,
    health: 400,
    attack: 55,
    defense: 20,
    traits: ['Undead', 'Skeleton'],
    abilities: [],
  },

  // Tier 2 - Elite Monsters
  {
    baseName: 'hobgoblin_chief',
    name: 'Hobgoblin Chief',
    tier: 2,
    health: 700,
    attack: 75,
    defense: 45,
    traits: ['Goblin', 'Elite'],
    abilities: [{
      id: 'war_cry',
      name: 'War Cry',
      manaCost: 70,
      cooldown: 6000,
      currentCooldown: 0,
      type: 'buff',
      range: 200,
      targeting: 'all',
      effect: { damage: 0 }
    }],
  },
  {
    baseName: 'ice_bear',
    name: 'Ice Bear',
    tier: 2,
    health: 800,
    attack: 80,
    defense: 60,
    traits: ['Beast', 'Ice'],
    abilities: [{
      id: 'frost_claw',
      name: 'Frost Claw',
      manaCost: 80,
      cooldown: 7000,
      currentCooldown: 0,
      type: 'damage',
      range: 150,
      targeting: 'single',
      effect: { damage: 100 }
    }],
  },

  // Tier 3 - High-Rank Monsters
  {
    baseName: 'demon_noble',
    name: 'Demon Noble',
    tier: 3,
    health: 1200,
    attack: 120,
    defense: 70,
    traits: ['Demon', 'Noble'],
    abilities: [{
      id: 'dark_magic',
      name: 'Dark Magic',
      manaCost: 90,
      cooldown: 8000,
      currentCooldown: 0,
      type: 'aoe',
      range: 250,
      targeting: 'area',
      effect: { damage: 130, aoeRadius: 150 }
    }],
  },
  {
    baseName: 'red_orc_general',
    name: 'Red Orc General',
    tier: 3,
    health: 1300,
    attack: 130,
    defense: 80,
    traits: ['Orc', 'General'],
    abilities: [{
      id: 'battle_roar',
      name: 'Battle Roar',
      manaCost: 100,
      cooldown: 9000,
      currentCooldown: 0,
      type: 'aoe',
      range: 300,
      targeting: 'area',
      effect: { damage: 140, aoeRadius: 200 }
    }],
  },

  // Tier 4 - Boss-Level Threats
  {
    baseName: 'steel_fanged_lycan',
    name: 'Steel-Fanged Lycan',
    tier: 4,
    health: 1600,
    attack: 170,
    defense: 90,
    traits: ['Beast', 'Boss'],
    abilities: [{
      id: 'pack_hunt',
      name: 'Pack Hunt',
      manaCost: 120,
      cooldown: 10000,
      currentCooldown: 0,
      type: 'damage',
      range: 200,
      targeting: 'single',
      effect: { damage: 200 }
    }],
  },
  {
    baseName: 'arch_lich',
    name: 'Arch Lich',
    tier: 4,
    health: 1500,
    attack: 180,
    defense: 75,
    traits: ['Undead', 'Magic', 'Boss'],
    abilities: [{
      id: 'death_ray',
      name: 'Death Ray',
      manaCost: 140,
      cooldown: 12000,
      currentCooldown: 0,
      type: 'aoe',
      range: 400,
      targeting: 'area',
      effect: { damage: 190, aoeRadius: 250 }
    }],
  },

  // Tier 5 - Raid Bosses
  {
    baseName: 'flame_dragon',
    name: 'Ancient Flame Dragon',
    tier: 5,
    health: 2500,
    attack: 250,
    defense: 120,
    traits: ['Dragon', 'Fire', 'Ancient'],
    abilities: [{
      id: 'inferno_breath',
      name: 'Inferno Breath',
      manaCost: 180,
      cooldown: 15000,
      currentCooldown: 0,
      type: 'aoe',
      range: 500,
      targeting: 'area',
      effect: { damage: 280, aoeRadius: 300 }
    }],
  },
  {
    baseName: 'demon_king',
    name: 'Demon King Baran',
    tier: 5,
    health: 2800,
    attack: 280,
    defense: 150,
    traits: ['Demon', 'Monarch', 'Boss'],
    abilities: [{
      id: 'monarch_strike',
      name: 'Monarch Strike',
      manaCost: 200,
      cooldown: 18000,
      currentCooldown: 0,
      type: 'damage',
      range: 350,
      targeting: 'single',
      effect: { damage: 350 }
    }],
  },
];

// Trait System Data
const TRAIT_DATA: Trait[] = [
  {
    name: 'Shadow',
    description: 'Shadow units gain attack speed and lifesteal',
    color: '#8b5cf6',
    thresholds: [
      { count: 2, name: 'Shadow Bond', effect: '+15% Attack Speed', bonuses: { attack: 10, special: 'speed_boost' } },
      { count: 4, name: 'Shadow Army', effect: '+30% Attack Speed, 10% Lifesteal', bonuses: { attack: 25, special: 'lifesteal' } },
      { count: 6, name: 'Shadow Legion', effect: '+50% Attack Speed, 20% Lifesteal, Summon Shadow', bonuses: { attack: 40, special: 'lifesteal_summon' } },
      { count: 8, name: 'Shadow Monarch', effect: 'All shadows become unstoppable', bonuses: { attack: 80, defense: 40, special: 'monarch_power' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Knight',
    description: 'Knights gain armor and defensive abilities',
    color: '#64748b',
    thresholds: [
      { count: 2, name: 'Chivalry', effect: '+25 Armor, +10% Block Chance', bonuses: { defense: 25, special: 'block' } },
      { count: 4, name: 'Knight Order', effect: '+50 Armor, Damage Reduction', bonuses: { defense: 50, health: 200, special: 'damage_reduction' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Dragon',
    description: 'Dragons have massive AOE damage and flight',
    color: '#dc2626',
    thresholds: [
      { count: 1, name: 'Dragon Power', effect: '+100% AOE Damage, Flight', bonuses: { attack: 50, mana: 50, special: 'aoe_boost' } },
      { count: 2, name: 'Dragon Lord', effect: 'Massive AOE, Fear Aura', bonuses: { attack: 100, mana: 100, special: 'fear_aura' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Marshal',
    description: 'Marshals boost all nearby allies',
    color: '#f59e0b',
    thresholds: [
      { count: 1, name: 'Field Command', effect: 'All allies +20% stats', bonuses: { special: 'ally_boost_small' } },
      { count: 2, name: 'Grand Marshal', effect: 'All allies +40% stats', bonuses: { special: 'ally_boost_large' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Ant',
    description: 'Ant units have paralysis and swarm abilities',
    color: '#059669',
    thresholds: [
      { count: 2, name: 'Hive Mind', effect: 'Paralysis on attacks', bonuses: { attack: 15, special: 'paralysis' } },
      { count: 4, name: 'Ant Colony', effect: 'Swarm attacks, Speed boost', bonuses: { attack: 35, special: 'swarm' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Assassin',
    description: 'Assassins have high crit and stealth',
    color: '#6b21a8',
    thresholds: [
      { count: 2, name: 'Shadow Strike', effect: '+50% Crit Chance', bonuses: { critChance: 50, attack: 20 } },
      { count: 4, name: 'Shadow Master', effect: '+75% Crit, Stealth', bonuses: { critChance: 75, attack: 40, special: 'stealth' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Orc',
    description: 'Orcs gain rage and berserker abilities',
    color: '#dc2626',
    thresholds: [
      { count: 2, name: 'Orcish Fury', effect: '+30 Attack, Rage on low health', bonuses: { attack: 30, special: 'rage' } },
      { count: 4, name: 'Waaagh!', effect: '+60 Attack, Berserker mode', bonuses: { attack: 60, special: 'berserker' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Hunter',
    description: 'Hunters gain critical strike chance and damage',
    color: '#10b981',
    thresholds: [
      { count: 2, name: 'Professional', effect: '+20% Crit Chance', bonuses: { critChance: 20 } },
      { count: 4, name: 'Elite Hunter', effect: '+35% Crit Chance, +25% Crit Damage', bonuses: { critChance: 35, special: 'crit_damage' } },
      { count: 6, name: 'Hunter Association', effect: '+50% Crit Chance, +50% Crit Damage', bonuses: { critChance: 50, special: 'mega_crit' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'S-Rank',
    description: 'S-Rank hunters have massive stat bonuses',
    color: '#f59e0b',
    thresholds: [
      { count: 1, name: 'S-Rank Power', effect: '+50% All Stats', bonuses: { attack: 50, defense: 50, health: 50 } },
      { count: 2, name: 'National Level', effect: '+100% All Stats, Immunity', bonuses: { attack: 100, defense: 100, health: 100, special: 'immunity' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Shadow Monarch',
    description: 'The ultimate shadow ruler',
    color: '#000000',
    thresholds: [
      { count: 1, name: 'Monarch Authority', effect: 'All shadows +100% stats, Arise ability', bonuses: { special: 'monarch_authority' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
];