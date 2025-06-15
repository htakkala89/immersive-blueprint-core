import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Shield, Zap, Heart, Target, Clock, 
  Flame, Wind, Skull, Star, Crown,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShadowSoldier {
  id: string;
  name: string;
  type: 'tank' | 'dps' | 'support';
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: string[];
  position: { x: number; y: number };
  isActive: boolean;
  cooldowns: Record<string, number>;
}

interface Enemy {
  id: string;
  name: string;
  type: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  position: { x: number; y: number };
  aggro: number;
  status: string[];
  attackCooldown: number;
  isElite: boolean;
  isBoss: boolean;
}

interface CombatAction {
  id: string;
  name: string;
  type: 'attack' | 'skill' | 'summon' | 'defend' | 'dodge';
  cooldown: number;
  manaCost: number;
  description: string;
  damage?: number;
  effects?: string[];
  icon: React.ReactNode;
}

interface EnhancedCombatSystemProps {
  isVisible: boolean;
  onClose: () => void;
  onCombatComplete: (result: { victory: boolean; rewards: any; experience: number }) => void;
  playerLevel: number;
  playerStats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    agility: number;
  };
  enemies: Enemy[];
  battleType: 'dungeon' | 'boss' | 'pvp' | 'training';
  chaHaeInPresent?: boolean;
}

export function EnhancedCombatSystem({
  isVisible,
  onClose,
  onCombatComplete,
  playerLevel,
  playerStats,
  enemies: initialEnemies,
  battleType,
  chaHaeInPresent = false
}: EnhancedCombatSystemProps): JSX.Element {
  // Combat State
  const [playerHp, setPlayerHp] = useState(playerStats.hp);
  const [playerMp, setPlayerMp] = useState(playerStats.mp);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [shadowSoldiers, setShadowSoldiers] = useState<ShadowSoldier[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [targetSelection, setTargetSelection] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
  const [combo, setCombo] = useState(0);
  const [actionCooldowns, setActionCooldowns] = useState<Record<string, number>>({});
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    type: 'damage' | 'heal' | 'critical';
    position: { x: number; y: number };
  }>>([]);
  const [cameraShake, setCameraShake] = useState(false);
  const [chaHaeInHp, setChaHaeInHp] = useState(100);
  const [chaHaeInMp, setChaHaeInMp] = useState(100);

  // Initialize combat when component becomes visible
  useEffect(() => {
    if (isVisible && initialEnemies.length > 0) {
      console.log('🎯 Initializing combat with enemies:', initialEnemies);
      setEnemies([...initialEnemies]);
      setPlayerHp(playerStats.hp);
      setPlayerMp(playerStats.mp);
      setBattlePhase('preparation');
      setTurn('player');
      setCombo(0);
      setActionCooldowns({});
      setShadowSoldiers([]);
      setCombatLog(['Battle begins! Choose your actions wisely.']);
      setDamageNumbers([]);
      setChaHaeInHp(100);
      setChaHaeInMp(100);
    }
  }, [isVisible, initialEnemies, playerStats]);

  // Combat Actions
  const combatActions: CombatAction[] = [
    {
      id: 'basic_attack',
      name: 'Strike',
      type: 'attack',
      cooldown: 0,
      manaCost: 0,
      description: 'Basic sword attack',
      damage: playerStats.attack,
      icon: <Sword className="w-5 h-5" />
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      type: 'skill',
      cooldown: 3,
      manaCost: 20,
      description: 'Instantly teleport behind target',
      damage: playerStats.attack * 1.5,
      effects: ['teleport', 'backstab'],
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'summon_igris',
      name: 'Summon Igris',
      type: 'summon',
      cooldown: 8,
      manaCost: 50,
      description: 'Summon the Red Knight',
      icon: <Crown className="w-5 h-5" />
    },
    {
      id: 'rulers_authority',
      name: "Ruler's Authority",
      type: 'skill',
      cooldown: 5,
      manaCost: 30,
      description: 'Telekinetic force attack',
      damage: playerStats.attack * 2,
      effects: ['knockback', 'stun'],
      icon: <Target className="w-5 h-5" />
    },
    {
      id: 'dodge_roll',
      name: 'Shadow Step',
      type: 'dodge',
      cooldown: 2,
      manaCost: 10,
      description: 'Quick evasive maneuver',
      effects: ['dodge', 'speed_boost'],
      icon: <Wind className="w-5 h-5" />
    },
    {
      id: 'defend',
      name: 'Defend',
      type: 'defend',
      cooldown: 0,
      manaCost: 0,
      description: 'Reduce incoming damage',
      effects: ['defense_boost'],
      icon: <Shield className="w-5 h-5" />
    }
  ];

  // Add damage number effect
  const addDamageNumber = useCallback((damage: number, type: 'damage' | 'heal' | 'critical', position: { x: number; y: number }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setDamageNumbers(prev => [...prev, { id, damage, type, position }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 2000);
  }, []);

  // Camera shake effect
  const triggerCameraShake = useCallback(() => {
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 500);
  }, []);

  // Execute player action
  const executeAction = useCallback((actionId: string, targetId?: string) => {
    console.log('🎯 Executing action:', actionId, 'on target:', targetId);
    const action = combatActions.find(a => a.id === actionId);
    if (!action) {
      console.log('❌ Action not found:', actionId);
      return;
    }
    if (actionCooldowns[actionId] > 0) {
      console.log('❌ Action on cooldown:', actionId, actionCooldowns[actionId]);
      return;
    }

    console.log('✅ Action executing:', action.name);

    // Set cooldown
    setActionCooldowns(prev => ({ ...prev, [actionId]: action.cooldown }));
    
    // Consume mana
    setPlayerMp(prev => Math.max(0, prev - action.manaCost));

    let logMessage = "";

    switch (action.type) {
      case 'attack':
      case 'skill':
        if (targetId) {
          console.log('🎯 Attacking target:', targetId);
          setEnemies(prev => {
            const newEnemies = prev.map(enemy => {
              if (enemy.id === targetId) {
                const damage = action.damage || 0;
                const actualDamage = Math.max(1, damage - enemy.defense);
                const isCritical = Math.random() < 0.15;
                const finalDamage = isCritical ? actualDamage * 2 : actualDamage;
                
                console.log(`💥 Damage calculated: ${finalDamage} (${isCritical ? 'CRITICAL' : 'normal'})`);
                
                addDamageNumber(finalDamage, isCritical ? 'critical' : 'damage', enemy.position);
                triggerCameraShake();
                
                logMessage = `${action.name} hits ${enemy.name} for ${finalDamage} damage${isCritical ? ' (Critical!)' : ''}`;
                
                return {
                  ...enemy,
                  hp: Math.max(0, enemy.hp - finalDamage)
                };
              }
              return enemy;
            });
            console.log('🔄 Updated enemies:', newEnemies);
            return newEnemies;
          });
        } else {
          console.log('❌ No target provided for attack action');
          logMessage = `${action.name} - No target selected!`;
        }
        break;

      case 'summon':
        if (actionId === 'summon_igris') {
          const igris: ShadowSoldier = {
            id: 'igris',
            name: 'Igris',
            type: 'tank',
            level: playerLevel,
            hp: 150,
            maxHp: 150,
            mp: 50,
            maxMp: 50,
            attack: 45,
            defense: 35,
            speed: 25,
            skills: ['flame_slash', 'taunt'],
            position: { x: 200, y: 300 },
            isActive: true,
            cooldowns: {}
          };
          setShadowSoldiers(prev => [...prev.filter(s => s.id !== 'igris'), igris]);
          logMessage = "Igris rises from the shadows!";
        }
        break;

      case 'dodge':
        logMessage = "You dodge with shadow step!";
        break;

      case 'defend':
        logMessage = "You take a defensive stance!";
        break;
    }

    setCombatLog(prev => [...prev, logMessage].slice(-5));
    setCombo(prev => prev + 1);
    
    // Switch to enemy turn after a delay
    setTimeout(() => {
      setTurn('enemy');
    }, 1000);
  }, [combatActions, actionCooldowns, playerLevel, addDamageNumber, triggerCameraShake]);

  // Enemy AI turn
  useEffect(() => {
    if (turn === 'enemy' && battlePhase === 'combat') {
      const activeEnemies = enemies.filter(e => e.hp > 0);
      
      activeEnemies.forEach((enemy, index) => {
        setTimeout(() => {
          if (enemy.attackCooldown <= 0) {
            const damage = Math.max(1, enemy.attack - playerStats.defense);
            setPlayerHp(prev => Math.max(0, prev - damage));
            addDamageNumber(damage, 'damage', { x: 100, y: 200 });
            triggerCameraShake();
            
            setCombatLog(prev => [...prev, `${enemy.name} attacks for ${damage} damage!`].slice(-5));
            
            setEnemies(prev => prev.map(e => 
              e.id === enemy.id ? { ...e, attackCooldown: 2 } : e
            ));
          }
        }, index * 800);
      });

      setTimeout(() => {
        setTurn('player');
        // Reduce cooldowns
        setActionCooldowns(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            updated[key] = Math.max(0, updated[key] - 1);
          });
          return updated;
        });
        
        setEnemies(prev => prev.map(enemy => ({
          ...enemy,
          attackCooldown: Math.max(0, enemy.attackCooldown - 1)
        })));
      }, activeEnemies.length * 800 + 1000);
    }
  }, [turn, battlePhase, enemies, playerStats.defense, addDamageNumber, triggerCameraShake]);

  // Check win/loss conditions
  useEffect(() => {
    if (battlePhase === 'combat') {
      const aliveEnemies = enemies.filter(e => e.hp > 0);
      
      if (aliveEnemies.length === 0 && enemies.length > 0) {
        setBattlePhase('victory');
        setTimeout(() => {
          onCombatComplete({
            victory: true,
            rewards: { gold: 500, items: ['Rare Crystal'] },
            experience: 200
          });
        }, 2000);
      } else if (playerHp <= 0) {
        setBattlePhase('defeat');
        setTimeout(() => {
          onCombatComplete({
            victory: false,
            rewards: {},
            experience: 50
          });
        }, 2000);
      }
    }
  }, [enemies, playerHp, battlePhase, onCombatComplete]);

  // Cha Hae-In combo attacks
  const chaHaeInComboAttack = useCallback((targetId: string) => {
    if (!chaHaeInPresent || chaHaeInMp < 30) return;

    setChaHaeInMp(prev => prev - 30);
    
    setEnemies(prev => prev.map(enemy => {
      if (enemy.id === targetId) {
        const damage = 80; // Cha Hae-In's attack
        addDamageNumber(damage, 'critical', enemy.position);
        triggerCameraShake();
        
        setCombatLog(prev => [...prev, `Cha Hae-In's sword dance hits ${enemy.name} for ${damage} damage!`].slice(-5));
        
        return {
          ...enemy,
          hp: Math.max(0, enemy.hp - damage)
        };
      }
      return enemy;
    }));
  }, [chaHaeInPresent, chaHaeInMp, addDamageNumber, triggerCameraShake]);

  if (!isVisible) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black flex flex-col z-50 ${cameraShake ? 'animate-pulse' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(15,23,42,0.9))',
        transform: cameraShake ? 'translate(2px, 2px)' : 'none',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Battle HUD */}
      <div className="flex justify-between items-start p-6 relative z-20">
        {/* Player Stats */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <h3 className="text-white font-bold mb-2">Jin-Woo</h3>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm text-white mb-1">
                <span>HP</span>
                <span>{playerHp}/{playerStats.maxHp}</span>
              </div>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-red-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-white mb-1">
                <span>MP</span>
                <span>{playerMp}/{playerStats.maxMp}</span>
              </div>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-400">
            Combo: {combo}
          </div>
        </div>

        {/* Cha Hae-In Stats (if present) */}
        {chaHaeInPresent && (
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-purple-400/30">
            <h3 className="text-white font-bold mb-2">Cha Hae-In</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>HP</span>
                  <span>{chaHaeInHp}/100</span>
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-pink-500"
                    animate={{ width: `${chaHaeInHp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-white mb-1">
                  <span>MP</span>
                  <span>{chaHaeInMp}/100</span>
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-cyan-500"
                    animate={{ width: `${chaHaeInMp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                const aliveEnemies = enemies.filter(e => e.hp > 0);
                if (aliveEnemies.length > 0) {
                  chaHaeInComboAttack(aliveEnemies[0].id);
                }
              }}
              disabled={chaHaeInMp < 30 || turn !== 'player'}
              className="mt-2 text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700"
            >
              Combo Attack
            </Button>
          </div>
        )}

        {/* Turn Indicator */}
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
          <div className={`text-xl font-bold ${turn === 'player' ? 'text-green-400' : 'text-red-400'}`}>
            {turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
          </div>
          {battlePhase === 'preparation' && (
            <div className="flex gap-2 mt-2">
              <Button
                onClick={() => {
                  console.log('🚀 Start Battle clicked! Changing phase from', battlePhase, 'to combat');
                  setBattlePhase('combat');
                  console.log('✅ Battle phase changed to combat');
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Battle
              </Button>
              <Button
                onClick={() => {
                  // Reset combat completely
                  setEnemies([...initialEnemies]);
                  setPlayerHp(playerStats.hp);
                  setPlayerMp(playerStats.mp);
                  setBattlePhase('preparation');
                  setTurn('player');
                  setCombo(0);
                  setActionCooldowns({});
                  setShadowSoldiers([]);
                  setCombatLog(['Battle reset! Choose your actions wisely.']);
                  setDamageNumbers([]);
                  setChaHaeInHp(100);
                  setChaHaeInMp(100);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reset Battle
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23141B2D"/><stop offset="100%" style="stop-color:%23000000"/></linearGradient></defs><rect width="1000" height="600" fill="url(%23bg)"/><circle cx="200" cy="300" r="50" fill="rgba(59,130,246,0.1)"/><circle cx="800" cy="200" r="30" fill="rgba(239,68,68,0.1)"/></svg>')`,
          }}
        />

        {/* Damage Numbers */}
        <AnimatePresence>
          {damageNumbers.map((damage) => (
            <motion.div
              key={damage.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -60, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className={`absolute font-bold text-2xl pointer-events-none z-30 ${
                damage.type === 'critical' ? 'text-yellow-400' : 
                damage.type === 'heal' ? 'text-green-400' : 'text-red-400'
              }`}
              style={{
                left: damage.position.x,
                top: damage.position.y,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {damage.type === 'heal' ? '+' : '-'}{damage.damage}
              {damage.type === 'critical' && <Star className="inline w-4 h-4 ml-1" />}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Player Character */}
        <motion.div
          className="absolute bottom-20 left-20 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white/30"
          animate={{ 
            scale: turn === 'player' ? 1.1 : 1,
            boxShadow: turn === 'player' ? '0 0 20px rgba(59,130,246,0.8)' : '0 0 10px rgba(59,130,246,0.4)'
          }}
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,1))',
          }}
        >
          <Sword className="w-8 h-8 text-white" />
        </motion.div>

        {/* Cha Hae-In (if present) */}
        {chaHaeInPresent && (
          <motion.div
            className="absolute bottom-20 left-40 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center border-4 border-white/30"
            animate={{ 
              scale: chaHaeInMp >= 30 ? 1.1 : 1,
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(147,51,234,0.9), rgba(126,34,206,1))',
            }}
          >
            <Flame className="w-8 h-8 text-white" />
          </motion.div>
        )}

        {/* Shadow Soldiers */}
        <AnimatePresence>
          {shadowSoldiers.map((soldier) => (
            <motion.div
              key={soldier.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center border-2 border-red-500"
              style={{
                left: soldier.position.x,
                top: soldier.position.y,
                background: 'linear-gradient(135deg, rgba(75,85,99,0.9), rgba(55,65,81,1))',
              }}
            >
              <Crown className="w-6 h-6 text-red-400" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Enemies */}
        <AnimatePresence>
          {enemies.map((enemy) => enemy.hp > 0 && (
            <motion.div
              key={enemy.id}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ 
                opacity: enemy.hp > 0 ? 1 : 0,
                scale: enemy.hp > 0 ? 1 : 0.5,
                x: targetSelection === enemy.id ? [0, -5, 5, -5, 5, 0] : 0
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute cursor-pointer group ${
                targetSelection === enemy.id ? 'ring-4 ring-red-400' : ''
              }`}
              style={{
                left: enemy.position.x,
                top: enemy.position.y,
                zIndex: 20
              }}
              onClick={() => {
                console.log('🎯 Enemy clicked:', enemy.id, 'Turn:', turn, 'Selected action:', selectedAction, 'Battle phase:', battlePhase);
                if (turn === 'player' && selectedAction && battlePhase === 'combat') {
                  console.log('✅ Executing attack on enemy:', enemy.id);
                  setTargetSelection(enemy.id);
                  executeAction(selectedAction, enemy.id);
                  setSelectedAction(null);
                  setTargetSelection(null);
                } else {
                  console.log('❌ Cannot attack - conditions not met');
                  if (turn !== 'player') console.log('Not player turn');
                  if (!selectedAction) console.log('No action selected');
                  if (battlePhase !== 'combat') console.log('Not in combat phase');
                }
              }}
            >
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                  enemy.isBoss ? 'border-yellow-400 bg-gradient-to-br from-red-700 to-red-900' :
                  enemy.isElite ? 'border-purple-400 bg-gradient-to-br from-purple-700 to-purple-900' :
                  'border-red-400 bg-gradient-to-br from-red-600 to-red-800'
                }`}
                style={{
                  boxShadow: enemy.isBoss ? '0 0 20px rgba(234,179,8,0.6)' : 
                             enemy.isElite ? '0 0 15px rgba(147,51,234,0.6)' :
                             '0 0 10px rgba(239,68,68,0.6)'
                }}
              >
                {enemy.isBoss ? <Crown className="w-8 h-8 text-yellow-400" /> :
                 enemy.isElite ? <Star className="w-8 h-8 text-purple-400" /> :
                 <Skull className="w-8 h-8 text-red-400" />}
              </div>
              
              {/* Enemy HP Bar */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20">
                <div className="text-xs text-white text-center mb-1">{enemy.name}</div>
                <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-red-500"
                    animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Action Bar */}
      <div className="bg-black/60 backdrop-blur-lg border-t border-white/20 p-4">
        {/* TEST BUTTON - Remove after debugging */}
        <div className="flex justify-center mb-2">
          <button 
            onClick={() => console.log('🚨 TEST BUTTON CLICKED!')}
            className="bg-red-500 text-white px-4 py-2 rounded font-bold"
            style={{ zIndex: 9999 }}
          >
            TEST CLICK
          </button>
        </div>

        <div className="flex justify-center space-x-4 mb-4 relative z-10">
          {combatActions.map((action, index) => (
            <div
              key={`${action.id}-${index}`}
              onClick={() => {
                console.log('DIV CLICKED:', action.name, action.id);
                if (action.type === 'attack' || action.type === 'skill') {
                  setSelectedAction(action.id);
                  console.log('Action selected:', action.id);
                } else {
                  executeAction(action.id);
                }
              }}
              className={`relative px-6 py-3 bg-gradient-to-br cursor-pointer ${
                selectedAction === action.id 
                  ? 'from-blue-600 to-blue-800 ring-2 ring-blue-400' 
                  : 'from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800'
              } text-white border border-white/20 transition-all duration-200 rounded`}
              style={{ zIndex: 999, position: 'relative' }}
            >
              <div className="flex items-center space-x-2 pointer-events-none">
                {action.icon}
                <span className="font-medium">{action.name}</span>
              </div>
              {action.manaCost > 0 && (
                <div className="text-xs text-blue-300 mt-1 pointer-events-none">
                  MP: {action.manaCost}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Combat Log */}
        <div className="bg-black/40 rounded-lg p-3 max-h-24 overflow-y-auto">
          <div className="text-sm text-gray-300 space-y-1">
            {combatLog.map((log, index) => (
              <div key={index} className="opacity-80">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Battle Result Overlay */}
      <AnimatePresence>
        {(battlePhase === 'victory' || battlePhase === 'defeat') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-center p-8 rounded-2xl border-4 ${
                battlePhase === 'victory' 
                  ? 'border-green-400 bg-gradient-to-br from-green-900/50 to-green-800/50' 
                  : 'border-red-400 bg-gradient-to-br from-red-900/50 to-red-800/50'
              } backdrop-blur-lg`}
            >
              <h2 className={`text-6xl font-bold mb-4 ${
                battlePhase === 'victory' ? 'text-green-400' : 'text-red-400'
              }`}>
                {battlePhase === 'victory' ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-xl text-white">
                {battlePhase === 'victory' 
                  ? 'The shadows grow stronger...' 
                  : 'The darkness claims another victim...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}