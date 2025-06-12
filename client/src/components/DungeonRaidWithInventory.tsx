import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sword, Shield, Zap, Target, Users, Heart, Coins, Star, X, Package } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  x: number;
  y: number;
  isActive: boolean;
}

interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  type: 'shadow_beast' | 'orc_warrior' | 'boss';
}

interface Skill {
  id: string;
  name: string;
  icon: any;
  cooldown: number;
  manaCost: number;
  type: 'launcher' | 'dash' | 'charge_aoe' | 'special';
  currentCooldown: number;
}

interface CombatItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  healAmount?: number;
  manaAmount?: number;
  type: 'health' | 'mana' | 'revival' | 'hybrid';
  cooldown: number;
  maxCooldown: number;
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (success: boolean, loot: any[]) => void;
  playerLevel: number;
  affectionLevel: number;
}

export function DungeonRaidWithInventory({ 
  isVisible, 
  onClose, 
  onRaidComplete, 
  playerLevel, 
  affectionLevel 
}: RaidProps) {
  // Core game state
  const [gamePhase, setGamePhase] = useState<'intro' | 'combat' | 'room_clear' | 'complete'>('intro');
  const [currentRoom, setCurrentRoom] = useState(1);
  const [totalRooms] = useState(5);

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
      isActive: false
    }
  ]);

  const [enemies, setEnemies] = useState<Enemy[]>([
    {
      id: 'enemy1',
      name: 'Shadow Beast',
      health: 120,
      maxHealth: 120,
      x: 400,
      y: 200,
      type: 'shadow_beast'
    },
    {
      id: 'enemy2',
      name: 'Orc Warrior',
      health: 100,
      maxHealth: 100,
      x: 500,
      y: 150,
      type: 'orc_warrior'
    }
  ]);

  // Combat inventory system
  const [combatInventory, setCombatInventory] = useState<CombatItem[]>([
    { id: 'health_potion', name: 'Health Potion', icon: '🧪', quantity: 5, healAmount: 50, type: 'health', cooldown: 0, maxCooldown: 2000 },
    { id: 'mana_potion', name: 'Mana Potion', icon: '💙', quantity: 3, manaAmount: 40, type: 'mana', cooldown: 0, maxCooldown: 1500 },
    { id: 'revival_stone', name: 'Revival Stone', icon: '💎', quantity: 1, healAmount: 100, type: 'revival', cooldown: 0, maxCooldown: 10000 },
    { id: 'energy_drink', name: 'Energy Drink', icon: '⚡', quantity: 2, healAmount: 25, manaAmount: 25, type: 'hybrid', cooldown: 0, maxCooldown: 3000 }
  ]);

  const [showInventory, setShowInventory] = useState(false);
  const [itemCooldowns, setItemCooldowns] = useState<Record<string, number>>({});

  // Visual effects
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical: boolean;
    isHealing?: boolean;
    timestamp: number;
  }>>([]);
  const [screenShake, setScreenShake] = useState(false);

  // Skills
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

  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const battlefieldRef = useRef<HTMLDivElement>(null);

  // Combat item usage
  const useCombatItem = useCallback((itemId: string) => {
    const item = combatInventory.find(inv => inv.id === itemId);
    if (!item || item.quantity <= 0 || itemCooldowns[itemId] > 0) return;

    const jinwoo = players.find(p => p.id === 'jinwoo');
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
          health: Math.min(player.maxHealth, item.healAmount || player.maxHealth * 0.5) 
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

    // Reduce item quantity
    setCombatInventory(prev => prev.map(inv => 
      inv.id === itemId ? { ...inv, quantity: inv.quantity - 1 } : inv
    ));

    // Visual feedback for healing
    setDamageNumbers(prev => [...prev, {
      id: `heal_${Date.now()}`,
      damage: item.healAmount || item.manaAmount || 0,
      x: jinwoo.x,
      y: jinwoo.y - 30,
      isCritical: false,
      isHealing: true,
      timestamp: Date.now()
    }]);

    console.log(`Used ${item.name} - ${item.quantity - 1} remaining`);
  }, [combatInventory, itemCooldowns, players]);

  // Skill execution
  const executeSkill = useCallback((skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skillCooldowns[skillId] > 0) return;
    
    const jinwoo = players.find(p => p.id === 'jinwoo');
    if (!jinwoo || jinwoo.mana < skill.manaCost) return;

    // Deduct mana
    setPlayers(prev => prev.map(p => 
      p.id === 'jinwoo' ? { ...p, mana: p.mana - skill.manaCost } : p
    ));

    // Start skill cooldown
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

    // Apply skill effects to enemies
    const aliveEnemies = enemies.filter(e => e.health > 0);
    if (aliveEnemies.length === 0) return;

    const targetEnemy = aliveEnemies[0];
    let damage = 0;

    switch (skill.type) {
      case 'launcher':
        damage = 25 + Math.floor(Math.random() * 15);
        break;
      case 'dash':
        damage = 20 + Math.floor(Math.random() * 10);
        break;
      case 'charge_aoe':
        damage = 35 + Math.floor(Math.random() * 20);
        break;
      case 'special':
        damage = 30 + Math.floor(Math.random() * 15);
        break;
    }

    setEnemies(prev => prev.map(enemy => 
      enemy.id === targetEnemy.id 
        ? { ...enemy, health: Math.max(0, enemy.health - damage) }
        : enemy
    ));

    setDamageNumbers(prev => [...prev, {
      id: `skill_damage_${Date.now()}`,
      damage,
      x: targetEnemy.x,
      y: targetEnemy.y - 30,
      isCritical: skill.type === 'charge_aoe',
      timestamp: Date.now()
    }]);

    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);
  }, [skills, skillCooldowns, players, enemies]);

  // Basic attack on battlefield tap
  const handleBattlefieldTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (gamePhase !== 'combat') return;
    
    const rect = battlefieldRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const tappedEnemy = enemies.find(enemy => {
      const distance = Math.sqrt(Math.pow(enemy.x - x, 2) + Math.pow(enemy.y - y, 2));
      return distance < 40 && enemy.health > 0;
    });
    
    if (tappedEnemy) {
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
    }
  }, [gamePhase, enemies]);

  // Room completion check
  useEffect(() => {
    if (gamePhase === 'combat' && enemies.length > 0) {
      const aliveEnemies = enemies.filter(e => e.health > 0);
      
      if (aliveEnemies.length === 0) {
        if (currentRoom === totalRooms) {
          setGamePhase('complete');
          setTimeout(() => {
            onRaidComplete(true, [
              { type: 'gold', amount: 5000 },
              { type: 'experience', amount: 1000 }
            ]);
          }, 2000);
        } else {
          setGamePhase('room_clear');
          setTimeout(() => {
            setCurrentRoom(prev => prev + 1);
            setEnemies([
              {
                id: `enemy_room_${currentRoom + 1}_1`,
                name: 'Shadow Beast',
                health: 120 + (currentRoom * 20),
                maxHealth: 120 + (currentRoom * 20),
                x: 400 + Math.random() * 100,
                y: 150 + Math.random() * 100,
                type: 'shadow_beast'
              }
            ]);
            setGamePhase('combat');
          }, 2000);
        }
      }
    }
  }, [enemies, gamePhase, currentRoom, totalRooms, onRaidComplete]);

  // Initialize dungeon
  useEffect(() => {
    if (isVisible && gamePhase === 'intro') {
      setTimeout(() => {
        setGamePhase('combat');
      }, 2000);
    }
  }, [isVisible, gamePhase]);

  // Clean up damage numbers
  useEffect(() => {
    const interval = setInterval(() => {
      setDamageNumbers(prev => prev.filter(dmg => Date.now() - dmg.timestamp < 2000));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl border border-blue-400/30 shadow-2xl w-full h-full max-w-6xl max-h-[95vh] overflow-hidden relative ${
            screenShake ? 'animate-pulse' : ''
          }`}
        >
          {/* Header */}
          <div className="relative p-4 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span>Room {currentRoom}/{totalRooms}</span>
                <span>•</span>
                <span>Shadow Dungeon</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Combat Inventory Toggle */}
              <Button
                onClick={() => setShowInventory(!showInventory)}
                variant="outline"
                size="sm"
                className="border-blue-400/30 text-white hover:bg-blue-500/20"
              >
                <Package className="w-4 h-4 mr-2" />
                Items ({combatInventory.filter(item => item.quantity > 0).length})
              </Button>
              
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white/90"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Combat Inventory Panel */}
          {showInventory && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 right-4 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-600/50 p-4 z-10 w-80"
            >
              <h3 className="text-lg font-semibold text-white mb-3">Combat Items</h3>
              <div className="grid grid-cols-2 gap-3">
                {combatInventory.map(item => {
                  const isOnCooldown = itemCooldowns[item.id] > 0;
                  const canUse = item.quantity > 0 && !isOnCooldown;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => canUse && useCombatItem(item.id)}
                      disabled={!canUse}
                      className={`relative p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                        canUse 
                          ? 'border-blue-400/50 bg-blue-500/20 hover:bg-blue-500/30 text-white' 
                          : 'border-slate-600/50 bg-slate-700/50 text-slate-400 cursor-not-allowed'
                      }`}
                      whileHover={canUse ? { scale: 1.05 } : {}}
                      whileTap={canUse ? { scale: 0.95 } : {}}
                    >
                      <div className="text-2xl">{item.icon}</div>
                      <div className="text-xs text-center">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-slate-300">x{item.quantity}</div>
                      </div>
                      
                      {/* Cooldown overlay */}
                      {isOnCooldown && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                          <div className="text-xs text-white">
                            {Math.ceil((itemCooldowns[item.id] || 0) / 1000)}s
                          </div>
                        </div>
                      )}
                      
                      {/* Effect description */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-xs text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.healAmount && `+${item.healAmount} HP`}
                        {item.manaAmount && ` +${item.manaAmount} MP`}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col">
            {/* Intro Phase */}
            {gamePhase === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">Shadow Dungeon</h3>
                  <p className="text-slate-300 mb-6">
                    "This mana... it's different from usual gates." - Cha Hae-In
                  </p>
                  <div className="animate-pulse text-blue-400">
                    Preparing for combat...
                  </div>
                </div>
              </motion.div>
            )}

            {/* Combat Phase - Full Screen Battlefield */}
            {gamePhase === 'combat' && (
              <div 
                ref={battlefieldRef}
                onClick={handleBattlefieldTap}
                className="flex-1 relative cursor-crosshair bg-gradient-to-b from-slate-700/30 to-slate-800/50"
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
                      
                      {/* Health Bar */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-slate-600 rounded">
                        <div 
                          className="h-full bg-green-500 rounded transition-all duration-200"
                          style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                        ></div>
                      </div>
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
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-slate-600 rounded">
                        <div 
                          className="h-full bg-red-500 rounded transition-all duration-200"
                          style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                        ></div>
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
                        damage.isHealing 
                          ? 'text-green-400 text-lg' 
                          : damage.isCritical 
                          ? 'text-yellow-400 text-lg' 
                          : 'text-white text-sm'
                      }`}
                      style={{ left: damage.x, top: damage.y }}
                      initial={{ opacity: 1, y: 0, scale: 1 }}
                      animate={{ opacity: 0, y: -50, scale: 1.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2 }}
                    >
                      {damage.isHealing ? `+${damage.damage}` : `-${damage.damage}`}
                      {damage.isCritical && !damage.isHealing && '!'}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Room Clear Phase */}
            {gamePhase === 'room_clear' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">Room Cleared!</h3>
                  <p className="text-slate-300">
                    Moving to the next chamber...
                  </p>
                </div>
              </motion.div>
            )}

            {/* Complete Phase */}
            {gamePhase === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-center"
              >
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-yellow-400 mb-4">Victory!</h3>
                  <p className="text-slate-300 mb-8">
                    The Shadow Dungeon has been cleared successfully.
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

          {/* Action Bar - Always visible during combat */}
          {gamePhase === 'combat' && (
            <div className="p-4 border-t border-white/20 bg-slate-900/50">
              {/* Player Status */}
              <div className="flex gap-6 mb-4">
                {players.map(player => (
                  <div key={player.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${
                      player.id === 'jinwoo' ? 'bg-purple-600' : 'bg-yellow-600'
                    }`}></div>
                    <div>
                      <div className="text-xs text-slate-300">{player.name}</div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-400">HP: {player.health}/{player.maxHealth}</span>
                        <span className="text-blue-400">MP: {player.mana}/{player.maxMana}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="flex justify-center gap-4">
                {skills.map((skill, index) => {
                  const isOnCooldown = skillCooldowns[skill.id] > 0;
                  const jinwoo = players.find(p => p.id === 'jinwoo');
                  const canUse = jinwoo && jinwoo.mana >= skill.manaCost && !isOnCooldown;

                  return (
                    <motion.button
                      key={skill.id}
                      onClick={() => canUse && executeSkill(skill.id)}
                      disabled={!canUse}
                      className={`relative w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                        canUse
                          ? 'border-blue-400 bg-blue-400/30 hover:bg-blue-400/50'
                          : 'border-slate-600 bg-slate-700/50 opacity-50'
                      }`}
                      whileHover={canUse ? { scale: 1.05 } : {}}
                      whileTap={canUse ? { scale: 0.95 } : {}}
                    >
                      <skill.icon className={`w-6 h-6 ${canUse ? 'text-blue-300' : 'text-slate-500'}`} />
                      
                      <div className="absolute -top-2 -left-2 w-5 h-5 bg-slate-700 border border-slate-500 rounded-full flex items-center justify-center text-xs text-slate-300">
                        {index + 1}
                      </div>

                      {/* Cooldown overlay */}
                      {isOnCooldown && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                          <div className="text-xs text-white">
                            {Math.ceil((skillCooldowns[skill.id] || 0) / 1000)}s
                          </div>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}