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

export function DungeonRaidSystem11Fixed({ 
  isVisible, 
  onClose, 
  onRaidComplete, 
  playerLevel, 
  affectionLevel 
}: RaidProps) {
  const [gamePhase, setGamePhase] = useState<'prep' | 'combat' | 'room_clear' | 'shadow_dash' | 'victory' | 'defeat'>('prep');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [roomExits, setRoomExits] = useState<Array<{
    id: string;
    direction: 'forward' | 'treasure' | 'boss';
    position: { x: number; y: number };
    glowing: boolean;
  }>>([]);
  const [shadowDashAnimation, setShadowDashAnimation] = useState(false);
  const [warpTunnelActive, setWarpTunnelActive] = useState(false);
  const [environmentalPuzzle, setEnvironmentalPuzzle] = useState<{
    active: boolean;
    sequence: number[];
    playerInput: number[];
    completed: boolean;
  } | null>(null);
  const [stealthChallenge, setStealthChallenge] = useState<{
    active: boolean;
    guardPosition: number;
    playerHidden: boolean;
    detectionLevel: number;
  } | null>(null);
  const [healingFont, setHealingFont] = useState<{
    active: boolean;
    used: boolean;
  } | null>(null);
  const [multiWaveActive, setMultiWaveActive] = useState(false);
  const [currentWave, setCurrentWave] = useState(1);
  const [targetedEnemy, setTargetedEnemy] = useState<string | null>(null);
  const [enemyTelegraphs, setEnemyTelegraphs] = useState<Array<{
    enemyId: string;
    type: 'attack' | 'charge' | 'slam';
    dangerZone: { x: number; y: number; width: number; height: number };
    timeLeft: number;
  }>>([]);
  const [playerMovement, setPlayerMovement] = useState<{
    targetX: number;
    targetY: number;
    moving: boolean;
  } | null>(null);
  const [synergyGauge, setSynergyGauge] = useState(0);
  const [teamUpReady, setTeamUpReady] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [commandMode, setCommandMode] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical: boolean;
  }>>([]);
  const [lootDrops, setLootDrops] = useState<Array<{
    id: string;
    amount: number;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    isCollected: boolean;
  }>>([]);
  const [trapAlert, setTrapAlert] = useState<{
    active: boolean;
    skillRequired: string;
    timeLeft: number;
  } | null>(null);
  const [bossStruggle, setBossStruggle] = useState<{
    active: boolean;
    progress: number;
    timeLeft: number;
  } | null>(null);
  const [bossPhase, setBossPhase] = useState(1);
  const [bossEnraged, setBossEnraged] = useState(false);
  const [bossAttackCharging, setBossAttackCharging] = useState<{
    active: boolean;
    type: 'slam' | 'sweep' | 'devastation';
    chargeTime: number;
    dangerZone: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [puzzleRunes, setPuzzleRunes] = useState<Array<{
    id: string;
    position: { x: number; y: number };
    isCorrect: boolean;
    isActivated: boolean;
  }>>([]);
  const [synergyChimeReady, setSynergyChimeReady] = useState(false);
  
  // Touch-based skill system - 4 slot action bar
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'mutilate',
      name: 'Mutilate',
      icon: Sword,
      cooldown: 3000,
      manaCost: 15,
      type: 'launcher',
      currentCooldown: 0,
      flashRed: false
    },
    {
      id: 'violent_slash',
      name: 'Violent Slash',
      icon: Target,
      cooldown: 5000,
      manaCost: 25,
      type: 'dash',
      currentCooldown: 0,
      flashRed: false
    },
    {
      id: 'dominators_touch',
      name: "Dominator's Touch",
      icon: Crown,
      cooldown: 8000,
      manaCost: 40,
      type: 'charge_aoe',
      currentCooldown: 0,
      isCharging: false,
      chargeTime: 0,
      flashRed: false
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      icon: Wind,
      cooldown: 12000,
      manaCost: 60,
      type: 'special',
      currentCooldown: 0,
      flashRed: false
    }
  ]);

  // Players with 2.5D positioning for side-scrolling
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'jinwoo',
      name: 'Sung Jin-Woo',
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      x: 120, // Left side for side-scrolling
      y: 320,
      isActive: true
    },
    {
      id: 'chahaein',
      name: 'Cha Hae-In',
      health: 85,
      maxHealth: 85,
      mana: 75,
      maxMana: 75,
      x: 180, // Slightly behind Jin-Woo
      y: 340,
      isActive: false
    }
  ]);

  // Enemies positioned on right side for side-scrolling
  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'beast1',
      name: 'Shadow Beast',
      health: 60,
      maxHealth: 60,
      x: 500,
      y: 300,
      type: 'shadow_beast'
    },
    {
      id: 'orc1',
      name: 'Orc Warrior',
      health: 80,
      maxHealth: 80,
      x: 580,
      y: 320,
      type: 'orc_warrior'
    },
    {
      id: 'boss1',
      name: 'Shadow Lord',
      health: 150,
      maxHealth: 150,
      x: 650,
      y: 280,
      type: 'boss'
    }
  ]);

  const battlefieldRef = useRef<HTMLDivElement>(null);

  // Combat mechanics remain the same but with 2.5D positioning
  const handleBattlefieldTap = useCallback((e: React.MouseEvent) => {
    if (gamePhase !== 'combat') return;
    
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find closest enemy for targeting
    const clickedEnemy = enemies.find(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2)
      );
      return distance < 50 && enemy.health > 0;
    });
    
    if (clickedEnemy) {
      setTargetedEnemy(clickedEnemy.id);
      executeBasicAttack(clickedEnemy);
      addToCombatLog(`Jin-Woo dashes toward ${clickedEnemy.name}!`);
      
      // Trigger Jin-Woo dash animation
      setPlayers(prev => prev.map(player => 
        player.id === 'jinwoo' 
          ? { ...player, isActive: true, x: Math.max(clickedEnemy.x - 60, 120) }
          : player
      ));
    } else {
      // Movement to dodge attacks
      setPlayerMovement({
        targetX: x,
        targetY: y,
        moving: true
      });
      
      // Move Jin-Woo to new position for evasion
      setTimeout(() => {
        setPlayers(prev => prev.map(player => 
          player.id === 'jinwoo' 
            ? { ...player, x: Math.max(50, Math.min(350, x)), y: Math.max(250, Math.min(380, y)) }
            : player
        ));
        setPlayerMovement(null);
        addToCombatLog("Jin-Woo evades to a safer position!");
      }, 300);
    }
  }, [gamePhase, enemies]);

  const executeBasicAttack = (enemy: Enemy) => {
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) return;
    
    const damage = Math.floor(Math.random() * 30) + 20;
    const isCritical = Math.random() < 0.2;
    const finalDamage = isCritical ? Math.floor(damage * 1.5) : damage;
    
    setEnemies(prev => prev.map(e => 
      e.id === enemy.id ? { ...e, health: Math.max(0, e.health - finalDamage) } : e
    ));
    
    showDamageNumber(finalDamage, enemy.x, enemy.y, isCritical);
    setSynergyGauge(prev => Math.min(100, prev + 10));
    
    addToCombatLog(`Jin-Woo attacks ${enemy.name} for ${finalDamage} damage${isCritical ? ' (Critical!)' : ''}`);
    
    if (isCritical) {
      triggerCameraShake();
    }
    
    // Generate loot when enemy dies
    if (enemy.health - finalDamage <= 0) {
      generateLootDrop(enemy.x, enemy.y);
      
      // Random trap trigger chance
      if (Math.random() < 0.3) {
        triggerTrap();
      }
    }
    
    // Check for boss struggle trigger
    // Boss phase transitions and special mechanics
    if (enemy.type === 'boss') {
      const healthPercentage = enemy.health / enemy.maxHealth;
      
      // Phase transitions
      if (healthPercentage <= 0.7 && bossPhase === 1) {
        setBossPhase(2);
        setBossEnraged(true);
        addToCombatLog("⚡ PHASE 2: The Ancient Guardian enters a berserker rage!");
        triggerCameraShake();
      } else if (healthPercentage <= 0.3 && bossPhase === 2) {
        setBossPhase(3);
        addToCombatLog("🔥 FINAL PHASE: The Guardian unleashes its full power!");
        triggerCameraShake();
      }
      
      // Boss struggle events (more frequent in later phases)
      const struggleChance = bossPhase === 3 ? 0.6 : bossPhase === 2 ? 0.4 : 0.2;
      if (Math.random() < struggleChance) {
        triggerBossStruggle();
      }
    }
    
    // Immediate victory check after damage is applied
    const updatedEnemies = enemies.map(e => 
      e.id === enemy.id ? { ...e, health: Math.max(0, e.health - finalDamage) } : e
    );
    const aliveCount = updatedEnemies.filter(e => e.health > 0).length;
    
    if (aliveCount === 0) {
      console.log('Victory detected in executeBasicAttack!');
      setTimeout(() => {
        if (currentRoom === 3 && currentWave === 1) {
          spawnSecondWave();
        } else if (currentRoom >= 7) {
          setGamePhase('victory');
        } else {
          addToCombatLog("VICTORY! All enemies defeated!");
          
          // Generate loot immediately
          updatedEnemies.forEach(deadEnemy => {
            generateLootDrop(deadEnemy.x, deadEnemy.y);
          });
          
          setTimeout(() => {
            setGamePhase('room_clear');
            generateRoomExits();
            addToCombatLog("Exit portals have materialized!");
          }, 2500);
        }
      }, 1000);
    }
  };

  const showDamageNumber = (damage: number, x: number, y: number, isCritical: boolean) => {
    const id = Math.random().toString(36).substr(2, 9);
    setDamageNumbers(prev => [...prev, { id, damage, x, y, isCritical }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(num => num.id !== id));
    }, 1500);
  };

  const triggerCameraShake = () => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 200);
  };

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), message]);
  };

  const generateRoomExits = () => {
    // Generate exits based on current room
    const exits = [];
    
    if (currentRoom < 7) { // Not final room
      // Main path forward
      exits.push({
        id: 'forward',
        direction: 'forward' as const,
        position: { x: 700, y: 200 },
        glowing: true
      });
      
      // Optional treasure room (30% chance)
      if (Math.random() < 0.3) {
        exits.push({
          id: 'treasure',
          direction: 'treasure' as const,
          position: { x: 650, y: 120 },
          glowing: true
        });
      }
    } else {
      // Boss room
      exits.push({
        id: 'boss',
        direction: 'boss' as const,
        position: { x: 700, y: 200 },
        glowing: true
      });
    }
    
    setRoomExits(exits);
    
    // Auto-materialize exits after spoils absorption
    setTimeout(() => {
      setRoomExits(prev => prev.map(exit => ({ ...exit, glowing: true })));
    }, 2000);
  };

  const handleExitChoice = (exitId: string) => {
    const exit = roomExits.find(e => e.id === exitId);
    if (!exit) return;
    
    // Start Shadow Dash sequence
    setShadowDashAnimation(true);
    setGamePhase('shadow_dash');
    
    // Step 1: Jin-Woo turns toward exit and dissolves
    setTimeout(() => {
      setWarpTunnelActive(true);
    }, 500);
    
    // Step 2: Warp tunnel effect
    setTimeout(() => {
      // Progress to next room
      if (exit.direction === 'forward') {
        setCurrentRoom(prev => prev + 1);
      } else if (exit.direction === 'boss') {
        setCurrentRoom(6); // Boss room
      }
      
      // Reset room state
      resetRoomState();
    }, 1500);
    
    // Step 3: Materialize in new room
    setTimeout(() => {
      setWarpTunnelActive(false);
      setShadowDashAnimation(false);
      setGamePhase('combat');
      setRoomExits([]);
      
      // Generate new enemies for new room
      generateRoomEnemies();
    }, 2000);
  };

  const resetRoomState = () => {
    // Reset combat state for new room
    setSynergyGauge(0);
    setTeamUpReady(false);
    setCombatLog([]);
    setLootDrops([]);
    setTrapAlert(null);
    setBossStruggle(null);
    setPuzzleRunes([]);
    
    // Reset player positions
    setPlayers(prev => prev.map(player => ({
      ...player,
      health: Math.min(player.maxHealth, player.health + 10), // Small heal between rooms
      mana: Math.min(player.maxMana, player.mana + 20)
    })));
  };

  const generateRoomEnemies = () => {
    const dungeonStructure = {
      1: { type: 'entrance', act: 1, encounters: ['standard_combat'] },
      2: { type: 'trap_corridor', act: 1, encounters: ['simple_trap', 'standard_combat'] },
      3: { type: 'arena_chamber', act: 2, encounters: ['multi_wave_combat'] },
      4: { type: 'puzzle_chamber', act: 2, encounters: ['environmental_puzzle'] },
      5: { type: 'stealth_section', act: 2, encounters: ['stealth_bypass'] },
      6: { type: 'antechamber', act: 3, encounters: ['preparation'] },
      7: { type: 'boss_arena', act: 3, encounters: ['boss_battle'] }
    };
    
    const roomData = dungeonStructure[currentRoom as keyof typeof dungeonStructure];
    if (!roomData) return;
    
    let newEnemies: Enemy[] = [];
    
    // Generate Cha Hae-In contextual dialogue
    generateChaHaeInDialogue(roomData);
    
    switch (roomData.type) {
      case 'entrance':
        // Act I: Simple intro combat
        newEnemies = [
          {
            id: 'shadow_beast_1',
            name: 'Shadow Beast',
            health: 60,
            maxHealth: 60,
            x: 520,
            y: 320,
            type: 'shadow_beast'
          },
          {
            id: 'shadow_beast_2',
            name: 'Shadow Beast',
            health: 60,
            maxHealth: 60,
            x: 580,
            y: 300,
            type: 'shadow_beast'
          }
        ];
        break;
        
      case 'trap_corridor':
        // Act I: Trap teaching + combat
        newEnemies = [
          {
            id: 'orc_scout',
            name: 'Orc Scout',
            health: 70,
            maxHealth: 70,
            x: 600,
            y: 310,
            type: 'orc_warrior'
          }
        ];
        // Trigger trap sequence after 2 seconds
        setTimeout(() => {
          setTrapAlert({
            active: true,
            skillRequired: 'dodge',
            timeLeft: 3000
          });
          addToCombatLog("Cha Hae-In: 'Watch out! Spike trap ahead!'");
        }, 2000);
        break;
        
      case 'arena_chamber':
        // Act II: Multi-wave arena combat
        newEnemies = [
          {
            id: 'elite_orc_1',
            name: 'Elite Orc',
            health: 90,
            maxHealth: 90,
            x: 500,
            y: 320,
            type: 'orc_warrior'
          },
          {
            id: 'elite_orc_2',
            name: 'Elite Orc',
            health: 90,
            maxHealth: 90,
            x: 580,
            y: 300,
            type: 'orc_warrior'
          }
        ];
        // Second wave spawns after first wave defeated
        break;
        
      case 'puzzle_chamber':
        // Act II: Environmental puzzle - no immediate enemies
        newEnemies = [];
        setTimeout(() => {
          const sequence = [1, 3, 2, 4, 1];
          setEnvironmentalPuzzle({
            active: true,
            sequence,
            playerInput: [],
            completed: false
          });
          addToCombatLog("Cha Hae-In: 'The runes are glowing in a pattern. Follow the sequence!'");
          setGamePhase('room_clear');
        }, 1000);
        break;
        
      case 'stealth_section':
        // Act II: Stealth bypass challenge
        newEnemies = [
          {
            id: 'elite_guard',
            name: 'Elite Shadow Guard',
            health: 200,
            maxHealth: 200,
            x: 400,
            y: 280,
            type: 'boss',
            isStunned: false // This guard patrols
          }
        ];
        setTimeout(() => {
          setStealthChallenge({
            active: true,
            guardPosition: 50,
            playerHidden: false,
            detectionLevel: 0
          });
          addToCombatLog("Cha Hae-In: 'That guard patrols this area. Stay in the shadows!'");
        }, 1500);
        break;
        
      case 'antechamber':
        // Act III: Calm before storm - healing font
        newEnemies = [];
        setTimeout(() => {
          setHealingFont({
            active: true,
            used: false
          });
          addToCombatLog("A mystical healing font glows before you. Touch it to restore your strength.");
          setGamePhase('room_clear');
        }, 1000);
        break;
        
      case 'boss_arena':
        // Act III: Final boss battle
        newEnemies = [
          {
            id: 'shadow_sovereign',
            name: 'Shadow Sovereign',
            health: 350,
            maxHealth: 350,
            x: 600,
            y: 280,
            type: 'boss'
          }
        ];
        break;
    }
    
    setEnemies(newEnemies);
    addToCombatLog(`${roomData.act === 1 ? 'Act I' : roomData.act === 2 ? 'Act II' : 'Act III'}: ${roomData.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  };

  const generateChaHaeInDialogue = (roomData: any) => {
    const dialogues = {
      entrance: "This place feels ancient... I sense mana from beasts of the insectoid type. Stay sharp.",
      trap_corridor: "Wait, don't step there! I can sense magical traps ahead.",
      arena_chamber: "This chamber was built for combat. Prepare for multiple waves!",
      puzzle_chamber: "The pattern on the floor must be the key! Let me analyze this...",
      stealth_section: "That guard is too powerful to face directly. We need to find another way.",
      antechamber: "The air here is thick with mana... I can feel it. The Monarch is just beyond this door.",
      boss_arena: "This is it, Jin-Woo. Let's end this together!"
    };
    
    const dialogue = dialogues[roomData.type as keyof typeof dialogues];
    if (dialogue) {
      setTimeout(() => addToCombatLog(`Cha Hae-In: "${dialogue}"`), 1000);
    }
  };

  // Trap alert auto-damage system
  useEffect(() => {
    if (trapAlert && trapAlert.active) {
      const timer = setTimeout(() => {
        // Failed to avoid trap
        setPlayers(prev => prev.map(p => p.id === 'jinwoo' ? {
          ...p,
          health: Math.max(0, p.health - 20)
        } : p));
        addToCombatLog("Jin-Woo takes 20 damage from spike trap!");
        setTrapAlert(null);
      }, trapAlert.timeLeft);
      
      return () => clearTimeout(timer);
    }
  }, [trapAlert]);

  const triggerEnvironmentalPuzzle = () => {
    const sequence = [1, 3, 2, 4, 1]; // Pattern to solve
    setEnvironmentalPuzzle({
      active: true,
      sequence,
      playerInput: [],
      completed: false
    });
    
    addToCombatLog("Cha Hae-In: 'The runes are glowing in a pattern. Follow the sequence!'");
    setGamePhase('room_clear'); // Switch to puzzle mode
  };

  const triggerStealthChallenge = () => {
    setStealthChallenge({
      active: true,
      guardPosition: 50,
      playerHidden: false,
      detectionLevel: 0
    });
    
    addToCombatLog("Cha Hae-In: 'That guard patrols this area. Stay in the shadows!'");
    
    // Guard patrol movement
    const patrolInterval = setInterval(() => {
      setStealthChallenge(prev => {
        if (!prev || prev.detectionLevel >= 100) {
          clearInterval(patrolInterval);
          return prev;
        }
        
        const newPosition = (prev.guardPosition + 5) % 400;
        return {
          ...prev,
          guardPosition: newPosition,
          detectionLevel: prev.playerHidden ? Math.max(0, prev.detectionLevel - 2) : prev.detectionLevel + 3
        };
      });
    }, 100);
  };

  const triggerHealingFont = () => {
    setHealingFont({
      active: true,
      used: false
    });
    
    addToCombatLog("A mystical healing font glows before you. Touch it to restore your strength.");
    setGamePhase('room_clear'); // Allow interaction
  };

  const handleEnvironmentalPuzzleInput = (runeIndex: number) => {
    if (!environmentalPuzzle || environmentalPuzzle.completed) return;
    
    const newInput = [...environmentalPuzzle.playerInput, runeIndex];
    
    if (newInput.length <= environmentalPuzzle.sequence.length) {
      if (newInput[newInput.length - 1] !== environmentalPuzzle.sequence[newInput.length - 1]) {
        // Wrong input - reset
        setEnvironmentalPuzzle(prev => prev ? {
          ...prev,
          playerInput: []
        } : null);
        addToCombatLog("Wrong sequence! The runes dim and reset.");
        return;
      }
      
      setEnvironmentalPuzzle(prev => prev ? {
        ...prev,
        playerInput: newInput
      } : null);
      
      if (newInput.length === environmentalPuzzle.sequence.length) {
        // Completed puzzle
        setEnvironmentalPuzzle(prev => prev ? {
          ...prev,
          completed: true
        } : null);
        addToCombatLog("Cha Hae-In: 'Perfect! The path forward is clear!'");
        
        setTimeout(() => {
          setEnvironmentalPuzzle(null);
          generateRoomExits();
        }, 2000);
      }
    }
  };

  const handleHealingFontUse = () => {
    if (!healingFont || healingFont.used) return;
    
    setPlayers(prev => prev.map(player => ({
      ...player,
      health: player.maxHealth,
      mana: player.maxMana
    })));
    
    setHealingFont(prev => prev ? { ...prev, used: true } : null);
    addToCombatLog("The healing font restores your strength completely!");
    
    setTimeout(() => {
      setHealingFont(null);
      generateRoomExits();
    }, 2000);
  };

  const handleStealthHiding = (hidden: boolean) => {
    setStealthChallenge(prev => prev ? {
      ...prev,
      playerHidden: hidden
    } : null);
  };

  // Multi-wave combat for arena chamber
  const spawnSecondWave = () => {
    if (currentRoom === 3 && enemies.every(e => e.health <= 0) && currentWave === 1) {
      setCurrentWave(2);
      const waveEnemies: Enemy[] = [
        {
          id: 'wave2_orc_1',
          name: 'Berserker Orc',
          health: 110,
          maxHealth: 110,
          x: 450,
          y: 310,
          type: 'orc_warrior'
        },
        {
          id: 'wave2_beast_1',
          name: 'Alpha Shadow Beast',
          health: 80,
          maxHealth: 80,
          x: 620,
          y: 290,
          type: 'shadow_beast'
        }
      ];
      
      setEnemies(waveEnemies);
      addToCombatLog("Cha Hae-In: 'More enemies incoming! Second wave!'");
      setMultiWaveActive(true);
    }
  };

  // Stealth challenge progression
  useEffect(() => {
    if (stealthChallenge && stealthChallenge.active) {
      const interval = setInterval(() => {
        setStealthChallenge(prev => {
          if (!prev) return prev;
          
          const newPosition = (prev.guardPosition + 5) % 400;
          let newDetection = prev.detectionLevel;
          
          if (prev.playerHidden) {
            newDetection = Math.max(0, newDetection - 2);
          } else {
            newDetection = Math.min(100, newDetection + 3);
          }
          
          // Success condition - stay hidden long enough
          if (newDetection === 0 && prev.detectionLevel > 50) {
            addToCombatLog("Cha Hae-In: 'Perfect! We've bypassed the guard!'");
            setTimeout(() => {
              setStealthChallenge(null);
              setEnemies([]); // Remove guard
              generateRoomExits();
            }, 2000);
            return { ...prev, guardPosition: newPosition, detectionLevel: 0 };
          }
          
          // Failure condition - detected
          if (newDetection >= 100) {
            addToCombatLog("DETECTED! The guard attacks!");
            setGamePhase('combat');
            clearInterval(interval);
            return null;
          }
          
          return {
            ...prev,
            guardPosition: newPosition,
            detectionLevel: newDetection
          };
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [stealthChallenge]);

  // Reset room state between encounters
  const resetRoomForNewEncounter = () => {
    setCurrentWave(1);
    setMultiWaveActive(false);
    setEnvironmentalPuzzle(null);
    setStealthChallenge(null);
    setHealingFont(null);
    setTrapAlert(null);
    setBossStruggle(null);
    setPuzzleRunes([]);
  };

  // Additional mechanics for trap, loot, struggle, etc.
  const generateLootDrop = (x: number, y: number) => {
    const lootAmount = Math.floor(Math.random() * 5000) + 1000;
    const id = Math.random().toString(36).substr(2, 9);
    const jinwoo = players.find(p => p.id === 'jinwoo');
    
    if (jinwoo) {
      setLootDrops(prev => [...prev, {
        id,
        amount: lootAmount,
        x,
        y,
        targetX: jinwoo.x,
        targetY: jinwoo.y,
        isCollected: false
      }]);
      
      setTimeout(() => {
        setLootDrops(prev => prev.map(loot => 
          loot.id === id ? { ...loot, isCollected: true } : loot
        ));
        
        setTimeout(() => {
          setLootDrops(prev => prev.filter(loot => loot.id !== id));
        }, 800);
      }, 1000);
    }
  };

  const triggerTrap = () => {
    const trapSkills = ['violent_slash', 'mutilate', 'shadow_exchange'];
    const requiredSkill = trapSkills[Math.floor(Math.random() * trapSkills.length)];
    
    setTrapAlert({
      active: true,
      skillRequired: requiredSkill,
      timeLeft: 1000
    });
    
    addToCombatLog("⚠️ TRAP TRIGGERED! Quick, use the highlighted skill!");
    
    setTimeout(() => {
      setTrapAlert(prev => {
        if (prev?.active) {
          addToCombatLog("Failed to evade trap! Jin-Woo takes damage!");
          setPlayers(p => p.map(player => 
            player.id === 'jinwoo' ? { ...player, health: Math.max(0, player.health - 15) } : player
          ));
          triggerCameraShake();
        }
        return null;
      });
    }, 1000);
  };

  const triggerBossStruggle = () => {
    setBossStruggle({
      active: true,
      progress: 0,
      timeLeft: 5000
    });
    
    addToCombatLog("Boss struggle! Rapidly tap to break free!");
  };

  const handleStruggleTap = () => {
    if (bossStruggle?.active) {
      setBossStruggle(prev => {
        if (!prev) return null;
        
        const newProgress = Math.min(100, prev.progress + 8);
        
        // Check for completion
        if (newProgress >= 100) {
          // Successfully broke free
          addToCombatLog("Successfully broke free from boss grip!");
          setSynergyGauge(prev => Math.min(100, prev + 15));
          
          // Return null to close the struggle
          setTimeout(() => {
            setBossStruggle(null);
          }, 500);
          
          return { ...prev, progress: 100 };
        }
        
        return { ...prev, progress: newProgress };
      });
    }
  };

  // Skill execution and combat mechanics
  const handleSkillTap = useCallback((skillId: string) => {
    if (gamePhase !== 'combat') return;
    
    if (trapAlert?.active && trapAlert.skillRequired === skillId) {
      setTrapAlert(null);
      addToCombatLog("Successfully evaded trap with quick reflexes!");
      setSynergyGauge(prev => Math.min(100, prev + 5));
      return;
    }
    
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) return;
    
    if (skill.currentCooldown > 0) {
      triggerCameraShake();
      return;
    }
    
    if (jinwoo.mana < skill.manaCost) {
      setSkills(prev => prev.map(s => 
        s.id === skillId ? { ...s, flashRed: true } : s
      ));
      setTimeout(() => {
        setSkills(prev => prev.map(s => ({ ...s, flashRed: false })));
      }, 200);
      return;
    }
    
    executeSkill(skill);
  }, [gamePhase, skills, players, trapAlert]);

  const executeSkill = (skill: Skill) => {
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) return;

    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - skill.manaCost } : p
    ));

    setSkills(prev => prev.map(s => 
      s.id === skill.id ? { ...s, currentCooldown: skill.cooldown } : s
    ));

    const damage = Math.floor(Math.random() * 50) + 30;
    const targetEnemy = enemies.find(e => e.health > 0);
    
    if (targetEnemy) {
      setEnemies(prev => prev.map(e => 
        e.id === targetEnemy.id ? { ...e, health: Math.max(0, e.health - damage) } : e
      ));
      
      showDamageNumber(damage, targetEnemy.x, targetEnemy.y, true);
      setSynergyGauge(prev => Math.min(100, prev + 15));
      addToCombatLog(`Jin-Woo uses ${skill.name} for ${damage} damage!`);
      triggerCameraShake();
    }
  };

  // Synergy system with team-up attacks
  useEffect(() => {
    if (synergyGauge >= 100 && !teamUpReady) {
      setTeamUpReady(true);
      setSynergyChimeReady(true);
      addToCombatLog("Team-Up Attack Ready! Perfect synergy achieved!");
    }
  }, [synergyGauge]);

  // Cooldown timer system
  useEffect(() => {
    const interval = setInterval(() => {
      setSkills(prev => prev.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 100)
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Enhanced AI for Cha Hae-In with reactive behavior
  useEffect(() => {
    if (gamePhase === 'combat') {
      const interval = setInterval(() => {
        const chahaein = players.find(p => p.id === 'chahaein');
        const jinwoo = players.find(p => p.id === 'jinwoo');
        const aliveEnemies = enemies.filter(e => e.health > 0);
        
        if (chahaein && jinwoo && aliveEnemies.length > 0) {
          // Priority targeting - focus on stunned enemies or same target as Jin-Woo
          let targetEnemy = aliveEnemies.find(e => e.isStunned);
          if (!targetEnemy && targetedEnemy) {
            targetEnemy = aliveEnemies.find(e => e.id === targetedEnemy);
          }
          if (!targetEnemy) {
            targetEnemy = aliveEnemies[0];
          }
          
          const damage = Math.floor(Math.random() * 25) + 15;
          const isStunnedTarget = targetEnemy.isStunned || false;
          const finalDamage = isStunnedTarget ? Math.floor(damage * 1.3) : damage; // Bonus damage on stunned enemies
          
          setEnemies(prev => prev.map(e => 
            e.id === targetEnemy.id ? { ...e, health: Math.max(0, e.health - finalDamage) } : e
          ));
          
          showDamageNumber(finalDamage, targetEnemy.x + 20, targetEnemy.y, Boolean(isStunnedTarget));
          
          if (isStunnedTarget) {
            addToCombatLog(`Cha Hae-In exploits the opening for ${finalDamage} damage!`);
            setSynergyGauge(prev => Math.min(100, prev + 12)); // Extra synergy for teamwork
          } else {
            addToCombatLog(`Cha Hae-In strikes ${targetEnemy.name} for ${finalDamage} damage!`);
            setSynergyGauge(prev => Math.min(100, prev + 8));
          }
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [gamePhase, players, enemies, targetedEnemy]);

  // Enemy AI with telegraph attacks
  useEffect(() => {
    if (gamePhase === 'combat') {
      const interval = setInterval(() => {
        const aliveEnemies = enemies.filter(e => e.health > 0 && !e.isStunned);
        const jinwoo = players.find(p => p.id === 'jinwoo');
        
        if (aliveEnemies.length > 0 && jinwoo && Math.random() < 0.4) {
          const attackingEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          
          // Create telegraph warning
          const attackTypes: ('attack' | 'charge' | 'slam')[] = ['attack', 'charge', 'slam'];
          const randomType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
          
          const telegraph = {
            enemyId: attackingEnemy.id,
            type: randomType,
            dangerZone: {
              x: jinwoo.x - 30,
              y: jinwoo.y - 20,
              width: 80,
              height: 60
            },
            timeLeft: 2000
          };
          
          setEnemyTelegraphs(prev => [...prev, telegraph]);
          addToCombatLog(`${attackingEnemy.name} prepares to attack! Move to dodge!`);
          
          // Execute attack after delay
          setTimeout(() => {
            const currentJinwoo = players.find(p => p.id === 'jinwoo');
            if (currentJinwoo) {
              // Check if player is still in danger zone
              const inDangerZone = 
                currentJinwoo.x >= telegraph.dangerZone.x &&
                currentJinwoo.x <= telegraph.dangerZone.x + telegraph.dangerZone.width &&
                currentJinwoo.y >= telegraph.dangerZone.y &&
                currentJinwoo.y <= telegraph.dangerZone.y + telegraph.dangerZone.height;
              
              if (inDangerZone) {
                const damage = Math.floor(Math.random() * 20) + 15;
                setPlayers(prev => prev.map(p => 
                  p.id === 'jinwoo' ? { ...p, health: Math.max(0, p.health - damage) } : p
                ));
                showDamageNumber(damage, currentJinwoo.x, currentJinwoo.y - 30, false);
                addToCombatLog(`${attackingEnemy.name} hits Jin-Woo for ${damage} damage!`);
              } else {
                addToCombatLog(`Jin-Woo successfully dodges ${attackingEnemy.name}'s attack!`);
              }
            }
            
            // Remove telegraph
            setEnemyTelegraphs(prev => prev.filter(t => t.enemyId !== telegraph.enemyId));
          }, 2000);
        }
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [gamePhase, enemies, players]);

  // Mana regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => prev.map(player => ({
        ...player,
        mana: Math.min(player.maxMana, player.mana + 1)
      })));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Game initialization
  useEffect(() => {
    if (isVisible && gamePhase === 'prep') {
      setCurrentRoom(1);
      generateRoomEnemies();
      setTimeout(() => {
        setGamePhase('combat');
        addToCombatLog("Entering the Shadow Dungeon - Room 1!");
      }, 2000);
    }
    
    if (!isVisible) {
      setGamePhase('prep');
      setCurrentRoom(1);
      setCombatLog([]);
      setSynergyGauge(0);
      setTeamUpReady(false);
      setCommandMode(false);
      setLootDrops([]);
      setTrapAlert(null);
      setBossStruggle(null);
      setPuzzleRunes([]);
      setSynergyChimeReady(false);
      setRoomExits([]);
      setShadowDashAnimation(false);
      setWarpTunnelActive(false);
    }
  }, [isVisible, gamePhase]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-gray-900 via-red-950 to-black overflow-hidden"
    >
      {/* Room Progress Indicator */}
      <div className="absolute top-2 left-2 z-30">
        <motion.div
          className="backdrop-blur-md bg-black/70 rounded-lg px-3 py-2 border border-purple-500/40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="text-xs">
              <div className="text-white font-bold">Shadow Dungeon</div>
              <div className="flex gap-2">
                <span className="text-red-400">B-Rank</span>
                <span className="text-purple-400">Floor 15</span>
              </div>
            </div>
            
            <div className="border-l border-purple-500/40 pl-3">
              <div className="flex items-center gap-2">
                <div className="text-purple-400 text-xs font-bold">Room</div>
                <div className="text-white text-sm font-bold">{currentRoom}</div>
                <div className="text-gray-400 text-xs">/7</div>
                
                {/* Room Type Badge */}
                <div className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-600/20 to-amber-500/20 text-purple-300 border border-purple-400/30">
                  {currentRoom === 1 && 'Entrance'}
                  {currentRoom === 2 && 'Trap Corridor'}
                  {currentRoom === 3 && 'Arena Chamber'}
                  {currentRoom === 4 && 'Puzzle Chamber'}
                  {currentRoom === 5 && 'Stealth Section'}
                  {currentRoom === 6 && 'Antechamber'}
                  {currentRoom === 7 && 'Boss Arena'}
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-1 w-20 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentRoom / 7) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-2 right-2 z-30 flex gap-2">
        {/* Victory Check Button for Testing */}
        {gamePhase === 'combat' && (
          <button
            onClick={() => {
              console.log('Checking victory condition...');
              console.log('Enemies:', enemies.map(e => ({ id: e.id, health: e.health })));
              
              const aliveEnemies = enemies.filter(e => e.health > 0);
              console.log('Alive enemies:', aliveEnemies.length);
              
              if (aliveEnemies.length === 0) {
                console.log('Victory detected! Starting spoils sequence...');
                addToCombatLog("VICTORY! All enemies defeated!");
                
                // Generate loot drops
                enemies.forEach(enemy => {
                  console.log(`Generating loot for ${enemy.name} at (${enemy.x}, ${enemy.y})`);
                  generateLootDrop(enemy.x, enemy.y);
                });
                
                // Start room clear sequence
                setTimeout(() => {
                  console.log('Setting game phase to room_clear');
                  setGamePhase('room_clear');
                  generateRoomExits();
                  addToCombatLog("Exit portals have materialized!");
                }, 2500);
              } else {
                console.log('Still have alive enemies:', aliveEnemies);
                addToCombatLog(`${aliveEnemies.length} enemies still alive!`);
              }
            }}
            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
          >
            Victory
          </button>
        )}
        
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-red-600/30 bg-black/70 backdrop-blur-md h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 2.5D Side-Scrolling Combat Arena */}
      {gamePhase === 'combat' && (
        <motion.div 
          ref={battlefieldRef}
          className="absolute inset-x-4 top-4 bottom-32 overflow-hidden cursor-crosshair rounded-lg border border-purple-500/30"
          onClick={handleBattlefieldTap}
          animate={cameraShake ? { 
            x: [0, -2, 2, -2, 2, 0],
            y: [0, -1, 1, -1, 1, 0]
          } : {}}
          transition={{ duration: 0.2 }}
        >
          {/* Gothic Cathedral Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-gray-900/80 to-red-900/90" />
          
          {/* Atmospheric Pillars */}
          <div className="absolute left-8 top-4 bottom-8 w-12 bg-gradient-to-b from-gray-700/60 to-gray-900/40 rounded opacity-60" />
          <div className="absolute right-8 top-4 bottom-8 w-12 bg-gradient-to-b from-gray-700/60 to-gray-900/40 rounded opacity-60" />
          
          {/* Ground Line */}
          <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* Enemy Telegraph Danger Zones */}
          {enemyTelegraphs.map((telegraph, index) => (
            <motion.div
              key={`telegraph-${index}`}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded z-10"
              style={{
                left: telegraph.dangerZone.x,
                top: telegraph.dangerZone.y,
                width: telegraph.dangerZone.width,
                height: telegraph.dangerZone.height
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity
              }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-400 text-xl font-bold">
                ⚠️
              </div>
            </motion.div>
          ))}
          
          {/* Full Character Models with Health Auras */}
          {players.map(player => (
            <motion.div
              key={player.id}
              className="absolute"
              style={{ left: player.x - 30, top: player.y - 60 }}
              animate={{ scale: player.isActive ? 1.1 : 1 }}
            >
              {/* Health Aura at feet */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-4 rounded-full"
                style={{
                  background: `radial-gradient(ellipse, ${
                    player.id === 'jinwoo' ? 'rgba(147, 51, 234, 0.8)' : 'rgba(236, 72, 153, 0.8)'
                  } 0%, transparent 100%)`
                }}
                animate={{
                  scale: player.health / player.maxHealth,
                  opacity: player.health > 0 ? 1 : 0
                }}
              />
              
              {/* Character Sprite - Full body representation */}
              <div className="relative w-12 h-16 flex items-end justify-center">
                <div className={`w-8 h-12 rounded-lg flex items-center justify-center text-white font-bold ${
                  player.id === 'jinwoo' ? 'bg-gradient-to-b from-purple-600 to-purple-800' : 'bg-gradient-to-b from-pink-600 to-pink-800'
                }`}>
                  {player.id === 'jinwoo' ? '🗡️' : '⚔️'}
                </div>
              </div>
              
              {/* Health Bar above character */}
              <div className="absolute -top-4 left-0 w-12 h-1 bg-gray-700 rounded">
                <motion.div 
                  className="h-full bg-green-500 rounded"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}

          {/* Enemy Models on Right Side */}
          {enemies.map(enemy => (
            <motion.div
              key={enemy.id}
              className="absolute"
              style={{ left: enemy.x - 25, top: enemy.y - 50 }}
            >
              {/* Enemy Health Aura */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-4 rounded-full"
                style={{
                  background: `radial-gradient(ellipse, rgba(239, 68, 68, 0.8) 0%, transparent 100%)`
                }}
                animate={{
                  scale: enemy.health / enemy.maxHealth,
                  opacity: enemy.health > 0 ? 1 : 0
                }}
              />
              
              {/* Enemy Sprite */}
              <div className="relative w-10 h-14 flex items-end justify-center">
                <div className="w-8 h-10 rounded-lg bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-800 flex items-center justify-center">
                  <span className="text-white text-lg">
                    {enemy.type === 'boss' ? '👹' : '👺'}
                  </span>
                </div>
              </div>
              
              {/* Enemy Health Bar */}
              <div className="absolute -top-3 left-0 w-10 h-1 bg-gray-700 rounded">
                <motion.div 
                  className="h-full bg-red-500 rounded"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                />
              </div>
            </motion.div>
          ))}

          {/* Visual Damage Numbers */}
          <AnimatePresence>
            {damageNumbers.map(damage => (
              <motion.div
                key={damage.id}
                className={`absolute pointer-events-none font-bold ${
                  damage.isCritical ? 'text-yellow-400 text-lg' : 'text-white text-sm'
                }`}
                style={{ left: damage.x, top: damage.y }}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ 
                  opacity: 0, 
                  y: -30, 
                  scale: damage.isCritical ? 1.5 : 1 
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
              >
                {damage.damage}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Magnetic Loot Drops */}
          <AnimatePresence>
            {lootDrops.map(loot => (
              <motion.div
                key={loot.id}
                className="absolute pointer-events-none"
                style={{ left: loot.x, top: loot.y }}
                initial={{ opacity: 1, scale: 0 }}
                animate={loot.isCollected ? {
                  x: loot.targetX - loot.x,
                  y: loot.targetY - loot.y,
                  scale: 0.5,
                  opacity: 0
                } : {
                  opacity: 1,
                  scale: 1,
                  y: [0, -5, 0, -3, 0]
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  duration: loot.isCollected ? 0.8 : 2,
                  ease: loot.isCollected ? "easeInOut" : "easeInOut",
                  repeat: loot.isCollected ? 0 : Infinity
                }}
              >
                <div className="relative">
                  <span className="text-yellow-400 text-sm font-bold drop-shadow-lg">₩{loot.amount}</span>
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Environmental Puzzle Interface */}
      {environmentalPuzzle && environmentalPuzzle.active && !environmentalPuzzle.completed && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-gray-900/90 rounded-lg p-6 border border-purple-500/50">
            <h3 className="text-white text-xl font-bold mb-4 text-center">Ancient Rune Sequence</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {[1, 2, 3, 4].map((runeIndex) => (
                <motion.button
                  key={runeIndex}
                  className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                    environmentalPuzzle.playerInput.includes(runeIndex) 
                      ? 'bg-purple-600 border-purple-400 text-white' 
                      : 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => handleEnvironmentalPuzzleInput(runeIndex)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {runeIndex}
                </motion.button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-400">
              Progress: {environmentalPuzzle.playerInput.length} / {environmentalPuzzle.sequence.length}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stealth Challenge Interface */}
      {stealthChallenge && stealthChallenge.active && (
        <motion.div
          className="absolute bottom-40 left-4 right-4 z-40"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gray-900/90 rounded-lg p-4 border border-red-500/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold">Stealth Challenge</h3>
              <div className="text-red-400 text-sm">
                Detection: {Math.floor(stealthChallenge.detectionLevel)}%
              </div>
            </div>
            
            {/* Detection bar */}
            <div className="w-full h-2 bg-gray-700 rounded mb-3">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded"
                animate={{ width: `${stealthChallenge.detectionLevel}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            {/* Hide/Show buttons */}
            <div className="flex gap-2">
              <motion.button
                className={`px-4 py-2 rounded font-bold ${
                  stealthChallenge.playerHidden 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => handleStealthHiding(true)}
                whileTap={{ scale: 0.95 }}
              >
                Hide in Shadows
              </motion.button>
              <motion.button
                className={`px-4 py-2 rounded font-bold ${
                  !stealthChallenge.playerHidden 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
                onClick={() => handleStealthHiding(false)}
                whileTap={{ scale: 0.95 }}
              >
                Move Openly
              </motion.button>
            </div>
            
            {stealthChallenge.detectionLevel >= 100 && (
              <div className="mt-2 text-red-400 text-sm font-bold">
                DETECTED! Prepare for combat!
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Healing Font Interface */}
      {healingFont && healingFont.active && !healingFont.used && (
        <motion.div
          className="absolute inset-0 z-40 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="relative"
            animate={{
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.6)",
                "0 0 40px rgba(59, 130, 246, 0.8)",
                "0 0 20px rgba(59, 130, 246, 0.6)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.button
              className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-6xl cursor-pointer border-4 border-white/50"
              onClick={handleHealingFontUse}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ⛲
            </motion.button>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded text-white text-sm font-bold">
              Healing Font
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Room Clear State - Glowing Exit Portals */}
      {gamePhase === 'room_clear' && !environmentalPuzzle && !healingFont && (
        <AnimatePresence>
          {roomExits.map(exit => (
            <motion.div
              key={exit.id}
              className="absolute cursor-pointer"
              style={{ left: exit.position.x, top: exit.position.y }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={() => handleExitChoice(exit.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {/* Glowing Portal Base */}
              <motion.div
                className="w-16 h-16 rounded-full relative"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.6)",
                    "0 0 40px rgba(147, 51, 234, 0.8)",
                    "0 0 20px rgba(147, 51, 234, 0.6)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Portal Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-amber-500 p-1">
                  <div className="w-full h-full rounded-full bg-black/80 flex items-center justify-center">
                    {/* Portal Icon */}
                    {exit.direction === 'forward' && (
                      <motion.div
                        className="text-white text-2xl"
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    )}
                    {exit.direction === 'treasure' && (
                      <motion.div
                        className="text-yellow-400 text-xl"
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💎
                      </motion.div>
                    )}
                    {exit.direction === 'boss' && (
                      <motion.div
                        className="text-red-400 text-xl"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ⚔️
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Swirling Particles */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-purple-400/50"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
              
              {/* Portal Label */}
              <motion.div
                className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-1 rounded text-white text-xs font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {exit.direction === 'forward' && 'Continue'}
                {exit.direction === 'treasure' && 'Treasure'}
                {exit.direction === 'boss' && 'Boss'}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Shadow Dash Transition */}
      <AnimatePresence>
        {shadowDashAnimation && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Jin-Woo Dissolving Animation */}
            <motion.div
              className="absolute"
              style={{ left: players.find(p => p.id === 'jinwoo')?.x || 120, top: players.find(p => p.id === 'jinwoo')?.y || 320 }}
              animate={{
                scale: [1, 1.2, 0],
                opacity: [1, 0.5, 0],
                filter: [
                  "blur(0px)",
                  "blur(2px)",
                  "blur(8px)"
                ]
              }}
              transition={{ duration: 0.8 }}
            >
              {/* Shadow Particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-purple-600 rounded-full"
                  style={{
                    left: Math.random() * 40,
                    top: Math.random() * 40
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 200],
                    y: [0, (Math.random() - 0.5) * 200],
                    opacity: [1, 0],
                    scale: [1, 0]
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.05
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warp Tunnel Effect */}
      <AnimatePresence>
        {warpTunnelActive && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Tunnel Background */}
            <div className="absolute inset-0 bg-black" />
            
            {/* Warp Rings */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute border-4 border-purple-500/30 rounded-full"
                style={{
                  width: 100 + i * 60,
                  height: 100 + i * 60,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{
                  scale: [1, 2, 3],
                  opacity: [0.8, 0.4, 0],
                  borderColor: [
                    "rgba(147, 51, 234, 0.8)",
                    "rgba(251, 191, 36, 0.6)",
                    "rgba(147, 51, 234, 0.2)"
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "linear"
                }}
              />
            ))}
            
            {/* Speed Lines */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                style={{
                  height: Math.random() * 200 + 50,
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                  rotate: Math.random() * 360
                }}
                animate={{
                  x: [0, (Math.random() - 0.5) * 2000],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 0.5
                }}
              />
            ))}
            
            {/* Room Transition Text */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <div className="text-purple-400">Shadow Dash</div>
                <div className="text-sm text-gray-300 mt-2">Entering Room {currentRoom + 1}</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Synergy Gauge - Corner to Center */}
      <motion.div 
        className={`absolute z-30 ${teamUpReady ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' : 'top-16 right-4'}`}
        initial={false}
        animate={teamUpReady ? {
          scale: [1, 2.5],
          x: teamUpReady ? [0, -200] : [0, 0],
          y: teamUpReady ? [0, 100] : [0, 0]
        } : {
          scale: 1,
          x: 0,
          y: 0
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      >
        <motion.div
          className={teamUpReady ? "w-32 h-32" : "w-16 h-16"}
          animate={teamUpReady ? {
            filter: [
              "drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))",
              "drop-shadow(0 0 40px rgba(251, 191, 36, 0.8))",
              "drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))"
            ]
          } : {}}
          transition={{ duration: 2, repeat: teamUpReady ? Infinity : 0 }}
        >
          <svg viewBox="0 0 64 64" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(147, 51, 234, 0.3)"
              strokeWidth={teamUpReady ? "4" : "6"}
            />
            
            {/* Progress ring */}
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="url(#synergyGradient)"
              strokeWidth={teamUpReady ? "4" : "6"}
              strokeLinecap="round"
              strokeDasharray={176}
              strokeDashoffset={176 - (synergyGauge / 100) * 176}
              transition={{ duration: 0.3 }}
            />
            
            {/* Outer glow ring when ready */}
            {teamUpReady && (
              <motion.circle
                cx="32"
                cy="32"
                r="30"
                fill="none"
                stroke="url(#glowGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={188}
                strokeDashoffset={0}
                animate={{
                  strokeDashoffset: [0, -188],
                  opacity: [0.8, 0.3, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}
            
            <defs>
              <linearGradient id="synergyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#9333ea" stopOpacity="0.4" />
              </radialGradient>
            </defs>
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {teamUpReady ? (
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold py-2 px-4 rounded-full shadow-lg border-2 border-white/30"
                onClick={() => {
                  // Execute team-up attack
                  setEnemies(prev => prev.map(e => ({
                    ...e,
                    health: Math.max(0, e.health - 200)
                  })));
                  
                  enemies.forEach(enemy => {
                    showDamageNumber(200, enemy.x, enemy.y, true);
                  });
                  
                  addToCombatLog("Jin-Woo and Cha Hae-In execute devastating Team-Up Attack!");
                  setSynergyGauge(0);
                  setTeamUpReady(false);
                  triggerCameraShake();
                  
                  // Check for victory - trigger spoils sequence
                  setTimeout(() => {
                    const aliveEnemies = enemies.filter(e => e.health > 0);
                    if (aliveEnemies.length === 0) {
                      if (currentRoom >= 7) {
                        setGamePhase('victory');
                      } else {
                        addToCombatLog("Victory! Collecting spoils...");
                        
                        // Generate loot for defeated enemies
                        enemies.forEach(enemy => {
                          generateLootDrop(enemy.x, enemy.y);
                        });
                        
                        // Transition to room clear
                        setTimeout(() => {
                          setGamePhase('room_clear');
                          generateRoomExits();
                        }, 2500);
                      }
                    }
                  }, 1000);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">TEAM-UP</span>
                </div>
              </motion.button>
            ) : (
              <span className="text-white text-xs font-bold">{Math.floor(synergyGauge)}%</span>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* System 11 Touch-Based Action Bar - 4 Slots */}
      <div className="absolute bottom-4 left-4 right-4">
        {/* 4-Slot Action Bar */}
        <div className="flex justify-center gap-3 mb-4">
          {skills.map((skill, index) => {
            const IconComponent = skill.icon;
            const isOnCooldown = skill.currentCooldown > 0;
            const jinwoo = players.find(p => p.id === 'jinwoo');
            const notEnoughMana = jinwoo && jinwoo.mana < skill.manaCost;
            
            return (
              <motion.button
                key={skill.id}
                className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center ${
                  isOnCooldown ? 'border-gray-600 bg-gray-800/50' : 
                  notEnoughMana ? 'border-red-500 bg-red-900/30' :
                  trapAlert?.active && trapAlert.skillRequired === skill.id ? 'border-yellow-400 bg-yellow-500/40 animate-pulse shadow-lg shadow-yellow-500/60' :
                  'border-purple-400 bg-purple-600/20'
                }`}
                onClick={() => handleSkillTap(skill.id)}
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  background: isOnCooldown ? 'rgba(75, 85, 99, 0.3)' :
                             notEnoughMana ? 'rgba(153, 27, 27, 0.3)' :
                             trapAlert?.active && trapAlert.skillRequired === skill.id ? 'rgba(234, 179, 8, 0.5)' :
                             skill.isCharging ? 'rgba(147, 51, 234, 0.6)' :
                             'rgba(147, 51, 234, 0.3)'
                }}
                whileTap={{ scale: 0.9 }}
                animate={skill.flashRed ? { backgroundColor: '#dc2626' } : {}}
              >
                <IconComponent 
                  className={`w-8 h-8 ${
                    isOnCooldown ? 'text-gray-500' : 
                    notEnoughMana ? 'text-red-400' :
                    'text-white'
                  }`} 
                />
                
                {/* Cooldown Overlay */}
                {isOnCooldown && (
                  <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {Math.ceil(skill.currentCooldown / 1000)}
                    </span>
                  </div>
                )}
                
                {/* Slot Number */}
                <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-purple-600 border border-white flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                
                {/* Mana Cost */}
                <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-blue-600 border border-white flex items-center justify-center">
                  <span className="text-white text-xs">{skill.manaCost}</span>
                </div>
              </motion.button>
            );
          })}
        </div>


      </div>

      {/* Victory/Defeat Screens */}
      {(gamePhase === 'victory' || gamePhase === 'defeat') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-4 flex items-center justify-center"
        >
          <div className={`backdrop-blur-md rounded-xl p-8 border max-w-md text-center ${
            gamePhase === 'victory' ? 'bg-green-900/60 border-green-500/30' : 'bg-red-900/60 border-red-500/30'
          }`}>
            <h3 className={`text-3xl font-bold mb-4 ${
              gamePhase === 'victory' ? 'text-green-300' : 'text-red-300'
            }`}>
              {gamePhase === 'victory' ? 'Victory!' : 'Defeat...'}
            </h3>
            
            {gamePhase === 'victory' && (
              <div className="text-green-200 mb-6">
                <p className="mb-2">The shadow dungeon has been cleared!</p>
                <p className="italic">"Incredible power, Jin-Woo... fighting beside you feels natural." - Cha Hae-In</p>
                
                <div className="mt-4 p-3 bg-green-800/30 rounded">
                  <h4 className="font-bold mb-2">Rewards Earned:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• ₩15,000,000</li>
                    <li>• +500 XP</li>
                    <li>• Shadow Beast Core x3</li>
                    <li>• Affection +10</li>
                  </ul>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onRaidComplete(gamePhase === 'victory', gamePhase === 'victory' ? [{ type: 'gold', amount: 15000000 }] : []);
                }}
                className={gamePhase === 'victory' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Continue
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Trap Alert System */}
      <AnimatePresence>
        {trapAlert?.active && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-red-900/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-red-800 border-4 border-red-600 rounded-lg p-6 text-center"
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
            >
              <div className="text-white text-xl font-bold mb-2">⚠️ TRAP TRIGGERED!</div>
              <div className="text-yellow-400 text-lg mb-4">Use {trapAlert.skillRequired.replace('_', ' ').toUpperCase()} to evade!</div>
              <motion.div
                className="w-32 h-2 bg-gray-700 rounded-full mx-auto"
                initial={{ width: '100%' }}
              >
                <motion.div
                  className="h-full bg-red-500 rounded-full"
                  animate={{ width: '0%' }}
                  transition={{ duration: trapAlert.timeLeft / 1000 }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boss Struggle Mini-Game */}
      <AnimatePresence>
        {bossStruggle?.active && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTap={handleStruggleTap}
          >
            <motion.div
              className="bg-gray-900 border-4 border-purple-600 rounded-lg p-8 text-center"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
            >
              <div className="text-white text-2xl font-bold mb-4">💪 BOSS STRUGGLE!</div>
              <div className="text-yellow-400 text-lg mb-4">Rapidly tap to break free!</div>
              <div className="w-48 h-4 bg-gray-700 rounded-full mx-auto mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                  animate={{ width: `${bossStruggle.progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="text-white text-sm mb-4">
                Progress: {Math.floor(bossStruggle.progress)}%
              </div>
              
              {/* Completion button when at 100% */}
              {bossStruggle.progress >= 100 && (
                <button
                  onClick={() => {
                    addToCombatLog("Successfully broke free from boss grip!");
                    setSynergyGauge(prev => Math.min(100, prev + 15));
                    setBossStruggle(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 font-bold"
                >
                  BREAK FREE!
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}