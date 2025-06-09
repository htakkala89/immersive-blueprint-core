import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Shield, Zap, Heart, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Enemy {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  type: 'shadow_beast' | 'orc_warrior' | 'boss';
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
}

interface RaidProps {
  isVisible: boolean;
  onClose: () => void;
  onRaidComplete: (success: boolean, loot: any[]) => void;
  playerLevel: number;
  affectionLevel: number;
}

export function DungeonRaid({ 
  isVisible, 
  onClose, 
  onRaidComplete, 
  playerLevel, 
  affectionLevel 
}: RaidProps) {
  const [gamePhase, setGamePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
  const [synergyGauge, setSynergyGauge] = useState(0);
  const [teamUpReady, setTeamUpReady] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  
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

  useEffect(() => {
    if (synergyGauge >= 100 && !teamUpReady) {
      setTeamUpReady(true);
      addToCombatLog("Team-Up Attack Ready! Perfect synergy achieved!");
    }
  }, [synergyGauge]);

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), message]);
  };

  const executePlayerAction = (action: string, targetX?: number, targetY?: number) => {
    setSelectedAction(action);
    
    switch (action) {
      case 'move':
        if (targetX && targetY) {
          setPlayers(prev => prev.map(p => 
            p.id === 'jinwoo' ? { ...p, x: targetX, y: targetY } : p
          ));
          addToCombatLog("Jin-Woo moves into position");
        }
        break;
        
      case 'attack':
        const damage = 25 + Math.floor(Math.random() * 15);
        setEnemies(prev => prev.map(e => 
          e.id === 'shadow1' ? { ...e, health: Math.max(0, e.health - damage) } : e
        ));
        setSynergyGauge(prev => Math.min(100, prev + 15));
        addToCombatLog(`Jin-Woo deals ${damage} damage!`);
        break;
        
      case 'skill':
        const skillDamage = 40 + Math.floor(Math.random() * 20);
        setEnemies(prev => prev.map(e => ({ ...e, health: Math.max(0, e.health - skillDamage) })));
        setSynergyGauge(prev => Math.min(100, prev + 25));
        addToCombatLog(`Shadow Slam deals ${skillDamage} AoE damage!`);
        break;
        
      case 'teamup':
        if (teamUpReady) {
          const massiveDamage = 80 + Math.floor(Math.random() * 30);
          setEnemies(prev => prev.map(e => ({ ...e, health: Math.max(0, e.health - massiveDamage) })));
          setSynergyGauge(0);
          setTeamUpReady(false);
          addToCombatLog(`MONARCH'S WRATH! Jin-Woo and Hae-In deal ${massiveDamage} devastating damage!`);
        }
        break;
    }

    // Cha Hae-In AI turn
    setTimeout(() => {
      const haeInDamage = 20 + Math.floor(Math.random() * 12);
      setEnemies(prev => prev.map((e, i) => 
        i === 0 ? { ...e, health: Math.max(0, e.health - haeInDamage) } : e
      ));
      setSynergyGauge(prev => Math.min(100, prev + 10));
      addToCombatLog(`Hae-In strikes with perfect precision for ${haeInDamage} damage!`);
      
      // Check for victory
      setTimeout(() => {
        setEnemies(current => {
          const allDefeated = current.every(e => e.health <= 0);
          if (allDefeated && gamePhase === 'combat') {
            setGamePhase('victory');
            onRaidComplete(true, [
              { name: 'Shadow Core', rarity: 'rare', value: 500 },
              { name: 'Experience Crystals', amount: playerLevel * 50 }
            ]);
          }
          return current;
        });
      }, 500);
    }, 1000);
  };

  const handleBattlefieldClick = (e: React.MouseEvent) => {
    if (!battlefieldRef.current) return;
    
    const rect = battlefieldRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedAction === 'move') {
      executePlayerAction('move', x, y);
      setSelectedAction(null);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-red-950 to-black"
    >
      {/* Dungeon Atmosphere */}
      <div className="absolute inset-0 bg-[url('/dungeon-bg.jpg')] bg-cover bg-center opacity-30" />
      
      {/* UI Header */}
      <div className="relative z-10 p-4 flex justify-between items-start">
        <div className="liquid-glass p-3">
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
          className="text-white hover:bg-white/10"
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
          {/* Battlefield */}
          <div 
            ref={battlefieldRef}
            className="absolute inset-x-4 top-20 bottom-32 bg-gradient-to-r from-gray-800/80 to-red-900/80 rounded-lg border border-red-500/30 overflow-hidden cursor-crosshair"
            onClick={handleBattlefieldClick}
          >
            {/* Players */}
            {players.map(player => (
              <motion.div
                key={player.id}
                className={`absolute w-12 h-12 rounded-full flex items-center justify-center ${
                  player.id === 'jinwoo' ? 'bg-purple-600' : 'bg-pink-600'
                } border-2 border-white`}
                style={{ left: player.x, top: player.y }}
                animate={{ 
                  scale: player.isActive ? 1.1 : 1,
                  boxShadow: player.isActive ? '0 0 20px rgba(147, 51, 234, 0.8)' : 'none'
                }}
              >
                {player.id === 'jinwoo' ? <Crown className="w-6 h-6 text-white" /> : <Sword className="w-6 h-6 text-white" />}
                
                {/* Health Bar */}
                <div className="absolute -top-3 left-0 w-12 h-1 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-green-500 rounded"
                    style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
              <motion.div
                key={enemy.id}
                className="absolute w-10 h-10 bg-red-800 rounded border-2 border-red-400"
                style={{ left: enemy.x, top: enemy.y }}
                animate={{ 
                  opacity: enemy.health > 0 ? 1 : 0.3,
                  scale: enemy.health > 0 ? 1 : 0.8
                }}
              >
                {/* Health Bar */}
                <div className="absolute -top-3 left-0 w-10 h-1 bg-gray-700 rounded">
                  <div 
                    className="h-full bg-red-500 rounded"
                    style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Synergy Effects */}
            {synergyGauge > 50 && (
              <div className="absolute inset-0 bg-purple-400/10 animate-pulse" />
            )}
          </div>

          {/* Action Bar */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="liquid-glass-modal p-4">
              {/* Synergy Gauge */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-purple-300">Synergy</span>
                  <span className="text-sm text-white">{synergyGauge}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${synergyGauge}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => executePlayerAction('attack')}
                  className={`bg-red-600 hover:bg-red-700 ${selectedAction === 'attack' ? 'ring-2 ring-white' : ''}`}
                  disabled={gamePhase !== 'combat'}
                >
                  <Sword className="w-4 h-4 mr-1" />
                  Attack
                </Button>
                
                <Button
                  onClick={() => setSelectedAction('move')}
                  className={`bg-blue-600 hover:bg-blue-700 ${selectedAction === 'move' ? 'ring-2 ring-white' : ''}`}
                  disabled={gamePhase !== 'combat'}
                >
                  Move
                </Button>
                
                <Button
                  onClick={() => executePlayerAction('skill')}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={gamePhase !== 'combat'}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Shadow Slam
                </Button>
                
                <Button
                  onClick={() => executePlayerAction('teamup')}
                  className={`bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 ${
                    teamUpReady ? 'animate-pulse ring-2 ring-yellow-400' : ''
                  }`}
                  disabled={!teamUpReady || gamePhase !== 'combat'}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Team-Up Attack
                </Button>
              </div>

              {/* Combat Log */}
              <div className="mt-4 h-20 overflow-y-auto">
                {combatLog.map((log, index) => (
                  <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-gray-300 mb-1"
                  >
                    {log}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Victory Phase */}
      {gamePhase === 'victory' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-4 flex items-center justify-center"
        >
          <div className="backdrop-blur-md bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-xl p-8 border border-yellow-400/50 max-w-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-6xl mb-4"
            >
              👑
            </motion.div>
            
            <h3 className="text-3xl font-bold text-yellow-400 mb-4">Raid Cleared!</h3>
            
            <div className="text-purple-200 mb-6">
              <p className="mb-2 italic">"Jin-Woo... fighting beside you, I can feel your true strength. It's incredible."</p>
              <p className="text-sm">Cha Hae-In's affection has increased!</p>
            </div>

            <div className="backdrop-blur-sm bg-black/30 rounded-lg p-4 mb-6">
              <h4 className="text-yellow-300 font-bold mb-2">Rewards Obtained:</h4>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">💎</div>
                  <p className="text-sm">Shadow Core</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⭐</div>
                  <p className="text-sm">EXP Crystals</p>
                </div>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 px-8"
            >
              Return to World
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}