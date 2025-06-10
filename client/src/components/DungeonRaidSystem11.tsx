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
  const [gamePhase, setGamePhase] = useState<'prep' | 'combat' | 'victory' | 'defeat' | 'room_clear' | 'transition' | 'puzzle' | 'stealth' | 'boss_antechamber'>('prep');
  const [dungeonAct, setDungeonAct] = useState<1 | 2 | 3>(1);
  const [currentRoom, setCurrentRoom] = useState(1);
  const [totalRooms] = useState(7);
  const [currentWave, setCurrentWave] = useState(1);
  const [maxWaves, setMaxWaves] = useState(1);
  
  // Dungeon progression state
  const [roomExits, setRoomExits] = useState<Array<{
    id: string;
    direction: 'forward' | 'treasure' | 'boss';
    position: { x: number; y: number };
    glowing: boolean;
    label: string;
  }>>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionEffect, setTransitionEffect] = useState<'shadow_dash' | 'warp_tunnel' | null>(null);
  
  // Combat & interaction state
  const [synergyGauge, setSynergyGauge] = useState(0);
  const [teamUpReady, setTeamUpReady] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [commandMode, setCommandMode] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  
  // Visual effects state
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical: boolean;
    timestamp: number;
  }>>([]);
  const [lootDrops, setLootDrops] = useState<Array<{
    id: string;
    amount: number;
    type: 'gold' | 'item';
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    isCollected: boolean;
  }>>([]);
  
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
  
  // Touch-based skill system - 4 slot action bar
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: 'mutilate',
      name: 'Mutilate',
      icon: Target,
      cooldown: 3000,
      manaCost: 15,
      type: 'launcher',
      currentCooldown: 0
    },
    {
      id: 'violent_slash',
      name: 'Violent Slash',
      icon: Wind,
      cooldown: 5000,
      manaCost: 20,
      type: 'dash',
      currentCooldown: 0
    },
    {
      id: 'dominators_touch',
      name: "Dominator's Touch",
      icon: Flame,
      cooldown: 8000,
      manaCost: 35,
      type: 'charge_aoe',
      currentCooldown: 0,
      isCharging: false,
      chargeTime: 0
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      icon: Crown,
      cooldown: 12000,
      manaCost: 50,
      type: 'special',
      currentCooldown: 0
    }
  ]);
  
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'jinwoo',
      name: 'Sung Jin-Woo',
      health: 100,
      maxHealth: 100,
      mana: 80,
      maxMana: 80,
      x: 100,
      y: 200,
      isActive: true
    },
    {
      id: 'chahaein',
      name: 'Cha Hae-In',
      health: 100,
      maxHealth: 100,
      mana: 90,
      maxMana: 90,
      x: 150,
      y: 180,
      isActive: false
    }
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const battlefieldRef = useRef<HTMLDivElement>(null);
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize dungeon when component becomes visible
  useEffect(() => {
    if (isVisible) {
      initializeDungeon();
    }
  }, [isVisible]);

  const initializeDungeon = () => {
    setGamePhase('prep');
    setDungeonAct(1);
    setCurrentRoom(1);
    setCurrentWave(1);
    setMaxWaves(1);
    setEnemies([]);
    setCombatLog([]);
    setSynergyGauge(0);
    setTeamUpReady(false);
    setCommandMode(false);
    setRoomExits([]);
    setDamageNumbers([]);
    setLootDrops([]);
    setTrapAlert(null);
    setBossStruggle(null);
    setPuzzleRunes([]);
    setPuzzleSequence([]);
    setPlayerSequence([]);
    setIsTransitioning(false);
    setTransitionEffect(null);
    
    // Reset player states
    setPlayers(prev => prev.map(player => ({
      ...player,
      health: player.maxHealth,
      mana: player.maxMana,
      statusEffects: []
    })));
    
    // Reset skill cooldowns
    setSkills(prev => prev.map(skill => ({
      ...skill,
      currentCooldown: 0,
      isCharging: false,
      chargeTime: 0,
      flashRed: false
    })));
  };

  // Room progression and encounter management
  const generateRoomEnemies = useCallback((room: number, act: number) => {
    const baseEnemies: Enemy[] = [];
    
    if (act === 1) {
      // Act I: The Threshold - Simple encounters
      baseEnemies.push({
        id: `entrance_beast_1`,
        name: 'Shadow Beast',
        health: 60,
        maxHealth: 60,
        x: 350,
        y: 180,
        type: 'shadow_beast'
      });
      baseEnemies.push({
        id: `entrance_beast_2`,
        name: 'Shadow Beast',
        health: 60,
        maxHealth: 60,
        x: 450,
        y: 200,
        type: 'shadow_beast'
      });
    } else if (act === 2) {
      // Act II: The Gauntlet - More complex encounters
      baseEnemies.push({
        id: `orc_warrior_1`,
        name: 'Orc Warrior',
        health: 120,
        maxHealth: 120,
        x: 300,
        y: 160,
        type: 'orc_warrior'
      });
      baseEnemies.push({
        id: `orc_warrior_2`,
        name: 'Orc Warrior',
        health: 120,
        maxHealth: 120,
        x: 500,
        y: 220,
        type: 'orc_warrior'
      });
      if (room >= 4) {
        baseEnemies.push({
          id: `shadow_elite`,
          name: 'Shadow Elite',
          health: 200,
          maxHealth: 200,
          x: 400,
          y: 190,
          type: 'shadow_beast'
        });
      }
    } else if (act === 3) {
      // Act III: The Apex - Boss encounter
      baseEnemies.push({
        id: 'dungeon_boss',
        name: 'Shadow Monarch',
        health: 500,
        maxHealth: 500,
        x: 400,
        y: 180,
        type: 'boss'
      });
    }
    
    return baseEnemies;
  }, []);

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
      
      // Chance for treasure room in Act II
      if (dungeonAct === 2 && Math.random() > 0.6) {
        exits.push({
          id: 'treasure_room',
          direction: 'treasure',
          position: { x: 450, y: 120 },
          glowing: true,
          label: 'Hidden Treasure'
        });
      }
    } else if (room === totalRooms - 1) {
      // Boss room entrance
      exits.push({
        id: 'boss_chamber',
        direction: 'boss',
        position: { x: 550, y: 190 },
        glowing: true,
        label: 'Boss Chamber'
      });
    }
    
    return exits;
  }, [dungeonAct]);

  // Dungeon progression logic
  const progressToNextRoom = useCallback((exitId: string) => {
    setIsTransitioning(true);
    setTransitionEffect('shadow_dash');
    
    // Clear current room state
    setEnemies([]);
    setDamageNumbers([]);
    setLootDrops([]);
    setRoomExits([]);
    
    setTimeout(() => {
      setTransitionEffect('warp_tunnel');
    }, 500);
    
    setTimeout(() => {
      const nextRoom = currentRoom + 1;
      setCurrentRoom(nextRoom);
      
      // Determine act based on room
      let nextAct = dungeonAct;
      if (nextRoom <= 2) nextAct = 1;
      else if (nextRoom <= 5) nextAct = 2;
      else nextAct = 3;
      setDungeonAct(nextAct);
      
      // Generate new room content
      if (nextRoom === totalRooms) {
        // Boss antechamber
        setGamePhase('boss_antechamber');
      } else if (nextAct === 2 && Math.random() > 0.7) {
        // Special encounter in Act II
        const encounterType = Math.random();
        if (encounterType > 0.6) {
          setGamePhase('puzzle');
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
      
      setIsTransitioning(false);
      setTransitionEffect(null);
    }, 2000);
  }, [currentRoom, totalRooms, dungeonAct, generateRoomEnemies]);

  // Special encounter generators
  const generatePuzzleEncounter = useCallback(() => {
    const sequence = [1, 3, 2, 4, 1]; // Example sequence
    setPuzzleSequence(sequence);
    setPlayerSequence([]);
    
    const runes = [
      { id: 'rune_1', position: { x: 300, y: 150 }, isCorrect: false, isActivated: false, sequence: 1, glowing: true },
      { id: 'rune_2', position: { x: 400, y: 150 }, isCorrect: false, isActivated: false, sequence: 2, glowing: false },
      { id: 'rune_3', position: { x: 500, y: 150 }, isCorrect: false, isActivated: false, sequence: 3, glowing: false },
      { id: 'rune_4', position: { x: 350, y: 220 }, isCorrect: false, isActivated: false, sequence: 4, glowing: false }
    ];
    setPuzzleRunes(runes);
  }, []);

  const generateTrapEncounter = useCallback(() => {
    const skills = ['mutilate', 'violent_slash', 'dominators_touch'];
    const requiredSkill = skills[Math.floor(Math.random() * skills.length)];
    
    setTrapAlert({
      active: true,
      skillRequired: requiredSkill,
      timeLeft: 2000,
      maxTime: 2000
    });
  }, []);

  // Combat mechanics
  const executeSkill = useCallback((skillId: string, targetPosition?: { x: number; y: number }) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    
    // Check cooldown and mana
    if (skill.currentCooldown > 0) {
      setSkills(prev => prev.map(s => 
        s.id === skillId ? { ...s, flashRed: true } : s
      ));
      setTimeout(() => {
        setSkills(prev => prev.map(s => 
          s.id === skillId ? { ...s, flashRed: false } : s
        ));
      }, 200);
      return;
    }
    
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo || jinwoo.mana < skill.manaCost) {
      setSkills(prev => prev.map(s => 
        s.id === skillId ? { ...s, flashRed: true } : s
      ));
      return;
    }
    
    // Consume mana and start cooldown
    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - skill.manaCost } : p
    ));
    
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s
    ));
    
    // Execute skill effects
    executeSkillEffect(skill, targetPosition);
    
    // Screen shake for powerful abilities
    if (skill.type === 'charge_aoe') {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);
    }
  }, [skills, players]);

  const executeSkillEffect = useCallback((skill: Skill, targetPosition?: { x: number; y: number }) => {
    let damage = 0;
    let affectedEnemies: string[] = [];
    
    switch (skill.type) {
      case 'launcher':
        damage = 25 + Math.floor(Math.random() * 15);
        affectedEnemies = enemies.slice(0, 1).map(e => e.id);
        break;
      case 'dash':
        damage = 35 + Math.floor(Math.random() * 20);
        affectedEnemies = enemies.slice(0, 1).map(e => e.id);
        break;
      case 'charge_aoe':
        damage = 50 + Math.floor(Math.random() * 25);
        affectedEnemies = enemies.map(e => e.id);
        break;
      case 'special':
        damage = 40 + Math.floor(Math.random() * 30);
        affectedEnemies = enemies.slice(0, 2).map(e => e.id);
        break;
    }
    
    // Apply damage to enemies
    setEnemies(prev => prev.map(enemy => {
      if (affectedEnemies.includes(enemy.id)) {
        const newHealth = Math.max(0, enemy.health - damage);
        
        // Add damage number
        setDamageNumbers(prevDamage => [...prevDamage, {
          id: `damage_${Date.now()}_${enemy.id}`,
          damage,
          x: enemy.x,
          y: enemy.y - 20,
          isCritical: Math.random() > 0.8,
          timestamp: Date.now()
        }]);
        
        // Generate loot if enemy dies
        if (newHealth === 0 && enemy.health > 0) {
          const goldAmount = 10 + Math.floor(Math.random() * 20);
          setLootDrops(prevLoot => [...prevLoot, {
            id: `loot_${Date.now()}_${enemy.id}`,
            amount: goldAmount,
            type: 'gold' as const,
            x: enemy.x,
            y: enemy.y,
            targetX: 100, // Player position
            targetY: 200,
            isCollected: false
          }]);
        }
        
        return { ...enemy, health: newHealth };
      }
      return enemy;
    }));
    
    // Increase synergy gauge
    setSynergyGauge(prev => {
      const newGauge = Math.min(100, prev + 15);
      if (newGauge === 100 && !teamUpReady) {
        setTeamUpReady(true);
      }
      return newGauge;
    });
  }, [enemies, teamUpReady]);

  // Room completion detection
  useEffect(() => {
    if (gamePhase === 'combat' && enemies.length > 0) {
      console.log('=== ROOM PROGRESSION CHECK ===');
      console.log(`Room: ${currentRoom}/${totalRooms}, Wave: ${currentWave}, Game Phase: ${gamePhase}`);
      
      const aliveEnemies = enemies.filter(e => e.health > 0);
      console.log(`Enemies: ${aliveEnemies.length} alive / ${enemies.length} total`);
      console.log('All enemies defeated:', aliveEnemies.length === 0);
      console.log('Enemy health states:', enemies.map(e => ({ id: e.id, health: e.health, maxHealth: e.maxHealth })));
      
      if (aliveEnemies.length === 0) {
        console.log('🎯 ALL ENEMIES DEFEATED - Processing room advancement...');
        
        // Check if there are more waves in this room
        if (currentWave < maxWaves) {
          console.log(`🔄 Room ${currentRoom} Wave ${currentWave} complete - Spawning Wave ${currentWave + 1}`);
          setCurrentWave(prev => prev + 1);
          // Generate next wave enemies
          setTimeout(() => {
            setEnemies(generateRoomEnemies(currentRoom, dungeonAct));
          }, 1000);
        } else {
          console.log(`✅ Room ${currentRoom} completely cleared - Advancing to room clear phase`);
          setGamePhase('room_clear');
          
          // Generate exits after a short delay
          setTimeout(() => {
            const exits = generateRoomExits(currentRoom, totalRooms);
            setRoomExits(exits);
          }, 1500);
        }
      }
    }
  }, [enemies, gamePhase, currentRoom, currentWave, maxWaves, totalRooms, dungeonAct, generateRoomEnemies, generateRoomExits]);

  // Core touch interaction handlers
  const handleBattlefieldTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'combat') return;
    
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if tapping an enemy for basic attack
    const tappedEnemy = enemies.find(enemy => {
      const distance = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
      return distance < 30 && enemy.health > 0;
    });
    
    if (tappedEnemy) {
      // Execute basic attack
      const damage = 15 + Math.floor(Math.random() * 10);
      setEnemies(prev => prev.map(enemy => 
        enemy.id === tappedEnemy.id 
          ? { ...enemy, health: Math.max(0, enemy.health - damage) }
          : enemy
      ));
      
      // Add damage number
      setDamageNumbers(prev => [...prev, {
        id: `basic_damage_${Date.now()}`,
        damage,
        x: tappedEnemy.x,
        y: tappedEnemy.y - 20,
        isCritical: false,
        timestamp: Date.now()
      }]);
    }
  }, [gamePhase, enemies]);

  const handleSkillTap = useCallback((skillId: string) => {
    console.log('Mouse down on skill:', skillId, skills.find(s => s.id === skillId)?.type);
    executeSkill(skillId);
  }, [executeSkill, skills]);

  const handleSkillMouseUp = useCallback((skillId: string) => {
    console.log('Mouse up on skill:', skillId, skills.find(s => s.id === skillId)?.type);
  }, [skills]);

  const handleSkillClick = useCallback((skillId: string) => {
    console.log('Click on skill:', skillId, skills.find(s => s.id === skillId)?.type);
  }, [skills]);

  // Cooldown management
  useEffect(() => {
    const interval = setInterval(() => {
      setSkills(prev => prev.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 100)
      })));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Start dungeon encounter
  const startEncounter = () => {
    setGamePhase('combat');
    setEnemies(generateRoomEnemies(currentRoom, dungeonAct));
  };

  // Handle room exit selection
  const handleExitSelect = (exitId: string) => {
    progressToNextRoom(exitId);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 50%, rgba(15, 23, 42, 0.95) 100%)'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`w-full max-w-6xl h-[90vh] bg-slate-800/40 border border-purple-500/30 rounded-2xl p-6 ${screenShake ? 'animate-pulse' : ''}`}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 50%, rgba(30, 41, 59, 0.8) 100%)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="text-purple-400">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Shadow Gate Raid</h2>
                <p className="text-purple-300">Room {currentRoom}/{totalRooms} - Act {dungeonAct}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Game Area */}
          <div className="flex-1 flex flex-col">
            {/* Preparation Phase */}
            {gamePhase === 'prep' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-4">Gate Entrance</h3>
                  <p className="text-slate-300 mb-6">
                    You and Cha Hae-In stand before the shadowy portal. The air thrums with mana.
                  </p>
                  <p className="text-purple-300 text-sm">
                    "This place feels ancient... I sense beasts of the insectoid type. Stay sharp." - Cha Hae-In
                  </p>
                </div>
                <Button
                  onClick={startEncounter}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg"
                >
                  Enter the Gate
                </Button>
              </motion.div>
            )}

            {/* Transition Phase */}
            {isTransitioning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-center"
              >
                {transitionEffect === 'shadow_dash' && (
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4">⚫</div>
                    <p className="text-purple-300">Shadow Dash...</p>
                  </motion.div>
                )}
                {transitionEffect === 'warp_tunnel' && (
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 1.5 }}
                    className="text-center"
                  >
                    <div className="w-32 h-32 border-4 border-purple-500 border-dashed rounded-full animate-spin mb-4"></div>
                    <p className="text-purple-300">Traversing the void...</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Combat Phase */}
            {gamePhase === 'combat' && (
              <div className="flex-1 flex flex-col">
                {/* Battlefield */}
                <div
                  ref={battlefieldRef}
                  onClick={handleBattlefieldTap}
                  className="flex-1 relative bg-slate-700/30 rounded-xl border border-slate-600/50 mb-4 cursor-crosshair"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)',
                    minHeight: '400px'
                  }}
                >
                  {/* Players */}
                  {players.map(player => (
                    <motion.div
                      key={player.id}
                      className="absolute"
                      style={{ left: player.x, top: player.y }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-blue-300"></div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white whitespace-nowrap">
                          {player.name}
                        </div>
                        {/* Health aura */}
                        <div 
                          className="absolute inset-0 rounded-full bg-green-400/30 animate-pulse"
                          style={{
                            width: '32px',
                            height: '32px',
                            transform: `scale(${player.health / player.maxHealth})`
                          }}
                        ></div>
                        {/* Mana ring */}
                        <div 
                          className="absolute inset-0 rounded-full border-2 border-blue-400/50"
                          style={{
                            width: '36px',
                            height: '36px',
                            left: '-2px',
                            top: '-2px',
                            clipPath: `polygon(0 0, ${(player.mana / player.maxMana) * 100}% 0, ${(player.mana / player.maxMana) * 100}% 100%, 0 100%)`
                          }}
                        ></div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Enemies */}
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
                        {/* Health bar */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-600 rounded">
                          <div 
                            className="h-full bg-red-500 rounded transition-all duration-200"
                            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                          ></div>
                        </div>
                        {/* Health aura */}
                        <div 
                          className="absolute inset-0 rounded-full bg-red-400/30"
                          style={{
                            width: '40px',
                            height: '40px',
                            transform: `scale(${enemy.health / enemy.maxHealth})`
                          }}
                        ></div>
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
                        onAnimationComplete={() => {
                          setDamageNumbers(prev => prev.filter(d => d.id !== damage.id));
                        }}
                      >
                        -{damage.damage}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Loot Drops */}
                  <AnimatePresence>
                    {lootDrops.map(loot => (
                      <motion.div
                        key={loot.id}
                        className="absolute text-yellow-400 text-lg"
                        style={{ left: loot.x, top: loot.y }}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ 
                          x: loot.targetX - loot.x,
                          y: loot.targetY - loot.y,
                          scale: 0.5,
                          opacity: 0
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        onAnimationComplete={() => {
                          setLootDrops(prev => prev.filter(l => l.id !== loot.id));
                        }}
                      >
                        ₩{loot.amount}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Action Bar - Touch-based skill system */}
                <div className="flex justify-center gap-4 mb-4">
                  {skills.map((skill, index) => (
                    <motion.button
                      key={skill.id}
                      onMouseDown={() => handleSkillTap(skill.id)}
                      onMouseUp={() => handleSkillMouseUp(skill.id)}
                      onClick={() => handleSkillClick(skill.id)}
                      className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                        skill.currentCooldown > 0
                          ? 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                          : skill.flashRed
                          ? 'border-red-500 bg-red-500/20 animate-pulse'
                          : 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-400 cursor-pointer'
                      }`}
                      whileHover={{ scale: skill.currentCooldown > 0 ? 1 : 1.05 }}
                      whileTap={{ scale: skill.currentCooldown > 0 ? 1 : 0.95 }}
                      style={{
                        background: skill.currentCooldown > 0 
                          ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.5) 0%, rgba(51, 65, 85, 0.5) 100%)'
                          : skill.flashRed
                          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)'
                          : 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(126, 34, 206, 0.3) 100%)'
                      }}
                    >
                      <skill.icon className={`w-6 h-6 ${
                        skill.currentCooldown > 0 ? 'text-slate-500' : 'text-purple-300'
                      }`} />
                      
                      {/* Cooldown overlay */}
                      {skill.currentCooldown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-xs text-white font-bold">
                            {Math.ceil(skill.currentCooldown / 1000)}
                          </div>
                        </div>
                      )}
                      
                      {/* Slot number */}
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-slate-300">
                        {index + 1}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Synergy Gauge */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-sm text-slate-300">Synergy</div>
                  <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                      style={{ width: `${synergyGauge}%` }}
                      animate={{ width: `${synergyGauge}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {teamUpReady && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-semibold"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Team-Up Attack!
                    </motion.button>
                  )}
                </div>
              </div>
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
                      transition={{ delay: exit.direction === 'treasure' ? 0.2 : 0 }}
                    >
                      {exit.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}