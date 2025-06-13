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
    buff?: {
      stat: string;
      amount: number;
      duration: number;
    };
    debuff?: {
      stat: string;
      amount: number;
      duration: number;
    };
  };
}

interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats: {
    attack?: number;
    defense?: number;
    health?: number;
    mana?: number;
    critChance?: number;
    attackSpeed?: number;
  };
  ability?: {
    name: string;
    description: string;
    cooldown: number;
    manaCost: number;
  };
}

interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff';
  duration: number;
  effect: {
    stat: string;
    amount: number;
  };
}

interface Trait {
  name: string;
  description: string;
  thresholds: number[];
  activeLevel: number;
  bonuses: {
    level: number;
    effect: string;
    stats: any;
  }[];
}

interface ShopSlot {
  character: Character | null;
  cost: number;
  locked: boolean;
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (result: any) => void;
  playerLevel: number;
  affectionLevel: number;
}

// Shadow Character Data with Canonical Rankings
const SHADOW_DATA = [
  // Tier 5 - Grand Marshal
  {
    id: 'bellion',
    name: 'Bellion, The Grand Marshal',
    baseName: 'Bellion',
    tier: 5,
    baseHealth: 1200,
    baseMana: 150,
    baseAttack: 120,
    baseDefense: 80,
    attackSpeed: 1.2,
    critChance: 25,
    dodgeChance: 15,
    range: 1.5,
    traits: ['Shadow', 'Commander', 'Elite'],
    abilities: [
      {
        id: 'shadow_command',
        name: 'Shadow Command',
        manaCost: 100,
        cooldown: 8,
        currentCooldown: 0,
        type: 'buff',
        range: 999,
        targeting: 'all',
        effect: {
          buff: { stat: 'attack', amount: 50, duration: 5 }
        }
      }
    ]
  },
  
  // Tier 4 - Elite Generals
  {
    id: 'beru',
    name: 'Beru, The Ant King',
    baseName: 'Beru',
    tier: 4,
    baseHealth: 800,
    baseMana: 120,
    baseAttack: 90,
    baseDefense: 60,
    attackSpeed: 1.5,
    critChance: 20,
    dodgeChance: 25,
    range: 1,
    traits: ['Shadow', 'Beast', 'Assassin'],
    abilities: [
      {
        id: 'frenzy',
        name: 'Frenzy',
        manaCost: 80,
        cooldown: 6,
        currentCooldown: 0,
        type: 'buff',
        range: 1,
        targeting: 'self',
        effect: {
          buff: { stat: 'attackSpeed', amount: 100, duration: 4 }
        }
      }
    ]
  },
  
  {
    id: 'igris',
    name: 'Igris, Blood-Red Commander',
    baseName: 'Igris',
    tier: 4,
    baseHealth: 700,
    baseMana: 100,
    baseAttack: 110,
    baseDefense: 50,
    attackSpeed: 1.3,
    critChance: 30,
    dodgeChance: 10,
    range: 1.5,
    traits: ['Shadow', 'Knight', 'Elite'],
    abilities: [
      {
        id: 'blood_slash',
        name: 'Blood Slash',
        manaCost: 75,
        cooldown: 5,
        currentCooldown: 0,
        type: 'damage',
        range: 2,
        targeting: 'single',
        effect: {
          damage: 200
        }
      }
    ]
  },

  // Tier 3 - Named Elites
  {
    id: 'greed',
    name: 'Greed',
    baseName: 'Greed',
    tier: 3,
    baseHealth: 500,
    baseMana: 80,
    baseAttack: 80,
    baseDefense: 40,
    attackSpeed: 1.4,
    critChance: 15,
    dodgeChance: 20,
    range: 2,
    traits: ['Shadow', 'Assassin'],
    abilities: [
      {
        id: 'shadow_strike',
        name: 'Shadow Strike',
        manaCost: 60,
        cooldown: 4,
        currentCooldown: 0,
        type: 'damage',
        range: 3,
        targeting: 'single',
        effect: {
          damage: 150
        }
      }
    ]
  },

  {
    id: 'iron',
    name: 'Iron',
    baseName: 'Iron',
    tier: 3,
    baseHealth: 600,
    baseMana: 60,
    baseAttack: 70,
    baseDefense: 70,
    attackSpeed: 1.0,
    critChance: 10,
    dodgeChance: 5,
    range: 1,
    traits: ['Shadow', 'Tank'],
    abilities: [
      {
        id: 'taunt',
        name: 'Taunt',
        manaCost: 50,
        cooldown: 6,
        currentCooldown: 0,
        type: 'debuff',
        range: 2,
        targeting: 'area',
        effect: {
          debuff: { stat: 'targeting', amount: 1, duration: 3 }
        }
      }
    ]
  },

  // Tier 2 - Veterans
  {
    id: 'tusk',
    name: 'Tusk',
    baseName: 'Tusk',
    tier: 2,
    baseHealth: 400,
    baseMana: 50,
    baseAttack: 60,
    baseDefense: 50,
    attackSpeed: 1.1,
    critChance: 8,
    dodgeChance: 12,
    range: 1,
    traits: ['Shadow', 'Beast'],
    abilities: [
      {
        id: 'charge',
        name: 'Charge',
        manaCost: 40,
        cooldown: 5,
        currentCooldown: 0,
        type: 'damage',
        range: 2,
        targeting: 'single',
        effect: {
          damage: 100
        }
      }
    ]
  },

  {
    id: 'tank',
    name: 'Tank',
    baseName: 'Tank',
    tier: 2,
    baseHealth: 450,
    baseMana: 40,
    baseAttack: 45,
    baseDefense: 60,
    attackSpeed: 0.9,
    critChance: 5,
    dodgeChance: 8,
    range: 1,
    traits: ['Shadow', 'Tank'],
    abilities: [
      {
        id: 'shield_bash',
        name: 'Shield Bash',
        manaCost: 35,
        cooldown: 4,
        currentCooldown: 0,
        type: 'damage',
        range: 1,
        targeting: 'single',
        effect: {
          damage: 80
        }
      }
    ]
  },

  // Tier 1 - Basic Shadows
  {
    id: 'shadow_soldier',
    name: 'Shadow Soldier',
    baseName: 'Shadow Soldier',
    tier: 1,
    baseHealth: 250,
    baseMana: 30,
    baseAttack: 40,
    baseDefense: 25,
    attackSpeed: 1.0,
    critChance: 5,
    dodgeChance: 10,
    range: 1,
    traits: ['Shadow'],
    abilities: [
      {
        id: 'basic_attack',
        name: 'Basic Attack',
        manaCost: 20,
        cooldown: 3,
        currentCooldown: 0,
        type: 'damage',
        range: 1,
        targeting: 'single',
        effect: {
          damage: 60
        }
      }
    ]
  }
];

// Dungeon Enemy Data
const ENEMY_DATA = [
  {
    id: 'goblin_warrior',
    name: 'Goblin Warrior',
    tier: 1,
    baseHealth: 200,
    baseMana: 20,
    baseAttack: 35,
    baseDefense: 15,
    attackSpeed: 1.2,
    critChance: 5,
    dodgeChance: 15,
    range: 1,
    traits: ['Monster', 'Goblin'],
    abilities: []
  },
  {
    id: 'orc_berserker',
    name: 'Orc Berserker',
    tier: 2,
    baseHealth: 350,
    baseMana: 30,
    baseAttack: 55,
    baseDefense: 20,
    attackSpeed: 1.0,
    critChance: 10,
    dodgeChance: 5,
    range: 1,
    traits: ['Monster', 'Orc'],
    abilities: []
  },
  {
    id: 'troll_guardian',
    name: 'Troll Guardian',
    tier: 3,
    baseHealth: 600,
    baseMana: 40,
    baseAttack: 70,
    baseDefense: 40,
    attackSpeed: 0.8,
    critChance: 8,
    dodgeChance: 3,
    range: 1,
    traits: ['Monster', 'Troll', 'Tank'],
    abilities: []
  },
  {
    id: 'dragon_whelp',
    name: 'Dragon Whelp',
    tier: 4,
    baseHealth: 800,
    baseMana: 100,
    baseAttack: 90,
    baseDefense: 50,
    attackSpeed: 1.1,
    critChance: 15,
    dodgeChance: 20,
    range: 2,
    traits: ['Monster', 'Dragon'],
    abilities: []
  },
  {
    id: 'demon_lord',
    name: 'Demon Lord',
    tier: 5,
    baseHealth: 1500,
    baseMana: 200,
    baseAttack: 150,
    baseDefense: 80,
    attackSpeed: 1.3,
    critChance: 25,
    dodgeChance: 15,
    range: 2,
    traits: ['Monster', 'Demon', 'Boss'],
    abilities: []
  }
];

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
  const [isShopExpanded, setIsShopExpanded] = useState(true);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  
  // Visual Effects
  const [damageNumbers, setDamageNumbers] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);

  // Level up mechanics - determines max team size
  const LEVEL_REQUIREMENTS = [0, 2, 6, 10, 20, 36, 56, 80, 100]; // XP needed for each level
  const TEAM_SIZE_BY_LEVEL = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Max units on board

  // Initialize character pool
  useEffect(() => {
    if (!isVisible) return;
    
    const pool: {[key: string]: number} = {};
    SHADOW_DATA.forEach(char => {
      pool[char.id] = CHARACTER_POOLS[char.tier as keyof typeof CHARACTER_POOLS];
    });
    setCharacterPool(pool);
    generateShop();
    generateItems();
  }, [isVisible]);

  // Helper function to create character from data
  const createCharacterFromData = (data: any) => {
    return {
      ...data,
      level: 1,
      stars: 1,
      health: data.baseHealth,
      maxHealth: data.baseHealth,
      mana: 0,
      maxMana: data.baseMana,
      attack: data.baseAttack,
      defense: data.baseDefense,
      x: 0,
      y: 0,
      hexX: 0,
      hexY: 0,
      facing: 'right' as const,
      isPlayer: true,
      items: [],
      statusEffects: [],
      isAttacking: false,
      attackCooldown: 0
    };
  };

  // Generate random items for carousel
  const generateItems = () => {
    const itemTypes = ['weapon', 'armor', 'accessory'];
    const items: Item[] = [];
    
    for (let i = 0; i < 3; i++) {
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const item: Item = {
        id: `item_${Date.now()}_${i}`,
        name: type === 'weapon' ? 'Shadow Blade' : type === 'armor' ? 'Monarch Armor' : 'Power Ring',
        type: type as any,
        rarity: Math.random() > 0.7 ? 'legendary' : Math.random() > 0.4 ? 'epic' : 'common',
        stats: {
          attack: type === 'weapon' ? 15 + Math.floor(Math.random() * 20) : 0,
          defense: type === 'armor' ? 10 + Math.floor(Math.random() * 15) : 0,
          health: Math.floor(Math.random() * 100),
          mana: Math.floor(Math.random() * 50)
        },
        ability: {
          name: 'Shadow Strike',
          description: 'Deal bonus damage',
          cooldown: 3,
          manaCost: 25
        }
      };
      items.push(item);
    }
    
    setAvailableItems(items);
  };

  // Generate enemy team and position them on board
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
      if (index < 14) { // Front 2 rows
        newEnemyBoard[index] = enemy;
      }
    });
    
    setEnemyBoard(newEnemyBoard);
    return enemies;
  };

  // Generate shop
  const generateShop = () => {
    const newShop: ShopSlot[] = [];
    
    for (let i = 0; i < 5; i++) {
      if (lockedSlots[i] && shop[i]) {
        // Keep locked slots
        newShop.push(shop[i]);
        continue;
      }
      
      // Generate new character based on level odds
      const availableChars = SHADOW_DATA.filter(char => 
        characterPool[char.id] > 0
      );
      
      if (availableChars.length > 0) {
        const randomChar = availableChars[Math.floor(Math.random() * availableChars.length)];
        const character = createCharacterFromData(randomChar);
        
        newShop.push({
          character,
          cost: randomChar.tier,
          locked: false
        });
      } else {
        newShop.push({
          character: null,
          cost: 0,
          locked: false
        });
      }
    }
    
    setShop(newShop);
  };

  // Buy character from shop
  const buyCharacter = (shopIndex: number) => {
    const slot = shop[shopIndex];
    if (!slot.character || gold < slot.cost) return;
    
    // Check for available bench space
    const benchIndex = bench.findIndex(unit => unit === null);
    if (benchIndex === -1) return;
    
    // Remove from character pool
    setCharacterPool(prev => ({
      ...prev,
      [slot.character!.baseName]: prev[slot.character!.baseName] - 1
    }));
    
    // Add to bench
    setBench(prev => {
      const newBench = [...prev];
      newBench[benchIndex] = slot.character;
      return newBench;
    });
    
    // Deduct gold
    setGold(prev => prev - slot.cost);
    
    // Clear shop slot
    setShop(prev => {
      const newShop = [...prev];
      newShop[shopIndex] = { character: null, cost: 0, locked: false };
      return newShop;
    });
  };

  // Refresh shop
  const refreshShop = () => {
    if (gold < 2) return;
    setGold(prev => prev - 2);
    generateShop();
  };

  // Buy experience
  const buyExperience = () => {
    if (gold < 4 || level >= 9) return;
    setGold(prev => prev - 4);
    setExperience(prev => {
      const newExp = prev + 4;
      const requiredExp = LEVEL_REQUIREMENTS[level];
      if (newExp >= requiredExp && level < 9) {
        setLevel(prevLevel => prevLevel + 1);
        setMaxTeamSize(prevLevel => TEAM_SIZE_BY_LEVEL[prevLevel + 1]);
        return newExp - requiredExp;
      }
      return newExp;
    });
  };

  // Calculate interest (max 5 gold per 10 gold held)
  const calculateInterest = (currentGold: number) => {
    return Math.min(Math.floor(currentGold / 10), 5);
  };

  // Drag and drop handlers
  const handleDragStart = (unit: Character, source: 'board' | 'bench', index: number) => {
    setDraggedUnit(unit);
    setDragSource(source);
    setDragSourceIndex(index);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedUnit(null);
    setDragSource(null);
    setDragSourceIndex(null);
  };

  const handleDrop = (targetIndex: number, targetLocation: 'board' | 'bench') => {
    if (!draggedUnit || !dragSource || dragSourceIndex === null) return;
    
    // Check team size limit for board placement (only if coming from bench to board)
    if (targetLocation === 'board' && dragSource === 'bench') {
      const currentTeamSize = board.filter(unit => unit !== null).length;
      if (currentTeamSize >= maxTeamSize) return;
    }
    
    // Handle the move/swap in a single operation to avoid state conflicts
    if (targetLocation === 'board') {
      setBoard(prev => {
        const newBoard = [...prev];
        const existingUnit = newBoard[targetIndex];
        
        // Place the dragged unit at target position
        newBoard[targetIndex] = draggedUnit;
        
        // Handle source cleanup and swapping
        if (dragSource === 'board') {
          // If swapping units on board
          newBoard[dragSourceIndex] = existingUnit;
        } else {
          // If moving from bench to board, clear bench slot and handle existing unit
          setBench(prevBench => {
            const newBench = [...prevBench];
            newBench[dragSourceIndex] = null;
            
            // If there was a unit at target, move it to bench
            if (existingUnit) {
              const emptyBenchSlot = newBench.findIndex(slot => slot === null);
              if (emptyBenchSlot !== -1) {
                newBench[emptyBenchSlot] = existingUnit;
              }
            }
            return newBench;
          });
        }
        
        return newBoard;
      });
    } else {
      // Moving to bench
      setBench(prev => {
        const newBench = [...prev];
        const existingUnit = newBench[targetIndex];
        
        // Place the dragged unit at target position
        newBench[targetIndex] = draggedUnit;
        
        // Handle source cleanup and swapping
        if (dragSource === 'bench') {
          // If swapping units on bench
          newBench[dragSourceIndex] = existingUnit;
        } else {
          // If moving from board to bench, clear board slot and handle existing unit
          setBoard(prevBoard => {
            const newBoard = [...prevBoard];
            newBoard[dragSourceIndex] = null;
            
            // If there was a unit at target, move it to board
            if (existingUnit) {
              const emptyBoardSlot = newBoard.findIndex(slot => slot === null);
              if (emptyBoardSlot !== -1) {
                newBoard[emptyBoardSlot] = existingUnit;
              }
            }
            return newBoard;
          });
        }
        
        return newBench;
      });
    }
  };

  // Start combat
  const startCombat = () => {
    const playerUnits = board.filter(unit => unit !== null);
    if (playerUnits.length === 0) return;

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

  // Initialize shop on component mount
  useEffect(() => {
    generateShop();
  }, []);

  // Combat simulation
  useEffect(() => {
    if (gamePhase !== 'combat' || !isAutoCombat) return;

    let combatInterval: NodeJS.Timeout;
    let timerInterval: NodeJS.Timeout;

    // Combat timer countdown
    timerInterval = setInterval(() => {
      setCombatTimer(prev => {
        if (prev <= 1) {
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

        if (playerAlive === 0) {
          setGamePhase('defeat');
          setIsAutoCombat(false);
        } else if (enemyAlive === 0) {
          setGamePhase('victory');
          setIsAutoCombat(false);
          // Award gold and interest
          const bonusGold = round * 2;
          const interestGold = calculateInterest(gold);
          setGold(prev => prev + bonusGold + interestGold);
        }

        return currentUnits;
      });
    }, 500);

    return () => {
      clearInterval(combatInterval);
      clearInterval(timerInterval);
      clearInterval(victoryCheckInterval);
    };
  }, [gamePhase, isAutoCombat, activeTraits, round, gold]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full h-full max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-white font-bold text-xl">Strategic Dungeon Raid</div>
          </div>

          {/* Game Stats */}
          <div className="flex gap-2">
            <div className="bg-slate-800 rounded px-3 py-1 text-white text-sm">
              Round {round}
            </div>
            <div className="bg-yellow-600 rounded px-3 py-1 text-white text-sm">
              Gold: {gold}
            </div>
            <div className="bg-blue-600 rounded px-3 py-1 text-white text-sm">
              Level: {level}
            </div>
            <div className="bg-purple-600 rounded px-3 py-1 text-white text-sm">
              XP: {experience}/{level < 9 ? LEVEL_REQUIREMENTS[level] : 'MAX'}
            </div>
            <div className="bg-green-600 rounded px-3 py-1 text-white text-sm">
              Interest: +{calculateInterest(gold)}
            </div>
          </div>
        </div>

        {/* Active Synergies Display */}
        {activeTraits.length > 0 && (
          <div className="absolute top-20 left-4 bg-black/70 rounded-lg p-3 border border-slate-600 z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white font-bold text-sm">Active Synergies</span>
            </div>
            <div className="space-y-1">
              {activeTraits.map((trait, index) => (
                <div key={index} className="text-xs text-white">
                  <span className="text-blue-400">{trait.name}</span> ({trait.activeLevel})
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Items Panel - Left Side */}
        <div className="absolute left-4 top-32 w-20 bottom-28 bg-gradient-to-b from-purple-800 to-purple-900 rounded-lg border border-purple-600 p-2">
          <h4 className="text-white font-bold text-xs mb-2 text-center">Items</h4>
          <div className="space-y-2">
            {availableItems.slice(0, 8).map((item, index) => (
              <div 
                key={item.id}
                className="relative bg-purple-700 rounded p-1 cursor-pointer hover:bg-purple-600 transition-colors"
                draggable
                onDragStart={() => setDraggedItem(item)}
                title={`${item.name} - ${item.type}`}
              >
                <div className="text-white text-xs font-bold text-center">
                  {item.name.substring(0, 3)}
                </div>
                <div className="text-purple-200 text-xs text-center">
                  {item.type.substring(0, 4)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Board Area */}
        <div className={`absolute left-28 right-8 top-32 ${isShopExpanded ? 'bottom-96' : 'bottom-44'} bg-gradient-to-b from-slate-700 to-slate-800 rounded-lg border border-slate-600 overflow-hidden transition-all duration-300`}>
          {gamePhase === 'setup' && (
            /* Setup Phase - TFT Authentic Board Layout */
            <div className="absolute inset-2">
              {/* Compact 8x7 TFT Board Grid */}
              <div className="grid grid-cols-7 grid-rows-8 gap-0.5 h-full max-h-[400px] mx-auto" style={{ aspectRatio: '7/8' }}>
                {Array.from({ length: 56 }).map((_, index) => {
                  const col = index % 7;
                  const row = Math.floor(index / 7);
                  const isPlayerRow = row >= 4; // Bottom 4 rows are player area
                  const isEnemyRow = row < 4; // Top 4 rows are enemy area
                  const boardIndex = isPlayerRow ? (row - 4) * 7 + col : -1;
                  const enemyIndex = isEnemyRow ? row * 7 + col : -1;
                  const unit = isPlayerRow && boardIndex >= 0 ? board[boardIndex] : null;
                  const enemy = isEnemyRow && enemyIndex >= 0 ? enemyBoard[enemyIndex] : null;
                  
                  return (
                    <div
                      key={index}
                      className={`relative w-full h-12 rounded border ${
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
                      
                      {/* Enemy Units Display */}
                      {enemy && isEnemyRow && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400">
                          <div className="text-xs font-bold truncate w-full text-center px-1">
                            {enemy.name.split(' ')[0]}
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: enemy.stars }).map((_, i) => (
                              <Star key={i} className="w-2 h-2 fill-red-400 text-red-400" />
                            ))}
                          </div>
                          <div className="text-xs text-red-300">T{enemy.tier}</div>
                        </div>
                      )}
                      
                      {/* Empty Enemy Area Indicator */}
                      {!enemy && isEnemyRow && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-red-400/30 text-xs">ENEMY</div>
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
              {/* Combat Units Display */}
              <div className="relative w-full h-full">
                {combatUnits.map((unit, index) => (
                  <div
                    key={unit.id}
                    className={`absolute flex flex-col items-center justify-center w-12 h-12 rounded-full border-2 ${
                      unit.isPlayer ? 'bg-blue-900 border-blue-400' : 'bg-red-900 border-red-400'
                    } ${
                      unit.isAttacking ? 'ring-2 ring-yellow-400 animate-pulse' : ''
                    }`}
                    style={{
                      left: `${unit.x}px`,
                      top: `${unit.y}px`,
                      transform: unit.isAttacking ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div className={`text-xs font-bold ${unit.isPlayer ? 'text-blue-200' : 'text-red-200'}`}>
                      {unit.name.substring(0, 3)}
                    </div>
                    
                    {/* Health Bar */}
                    <div className="absolute -bottom-3 left-0 right-0">
                      <div className="w-full h-1 bg-gray-600 rounded">
                        <div 
                          className={`h-full rounded ${unit.isPlayer ? 'bg-green-400' : 'bg-red-400'}`}
                          style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Attack Effect */}
                    {unit.isAttacking && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-yellow-400 text-lg animate-ping">
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

        {/* Combat Control Area */}
        <div className="absolute top-20 right-8 bg-black/80 rounded-lg p-3 border border-slate-600">
          {gamePhase === 'setup' && (
            <Button 
              onClick={startCombat} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2"
              disabled={board.filter(u => u !== null).length === 0}
            >
              <Sword className="w-4 h-4 mr-2" />
              Start Combat
            </Button>
          )}
          {gamePhase === 'combat' && (
            <div className="text-white text-center">
              <div className="font-bold">Combat: {combatTimer}s</div>
              <div className="text-sm text-gray-400">Auto-battling...</div>
            </div>
          )}
        </div>

        {/* Permanent Bench Area - Above Shop */}
        <div className="absolute bottom-20 left-28 right-8 h-16 bg-gradient-to-b from-slate-600 to-slate-700 rounded-lg border border-slate-500 p-2">
          <h4 className="text-white font-bold text-xs mb-1">Bench (0/9)</h4>
          <div className="flex gap-1">
            {bench.map((unit, index) => (
              <div
                key={index}
                className="w-12 h-10 bg-slate-800 rounded border border-slate-600 flex items-center justify-center text-xs relative"
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(index, 'bench');
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                {unit ? (
                  <div
                    className="cursor-grab text-white font-bold text-center"
                    draggable
                    onDragStart={() => handleDragStart(unit, 'bench', index)}
                    onDragEnd={handleDragEnd}
                    title={unit.name}
                  >
                    {unit.name.substring(0, 2)}
                  </div>
                ) : (
                  <div className="text-slate-500">+</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Collapsible Bottom Panel */}
        <div className={`absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg transition-all duration-300 ${isShopExpanded ? 'p-4' : 'p-2'}`}>
          {/* Shop Toggle */}
          <div className="flex justify-between items-center mb-2">
            <Button
              onClick={() => setIsShopExpanded(!isShopExpanded)}
              size="sm"
              className="bg-slate-600 hover:bg-slate-700"
            >
              {isShopExpanded ? '▼ Hide Shop' : '▲ Show Shop'}
            </Button>
            {!isShopExpanded && (
              <div className="text-white text-sm">
                Gold: {gold} | Level: {level} | Round: {round}
              </div>
            )}
          </div>
          {/* Expanded Shop Content */}
          {isShopExpanded && (
            <>
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
                              className="w-full text-xs py-1"
                            >
                              Buy
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-500 text-xs ml-1">Empty</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>






            </>
          )}
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
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-4">🏆 VICTORY! 🏆</div>
                <div className="text-xl mb-6">Your Shadow Army Prevails!</div>
                <div className="space-y-2 mb-6">
                  <div>Bonus Gold: +{round * 2}</div>
                  <div>Interest: +{calculateInterest(gold)}</div>
                </div>
                <Button
                  onClick={() => {
                    setRound(prev => prev + 1);
                    setGamePhase('setup');
                    generateShop();
                  }}
                  className="px-8 py-3"
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
              <div className="text-center text-white">
                <div className="text-4xl font-bold mb-4">💀 DEFEAT 💀</div>
                <div className="text-xl mb-6">The Dungeon Overcomes Your Army</div>
                <div className="space-y-2 mb-6">
                  <div>Experience Gained: +{Math.floor(round / 2)}</div>
                  <div>Lessons Learned for Next Attempt</div>
                </div>
                <Button
                  onClick={() => onRaidComplete({
                    success: false,
                    rewards: {
                      experience: Math.floor(round / 2),
                      gold: 0,
                      items: []
                    }
                  })}
                  className="px-8 py-3"
                >
                  Return to Hub
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}