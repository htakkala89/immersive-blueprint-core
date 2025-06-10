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
  const [gamePhase, setGamePhase] = useState<'prep' | 'combat' | 'victory' | 'defeat'>('prep');
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
      return distance < 40 && enemy.health > 0;
    });
    
    if (clickedEnemy) {
      executeBasicAttack(clickedEnemy);
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
    if (enemy.type === 'boss' && enemy.health <= enemy.maxHealth * 0.3 && Math.random() < 0.4) {
      triggerBossStruggle();
    }
    
    // Check for victory
    if (enemies.every(e => e.health <= 0)) {
      setTimeout(() => setGamePhase('victory'), 1000);
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
      setBossStruggle(prev => prev ? {
        ...prev,
        progress: Math.min(100, prev.progress + 8)
      } : null);
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

  // Auto-combat for Cha Hae-In
  useEffect(() => {
    if (gamePhase === 'combat') {
      const interval = setInterval(() => {
        const chahaein = players.find(p => p.id === 'chahaein');
        const jinwoo = players.find(p => p.id === 'jinwoo');
        const aliveEnemies = enemies.filter(e => e.health > 0);
        
        if (chahaein && jinwoo && aliveEnemies.length > 0) {
          const damage = Math.floor(Math.random() * 25) + 15;
          const targetEnemy = aliveEnemies[0];
          
          setEnemies(prev => prev.map(e => 
            e.id === targetEnemy.id ? { ...e, health: Math.max(0, e.health - damage) } : e
          ));
          
          showDamageNumber(damage, targetEnemy.x + 20, targetEnemy.y, false);
          addToCombatLog(`Cha Hae-In strikes ${targetEnemy.name} for ${damage} damage!`);
          setSynergyGauge(prev => Math.min(100, prev + 8));
          
          if (enemies.every(e => e.health <= 0)) {
            setTimeout(() => setGamePhase('victory'), 1000);
          }
        }
      }, 3000);
      
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

  // Game initialization
  useEffect(() => {
    if (isVisible && gamePhase === 'prep') {
      setTimeout(() => {
        setGamePhase('combat');
        addToCombatLog("Combat begins! Use skills strategically!");
      }, 2000);
    }
    
    if (!isVisible) {
      setGamePhase('prep');
      setCombatLog([]);
      setSynergyGauge(0);
      setTeamUpReady(false);
      setCommandMode(false);
      setLootDrops([]);
      setTrapAlert(null);
      setBossStruggle(null);
      setPuzzleRunes([]);
      setSynergyChimeReady(false);
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
                  
                  // Check for victory
                  if (enemies.every(e => e.health <= 0)) {
                    setTimeout(() => setGamePhase('victory'), 1000);
                  }
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

        {/* Central Shadow Command Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={() => setCommandMode(!commandMode)}
            className="w-12 h-12 rounded-full bg-gray-700 border-2 border-purple-400 flex items-center justify-center"
            style={{ backdropFilter: 'blur(20px)' }}
            whileTap={{ scale: 0.9 }}
            animate={commandMode ? { 
              boxShadow: "0px 0px 20px rgba(147, 51, 234, 0.8)" 
            } : {}}
          >
            <Crown className="w-6 h-6 text-purple-400" />
          </motion.button>
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
              <div className="text-white text-sm">
                Progress: {Math.floor(bossStruggle.progress)}%
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}