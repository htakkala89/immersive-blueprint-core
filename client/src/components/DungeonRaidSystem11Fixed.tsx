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
      health: 80,
      maxHealth: 80,
      x: 300,
      y: 200,
      type: 'shadow_beast'
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
    
    // Calculate damage based on skill type
    let baseDamage = 0;
    switch (skill.id) {
      case 'mutilate':
        baseDamage = 25 + Math.floor(Math.random() * 15); // 25-40 damage
        break;
      case 'violent_slash':
        baseDamage = 35 + Math.floor(Math.random() * 20); // 35-55 damage
        break;
      case 'dominators_touch':
        baseDamage = 50 + Math.floor(Math.random() * 25); // 50-75 damage
        break;
    }

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

          {/* Full-Screen Battlefield Canvas */}
          <div className="absolute inset-0">
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
                          onClick={() => {
                            console.log(`Attempting to summon ${shadow.name}, canSummon: ${canSummon}`);
                            if (canSummon) {
                              summonShadowSoldier(shadow.id);
                            } else {
                              console.log('Cannot summon - insufficient mana');
                            }
                          }}
                          className={`absolute w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center text-xs ${
                            canSummon 
                              ? 'border-purple-400 bg-purple-500/30 hover:bg-purple-500/50 cursor-pointer'
                              : 'border-slate-600 bg-slate-700/50 opacity-50 cursor-not-allowed'
                          }`}
                          style={{
                            left: `calc(50% + ${x}px - 32px)`,
                            top: `calc(50% + ${y}px - 32px)`
                          }}
                          disabled={!canSummon}
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