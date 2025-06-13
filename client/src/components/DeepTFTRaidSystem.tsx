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

// TFT Shop Odds by Level
const SHOP_ODDS = {
  1: [100, 0, 0, 0, 0],    // Level 1: 100% tier 1
  2: [100, 0, 0, 0, 0],    // Level 2: 100% tier 1  
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
  
  // Character Pool Tracking (shared resource)
  const [characterPool, setCharacterPool] = useState<{[key: string]: number}>({});
  
  // Items and Traits
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [activeTraits, setActiveTraits] = useState<Trait[]>([]);
  
  // Visual Effects
  const [damageNumbers, setDamageNumbers] = useState<any[]>([]);
  const [animations, setAnimations] = useState<any[]>([]);

  // Level up mechanics - determines max team size
  const LEVEL_REQUIREMENTS = [0, 2, 6, 10, 20, 36, 56, 80, 100]; // XP needed for each level
  const TEAM_SIZE_BY_LEVEL = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Max units on board

  // Initialize character pool
  useEffect(() => {
    const pool: {[key: string]: number} = {};
    // Initialize all character pools
    CHAMPION_DATA.forEach(champ => {
      pool[champ.baseName] = CHARACTER_POOLS[champ.tier as keyof typeof CHARACTER_POOLS];
    });
    setCharacterPool(pool);
    generateShop();
  }, []);

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
    const odds = SHOP_ODDS[level as keyof typeof SHOP_ODDS] || SHOP_ODDS[9];
    
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
        champ.tier === selectedTier && characterPool[champ.baseName] > 0
      );
      
      if (availableChamps.length > 0) {
        const randomChamp = availableChamps[Math.floor(Math.random() * availableChamps.length)];
        const character = createCharacterFromData(randomChamp);
        newShop.push({
          character,
          locked: lockedSlots[i],
          cost: randomChamp.tier
        });
      } else {
        newShop.push({ character: null, locked: false, cost: 0 });
      }
    }
    
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
    setGamePhase('combat');
    generateEnemyTeam();
    calculateTraits();
    runCombatSimulation();
  };

  const generateEnemyTeam = () => {
    // Generate enemy team based on round
    const enemyStrength = Math.min(round + 2, 8);
    const enemies: Character[] = [];
    
    for (let i = 0; i < Math.min(enemyStrength, 8); i++) {
      const enemyTier = Math.min(Math.floor(round / 2) + 1, 5);
      const availableEnemies = CHAMPION_DATA.filter(champ => champ.tier <= enemyTier);
      const randomEnemy = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
      
      const enemy = createCharacterFromData({
        ...randomEnemy,
        id: `enemy_${i}`,
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
  };

  const runCombatSimulation = () => {
    // Simplified combat simulation
    setTimeout(() => {
      const playerUnits = board.filter(c => c !== null).length;
      const enemyUnits = enemyBoard.filter(c => c !== null).length;
      
      // Simple win condition based on team strength and traits
      const playerStrength = playerUnits + activeTraits.reduce((sum, trait) => 
        sum + (trait.activeLevel * 2), 0);
      const enemyStrength = enemyUnits + round;
      
      if (playerStrength > enemyStrength) {
        handleVictory();
      } else {
        handleDefeat();
      }
    }, 3000);
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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
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
          {/* Hex Grid Board */}
          <div className="absolute inset-4 grid grid-cols-7 grid-rows-4 gap-1">
            {board.map((unit, index) => (
              <div
                key={index}
                className={`relative aspect-square rounded-lg border-2 ${
                  unit ? 'border-blue-400 bg-blue-900/30' : 'border-slate-600 bg-slate-700/30'
                } hover:border-blue-300 transition-colors cursor-pointer`}
                onClick={() => {
                  // Handle board positioning
                }}
              >
                {unit && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-xs font-bold truncate w-full text-center px-1">
                      {unit.name}
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: unit.stars }).map((_, i) => (
                        <Star key={i} className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-300">T{unit.tier}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
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

          {/* Bench */}
          <div>
            <h4 className="text-white font-bold mb-2">Bench ({bench.filter(u => u !== null).length}/9)</h4>
            <div className="flex gap-2">
              {bench.map((unit, index) => (
                <div
                  key={index}
                  className={`relative w-16 h-16 rounded border-2 ${
                    unit ? 'border-green-400 bg-green-900/30' : 'border-slate-600 bg-slate-700/30'
                  } cursor-pointer hover:border-green-300 transition-colors`}
                  onClick={() => {
                    // Handle bench interactions
                  }}
                >
                  {unit && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
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

// Champion Data (Solo Leveling themed)
const CHAMPION_DATA = [
  // Tier 1 Champions
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
    baseName: 'iron_knight',
    name: 'Iron Knight',
    tier: 1,
    health: 600,
    attack: 40,
    defense: 35,
    traits: ['Iron', 'Tank'],
    abilities: [],
  },
  {
    baseName: 'mage_archer',
    name: 'Mage Archer',
    tier: 1,
    health: 400,
    attack: 60,
    defense: 15,
    traits: ['Mage', 'Archer'],
    abilities: [],
  },
  
  // Tier 2 Champions
  {
    baseName: 'elite_knight',
    name: 'Elite Knight',
    tier: 2,
    health: 750,
    attack: 65,
    defense: 45,
    traits: ['Elite', 'Warrior'],
    abilities: [],
  },
  {
    baseName: 'shadow_mage',
    name: 'Shadow Mage',
    tier: 2,
    health: 550,
    attack: 80,
    defense: 20,
    traits: ['Shadow', 'Mage'],
    abilities: [],
  },
  
  // Tier 3 Champions
  {
    baseName: 'hunter_captain',
    name: 'Hunter Captain',
    tier: 3,
    health: 900,
    attack: 95,
    defense: 55,
    traits: ['Hunter', 'Elite'],
    abilities: [],
  },
  {
    baseName: 'shadow_commander',
    name: 'Shadow Commander',
    tier: 3,
    health: 850,
    attack: 105,
    defense: 50,
    traits: ['Shadow', 'Elite'],
    abilities: [],
  },
  
  // Tier 4 Champions
  {
    baseName: 'cha_haein',
    name: 'Cha Hae-In',
    tier: 4,
    health: 1200,
    attack: 140,
    defense: 70,
    traits: ['S-Rank', 'Hunter'],
    abilities: [],
  },
  {
    baseName: 'shadow_marshall',
    name: 'Shadow Marshall',
    tier: 4,
    health: 1100,
    attack: 130,
    defense: 80,
    traits: ['Shadow', 'Commander'],
    abilities: [],
  },
  
  // Tier 5 Champions
  {
    baseName: 'jinwoo',
    name: 'Sung Jin-Woo',
    tier: 5,
    health: 1500,
    attack: 200,
    defense: 100,
    traits: ['Shadow Monarch', 'S-Rank'],
    abilities: [],
  },
];

// Trait System Data
const TRAIT_DATA: Trait[] = [
  {
    name: 'Shadow',
    description: 'Shadow units gain attack speed and lifesteal',
    color: '#8b5cf6',
    thresholds: [
      { count: 2, name: 'Shadow Bond', effect: '+15% Attack Speed', bonuses: { attackSpeed: 0.15 } },
      { count: 4, name: 'Shadow Army', effect: '+30% Attack Speed, 10% Lifesteal', bonuses: { attackSpeed: 0.30, special: 'lifesteal' } },
      { count: 6, name: 'Shadow Legion', effect: '+50% Attack Speed, 20% Lifesteal, Summon Shadow', bonuses: { attackSpeed: 0.50, special: 'lifesteal_summon' } },
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
    name: 'Warrior',
    description: 'Warriors gain health and armor',
    color: '#dc2626',
    thresholds: [
      { count: 2, name: 'Battle Ready', effect: '+200 Health, +15 Armor', bonuses: { health: 200, defense: 15 } },
      { count: 4, name: 'Veteran', effect: '+400 Health, +30 Armor', bonuses: { health: 400, defense: 30 } },
      { count: 6, name: 'Legendary Warrior', effect: '+600 Health, +50 Armor, Taunt', bonuses: { health: 600, defense: 50, special: 'taunt' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
  {
    name: 'Mage',
    description: 'Mages gain mana and spell power',
    color: '#3b82f6',
    thresholds: [
      { count: 2, name: 'Arcane Focus', effect: '+50 Mana, +25% Spell Power', bonuses: { mana: 50, special: 'spell_power' } },
      { count: 4, name: 'Archmage', effect: '+100 Mana, +50% Spell Power', bonuses: { mana: 100, special: 'archmage' } },
      { count: 6, name: 'Grand Magister', effect: '+150 Mana, +75% Spell Power, AOE Spells', bonuses: { mana: 150, special: 'grand_magic' } },
    ],
    currentCount: 0,
    activeLevel: 0,
  },
];