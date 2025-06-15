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

// Status Effects System
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
  const [maxCombo, setMaxCombo] = useState(0);
  
  // Cooldown & Resource Management
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({});
  const [itemCooldowns, setItemCooldowns] = useState<Record<string, number>>({});
  const [statusEffects, setStatusEffects] = useState<StatusEffect[]>([]);
  
  // Visual Effects & Animation
  const [damageNumbers, setDamageNumbers] = useState<Array<{
    id: string;
    damage: number;
    type: 'damage' | 'heal' | 'critical' | 'miss' | 'immune';
    position: { x: number; y: number };
    timestamp: number;
  }>>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [powerAura, setPowerAura] = useState(false);
  const [ultimateMode, setUltimateMode] = useState(false);
  
  // S-Rank Hunter Powers
  const [shadowPoints, setShadowPoints] = useState(0);
  const [monarchPower, setMonarchPower] = useState(0);
  const [shadowExtractionReady, setShadowExtractionReady] = useState(false);

  // Enhanced Shadow Monarch Skills
  const shadowMonarchSkills: CombatSkill[] = [
    {
      id: 'basic_strike',
      name: 'Shadow Strike',
      type: 'attack',
      rank: 'A',
      cooldown: 0,
      manaCost: 0,
      description: 'Basic attack enhanced with shadow energy',
      damage: Math.floor(playerStats.attack * 1.2),
      animation: 'slash',
      icon: <Sword className="w-5 h-5" />
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      type: 'attack',
      rank: 'S',
      cooldown: 3000,
      manaCost: 25,
      description: 'Instantly teleport behind target for massive damage',
      damage: Math.floor(playerStats.attack * 2.5),
      effects: [
        { id: 'backstab', name: 'Backstab', type: 'buff', duration: 0, value: 50, stackable: false, stacks: 1, icon: <Target className="w-4 h-4" /> }
      ],
      animation: 'teleport_strike',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'rulers_authority',
      name: "Ruler's Authority",
      type: 'attack',
      rank: 'SS',
      cooldown: 5000,
      manaCost: 40,
      description: 'Overwhelming telekinetic force that crushes enemies',
      damage: Math.floor(playerStats.attack * 3.0),
      effects: [
        { id: 'knockback', name: 'Knockback', type: 'debuff', duration: 2000, value: 0, stackable: false, stacks: 1, icon: <Wind className="w-4 h-4" /> },
        { id: 'stunned', name: 'Stunned', type: 'debuff', duration: 1500, value: 0, stackable: false, stacks: 1, icon: <Skull className="w-4 h-4" /> }
      ],
      animation: 'telekinetic_crush',
      icon: <Crown className="w-5 h-5" />
    },
    {
      id: 'arise',
      name: 'ARISE!',
      type: 'summon',
      rank: 'SSS',
      cooldown: 8000,
      manaCost: 60,
      description: 'Summon fallen enemies as shadow soldiers',
      requirements: { shadowSoldiers: 0 },
      animation: 'shadow_extraction',
      icon: <Skull className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'shadow_domain',
      name: 'Shadow Domain',
      type: 'ultimate',
      rank: 'SSS',
      cooldown: 15000,
      manaCost: 100,
      description: 'Create a domain where shadows rule supreme',
      effects: [
        { id: 'shadow_boost', name: 'Shadow Mastery', type: 'buff', duration: 10000, value: 100, stackable: false, stacks: 1, icon: <Sparkles className="w-4 h-4" /> }
      ],
      requirements: { combo: 10, shadowSoldiers: 3 },
      animation: 'domain_expansion',
      icon: <Eye className="w-5 h-5 text-purple-600" />
    }
  ];

  // Consumable Items with Enhanced Effects
  const enhancedConsumables: ConsumableItem[] = [
    {
      id: 'healing_potion',
      name: 'Superior Healing Potion',
      type: 'health',
      quantity: 5,
      cooldown: 0,
      maxCooldown: 2000,
      effects: { heal: Math.floor(playerStats.maxHp * 0.6) },
      description: 'Instantly restores 60% of maximum HP',
      icon: '🧪'
    },
    {
      id: 'mana_elixir',
      name: 'Mana Elixir',
      type: 'mana',
      quantity: 3,
      cooldown: 0,
      maxCooldown: 1500,
      effects: { manaRestore: Math.floor(playerStats.maxMp * 0.8) },
      description: 'Restores 80% of maximum MP',
      icon: '💙'
    },
    {
      id: 'shadow_essence',
      name: 'Shadow Essence',
      type: 'buff',
      quantity: 2,
      cooldown: 0,
      maxCooldown: 10000,
      effects: {
        buffs: [
          { type: 'shadow_power', value: 50, duration: 30000 },
          { type: 'critical_rate', value: 25, duration: 30000 }
        ]
      },
      description: 'Enhances shadow abilities and critical hit rate',
      icon: '🌑'
    },
    {
      id: 'berserker_rage',
      name: 'Berserker Potion',
      type: 'buff',
      quantity: 1,
      cooldown: 0,
      maxCooldown: 30000,
      effects: {
        buffs: [
          { type: 'attack', value: 100, duration: 15000 },
          { type: 'speed', value: 50, duration: 15000 }
        ]
      },
      description: 'Massive attack and speed boost, but drains HP over time',
      icon: '🔥'
    }
  ];

  // Calculate Enhanced Stats with Equipment
  const getEnhancedStats = useCallback(() => {
    let enhancedStats = { ...playerStats };
    
    Object.values(currentEquipment).forEach(item => {
      if (item?.stats) {
        enhancedStats.attack += item.stats.attack || 0;
        enhancedStats.defense += item.stats.defense || 0;
        enhancedStats.maxHp += item.stats.hp || 0;
        enhancedStats.maxMp += item.stats.mp || 0;
      }
    });
    
    return enhancedStats;
  }, [currentEquipment, playerStats]);

  // Equipment Change Handler
  const handleEquipmentChange = (slot: 'weapon' | 'armor' | 'accessory', equipment: Equipment | null) => {
    if (battlePhase === 'preparation') {
      setCurrentEquipment(prev => ({
        ...prev,
        [slot]: equipment
      }));
      
      // Recalculate player stats
      const newStats = getEnhancedStats();
      setPlayerHp(newStats.maxHp);
      setPlayerMp(newStats.maxMp);
    }
  };

  // Item Usage Handler
  const useItem = useCallback((itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.quantity <= 0 || itemCooldowns[itemId] > 0) return;

    // Apply item effects
    if (item.effects.heal) {
      setPlayerHp(prev => Math.min(prev + item.effects.heal!, getEnhancedStats().maxHp));
      showDamageNumber(item.effects.heal, { x: 50, y: 30 }, 'heal');
    }
    
    if (item.effects.manaRestore) {
      setPlayerMp(prev => Math.min(prev + item.effects.manaRestore!, getEnhancedStats().maxMp));
    }

    // Apply buffs
    if (item.effects.buffs) {
      const newEffects = item.effects.buffs.map(buff => ({
        id: `${itemId}_${buff.type}`,
        name: buff.type.replace('_', ' ').toUpperCase(),
        type: 'buff' as const,
        duration: buff.duration,
        value: buff.value,
        stackable: false,
        stacks: 1,
        icon: <Star className="w-4 h-4" />
      }));
      setStatusEffects(prev => [...prev, ...newEffects]);
    }

    // Update inventory and cooldowns
    setInventory(prev => prev.map(i => 
      i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
    ));
    setItemCooldowns(prev => ({ ...prev, [itemId]: item.maxCooldown }));

    addToCombatLog(`Used ${item.name}`);
  }, [inventory, itemCooldowns, getEnhancedStats]);

  // Enhanced Damage Number System
  const showDamageNumber = useCallback((damage: number, position: { x: number; y: number }, type: 'damage' | 'heal' | 'critical' | 'miss' | 'immune') => {
    const id = `dmg_${Date.now()}_${Math.random()}`;
    setDamageNumbers(prev => [...prev, {
      id,
      damage,
      type,
      position: {
        x: position.x + (Math.random() - 0.5) * 40,
        y: position.y + (Math.random() - 0.5) * 20
      },
      timestamp: Date.now()
    }]);

    // Trigger screen shake for heavy hits
    if (type === 'critical' || damage > 100) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 200);
    }
  }, []);

  // Combat Log System
  const addToCombatLog = useCallback((message: string) => {
    setCombatLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Execute Skill
  const executeSkill = useCallback((skillId: string, targetId?: string) => {
    const skill = shadowMonarchSkills.find(s => s.id === skillId);
    if (!skill || skillCooldowns[skillId] > 0 || playerMp < skill.manaCost) return;

    // Consume mana
    setPlayerMp(prev => prev - skill.manaCost);
    
    // Set cooldown
    setSkillCooldowns(prev => ({ ...prev, [skillId]: skill.cooldown }));

    // Handle different skill types
    switch (skill.type) {
      case 'attack':
        if (targetId) {
          const target = enemies.find(e => e.id === targetId);
          if (target) {
            const damage = calculateDamage(skill.damage || 0, target);
            const isCritical = Math.random() < 0.15; // 15% crit rate
            const finalDamage = isCritical ? Math.floor(damage * 2) : damage;
            
            // Apply damage
            setEnemies(prev => prev.map(e => 
              e.id === targetId ? { ...e, hp: Math.max(0, e.hp - finalDamage) } : e
            ));
            
            showDamageNumber(finalDamage, target.position, isCritical ? 'critical' : 'damage');
            addToCombatLog(`${skill.name} deals ${finalDamage} damage to ${target.name}${isCritical ? ' (CRITICAL!)' : ''}`);
            
            // Increase combo
            setCombo(prev => {
              const newCombo = prev + 1;
              setMaxCombo(current => Math.max(current, newCombo));
              return newCombo;
            });

            // Apply status effects
            if (skill.effects) {
              setEnemies(prev => prev.map(e => 
                e.id === targetId ? { ...e, status: [...e.status, ...skill.effects!] } : e
              ));
            }
          }
        }
        break;
        
      case 'summon':
        if (skillId === 'arise' && shadowExtractionReady) {
          // Summon shadow soldiers from defeated enemies
          const newSoldier: ShadowSoldier = {
            id: `shadow_${Date.now()}`,
            name: 'Shadow Soldier',
            rank: 'soldier',
            type: 'dps',
            level: playerLevel,
            hp: 80,
            maxHp: 80,
            mp: 40,
            maxMp: 40,
            attack: Math.floor(playerStats.attack * 0.6),
            defense: Math.floor(playerStats.defense * 0.5),
            speed: 50,
            skills: [],
            position: { x: 30, y: 60 },
            isActive: true,
            cooldowns: {},
            loyaltyLevel: 100
          };
          setShadowArmy(prev => [...prev, newSoldier]);
          addToCombatLog(`Shadow Soldier has risen!`);
          setShadowExtractionReady(false);
        }
        break;
        
      case 'ultimate':
        if (skillId === 'shadow_domain') {
          setUltimateMode(true);
          setPowerAura(true);
          addToCombatLog(`SHADOW DOMAIN ACTIVATED!`);
          setTimeout(() => {
            setUltimateMode(false);
            setPowerAura(false);
          }, 10000);
        }
        break;
    }
  }, [shadowMonarchSkills, skillCooldowns, playerMp, enemies, playerLevel, playerStats, shadowExtractionReady]);

  // Damage Calculation with Equipment
  const calculateDamage = useCallback((baseDamage: number, target: Enemy) => {
    const enhancedStats = getEnhancedStats();
    let damage = baseDamage + enhancedStats.attack;
    
    // Apply defense reduction
    damage = Math.max(1, damage - target.defense);
    
    // Apply status effect modifiers
    statusEffects.forEach(effect => {
      if (effect.type === 'buff' && effect.name.includes('ATTACK')) {
        damage = Math.floor(damage * (1 + effect.value / 100));
      }
    });
    
    return damage;
  }, [getEnhancedStats, statusEffects]);

  // Start Combat
  // Equipment selection state
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState<'weapon' | 'armor' | 'accessory' | null>(null);
  
  // Enemy preview state
  const [showEnemyPreview, setShowEnemyPreview] = useState(false);

  // Player inventory equipment state
  const [availableEquipment, setAvailableEquipment] = useState<{
    weapon: any[];
    armor: any[];
    accessory: any[];
  }>({
    weapon: [],
    armor: [],
    accessory: []
  });

  // Load player's available equipment from actual game inventory and vendor purchases
  useEffect(() => {
    const loadAvailableEquipment = async () => {
      try {
        const sessionId = 'default_session';
        
        // Get player profile to access purchased equipment from gameState
        const profileResponse = await fetch(`/api/profiles/${10}/load`, {
          headers: { 'x-session-id': sessionId }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const profile = profileData.profile;
          
          // Get purchased items from gameState.inventory (where shop purchases are stored)
          const gameState = profile.gameState || {};
          const purchasedItems = gameState.inventory || [];
          
          console.log('Loading equipment from inventory:', purchasedItems);
          console.log('Profile data structure:', profile);
          console.log('GameState structure:', gameState);
          
          // Filter weapons from purchases with detailed logging
          const weapons = purchasedItems.filter((item: any) => {
            const isWeapon = item.category === 'weapons' || item.type === 'weapon';
            console.log(`Checking item: ${item.name}, category: ${item.category}, type: ${item.type}, isWeapon: ${isWeapon}`);
            return isWeapon;
          }).filter((item: any) => 
            item.category === 'weapons' || item.type === 'weapon'
          ).map((item: any) => ({
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
        }
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

  // Refresh equipment after granting starting items
  const refreshEquipment = () => {
    const loadAvailableEquipment = async () => {
      try {
        const sessionId = 'default_session';
        
        // Get player profile to access purchased equipment from gameState
        const profileResponse = await fetch(`/api/profiles/${10}/load`, {
          headers: { 'x-session-id': sessionId }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const profile = profileData.profile;
          
          // Get purchased items from gameState.inventory (where shop purchases are stored)
          const gameState = profile.gameState || {};
          const purchasedItems = gameState.inventory || [];
          
          console.log('Refreshing equipment from inventory:', purchasedItems);
          
          // Filter weapons from purchases
          const weapons = purchasedItems.filter((item: any) => 
            item.category === 'weapons' || item.type === 'weapon'
          ).map((item: any) => ({
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

          console.log('Refreshed equipment:', { weapons: weapons.length, armors: armors.length, accessories: accessories.length });

          setAvailableEquipment({
            weapon: weapons,
            armor: armors,
            accessory: accessories
          });
        }
      } catch (error) {
        console.error('Failed to refresh equipment:', error);
      }
    };

    loadAvailableEquipment();
  };

  // Equipment Swap Handler
  const handleEquipmentSwap = (type: 'weapon' | 'armor' | 'accessory') => {
    setSelectedEquipmentType(type);
    setShowEquipmentModal(true);
    addToCombatLog(`Opening ${type} selection...`);
    
    // Force refresh equipment when modal opens
    refreshEquipment();
  };

  // Calculate stat comparison for equipment preview
  const getStatComparison = (newItem: any, equipmentType: 'weapon' | 'armor' | 'accessory') => {
    const currentItem = currentEquipment[equipmentType];
    const currentStats = currentItem?.stats || {};
    const newStats = newItem.stats || {};
    
    const comparison: Record<string, number> = {};
    const allStats = new Set([...Object.keys(currentStats), ...Object.keys(newStats)]);
    
    allStats.forEach(stat => {
      const current = currentStats[stat] || 0;
      const newValue = newStats[stat] || 0;
      comparison[stat] = newValue - current;
    });
    
    return comparison;
  };

  // Equip Item Handler
  const handleEquipItem = (item: any) => {
    setCurrentEquipment(prev => ({
      ...prev,
      [selectedEquipmentType!]: item
    }));
    setShowEquipmentModal(false);
    addToCombatLog(`Equipped ${item.name}!`);
  };

  // Item Use Handler - Makes Battle Items functional
  const handleItemUse = (item: ConsumableItem) => {
    if (item.quantity <= 0 || item.cooldown > 0) return;

    // During preparation phase, show item info and prepare for combat use
    if (battlePhase === 'preparation') {
      // Add item effects to status effects for combat preparation
      if (item.effects.buffs) {
        item.effects.buffs.forEach(buff => {
          const newEffect: StatusEffect = {
            id: `${item.id}_${Date.now()}`,
            name: `${item.name} Ready`,
            type: 'buff',
            duration: buff.duration,
            value: buff.value,
            stackable: false,
            stacks: 1,
            icon: <Star className="w-4 h-4" />
          };
          setStatusEffects(prev => [...prev, newEffect]);
          addToCombatLog(`${item.name} prepared for combat - will grant ${buff.type} boost (+${buff.value})!`);
        });
      } else {
        addToCombatLog(`${item.name} ready for use - ${item.description}`);
      }

      // Show visual feedback
      setPowerAura(true);
      setTimeout(() => setPowerAura(false), 1000);
    } else {
      addToCombatLog(`Save ${item.name} for when you need it most in combat!`);
    }
  };

  const startCombat = () => {
    setBattlePhase('combat');
    setEnemies(initialEnemies);
    addToCombatLog('Combat begins!');
    if (chaHaeInPresent) {
      addToCombatLog('Cha Hae-In joins the battle!');
    }
  };

  // Cooldown Management
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = Math.max(0, updated[key] - 100);
        });
        return updated;
      });
      
      setItemCooldowns(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          updated[key] = Math.max(0, updated[key] - 100);
        });
        return updated;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Damage Number Cleanup
  useEffect(() => {
    const cleanup = setInterval(() => {
      setDamageNumbers(prev => 
        prev.filter(dmg => Date.now() - dmg.timestamp < 2000)
      );
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  // Victory/Defeat Check
  useEffect(() => {
    if (battlePhase === 'combat') {
      const playerDefeated = playerHp <= 0 && (!chaHaeInPresent || chaHaeInHp <= 0);
      const enemiesDefeated = enemies.every(e => e.hp <= 0);
      
      if (playerDefeated) {
        setBattlePhase('defeat');
        addToCombatLog('Defeat...');
      } else if (enemiesDefeated && enemies.length > 0) {
        setBattlePhase('victory');
        addToCombatLog('Victory!');
        
        // Calculate rewards
        const baseRewards = enemies.reduce((acc, enemy) => {
          return acc + enemy.level * 100;
        }, 0);
        
        onCombatComplete({
          victory: true,
          rewards: [],
          experience: baseRewards,
          gold: baseRewards * 10
        });
      }
    }
  }, [playerHp, chaHaeInHp, enemies, battlePhase, chaHaeInPresent, onCombatComplete]);

  if (!isVisible) return <div />;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: screenShake ? 1.02 : 1, 
          opacity: 1,
          filter: powerAura ? 'drop-shadow(0 0 20px rgba(139, 69, 19, 0.8))' : 'none'
        }}
        className="w-full h-full max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden"
      >
        {/* S-Rank Power Aura Effect */}
        {powerAura && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-pulse" />
        )}

        {/* Preparation Phase */}
        {battlePhase === 'preparation' && (
          <div className="h-full flex flex-col p-3 md:p-6 overflow-y-auto">
            <div className="text-center mb-4 md:mb-6">
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                Prepare for Battle
              </h1>
              <p className="text-purple-300 text-sm md:text-base">
                Equip your gear and ready your items before entering combat
              </p>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Equipment Panel */}
              <Card className="bg-white/10 backdrop-blur-md border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Equipment
                  </h3>
                  
                  {/* Current Total Stats Display */}
                  <div className="bg-black/20 rounded-lg p-3 mb-4 border border-green-500/30">
                    <div className="text-green-400 text-sm font-semibold mb-2">Current Stats</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-center">
                        <div className="text-orange-300">ATK</div>
                        <div className="text-white font-bold">{getEnhancedStats().attack}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-300">DEF</div>
                        <div className="text-white font-bold">{getEnhancedStats().defense}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-red-300">HP</div>
                        <div className="text-white font-bold">{getEnhancedStats().maxHp}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-300">MP</div>
                        <div className="text-white font-bold">{getEnhancedStats().maxMp}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Weapon Slot */}
                    <button
                      onClick={() => handleEquipmentSwap('weapon')}
                      className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 md:p-4 border border-orange-500/30 hover:border-orange-500/50 transition-all active:scale-95 cursor-pointer touch-manipulation"
                    >
                      <div className="text-orange-400 text-xs md:text-sm mb-2 text-left font-medium">WEAPON</div>
                      {currentEquipment.weapon ? (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="text-xl md:text-2xl flex-shrink-0">{currentEquipment.weapon.icon}</div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white font-semibold text-sm md:text-base truncate">{currentEquipment.weapon.name}</div>
                            <div className="text-green-400 text-xs md:text-sm">
                              +{currentEquipment.weapon.stats.attack} ATK
                            </div>
                          </div>
                          <div className="text-gray-400 text-xs hidden sm:block">Tap to change</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-2 md:py-3 text-sm">
                          No weapon equipped - Tap to equip
                        </div>
                      )}
                    </button>

                    {/* Armor Slot */}
                    <button
                      onClick={() => handleEquipmentSwap('armor')}
                      className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 md:p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all active:scale-95 cursor-pointer touch-manipulation"
                    >
                      <div className="text-blue-400 text-xs md:text-sm mb-2 text-left font-medium">ARMOR</div>
                      {currentEquipment.armor ? (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="text-xl md:text-2xl flex-shrink-0">{currentEquipment.armor.icon}</div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white font-semibold text-sm md:text-base truncate">{currentEquipment.armor.name}</div>
                            <div className="text-green-400 text-xs md:text-sm">
                              +{currentEquipment.armor.stats.defense} DEF
                            </div>
                          </div>
                          <div className="text-gray-400 text-xs hidden sm:block">Tap to change</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-2 md:py-3 text-sm">
                          No armor equipped - Tap to equip
                        </div>
                      )}
                    </button>

                    {/* Accessory Slot */}
                    <button
                      onClick={() => handleEquipmentSwap('accessory')}
                      className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-3 md:p-4 border border-purple-500/30 hover:border-purple-500/50 transition-all active:scale-95 cursor-pointer touch-manipulation"
                    >
                      <div className="text-purple-400 text-xs md:text-sm mb-2 text-left font-medium">ACCESSORY</div>
                      {currentEquipment.accessory ? (
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <div className="text-xl md:text-2xl flex-shrink-0">{currentEquipment.accessory.icon}</div>
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-white font-semibold text-sm md:text-base truncate">{currentEquipment.accessory.name}</div>
                            <div className="text-green-400 text-xs md:text-sm">
                              Special Effects
                            </div>
                          </div>
                          <div className="text-gray-400 text-xs hidden sm:block">Tap to change</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-2 md:py-3 text-sm">
                          No accessory equipped - Tap to equip
                        </div>
                      )}
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Battle Items Panel */}
              <Card className="bg-white/10 backdrop-blur-md border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Battle Items
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {enhancedConsumables.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleItemUse(item)}
                        disabled={item.quantity === 0 || item.cooldown > 0}
                        className={`bg-white/5 rounded-lg p-2 md:p-3 border transition-all touch-manipulation active:scale-95 ${
                          item.quantity === 0 || item.cooldown > 0
                            ? 'border-gray-600/30 opacity-50 cursor-not-allowed'
                            : 'border-gray-500/30 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-xl md:text-2xl mb-1 md:mb-2">{item.icon}</div>
                          <div className="text-white text-xs md:text-sm font-semibold mb-1">
                            {item.name}
                          </div>
                          <div className={`text-xs mb-1 md:mb-2 ${
                            item.quantity > 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            x{item.quantity}
                          </div>
                          {item.cooldown > 0 && (
                            <div className="text-orange-400 text-xs mb-1">
                              Cooldown: {Math.ceil(item.cooldown / 1000)}s
                            </div>
                          )}
                          <div className="text-gray-400 text-xs hidden md:block">
                            {item.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Combat Log Panel */}
              <Card className="bg-white/10 backdrop-blur-md border-purple-500/30">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Combat Log
                  </h3>
                  
                  <div className="bg-black/20 rounded-lg p-3 h-48 overflow-y-auto border border-gray-500/30">
                    <div className="space-y-1">
                      {combatLog.length === 0 ? (
                        <div className="text-gray-500 text-sm text-center py-4">
                          Prepare for battle...
                        </div>
                      ) : (
                        combatLog.map((log, index) => (
                          <div key={index} className="text-gray-300 text-sm">
                            <span className="text-purple-400">[{index + 1}]</span> {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="text-center mt-4 md:mt-6 space-y-3">
              {/* Enemy Preview Button */}
              <Button
                onClick={() => setShowEnemyPreview(true)}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-white border-2 border-purple-500/50 hover:border-purple-400/70 px-6 md:px-8 py-2 md:py-3 text-base md:text-lg w-full max-w-sm md:max-w-none md:w-auto touch-manipulation"
              >
                <Eye className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                Preview Enemies
              </Button>

              {/* Start Battle Button */}
              <Button
                onClick={startCombat}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl w-full max-w-sm md:max-w-none md:w-auto touch-manipulation"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                Enter Combat
              </Button>
            </div>
          </div>
        )}

        {/* Combat Phase */}
        {battlePhase === 'combat' && (
          <div className="h-full flex flex-col">
            {/* Top HUD */}
            <div className="bg-black/50 p-4 flex justify-between items-center">
              {/* Player Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-white">
                  <div className="text-sm text-gray-400">SHADOW MONARCH</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <div className="bg-red-900/50 rounded-full h-4 w-32 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-300"
                          style={{ width: `${(playerHp / getEnhancedStats().maxHp) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{playerHp}/{getEnhancedStats().maxHp}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <div className="bg-blue-900/50 rounded-full h-4 w-32 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                          style={{ width: `${(playerMp / getEnhancedStats().maxMp) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm">{playerMp}/{getEnhancedStats().maxMp}</span>
                    </div>
                  </div>
                </div>
                
                {/* Combo Counter */}
                <div className="text-center">
                  <div className="text-yellow-400 text-2xl font-bold">{combo}</div>
                  <div className="text-yellow-300 text-xs">COMBO</div>
                </div>
              </div>

              {/* Cha Hae-In Stats (if present) */}
              {chaHaeInPresent && (
                <div className="text-white">
                  <div className="text-sm text-gray-400">CHA HAE-IN</div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <div className="bg-red-900/50 rounded-full h-4 w-32 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-red-600 h-full transition-all duration-300"
                          style={{ width: `${chaHaeInHp}%` }}
                        />
                      </div>
                      <span className="text-sm">{chaHaeInHp}/100</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Combat Area */}
            <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-purple-900/20 to-black/60">
              {/* Enemy Display */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
                  {enemies.map((enemy, index) => (
                    <motion.div
                      key={enemy.id}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`relative cursor-pointer transition-all duration-300 ${
                        targetSelection === enemy.id ? 'scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => setTargetSelection(enemy.id)}
                    >
                      <Card className="bg-red-900/30 border-red-500/50 hover:border-red-400">
                        <CardContent className="p-4 text-center">
                          {/* Enemy Avatar */}
                          <div className="w-24 h-24 mx-auto mb-3 bg-red-800/50 rounded-full flex items-center justify-center text-4xl">
                            {enemy.rank === 'boss' ? '👹' : 
                             enemy.type === 'undead' ? '💀' : 
                             enemy.type === 'beast' ? '🐺' : '👾'}
                          </div>
                          
                          {/* Enemy Info */}
                          <div className="text-white font-semibold mb-2">{enemy.name}</div>
                          <Badge className={`mb-2 ${
                            enemy.rank === 'boss' ? 'bg-red-600' :
                            enemy.rank === 'elite' ? 'bg-purple-600' : 'bg-gray-600'
                          }`}>
                            {enemy.rank.toUpperCase()}
                          </Badge>
                          
                          {/* Health Bar */}
                          <div className="bg-red-900/50 rounded-full h-3 mb-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-500"
                              style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                            />
                          </div>
                          <div className="text-red-300 text-sm">
                            {enemy.hp.toLocaleString()}/{enemy.maxHp.toLocaleString()}
                          </div>
                          
                          {/* Target Indicator */}
                          {targetSelection === enemy.id && (
                            <div className="absolute -top-2 -right-2">
                              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
                                <Crosshair className="w-4 h-4 text-black" />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Shadow Army Display */}
              {shadowArmy.length > 0 && (
                <div className="absolute bottom-32 left-8">
                  <div className="text-purple-300 text-sm mb-2">SHADOW ARMY</div>
                  <div className="flex space-x-2">
                    {shadowArmy.map(soldier => (
                      <div key={soldier.id} className="bg-purple-900/50 rounded-lg p-2 border border-purple-500/30">
                        <div className="w-8 h-8 bg-purple-700 rounded text-center text-white text-xs leading-8">
                          👤
                        </div>
                        <div className="text-purple-300 text-xs mt-1">{soldier.name}</div>
                        <div className="bg-purple-800/50 rounded-full h-1 mt-1">
                          <div 
                            className="bg-purple-500 h-full rounded-full"
                            style={{ width: `${(soldier.hp / soldier.maxHp) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Damage Numbers */}
              <AnimatePresence>
                {damageNumbers.map(dmg => (
                  <motion.div
                    key={dmg.id}
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -50, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className={`absolute pointer-events-none font-bold text-2xl ${
                      dmg.type === 'critical' ? 'text-yellow-400' :
                      dmg.type === 'heal' ? 'text-green-400' :
                      dmg.type === 'miss' ? 'text-gray-400' :
                      dmg.type === 'immune' ? 'text-blue-400' :
                      'text-red-400'
                    }`}
                    style={{
                      left: `${dmg.position.x}%`,
                      top: `${dmg.position.y}%`,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      fontSize: dmg.type === 'critical' ? '2rem' : '1.5rem'
                    }}
                  >
                    {dmg.type === 'heal' ? '+' : ''}{dmg.damage.toLocaleString()}
                    {dmg.type === 'critical' && <span className="text-yellow-300">!</span>}
                    {dmg.type === 'miss' && ' MISS'}
                    {dmg.type === 'immune' && ' IMMUNE'}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Action Bar */}
            <div className="bg-black/70 p-4">
              <div className="flex justify-between items-center max-w-6xl mx-auto">
                {/* Skills */}
                <div className="flex space-x-2">
                  {shadowMonarchSkills.map(skill => {
                    const isOnCooldown = skillCooldowns[skill.id] > 0;
                    const canAfford = playerMp >= skill.manaCost;
                    const meetsRequirements = !skill.requirements || 
                      ((!skill.requirements.combo || combo >= skill.requirements.combo) &&
                       (!skill.requirements.shadowSoldiers || shadowArmy.length >= skill.requirements.shadowSoldiers));
                    
                    return (
                      <Button
                        key={skill.id}
                        variant={selectedSkill === skill.id ? "default" : "outline"}
                        size="lg"
                        disabled={isOnCooldown || !canAfford || !meetsRequirements}
                        onClick={() => {
                          if (skill.type === 'attack' && !targetSelection) {
                            // Need to select target first
                            setSelectedSkill(skill.id);
                          } else {
                            executeSkill(skill.id, targetSelection || undefined);
                            setSelectedSkill(null);
                            setTargetSelection(null);
                          }
                        }}
                        className={`relative w-16 h-16 p-0 ${
                          isOnCooldown ? 'opacity-50' : 
                          !canAfford ? 'opacity-30' :
                          !meetsRequirements ? 'opacity-25' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          {skill.icon}
                          <div className="text-xs mt-1">{skill.name.split(' ')[0]}</div>
                          
                          {/* Cooldown Overlay */}
                          {isOnCooldown && (
                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                              <span className="text-white text-xs">
                                {Math.ceil(skillCooldowns[skill.id] / 1000)}
                              </span>
                            </div>
                          )}
                          
                          {/* Mana Cost */}
                          <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {skill.manaCost}
                          </div>
                          
                          {/* Rank Badge */}
                          <div className={`absolute -top-1 -left-1 text-xs px-1 rounded ${
                            skill.rank === 'SSS' ? 'bg-purple-600 text-white' :
                            skill.rank === 'SS' ? 'bg-red-600 text-white' :
                            skill.rank === 'S' ? 'bg-orange-600 text-white' :
                            skill.rank === 'A' ? 'bg-green-600 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {skill.rank}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="flex space-x-2">
                  {enhancedConsumables.filter(item => item.quantity > 0).map(item => {
                    const isOnCooldown = itemCooldowns[item.id] > 0;
                    
                    return (
                      <Button
                        key={item.id}
                        variant="outline"
                        size="lg"
                        disabled={isOnCooldown || item.quantity <= 0}
                        onClick={() => useItem(item.id)}
                        className={`relative w-16 h-16 p-0 ${isOnCooldown ? 'opacity-50' : ''}`}
                      >
                        <div className="flex flex-col items-center">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="text-xs mt-1">{item.name.split(' ')[0]}</div>
                          
                          {/* Quantity */}
                          <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {item.quantity}
                          </div>
                          
                          {/* Cooldown Overlay */}
                          {isOnCooldown && (
                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                              <span className="text-white text-xs">
                                {Math.ceil(itemCooldowns[item.id] / 1000)}
                              </span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Combat Log */}
            <div className="absolute right-4 top-20 w-80 bg-black/80 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h4 className="text-white font-semibold mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Combat Log
              </h4>
              <div className="space-y-1">
                {combatLog.map((log, index) => (
                  <div key={index} className="text-gray-300 text-sm">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Victory/Defeat Screens */}
        {(battlePhase === 'victory' || battlePhase === 'defeat') && (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className={`text-6xl font-bold mb-4 ${
                battlePhase === 'victory' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {battlePhase === 'victory' ? 'VICTORY!' : 'DEFEAT'}
              </div>
              
              {battlePhase === 'victory' && (
                <div className="text-white space-y-2 mb-6">
                  <div>Max Combo: {maxCombo}</div>
                  <div>Shadow Soldiers: {shadowArmy.length}</div>
                  <div className="text-green-400">Experience Gained: {combo * 100}</div>
                  <div className="text-yellow-400">Gold Earned: {combo * 1000}</div>
                </div>
              )}
              
              <Button
                onClick={onClose}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
              >
                Continue
              </Button>
            </motion.div>
          </div>
        )}

        {/* Equipment Selection Modal */}
        {showEquipmentModal && selectedEquipmentType && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-purple-500/30 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white capitalize">
                    Select {selectedEquipmentType}
                  </h2>
                  <button
                    onClick={() => setShowEquipmentModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-3">
                  {availableEquipment[selectedEquipmentType].length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-lg mb-2">No {selectedEquipmentType}s available</div>
                      <div className="text-sm">Equipment count: {availableEquipment[selectedEquipmentType].length}</div>
                      <div className="text-xs mt-2">Equipment loading from inventory...</div>
                    </div>
                  ) : (
                    availableEquipment[selectedEquipmentType].map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquipItem(item)}
                        className="w-full bg-white/5 hover:bg-white/10 border border-gray-500/30 hover:border-purple-500/50 rounded-lg p-4 text-left transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{item.icon}</div>
                          <div className="flex-1">
                            <div className="text-white font-semibold">{item.name}</div>
                            <div className={`text-xs font-medium mb-1 ${
                              item.tier === 'legendary' ? 'text-orange-400' :
                              item.tier === 'rare' ? 'text-purple-400' : 'text-gray-400'
                            }`}>
                              {item.tier.toUpperCase()}
                            </div>
                            <div className="text-gray-300 text-sm mb-2">
                              {item.description}
                            </div>
                            
                            {/* Current Item Stats */}
                            <div className="flex flex-wrap gap-2 text-xs mb-2">
                              {Object.entries(item.stats).map(([stat, value]) => (
                                <span key={stat} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                  {value} {stat.toUpperCase()}
                                </span>
                              ))}
                            </div>
                            
                            {/* Stat Comparison */}
                            <div className="border-t border-gray-600 pt-2">
                              <div className="text-gray-400 text-xs mb-1">Impact:</div>
                              <div className="flex flex-wrap gap-1 text-xs">
                                {Object.entries(getStatComparison(item, selectedEquipmentType)).map(([stat, change]) => {
                                  if (change === 0) return null;
                                  return (
                                    <span 
                                      key={stat} 
                                      className={`px-2 py-1 rounded ${
                                        change > 0 
                                          ? 'bg-green-500/20 text-green-300' 
                                          : 'bg-red-500/20 text-red-300'
                                      }`}
                                    >
                                      {change > 0 ? '+' : ''}{change} {stat.toUpperCase()}
                                    </span>
                                  );
                                })}
                                {Object.values(getStatComparison(item, selectedEquipmentType)).every(v => v === 0) && (
                                  <span className="text-gray-500 text-xs">No stat changes</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowEquipmentModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}