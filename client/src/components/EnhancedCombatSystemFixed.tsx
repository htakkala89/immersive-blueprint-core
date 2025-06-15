import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Crown, Heart, Zap, Star, Sword, Shield, Target, Wind, Skull
} from 'lucide-react';

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  isBoss?: boolean;
  isElite?: boolean;
}

interface DamageNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'mp';
}

interface EnhancedCombatSystemProps {
  isVisible: boolean;
  onClose: () => void;
  initialEnemies?: Enemy[];
  playerStats?: { maxHp: number; maxMp: number };
}

export function EnhancedCombatSystemFixed({
  isVisible,
  onClose,
  initialEnemies = [
    { id: '1', name: 'Shadow Beast', hp: 100, maxHp: 100 },
    { id: '2', name: 'Ice Golem', hp: 150, maxHp: 150, isElite: true },
    { id: '3', name: 'Demon King', hp: 300, maxHp: 300, isBoss: true }
  ],
  playerStats = { maxHp: 100, maxMp: 100 }
}: EnhancedCombatSystemProps) {
  // Combat State
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  
  // Player State
  const [playerLevel] = useState(85);
  const [playerHp, setPlayerHp] = useState(playerStats.maxHp);
  const [playerMp, setPlayerMp] = useState(playerStats.maxMp);
  const [combo, setCombo] = useState(0);
  
  // Solo Leveling Features
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [shadowSoldiers, setShadowSoldiers] = useState<Array<{id: string; name: string; type: string}>>([]);
  const [showPowerAura, setShowPowerAura] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [cameraShake, setCameraShake] = useState(false);

  // Execute combat action with Solo Leveling flair
  const executeAction = useCallback((action: string, targetId: string) => {
    const target = enemies.find(e => e.id === targetId);
    if (!target || target.hp <= 0) return;

    let damage = 0;
    let mpCost = 0;
    let logMessage = '';
    let powerLevel = 1;

    switch (action) {
      case 'basic_attack':
        damage = Math.floor(Math.random() * 40) + 30;
        logMessage = `Jin-Woo's overwhelming presence crushes the enemy!`;
        powerLevel = 1;
        break;
      case 'shadow_exchange':
        damage = Math.floor(Math.random() * 60) + 50;
        mpCost = 20;
        logMessage = `"Shadow Exchange!" Jin-Woo materializes behind the enemy in a flash of darkness!`;
        powerLevel = 2;
        break;
      case 'summon_igris':
        damage = Math.floor(Math.random() * 100) + 80;
        mpCost = 50;
        logMessage = `"ARISE!" The Blood-Red Commander emerges from shadow!`;
        powerLevel = 4;
        setShadowSoldiers(prev => {
          if (!prev.find(s => s.id === 'igris')) {
            return [...prev, { id: 'igris', name: 'Igris', type: 'Knight Commander' }];
          }
          return prev;
        });
        break;
      case 'rulers_authority':
        damage = Math.floor(Math.random() * 80) + 60;
        mpCost = 30;
        logMessage = `"Ruler's Authority!" Invisible force tears through the enemy!`;
        powerLevel = 3;
        setShowPowerAura(true);
        setTimeout(() => setShowPowerAura(false), 1200);
        break;
      case 'shadow_step':
        damage = Math.floor(Math.random() * 50) + 35;
        mpCost = 10;
        logMessage = `Jin-Woo moves like living shadow, striking with precision!`;
        powerLevel = 2;
        break;
      case 'defend':
        const healAmount = 30;
        setPlayerHp(prev => Math.min(prev + healAmount, playerStats.maxHp));
        logMessage = `Jin-Woo channels his S-Rank vitality, recovering health.`;
        setCombatLog(prev => [...prev.slice(-2), logMessage]);
        return;
    }

    if (playerMp < mpCost) return;

    // Apply damage
    setEnemies(prev => prev.map(enemy => 
      enemy.id === targetId 
        ? { ...enemy, hp: Math.max(0, enemy.hp - damage) }
        : enemy
    ));

    // Consume MP
    setPlayerMp(prev => Math.max(0, prev - mpCost));

    // Add epic damage number
    const damageNumber: DamageNumber = {
      id: Date.now().toString(),
      value: damage,
      x: Math.random() * 300 + 150,
      y: Math.random() * 200 + 100,
      type: powerLevel >= 3 ? 'heal' : 'damage' // Gold for high power attacks
    };
    setDamageNumbers(prev => [...prev, damageNumber]);

    // Remove damage number after animation
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== damageNumber.id));
    }, 2000);

    // Enhanced camera shake for power
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), powerLevel * 150 + 200);

    // Power scaling combo
    setCombo(prev => prev + powerLevel);
    
    // Add to combat log
    setCombatLog(prev => [...prev.slice(-2), logMessage]);
  }, [enemies, playerMp, playerStats.maxHp]);

  // Check for battle end
  useEffect(() => {
    const allEnemiesDefeated = enemies.every(enemy => enemy.hp <= 0);
    if (allEnemiesDefeated && battlePhase === 'combat') {
      setBattlePhase('victory');
    } else if (playerHp <= 0 && battlePhase === 'combat') {
      setBattlePhase('defeat');
    }
  }, [enemies, playerHp, battlePhase]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black flex flex-col z-50 ${cameraShake ? 'animate-pulse' : ''}`}
      style={{
        background: showPowerAura 
          ? 'linear-gradient(135deg, rgba(147,51,234,0.3), rgba(79,70,229,0.2), rgba(0,0,0,0.95))'
          : 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(15,23,42,0.9))',
        transform: cameraShake ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : 'none',
        transition: 'all 0.1s ease-out'
      }}
    >
      {/* S-Rank Hunter Status Bar */}
      <div className="bg-black/90 backdrop-blur-xl border-b border-purple-400/30 z-30">
        <div className="p-3 md:p-4">
          {/* Mobile: Compact Layout */}
          <div className="flex flex-col space-y-3 md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Shadow Monarch</div>
                  <div className="text-yellow-400 text-xs font-medium">S-Rank Hunter • Lv.{playerLevel}</div>
                </div>
              </div>
              <div className="text-xs text-green-400 font-bold">
                {battlePhase === 'preparation' ? 'PREPARE' : turn === 'player' ? 'DOMINATE' : 'INCOMING'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-red-300 font-medium">Vitality</span>
                  <span className="text-white font-bold">{playerHp}/{playerStats.maxHp}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-red-400/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 via-red-500 to-red-400"
                    animate={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)' }}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-300 font-medium">Mana</span>
                  <span className="text-white font-bold">{playerMp}/{playerStats.maxMp}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-blue-400/30">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400"
                    animate={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)' }}
                  />
                </div>
              </div>
            </div>

            {combo > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm font-bold">Power Level: {combo}</span>
                <Star className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            )}

            {battlePhase === 'preparation' && (
              <Button
                onClick={() => setBattlePhase('combat')}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 text-base"
              >
                ENTER BATTLE
              </Button>
            )}
          </div>

          {/* Desktop: Full Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-yellow-400/50">
                  <Crown className="w-7 h-7 text-yellow-300" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">Shadow Monarch</div>
                  <div className="text-yellow-400 text-sm">S-Rank Hunter • Level {playerLevel}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <div className="space-y-1">
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-red-400/30">
                      <motion.div
                        className="h-full bg-gradient-to-r from-red-600 to-red-400"
                        animate={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)' }}
                      />
                    </div>
                    <span className="text-white text-xs font-bold">{playerHp}/{playerStats.maxHp}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <div className="space-y-1">
                    <div className="w-32 h-3 bg-gray-800 rounded-full overflow-hidden border border-blue-400/30">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                        animate={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)' }}
                      />
                    </div>
                    <span className="text-white text-xs font-bold">{playerMp}/{playerStats.maxMp}</span>
                  </div>
                </div>

                {combo > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                    <span className="text-yellow-400 text-lg font-bold">x{combo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {battlePhase === 'preparation' ? (
                <Button
                  onClick={() => setBattlePhase('combat')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-8 py-3 text-lg"
                >
                  ENTER BATTLE
                </Button>
              ) : (
                <div className="text-green-400 font-bold text-lg">
                  {turn === 'player' ? 'DOMINATE' : 'INCOMING ATTACK'}
                </div>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10"
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 relative overflow-hidden">
        {/* Dynamic Background */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          showPowerAura 
            ? 'bg-gradient-to-b from-purple-900/60 via-blue-900/40 to-black' 
            : 'bg-gradient-to-b from-gray-900 via-slate-800 to-black'
        }`} />
        
        {/* Power Aura Effect */}
        {showPowerAura && (
          <motion.div 
            className="absolute inset-0 bg-gradient-radial from-purple-500/30 via-blue-500/20 to-transparent"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        )}

        {/* Enemy Display */}
        <div className="h-full flex flex-col">
          {/* Mobile: Vertical Stack */}
          <div className="md:hidden flex-1 overflow-y-auto py-4 px-3 space-y-4">
            {enemies.map((enemy) => (
              <motion.div
                key={enemy.id}
                className={`bg-black/80 backdrop-blur-lg rounded-xl p-4 border-2 transition-all duration-300 ${
                  selectedAction 
                    ? 'border-red-400 bg-red-500/10 shadow-lg shadow-red-500/20 cursor-pointer' 
                    : 'border-white/20'
                }`}
                onClick={() => {
                  if (turn === 'player' && selectedAction && battlePhase === 'combat') {
                    executeAction(selectedAction, enemy.id);
                    setSelectedAction(null);
                  }
                }}
                whileTap={{ scale: 0.98 }}
                animate={enemy.hp <= 0 ? { opacity: 0.5, scale: 0.95 } : {}}
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                      enemy.isBoss ? 'border-yellow-400 bg-gradient-to-br from-red-600 via-red-700 to-black' :
                      enemy.isElite ? 'border-purple-400 bg-gradient-to-br from-purple-600 via-purple-800 to-black' :
                      'border-red-400 bg-gradient-to-br from-gray-600 via-gray-800 to-black'
                    }`}
                    style={{
                      boxShadow: enemy.isBoss ? '0 0 20px rgba(234,179,8,0.8)' : 
                                 enemy.isElite ? '0 0 15px rgba(147,51,234,0.8)' :
                                 '0 0 10px rgba(239,68,68,0.6)'
                    }}
                  >
                    {enemy.isBoss ? <Crown className="w-8 h-8 text-yellow-300" /> :
                     enemy.isElite ? <Star className="w-7 h-7 text-purple-300" /> :
                     <Skull className="w-7 h-7 text-red-300" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-bold text-lg truncate">{enemy.name}</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded ${
                        enemy.isBoss ? 'bg-yellow-500/20 text-yellow-400' : 
                        enemy.isElite ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {enemy.isBoss ? 'BOSS' : enemy.isElite ? 'ELITE' : 'ENEMY'}
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 mb-2">
                      <motion.div
                        className={`h-full ${
                          enemy.isBoss ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-red-600' :
                          enemy.isElite ? 'bg-gradient-to-r from-purple-400 via-red-500 to-red-600' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.3)' }}
                      />
                    </div>
                    <div className="text-gray-200 text-sm font-medium">
                      {enemy.hp > 0 ? `${enemy.hp}/${enemy.maxHp} HP` : 'DEFEATED'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:flex items-center justify-center h-full px-8 py-12">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
              {enemies.map((enemy) => (
                <motion.div
                  key={enemy.id}
                  className={`relative cursor-pointer transform transition-all duration-300 ${
                    selectedAction ? 'ring-4 ring-red-400 scale-105 shadow-2xl' : 'hover:scale-105'
                  }`}
                  onClick={() => {
                    if (turn === 'player' && selectedAction && battlePhase === 'combat') {
                      executeAction(selectedAction, enemy.id);
                      setSelectedAction(null);
                    }
                  }}
                  whileHover={{ y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  animate={enemy.hp <= 0 ? { opacity: 0.5, scale: 0.9 } : {}}
                >
                  <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-white/20">
                    <div 
                      className={`w-40 h-40 mx-auto rounded-full flex items-center justify-center border-4 mb-4 ${
                        enemy.isBoss ? 'border-yellow-400 bg-gradient-to-br from-red-600 via-red-700 to-black' :
                        enemy.isElite ? 'border-purple-400 bg-gradient-to-br from-purple-600 via-purple-800 to-black' :
                        'border-red-400 bg-gradient-to-br from-gray-600 via-gray-800 to-black'
                      }`}
                      style={{
                        boxShadow: enemy.isBoss ? '0 0 40px rgba(234,179,8,1), inset 0 0 30px rgba(0,0,0,0.5)' : 
                                   enemy.isElite ? '0 0 35px rgba(147,51,234,1), inset 0 0 25px rgba(0,0,0,0.5)' :
                                   '0 0 25px rgba(239,68,68,1), inset 0 0 20px rgba(0,0,0,0.5)'
                      }}
                    >
                      {enemy.isBoss ? <Crown className="w-20 h-20 text-yellow-300" /> :
                       enemy.isElite ? <Star className="w-18 h-18 text-purple-300" /> :
                       <Skull className="w-18 h-18 text-red-300" />}
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl text-white font-bold mb-2">{enemy.name}</div>
                      <div className={`text-sm mb-4 px-3 py-1 rounded-full inline-block ${
                        enemy.isBoss ? 'bg-yellow-500/20 text-yellow-400' : 
                        enemy.isElite ? 'bg-purple-500/20 text-purple-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {enemy.isBoss ? 'BOSS MONSTER' : enemy.isElite ? 'ELITE MONSTER' : 'REGULAR MONSTER'}
                      </div>
                      
                      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 mb-3">
                        <motion.div
                          className={`h-full ${
                            enemy.isBoss ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-red-600' :
                            enemy.isElite ? 'bg-gradient-to-r from-purple-400 via-red-500 to-red-600' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          style={{ boxShadow: 'inset 0 0 10px rgba(255,255,255,0.4)' }}
                        />
                      </div>
                      <div className="text-gray-200 font-bold">
                        {enemy.hp > 0 ? `${enemy.hp}/${enemy.maxHp} HP` : 'DEFEATED'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shadow Army Display */}
      {shadowSoldiers.length > 0 && (
        <motion.div 
          className="absolute top-4 left-4 z-40"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black/90 backdrop-blur-lg rounded-lg p-4 border border-purple-400/50 min-w-[220px]">
            <div className="text-purple-300 text-sm font-bold mb-3 flex items-center">
              <Crown className="w-5 h-5 mr-2" />
              Shadow Army Active
            </div>
            <div className="space-y-2">
              {shadowSoldiers.map((soldier) => (
                <motion.div 
                  key={soldier.id} 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">{soldier.name}</span>
                  <span className="text-purple-300 text-xs">({soldier.type})</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-purple-400/30 z-30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-bold text-lg">Shadow Monarch Arts</h3>
            {selectedAction && (
              <div className="text-purple-400 text-sm font-medium">
                {selectedAction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Selected
              </div>
            )}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex space-x-3 overflow-x-auto pb-3">
              {[
                { id: 'basic_attack', icon: Sword, name: 'Strike', cost: 0 },
                { id: 'shadow_exchange', icon: Zap, name: 'Shadow', cost: 20 },
                { id: 'summon_igris', icon: Crown, name: 'Igris', cost: 50 },
                { id: 'rulers_authority', icon: Target, name: "Ruler's", cost: 30 },
                { id: 'shadow_step', icon: Wind, name: 'Step', cost: 10 },
                { id: 'defend', icon: Shield, name: 'Defend', cost: 0 }
              ].map((action) => (
                <motion.button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  disabled={action.cost > 0 && playerMp < action.cost}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 ${
                    selectedAction === action.id
                      ? 'bg-purple-600/80 border-purple-400 text-white shadow-lg shadow-purple-500/50'
                      : action.cost > 0 && playerMp < action.cost
                      ? 'bg-gray-900/50 border-gray-700 text-gray-500'
                      : 'bg-gray-800/70 border-gray-600 text-gray-300 hover:border-purple-400/50'
                  }`}
                  whileTap={action.cost === 0 || playerMp >= action.cost ? { scale: 0.95 } : {}}
                >
                  <div className="flex flex-col items-center justify-center h-full space-y-1">
                    <action.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{action.name}</span>
                    {action.cost > 0 && (
                      <span className="text-xs text-blue-400">{action.cost}</span>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {[
              { id: 'basic_attack', icon: Sword, name: 'Shadow Strike', desc: 'Overwhelming Force', cost: 0 },
              { id: 'shadow_exchange', icon: Zap, name: 'Shadow Exchange', desc: 'Instant Teleport', cost: 20 },
              { id: 'summon_igris', icon: Crown, name: 'Summon Igris', desc: 'Blood-Red Commander', cost: 50 },
              { id: 'rulers_authority', icon: Target, name: "Ruler's Authority", desc: 'Telekinetic Power', cost: 30 },
              { id: 'shadow_step', icon: Wind, name: 'Shadow Step', desc: 'Lightning Speed', cost: 10 },
              { id: 'defend', icon: Shield, name: 'S-Rank Defense', desc: 'Recover Vitality', cost: 0 }
            ].map((action) => (
              <motion.button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                disabled={action.cost > 0 && playerMp < action.cost}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedAction === action.id
                    ? 'bg-purple-600/80 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                    : action.cost > 0 && playerMp < action.cost
                    ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-purple-400/50'
                }`}
                whileHover={action.cost === 0 || playerMp >= action.cost ? { scale: 1.02 } : {}}
                whileTap={action.cost === 0 || playerMp >= action.cost ? { scale: 0.98 } : {}}
              >
                <div className="flex flex-col items-center space-y-2">
                  <action.icon className="w-6 h-6" />
                  <span className="font-bold text-sm">{action.name}</span>
                  <span className="text-xs opacity-70">{action.desc}</span>
                  {action.cost > 0 && (
                    <span className="text-xs text-blue-400 font-medium">{action.cost} MP</span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Combat Log */}
          {combatLog.length > 0 && (
            <div className="mt-4 bg-black/60 backdrop-blur-lg rounded-lg p-3 border border-purple-400/30">
              <div className="text-purple-300 text-xs font-bold mb-2">System Messages</div>
              <div className="text-gray-200 space-y-1 max-h-16 overflow-y-auto">
                {combatLog.slice(-3).map((log, index) => (
                  <div key={index} className="text-xs leading-relaxed opacity-90">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Damage Numbers */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {damageNumbers.map((damage) => (
            <motion.div
              key={damage.id}
              initial={{ opacity: 1, y: 0, scale: 1.2 }}
              animate={{ 
                opacity: 0, 
                y: -80, 
                scale: 1.5,
                x: (Math.random() - 0.5) * 100
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className={`absolute text-3xl font-black pointer-events-none ${
                damage.type === 'damage' ? 'text-red-400' :
                damage.type === 'heal' ? 'text-yellow-400' :
                'text-blue-400'
              }`}
              style={{
                left: `${damage.x}px`,
                top: `${damage.y}px`,
                textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              {damage.type === 'damage' ? '-' : '+'}
              {damage.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Battle Result */}
      <AnimatePresence>
        {(battlePhase === 'victory' || battlePhase === 'defeat') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              className="bg-black/95 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-400/50 text-center max-w-md mx-4"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h2 className={`text-4xl font-bold mb-4 ${
                battlePhase === 'victory' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {battlePhase === 'victory' ? '👑 ABSOLUTE VICTORY!' : '💀 DEFEAT'}
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                {battlePhase === 'victory' 
                  ? 'The Shadow Monarch reigns supreme!' 
                  : 'Even shadows can be overcome...'}
              </p>
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 text-lg"
              >
                Return to World
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}