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
  const [gamePhase, setGamePhase] = useState<'prep' | 'combat' | 'victory' | 'defeat' | 'room_clear'>('prep');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [currentWave, setCurrentWave] = useState(1);
  const [roomExits, setRoomExits] = useState<Array<{
    id: string;
    direction: 'forward' | 'treasure' | 'boss';
    position: { x: number; y: number };
    glowing: boolean;
  }>>([]);
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

  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'shadow1',
      name: 'Shadow Beast',
      health: 60,
      maxHealth: 60,
      x: 400,
      y: 190,
      type: 'shadow_beast'
    },
    {
      id: 'shadow2',
      name: 'Shadow Beast',
      health: 60,
      maxHealth: 60,
      x: 450,
      y: 220,
      type: 'shadow_beast'
    }
  ]);

  const battlefieldRef = useRef<HTMLDivElement>(null);
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Core touch interaction handlers
  const handleBattlefieldTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'combat') return;
    
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (commandMode) {
      commandShadowSoldiers(x, y);
      setCommandMode(false);
    } else {
      movePlayer(x, y);
    }
  }, [gamePhase, commandMode]);

  const handleEnemyTap = useCallback((enemyId: string) => {
    if (gamePhase !== 'combat') return;
    
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy) {
      executeBasicAttack(enemy);
    }
  }, [gamePhase, enemies]);

  const handleSkillTap = useCallback((skillId: string) => {
    console.log('🎯 SKILL BUTTON CLICKED:', skillId);
    console.log('Game phase:', gamePhase);
    console.log('Available skills:', skills.map(s => ({ id: s.id, cooldown: s.currentCooldown })));
    
    if (gamePhase !== 'combat') {
      console.log('❌ Not in combat phase');
      return;
    }
    
    // Handle trap evasion first
    if (trapAlert?.active) {
      console.log('🪤 Trap active, handling evasion');
      handleTrapEvasion(skillId);
      return;
    }
    
    const skill = skills.find(s => s.id === skillId);
    if (!skill) {
      console.log('❌ Skill not found:', skillId);
      return;
    }
    
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) {
      console.log('❌ Jin-Woo not found');
      return;
    }
    
    console.log('Skill details:', { id: skill.id, cooldown: skill.currentCooldown, manaCost: skill.manaCost });
    console.log('Jin-Woo mana:', jinwoo.mana);
    
    if (skill.currentCooldown > 0) {
      console.log('❌ Skill on cooldown:', skill.currentCooldown);
      triggerCameraShake();
      return;
    }
    
    if (jinwoo.mana < skill.manaCost) {
      console.log('❌ Not enough mana');
      setSkills(prev => prev.map(s => 
        s.id === skillId ? { ...s, flashRed: true } : s
      ));
      setTimeout(() => {
        setSkills(prev => prev.map(s => ({ ...s, flashRed: false })));
      }, 200);
      return;
    }
    
    console.log('✅ Executing skill:', skillId);
    executeSkill(skill);
  }, [gamePhase, skills, players, trapAlert]);

  const handleSkillHold = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.type !== 'charge_aoe') return;
    
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, isCharging: true, chargeTime: 0 } : s
    ));
    
    const startTime = Date.now();
    chargeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const maxCharge = 3000;
      
      setSkills(prev => prev.map(s => 
        s.id === skillId ? { ...s, chargeTime: Math.min(elapsed, maxCharge) } : s
      ));
    }, 50);
  }, [skills]);

  const handleSkillRelease = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.type !== 'charge_aoe') return;
    
    if (chargeTimerRef.current) {
      clearInterval(chargeTimerRef.current);
      chargeTimerRef.current = null;
    }
    
    const chargedSkill = skills.find(s => s.id === skillId);
    if (chargedSkill?.isCharging) {
      executeChargedSkill(chargedSkill);
    }
    
    setSkills(prev => prev.map(s => 
      s.id === skillId ? { ...s, isCharging: false, chargeTime: 0 } : s
    ));
  }, [skills]);

  // Combat mechanics
  const movePlayer = (x: number, y: number) => {
    setPlayers(prev => prev.map(player => 
      player.id === 'jinwoo' ? { ...player, x, y } : player
    ));
    addToCombatLog(`Jin-Woo moves to position`);
  };

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
    if (enemy.type === 'boss' && enemy.health <= enemy.maxHealth * 0.3 && Math.random() < 0.4) {
      triggerBossStruggle();
    }
  };

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
      
      // Magnetic attraction animation
      setTimeout(() => {
        setLootDrops(prev => prev.map(loot => 
          loot.id === id ? { ...loot, isCollected: true } : loot
        ));
        
        // Play collection chime sound effect
        playChimeSound();
        
        // Remove after animation
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
    
    // Auto-fail if not responded to in time
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

  const handleTrapEvasion = (skillId: string) => {
    if (trapAlert?.active && trapAlert.skillRequired === skillId) {
      setTrapAlert(null);
      addToCombatLog("Successfully evaded trap with quick reflexes!");
      setSynergyGauge(prev => Math.min(100, prev + 5));
    }
  };

  const triggerBossStruggle = () => {
    setBossStruggle({
      active: true,
      progress: 0,
      timeLeft: 5000
    });
    
    addToCombatLog("Boss struggle! Rapidly tap to break free!");
    
    // Start boss struggle timer with progress decay
    const timer = setInterval(() => {
      setBossStruggle(prev => {
        if (!prev) return null;
        
        const newTimeLeft = prev.timeLeft - 100;
        // Progress decays over time to increase urgency
        const decayedProgress = Math.max(0, prev.progress - 1);
        
        if (newTimeLeft <= 0) {
          // Failed to break free
          addToCombatLog("Failed to break free! Taking massive damage!");
          setPlayers(p => p.map(player => 
            player.id === 'jinwoo' ? { ...player, health: Math.max(0, player.health - 50) } : player
          ));
          triggerCameraShake();
          clearInterval(timer);
          return null;
        }
        
        if (prev.progress >= 100) {
          // Successfully broke free
          addToCombatLog("Successfully broke free from boss grip!");
          setSynergyGauge(prev => Math.min(100, prev + 15));
          clearInterval(timer);
          return null;
        }
        
        return { ...prev, timeLeft: newTimeLeft, progress: decayedProgress };
      });
    }, 100);
  };

  const handleStruggleTap = () => {
    if (bossStruggle?.active) {
      setBossStruggle(prev => prev ? {
        ...prev,
        progress: Math.min(100, prev.progress + 8)
      } : null);
    }
  };

  const playChimeSound = () => {
    // Create audio context for chime sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  // Initialize puzzle runes for dungeon puzzles
  const initializePuzzleRunes = () => {
    const runePositions = [
      { x: 100, y: 150 },
      { x: 200, y: 120 },
      { x: 300, y: 180 },
      { x: 150, y: 250 },
      { x: 250, y: 220 }
    ];
    
    const correctSequence = [0, 2, 1, 4, 3]; // Randomized correct order
    
    setPuzzleRunes(runePositions.map((pos, index) => ({
      id: `rune_${index}`,
      position: pos,
      isCorrect: correctSequence.indexOf(index) !== -1,
      isActivated: false
    })));
  };

  const handleRuneTouch = (runeId: string) => {
    setPuzzleRunes(prev => prev.map(rune => 
      rune.id === runeId ? { ...rune, isActivated: !rune.isActivated } : rune
    ));
    
    // Check if puzzle is solved
    const activatedRunes = puzzleRunes.filter(r => r.isActivated);
    const correctRunes = puzzleRunes.filter(r => r.isCorrect);
    
    if (activatedRunes.length === correctRunes.length && 
        activatedRunes.every(r => r.isCorrect)) {
      addToCombatLog("Puzzle solved! Ancient magic flows through you!");
      setSynergyGauge(prev => Math.min(100, prev + 25));
      setPuzzleRunes([]);
    }
  };

  const executeSkill = (skill: Skill) => {
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) return;
    
    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - skill.manaCost } : p
    ));
    
    setSkills(prev => prev.map(s => 
      s.id === skill.id ? { ...s, currentCooldown: skill.cooldown } : s
    ));
    
    switch (skill.type) {
      case 'launcher':
        executeLauncherSkill(skill);
        break;
      case 'dash':
        executeDashSkill(skill);
        break;
      case 'special':
        executeSpecialSkill(skill);
        break;
    }
    
    setSynergyGauge(prev => Math.min(100, prev + 15));
  };

  const executeLauncherSkill = (skill: Skill) => {
    const targetEnemy = enemies.find(e => e.health > 0);
    if (!targetEnemy) return;
    
    const damage = Math.floor(Math.random() * 50) + 40;
    
    setEnemies(prev => prev.map(e => 
      e.id === targetEnemy.id ? { 
        ...e, 
        health: Math.max(0, e.health - damage),
        isStunned: true 
      } : e
    ));
    
    showDamageNumber(damage, targetEnemy.x, targetEnemy.y, false);
    addToCombatLog(`Jin-Woo uses ${skill.name}! ${targetEnemy.name} is launched!`);
    
    setTimeout(() => {
      setEnemies(prev => prev.map(e => 
        e.id === targetEnemy.id ? { ...e, isStunned: false } : e
      ));
    }, 2000);
  };

  const executeDashSkill = (skill: Skill) => {
    const targetEnemy = enemies.find(e => e.health > 0);
    if (!targetEnemy) return;
    
    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, x: targetEnemy.x - 30, y: targetEnemy.y } : p
    ));
    
    const damage = Math.floor(Math.random() * 40) + 35;
    
    setEnemies(prev => prev.map(e => 
      e.id === targetEnemy.id ? { ...e, health: Math.max(0, e.health - damage) } : e
    ));
    
    showDamageNumber(damage, targetEnemy.x, targetEnemy.y, false);
    addToCombatLog(`Jin-Woo dashes with ${skill.name}!`);
    triggerCameraShake();
  };

  const executeChargedSkill = (skill: Skill) => {
    const chargePercent = (skill.chargeTime || 0) / 3000;
    const baseDamage = 60;
    const chargeDamage = Math.floor(baseDamage * (1 + chargePercent));
    
    setEnemies(prev => prev.map(e => ({
      ...e,
      health: Math.max(0, e.health - chargeDamage)
    })));
    
    enemies.forEach(enemy => {
      showDamageNumber(chargeDamage, enemy.x, enemy.y, chargePercent > 0.8);
    });
    
    addToCombatLog(`Jin-Woo unleashes ${skill.name} for ${chargeDamage} AoE damage!`);
    triggerCameraShake();
    setSynergyGauge(prev => Math.min(100, prev + Math.floor(30 * chargePercent)));
  };

  const executeSpecialSkill = (skill: Skill) => {
    const targetEnemy = enemies.find(e => e.health > 0);
    if (!targetEnemy) return;
    
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo) return;
    
    const oldX = jinwoo.x;
    const oldY = jinwoo.y;
    
    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, x: targetEnemy.x, y: targetEnemy.y } : p
    ));
    
    setEnemies(prev => prev.map(e => 
      e.id === targetEnemy.id ? { ...e, x: oldX, y: oldY } : e
    ));
    
    addToCombatLog(`Jin-Woo uses ${skill.name}! Positions swapped!`);
  };

  const commandShadowSoldiers = (x: number, y: number) => {
    addToCombatLog(`Shadow soldiers commanded to focus attack`);
  };

  const showDamageNumber = (damage: number, x: number, y: number, isCritical: boolean) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    setDamageNumbers(prev => [...prev, {
      id,
      damage,
      x: x + Math.random() * 20 - 10,
      y: y - 20 + Math.random() * 10,
      isCritical
    }]);
    
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  const triggerCameraShake = () => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 200);
  };

  const executeTeamUpAttack = () => {
    if (!teamUpReady) return;
    
    const totalDamage = 200;
    
    setEnemies(prev => prev.map(e => ({
      ...e,
      health: Math.max(0, e.health - totalDamage)
    })));
    
    enemies.forEach(enemy => {
      showDamageNumber(totalDamage, enemy.x, enemy.y, true);
    });
    
    addToCombatLog("Jin-Woo and Cha Hae-In execute devastating Team-Up Attack!");
    setSynergyGauge(0);
    setTeamUpReady(false);
    triggerCameraShake();
    
    // Check for victory
    if (enemies.every(e => e.health <= 0)) {
      setTimeout(() => setGamePhase('victory'), 1000);
    }
  };

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), message]);
  };

  // Synergy and cooldown systems with resonant chime
  useEffect(() => {
    if (synergyGauge >= 100 && !teamUpReady) {
      setTeamUpReady(true);
      setSynergyChimeReady(true);
      addToCombatLog("Team-Up Attack Ready! Perfect synergy achieved!");
      
      // Play resonant chime audio cue
      playResonantChime();
    }
  }, [synergyGauge]);

  const playResonantChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create harmonic resonant chime
      oscillator1.frequency.setValueAtTime(440, audioContext.currentTime); // A4
      oscillator2.frequency.setValueAtTime(660, audioContext.currentTime); // E5
      
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 1.5);
      oscillator2.stop(audioContext.currentTime + 1.5);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  // Cooldown timer with visual pie wipe animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSkills(prev => prev.map(skill => ({
        ...skill,
        currentCooldown: Math.max(0, skill.currentCooldown - 100)
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Cha Hae-In AI behavior - proactive targeting
  useEffect(() => {
    if (gamePhase === 'combat') {
      const interval = setInterval(() => {
        const chahaein = players.find(p => p.id === 'chahaein');
        const jinwoo = players.find(p => p.id === 'jinwoo');
        const aliveEnemies = enemies.filter(e => e.health > 0);
        
        if (chahaein && jinwoo && aliveEnemies.length > 0) {
          // Cha Hae-In automatically attacks same target as player or helps when player is in danger
          const damage = Math.floor(Math.random() * 25) + 15;
          const targetEnemy = aliveEnemies[0];
          
          setEnemies(prev => prev.map(e => 
            e.id === targetEnemy.id ? { ...e, health: Math.max(0, e.health - damage) } : e
          ));
          
          showDamageNumber(damage, targetEnemy.x + 20, targetEnemy.y, false);
          addToCombatLog(`Cha Hae-In strikes ${targetEnemy.name} for ${damage} damage!`);
          setSynergyGauge(prev => Math.min(100, prev + 8));
          
          // Check for victory
          if (enemies.every(e => e.health <= 0)) {
            setTimeout(() => setGamePhase('victory'), 1000);
          }
        }
      }, 3000); // Cha Hae-In attacks every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [gamePhase, players, enemies]);

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



  // Generate enemies for the current room
  const generateRoomEnemies = () => {
    let newEnemies: Enemy[] = [];
    
    switch (currentRoom) {
      case 1:
        // Entrance - simple intro combat
        newEnemies = [
          {
            id: 'entrance_beast_1',
            name: 'Shadow Beast',
            health: 60,
            maxHealth: 60,
            x: 520,
            y: 320,
            type: 'shadow_beast' as const
          },
          {
            id: 'entrance_beast_2',
            name: 'Shadow Beast',
            health: 60,
            maxHealth: 60,
            x: 580,
            y: 300,
            type: 'shadow_beast' as const
          }
        ];
        addToCombatLog("Act I: Entrance - Clear the path forward!");
        break;
        
      case 2:
        // Trap Corridor
        newEnemies = [
          {
            id: 'corridor_orc_1',
            name: 'Orc Warrior',
            health: 90,
            maxHealth: 90,
            x: 480,
            y: 280,
            type: 'orc_warrior' as const
          },
          {
            id: 'corridor_beast_1',
            name: 'Shadow Beast',
            health: 70,
            maxHealth: 70,
            x: 600,
            y: 320,
            type: 'shadow_beast' as const
          }
        ];
        addToCombatLog("Act I: Trap Corridor - Watch for environmental hazards!");
        break;
        
      case 3:
        // Arena Chamber - multi-wave combat
        newEnemies = [
          {
            id: 'arena_beast_1',
            name: 'Arena Shadow Beast',
            health: 80,
            maxHealth: 80,
            x: 500,
            y: 300,
            type: 'shadow_beast' as const
          },
          {
            id: 'arena_beast_2',
            name: 'Arena Shadow Beast',
            health: 80,
            maxHealth: 80,
            x: 550,
            y: 250,
            type: 'shadow_beast' as const
          }
        ];
        addToCombatLog("Act II: Arena Chamber - Defeat all enemies in waves!");
        break;
        
      case 4:
        // Puzzle Chamber
        newEnemies = [
          {
            id: 'puzzle_guardian_1',
            name: 'Stone Guardian',
            health: 120,
            maxHealth: 120,
            x: 520,
            y: 280,
            type: 'orc_warrior' as const
          }
        ];
        addToCombatLog("Act II: Puzzle Chamber - Solve ancient mysteries!");
        break;
        
      case 5:
        // Stealth Section
        newEnemies = [
          {
            id: 'elite_guard',
            name: 'Elite Shadow Guard',
            health: 150,
            maxHealth: 150,
            x: 400,
            y: 280,
            type: 'boss' as const
          }
        ];
        addToCombatLog("Act II: Stealth Section - Avoid detection or fight!");
        break;
        
      case 6:
        // Antechamber - healing room
        newEnemies = [];
        addToCombatLog("Act III: Antechamber - Prepare for the final battle!");
        setTimeout(() => {
          setGamePhase('room_clear');
          generateRoomExits();
        }, 2000);
        break;
        
      case 7:
        // Boss Arena
        newEnemies = [
          {
            id: 'shadow_sovereign',
            name: 'Shadow Sovereign',
            health: 350,
            maxHealth: 350,
            x: 520,
            y: 280,
            type: 'boss' as const
          }
        ];
        addToCombatLog("Act III: Boss Arena - Face the Shadow Sovereign!");
        break;
        
      default:
        newEnemies = [];
    }
    
    setEnemies(newEnemies);
    setCurrentWave(1);
  };

  // Game initialization
  useEffect(() => {
    if (isVisible) {
      // Reset all systems when opening
      setGamePhase('prep');
      setCurrentRoom(1);
      setCurrentWave(1);
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
      
      addToCombatLog("Preparing for dungeon raid...");
    }
  }, [isVisible]);

  // Check for enemy defeat and room progression
  useEffect(() => {
    if (gamePhase === 'combat' && enemies.length > 0) {
      const allEnemiesDefeated = enemies.every(enemy => enemy.health <= 0);
      const livingEnemies = enemies.filter(enemy => enemy.health > 0);
      
      // Enhanced debug logging
      console.log(`=== ROOM PROGRESSION CHECK ===`);
      console.log(`Room: ${currentRoom}/7, Wave: ${currentWave}, Game Phase: ${gamePhase}`);
      console.log(`Enemies: ${livingEnemies.length} alive / ${enemies.length} total`);
      console.log(`All enemies defeated: ${allEnemiesDefeated}`);
      console.log('Enemy health states:', enemies.map(e => ({ id: e.id, health: e.health, maxHealth: e.maxHealth })));
      
      if (allEnemiesDefeated) {
        console.log(`🎯 ALL ENEMIES DEFEATED - Processing room advancement...`);
        
        if (currentRoom === 2 && currentWave === 1) {
          console.log('🔄 Room 2 Wave 1 complete - Spawning Wave 2');
          setCurrentWave(2);
          setTimeout(() => {
            const waveEnemies = [
              {
                id: 'wave2_orc_1',
                name: 'Berserker Orc',
                health: 110,
                maxHealth: 110,
                x: 450,
                y: 310,
                type: 'orc_warrior' as const
              },
              {
                id: 'wave2_beast_1',
                name: 'Alpha Shadow Beast',
                health: 80,
                maxHealth: 80,
                x: 620,
                y: 290,
                type: 'shadow_beast' as const
              }
            ];
            setEnemies(waveEnemies);
            addToCombatLog("Cha Hae-In: 'More enemies incoming! Second wave!'");
            console.log('✅ Wave 2 enemies spawned');
          }, 1000);
        } else {
          console.log(`✅ Room ${currentRoom} completely cleared - Advancing to room clear phase`);
          setGamePhase('room_clear');
          generateRoomExits();
          addToCombatLog("Room cleared! Exit portals are materializing...");
        }
      }
    }
  }, [enemies, gamePhase, currentRoom, currentWave]);

  // Generate room exits
  const generateRoomExits = () => {
    const exits = [{
      id: 'forward',
      direction: 'forward' as const,
      position: { x: 700, y: 200 },
      glowing: true
    }];
    setRoomExits(exits);
  };

  // Handle exit choice to progress to next room
  const handleExitChoice = (exitId: string) => {
    const exit = roomExits.find(e => e.id === exitId);
    if (!exit) return;
    
    if (exit.direction === 'forward') {
      setCurrentRoom(prev => prev + 1);
      setCurrentWave(1);
      setGamePhase('combat');
      setRoomExits([]);
      
      if (currentRoom >= 7) {
        // Dungeon complete
        setGamePhase('victory');
        onRaidComplete(true, [
          { id: 'shadow_essence', name: 'Shadow Essence', description: 'Pure shadow energy', icon: '⚫', type: 'material', quantity: 3, value: 1000000, rarity: 'legendary' }
        ]);
      } else {
        // Generate new enemies for next room
        setTimeout(() => generateRoomEnemies(), 500);
        addToCombatLog(`Advancing to Room ${currentRoom + 1}...`);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-gray-900 via-red-950 to-black overflow-hidden"
    >
      {/* Dungeon Atmosphere */}
      <div className="absolute inset-0 bg-[url('/dungeon-bg.jpg')] bg-cover bg-center opacity-30" />
      
      {/* Minimized Corner UI */}
      <div className="absolute top-2 left-2 z-30">
        <div className="backdrop-blur-md bg-black/70 rounded-lg px-2 py-1 border border-purple-500/40 text-xs">
          <div className="text-white font-bold">Shadow Dungeon</div>
          <div className="flex gap-2">
            <span className="text-red-400">B-Rank</span>
            <span className="text-purple-400">Floor 15</span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 z-30">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-red-600/30 bg-black/70 backdrop-blur-md h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Preparation Phase */}
      {gamePhase === 'prep' && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute inset-4 flex items-center justify-center"
        >
          <div className="backdrop-blur-md bg-black/60 rounded-xl p-8 border border-purple-500/30 max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Raid Preparation</h3>
            <div className="text-purple-200 mb-6">
              <p className="mb-2">A shadow dungeon has appeared in Seoul. Hunter Cha Hae-In has requested to join you.</p>
              <p className="italic">"Jin-Woo, let's clear this together. I want to see your true power."</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="backdrop-blur-sm bg-blue-900/30 rounded p-3">
                <h4 className="font-bold text-blue-300">Sung Jin-Woo</h4>
                <p className="text-sm">Level {playerLevel} Shadow Monarch</p>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 bg-green-700 h-2 rounded"></div>
                  <span className="text-xs">100 HP</span>
                </div>
              </div>
              
              <div className="backdrop-blur-sm bg-pink-900/30 rounded p-3">
                <h4 className="font-bold text-pink-300">Cha Hae-In</h4>
                <p className="text-sm">S-Rank Knight</p>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 bg-green-700 h-2 rounded"></div>
                  <span className="text-xs">100 HP</span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => {
                setGamePhase('combat');
                generateRoomEnemies();
                addToCombatLog("Entering the shadow dungeon...");
                addToCombatLog("Cha Hae-In: 'Stay close, Jin-Woo. I can sense strong enemies ahead.'");
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white py-3 text-lg font-bold"
            >
              Begin Raid
            </Button>
          </div>
        </motion.div>
      )}

      {/* Combat Phase */}
      {gamePhase === 'combat' && (
        <>
          {/* 2.5D Side-Scrolling Combat Arena */}
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
            {/* Gothic Cathedral/Cavern Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-gray-900/80 to-red-900/90" />
            
            {/* Stone Pattern Overlay */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-repeat" style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 40px,
                  rgba(100, 100, 100, 0.1) 40px,
                  rgba(100, 100, 100, 0.1) 42px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 30px,
                  rgba(100, 100, 100, 0.1) 30px,
                  rgba(100, 100, 100, 0.1) 32px
                )`
              }} />
            </div>
            
            {/* Atmospheric Pillars */}
            <div className="absolute left-8 top-4 bottom-8 w-12 bg-gradient-to-b from-gray-700/60 to-gray-900/40 rounded opacity-60" />
            <div className="absolute right-8 top-4 bottom-8 w-12 bg-gradient-to-b from-gray-700/60 to-gray-900/40 rounded opacity-60" />
            
            {/* Ground Line */}
            <div className="absolute bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            
            {/* Character Models with Health Auras */}
            {/* Players with Health/Mana Auras */}
            {players.map(player => (
              <motion.div
                key={player.id}
                className="absolute"
                style={{ left: player.x - 25, top: player.y - 25 }}
                animate={{ 
                  scale: player.isActive ? 1.1 : 1
                }}
              >
                {/* Health Aura - Purple circle that shrinks with damage */}
                <motion.div
                  className="absolute inset-0 w-12 h-12 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${
                      player.id === 'jinwoo' ? 'rgba(147, 51, 234, 0.6)' : 'rgba(236, 72, 153, 0.6)'
                    } 0%, transparent 70%)`,
                    filter: player.health < 25 ? 'brightness(0.5)' : 'brightness(1)'
                  }}
                  animate={{
                    scale: player.health / player.maxHealth,
                    opacity: player.health < 25 ? [0.3, 1, 0.3] : 1
                  }}
                  transition={{
                    opacity: { duration: 0.5, repeat: player.health < 25 ? Infinity : 0 }
                  }}
                />
                
                {/* Mana Ring - Blue ring around health aura */}
                {player.id === 'jinwoo' && (
                  <svg className="absolute inset-0 w-12 h-12" viewBox="0 0 50 50">
                    <circle
                      cx="25"
                      cy="25"
                      r="22"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                      strokeDasharray={`${(player.mana / player.maxMana) * 138} 138`}
                      strokeDashoffset="0"
                      transform="rotate(-90 25 25)"
                    />
                  </svg>
                )}
                
                {/* Player Character */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center ${
                  player.id === 'jinwoo' ? 'bg-purple-600' : 'bg-pink-600'
                } border-2 border-white z-10`}>
                  {player.id === 'jinwoo' ? <Crown className="w-6 h-6 text-white" /> : <Sword className="w-6 h-6 text-white" />}
                </div>
              </motion.div>
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                className="absolute cursor-pointer"
                style={{ left: enemy.x - 20, top: enemy.y - 20 }}
                onClick={() => handleEnemyTap(enemy.id)}
                whileHover={{ scale: 1.1 }}
                animate={enemy.isStunned ? { 
                  rotate: [0, -5, 5, -5, 5, 0],
                  y: [0, -5, 0]
                } : {}}
              >
                {/* Enemy Health Aura */}
                <motion.div
                  className="absolute inset-0 w-10 h-10 rounded-full bg-red-500/40"
                  animate={{
                    scale: enemy.health / enemy.maxHealth,
                    opacity: enemy.health > 0 ? 1 : 0
                  }}
                />
                
                {/* Enemy Character */}
                <div className="relative w-10 h-10 rounded-full bg-red-600 border-2 border-red-800 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {enemy.type === 'boss' ? '👹' : '👺'}
                  </span>
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

            {/* Damage Numbers */}
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
                    {/* Magnetic glow effect */}
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

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
                    <div className="text-white text-sm">
                      Progress: {Math.floor(bossStruggle.progress)}%
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Puzzle Runes System */}
            <AnimatePresence>
              {puzzleRunes.map(rune => (
                <motion.div
                  key={rune.id}
                  className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                    rune.isActivated ? 'bg-blue-500 border-blue-300 shadow-lg shadow-blue-500/50' : 'bg-gray-700 border-gray-500'
                  }`}
                  style={{ left: rune.position.x, top: rune.position.y }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: 1, 
                    rotate: rune.isActivated ? 360 : 0,
                    boxShadow: rune.isActivated ? "0px 0px 20px rgba(59, 130, 246, 0.8)" : "none"
                  }}
                  exit={{ scale: 0 }}
                  whileTap={{ scale: 0.8 }}
                  onTap={() => handleRuneTouch(rune.id)}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-white text-xs">⚡</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* System 11 Touch-Based Action Bar - 4 Slots */}
          <div className="absolute bottom-4 left-4 right-4">
            {/* Synergy Gauge - Golden circular gauge */}
            <div className="mb-4 flex justify-center">
              <div className="relative w-20 h-20">
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-gray-600"
                  style={{
                    background: `conic-gradient(from 0deg, #fbbf24 ${synergyGauge * 3.6}deg, transparent ${synergyGauge * 3.6}deg)`
                  }}
                />
                <div className="absolute inset-2 rounded-full bg-black/80 flex items-center justify-center">
                  <span className="text-yellow-400 text-xs font-bold">{Math.floor(synergyGauge)}%</span>
                </div>
                
                {/* Team-Up Attack Button - Large glowing orb when ready */}
                {teamUpReady && (
                  <motion.button
                    onClick={executeTeamUpAttack}
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-yellow-400"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.8)',
                        '0 0 40px rgba(251, 191, 36, 1)',
                        '0 0 20px rgba(251, 191, 36, 0.8)'
                      ]
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Debug Test Button */}
            <div className="flex justify-center mb-2">
              <button 
                onClick={() => console.log('🔧 TEST BUTTON CLICKED - Component is working!')}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Test Click
              </button>
            </div>

            {/* 4-Slot Action Bar - Liquid Glassmorphism */}
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
                    style={{
                      backdropFilter: 'blur(20px) saturate(180%)',
                      background: isOnCooldown ? 'rgba(75, 85, 99, 0.3)' :
                                 notEnoughMana ? 'rgba(153, 27, 27, 0.3)' :
                                 trapAlert?.active && trapAlert.skillRequired === skill.id ? 'rgba(234, 179, 8, 0.5)' :
                                 skill.isCharging ? 'rgba(147, 51, 234, 0.6)' :
                                 'rgba(147, 51, 234, 0.3)'
                    }}
                    onMouseDown={() => {
                      console.log('Mouse down on skill:', skill.id, skill.type);
                      if (skill.type === 'charge_aoe') handleSkillHold(skill.id);
                    }}
                    onMouseUp={() => {
                      console.log('Mouse up on skill:', skill.id, skill.type);
                      if (skill.type === 'charge_aoe') handleSkillRelease(skill.id);
                    }}
                    onTouchStart={() => {
                      console.log('Touch start on skill:', skill.id, skill.type);
                      if (skill.type === 'charge_aoe') handleSkillHold(skill.id);
                    }}
                    onTouchEnd={() => {
                      console.log('Touch end on skill:', skill.id, skill.type);
                      if (skill.type === 'charge_aoe') handleSkillRelease(skill.id);
                    }}
                    onClick={() => {
                      console.log('Click on skill:', skill.id, skill.type);
                      if (skill.type !== 'charge_aoe') {
                        handleSkillTap(skill.id);
                      }
                    }}
                    whileTap={{ scale: 0.9 }}
                    animate={skill.flashRed ? { backgroundColor: '#dc2626' } : {}}
                  >
                    {/* Skill Icon */}
                    <IconComponent 
                      className={`w-8 h-8 ${
                        isOnCooldown ? 'text-gray-500' : 
                        notEnoughMana ? 'text-red-400' :
                        'text-white'
                      }`} 
                    />
                    
                    {/* Cooldown Overlay with Pie Wipe Animation */}
                    {isOnCooldown && (
                      <>
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {Math.ceil(skill.currentCooldown / 1000)}
                          </span>
                        </div>
                        {/* Radial cooldown progress */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
                          <circle
                            cx="32"
                            cy="32"
                            r="30"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.3)"
                            strokeWidth="2"
                            strokeDasharray={`${(1 - skill.currentCooldown / skill.cooldown) * 188} 188`}
                            strokeDashoffset="0"
                            transform="rotate(-90 32 32)"
                            className="transition-all duration-100"
                          />
                        </svg>
                      </>
                    )}
                    
                    {/* Charge Progress */}
                    {skill.isCharging && skill.chargeTime !== undefined && (
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-yellow-400/60 transition-all duration-75"
                          style={{ height: `${(skill.chargeTime / 3000) * 100}%` }}
                        />
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

            {/* Shadow Soldier Radial Menu */}
            <div className="flex justify-center">
              <motion.button
                onClick={() => setCommandMode(!commandMode)}
                className="w-12 h-12 rounded-full bg-gray-700 border-2 border-purple-400 flex items-center justify-center"
                style={{ backdropFilter: 'blur(20px)' }}
                animate={commandMode ? { scale: 1.1, backgroundColor: '#7c3aed' } : {}}
                whileTap={{ scale: 0.9 }}
              >
                <Crown className="w-6 h-6 text-purple-300" />
              </motion.button>
              
              {/* Command Mode Indicator */}
              {commandMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded text-sm"
                >
                  Tap battlefield to command shadows
                </motion.div>
              )}
            </div>
          </div>

          {/* Combat Log */}
          <div className="absolute top-4 left-4 w-80 max-h-32 overflow-y-auto">
            <div className="backdrop-blur-md bg-black/40 rounded-lg p-3 border border-purple-500/30">
              {combatLog.slice(-5).map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-purple-200 mb-1"
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Room Clear State - Glowing Exit Portals */}
      {gamePhase === 'room_clear' && (
        <>
          <motion.div 
            ref={battlefieldRef}
            className="absolute inset-x-4 top-4 bottom-32 overflow-hidden rounded-lg border border-purple-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-gray-900/80 to-red-900/90" />
            
            {/* Room Progress Display */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 backdrop-blur-md bg-black/70 rounded-lg px-4 py-2 border border-purple-500/40">
              <div className="text-center">
                <div className="text-white font-bold">Room {currentRoom}/7 - Cleared!</div>
                <div className="text-purple-300 text-sm">Choose your path forward</div>
              </div>
            </div>
            
            {/* Exit Portals */}
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
                      <div className="text-2xl">
                        {exit.direction === 'forward' && '→'}
                        {exit.direction === 'treasure' && '💎'}
                        {exit.direction === 'boss' && '👑'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Energy Particles */}
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-400 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [0, Math.cos(i * 60 * Math.PI / 180) * 30],
                          y: [0, Math.sin(i * 60 * Math.PI / 180) * 30],
                          opacity: [1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                
                {/* Portal Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="bg-black/70 text-purple-300 px-2 py-1 rounded text-xs">
                    {exit.direction === 'forward' && 'Next Room'}
                    {exit.direction === 'treasure' && 'Treasure'}
                    {exit.direction === 'boss' && 'Boss Arena'}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Room Clear Message */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-md bg-black/70 rounded-lg px-6 py-3 border border-purple-500/40"
            >
              <div className="text-purple-300 text-sm">
                "Well done, Jin-Woo! Ready for the next challenge?" - Cha Hae-In
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Victory/Defeat Phases */}
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
            
            <Button
              onClick={() => {
                if (gamePhase === 'victory') {
                  onRaidComplete(true, [
                    { name: 'Shadow Beast Core', quantity: 3, value: 5000000 },
                    { name: 'Dark Crystal', quantity: 1, value: 10000000 }
                  ]);
                } else {
                  onRaidComplete(false, []);
                }
                onClose();
              }}
              className={gamePhase === 'victory' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {gamePhase === 'victory' ? 'Collect Rewards' : 'Try Again'}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}