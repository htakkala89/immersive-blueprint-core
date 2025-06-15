import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Shield, Zap, Heart, Target, Clock, 
  Flame, Wind, Skull, Star, Crown, Package,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Settings, Play, Pause, RotateCcw, Sparkles,
  Eye, Crosshair, ShieldCheck, Activity, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Enhanced Equipment System
interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  tier: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  stats: {
    attack?: number;
    defense?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    critDamage?: number;
    speed?: number;
  };
  abilities?: string[];
  description: string;
  icon: React.ReactNode;
}

// Enhanced Item System
interface ConsumableItem {
  id: string;
  name: string;
  type: 'health' | 'mana' | 'buff' | 'special';
  quantity: number;
  cooldown: number;
  maxCooldown: number;
  effects: {
    heal?: number;
    manaRestore?: number;
    buffs?: Array<{
      type: string;
      value: number;
      duration: number;
    }>;
  };
  description: string;
  icon: string;
}

// Shadow Army System
interface ShadowSoldier {
  id: string;
  name: string;
  rank: 'soldier' | 'elite' | 'knight' | 'general' | 'marshal';
  type: 'tank' | 'dps' | 'support' | 'assassin';
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: CombatSkill[];
  position: { x: number; y: number };
  isActive: boolean;
  cooldowns: Record<string, number>;
  loyaltyLevel: number;
}

// Enhanced Enemy System
interface Enemy {
  id: string;
  name: string;
  type: 'beast' | 'undead' | 'demon' | 'elemental' | 'humanoid';
  rank: 'normal' | 'elite' | 'boss' | 'raid_boss';
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  position: { x: number; y: number };
  aggro: number;
  status: StatusEffect[];
  attackCooldown: number;
  skills: CombatSkill[];
  weaknesses: string[];
  resistances: string[];
  dropTable: DropItem[];
}

// Enhanced Skill System
interface CombatSkill {
  id: string;
  name: string;
  type: 'attack' | 'support' | 'summon' | 'ultimate';
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  cooldown: number;
  manaCost: number;
  description: string;
  damage?: number;
  effects?: StatusEffect[];
  requirements?: {
    combo?: number;
    shadowSoldiers?: number;
    hp?: number;
  };
  animation: string;
  icon: React.ReactNode;
}

// Status Effects
interface StatusEffect {
  id: string;
  name: string;
  type: 'buff' | 'debuff' | 'dot' | 'hot';
  duration: number;
  value: number;
  stackable: boolean;
  stacks: number;
  icon: React.ReactNode;
}

// Drop System
interface DropItem {
  itemId: string;
  name: string;
  type: 'equipment' | 'consumable' | 'material' | 'currency';
  rarity: string;
  quantity: number;
  dropRate: number;
}

// Main Props Interface
interface UltimateCombatSystemProps {
  isVisible: boolean;
  onClose: () => void;
  onCombatComplete: (result: { 
    victory: boolean; 
    rewards: DropItem[]; 
    experience: number;
    gold: number;
    newEquipment?: Equipment[];
  }) => void;
  playerLevel: number;
  playerStats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    attack: number;
    defense: number;
    agility: number;
    intelligence: number;
    luck: number;
  };
  playerEquipment: {
    weapon?: Equipment;
    armor?: Equipment;
    accessory?: Equipment;
  };
  playerInventory: ConsumableItem[];
  enemies: Enemy[];
  battleType: 'dungeon' | 'boss' | 'raid' | 'pvp' | 'training';
  chaHaeInPresent?: boolean;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
}

export function UltimateCombatSystem({
  isVisible,
  onClose,
  onCombatComplete,
  playerLevel,
  playerStats,
  playerEquipment,
  playerInventory,
  enemies: initialEnemies,
  battleType,
  chaHaeInPresent = false,
  difficulty = 'normal'
}: UltimateCombatSystemProps): JSX.Element {
  
  // Core Combat State
  const [battlePhase, setBattlePhase] = useState<'preparation' | 'combat' | 'victory' | 'defeat'>('preparation');
  const [playerHp, setPlayerHp] = useState(playerStats.hp);
  const [playerMp, setPlayerMp] = useState(playerStats.mp);
  const [chaHaeInHp, setChaHaeInHp] = useState(chaHaeInPresent ? 100 : 0);
  const [chaHaeInMp, setChaHaeInMp] = useState(chaHaeInPresent ? 100 : 0);
  
  // Equipment & Inventory Management
  const [currentEquipment, setCurrentEquipment] = useState(playerEquipment);
  const [inventory, setInventory] = useState(playerInventory);
  const [showEquipmentPanel, setShowEquipmentPanel] = useState(false);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  
  // Enhanced Combat State
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [shadowArmy, setShadowArmy] = useState<ShadowSoldier[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [targetSelection, setTargetSelection] = useState<string | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [turn, setTurn] = useState<'player' | 'enemy' | 'shadow'>('player');
  const [combo, setCombo] = useState(0);
  
  // Available Equipment from Game Store
  const [availableEquipment, setAvailableEquipment] = useState<{
    weapon: any[];
    armor: any[];
    accessory: any[];
  }>({
    weapon: [],
    armor: [],
    accessory: []
  });

  // Load player's available equipment from actual game inventory
  useEffect(() => {
    console.log('USEEFFECT RUNNING - UltimateCombatSystem equipment loading starting...');
    const loadAvailableEquipment = async () => {
      try {
        // Use the same API endpoints as loadCombatData function
        console.log('USEEFFECT - Fetching from /api/player/equipment and /api/player/inventory');
        
        const equipmentResponse = await fetch('/api/player/equipment');
        const inventoryResponse = await fetch('/api/player/inventory');
        
        let purchasedItems: any[] = [];
        
        if (equipmentResponse.ok) {
          const equipment = await equipmentResponse.json();
          console.log('USEEFFECT - Equipment response:', equipment);
          if (equipment.weapon) purchasedItems.push(equipment.weapon);
          if (equipment.armor) purchasedItems.push(equipment.armor);
          if (equipment.accessory) purchasedItems.push(equipment.accessory);
        }
        
        if (inventoryResponse.ok) {
          const inventory = await inventoryResponse.json();
          console.log('USEEFFECT - Inventory response:', inventory);
          if (inventory.items) {
            purchasedItems = [...purchasedItems, ...inventory.items];
          }
        }
        
        console.log('USEEFFECT - Loading equipment from inventory:', purchasedItems.length, 'items');
        console.log('USEEFFECT - First item:', purchasedItems[0]?.name, purchasedItems[0]?.type, purchasedItems[0]?.category);
        console.log('USEEFFECT - Demon King Daggers?', purchasedItems.find((item: any) => item.name?.includes('Demon')));
        console.log('USEEFFECT - All item names:', purchasedItems.map((item: any) => `${item.name} (${item.type}/${item.category})`));
        
        // Filter weapons from purchases
        const weapons = purchasedItems.filter((item: any) => {
          const isWeapon = item.category === 'weapons' || item.type === 'weapon';
          console.log(`Checking item: ${item.name}, category: "${item.category}", type: "${item.type}", isWeapon: ${isWeapon}`);
          return isWeapon;
        }).map((item: any) => ({
          id: item.id,
          name: item.name,
          type: 'weapon',
          tier: item.rarity || 'common',
          stats: item.stats || { attack: item.damage || 50 },
          icon: item.icon || '⚔️',
          description: item.description || 'A purchased weapon'
        }));
        
        // Filter armor from purchases
        const armors = purchasedItems.filter((item: any) => 
          item.category === 'armor' || item.type === 'armor'
        ).map((item: any) => ({
          id: item.id,
          name: item.name,
          type: 'armor',
          tier: item.rarity || 'common',
          stats: item.stats || { defense: item.defense || 30 },
          icon: item.icon || '🛡️',
          description: item.description || 'Protective armor'
        }));
        
        // Filter accessories from purchases
        const accessories = purchasedItems.filter((item: any) => 
          item.category === 'accessories' || item.type === 'accessory'
        ).map((item: any) => ({
          id: item.id,
          name: item.name,
          type: 'accessory',
          tier: item.rarity || 'common',
          stats: item.stats || { mp: 25 },
          icon: item.icon || '💍',
          description: item.description || 'A useful accessory'
        }));

        console.log('Loaded equipment:', { weapons: weapons.length, armors: armors.length, accessories: accessories.length });

        setAvailableEquipment({
          weapon: weapons,
          armor: armors,
          accessory: accessories
        });
      } catch (error) {
        console.error('Failed to load equipment from vendor purchases:', error);
        setAvailableEquipment({
          weapon: [],
          armor: [],
          accessory: []
        });
      }
    };

    loadAvailableEquipment();
  }, []);

  if (!isVisible) return <></>;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-50">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Ultimate Combat System
              </div>
              <Badge variant="outline" className="text-purple-300 border-purple-400/50">
                {battleType} - {difficulty}
              </Badge>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="h-full pt-20 pb-8 px-8">
            <div className="h-full bg-gradient-to-br from-gray-900/50 to-purple-900/30 rounded-xl border border-purple-400/20 backdrop-blur-lg overflow-hidden">
              
              {/* Battle Phase Content */}
              {battlePhase === 'preparation' && (
                <div className="h-full flex flex-col">
                  {/* Preparation Phase */}
                  <div className="p-6 border-b border-purple-400/20">
                    <h2 className="text-xl font-bold text-white mb-2">Combat Preparation</h2>
                    <p className="text-gray-300">Checking equipment availability from your inventory...</p>
                    
                    {/* Debug Equipment Status */}
                    <div className="mt-4 p-3 bg-black/30 rounded border border-gray-600">
                      <div className="text-sm text-gray-300">
                        <div>Available Weapons: {availableEquipment.weapon.length}</div>
                        <div>Available Armor: {availableEquipment.armor.length}</div>
                        <div>Available Accessories: {availableEquipment.accessory.length}</div>
                        {availableEquipment.weapon.length > 0 && (
                          <div className="mt-2 text-green-400">
                            Found: {availableEquipment.weapon.map(w => w.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="text-center">
                      <div className="text-gray-400 mb-4">Equipment loaded successfully. Ready for combat!</div>
                      <Button
                        onClick={() => setBattlePhase('combat')}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Begin Combat
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {battlePhase === 'combat' && (
                <div className="h-full flex flex-col justify-center items-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">Combat Phase</h2>
                    <p className="text-gray-300 mb-8">Combat system ready for implementation</p>
                    <div className="flex gap-4">
                      <Button
                        onClick={() => setBattlePhase('victory')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Simulate Victory
                      </Button>
                      <Button
                        onClick={() => setBattlePhase('defeat')}
                        variant="destructive"
                      >
                        Simulate Defeat
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {battlePhase === 'victory' && (
                <div className="h-full flex flex-col justify-center items-center">
                  <div className="text-center text-white">
                    <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                    <h2 className="text-3xl font-bold mb-4 text-yellow-400">Victory!</h2>
                    <p className="text-gray-300 mb-8">You have emerged victorious from battle!</p>
                    <Button
                      onClick={() => {
                        onCombatComplete({
                          victory: true,
                          rewards: [],
                          experience: 100,
                          gold: 50
                        });
                      }}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      Claim Rewards
                    </Button>
                  </div>
                </div>
              )}

              {battlePhase === 'defeat' && (
                <div className="h-full flex flex-col justify-center items-center">
                  <div className="text-center text-white">
                    <Skull className="h-16 w-16 mx-auto mb-4 text-red-400" />
                    <h2 className="text-3xl font-bold mb-4 text-red-400">Defeat</h2>
                    <p className="text-gray-300 mb-8">You have been defeated in battle.</p>
                    <Button
                      onClick={() => {
                        onCombatComplete({
                          victory: false,
                          rewards: [],
                          experience: 10,
                          gold: 0
                        });
                      }}
                      variant="destructive"
                    >
                      Return
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}