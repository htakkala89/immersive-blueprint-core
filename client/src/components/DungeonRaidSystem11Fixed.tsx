import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sword, Zap, Target, Crown, Users } from 'lucide-react';

interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  type: 'shadow_beast' | 'orc_warrior' | 'boss' | 'shadow_soldier';
  isAlly?: boolean;
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
  const [gamePhase, setGamePhase] = useState<'intro' | 'combat' | 'room_clear' | 'boss_antechamber' | 'complete'>('intro');
  const [currentRoom, setCurrentRoom] = useState(2);
  const [totalRooms] = useState(7);
  const [dungeonAct] = useState(1);
  const [synergyGauge, setSynergyGauge] = useState(10);
  const [screenShake, setScreenShake] = useState(false);
  const [cameraShake, setCameraShake] = useState(false);
  const [skillEffects, setSkillEffects] = useState<{
    id: string;
    type: 'mutilate' | 'violent_slash' | 'dominators_touch';
    x: number;
    y: number;
    timestamp: number;
  }[]>([]);
  const [screenFlash, setScreenFlash] = useState<string | null>(null);
  const [monarchRuneOpen, setMonarchRuneOpen] = useState(false);
  const [commandMode, setCommandMode] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    timestamp: number;
  }>>([]);
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [battlefieldTraps, setBattlefieldTraps] = useState<Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    phase: 'warning' | 'expanding' | 'active' | 'fading';
    timestamp: number;
  }>>([]);
  
  const battlefieldRef = useRef<HTMLDivElement>(null);

  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'jinwoo',
      name: 'Sung Jin-Woo',
      health: 200,
      maxHealth: 200,
      mana: 100,
      maxMana: 100,
      x: 100,
      y: 300,
      isActive: true
    },
    {
      id: 'chahaein',
      name: 'Cha Hae-In',
      health: 180,
      maxHealth: 180,
      mana: 120,
      maxMana: 120,
      x: 200,
      y: 300,
      isActive: false
    }
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'enemy1',
      name: 'Shadow Beast',
      health: 120,
      maxHealth: 120,
      x: 300,
      y: 200,
      type: 'shadow_beast'
    },
    {
      id: 'enemy2',
      name: 'Orc Warrior',
      health: 100,
      maxHealth: 100,
      x: 450,
      y: 150,
      type: 'orc_warrior'
    },
    {
      id: 'enemy3',
      name: 'Shadow Soldier',
      health: 90,
      maxHealth: 90,
      x: 250,
      y: 320,
      type: 'shadow_soldier'
    }
  ]);

  const [skills] = useState<Skill[]>([
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
      icon: Zap,
      cooldown: 5000,
      manaCost: 30,
      type: 'dash',
      currentCooldown: 0
    },
    {
      id: 'dominators_touch',
      name: "Dominator's Touch",
      icon: Target,
      cooldown: 8000,
      manaCost: 50,
      type: 'charge_aoe',
      currentCooldown: 0
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      icon: Users,
      cooldown: 10000,
      manaCost: 40,
      type: 'special',
      currentCooldown: 0
    }
  ]);

  const availableShadows = [
    { id: 'igris', name: 'Igris', manaCost: 30 },
    { id: 'iron', name: 'Iron', manaCost: 20 },
    { id: 'tank', name: 'Tank', manaCost: 25 }
  ];

  const handleBattlefieldTap = (e: React.MouseEvent) => {
    if (battlefieldRef.current) {
      const rect = battlefieldRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Move active player to tapped location
      setPlayers(prev => prev.map(player => 
        player.isActive ? { ...player, x, y } : player
      ));
    }
  };

  const executeSkill = (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skillCooldowns[skillId] > 0) return;
    
    // Special handling for Shadow Exchange - teleport ability
    if (skill.id === 'shadow_exchange') {
      // Shadow Exchange teleports Jin-Woo to a new position
      const jinwoo = players.find(p => p.id === 'jinwoo');
      if (jinwoo && battlefieldRef.current) {
        const rect = battlefieldRef.current.getBoundingClientRect();
        const newX = Math.random() * (rect.width - 50);
        const newY = Math.random() * (rect.height - 50);
        
        setPlayers(prev => prev.map(player => 
          player.id === 'jinwoo' 
            ? { 
                ...player, 
                x: newX, 
                y: newY, 
                mana: Math.max(0, player.mana - skill.manaCost) 
              }
            : player
        ));
        
        // Start cooldown
        setSkillCooldowns(prev => ({ ...prev, [skillId]: skill.cooldown }));
        
        // Handle cooldown countdown
        const cooldownInterval = setInterval(() => {
          setSkillCooldowns(prev => {
            const newCooldown = Math.max(0, prev[skillId] - 100);
            if (newCooldown === 0) {
              clearInterval(cooldownInterval);
            }
            return { ...prev, [skillId]: newCooldown };
          });
        }, 100);
        
        console.log('Shadow Exchange: Jin-Woo teleported to new position');
      }
      return;
    }
    
    // Calculate damage and add epic visual effects based on skill type
    let baseDamage = 0;
    let effectColor = '';
    let shakeIntensity = 'normal';
    
    switch (skill.id) {
      case 'mutilate':
        baseDamage = 25 + Math.floor(Math.random() * 15); // 25-40 damage
        effectColor = 'from-red-500 to-purple-600';
        shakeIntensity = 'light';
        // Red slash effect
        setScreenFlash('bg-red-500/30');
        setSkillEffects(prev => [...prev, {
          id: `mutilate-${Date.now()}`,
          type: 'mutilate',
          x: Math.random() * 800,
          y: Math.random() * 600,
          timestamp: Date.now()
        }]);
        break;
      case 'violent_slash':
        baseDamage = 35 + Math.floor(Math.random() * 20); // 35-55 damage
        effectColor = 'from-orange-500 to-red-600';
        shakeIntensity = 'medium';
        // Orange violent slash effect
        setScreenFlash('bg-orange-500/40');
        setSkillEffects(prev => [...prev, {
          id: `violent-${Date.now()}`,
          type: 'violent_slash',
          x: Math.random() * 800,
          y: Math.random() * 600,
          timestamp: Date.now()
        }]);
        setCameraShake(true);
        setTimeout(() => setCameraShake(false), 300);
        break;
      case 'dominators_touch':
        baseDamage = 50 + Math.floor(Math.random() * 25); // 50-75 damage
        effectColor = 'from-purple-600 to-indigo-800';
        shakeIntensity = 'heavy';
        // Purple dominator effect
        setScreenFlash('bg-purple-600/50');
        setSkillEffects(prev => [...prev, {
          id: `dominator-${Date.now()}`,
          type: 'dominators_touch',
          x: Math.random() * 800,
          y: Math.random() * 600,
          timestamp: Date.now()
        }]);
        setScreenShake(true);
        setCameraShake(true);
        setTimeout(() => {
          setScreenShake(false);
          setCameraShake(false);
        }, 500);
        break;
    }
    
    // Clear screen flash after brief moment
    setTimeout(() => setScreenFlash(null), 150);

    // Apply damage only to hostile enemies (not Shadow Soldiers)
    setEnemies(prev => prev.map(enemy => {
      // Skip friendly Shadow Soldiers
      if (enemy.isAlly) return enemy;
      
      const newHealth = Math.max(0, enemy.health - baseDamage);
      
      // Add floating damage number
      const damageId = `damage-${Date.now()}-${Math.random()}`;
      setDamageNumbers(prevDamage => [...prevDamage, {
        id: damageId,
        damage: baseDamage,
        x: enemy.x,
        y: enemy.y - 20,
        timestamp: Date.now()
      }]);

      // Remove damage number after animation
      setTimeout(() => {
        setDamageNumbers(prevDamage => prevDamage.filter(d => d.id !== damageId));
      }, 1500);

      return { ...enemy, health: newHealth };
    }));

    // Consume mana
    setPlayers(prev => prev.map(player => 
      player.id === 'jinwoo' 
        ? { ...player, mana: Math.max(0, player.mana - skill.manaCost) }
        : player
    ));

    // Start cooldown
    setSkillCooldowns(prev => ({ ...prev, [skillId]: skill.cooldown }));

    // Handle cooldown countdown
    const cooldownInterval = setInterval(() => {
      setSkillCooldowns(prev => {
        const newCooldown = Math.max(0, prev[skillId] - 100);
        if (newCooldown === 0) {
          clearInterval(cooldownInterval);
        }
        return { ...prev, [skillId]: newCooldown };
      });
    }, 100);

    // Screen shake effect
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 200);

    console.log(`Executing skill: ${skill.name} for ${baseDamage} damage`);
  };

  const summonShadowSoldier = (shadowId: string) => {
    try {
      const shadow = availableShadows.find(s => s.id === shadowId);
      const jinwoo = players.find(p => p.id === 'jinwoo');
      
      if (!shadow) {
        console.error('Shadow not found:', shadowId);
        return;
      }
      
      if (!jinwoo) {
        console.error('Jin-woo not found');
        return;
      }
      
      if (jinwoo.mana < shadow.manaCost) {
        console.log('Not enough mana to summon', shadow.name);
        return;
      }

      // Consume mana
      setPlayers(prev => prev.map(player => 
        player.id === 'jinwoo' 
          ? { ...player, mana: Math.max(0, player.mana - shadow.manaCost) }
          : player
      ));

      // Spawn shadow soldier as an ally
      const newShadow = {
        id: `shadow-${shadowId}-${Date.now()}`,
        name: shadow.name,
        health: 60,
        maxHealth: 60,
        x: jinwoo.x + 50,
        y: jinwoo.y + 30,
        type: 'shadow_soldier' as const,
        isAlly: true
      };

      setEnemies(prev => [...prev, newShadow]);

      // Close the menu
      setMonarchRuneOpen(false);

      // Screen effect
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 300);

      console.log(`Successfully summoned: ${shadow.name} for ${shadow.manaCost} mana`);
    } catch (error) {
      console.error('Error summoning shadow soldier:', error);
    }
  };

  // Auto-attack system for all allies
  useEffect(() => {
    const shadowSoldiers = enemies.filter(e => e.isAlly);
    const realEnemies = enemies.filter(e => !e.isAlly);
    
    if (realEnemies.length === 0) return;

    const interval = setInterval(() => {
      // Cha Hae-In auto-attack
      const chahaein = players.find(p => p.id === 'chahaein');
      if (chahaein && realEnemies.length > 0) {
        const nearestEnemy = realEnemies.reduce((nearest, enemy) => {
          const distToCha = Math.sqrt(
            Math.pow(enemy.x - chahaein.x, 2) + Math.pow(enemy.y - chahaein.y, 2)
          );
          const distToNearest = nearest ? Math.sqrt(
            Math.pow(nearest.x - chahaein.x, 2) + Math.pow(nearest.y - chahaein.y, 2)
          ) : Infinity;
          
          return distToCha < distToNearest ? enemy : nearest;
        }, null as Enemy | null);

        if (nearestEnemy) {
          const damage = Math.floor(Math.random() * 15) + 10;
          
          setEnemies(prev => prev.map(enemy => 
            enemy.id === nearestEnemy.id 
              ? { ...enemy, health: Math.max(0, enemy.health - damage) }
              : enemy
          ).filter(enemy => enemy.health > 0));

          setDamageNumbers(prev => [...prev, {
            id: `cha-damage-${Date.now()}`,
            damage: damage,
            x: nearestEnemy.x,
            y: nearestEnemy.y,
            timestamp: Date.now()
          }]);
        }
      }

      // Shadow Soldiers auto-attack
      shadowSoldiers.forEach(shadowSoldier => {
        const nearestEnemyToShadow = realEnemies.reduce((nearest, enemy) => {
          const distToShadow = Math.sqrt(
            Math.pow(enemy.x - shadowSoldier.x, 2) + Math.pow(enemy.y - shadowSoldier.y, 2)
          );
          const distToNearest = nearest ? Math.sqrt(
            Math.pow(nearest.x - shadowSoldier.x, 2) + Math.pow(nearest.y - shadowSoldier.y, 2)
          ) : Infinity;
          
          return distToShadow < distToNearest ? enemy : nearest;
        }, null as Enemy | null);

        if (nearestEnemyToShadow) {
          let damage = 0;
          
          // Different damage based on shadow soldier type
          if (shadowSoldier.name === 'Igris') {
            damage = Math.floor(Math.random() * 20) + 15; // 15-35 damage
          } else if (shadowSoldier.name === 'Tank') {
            damage = Math.floor(Math.random() * 15) + 10; // 10-25 damage
          } else if (shadowSoldier.name === 'Iron') {
            damage = Math.floor(Math.random() * 12) + 8;  // 8-20 damage
          }
          
          setEnemies(prev => prev.map(enemy => 
            enemy.id === nearestEnemyToShadow.id 
              ? { ...enemy, health: Math.max(0, enemy.health - damage) }
              : enemy
          ).filter(enemy => enemy.health > 0));

          setDamageNumbers(prev => [...prev, {
            id: `shadow-damage-${shadowSoldier.id}-${Date.now()}`,
            damage: damage,
            x: nearestEnemyToShadow.x,
            y: nearestEnemyToShadow.y,
            timestamp: Date.now()
          }]);

          console.log(`${shadowSoldier.name} dealt ${damage} damage to ${nearestEnemyToShadow.name}`);
        }
      });
    }, 2500); // Attack every 2.5 seconds

    return () => clearInterval(interval);
  }, [enemies, players]);

  // Enemy counter-attack system
  useEffect(() => {
    const realEnemies = enemies.filter(e => !e.isAlly && e.health > 0);
    const allAllies = [
      ...players,
      ...enemies.filter(e => e.isAlly)
    ];
    
    console.log(`👹 Enemy attack check: ${realEnemies.length} enemies, ${allAllies.length} allies`);
    
    if (realEnemies.length === 0 || allAllies.length === 0) {
      console.log('⚠️ Enemy attack system inactive - no valid targets');
      return;
    }
    
    console.log('💀 Starting enemy attack system');

    const enemyAttackInterval = setInterval(() => {
      // Get fresh enemy and ally lists each time
      const currentRealEnemies = enemies.filter(e => !e.isAlly && e.health > 0);
      const currentAllAllies = [
        ...players,
        ...enemies.filter(e => e.isAlly)
      ];
      
      console.log(`🔥 Enemy attack round: ${currentRealEnemies.length} enemies attacking`);
      currentRealEnemies.forEach(enemy => {
        // Find nearest ally to attack
        const nearestAlly = currentAllAllies.reduce((nearest, ally) => {
          const distToEnemy = Math.sqrt(
            Math.pow(ally.x - enemy.x, 2) + Math.pow(ally.y - enemy.y, 2)
          );
          const distToNearest = nearest ? Math.sqrt(
            Math.pow(nearest.x - enemy.x, 2) + Math.pow(nearest.y - enemy.y, 2)
          ) : Infinity;
          
          return distToEnemy < distToNearest ? ally : nearest;
        }, null as (Player | Enemy) | null);

        if (nearestAlly) {
          let damage = 0;
          
          // Different damage based on enemy type
          switch (enemy.type) {
            case 'shadow_beast':
              damage = Math.floor(Math.random() * 12) + 8; // 8-20 damage
              break;
            case 'orc_warrior':
              damage = Math.floor(Math.random() * 15) + 10; // 10-25 damage
              break;
            case 'boss':
              damage = Math.floor(Math.random() * 25) + 20; // 20-45 damage
              break;
            default:
              damage = Math.floor(Math.random() * 10) + 5; // 5-15 damage
              break;
          }

          // Damage players
          if ('id' in nearestAlly && (nearestAlly.id === 'jinwoo' || nearestAlly.id === 'chahaein')) {
            setPlayers(prev => prev.map(player => 
              player.id === nearestAlly.id 
                ? { ...player, health: Math.max(0, player.health - damage) }
                : player
            ));
          } 
          // Damage shadow soldiers
          else if ('isAlly' in nearestAlly && nearestAlly.isAlly) {
            setEnemies(prev => prev.map(ally => 
              ally.id === nearestAlly.id 
                ? { ...ally, health: Math.max(0, ally.health - damage) }
                : ally
            ).filter(ally => !ally.isAlly || ally.health > 0)); // Remove dead shadow soldiers
          }

          // Show damage numbers
          setDamageNumbers(prev => [...prev, {
            id: `enemy-damage-${enemy.id}-${Date.now()}`,
            damage: damage,
            x: nearestAlly.x,
            y: nearestAlly.y,
            timestamp: Date.now()
          }]);

          console.log(`${enemy.name} dealt ${damage} damage to ${nearestAlly.name || 'ally'}`);
        }
      });
    }, 3000); // Enemies attack every 3 seconds

    return () => clearInterval(enemyAttackInterval);
  }, [enemies, players]);

  // Battlefield trap system
  useEffect(() => {
    const trapSpawnInterval = setInterval(() => {
      if (battlefieldRef.current) {
        const rect = battlefieldRef.current.getBoundingClientRect();
        const x = Math.random() * (rect.width - 100) + 50;
        const y = Math.random() * (rect.height - 100) + 50;
        
        const newTrap = {
          id: `trap-${Date.now()}`,
          x,
          y,
          radius: 0,
          maxRadius: 80,
          phase: 'warning' as const,
          timestamp: Date.now()
        };
        
        setBattlefieldTraps(prev => [...prev, newTrap]);
        console.log('Battlefield trap spawned at', { x, y });
      }
    }, 8000); // Spawn trap every 8 seconds

    return () => clearInterval(trapSpawnInterval);
  }, []);

  // Trap phase progression
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setBattlefieldTraps(prev => {
        const updatedTraps = prev.map(trap => {
          const age = Date.now() - trap.timestamp;
          
          if (trap.phase === 'warning' && age > 2000) {
            console.log(`🟡 Trap ${trap.id} → EXPANDING (age: ${age}ms)`);
            return { ...trap, phase: 'expanding' as const };
          } else if (trap.phase === 'expanding' && age > 4000) {
            console.log(`🔴 Trap ${trap.id} → ACTIVE (age: ${age}ms)`);
            return { ...trap, phase: 'active' as const, radius: trap.maxRadius };
          } else if (trap.phase === 'active' && age > 8000) {
            console.log(`🌫️ Trap ${trap.id} → FADING (age: ${age}ms)`);
            return { ...trap, phase: 'fading' as const };
          } else if (trap.phase === 'expanding') {
            // Gradually expand radius
            const expandProgress = (age - 2000) / 2000; // 2 seconds to expand
            return { ...trap, radius: Math.min(trap.maxRadius * expandProgress, trap.maxRadius) };
          }
          
          return trap;
        });
        
        // Filter out completely faded traps (after 10 seconds total)
        const filteredTraps = updatedTraps.filter(trap => {
          const age = Date.now() - trap.timestamp;
          return age < 10000;
        });
        
        return filteredTraps;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, []);

  // Create refs to avoid stale closure issues
  const battlefieldTrapsRef = useRef(battlefieldTraps);
  const playersRef = useRef(players);
  const enemiesRef = useRef(enemies);

  // Update refs when state changes
  useEffect(() => {
    battlefieldTrapsRef.current = battlefieldTraps;
  }, [battlefieldTraps]);

  useEffect(() => {
    playersRef.current = players;
  }, [players]);

  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);

  // Trap damage detection
  useEffect(() => {
    console.log('🚀 Starting trap damage detection system');
    const damageInterval = setInterval(() => {
      // Use fresh state from dependencies
      const currentTraps = battlefieldTraps;
      const currentPlayers = players;
      const currentEnemies = enemies;
      
      const activeTraps = currentTraps.filter(trap => trap.phase === 'active');
      
      console.log(`🔍 Damage check running - ${currentTraps.length} total traps, ${activeTraps.length} active`);
      
      // Debug trap states
      if (currentTraps.length > 0) {
        console.log('📊 Current trap states:', currentTraps.map(t => ({ 
          id: t.id, 
          phase: t.phase, 
          age: Date.now() - t.timestamp,
          x: t.x,
          y: t.y,
          radius: t.radius
        })));
      }
      
      if (activeTraps.length === 0) {
        return;
      }

      console.log(`⚡ Checking trap damage - ${activeTraps.length} active traps`);
      console.log('👤 Player positions:', currentPlayers.map(p => ({ name: p.name, x: p.x, y: p.y })));
      console.log('🔴 Active trap positions:', activeTraps.map(t => ({ x: t.x, y: t.y, radius: t.radius })));

      // Check players
      currentPlayers.forEach(player => {
        activeTraps.forEach(trap => {
          const distance = Math.sqrt(
            Math.pow(player.x - trap.x, 2) + Math.pow(player.y - trap.y, 2)
          );
          
          console.log(`Player ${player.name} at (${player.x}, ${player.y}) - trap at (${trap.x}, ${trap.y}) - distance: ${distance}, radius: ${trap.radius}`);
          
          if (distance <= trap.radius) {
            const damage = Math.floor(Math.random() * 20) + 15; // 15-35 trap damage
            
            setPlayers(prev => prev.map(p => 
              p.id === player.id 
                ? { ...p, health: Math.max(0, p.health - damage) }
                : p
            ));

            setDamageNumbers(prev => [...prev, {
              id: `trap-damage-${player.id}-${Date.now()}`,
              damage: damage,
              x: player.x,
              y: player.y,
              timestamp: Date.now()
            }]);

            // Screen shake for trap damage
            setScreenShake(true);
            setTimeout(() => setScreenShake(false), 200);

            console.log(`${player.name} took ${damage} trap damage at distance ${distance}`);
          }
        });
      });

      // Check shadow soldiers
      const shadowSoldiers = currentEnemies.filter(e => e.isAlly);
      shadowSoldiers.forEach(soldier => {
        activeTraps.forEach(trap => {
          const distance = Math.sqrt(
            Math.pow(soldier.x - trap.x, 2) + Math.pow(soldier.y - trap.y, 2)
          );
          
          if (distance <= trap.radius) {
            const damage = Math.floor(Math.random() * 15) + 10; // 10-25 trap damage
            
            setEnemies(prev => prev.map(ally => 
              ally.id === soldier.id 
                ? { ...ally, health: Math.max(0, ally.health - damage) }
                : ally
            ).filter(ally => !ally.isAlly || ally.health > 0));

            setDamageNumbers(prev => [...prev, {
              id: `trap-damage-${soldier.id}-${Date.now()}`,
              damage: damage,
              x: soldier.x,
              y: soldier.y,
              timestamp: Date.now()
            }]);

            console.log(`${soldier.name} took ${damage} trap damage`);
          }
        });
      });
    }, 500); // Check for trap damage every 0.5 seconds for better responsiveness

    return () => clearInterval(damageInterval);
  }, [battlefieldTraps, players, enemies]); // Add dependencies back to get fresh state

  // Enemy respawn system
  useEffect(() => {
    const realEnemies = enemies.filter(e => !e.isAlly && e.health > 0);
    
    if (realEnemies.length === 0) {
      // Spawn new wave of enemies after 3 seconds
      const respawnTimer = setTimeout(() => {
        if (battlefieldRef.current) {
          const rect = battlefieldRef.current.getBoundingClientRect();
          
          const newEnemies = [
            {
              id: `enemy-${Date.now()}-1`,
              name: 'Shadow Beast',
              health: 120,
              maxHealth: 120,
              x: Math.random() * (rect.width - 100) + 50,
              y: Math.random() * (rect.height - 100) + 50,
              type: 'shadow_beast' as const
            },
            {
              id: `enemy-${Date.now()}-2`,
              name: 'Orc Warrior',
              health: 100,
              maxHealth: 100,
              x: Math.random() * (rect.width - 100) + 50,
              y: Math.random() * (rect.height - 100) + 50,
              type: 'orc_warrior' as const
            },
            {
              id: `enemy-${Date.now()}-3`,
              name: 'Shadow Soldier',
              health: 90,
              maxHealth: 90,
              x: Math.random() * (rect.width - 100) + 50,
              y: Math.random() * (rect.height - 100) + 50,
              type: 'shadow_soldier' as const
            }
          ];
          
          setEnemies(prev => [...prev.filter(e => e.isAlly), ...newEnemies]);
          console.log('New enemy wave spawned:', newEnemies.length, 'enemies');
        }
      }, 3000);
      
      return () => clearTimeout(respawnTimer);
    }
  }, [enemies]);

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

          {/* Synergy Gauge (Top-Right, Moved Down) */}
          <div className="absolute top-32 right-4">
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

          {/* Full-Screen Battlefield Canvas */}
          <div className={`absolute inset-0 ${screenShake ? 'animate-shake' : ''} ${cameraShake ? 'animate-camera-shake' : ''}`}>
            {/* Intro Phase */}
            {gamePhase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center h-full"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-purple-400 mb-4">Shadow Dungeon</h3>
                  <p className="text-slate-300 mb-8">Room {currentRoom} of {totalRooms}</p>
                  <Button
                    onClick={() => setGamePhase('combat')}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg"
                  >
                    Begin Combat
                  </Button>
                </div>
              </motion.div>
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
                      
                      {/* Diegetic Health Aura - Enhanced Visibility */}
                      <div 
                        className={`absolute rounded-full animate-pulse ${
                          player.id === 'jinwoo' 
                            ? 'bg-purple-500/60 shadow-purple-500/40' 
                            : 'bg-yellow-500/60 shadow-yellow-500/40'
                        }`}
                        style={{
                          width: '60px',
                          height: '60px',
                          left: '-6px',
                          top: '-6px',
                          transform: `scale(${player.health / player.maxHealth})`,
                          filter: 'blur(3px)',
                          boxShadow: `0 0 20px ${player.id === 'jinwoo' ? '#a855f7' : '#eab308'}`
                        }}
                      ></div>
                      
                      {/* Diegetic Mana Ring (for Jinwoo only) - Enhanced */}
                      {player.id === 'jinwoo' && (
                        <div 
                          className="absolute rounded-full border-4 border-blue-400 animate-pulse"
                          style={{
                            width: '70px',
                            height: '70px',
                            left: '-11px',
                            top: '-11px',
                            opacity: player.mana / player.maxMana,
                            filter: 'blur(1px)',
                            boxShadow: '0 0 15px #60a5fa'
                          }}
                        ></div>
                      )}
                      
                      {/* Health/Mana Text Display */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded">
                        HP: {player.health}/{player.maxHealth}
                        {player.id === 'jinwoo' && <div>MP: {player.mana}/{player.maxMana}</div>}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Battlefield Traps */}
                {battlefieldTraps.map(trap => (
                  <motion.div
                    key={trap.id}
                    className="absolute pointer-events-none"
                    style={{ 
                      left: trap.x - (trap.phase === 'warning' ? trap.maxRadius : trap.radius), 
                      top: trap.y - (trap.phase === 'warning' ? trap.maxRadius : trap.radius) 
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: trap.phase === 'fading' ? 0 : 1,
                      opacity: trap.phase === 'fading' ? 0 : 1
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Warning Phase - Pulsing Red Circle */}
                    {trap.phase === 'warning' && (
                      <div 
                        className="rounded-full border-4 border-red-500 animate-pulse"
                        style={{
                          width: trap.maxRadius * 2,
                          height: trap.maxRadius * 2,
                          backgroundColor: 'rgba(239, 68, 68, 0.1)'
                        }}
                      />
                    )}
                    
                    {/* Expanding Phase - Growing Orange Circle */}
                    {trap.phase === 'expanding' && (
                      <div 
                        className="rounded-full border-4 border-orange-500"
                        style={{
                          width: trap.radius * 2,
                          height: trap.radius * 2,
                          backgroundColor: 'rgba(249, 115, 22, 0.2)',
                          transition: 'all 0.1s ease-out'
                        }}
                      />
                    )}
                    
                    {/* Active Phase - Solid Red Damage Zone */}
                    {trap.phase === 'active' && (
                      <div 
                        className="rounded-full border-4 border-red-600 animate-pulse"
                        style={{
                          width: trap.radius * 2,
                          height: trap.radius * 2,
                          backgroundColor: 'rgba(220, 38, 38, 0.4)'
                        }}
                      />
                    )}
                    
                    {/* Debug Info */}
                    {trap.phase === 'active' && (
                      <div className="absolute top-0 left-0 text-xs text-white bg-black/50 p-1 rounded">
                        {Math.round(trap.x)},{Math.round(trap.y)} r:{Math.round(trap.radius)}
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Enemies and Shadow Soldiers */}
                {enemies.map(enemy => (
                  <motion.div
                    key={enemy.id}
                    className="absolute cursor-pointer"
                    style={{ left: enemy.x, top: enemy.y }}
                    initial={{ scale: 0, rotate: enemy.isAlly ? 0 : -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="relative">
                      {/* Avatar - Different colors for allies vs enemies */}
                      <div className={`w-10 h-10 rounded-full border-2 ${
                        enemy.isAlly 
                          ? 'bg-purple-600 border-purple-400' 
                          : 'bg-red-600 border-red-400'
                      }`}></div>
                      
                      {/* Name & Health */}
                      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap ${
                        enemy.isAlly ? 'text-purple-300' : 'text-white'
                      }`}>
                        {enemy.name} ({enemy.health}/{enemy.maxHealth})
                      </div>
                      
                      {/* Health Aura - Different colors for allies vs enemies */}
                      <div 
                        className={`absolute inset-0 rounded-full animate-pulse ${
                          enemy.isAlly 
                            ? 'bg-purple-400/40' 
                            : 'bg-red-400/40'
                        }`}
                        style={{
                          width: '40px',
                          height: '40px',
                          transform: `scale(${enemy.health / enemy.maxHealth})`,
                          filter: 'blur(2px)'
                        }}
                      ></div>
                    </div>
                  </motion.div>
                ))}

                {/* Floating Damage Numbers */}
                <AnimatePresence>
                  {damageNumbers.map(damage => (
                    <motion.div
                      key={damage.id}
                      className="absolute text-yellow-400 font-bold text-lg pointer-events-none z-50"
                      style={{ left: damage.x, top: damage.y }}
                      initial={{ opacity: 1, y: 0, scale: 0.5 }}
                      animate={{ opacity: 0, y: -50, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.5 }}
                    >
                      -{damage.damage}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Epic Skill Visual Effects */}
                <AnimatePresence>
                  {skillEffects.map(effect => (
                    <motion.div
                      key={effect.id}
                      className="absolute pointer-events-none z-40"
                      style={{ left: effect.x, top: effect.y }}
                      initial={{ scale: 0, opacity: 0, rotate: 0 }}
                      animate={{ 
                        scale: [0, 1.5, 1, 0],
                        opacity: [0, 1, 0.8, 0],
                        rotate: effect.type === 'violent_slash' ? [0, 180, 360] : [0, 45, 0]
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      onAnimationComplete={() => {
                        setSkillEffects(prev => prev.filter(e => e.id !== effect.id));
                      }}
                    >
                      {/* Mutilate Effect - Red Slashes */}
                      {effect.type === 'mutilate' && (
                        <div className="relative">
                          <div className="w-32 h-2 bg-gradient-to-r from-red-500 to-transparent rotate-45 blur-sm"></div>
                          <div className="w-24 h-2 bg-gradient-to-r from-red-600 to-transparent -rotate-45 blur-sm absolute top-0"></div>
                          <div className="w-20 h-1 bg-red-400 rotate-12 absolute top-1 left-2"></div>
                        </div>
                      )}

                      {/* Violent Slash Effect - Orange Energy Waves */}
                      {effect.type === 'violent_slash' && (
                        <div className="relative">
                          <div className="w-48 h-4 bg-gradient-to-r from-orange-500 via-red-500 to-transparent rotate-12 animate-pulse"></div>
                          <div className="w-40 h-3 bg-gradient-to-r from-yellow-400 to-orange-600 -rotate-12 absolute top-2 blur-sm"></div>
                          <div className="w-56 h-2 bg-gradient-to-r from-red-600 to-transparent rotate-6 absolute top-1 animate-ping"></div>
                        </div>
                      )}

                      {/* Dominator's Touch Effect - Purple Energy Burst */}
                      {effect.type === 'dominators_touch' && (
                        <div className="relative">
                          <div className="w-64 h-64 bg-gradient-radial from-purple-600/80 via-indigo-500/40 to-transparent rounded-full animate-pulse"></div>
                          <div className="w-48 h-48 bg-gradient-radial from-purple-400/60 to-transparent rounded-full absolute top-8 left-8 animate-ping"></div>
                          <div className="w-32 h-32 bg-gradient-radial from-white/80 to-transparent rounded-full absolute top-16 left-16"></div>
                          {/* Lightning Effect */}
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="w-1 h-32 bg-purple-300 rotate-12 animate-pulse"></div>
                            <div className="w-1 h-24 bg-indigo-300 -rotate-45 absolute top-0 animate-pulse"></div>
                            <div className="w-1 h-28 bg-purple-400 rotate-75 absolute top-0 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Screen Flash Effect */}
                {screenFlash && (
                  <motion.div
                    className={`absolute inset-0 ${screenFlash} pointer-events-none z-50`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </div>
            )}
          </div>

          {/* Action Bar (Bottom-Center) - Fixed Position */}
          {gamePhase === 'combat' && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex justify-center gap-3 py-2 px-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl">
                {skills.map((skill, index) => {
                  const currentCooldown = skillCooldowns[skill.id] || 0;
                  const isOnCooldown = currentCooldown > 0;
                  const cooldownProgress = isOnCooldown ? (currentCooldown / skill.cooldown) * 100 : 0;
                  
                  return (
                    <motion.button
                      key={skill.id}
                      onClick={() => executeSkill(skill.id)}
                      className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                        isOnCooldown
                          ? 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                          : 'border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30 hover:border-purple-400 cursor-pointer'
                      }`}
                      whileHover={{ scale: isOnCooldown ? 1 : 1.05 }}
                      whileTap={{ scale: isOnCooldown ? 1 : 0.95 }}
                    >
                      <skill.icon className={`w-6 h-6 ${
                        isOnCooldown ? 'text-slate-500' : 'text-purple-300'
                      }`} />
                      
                      {/* Cooldown Overlay */}
                      {isOnCooldown && (
                        <div 
                          className="absolute inset-0 bg-slate-900/70 rounded-xl flex items-center justify-center"
                          style={{
                            background: `conic-gradient(from 0deg, transparent ${100-cooldownProgress}%, rgba(0,0,0,0.8) ${100-cooldownProgress}%)`
                          }}
                        >
                          <div className="text-xs text-white font-bold">
                            {Math.ceil(currentCooldown / 1000)}
                          </div>
                        </div>
                      )}
                      
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-slate-300">
                        {index + 1}
                      </div>
                    </motion.button>
                  );
                })}

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
              {monarchRuneOpen && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
                  <div className="relative w-48 h-48">
                    {availableShadows.map((shadow, index) => {
                      const angle = (index * 120) - 90;
                      const radius = 60;
                      const x = Math.cos(angle * Math.PI / 180) * radius;
                      const y = Math.sin(angle * Math.PI / 180) * radius;
                      const jinwoo = players.find(p => p.id === 'jinwoo');
                      const canSummon = jinwoo && jinwoo.mana >= shadow.manaCost;
                      
                      return (
                        <button
                          key={shadow.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log(`Attempting to summon ${shadow.name}, canSummon: ${canSummon}`);
                            if (canSummon) {
                              summonShadowSoldier(shadow.id);
                            } else {
                              console.log('Cannot summon - insufficient mana');
                            }
                          }}
                          className={`absolute w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs transition-all ${
                            canSummon 
                              ? 'border-purple-400 bg-purple-500/30 hover:bg-purple-500/50 cursor-pointer hover:scale-105'
                              : 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                          }`}
                          style={{
                            left: `calc(50% + ${x}px - 32px)`,
                            top: `calc(50% + ${y}px - 32px)`,
                            pointerEvents: 'auto'
                          }}
                        >
                          <div className="text-white font-bold">{shadow.name}</div>
                          <div className="text-blue-300">{shadow.manaCost}MP</div>
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setMonarchRuneOpen(false)}
                      className="absolute w-12 h-12 rounded-full border-2 border-yellow-400 bg-yellow-400/20 flex items-center justify-center"
                      style={{
                        left: 'calc(50% - 24px)',
                        top: 'calc(50% - 24px)'
                      }}
                    >
                      <Users className="w-5 h-5 text-yellow-300" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}