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

export function EnhancedCombatSystemNew({
  isVisible,
  onClose,
  initialEnemies = [
    { id: '1', name: 'Shadow Beast', hp: 100, maxHp: 100 },
    { id: '2', name: 'Ice Golem', hp: 150, maxHp: 150, isElite: true },
    { id: '3', name: 'Fire Drake', hp: 200, maxHp: 200, isBoss: true }
  ],
  playerStats = { maxHp: 100, maxMp: 100 }
}: EnhancedCombatSystemProps) {
  // Combat State
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
  const [turn, setTurn] = useState<'player' | 'enemy'>('player');
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [targetSelection, setTargetSelection] = useState<string | null>(null);
  
  // Player State
  const [playerLevel] = useState(85);
  const [playerHp, setPlayerHp] = useState(playerStats.maxHp);
  const [playerMp, setPlayerMp] = useState(playerStats.maxMp);
  const [combo, setCombo] = useState(0);
  
  // UI State
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [cameraShake, setCameraShake] = useState(false);

  // Execute combat action
  const executeAction = useCallback((action: string, targetId: string) => {
    const target = enemies.find(e => e.id === targetId);
    if (!target || target.hp <= 0) return;

    let damage = 0;
    let mpCost = 0;

    switch (action) {
      case 'basic_attack':
        damage = Math.floor(Math.random() * 30) + 20;
        break;
      case 'shadow_exchange':
        damage = Math.floor(Math.random() * 50) + 40;
        mpCost = 20;
        break;
      case 'summon_igris':
        damage = Math.floor(Math.random() * 80) + 70;
        mpCost = 50;
        break;
      case 'rulers_authority':
        damage = Math.floor(Math.random() * 60) + 50;
        mpCost = 30;
        break;
      case 'shadow_step':
        damage = Math.floor(Math.random() * 40) + 30;
        mpCost = 10;
        break;
      case 'defend':
        // Heal instead of attack
        setPlayerHp(prev => Math.min(prev + 20, playerStats.maxHp));
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

    // Add damage number
    const damageNumber: DamageNumber = {
      id: Date.now().toString(),
      value: damage,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      type: 'damage'
    };
    setDamageNumbers(prev => [...prev, damageNumber]);

    // Remove damage number after animation
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== damageNumber.id));
    }, 1500);

    // Camera shake effect
    setCameraShake(true);
    setTimeout(() => setCameraShake(false), 200);

    // Increase combo
    setCombo(prev => prev + 1);
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
        background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(15,23,42,0.9))',
        transform: cameraShake ? 'translate(2px, 2px)' : 'none',
        transition: 'transform 0.1s ease-out'
      }}
    >
      {/* Mobile-First Top Status Bar */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 z-30">
        <div className="p-2 md:p-3">
          {/* Mobile: Stacked Layout */}
          <div className="flex flex-col space-y-2 md:hidden">
            {/* Player Name & Level */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold text-sm">Jin-Woo</span>
                <span className="text-yellow-400 text-xs">Lv.{playerLevel}</span>
              </div>
              {/* Battle Phase Indicator */}
              <div className="text-xs text-green-400 font-medium">
                {battlePhase === 'preparation' ? 'PREPARE' : turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN'}
              </div>
            </div>
            
            {/* Health & Mana Bars */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 flex items-center space-x-2">
                <Heart className="w-3 h-3 text-red-400" />
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    animate={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white text-xs min-w-[2rem]">{playerHp}</span>
              </div>
              
              <div className="flex-1 flex items-center space-x-2">
                <Zap className="w-3 h-3 text-blue-400" />
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                    animate={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white text-xs min-w-[2rem]">{playerMp}</span>
              </div>
              
              {combo > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">x{combo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">Jin-Woo</span>
                <span className="text-yellow-400 text-sm">Lv.{playerLevel}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-400" />
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                    animate={{ width: `${(playerHp / playerStats.maxHp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white text-xs font-medium">{playerHp}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                    animate={{ width: `${(playerMp / playerStats.maxMp) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-white text-xs font-medium">{playerMp}</span>
              </div>

              {combo > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">x{combo}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {battlePhase === 'preparation' ? (
                <Button
                  onClick={() => setBattlePhase('combat')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2"
                >
                  START BATTLE
                </Button>
              ) : (
                <div className="text-green-400 font-bold">
                  {turn === 'player' ? 'YOUR TURN' : 'ENEMY TURN'}
                </div>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10"
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Mobile Battle Controls */}
          <div className="md:hidden mt-2 flex justify-center">
            {battlePhase === 'preparation' && (
              <Button
                onClick={() => setBattlePhase('combat')}
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-2 rounded-lg"
              >
                START BATTLE
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-First Battle Arena */}
      <div className="flex-1 relative overflow-hidden">
        {/* Battle Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-black" />

        {/* Enemy Display Container */}
        <div className="h-full flex flex-col">
          {/* Mobile: Vertical Enemy Stack */}
          <div className="md:hidden flex-1 overflow-y-auto py-4 px-3 space-y-3">
            {enemies.map((enemy) => (
              <motion.div
                key={enemy.id}
                className={`bg-black/80 backdrop-blur-lg rounded-xl p-4 border-2 transition-all duration-300 ${
                  targetSelection === enemy.id 
                    ? 'border-red-400 bg-red-500/20 shadow-lg shadow-red-500/30' 
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => {
                  if (turn === 'player' && selectedAction && battlePhase === 'combat') {
                    setTargetSelection(enemy.id);
                    executeAction(selectedAction, enemy.id);
                    setSelectedAction(null);
                    setTargetSelection(null);
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  {/* Enemy Avatar */}
                  <div 
                    className={`w-20 h-20 rounded-full flex items-center justify-center border-3 flex-shrink-0 ${
                      enemy.isBoss ? 'border-yellow-400 bg-gradient-to-br from-yellow-600 via-red-700 to-red-900' :
                      enemy.isElite ? 'border-purple-400 bg-gradient-to-br from-purple-600 via-purple-800 to-purple-900' :
                      'border-red-400 bg-gradient-to-br from-red-500 via-red-700 to-red-800'
                    }`}
                    style={{
                      boxShadow: enemy.isBoss ? '0 0 25px rgba(234,179,8,0.8)' : 
                                 enemy.isElite ? '0 0 20px rgba(147,51,234,0.8)' :
                                 '0 0 15px rgba(239,68,68,0.8)'
                    }}
                  >
                    {enemy.isBoss ? <Crown className="w-10 h-10 text-yellow-300" /> :
                     enemy.isElite ? <Star className="w-9 h-9 text-purple-300" /> :
                     <Skull className="w-9 h-9 text-red-300" />}
                  </div>
                  
                  {/* Enemy Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-lg text-white font-bold truncate pr-2">{enemy.name}</div>
                      <div className={`text-sm font-medium ${
                        enemy.isBoss ? 'text-yellow-400' : enemy.isElite ? 'text-purple-400' : 'text-red-400'
                      }`}>
                        {enemy.isElite ? 'Elite' : enemy.isBoss ? 'Boss' : 'Regular'}
                      </div>
                    </div>
                    
                    {/* HP Bar */}
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 mb-1">
                      <motion.div
                        className={`h-full ${
                          enemy.isBoss ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                          enemy.isElite ? 'bg-gradient-to-r from-purple-400 to-red-500' :
                          'bg-gradient-to-r from-red-400 to-red-600'
                        }`}
                        animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ boxShadow: 'inset 0 0 8px rgba(255,255,255,0.2)' }}
                      />
                    </div>
                    <div className="text-sm text-gray-200 font-medium">
                      {enemy.hp}/{enemy.maxHp} HP
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:flex items-center justify-center h-full px-8 py-12">
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 xl:gap-12">
              {enemies.map((enemy) => (
                <motion.div
                  key={enemy.id}
                  className={`relative cursor-pointer transform transition-all duration-300 ${
                    targetSelection === enemy.id ? 'ring-4 ring-red-400 scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => {
                    if (turn === 'player' && selectedAction && battlePhase === 'combat') {
                      setTargetSelection(enemy.id);
                      executeAction(selectedAction, enemy.id);
                      setSelectedAction(null);
                      setTargetSelection(null);
                    }
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    {/* Enemy Avatar */}
                    <div 
                      className={`w-32 h-32 xl:w-40 xl:h-40 mx-auto rounded-full flex items-center justify-center border-4 mb-4 ${
                        enemy.isBoss ? 'border-yellow-400 bg-gradient-to-br from-yellow-600 via-red-700 to-red-900' :
                        enemy.isElite ? 'border-purple-400 bg-gradient-to-br from-purple-600 via-purple-800 to-purple-900' :
                        'border-red-400 bg-gradient-to-br from-red-500 via-red-700 to-red-800'
                      }`}
                      style={{
                        boxShadow: enemy.isBoss ? '0 0 40px rgba(234,179,8,1), inset 0 0 30px rgba(0,0,0,0.4)' : 
                                   enemy.isElite ? '0 0 35px rgba(147,51,234,1), inset 0 0 25px rgba(0,0,0,0.4)' :
                                   '0 0 30px rgba(239,68,68,1), inset 0 0 20px rgba(0,0,0,0.4)'
                      }}
                    >
                      {enemy.isBoss ? <Crown className="w-16 h-16 xl:w-20 xl:h-20 text-yellow-300" /> :
                       enemy.isElite ? <Star className="w-14 h-14 xl:w-18 xl:h-18 text-purple-300" /> :
                       <Skull className="w-14 h-14 xl:w-18 xl:h-18 text-red-300" />}
                    </div>
                    
                    {/* Enemy Info */}
                    <div className="text-center">
                      <div className="text-xl xl:text-2xl text-white font-bold mb-1">{enemy.name}</div>
                      <div className={`text-sm mb-3 ${
                        enemy.isBoss ? 'text-yellow-400' : enemy.isElite ? 'text-purple-400' : 'text-red-400'
                      }`}>
                        {enemy.isElite ? 'Elite Monster' : enemy.isBoss ? 'Boss Monster' : 'Regular Monster'}
                      </div>
                      
                      {/* HP Bar */}
                      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-600 mb-2">
                        <motion.div
                          className={`h-full ${
                            enemy.isBoss ? 'bg-gradient-to-r from-yellow-400 to-red-500' :
                            enemy.isElite ? 'bg-gradient-to-r from-purple-400 to-red-500' :
                            'bg-gradient-to-r from-red-400 to-red-600'
                          }`}
                          animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                          transition={{ duration: 0.3 }}
                          style={{ boxShadow: 'inset 0 0 10px rgba(255,255,255,0.3)' }}
                        />
                      </div>
                      <div className="text-sm text-gray-200 font-bold">
                        {enemy.hp}/{enemy.maxHp} HP
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-First Action Panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/20 z-30">
        <div className="p-3 md:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold text-base">Actions</h3>
            {selectedAction && (
              <div className="text-blue-400 text-xs">
                <span className="font-medium">{selectedAction.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              </div>
            )}
          </div>

          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <motion.button
                onClick={() => setSelectedAction('basic_attack')}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'basic_attack' 
                    ? 'bg-blue-600/80 border-blue-400 text-white' 
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Sword className="w-5 h-5" />
                  <span className="text-xs font-medium">Strike</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setSelectedAction('shadow_exchange')}
                disabled={playerMp < 20}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'shadow_exchange'
                    ? 'bg-blue-600/80 border-blue-400 text-white'
                    : playerMp < 20
                    ? 'bg-gray-900/50 border-gray-700 text-gray-500'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={playerMp >= 20 ? { scale: 0.95 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Zap className="w-5 h-5" />
                  <span className="text-xs font-medium">Shadow</span>
                  <span className="text-xs text-blue-400">20</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setSelectedAction('summon_igris')}
                disabled={playerMp < 50}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'summon_igris'
                    ? 'bg-blue-600/80 border-blue-400 text-white'
                    : playerMp < 50
                    ? 'bg-gray-900/50 border-gray-700 text-gray-500'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={playerMp >= 50 ? { scale: 0.95 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Crown className="w-5 h-5" />
                  <span className="text-xs font-medium">Igris</span>
                  <span className="text-xs text-blue-400">50</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setSelectedAction('rulers_authority')}
                disabled={playerMp < 30}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'rulers_authority'
                    ? 'bg-blue-600/80 border-blue-400 text-white'
                    : playerMp < 30
                    ? 'bg-gray-900/50 border-gray-700 text-gray-500'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={playerMp >= 30 ? { scale: 0.95 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Target className="w-5 h-5" />
                  <span className="text-xs font-medium">Ruler's</span>
                  <span className="text-xs text-blue-400">30</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setSelectedAction('shadow_step')}
                disabled={playerMp < 10}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'shadow_step'
                    ? 'bg-blue-600/80 border-blue-400 text-white'
                    : playerMp < 10
                    ? 'bg-gray-900/50 border-gray-700 text-gray-500'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={playerMp >= 10 ? { scale: 0.95 } : {}}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Wind className="w-5 h-5" />
                  <span className="text-xs font-medium">Step</span>
                  <span className="text-xs text-blue-400">10</span>
                </div>
              </motion.button>

              <motion.button
                onClick={() => setSelectedAction('defend')}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 ${
                  selectedAction === 'defend'
                    ? 'bg-blue-600/80 border-blue-400 text-white'
                    : 'bg-gray-800/70 border-gray-600 text-gray-300'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-1">
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-medium">Defend</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden md:grid md:grid-cols-3 gap-3">
            <motion.button
              onClick={() => setSelectedAction('basic_attack')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'basic_attack' 
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center space-y-2">
                <Sword className="w-6 h-6" />
                <span className="font-medium">Strike</span>
                <span className="text-xs opacity-70">Basic Attack</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setSelectedAction('shadow_exchange')}
              disabled={playerMp < 20}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'shadow_exchange'
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : playerMp < 20
                  ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={playerMp >= 20 ? { scale: 1.02 } : {}}
              whileTap={playerMp >= 20 ? { scale: 0.98 } : {}}
            >
              <div className="flex flex-col items-center space-y-2">
                <Zap className="w-6 h-6" />
                <span className="font-medium">Shadow Exchange</span>
                <span className="text-xs text-blue-400">20 MP</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setSelectedAction('summon_igris')}
              disabled={playerMp < 50}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'summon_igris'
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : playerMp < 50
                  ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={playerMp >= 50 ? { scale: 1.02 } : {}}
              whileTap={playerMp >= 50 ? { scale: 0.98 } : {}}
            >
              <div className="flex flex-col items-center space-y-2">
                <Crown className="w-6 h-6" />
                <span className="font-medium">Summon Igris</span>
                <span className="text-xs text-blue-400">50 MP</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setSelectedAction('rulers_authority')}
              disabled={playerMp < 30}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'rulers_authority'
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : playerMp < 30
                  ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={playerMp >= 30 ? { scale: 1.02 } : {}}
              whileTap={playerMp >= 30 ? { scale: 0.98 } : {}}
            >
              <div className="flex flex-col items-center space-y-2">
                <Target className="w-6 h-6" />
                <span className="font-medium">Ruler's Authority</span>
                <span className="text-xs text-blue-400">30 MP</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setSelectedAction('shadow_step')}
              disabled={playerMp < 10}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'shadow_step'
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : playerMp < 10
                  ? 'bg-gray-900/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={playerMp >= 10 ? { scale: 1.02 } : {}}
              whileTap={playerMp >= 10 ? { scale: 0.98 } : {}}
            >
              <div className="flex flex-col items-center space-y-2">
                <Wind className="w-6 h-6" />
                <span className="font-medium">Shadow Step</span>
                <span className="text-xs text-blue-400">10 MP</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setSelectedAction('defend')}
              className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedAction === 'defend'
                  ? 'bg-blue-600/80 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:border-gray-500'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center space-y-2">
                <Shield className="w-6 h-6" />
                <span className="font-medium">Defend</span>
                <span className="text-xs opacity-70">Reduce Damage</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Damage Numbers Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {damageNumbers.map((damage) => (
            <motion.div
              key={damage.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ 
                opacity: 0, 
                y: -50, 
                scale: 1.2,
                x: Math.random() * 40 - 20 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className={`absolute text-2xl font-bold pointer-events-none ${
                damage.type === 'damage' ? 'text-red-400' :
                damage.type === 'heal' ? 'text-green-400' :
                'text-blue-400'
              }`}
              style={{
                left: `${damage.x}px`,
                top: `${damage.y}px`,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {damage.type === 'damage' ? '-' : '+'}
              {damage.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Battle Result Overlay */}
      <AnimatePresence>
        {(battlePhase === 'victory' || battlePhase === 'defeat') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center max-w-md mx-4">
              <h2 className={`text-3xl font-bold mb-4 ${
                battlePhase === 'victory' ? 'text-green-400' : 'text-red-400'
              }`}>
                {battlePhase === 'victory' ? '🏆 Victory!' : '💀 Defeat!'}
              </h2>
              <p className="text-gray-300 mb-6">
                {battlePhase === 'victory' 
                  ? 'You have successfully defeated all enemies!' 
                  : 'Your HP reached zero. Better luck next time!'}
              </p>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Return to World
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}