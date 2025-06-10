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
  const [gamePhase, setGamePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
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
    if (gamePhase !== 'combat') return;
    
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
  }, [gamePhase, skills, players]);

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
    
    // Check for victory
    if (enemies.every(e => e.health <= 0)) {
      setTimeout(() => setGamePhase('victory'), 1000);
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

  // Synergy and cooldown systems
  useEffect(() => {
    if (synergyGauge >= 100 && !teamUpReady) {
      setTeamUpReady(true);
      addToCombatLog("Team-Up Attack Ready! Perfect synergy achieved!");
    }
  }, [synergyGauge]);

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

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[9999] bg-gradient-to-b from-gray-900 via-red-950 to-black"
    >
      {/* Dungeon Atmosphere */}
      <div className="absolute inset-0 bg-[url('/dungeon-bg.jpg')] bg-cover bg-center opacity-30" />
      
      {/* UI Header */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <div className="backdrop-blur-md bg-black/40 rounded-lg p-3 border border-purple-500/30">
          <h2 className="text-xl font-bold text-white mb-2">Shadow Dungeon Raid</h2>
          <div className="flex gap-4 text-sm">
            <span className="text-red-400">Difficulty: B-Rank</span>
            <span className="text-purple-400">Floor: 15</span>
          </div>
        </div>

        {gamePhase === 'preparation' && (
          <Button
            onClick={() => setGamePhase('combat')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Begin Raid
          </Button>
        )}

        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 relative z-[10001]"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Preparation Phase */}
      {gamePhase === 'preparation' && (
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
          </div>
        </motion.div>
      )}

      {/* Combat Phase */}
      {gamePhase === 'combat' && (
        <>
          {/* Battlefield with Camera Shake */}
          <motion.div 
            ref={battlefieldRef}
            className="absolute inset-x-4 top-20 bottom-32 bg-gradient-to-r from-gray-800/80 to-red-900/80 rounded-lg border border-red-500/30 overflow-hidden cursor-crosshair"
            onClick={handleBattlefieldTap}
            animate={cameraShake ? { 
              x: [0, -2, 2, -2, 2, 0],
              y: [0, -1, 1, -1, 1, 0]
            } : {}}
            transition={{ duration: 0.2 }}
          >
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
                      'border-purple-400 bg-purple-600/20'
                    }`}
                    style={{
                      backdropFilter: 'blur(20px) saturate(180%)',
                      background: isOnCooldown ? 'rgba(75, 85, 99, 0.3)' :
                                 notEnoughMana ? 'rgba(153, 27, 27, 0.3)' :
                                 skill.isCharging ? 'rgba(147, 51, 234, 0.6)' :
                                 'rgba(147, 51, 234, 0.3)'
                    }}
                    onMouseDown={() => skill.type === 'charge_aoe' ? handleSkillHold(skill.id) : undefined}
                    onMouseUp={() => skill.type === 'charge_aoe' ? handleSkillRelease(skill.id) : undefined}
                    onTouchStart={() => skill.type === 'charge_aoe' ? handleSkillHold(skill.id) : undefined}
                    onTouchEnd={() => skill.type === 'charge_aoe' ? handleSkillRelease(skill.id) : undefined}
                    onClick={() => skill.type !== 'charge_aoe' ? handleSkillTap(skill.id) : undefined}
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