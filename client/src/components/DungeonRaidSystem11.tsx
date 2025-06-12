import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Zap, Heart, X, Crown, Target, Wind, Flame, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  type: 'shadow_beast' | 'orc_warrior' | 'boss';
  isStunned?: boolean;
  statusEffects?: Array<{
    type: 'poison' | 'stun' | 'burning';
    duration: number;
  }>;
}

interface Player {
  id: 'jinwoo' | 'chahaein';
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  x: number;
  y: number;
  isActive: boolean;
  statusEffects?: Array<{
    type: 'poison' | 'stun' | 'burning';
    duration: number;
  }>;
}

interface Skill {
  id: string;
  name: string;
  icon: any;
  cooldown: number;
  manaCost: number;
  type: 'launcher' | 'dash' | 'charge_aoe' | 'special';
  currentCooldown: number;
  isCharging?: boolean;
  chargeTime?: number;
  flashRed?: boolean;
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (success: boolean, loot: any[]) => void;
  playerLevel: number;
  affectionLevel: number;
}

export function DungeonRaidSystem11({ 
  isVisible, 
  onClose, 
  onRaidComplete, 
  playerLevel, 
  affectionLevel 
}: RaidProps) {
  // Core game state
  const [gamePhase, setGamePhase] = useState<'intro' | 'combat' | 'puzzle' | 'trap' | 'boss_antechamber' | 'room_clear' | 'complete'>('intro');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [totalRooms] = useState(7);
  const [dungeonAct, setDungeonAct] = useState(1);
  const [currentWave, setCurrentWave] = useState(1);
  const [maxWaves] = useState(2);

  // Combat entities
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'jinwoo',
      name: 'Sung Jin-Woo',
      health: 200,
      maxHealth: 200,
      mana: 100,
      maxMana: 100,
      x: 150,
      y: 200,
      isActive: true
    },
    {
      id: 'chahaein',
      name: 'Cha Hae-In',
      health: 180,
      maxHealth: 180,
      mana: 120,
      maxMana: 120,
      x: 100,
      y: 150,
      isActive: true
    }
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [shadowSoldiers, setShadowSoldiers] = useState<Array<{
    id: string;
    name: string;
    type: 'igris' | 'iron' | 'tank';
    health: number;
    maxHealth: number;
    x: number;
    y: number;
    isActive: boolean;
    manaCost: number;
  }>>([]);

  // UI and interaction state
  const [synergyGauge, setSynergyGauge] = useState(0);
  const [teamUpReady, setTeamUpReady] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [monarchRuneOpen, setMonarchRuneOpen] = useState(false);
  const [chaHaeInTarget, setChaHaeInTarget] = useState<string | null>(null);
  const [chaHaeInMode, setChaHaeInMode] = useState<'offensive' | 'defensive'>('offensive');

  // Visual effects
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical: boolean;
    timestamp: number;
  }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);

  // Combat inventory system
  const [combatInventory] = useState([
    { id: 'health_potion', name: 'Health Potion', icon: '🧪', quantity: 5, healAmount: 50, type: 'health', cooldown: 0, maxCooldown: 2000 },
    { id: 'mana_potion', name: 'Mana Potion', icon: '💙', quantity: 3, manaAmount: 40, type: 'mana', cooldown: 0, maxCooldown: 1500 },
    { id: 'revival_stone', name: 'Revival Stone', icon: '💎', quantity: 1, reviveAmount: 100, type: 'revival', cooldown: 0, maxCooldown: 10000 },
    { id: 'energy_drink', name: 'Energy Drink', icon: '⚡', quantity: 2, healAmount: 25, manaAmount: 25, type: 'hybrid', cooldown: 0, maxCooldown: 3000 }
  ]);
  const [itemCooldowns, setItemCooldowns] = useState<Record<string, number>>({});

  // Special encounter states
  const [trapAlert, setTrapAlert] = useState<{
    active: boolean;
    skillRequired: string;
    timeLeft: number;
    maxTime: number;
  } | null>(null);
  const [bossStruggle, setBossStruggle] = useState<{
    active: boolean;
    progress: number;
    timeLeft: number;
    maxTime: number;
    tapCount: number;
  } | null>(null);
  const [puzzleRunes, setPuzzleRunes] = useState<Array<{
    id: string;
    position: { x: number; y: number };
    isCorrect: boolean;
    isActivated: boolean;
    sequence: number;
    glowing: boolean;
  }>>([]);
  const [puzzleSequence, setPuzzleSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);

  // Combat mechanics
  const [enemyTelegraphs, setEnemyTelegraphs] = useState<Array<{
    id: string;
    enemyId: string;
    type: 'area_attack' | 'charge' | 'ranged';
    targetArea: { x: number; y: number; radius: number };
    timeLeft: number;
    maxTime: number;
  }>>([]);

  const [roomExits, setRoomExits] = useState<Array<{
    id: string;
    direction: 'forward' | 'treasure' | 'boss';
    position: { x: number; y: number };
    glowing: boolean;
    label: string;
  }>>([]);

  // Touch-based skill system - 4 slot action bar
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'mutilate',
      name: 'Mutilate',
      icon: Sword,
      cooldown: 3000,
      manaCost: 20,
      type: 'launcher',
      currentCooldown: 0
    },
    {
      id: 'violent_slash',
      name: 'Violent Slash',
      icon: Wind,
      cooldown: 2500,
      manaCost: 15,
      type: 'dash',
      currentCooldown: 0
    },
    {
      id: 'dominator_touch',
      name: "Dominator's Touch",
      icon: Target,
      cooldown: 8000,
      manaCost: 40,
      type: 'charge_aoe',
      currentCooldown: 0
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      icon: Zap,
      cooldown: 5000,
      manaCost: 30,
      type: 'special',
      currentCooldown: 0
    }
  ]);

  const battlefieldRef = useRef<HTMLDivElement>(null);

  // Shadow Soldier management
  const availableShadows = [
    { id: 'igris', name: 'Igris', type: 'igris' as const, manaCost: 40, health: 150, maxHealth: 150 },
    { id: 'iron', name: 'Iron', type: 'iron' as const, manaCost: 25, health: 100, maxHealth: 100 },
    { id: 'tank', name: 'Tank', type: 'tank' as const, manaCost: 60, health: 200, maxHealth: 200 }
  ];

  // Generate room enemies based on act and room
  const generateRoomEnemies = useCallback((room: number, act: number) => {
    if (room === totalRooms) {
      return [{
        id: `boss_monarch`,
        name: 'Shadow Monarch',
        health: 300,
        maxHealth: 300,
        x: 450,
        y: 200,
        type: 'boss' as const
      }];
    }

    const baseHealth = 40 + (room * 15);
    const enemyCount = Math.min(3, 1 + Math.floor(room / 2));
    
    return Array.from({ length: enemyCount }, (_, i) => {
      const enemyType = room > 4 ? 'orc_warrior' : 'shadow_beast';
      return {
        id: `room_${room}_enemy_${i + 1}`,
        name: room > 4 ? 'Orc Warrior' : 'Shadow Beast',
        health: baseHealth,
        maxHealth: baseHealth,
        x: 300 + (i * 80),
        y: 150 + (i % 2) * 100,
        type: enemyType as Enemy['type']
      };
    });
  }, [totalRooms]);

  // Generate room exits
  const generateRoomExits = useCallback((room: number, totalRooms: number) => {
    const exits: Array<{
      id: string;
      direction: 'forward' | 'treasure' | 'boss';
      position: { x: number; y: number };
      glowing: boolean;
      label: string;
    }> = [];
    
    if (room < totalRooms - 1) {
      exits.push({
        id: 'main_path',
        direction: 'forward',
        position: { x: 550, y: 190 },
        glowing: true,
        label: 'Continue Forward'
      });
    } else if (room === totalRooms - 1) {
      exits.push({
        id: 'boss_chamber',
        direction: 'boss',
        position: { x: 550, y: 190 },
        glowing: true,
        label: 'Boss Chamber'
      });
    }
    
    return exits;
  }, []);

  // Encounter generation functions
  const generateTrapEncounter = useCallback(() => {
    const requiredSkills = ['mutilate', 'violent_slash', 'dominator_touch', 'shadow_exchange'];
    const randomSkill = requiredSkills[Math.floor(Math.random() * requiredSkills.length)];
    
    setTrapAlert({
      active: true,
      skillRequired: randomSkill,
      timeLeft: 5000,
      maxTime: 5000
    });
    setGamePhase('trap');
  }, []);

  const generatePuzzleEncounter = useCallback(() => {
    const sequence = [1, 3, 2, 4];
    const runes = [
      { id: 'rune1', position: { x: 300, y: 150 }, isCorrect: false, isActivated: false, sequence: 1, glowing: true },
      { id: 'rune2', position: { x: 400, y: 150 }, isCorrect: false, isActivated: false, sequence: 2, glowing: false },
      { id: 'rune3', position: { x: 500, y: 150 }, isCorrect: false, isActivated: false, sequence: 3, glowing: false },
      { id: 'rune4', position: { x: 350, y: 220 }, isCorrect: false, isActivated: false, sequence: 4, glowing: false }
    ];
    
    setPuzzleSequence(sequence);
    setPuzzleRunes(runes);
    setPlayerSequence([]);
    setGamePhase('puzzle');
  }, []);

  const generateBossStruggle = useCallback(() => {
    setBossStruggle({
      active: true,
      progress: 0,
      timeLeft: 10000,
      maxTime: 10000,
      tapCount: 0
    });
  }, []);

  // Shadow soldier functions
  const summonShadowSoldier = useCallback((shadowType: string) => {
    const shadowTemplate = availableShadows.find(s => s.id === shadowType);
    if (!shadowTemplate) return;

    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo || jinwoo.mana < shadowTemplate.manaCost) return;

    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - shadowTemplate.manaCost } : p
    ));

    const newShadow = {
      ...shadowTemplate,
      id: `${shadowType}_${Date.now()}`,
      x: jinwoo.x + 60,
      y: jinwoo.y + 20,
      isActive: true,
      type: shadowTemplate.type
    };

    setShadowSoldiers(prev => [...prev, newShadow]);
    setMonarchRuneOpen(false);
  }, [players, availableShadows]);

  const commandShadowSoldiers = useCallback((targetX: number, targetY: number) => {
    setShadowSoldiers(prev => prev.map(shadow => ({
      ...shadow,
      x: targetX + (Math.random() - 0.5) * 40,
      y: targetY + (Math.random() - 0.5) * 40
    })));
  }, []);

  // Initialize dungeon
  useEffect(() => {
    if (isVisible && gamePhase === 'intro') {
      setTimeout(() => {
        setGamePhase('combat');
        setEnemies(generateRoomEnemies(1, 1));
      }, 2000);
    }
  }, [isVisible, gamePhase, generateRoomEnemies]);

  // Enhanced battlefield tap handler with movement and targeting
  const handleBattlefieldTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'combat') return;
    
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const tappedEnemy = enemies.find(enemy => {
      const distance = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
      return distance < 30 && enemy.health > 0;
    });
    
    if (tappedEnemy) {
      setPlayers(prev => prev.map(p => 
        p.id === 'jinwoo' ? { 
          ...p, 
          x: Math.max(50, Math.min(550, tappedEnemy.x - 40)),
          y: Math.max(50, Math.min(350, tappedEnemy.y))
        } : p
      ));

      setTimeout(() => {
        const damage = 15 + Math.floor(Math.random() * 10);
        const isCritical = Math.random() > 0.85;
        
        setEnemies(prev => prev.map(enemy => 
          enemy.id === tappedEnemy.id 
            ? { ...enemy, health: Math.max(0, enemy.health - (isCritical ? damage * 2 : damage)) }
            : enemy
        ));
        
        setDamageNumbers(prev => [...prev, {
          id: `basic_damage_${Date.now()}`,
          damage: isCritical ? damage * 2 : damage,
          x: tappedEnemy.x,
          y: tappedEnemy.y - 20,
          isCritical,
          timestamp: Date.now()
        }]);

        if (isCritical) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 200);
        }

        // Cha Hae-In coordination
        if (chaHaeInMode === 'offensive' && tappedEnemy.health > damage) {
          setTimeout(() => {
            const chaFollowUpDamage = 12 + Math.floor(Math.random() * 8);
            setEnemies(prev => prev.map(enemy => 
              enemy.id === tappedEnemy.id 
                ? { ...enemy, health: Math.max(0, enemy.health - chaFollowUpDamage) }
                : enemy
            ));

            setDamageNumbers(prev => [...prev, {
              id: `cha_damage_${Date.now()}`,
              damage: chaFollowUpDamage,
              x: tappedEnemy.x + 15,
              y: tappedEnemy.y - 35,
              isCritical: false,
              timestamp: Date.now()
            }]);

            setSynergyGauge(prev => Math.min(100, prev + 10));
          }, 400);
        }
      }, 300);
    } else {
      if (commandMode) {
        commandShadowSoldiers(x, y);
      } else {
        setPlayers(prev => prev.map(p => 
          p.id === 'jinwoo' ? { 
            ...p, 
            x: Math.max(50, Math.min(550, x)),
            y: Math.max(50, Math.min(350, y))
          } : p
        ));
      }
    }
  }, [gamePhase, enemies, commandMode, chaHaeInMode, commandShadowSoldiers]);

  // Combat item usage
  const useCombatItem = useCallback((itemId: string) => {
    const item = combatInventory.find(inv => inv.id === itemId);
    if (!item || item.quantity <= 0 || itemCooldowns[itemId] > 0) return;

    const jinwoo = players.find(p => p.id === 'jinwoo');
    const chahaein = players.find(p => p.id === 'chahaein');
    if (!jinwoo) return;

    // Start item cooldown
    setItemCooldowns(prev => ({ ...prev, [itemId]: item.maxCooldown }));
    
    // Handle cooldown countdown
    const cooldownInterval = setInterval(() => {
      setItemCooldowns(prev => {
        const newCooldown = Math.max(0, prev[itemId] - 100);
        if (newCooldown === 0) {
          clearInterval(cooldownInterval);
        }
        return { ...prev, [itemId]: newCooldown };
      });
    }, 100);

    // Apply item effects
    setPlayers(prev => prev.map(player => {
      if (item.type === 'revival' && player.health <= 0) {
        // Revival items restore fallen players
        return { 
          ...player, 
          health: Math.min(player.maxHealth, item.reviveAmount || player.maxHealth * 0.5) 
        };
      }
      
      if (player.health > 0) {
        let newHealth = player.health;
        let newMana = player.mana;
        
        if (item.healAmount) {
          newHealth = Math.min(player.maxHealth, player.health + item.healAmount);
        }
        if (item.manaAmount) {
          newMana = Math.min(player.maxMana, player.mana + item.manaAmount);
        }
        
        return { ...player, health: newHealth, mana: newMana };
      }
      
      return player;
    }));

    // Visual feedback for healing
    setDamageNumbers(prev => [...prev, {
      id: `heal_${Date.now()}`,
      damage: item.healAmount || item.manaAmount || item.reviveAmount || 0,
      x: jinwoo.x,
      y: jinwoo.y - 30,
      isCritical: false,
      timestamp: Date.now(),
      isHealing: true
    }]);

    // Reduce item quantity (simulation - in real game this would sync with inventory)
    console.log(`Used ${item.name} - ${item.quantity - 1} remaining`);
  }, [combatInventory, itemCooldowns, players]);

  // Skill execution
  const executeSkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) return;

    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo || jinwoo.mana < skill.manaCost) return;

    // Handle trap evasion
    if (trapAlert && trapAlert.skillRequired === skillId) {
      setTrapAlert(null);
      setGamePhase('combat');
      return;
    }

    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - skill.manaCost } : p
    ));

    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s
    ));

    const aliveEnemies = enemies.filter(e => e.health > 0);
    if (aliveEnemies.length === 0) return;

    const targetEnemy = aliveEnemies[0];
    let damage = 0;

    switch (skill.type) {
      case 'launcher':
        damage = 25 + Math.floor(Math.random() * 15);
        setEnemies(prev => prev.map(enemy => 
          enemy.id === targetEnemy.id 
            ? { ...enemy, health: Math.max(0, enemy.health - damage), isStunned: true }
            : enemy
        ));
        break;
      case 'dash':
        damage = 20 + Math.floor(Math.random() * 10);
        setEnemies(prev => prev.map(enemy => 
          enemy.id === targetEnemy.id 
            ? { ...enemy, health: Math.max(0, enemy.health - damage) }
            : enemy
        ));
        break;
      case 'charge_aoe':
        damage = 35 + Math.floor(Math.random() * 20);
        setEnemies(prev => prev.map(enemy => 
          ({ ...enemy, health: Math.max(0, enemy.health - damage) })
        ));
        break;
      case 'special':
        damage = 30 + Math.floor(Math.random() * 15);
        setEnemies(prev => prev.map(enemy => 
          enemy.id === targetEnemy.id 
            ? { ...enemy, health: Math.max(0, enemy.health - damage) }
            : enemy
        ));
        break;
    }

    setDamageNumbers(prev => [...prev, {
      id: `skill_damage_${Date.now()}`,
      damage,
      x: targetEnemy.x,
      y: targetEnemy.y - 30,
      isCritical: skill.type === 'charge_aoe',
      timestamp: Date.now()
    }]);

    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 300);
  }, [skills, players, enemies, trapAlert]);

  // Handle puzzle rune interaction
  const handleRuneTap = useCallback((runeId: string) => {
    const rune = puzzleRunes.find(r => r.id === runeId);
    if (!rune) return;

    const newPlayerSequence = [...playerSequence, rune.sequence];
    setPlayerSequence(newPlayerSequence);

    setPuzzleRunes(prev => prev.map(r => 
      r.id === runeId ? { ...r, isActivated: true, glowing: false } : r
    ));

    const isCorrectSoFar = newPlayerSequence.every((num, index) => 
      num === puzzleSequence[index]
    );

    if (!isCorrectSoFar) {
      setTimeout(() => {
        setPuzzleRunes(prev => prev.map(r => ({ 
          ...r, 
          isActivated: false, 
          glowing: r.sequence === 1 
        })));
        setPlayerSequence([]);
      }, 1000);
    } else if (newPlayerSequence.length === puzzleSequence.length) {
      setTimeout(() => {
        setGamePhase('combat');
        setEnemies(generateRoomEnemies(currentRoom, dungeonAct));
      }, 1000);
    } else {
      setTimeout(() => {
        setPuzzleRunes(prev => prev.map(r => ({
          ...r,
          glowing: r.sequence === puzzleSequence[newPlayerSequence.length]
        })));
      }, 500);
    }
  }, [puzzleRunes, puzzleSequence, playerSequence, currentRoom, dungeonAct, generateRoomEnemies]);

  // Boss struggle mini-game
  const handleBossStruggleTap = useCallback(() => {
    if (!bossStruggle) return;

    setBossStruggle(prev => {
      if (!prev) return null;
      const newProgress = Math.min(100, prev.progress + 8);
      
      if (newProgress >= 100) {
        setTimeout(() => {
          setEnemies(prevEnemies => prevEnemies.map(enemy => 
            enemy.type === 'boss' 
              ? { ...enemy, health: Math.max(0, enemy.health - 150) }
              : enemy
          ));
          setBossStruggle(null);
        }, 500);
      }
      
      return { ...prev, progress: newProgress, tapCount: prev.tapCount + 1 };
    });
  }, [bossStruggle]);

  // Room completion detection
  useEffect(() => {
    if (gamePhase === 'combat' && enemies.length > 0) {
      const aliveEnemies = enemies.filter(e => e.health > 0);
      
      if (aliveEnemies.length === 0) {
        setEnemyTelegraphs([]);
        
        if (currentRoom === totalRooms) {
          setGamePhase('complete');
          onRaidComplete(true, [{ type: 'gold', amount: 5000 }]);
        } else {
          setGamePhase('room_clear');
          setTimeout(() => {
            const exits = generateRoomExits(currentRoom, totalRooms);
            setRoomExits(exits);
          }, 1500);
        }
      }
    }
  }, [enemies, gamePhase, currentRoom, totalRooms, generateRoomExits, onRaidComplete]);

  // Handle room progression
  const handleExitSelect = useCallback((exitId: string) => {
    const nextRoom = currentRoom + 1;
    setCurrentRoom(nextRoom);
    
    let nextAct = dungeonAct;
    if (nextRoom <= 2) nextAct = 1;
    else if (nextRoom <= 5) nextAct = 2;
    else nextAct = 3;
    setDungeonAct(nextAct);
    
    if (nextRoom === totalRooms) {
      setGamePhase('boss_antechamber');
    } else if (nextAct === 2 && Math.random() > 0.7) {
      const encounterType = Math.random();
      if (encounterType > 0.6) {
        generatePuzzleEncounter();
      } else if (encounterType > 0.3) {
        generateTrapEncounter();
      } else {
        setGamePhase('combat');
        setEnemies(generateRoomEnemies(nextRoom, nextAct));
      }
    } else {
      setGamePhase('combat');
      setEnemies(generateRoomEnemies(nextRoom, nextAct));
    }
  }, [currentRoom, totalRooms, dungeonAct, generateRoomEnemies, generatePuzzleEncounter, generateTrapEncounter]);

  // Skill cooldown management
  useEffect(() => {
    const interval = setInterval(() => {
      setSkills(prev => prev.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 100)
      })));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Cleanup damage numbers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setDamageNumbers(prev => prev.filter(damage => now - damage.timestamp < 2000));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Enemy telegraph countdown
  useEffect(() => {
    if (trapAlert) {
      const interval = setInterval(() => {
        setTrapAlert(prev => {
          if (!prev) return null;
          const newTimeLeft = prev.timeLeft - 100;
          
          if (newTimeLeft <= 0) {
            setPlayers(prevPlayers => prevPlayers.map(p => 
              p.id === 'jinwoo' ? { ...p, health: Math.max(0, p.health - 40) } : p
            ));
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 500);
            return null;
          }
          
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [trapAlert]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 ${
            screenShake ? 'animate-pulse' : ''
          } ${cameraShake ? 'animate-bounce' : ''}`}
        >
          {/* Dungeon Info Header (Top-Left) */}
          <div className="absolute top-16 left-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-4 max-w-[40%]">
            <div className="text-white">
              <div className="text-sm text-slate-300 mb-1">Shadow Dungeon • B-Rank</div>
              <div className="flex items-center gap-2 text-sm">
                <span>Room {currentRoom}/{totalRooms}</span>
                <span>•</span>
                <span>Act {dungeonAct}</span>
                <span>•</span>
                <span className="capitalize">{gamePhase.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Synergy Gauge (Top-Right) */}
          <div className="absolute top-16 right-4">
            <div className="relative w-18 h-18">
              <svg className="w-18 h-18 transform -rotate-90" viewBox="0 0 72 72">
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                  fill="transparent"
                />
                <circle
                  cx="36"
                  cy="36"
                  r="32"
                  stroke="rgb(147, 51, 234)"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={`${(synergyGauge / 100) * 201.06} 201.06`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{synergyGauge}%</span>
              </div>
            </div>
          </div>

          {/* Close Button (Top-Right Corner) */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-slate-400 hover:text-white z-50"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Main Content Area */}
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            {/* Intro Phase */}
            {gamePhase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <h3 className="text-3xl font-bold text-white mb-4">
                  The Shadow Realm Beckons
                </h3>
                <p className="text-slate-300 mb-8 max-w-md">
                  You and Cha Hae-In stand before the dungeon entrance. 
                  The air thrums with dark energy.
                </p>
                <div className="text-sm text-purple-300">
                  Initializing dungeon systems...
                </div>
              </motion.div>
            )}

            {/* Trap Encounter Phase */}
            {gamePhase === 'trap' && trapAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="bg-red-900/80 border-2 border-red-500 rounded-2xl p-8 text-center max-w-md">
                  <div className="text-6xl mb-4 animate-pulse">⚠️</div>
                  <h3 className="text-2xl font-bold text-red-400 mb-4">TRAP ACTIVATED!</h3>
                  <p className="text-slate-300 mb-6">
                    A deadly mechanism springs to life! Use the correct skill to evade!
                  </p>
                  <div className="mb-4">
                    <div className="text-yellow-400 font-bold text-lg mb-2">
                      Required Skill: {skills.find(s => s.id === trapAlert.skillRequired)?.name}
                    </div>
                    <div className="text-red-400 text-sm">
                      Time remaining: {Math.ceil(trapAlert.timeLeft / 1000)}s
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Tap the glowing skill button to evade!
                  </div>
                </div>

                {/* Action Bar for trap evasion */}
                <div className="flex justify-center gap-4 mt-8">
                  {skills.map((skill, index) => (
                    <motion.button
                      key={skill.id}
                      onClick={() => executeSkill(skill.id)}
                      className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                        trapAlert.skillRequired === skill.id
                          ? 'border-yellow-400 bg-yellow-400/30 animate-bounce'
                          : 'border-slate-600 bg-slate-700/50 opacity-50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <skill.icon className={`w-6 h-6 ${
                        trapAlert.skillRequired === skill.id ? 'text-yellow-300' : 'text-slate-500'
                      }`} />
                      
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-slate-300">
                        {index + 1}
                      </div>

                      {trapAlert.skillRequired === skill.id && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-yellow-400 font-bold animate-pulse">
                          EVADE!
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Puzzle Phase */}
            {gamePhase === 'puzzle' && (
              <div className="flex-1 flex flex-col">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Ancient Rune Sequence</h3>
                  <p className="text-slate-300">
                    "The pattern on the floor must be the key!" - Cha Hae-In
                  </p>
                </div>
                
                <div className="flex-1 relative bg-slate-700/30 rounded-xl border border-slate-600/50 flex items-center justify-center">
                  {puzzleRunes.map(rune => (
                    <motion.button
                      key={rune.id}
                      onClick={() => handleRuneTap(rune.id)}
                      className={`absolute w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                        rune.isActivated 
                          ? 'border-green-400 bg-green-400/30 text-green-300'
                          : rune.glowing
                          ? 'border-yellow-400 bg-yellow-400/30 text-yellow-300 animate-pulse'
                          : 'border-purple-500/50 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                      }`}
                      style={{ left: rune.position.x, top: rune.position.y }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {rune.sequence}
                    </motion.button>
                  ))}
                </div>
                
                <div className="text-center mt-4">
                  <div className="text-sm text-slate-400">
                    Sequence: {playerSequence.join(' → ')} {playerSequence.length < puzzleSequence.length ? '→ ?' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Combat Phase - Full Screen Battlefield */}
            {gamePhase === 'combat' && (
              <div 
                ref={battlefieldRef}
                onClick={handleBattlefieldTap}
                className="absolute inset-0 cursor-crosshair"
              >
                {/* Players with Diegetic Health/Mana Auras */}
                {players.map(player => (
                  <motion.div
                    key={player.id}
                    className="absolute"
                    style={{ left: player.x, top: player.y }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="relative">
                      {/* Character Avatar */}
                      <div className={`w-12 h-12 rounded-full border-2 ${
                        player.id === 'jinwoo' 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'bg-yellow-600 border-yellow-400'
                      }`}></div>
                      
                      {/* Character Name */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                        {player.name}
                      </div>
                      
                      {/* Diegetic Health Aura */}
                      <div 
                        className={`absolute inset-0 rounded-full animate-pulse ${
                          player.id === 'jinwoo' 
                            ? 'bg-purple-400/40' 
                            : 'bg-yellow-400/40'
                        }`}
                        style={{
                          width: '48px',
                          height: '48px',
                          transform: `scale(${player.health / player.maxHealth})`,
                          filter: 'blur(2px)'
                        }}
                      ></div>
                      
                      {/* Diegetic Mana Ring (for Jinwoo only) */}
                      {player.id === 'jinwoo' && (
                        <div 
                          className="absolute inset-0 rounded-full border-2 border-blue-400/60"
                          style={{
                            width: '48px',
                            height: '48px',
                            opacity: player.mana / player.maxMana,
                            filter: 'blur(1px)'
                          }}
                        ></div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Enemies with Crimson Health Auras */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className="absolute cursor-pointer"
                    style={{ left: enemy.x, top: enemy.y }}
                    initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full border-2 ${
                          enemy.type === 'boss' ? 'bg-red-600 border-red-400' :
                          enemy.type === 'orc_warrior' ? 'bg-orange-500 border-orange-300' :
                          'bg-red-500 border-red-300'
                        }`}></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                          {enemy.name}
                        </div>
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-600 rounded">
                          <div 
                            className="h-full bg-red-500 rounded transition-all duration-200"
                            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Shadow Soldiers */}
                  {shadowSoldiers.map(soldier => (
                    <motion.div
                      key={soldier.id}
                      className="absolute"
                      style={{ left: soldier.x, top: soldier.y }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                    >
                      <div className="relative">
                        <div className={`w-6 h-6 rounded-full border-2 ${
                          soldier.type === 'igris' ? 'bg-purple-600 border-purple-400' :
                          soldier.type === 'iron' ? 'bg-gray-600 border-gray-400' :
                          'bg-blue-600 border-blue-400'
                        }`}></div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-purple-300 whitespace-nowrap">
                          {soldier.name}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Damage Numbers */}
                  <AnimatePresence>
                    {damageNumbers.map(damage => (
                      <motion.div
                        key={damage.id}
                        className={`absolute pointer-events-none font-bold ${
                          damage.isCritical ? 'text-yellow-400 text-lg' : 'text-white text-sm'
                        }`}
                        style={{ left: damage.x, top: damage.y }}
                        initial={{ opacity: 1, y: 0, scale: 0.5 }}
                        animate={{ opacity: 0, y: -50, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                      >
                        -{damage.damage}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Action Bar (Bottom-Center) - Fixed Position */}
            {gamePhase === 'combat' && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex justify-center gap-3 py-2 px-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
                  {skills.map((skill, index) => (
                    <motion.button
                      key={skill.id}
                      onClick={() => executeSkill(skill.id)}
                      className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                        skill.currentCooldown > 0
                          ? 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                          : 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-400 cursor-pointer'
                      }`}
                      whileHover={{ scale: skill.currentCooldown > 0 ? 1 : 1.05 }}
                      whileTap={{ scale: skill.currentCooldown > 0 ? 1 : 0.95 }}
                    >
                      <skill.icon className={`w-6 h-6 ${
                        skill.currentCooldown > 0 ? 'text-slate-500' : 'text-purple-300'
                      }`} />
                      
                      {skill.currentCooldown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-white font-bold">
                            {Math.ceil(skill.currentCooldown / 1000)}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-slate-300">
                        {index + 1}
                      </div>
                    </motion.button>
                  ))}

                  {/* Monarch Rune Button */}
                  <motion.button
                    onClick={() => setMonarchRuneOpen(!monarchRuneOpen)}
                    className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                      commandMode 
                        ? 'border-purple-400 bg-purple-400/30'
                        : 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Crown className="w-6 h-6 text-purple-300" />
                  </motion.button>
                </div>

                {/* Monarch Rune Radial Menu */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
                  <AnimatePresence>
                    {monarchRuneOpen && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="relative w-48 h-48">
                          {availableShadows.map((shadow, index) => {
                            const angle = (index * 120) - 90;
                            const radius = 60;
                            const x = Math.cos(angle * Math.PI / 180) * radius;
                            const y = Math.sin(angle * Math.PI / 180) * radius;
                            const jinwoo = players.find(p => p.id === 'jinwoo');
                            const canSummon = jinwoo && jinwoo.mana >= shadow.manaCost;
                          
                            return (
                              <motion.button
                                key={shadow.id}
                              onClick={() => canSummon ? summonShadowSoldier(shadow.id) : null}
                              className={`absolute w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs ${
                                canSummon 
                                  ? 'border-purple-400 bg-purple-500/30 hover:bg-purple-500/50 cursor-pointer'
                                  : 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                              }`}
                              style={{
                                left: `calc(50% + ${x}px - 32px)`,
                                top: `calc(50% + ${y}px - 32px)`
                              }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={canSummon ? { scale: 1.1 } : {}}
                            >
                              <div className={`w-6 h-6 rounded-full ${
                                shadow.type === 'igris' ? 'bg-purple-600' :
                                shadow.type === 'iron' ? 'bg-gray-600' :
                                'bg-blue-600'
                              }`}></div>
                              <div className="text-xs text-purple-300 mt-1 font-bold">
                                {shadow.name}
                              </div>
                              <div className="text-xs text-blue-300">
                                {shadow.manaCost}MP
                              </div>
                            </motion.button>
                          );
                        })}
                        
                        <motion.button
                          onClick={() => setCommandMode(!commandMode)}
                          className="absolute w-12 h-12 rounded-full border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center"
                          style={{
                            left: 'calc(50% - 24px)',
                            top: 'calc(50% - 24px)'
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Users className="w-5 h-5 text-yellow-300" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Boss Struggle Mini-Game */}
            {bossStruggle && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-purple-900/80 backdrop-blur-sm flex items-center justify-center z-50"
                onClick={handleBossStruggleTap}
              >
                <div className="bg-slate-800/90 border-2 border-purple-500 rounded-2xl p-8 text-center max-w-lg cursor-pointer">
                  <div className="text-6xl mb-4 animate-bounce">⚔️</div>
                  <h3 className="text-2xl font-bold text-purple-400 mb-4">SHADOW STRUGGLE!</h3>
                  <p className="text-slate-300 mb-6">
                    The boss grapples with overwhelming power! Rapidly tap to break free!
                  </p>
                  
                  <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                      style={{ width: `${bossStruggle.progress}%` }}
                      animate={{ width: `${bossStruggle.progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="text-purple-300">
                      Progress: {Math.floor(bossStruggle.progress)}%
                    </div>
                    <div className="text-red-300">
                      Time: {Math.ceil(bossStruggle.timeLeft / 1000)}s
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-400 mt-4 animate-pulse">
                    TAP RAPIDLY TO CONTINUE!
                  </div>
                </div>
              </motion.div>
            )}

            {/* Room Clear Phase */}
            {gamePhase === 'room_clear' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-green-400 mb-4">Room Cleared!</h3>
                  <p className="text-slate-300 mb-6">
                    The shadows dissipate. Choose your path forward.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  {roomExits.map(exit => (
                    <motion.button
                      key={exit.id}
                      onClick={() => handleExitSelect(exit.id)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold"
                      whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(147, 51, 234, 0.5)' }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {exit.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Boss Antechamber Phase */}
            {gamePhase === 'boss_antechamber' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-red-400 mb-4">Boss Chamber Entrance</h3>
                  <p className="text-slate-300 mb-4">
                    The air here is thick with mana... You can feel it. The Monarch is just beyond this door.
                  </p>
                  
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-4 mb-6">
                    <div className="text-blue-300 font-semibold mb-2">Ancient Healing Font</div>
                    <Button
                      onClick={() => {
                        setPlayers(prev => prev.map(p => ({
                          ...p,
                          health: p.maxHealth,
                          mana: p.maxMana
                        })));
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Restore Health & Mana
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    setGamePhase('combat');
                    setEnemies(generateRoomEnemies(totalRooms, 3));
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 text-lg"
                >
                  Enter Boss Chamber
                </Button>
              </motion.div>
            )}

            {/* Complete Phase */}
            {gamePhase === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-yellow-400 mb-4">Victory!</h3>
                  <p className="text-slate-300 mb-8">
                    The Shadow Monarch has been defeated. The dungeon's power flows through you.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-8 py-3 text-lg"
                  >
                    Return to World
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}