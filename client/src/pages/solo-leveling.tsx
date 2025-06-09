import { useState, useEffect, useRef } from "react";
import { SkillTree } from "@/components/SkillTree";
import { useCharacterProgression } from "@/hooks/useCharacterProgression";
import { useVoice } from "@/hooks/useVoice";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { LockPickingGame, RuneSequenceGame, DragonEncounterGame } from "@/components/MiniGames";
import { DailyLifeHubModal } from "@/components/DailyLifeHubModal";
import { RaidSystem } from "@/components/RaidSystem";

import { RelationshipSystem } from "@/components/RelationshipSystem";
import { MemoryLaneAnimation } from "@/components/MemoryLaneAnimation";
import { CombatSystem } from "@/components/CombatSystem";
import { AchievementSystem, useAchievementSystem } from "@/components/AchievementSystem";
import CharacterProfile from "@/components/CharacterProfileNew";
import { StoryBranching, EnhancedChoiceButton } from "@/components/StoryBranching";
import { DungeonRaidSystem } from "@/components/DungeonRaidSystem";
import { ShadowArmyManager } from "@/components/ShadowArmyManager";
import { InventorySystem } from "@/components/InventorySystem";
import { CombatTactics } from "@/components/CombatTactics";
import { EquipmentSystem, STARTING_EQUIPMENT, type Equipment, type EquippedGear } from "@/components/EquipmentSystem";
import { GiftSystem, type GiftItem } from "@/components/GiftSystem";
import { UnifiedShop, type ShopItem } from "@/components/UnifiedShop";
import { IntimateActivityModal } from "@/components/IntimateActivityModal";
import type { GameState as GameStateType } from "@shared/schema";

interface GameState {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  affection: number;
  currentScene: string;
  inventory: any[];
  inCombat: boolean;
  experience?: number;
  statPoints?: number;
  skillPoints?: number;
  stats?: any;
  skills?: any[];
  gold?: number;
  equippedGear?: EquippedGear;
  availableEquipment?: Equipment[];
  intimacyLevel?: number;
}

interface StoryScene {
  prompt: string;
  narration: string;
  chat: Array<{ sender: string; text: string }>;
  choices: Array<{ text: string; detail?: string; type: string }>;
  leadsTo?: Record<string, string>;
}

// Helper functions for game state management
const loadGameState = (): GameState | null => {
  try {
    const saved = localStorage.getItem('solo-leveling-game-state');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveGameState = (state: GameState) => {
  try {
    localStorage.setItem('solo-leveling-game-state', JSON.stringify(state));
  } catch {
    // Handle storage errors silently
  }
};

const getActivityDialogue = (activity: any): string => {
  const dialogues = {
    'morning_jog': "Let's start the day with some exercise! I love how energetic you are in the mornings.",
    'cafe_visit': "This café has the best coffee. I'm glad we can spend quiet moments like this together.",
    'training': "Your dedication to training is inspiring. Let me help you with your form.",
    'shopping': "I rarely go shopping, but with you... it's actually enjoyable.",
    'cooking': "I've been practicing this recipe. Would you like to try it?",
  };
  return dialogues[activity.id as keyof typeof dialogues] || "Thank you for spending time with me.";
};

export default function SoloLeveling() {
  // Message animation states for iMessage-style behavior
  const [messageStates, setMessageStates] = useState<Record<number, 'entering' | 'staying' | 'exiting' | 'hidden'>>({});
  const [messageTimers, setMessageTimers] = useState<Record<number, NodeJS.Timeout>>({});
  
  // Initialize game state with saved data or defaults
  const initializeGameState = (): GameState => {
    const savedState = loadGameState();
    if (savedState) {
      return savedState;
    }
    
    return {
      level: 146,
      health: 15420,
      maxHealth: 15420,
      mana: 8750,
      maxMana: 8750,
      affection: 0,
      currentScene: 'START',
      inventory: [],
      inCombat: false,
      experience: 750,
      statPoints: 5,
      skillPoints: 2,
      gold: 500,
      equippedGear: {},
      availableEquipment: [],
      intimacyLevel: 10,
      stats: {
        strength: 342,
        agility: 298,
        intelligence: 176,
        vitality: 285,
        sense: 243
      },
      skills: [
        {
          id: "shadow-extraction",
          name: "Shadow Extraction",
          description: "Extract shadows from defeated enemies to create loyal soldiers",
          type: "ultimate",
          level: 8,
          maxLevel: 10,
          unlocked: true,
          prerequisites: [],
          effects: { shadowCapacity: 40 }
        },
        {
          id: "dagger-mastery",
          name: "Dagger Mastery",
          description: "Increases damage and attack speed with daggers",
          type: "passive",
          level: 6,
          maxLevel: 10,
          unlocked: true,
          prerequisites: [],
          effects: { daggerDamage: 60, attackSpeed: 30 }
        },
        {
          id: "stealth",
          name: "Stealth",
          description: "Become invisible to enemies for a short duration",
          type: "active",
          level: 4,
          maxLevel: 10,
          unlocked: true,
          prerequisites: [],
          effects: { stealthDuration: 12 },
          manaCost: 25,
          cooldown: 30
        },
        {
          id: "shadow-armor",
          name: "Shadow Armor",
          description: "Summon protective shadow armor that absorbs damage",
          type: "active",
          level: 5,
          maxLevel: 10,
          unlocked: true,
          prerequisites: ["shadow-extraction"],
          effects: { damageReduction: 25 },
          manaCost: 40,
          cooldown: 45
        },
        {
          id: "monarch-domain",
          name: "Monarch's Domain",
          description: "Ultimate ability that enhances all shadow abilities",
          type: "ultimate",
          level: 1,
          maxLevel: 5,
          unlocked: false,
          prerequisites: ["shadow-extraction", "shadow-armor"],
          effects: { domainPower: 100 },
          manaCost: 100,
          cooldown: 300
        }
      ]
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeGameState());
  const [gameStarted, setGameStarted] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)');
  const [sceneBackground, setSceneBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; id: number; timestamp: number }>>([]);
  const [userInput, setUserInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [inputMode, setInputMode] = useState<'action' | 'speak'>('action');
  const [showInventory, setShowInventory] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<any>(null);
  const [showChatTutorial, setShowChatTutorial] = useState(false);
  const [showDevControls, setShowDevControls] = useState(false);
  const [affectionInput, setAffectionInput] = useState('');
  const [levelInput, setLevelInput] = useState('');
  const [goldInput, setGoldInput] = useState('');
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [chatPinned, setChatPinned] = useState(false);
  const [autoMessageVisible, setAutoMessageVisible] = useState(true);
  const [autoHiddenMessages, setAutoHiddenMessages] = useState<Set<number>>(new Set());
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [activeActivity, setActiveActivity] = useState<any>(null);

  const [previousPage, setPreviousPage] = useState<'hub' | 'story'>('story');
  const [showRaidSystem, setShowRaidSystem] = useState(false);
  const [showRelationshipSystem, setShowRelationshipSystem] = useState(false);
  const [showMemoryLane, setShowMemoryLane] = useState(false);
  const [showAffectionIncrease, setShowAffectionIncrease] = useState(false);
  const [affectionIncreaseAmount, setAffectionIncreaseAmount] = useState(0);
  const [showAffectionDecrease, setShowAffectionDecrease] = useState(false);
  const [affectionDecreaseAmount, setAffectionDecreaseAmount] = useState(0);
  const [showCombatSystem, setShowCombatSystem] = useState(false);
  const [showAchievementSystem, setShowAchievementSystem] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechToTextEnabled, setSpeechToTextEnabled] = useState(true);
  const [currentCombatEnemy, setCurrentCombatEnemy] = useState(null);
  const [showDungeonRaid, setShowDungeonRaid] = useState(false);
  const [showShadowArmy, setShowShadowArmy] = useState(false);
  const [shadowArmy, setShadowArmy] = useState<any[]>([
    {
      id: 'shadow_1',
      name: 'Shadow Knight',
      level: 15,
      health: 120,
      maxHealth: 120,
      attack: 45,
      defense: 35,
      speed: 25,
      intelligence: 20,
      type: 'knight',
      rarity: 'rare',
      abilities: [
        {
          id: 'ability_1',
          name: 'Shadow Strike',
          damage: 60,
          manaCost: 15,
          cooldown: 3,
          description: 'A powerful shadow-enhanced attack',
          type: 'attack'
        }
      ],
      experience: 75,
      maxExperience: 100,
      skillPoints: 3,
      loyalty: 85,
      combatStats: {
        battlesWon: 12,
        damageDealt: 2400,
        damageReceived: 800,
        killCount: 18
      },
      evolutionPossible: false
    },
    {
      id: 'shadow_2',
      name: 'Shadow Archer',
      level: 12,
      health: 85,
      maxHealth: 85,
      attack: 55,
      defense: 20,
      speed: 40,
      intelligence: 30,
      type: 'archer',
      rarity: 'common',
      abilities: [
        {
          id: 'ability_2',
          name: 'Piercing Shot',
          damage: 70,
          manaCost: 20,
          cooldown: 4,
          description: 'A precise shot that ignores armor',
          type: 'attack'
        }
      ],
      experience: 95,
      maxExperience: 100,
      skillPoints: 1,
      loyalty: 78,
      combatStats: {
        battlesWon: 8,
        damageDealt: 1800,
        damageReceived: 450,
        killCount: 22
      },
      evolutionPossible: true
    }
  ]);
  const [playerExperience, setPlayerExperience] = useState(2500);
  const [playerGold, setPlayerGold] = useState(1200);
  const [storyFlags, setStoryFlags] = useState<string[]>([]);
  const [unlockedPaths, setUnlockedPaths] = useState<string[]>(['main_story']);
  const [playerInventory, setPlayerInventory] = useState<any[]>([
    {
      id: 'health_potion',
      name: 'Health Potion',
      type: 'consumable',
      rarity: 'common',
      quantity: 5,
      description: 'Restores 50 HP instantly',
      effects: { healing: 50 },
      usableInCombat: true,
      value: 100
    },
    {
      id: 'mana_potion',
      name: 'Mana Potion',
      type: 'consumable',
      rarity: 'common',
      quantity: 3,
      description: 'Restores 30 MP instantly',
      effects: { mana: 30 },
      usableInCombat: true,
      value: 150
    }
  ]);
  const [showCombatTactics, setShowCombatTactics] = useState(false);
  const [showEquipmentSystem, setShowEquipmentSystem] = useState(false);
  const [showCharacterProfile, setShowCharacterProfile] = useState(false);
  const [showGiftSystem, setShowGiftSystem] = useState(false);
  const [showGiftGiving, setShowGiftGiving] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showUnifiedShop, setShowUnifiedShop] = useState(false);
  const [playerEquippedGear, setPlayerEquippedGear] = useState<EquippedGear>({});
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([
    {
      id: 'demon_king_daggers',
      name: "Demon King's Daggers",
      type: 'weapon',
      slot: 'weapon',
      rarity: 'mythic',
      stats: {
        attack: 250,
        criticalRate: 25,
        criticalDamage: 50,
        speed: 15
      },
      description: 'Ancient daggers forged in the depths of hell. They hunger for battle and grow stronger with each kill.',
      requirements: { level: 1 },
      value: 50000
    },
    {
      id: 'shadow_cloak',
      name: 'Shadow Monarch Cloak',
      type: 'armor',
      slot: 'chest',
      rarity: 'legendary',
      stats: {
        defense: 100,
        health: 200,
        mana: 150
      },
      description: 'A cloak that seems to absorb light itself. Worn by the Shadow Monarch.',
      requirements: { level: 1 },
      value: 25000
    },
    {
      id: 'knight_helmet',
      name: 'Knight Captain Helmet',
      type: 'armor',
      slot: 'helmet',
      rarity: 'rare',
      stats: {
        defense: 45,
        health: 100
      },
      description: 'A sturdy helmet worn by elite knight captains.',
      requirements: { level: 1 },
      value: 8000
    },
    {
      id: 'leather_boots',
      name: 'Hunter Leather Boots',
      type: 'armor',
      slot: 'boots',
      rarity: 'common',
      stats: {
        defense: 25,
        speed: 10
      },
      description: 'Comfortable boots favored by dungeon hunters.',
      requirements: { level: 1 },
      value: 3000
    },
    {
      id: 'steel_sword',
      name: 'Reinforced Steel Sword',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      stats: {
        attack: 120,
        criticalRate: 10
      },
      description: 'A well-balanced sword made from reinforced steel.',
      requirements: { level: 1 },
      value: 12000
    },
    {
      id: 'mana_ring',
      name: 'Ring of Mana Flow',
      type: 'accessory',
      slot: 'ring',
      rarity: 'epic',
      stats: {
        mana: 200,
        speed: 5
      },
      description: 'A mystical ring that enhances mana circulation.',
      requirements: { level: 1 },
      value: 15000
    }
  ]);

  // Calculate total combat stats including equipment bonuses
  const calculateTotalStats = () => {
    const baseStats = gameState.stats;
    const equipmentStats = {
      attack: 0,
      defense: 0,
      health: 0,
      mana: 0,
      strength: 0,
      agility: 0,
      intelligence: 0,
      vitality: 0
    };

    // Sum up all equipped gear stats
    Object.values(playerEquippedGear).forEach(equipment => {
      if (equipment) {
        equipmentStats.attack += equipment.stats.attack || 0;
        equipmentStats.defense += equipment.stats.defense || 0;
        equipmentStats.health += equipment.stats.health || 0;
        equipmentStats.mana += equipment.stats.mana || 0;
        equipmentStats.strength += equipment.stats.attack || 0;
        equipmentStats.agility += equipment.stats.speed || 0;
        equipmentStats.intelligence += equipment.stats.mana || 0;
        equipmentStats.vitality += equipment.stats.health || 0;
      }
    });

    return {
      totalAttack: baseStats.strength + equipmentStats.attack,
      totalDefense: baseStats.vitality + equipmentStats.defense,
      totalHealth: gameState.maxHealth + equipmentStats.health,
      totalMana: gameState.maxMana + equipmentStats.mana,
      totalStrength: baseStats.strength + equipmentStats.strength,
      totalAgility: baseStats.agility + equipmentStats.agility,
      totalIntelligence: baseStats.intelligence + equipmentStats.intelligence,
      totalVitality: baseStats.vitality + equipmentStats.vitality,
      equipmentBonuses: equipmentStats
    };
  };

  const totalStats = calculateTotalStats();

  // Function to trigger affection sparkle effect with sound
  const triggerAffectionSparkle = () => {
    console.log('Triggering affection sparkle effect!');
    setAffectionButtonSparkle(true);
    
    // Create and play a magical chime sound
    const createMagicalChime = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a magical ascending chime
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    try {
      createMagicalChime();
    } catch (error) {
      console.log('Audio creation failed, using fallback');
    }
    
    // Reset sparkle after animation
    setTimeout(() => {
      setAffectionButtonSparkle(false);
    }, 2000);
  };
  const [intimacyLevel, setIntimacyLevel] = useState(10);
  const [playerEnergy, setPlayerEnergy] = useState(100);
  const [showIntimateActivity, setShowIntimateActivity] = useState(false);
  const [currentIntimateActivity, setCurrentIntimateActivity] = useState<string | null>(null);
  const [intimateActivityResponse, setIntimateActivityResponse] = useState<string>('');
  const [currentActivityContext, setCurrentActivityContext] = useState<string | null>(null);
  const [affectionButtonSparkle, setAffectionButtonSparkle] = useState(false);

  // Combat reward system
  const MONSTER_REWARDS = {
    'goblin_warrior': {
      experience: 120,
      gold: 180,
      items: [
        { id: 'goblin_tooth', name: 'Goblin Tooth', rarity: 'common', value: 25, chance: 0.8 },
        { id: 'rusty_blade', name: 'Rusty Goblin Blade', rarity: 'common', value: 150, chance: 0.3 },
        { id: 'healing_herbs', name: 'Wild Healing Herbs', rarity: 'common', value: 40, chance: 0.6 }
      ]
    },
    'orc_berserker': {
      experience: 200,
      gold: 320,
      items: [
        { id: 'orc_tusk', name: 'Orc Tusk', rarity: 'rare', value: 80, chance: 0.7 },
        { id: 'berserker_axe', name: 'Berserker\'s Axe', rarity: 'rare', value: 600, chance: 0.15 },
        { id: 'strength_potion', name: 'Potion of Strength', rarity: 'rare', value: 200, chance: 0.4 }
      ]
    },
    'ice_dragon': {
      experience: 800,
      gold: 1500,
      items: [
        { id: 'dragon_scale', name: 'Frost Dragon Scale', rarity: 'legendary', value: 500, chance: 0.9 },
        { id: 'ice_shard', name: 'Eternal Ice Shard', rarity: 'epic', value: 300, chance: 0.6 },
        { id: 'frost_blade', name: 'Frostbite Blade', rarity: 'legendary', value: 5000, chance: 0.05 }
      ]
    }
  };

  const handleCombatVictory = (monsterType: string = 'goblin_warrior') => {
    const rewards = MONSTER_REWARDS[monsterType as keyof typeof MONSTER_REWARDS] || MONSTER_REWARDS.goblin_warrior;
    
    // Add experience and gold
    const experienceGained = rewards.experience;
    const goldGained = rewards.gold;
    
    setPlayerExperience(prev => prev + experienceGained);
    setPlayerGold(prev => prev + goldGained);
    
    // Roll for item drops
    const obtainedItems: any[] = [];
    rewards.items.forEach(item => {
      if (Math.random() < item.chance) {
        obtainedItems.push({
          id: item.id,
          name: item.name,
          type: 'material',
          rarity: item.rarity,
          quantity: 1,
          description: `Obtained from defeating ${monsterType.replace('_', ' ')}`,
          value: item.value,
          usableInCombat: false
        });
      }
    });
    
    // Add items to inventory
    setPlayerInventory(prev => {
      const updated = [...prev];
      obtainedItems.forEach(newItem => {
        const existingIndex = updated.findIndex(item => item.id === newItem.id);
        if (existingIndex >= 0) {
          updated[existingIndex].quantity += newItem.quantity;
        } else {
          updated.push(newItem);
        }
      });
      return updated;
    });
    
    // Generate victory message
    let victoryMessage = `Victory! You gained ${experienceGained} experience and ${goldGained} gold!`;
    if (obtainedItems.length > 0) {
      victoryMessage += '\n\nRare items obtained:';
      obtainedItems.forEach(item => {
        victoryMessage += `\n• ${item.name} (${item.rarity})`;
      });
    }
    
    addChatMessage('System', victoryMessage);
    
    // Track combat win for achievements
    trackCombatWin();
    
    return { experienceGained, goldGained, obtainedItems };
  };

  const createPurchaseGlowEffect = (itemElement: HTMLElement) => {
    // Create purchase confirmation glow
    itemElement.classList.add('purchase-glow');
    
    // Add purchase success indicator
    const successIndicator = document.createElement('div');
    successIndicator.className = 'purchase-success';
    successIndicator.textContent = '✓ Purchased!';
    successIndicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(34, 197, 94, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      z-index: 1000;
      animation: purchase-popup 2s ease-out forwards;
      pointer-events: none;
    `;
    
    itemElement.style.position = 'relative';
    itemElement.appendChild(successIndicator);
    
    // Remove effects after animation
    setTimeout(() => {
      itemElement.classList.remove('purchase-glow');
      successIndicator.remove();
    }, 2000);
  };

  const handleUnifiedShopPurchase = (item: ShopItem) => {
    if (playerGold < item.price) {
      return;
    }

    // Find the clicked item element for glow effect
    const itemElements = document.querySelectorAll(`[data-item-id="${item.id}"]`);
    if (itemElements.length > 0) {
      createPurchaseGlowEffect(itemElements[0] as HTMLElement);
    }

    // Deduct gold
    setPlayerGold(prev => prev - item.price);

    if (item.type === 'equipment') {
      // Add to available equipment
      const newEquipment: Equipment = {
        id: item.id,
        name: item.name,
        type: item.category === 'weapons' ? 'weapon' : 'armor',
        slot: item.category === 'weapons' ? 'weapon' : 'chest',
        rarity: item.rarity,
        stats: {
          attack: item.stats?.attack || 0,
          defense: item.stats?.defense || 0,
          health: item.stats?.health || 0,
          mana: item.stats?.mana || 0,
          speed: item.stats?.speed || 0,
          criticalRate: item.stats?.critRate || 0,
          criticalDamage: item.stats?.critDamage || 0
        },
        description: item.description,
        requirements: { level: 1 },
        value: item.price || 100
      };
      setAvailableEquipment((prev: Equipment[]) => [...prev, newEquipment]);
      
      // Auto-equip if weapon and no weapon equipped
      if (item.category === 'weapons' && !playerEquippedGear.weapon) {
        setPlayerEquippedGear(prev => ({ ...prev, weapon: newEquipment }));
      }
    } else if (item.type === 'gift') {
      // Apply gift effects
      if (item.affectionGain && item.affectionGain > 0) {
        setGameState(prev => ({ ...prev, affection: prev.affection + item.affectionGain! }));
        triggerAffectionSparkle();
      }
      if (item.intimacyGain && item.intimacyGain > 0) {
        setGameState(prev => ({ ...prev, intimacyLevel: (prev.intimacyLevel || 0) + item.intimacyGain! }));
      }
      
      // Add to inventory as gift item
      setPlayerInventory(prev => [...prev, {
        id: item.id,
        name: item.name,
        type: 'gift',
        rarity: item.rarity,
        quantity: 1,
        description: item.description,
        value: item.price,
        usableInCombat: false
      }]);
      
      // Show gift presentation modal for player to give the gift
      setTimeout(() => {
        setSelectedGift(item);
        setShowGiftGiving(true);
      }, 1000);
    } else if (item.type === 'consumable') {
      // Add to inventory
      setPlayerInventory(prev => [...prev, {
        id: item.id,
        name: item.name,
        type: 'consumable',
        rarity: item.rarity,
        quantity: 1,
        description: item.description,
        value: item.price,
        usableInCombat: true,
        effects: {
          healingPower: item.healingPower,
          manaRestore: item.manaRestore,
          buffDuration: item.buffDuration
        }
      }]);
    }
  };

  const characterProgression = useCharacterProgression('solo-leveling-session');
  const { playVoice, stopVoice, isPlaying, currentSpeaker } = useVoice();

  // Function to present a gift to Cha Hae-In
  const presentGiftToChaHaeIn = async (gift: any) => {
    if (!gift) return;

    // Generate Cha Hae-In's reaction based on the gift
    const giftReactions = {
      'elegant_necklace': "Oh my... this is beautiful, Jin-Woo. You really didn't have to, but... thank you. *blushes slightly* I'll treasure it.",
      'premium_perfume': "*eyes light up* This is my favorite brand! How did you know? *smiles warmly* You're very thoughtful.",
      'silk_scarf': "This is so elegant... *touches the silk gently* It's perfect for the upcoming winter. Thank you, Jin-Woo.",
      'golden_bracelet': "*gasps softly* Jin-Woo, this is too much... but it's absolutely gorgeous. *extends her wrist* Help me put it on?",
      'rare_book': "*eyes widen with excitement* This is a first edition! I've been looking for this everywhere. *hugs the book* You're amazing!",
      'tea_set': "A traditional tea set... *smiles nostalgically* This reminds me of my grandmother's. We should have tea together sometime.",
      'chocolate_box': "*smiles sweetly* You remembered I have a sweet tooth! These look absolutely delicious. *opens the box* Want to share them with me?",
      'flower_bouquet': "*gasps in delight* These are gorgeous! *takes a deep breath* They smell wonderful too. Thank you for brightening my day, Jin-Woo."
    };

    const reaction = giftReactions[gift.id as keyof typeof giftReactions] || 
      `*smiles warmly* Thank you for thinking of me, Jin-Woo. This means a lot to me.`;

    // Add gift presentation to chat
    addChatMessage('System', `You present the ${gift.name} to Cha Hae-In...`);
    
    setTimeout(() => {
      addChatMessage('Cha Hae-In', reaction);
      
      // Play her voice response if audio is enabled
      if (!audioMuted) {
        playVoice(reaction, 'Cha Hae-In', audioMuted);
      }

      // Increase affection based on gift value and type with guaranteed minimum
      let affectionIncrease = gift.affectionGain;
      if (!affectionIncrease || affectionIncrease <= 0 || isNaN(affectionIncrease)) {
        const giftPrice = gift.price || 1000;
        affectionIncrease = Math.max(2, Math.floor(giftPrice / 1000));
        if (affectionIncrease <= 0) {
          affectionIncrease = giftPrice >= 5000 ? 5 : giftPrice >= 2000 ? 3 : 2;
        }
      }
      
      setGameState(prev => ({ 
        ...prev, 
        affection: Math.min(100, prev.affection + affectionIncrease)
      }));

      // Show affection increase effect with correct amount
      setAffectionIncreaseAmount(affectionIncrease);
      setShowAffectionIncrease(true);
      triggerAffectionSparkle();
      
      // Auto-hide affection animation after 3 seconds
      setTimeout(() => setShowAffectionIncrease(false), 3000);
      
      addChatMessage('System', `Affection increased by ${affectionIncrease}! Current affection: ${Math.min(100, gameState.affection + affectionIncrease)}`);
    }, 1500);

    setShowGiftGiving(false);
    setSelectedGift(null);
  };
  const { generateStoryNarration, isPlaying: isNarrationPlaying, stopNarration } = useStoryNarration();
  // Relationship system state
  const [relationshipData, setRelationshipData] = useState({
    affectionLevel: gameState.affection * 20,
    intimacyPoints: gameState.affection * 15,
    trustLevel: gameState.affection * 25
  });
  const { 
    playerStats: achievementStats, 
    trackChoice, 
    trackCombatWin, 
    trackShadowExtraction, 
    trackSceneUnlock, 
    trackStoryProgress, 
    trackAffectionChange 
  } = useAchievementSystem();

  const timeRef = useRef<HTMLSpanElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);



  // Complete story data from your original code
  const story: Record<string, StoryScene> = {
    'START': {
      prompt: "Sung Jin-Woo standing in a dark dungeon entrance, purple aura emanating from his body, shadows swirling around him. Anime style, dramatic lighting, Solo Leveling manhwa art style.",
      narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing. Your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
      chat: [{ sender: 'system', text: "The System has granted you a new quest: Win Cha Hae-In's heart!" }],
      choices: [
        { text: "Accept the quest", detail: "Time to level up in romance!", type: 'accept_quest' },
        { text: "Check your stats first", detail: "What are my current abilities?", type: 'check_stats' },
      ],
      leadsTo: { accept_quest: 'FIRST_MEETING', check_stats: 'STATS_CHECK' }
    },
    'STATS_CHECK': {
      prompt: "A glowing blue system window floating in the air showing character stats, RPG interface, Solo Leveling style.",
      narration: "Your System Window appears before you, displaying your incredible power.",
      chat: [{ sender: 'system', text: "Player: Sung Jin-Woo | Level: 146 | Class: Shadow Monarch | Strength: 492 | Intelligence: 385 | Sense: 420 | Special Skill: Shadow Extraction | Title: The Strongest Hunter" }],
      choices: [{ text: "Close window and continue", type: 'continue' }],
      leadsTo: { continue: 'FIRST_MEETING' }
    },
    'FIRST_MEETING': {
      prompt: "Cha Hae-In in her red armor, blonde hair flowing, standing in the Korean Hunters Association building. Beautiful anime girl, Solo Leveling art style.",
      narration: "You arrive at the Korean Hunters Association. There she is - Cha Hae-In, the graceful S-Rank hunter known for her swordsmanship. She notices you approaching, and for the first time in a while, you feel nervous.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo? I heard you cleared another S-Rank gate solo yesterday. That's... impressive." }],
      choices: [
        { text: "Play it cool", detail: "'Just another day's work.'", type: 'play_cool' },
        { text: "Be humble", detail: "'I got lucky, that's all.'", type: 'be_humble' },
        { text: "Ask about her day", detail: "'How was your mission?'", type: 'ask_about_her' },
      ],
      leadsTo: { play_cool: 'COOL_RESPONSE', be_humble: 'HUMBLE_RESPONSE', ask_about_her: 'CARING_RESPONSE' }
    },
    'CARING_RESPONSE': {
      prompt: "Cha Hae-In smiling warmly, her cheeks slightly pink. Cherry blossoms falling in background, romantic anime scene.",
      narration: "Hae-In's expression softens. She seems touched that you asked about her day rather than talking about yourself.",
      chat: [{ sender: 'Cha Hae-In', text: "That's... sweet of you to ask. Most hunters only want to talk about their own achievements. My mission went well, but I'm more interested in hearing about yours." }],
      choices: [
        { text: "Share your adventure", detail: "Tell her about the dungeon", type: 'share_story' },
        { text: "Deflect with humor", detail: "'Mine was boring compared to yours'", type: 'humble_deflect' },
        { text: "Suggest working together", detail: "'Want to team up sometime?'", type: 'team_up' },
      ],
      leadsTo: { share_story: 'STORY_SHARING', humble_deflect: 'HUMBLE_MOMENT', team_up: 'TEAM_PROPOSAL' }
    },
    'TEAM_PROPOSAL': {
      prompt: "Jin-Woo and Cha Hae-In standing together, a gate portal glowing in the background. Adventure partnership scene, anime style.",
      narration: "Hae-In's eyes light up at your suggestion. The idea of working together clearly appeals to her.",
      chat: [{ sender: 'Cha Hae-In', text: "I'd like that. Actually, there's a B-rank gate that appeared this morning. The association wants it cleared, but it's nothing too dangerous. Want to check it out together?" }],
      choices: [
        { text: "Accept eagerly", detail: "'I'd love to.'", type: 'accept_eager' },
        { text: "Act protective", detail: "'Are you sure it's safe?'", type: 'protective' },
        { text: "Show trust in her", detail: "'With your skills? Let's go.'", type: 'trust' },
        { text: "Summon shadow soldiers", detail: "Call your army first", type: 'summon' },
      ],
      leadsTo: { accept_eager: 'EAGER_ACCEPTANCE', protective: 'PROTECTIVE_ROUTE', trust: 'TRUST_ROUTE', summon: 'SHADOW_SUMMON' }
    },
    'SHADOW_SUMMON': {
      prompt: "Jin-Woo summoning his shadow army, Beru, Igris, and Bellion emerging from dark portals. Epic anime scene with purple aura.",
      narration: "You raise your hand, and shadows pour forth from the ground. Your three commanders materialize: Bellion the Grand Marshal, Beru the Ant King, and Igris the Blood-Red Knight.",
      chat: [{ sender: 'system', text: "Shadow soldiers summoned! Your army awaits your command, My Liege." }],
      choices: [
        { text: "Enter the gate", detail: "Time to see what awaits inside", type: 'enter_gate' }
      ],
      leadsTo: { enter_gate: 'ICE_DUNGEON' }
    },
    'ICE_DUNGEON': {
      prompt: "Inside a crystalline ice dungeon with frozen monsters and treacherous paths. Fantasy RPG dungeon, anime style.",
      narration: "The gate leads to an ice realm. Frozen monsters lurk in the crystalline corridors. Hae-In draws her sword, its blade glowing with mana.",
      chat: [{ sender: 'Cha Hae-In', text: "This place gives me chills... but not from the cold. Something powerful is here." }],
      choices: [
        { text: "Lead the way", detail: "Take point with shadows", type: 'lead' },
        { text: "Stay close to Hae-In", detail: "Protect her", type: 'protect' },
        { text: "Split up to cover ground", detail: "Tactical approach", type: 'split' },
      ],
      leadsTo: { lead: 'DUNGEON_PROGRESS', protect: 'PROTECTIVE_DUNGEON', split: 'SPLIT_DUNGEON' }
    },
    'DUNGEON_PROGRESS': {
      prompt: "Jin-Woo and Cha Hae-In fighting ice monsters in perfect synchronization. Epic battle scene, anime style.",
      narration: "You and Hae-In move through the dungeon with deadly efficiency. Your shadows and her swordplay create a perfect dance of destruction.",
      chat: [{ sender: 'Cha Hae-In', text: "We work well together, Jin-Woo. I've never felt so in sync with another hunter." }],
      choices: [
        { text: "Compliment her skills", detail: "'You're incredible.'", type: 'compliment' },
        { text: "Focus on the boss ahead", detail: "Stay tactical", type: 'focus_boss' },
      ],
      leadsTo: { compliment: 'COMPLIMENT_RESPONSE', focus_boss: 'BOSS_APPROACH' }
    },
    'BOSS_APPROACH': {
      prompt: "A massive ice dragon boss emerging from crystalline throne room. Epic boss encounter, anime style.",
      narration: "You reach the boss chamber. A colossal ice dragon sits on a throne of frozen crystal, its eyes glowing with ancient malice.",
      chat: [{ sender: 'system', text: "Boss Encounter: Ancient Ice Dragon - Level 89" }],
      choices: [
        { text: "Attack together", detail: "Coordinate assault", type: 'attack_together' },
        { text: "Use shadow army", detail: "Overwhelm with numbers", type: 'shadow_attack' },
        { text: "Let Hae-In take lead", detail: "Show trust in her", type: 'hae_in_lead' },
      ],
      leadsTo: { attack_together: 'BOSS_BATTLE', shadow_attack: 'SHADOW_VICTORY', hae_in_lead: 'HAE_IN_MOMENT' }
    },
    'BOSS_BATTLE': {
      prompt: "Epic battle against the ice dragon with Jin-Woo and Cha Hae-In fighting together. Action scene, anime style.",
      narration: "The battle is intense. You and Hae-In fight as one, dodging ice shards and landing devastating attacks in perfect coordination.",
      chat: [{ sender: 'Cha Hae-In', text: "Now! Together!" }],
      choices: [
        { text: "Final combined attack", detail: "Shadow + Sword technique", type: 'combined_finisher' }
      ],
      leadsTo: { combined_finisher: 'VICTORY_TOGETHER' }
    },
    'VICTORY_TOGETHER': {
      prompt: "Jin-Woo and Cha Hae-In standing victorious over the defeated ice dragon. Victory celebration, anime style.",
      narration: "The ice dragon falls with a thunderous crash. As the dungeon begins to stabilize, you and Hae-In share a moment of triumph.",
      chat: [{ sender: 'Cha Hae-In', text: "That was incredible! We really do make a perfect team." }],
      choices: [
        { text: "Extract the dragon's shadow", detail: "Add to your army", type: 'extract_shadow' },
        { text: "Focus on Hae-In", detail: "'You were amazing.'", type: 'focus_hae_in' },
      ],
      leadsTo: { extract_shadow: 'SHADOW_EXTRACTION', focus_hae_in: 'ROMANTIC_MOMENT' }
    },
    'ROMANTIC_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In alone in a beautiful crystal cavern, soft light reflecting off ice formations. Romantic anime scene.",
      narration: "As the dungeon settles, you find yourselves in a breathtaking crystal cavern. The light creates a magical atmosphere around you both.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo... why did you really invite me today? It wasn't just about clearing the gate, was it?" }],
      choices: [
        { text: "Confess your feelings", detail: "'I wanted to be with you.'", type: 'confess' },
        { text: "Tease her gently", detail: "'Maybe you're imagining things.'", type: 'tease' },
        { text: "Take her hand", detail: "Show don't tell", type: 'take_hand' },
      ],
      leadsTo: { confess: 'CONFESSION', tease: 'TEASE_RESPONSE', take_hand: 'HAND_HOLDING' }
    },
    'CONFESSION': {
      prompt: "Jin-Woo and Cha Hae-In facing each other, magical atmosphere with floating light particles. Romantic confession scene, anime style.",
      narration: "You take a deep breath. Even facing the Monarchs wasn't this nerve-wracking.",
      chat: [{ sender: 'player', text: "Hae-In, I've faced countless monsters and even death itself. But nothing scares me more than the thought of not telling you how I feel. I... I've fallen for you." }],
      choices: [
        { text: "Wait for her response", detail: "Give her time to process", type: 'wait' }
      ],
      leadsTo: { wait: 'CONFESSION_RESPONSE' }
    },
    'CONFESSION_RESPONSE': {
      prompt: "Cha Hae-In with tears of joy in her eyes, reaching out to Jin-Woo. Beautiful romantic anime scene with sparkles.",
      narration: "Hae-In's eyes widen, then fill with tears. But she's smiling - the most beautiful smile you've ever seen.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo... I've been waiting to hear those words. I've loved you since the day you saved everyone from the Ant King. Your mana doesn't just smell nice to me - it feels like home." }],
      choices: [
        { text: "Kiss her", detail: "Actions speak louder than words", type: 'kiss' },
        { text: "Hold her close", detail: "Embrace this moment", type: 'embrace' },
      ],
      leadsTo: { kiss: 'FIRST_KISS', embrace: 'TENDER_EMBRACE' }
    },
    'FIRST_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing their first kiss in the crystal cavern, magical light surrounding them. Ultimate romantic scene, anime style.",
      narration: "Time seems to stop as you lean in and kiss her. The world melts away, leaving only this perfect moment. For once, the Shadow Monarch has found his light.",
      chat: [{ sender: 'system', text: "Quest Complete: Win Cha Hae-In's heart! Maximum affection achieved!" }],
      choices: [
        { text: "Plan your future together", detail: "Talk about what comes next", type: 'future_plans' },
        { text: "Enjoy this moment", detail: "Stay in the present", type: 'savor_moment' },
      ],
      leadsTo: { future_plans: 'HAPPY_ENDING', savor_moment: 'PERFECT_MOMENT' }
    },
    'HAPPY_ENDING': {
      prompt: "Jin-Woo and Cha Hae-In walking hand in hand toward the gate exit, shadow soldiers respectfully following behind. Happy ending scene, anime style.",
      narration: "You've conquered the most difficult challenge of all - love. With Hae-In by your side and your shadow army as witnesses, you're ready for whatever adventures await.",
      chat: [{ sender: 'Cha Hae-In', text: "So, Shadow Monarch... ready for our next quest together?" }],
      choices: [
        { text: "Start a new adventure", detail: "Begin again", type: 'restart' }
      ],
      leadsTo: { restart: 'START' }
    },
    'EAGER_ACCEPTANCE': {
      prompt: "Jin-Woo and Cha Hae-In walking side by side toward a glowing dungeon portal. Excited partnership energy, anime style.",
      narration: "Your enthusiasm brings a genuine smile to Hae-In's face. She seems pleased by your immediate acceptance.",
      chat: [
        { sender: 'player', text: "I'd love to. Let's head out right away!" },
        { sender: 'Cha Hae-In', text: "Perfect! Your eagerness is... refreshing. Most hunters are more cautious with me." },
        { sender: 'Cha Hae-In', text: "Shall we grab some coffee first? The gate won't disappear for a few hours." }
      ],
      choices: [
        { text: "Suggest a café", detail: "'I know a perfect place.'", type: 'cafe_suggestion' },
        { text: "Head straight to gate", detail: "'Let's get this done first.'", type: 'gate_priority' },
        { text: "Ask about her preferences", detail: "'What do you prefer?'", type: 'ask_preference' }
      ],
      leadsTo: { cafe_suggestion: 'COFFEE_DATE', gate_priority: 'GATE_ENTRANCE', ask_preference: 'PREFERENCE_RESPONSE' }
    },
    'COFFEE_DATE': {
      prompt: "Wide shot of cozy Korean café interior with Sung Jin-Woo and Cha Hae-In sitting across from each other at a wooden table, coffee cups between them, warm ambient lighting, intimate conversation, both characters visible in frame, Solo Leveling manhwa art style.",
      narration: "The café is quiet and warm. Hae-In relaxes visibly, her usual hunter alertness softening into something more personal. You're both sitting at a cozy table, coffee steaming between you.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is nice. It's been a while since I could just... talk with someone who understands this life." },
        { sender: 'Cha Hae-In', text: "Your mana feels so calm here. It's comforting." }
      ],
      choices: [
        { text: "Ask about her past", detail: "'Tell me about your journey.'", type: 'ask_past' },
        { text: "Share your own story", detail: "Open up about your experiences", type: 'share_past' },
        { text: "Focus on the present", detail: "'I'm just glad we're here now.'", type: 'present_focus' }
      ],
      leadsTo: { ask_past: 'PAST_SHARING', share_past: 'MUTUAL_OPENING', present_focus: 'PRESENT_MOMENT' }
    },
    'PRESENT_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In enjoying a peaceful moment together, hands almost touching across the café table. Tender anime scene.",
      narration: "The moment feels perfect. No monsters, no danger - just two people finding connection in an extraordinary world.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right. This moment is all that matters." },
        { sender: 'Cha Hae-In', text: "Should we head to that gate now? I'm ready for anything with you by my side." }
      ],
      choices: [
        { text: "Take her hand", detail: "Show your feelings", type: 'take_hand' },
        { text: "Head to the gate", detail: "Continue the mission", type: 'mission_continue' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', mission_continue: 'GATE_ENTRANCE' }
    },
    'HAND_HOLDING': {
      prompt: "Close-up wide shot of cozy Korean café table with Sung Jin-Woo and Cha Hae-In holding hands across the wooden surface, coffee cups nearby, both characters visible with gentle blushes, warm lighting, intimate romantic moment, Solo Leveling manhwa art style.",
      narration: "Your hand finds hers naturally. She doesn't pull away - instead, her fingers intertwine with yours. The café feels even more intimate now.",
      chat: [
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping you'd do that." },
        { sender: 'player', text: "I've wanted to for a long time." }
      ],
      choices: [
        { text: "Confess your feelings", detail: "'I care about you deeply.'", type: 'confess' },
        { text: "Let the moment speak", detail: "Enjoy the connection", type: 'silent_moment' }
      ],
      leadsTo: { confess: 'CAFE_CONFESSION', silent_moment: 'UNDERSTANDING_MOMENT' }
    },
    'DAILY_LIFE_HUB': {
      prompt: "Jin-Woo's modern apartment with city view, cozy and lived-in. Daily life setting, anime style.",
      narration: "You're in your apartment, the central hub of your daily life. From here, you can plan your activities, spend time with Hae-In, or venture out into the hunter world.",
      chat: [
        { sender: 'system', text: "Welcome to your daily life. What would you like to do today?" }
      ],
      choices: [
        { text: "Go to Hunter Marketplace", detail: "Buy gifts for Hae-In", type: 'visit_marketplace' },
        { text: "Call Hae-In for a date", detail: "Spend romantic time together", type: 'call_date' },
        { text: "Take on a dungeon mission", detail: "Earn gold and experience", type: 'solo_mission' },
        { text: "Rest and recover", detail: "Restore energy", type: 'rest_recovery' }
      ],
      leadsTo: { visit_marketplace: 'HUNTER_MARKETPLACE', call_date: 'COFFEE_DATE', solo_mission: 'GATE_ENTRANCE', rest_recovery: 'DAILY_LIFE_HUB' }
    },
    'HUNTER_MARKETPLACE': {
      prompt: "Bustling hunter marketplace with magical items and gifts. Shopping district, anime style.",
      narration: "The Hunter Marketplace buzzes with activity. Vendors sell everything from magical weapons to beautiful gifts perfect for someone special.",
      chat: [
        { sender: 'system', text: "The marketplace has many gifts available for purchase. What catches your eye?" }
      ],
      choices: [
        { text: "Browse romantic gifts", detail: "Find something special for Hae-In", type: 'browse_gifts' },
        { text: "Check weapon upgrades", detail: "Improve your equipment", type: 'weapon_shop' },
        { text: "Return to apartment", detail: "Head back home", type: 'return_home' }
      ],
      leadsTo: { browse_gifts: 'GIFT_SELECTION', weapon_shop: 'WEAPON_SHOP', return_home: 'DAILY_LIFE_HUB' }
    },
    'GATE_ENTRANCE': {
      prompt: "Jin-Woo and Cha Hae-In standing before a B-rank dungeon portal, ready for adventure. Epic gate entrance scene, anime style.",
      narration: "The gate pulses with magical energy. You and Hae-In stand ready, your partnership already feeling natural.",
      chat: [
        { sender: 'Cha Hae-In', text: "Ready, partner? Let's show this dungeon what we can do together." }
      ],
      choices: [
        { text: "Enter together", detail: "Step through as a team", type: 'enter_gate' },
        { text: "Return to daily life", detail: "Head back to your apartment", type: 'return_home' }
      ],
      leadsTo: { enter_gate: 'COMBAT_DUNGEON', return_home: 'DAILY_LIFE_HUB' }
    },
    'COMBAT_DUNGEON': {
      prompt: "Dark stone dungeon corridor with glowing purple crystals, monster shadows lurking ahead.",
      narration: "The dungeon air is thick with malevolent energy. Strange sounds echo from the depths ahead. Several large monsters block your path forward - dire wolves and an orc chieftain guard the passage.",
      chat: [
        { sender: 'Cha Hae-In', text: "Multiple hostiles detected ahead. I count at least four enemies." },
        { sender: 'system', text: "Combat encounter! Choose your approach carefully." }
      ],
      choices: [
        { text: "Launch shadow attack", detail: "Strike first with shadow soldiers", type: 'shadow_attack' },
        { text: "Coordinate sword strike", detail: "Team attack with Hae-In", type: 'sword_strike' },
        { text: "Cast magic blast", detail: "Use mana for ranged assault", type: 'magic_blast' }
      ],
      leadsTo: { shadow_attack: 'COMBAT_VICTORY', sword_strike: 'COMBAT_VICTORY', magic_blast: 'COMBAT_VICTORY' }
    },
    'COMBAT_VICTORY': {
      prompt: "Jin-Woo and Cha Hae-In standing victorious over defeated monsters, glowing with post-battle energy.",
      narration: "Your combined skills proved overwhelming. The monsters lie defeated, and valuable loot sparkles in the dungeon light.",
      chat: [
        { sender: 'Cha Hae-In', text: "Excellent teamwork! Your combat skills have improved significantly." },
        { sender: 'system', text: "Victory! +500 EXP, +200 Gold, Rare Item Found!" }
      ],
      choices: [
        { text: "Continue deeper", detail: "Explore further into the dungeon", type: 'explore_deeper' },
        { text: "Search for treasure", detail: "Look for hidden loot", type: 'treasure_hunt' },
        { text: "Take a break together", detail: "Rest and recover with Hae-In", type: 'rest_together' }
      ],
      leadsTo: { explore_deeper: 'BOSS_CHAMBER', treasure_hunt: 'TREASURE_ROOM', rest_together: 'ROMANTIC_REST' }
    },
    'BOSS_CHAMBER': {
      prompt: "Massive chamber with ancient dragon sleeping on pile of gold, epic boss arena, dramatic lighting.",
      narration: "You've reached the boss chamber. An enormous ancient dragon stirs as you enter, its eyes glowing with centuries of accumulated power and fury.",
      chat: [
        { sender: 'Cha Hae-In', text: "Jin-Woo... this is a legendary-class monster. We need to be perfectly coordinated." },
        { sender: 'system', text: "BOSS FIGHT: Ancient Shadow Dragon - Level 95!" }
      ],
      choices: [
        { text: "Engage the dragon", detail: "Direct confrontation with the beast", type: 'dragon_fight' },
        { text: "Ultimate shadow extraction", detail: "Use your most powerful ability", type: 'ultimate_strike' },
        { text: "Combined finisher attack", detail: "Coordinate with Hae-In for maximum damage", type: 'combined_attack' }
      ],
      leadsTo: { dragon_fight: 'DRAGON_BATTLE', ultimate_strike: 'DRAGON_BATTLE', combined_attack: 'DRAGON_BATTLE' }
    },
    'DRAGON_BATTLE': {
      prompt: "Epic battle scene with Jin-Woo and Cha Hae-In fighting massive dragon, energy blasts and sword strikes.",
      narration: "The battle is fierce and intense. The dragon's roar shakes the entire chamber as you and Hae-In fight with everything you have.",
      chat: [
        { sender: 'Cha Hae-In', text: "Now Jin-Woo! Strike while it's distracted!" },
        { sender: 'system', text: "The dragon staggers! This is your chance for a finishing blow!" }
      ],
      choices: [
        { text: "Deliver final attack", detail: "End the battle with decisive strike", type: 'final_attack' },
        { text: "Extract dragon's shadow", detail: "Attempt to gain the dragon as ally", type: 'extract_shadow' },
        { text: "Protect Hae-In", detail: "Ensure her safety above all", type: 'protect_hae_in' }
      ],
      leadsTo: { final_attack: 'VICTORY_CELEBRATION', extract_shadow: 'SHADOW_DRAGON_VICTORY', protect_hae_in: 'HEROIC_MOMENT' }
    },
    'VICTORY_CELEBRATION': {
      prompt: "Jin-Woo and Cha Hae-In celebrating their epic dragon victory together.",
      narration: "The mighty dragon lies defeated. You and Hae-In stand triumphant, your teamwork having conquered one of the most dangerous monsters in existence.",
      chat: [
        { sender: 'Cha Hae-In', text: "We did it! That was incredible teamwork, Jin-Woo!" },
        { sender: 'system', text: "Epic Victory! +2000 EXP, +1000 Gold, Legendary Dragon Core obtained!" }
      ],
      choices: [
        { text: "Celebrate with Hae-In", detail: "Share this moment together", type: 'celebrate_together' },
        { text: "Return to Daily Life Hub", detail: "Head back home", type: 'return_hub' }
      ],
      leadsTo: { celebrate_together: 'ROMANTIC_MOMENT', return_hub: 'DAILY_LIFE_HUB' }
    },
    'PROTECTIVE_ROUTE': {
      prompt: "Jin-Woo showing concern for Cha Hae-In's safety. Protective gesture, anime style.",
      narration: "Your protective instinct shows, and Hae-In's expression softens at your concern.",
      chat: [
        { sender: 'player', text: "Are you sure it's safe? I don't want anything to happen to you." },
        { sender: 'Cha Hae-In', text: "That's... sweet of you to worry. But I'm an S-rank hunter, Jin-Woo. I can handle myself." },
        { sender: 'Cha Hae-In', text: "Though having the Shadow Monarch watching my back wouldn't hurt." }
      ],
      choices: [
        { text: "Apologize for overprotecting", detail: "'You're right, I'm sorry.'", type: 'apologize' },
        { text: "Stand by your concern", detail: "'I still want to keep you safe.'", type: 'stay_protective' },
        { text: "Compliment her strength", detail: "'You're incredible, but I still worry.'", type: 'compliment_strength' }
      ],
      leadsTo: { apologize: 'APOLOGY_RESPONSE', stay_protective: 'PROTECTIVE_ACCEPTED', compliment_strength: 'STRENGTH_ACKNOWLEDGMENT' }
    },
    'TRUST_ROUTE': {
      prompt: "Jin-Woo showing complete confidence in Cha Hae-In's abilities. Trust and respect, anime style.",
      narration: "Your complete faith in her abilities makes Hae-In's eyes sparkle with appreciation.",
      chat: [
        { sender: 'player', text: "With your skills? Let's go. I have complete faith in you." },
        { sender: 'Cha Hae-In', text: "Your trust means everything to me, Jin-Woo. More than you know." },
        { sender: 'Cha Hae-In', text: "Having a partner who believes in me... it's been a while since I felt this confident." }
      ],
      choices: [
        { text: "Express mutual trust", detail: "'We make a great team.'", type: 'mutual_trust' },
        { text: "Focus on her confidence", detail: "'You should always feel this way.'", type: 'confidence_boost' },
        { text: "Suggest regular partnerships", detail: "'We should do this more often.'", type: 'partnership_suggestion' }
      ],
      leadsTo: { mutual_trust: 'MUTUAL_TRUST_MOMENT', confidence_boost: 'CONFIDENCE_BUILDING', partnership_suggestion: 'PARTNERSHIP_DISCUSSION' }
    },
    'APOLOGY_RESPONSE': {
      prompt: "Jin-Woo apologizing with sincere expression while Cha Hae-In smiles warmly. Understanding moment, anime style.",
      narration: "Your sincere apology earns you a warm smile from Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "You don't need to apologize. It's actually... nice to have someone care that much." },
        { sender: 'Cha Hae-In', text: "Most people either fear my strength or try to use it. You just want to protect me." }
      ],
      choices: [
        { text: "Express your feelings", detail: "'Because you matter to me.'", type: 'express_feelings' },
        { text: "Head to the gate", detail: "Continue the mission", type: 'mission_continue' }
      ],
      leadsTo: { express_feelings: 'FEELINGS_REVEALED', mission_continue: 'GATE_ENTRANCE' }
    },
    'PROTECTIVE_ACCEPTED': {
      prompt: "Cha Hae-In accepting Jin-Woo's protective nature with a gentle smile. Acceptance scene, anime style.",
      narration: "Hae-In steps closer, her expression softening even more.",
      chat: [
        { sender: 'Cha Hae-In', text: "You know what? I like that you want to protect me. Even if I don't need it." },
        { sender: 'Cha Hae-In', text: "It makes me feel... special. Like I'm more than just a weapon to you." }
      ],
      choices: [
        { text: "You are special", detail: "Tell her how you see her", type: 'you_are_special' },
        { text: "You're everything to me", detail: "Deep confession", type: 'everything_to_me' }
      ],
      leadsTo: { you_are_special: 'SPECIAL_MOMENT', everything_to_me: 'DEEP_CONFESSION' }
    },
    'STRENGTH_ACKNOWLEDGMENT': {
      prompt: "Jin-Woo admiring Cha Hae-In's strength while showing care. Balanced respect and protection, anime style.",
      narration: "Your words strike the perfect balance between respect and care.",
      chat: [
        { sender: 'Cha Hae-In', text: "That's... exactly what I needed to hear. You see my strength but still care about my safety." },
        { sender: 'Cha Hae-In', text: "Most people do one or the other, never both." }
      ],
      choices: [
        { text: "That's what partners do", detail: "Emphasize teamwork", type: 'partners_care' },
        { text: "That's what love is", detail: "Hint at deeper feelings", type: 'love_hint' }
      ],
      leadsTo: { partners_care: 'PARTNERSHIP_BOND', love_hint: 'LOVE_REALIZATION' }
    },
    'MUTUAL_TRUST_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing a moment of complete understanding and trust. Perfect partnership, anime style.",
      narration: "The connection between you feels electric. This is what true partnership should be.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really do make an incredible team. I've never felt this in sync with anyone." },
        { sender: 'player', text: "It's like we were meant to fight together." }
      ],
      choices: [
        { text: "Maybe more than fight", detail: "Hint at romance", type: 'more_than_fight' },
        { text: "Let's prove it in that gate", detail: "Focus on mission", type: 'prove_partnership' }
      ],
      leadsTo: { more_than_fight: 'ROMANTIC_HINT', prove_partnership: 'GATE_ENTRANCE' }
    },
    'CONFIDENCE_BUILDING': {
      prompt: "Cha Hae-In glowing with confidence from Jin-Woo's encouragement. Empowering moment, anime style.",
      narration: "Your words ignite something powerful in Hae-In's eyes.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right. I should feel this confident all the time." },
        { sender: 'Cha Hae-In', text: "With you believing in me like this... I feel like I could take on anything." }
      ],
      choices: [
        { text: "You can take on anything", detail: "Pure encouragement", type: 'pure_encouragement' },
        { text: "We can take on anything", detail: "Together emphasis", type: 'together_strength' }
      ],
      leadsTo: { pure_encouragement: 'EMPOWERED_HAE_IN', together_strength: 'UNIFIED_STRENGTH' }
    },
    'PARTNERSHIP_DISCUSSION': {
      prompt: "Jin-Woo and Cha Hae-In discussing future adventures together. Planning scene, anime style.",
      narration: "The idea of regular partnerships clearly excites Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "I'd love that! We could be an official team. The Shadow Monarch and the Sword Saint." },
        { sender: 'Cha Hae-In', text: "Though... would this be just professional, or...?" }
      ],
      choices: [
        { text: "Professional partnership", detail: "Keep it business", type: 'professional_only' },
        { text: "Something more personal", detail: "Open to romance", type: 'personal_partnership' },
        { text: "Whatever feels right", detail: "Let it develop naturally", type: 'natural_development' }
      ],
      leadsTo: { professional_only: 'PROFESSIONAL_BOND', personal_partnership: 'PERSONAL_BOND', natural_development: 'NATURAL_BOND' }
    },
    'PREFERENCE_RESPONSE': {
      prompt: "Cha Hae-In considering Jin-Woo's thoughtful question. Appreciation for his consideration, anime style.",
      narration: "Your consideration for her preferences clearly touches Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're asking what I prefer? That's... refreshing. Most people just assume." },
        { sender: 'Cha Hae-In', text: "I'd like the coffee first. A quiet moment before the chaos of battle." }
      ],
      choices: [
        { text: "Lead to a café", detail: "Take her somewhere nice", type: 'cafe_suggestion' },
        { text: "Find a quiet spot nearby", detail: "Simple and close", type: 'quiet_spot' }
      ],
      leadsTo: { cafe_suggestion: 'COFFEE_DATE', quiet_spot: 'QUIET_MOMENT' }
    },
    'PROTECTIVE_DUNGEON': {
      prompt: "Jin-Woo staying protectively close to Cha Hae-In in the icy dungeon. Protective formation, anime style.",
      narration: "You position yourself to shield Hae-In from potential threats, though she seems amused by your protectiveness.",
      chat: [
        { sender: 'Cha Hae-In', text: "You know I can handle myself, right? But... I don't mind having you close." }
      ],
      choices: [
        { text: "Stay protective", detail: "Continue guarding her", type: 'continue_protecting' },
        { text: "Give her space", detail: "Trust her abilities", type: 'trust_abilities' }
      ],
      leadsTo: { continue_protecting: 'PROTECTION_APPRECIATED', trust_abilities: 'TRUST_DEMONSTRATED' }
    },
    'SPLIT_DUNGEON': {
      prompt: "Jin-Woo and Cha Hae-In splitting up to cover more ground tactically. Strategic separation, anime style.",
      narration: "You and Hae-In split up to clear the dungeon more efficiently, maintaining contact through hand signals.",
      chat: [
        { sender: 'Cha Hae-In', text: "Good strategy. I'll take the left corridor, you take the right. Signal if you need backup." }
      ],
      choices: [
        { text: "Reunite after clearing", detail: "Meet at the center", type: 'reunite_center' },
        { text: "Check on her frequently", detail: "Stay in communication", type: 'frequent_contact' }
      ],
      leadsTo: { reunite_center: 'TACTICAL_SUCCESS', frequent_contact: 'CARING_TACTICS' }
    },
    'COMPLIMENT_RESPONSE': {
      prompt: "Cha Hae-In blushing from Jin-Woo's compliment. Sweet reaction, anime style.",
      narration: "Your compliment brings a beautiful blush to Hae-In's cheeks.",
      chat: [
        { sender: 'Cha Hae-In', text: "You think I'm incredible? Coming from the Shadow Monarch, that means everything." },
        { sender: 'Cha Hae-In', text: "I've always admired your strength, but hearing you say that..." }
      ],
      choices: [
        { text: "You inspire me too", detail: "Mutual admiration", type: 'mutual_inspiration' },
        { text: "Focus on the boss", detail: "Stay mission-focused", type: 'focus_boss' }
      ],
      leadsTo: { mutual_inspiration: 'INSPIRATION_MOMENT', focus_boss: 'BOSS_APPROACH' }
    },
    'PAST_SHARING': {
      prompt: "Cha Hae-In opening up about her past over coffee. Intimate conversation, anime style.",
      narration: "Hae-In's walls come down as she shares her journey.",
      chat: [
        { sender: 'Cha Hae-In', text: "I became a hunter to protect people, but somewhere along the way, I lost myself in the strength." },
        { sender: 'Cha Hae-In', text: "Until I met you. Your mana... it reminds me why I started this path." }
      ],
      choices: [
        { text: "Share your own struggles", detail: "Open up about your journey", type: 'share_struggles' },
        { text: "You found yourself again", detail: "Encourage her growth", type: 'found_yourself' }
      ],
      leadsTo: { share_struggles: 'MUTUAL_VULNERABILITY', found_yourself: 'GROWTH_RECOGNITION' }
    },
    'MUTUAL_OPENING': {
      prompt: "Jin-Woo sharing his own story while Cha Hae-In listens intently. Deep connection, anime style.",
      narration: "As you open up about your journey from E-rank to Shadow Monarch, Hae-In listens with complete attention.",
      chat: [
        { sender: 'player', text: "I was weak once. So weak that I nearly died in an E-rank dungeon. But that weakness taught me something important." },
        { sender: 'Cha Hae-In', text: "What did it teach you?" },
        { sender: 'player', text: "That strength without someone to protect is meaningless." }
      ],
      choices: [
        { text: "Look into her eyes", detail: "Create intimate moment", type: 'eye_contact' },
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' }
      ],
      leadsTo: { eye_contact: 'INTIMATE_MOMENT', take_hand: 'HAND_HOLDING' }
    },
    'CAFE_CONFESSION': {
      prompt: "Jin-Woo confessing his feelings in the café while holding Cha Hae-In's hand. Romantic confession, anime style.",
      narration: "With her hand in yours, the words come naturally.",
      chat: [
        { sender: 'player', text: "Hae-In, I care about you deeply. More than just as a fellow hunter." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping you'd say that. I feel the same way." }
      ],
      choices: [
        { text: "Kiss her gently", detail: "Seal the moment", type: 'gentle_kiss' },
        { text: "Plan a real date", detail: "Ask her out properly", type: 'real_date' },
        { text: "Suggest working together", detail: "Team up for missions", type: 'team_missions' }
      ],
      leadsTo: { gentle_kiss: 'CAFE_KISS', real_date: 'DATE_PLANNING', team_missions: 'GATE_ENTRANCE' }
    },
    'UNDERSTANDING_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing a moment of silent understanding. Perfect connection, anime style.",
      narration: "Sometimes words aren't needed. The connection between you speaks volumes.",
      chat: [
        { sender: 'Cha Hae-In', text: "I understand. This feels... right, doesn't it?" },
        { sender: 'player', text: "More right than anything I've ever felt." }
      ],
      choices: [
        { text: "Stay in this moment", detail: "Savor the connection", type: 'savor_connection' },
        { text: "Head to the gate together", detail: "Face adventure as one", type: 'mission_continue' }
      ],
      leadsTo: { savor_connection: 'CONNECTION_DEEPENS', mission_continue: 'GATE_ENTRANCE' }
    },
    'FEELINGS_REVEALED': {
      prompt: "Jin-Woo expressing his deep feelings for Cha Hae-In. Heartfelt moment, anime style.",
      narration: "Your honest words hang in the air between you.",
      chat: [
        { sender: 'player', text: "Because you matter to me, Hae-In. More than I ever thought possible." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping to hear something like that from you." }
      ],
      choices: [
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' },
        { text: "Move closer", detail: "Close the distance", type: 'move_closer' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', move_closer: 'INTIMATE_CLOSENESS' }
    },
    'SPECIAL_MOMENT': {
      prompt: "Cha Hae-In feeling truly special and valued. Emotional recognition, anime style.",
      narration: "Your words touch something deep in Hae-In's heart.",
      chat: [
        { sender: 'Cha Hae-In', text: "No one has ever made me feel this special before. Like I'm more than just my abilities." },
        { sender: 'player', text: "You are so much more than that. You're everything." }
      ],
      choices: [
        { text: "Hold her close", detail: "Embrace the moment", type: 'embrace' },
        { text: "Look into her eyes", detail: "Deep connection", type: 'eye_contact' }
      ],
      leadsTo: { embrace: 'TENDER_EMBRACE', eye_contact: 'SOUL_CONNECTION' }
    },
    'DEEP_CONFESSION': {
      prompt: "Jin-Woo making a deep emotional confession. Ultimate romantic moment, anime style.",
      narration: "The depth of your feelings pours out.",
      chat: [
        { sender: 'player', text: "You're everything to me, Hae-In. My light in the darkness, my reason to be more than just the Shadow Monarch." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... you're going to make me cry. Happy tears." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal your confession", type: 'passionate_kiss' },
        { text: "Wipe her tears", detail: "Tender gesture", type: 'wipe_tears' }
      ],
      leadsTo: { passionate_kiss: 'PASSIONATE_MOMENT', wipe_tears: 'TENDER_CARE' }
    },
    'PARTNERSHIP_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming a perfect partnership bond. Team unity, anime style.",
      narration: "The understanding between you grows stronger.",
      chat: [
        { sender: 'Cha Hae-In', text: "That's exactly right. Partners watch out for each other, no matter how strong they are." },
        { sender: 'player', text: "Always. That's what makes us stronger together." }
      ],
      choices: [
        { text: "Suggest making it official", detail: "Formal partnership", type: 'official_partnership' },
        { text: "Head to the gate", detail: "Test the partnership", type: 'mission_continue' }
      ],
      leadsTo: { official_partnership: 'OFFICIAL_TEAM', mission_continue: 'GATE_ENTRANCE' }
    },
    'LOVE_REALIZATION': {
      prompt: "Both realizing their feelings run deeper than partnership. Love dawning, anime style.",
      narration: "The word 'love' changes everything between you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Love? Is that what this is?" },
        { sender: 'player', text: "I think it might be. What I feel for you... it's more than partnership." }
      ],
      choices: [
        { text: "Confess your love", detail: "Full confession", type: 'love_confession' },
        { text: "Ask about her feelings", detail: "Seek reciprocation", type: 'ask_feelings' }
      ],
      leadsTo: { love_confession: 'LOVE_DECLARATION', ask_feelings: 'MUTUAL_FEELINGS' }
    },
    'ROMANTIC_HINT': {
      prompt: "Jin-Woo hinting at romantic possibilities beyond fighting. Romance emerging, anime style.",
      narration: "Your suggestion opens new possibilities.",
      chat: [
        { sender: 'Cha Hae-In', text: "More than fight? What did you have in mind?" },
        { sender: 'player', text: "Maybe... spend time together outside of dungeons? Just us." }
      ],
      choices: [
        { text: "Ask her on a date", detail: "Direct romantic approach", type: 'date_request' },
        { text: "Suggest casual hanging out", detail: "Gentle approach", type: 'casual_time' }
      ],
      leadsTo: { date_request: 'DATE_ACCEPTED', casual_time: 'CASUAL_AGREEMENT' }
    },
    'EMPOWERED_HAE_IN': {
      prompt: "Cha Hae-In radiating confidence and power. Empowerment moment, anime style.",
      narration: "Your belief in her transforms Hae-In completely.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right! I can take on anything! With this confidence... I feel unstoppable!" },
        { sender: 'player', text: "That's the Cha Hae-In I know. Fierce and beautiful." }
      ],
      choices: [
        { text: "Channel that energy", detail: "Direct it to the mission", type: 'channel_energy' },
        { text: "Admire her strength", detail: "Appreciate her power", type: 'admire_strength' }
      ],
      leadsTo: { channel_energy: 'ENERGIZED_MISSION', admire_strength: 'STRENGTH_APPRECIATION' }
    },
    'UNIFIED_STRENGTH': {
      prompt: "Jin-Woo and Cha Hae-In as a unified force. Perfect team synergy, anime style.",
      narration: "Together, you feel invincible.",
      chat: [
        { sender: 'Cha Hae-In', text: "We can take on anything together! This feeling... it's incredible!" },
        { sender: 'player', text: "Nothing can stand against us when we're united like this." }
      ],
      choices: [
        { text: "Prove it in battle", detail: "Test your unity", type: 'unity_test' },
        { text: "Seal it with a promise", detail: "Commit to each other", type: 'unity_promise' }
      ],
      leadsTo: { unity_test: 'GATE_ENTRANCE', unity_promise: 'PARTNERSHIP_VOW' }
    },
    'PROFESSIONAL_BOND': {
      prompt: "Establishing a professional hunting partnership. Business relationship, anime style.",
      narration: "You decide to keep things professional, for now.",
      chat: [
        { sender: 'Cha Hae-In', text: "Professional it is. Though... I hope we can still be friends outside of hunting." },
        { sender: 'player', text: "Of course. The best partnerships are built on friendship." }
      ],
      choices: [
        { text: "Suggest coffee meetings", detail: "Regular friendly meetings", type: 'friend_meetings' },
        { text: "Focus on the mission", detail: "Stay work-focused", type: 'mission_focus' }
      ],
      leadsTo: { friend_meetings: 'FRIENDSHIP_BUILDING', mission_focus: 'GATE_ENTRANCE' }
    },
    'PERSONAL_BOND': {
      prompt: "Opening up to a more personal relationship. Romance beginning, anime style.",
      narration: "The personal nature of your partnership feels right.",
      chat: [
        { sender: 'Cha Hae-In', text: "Personal... I'd like that very much. You mean a lot to me, Jin-Woo." },
        { sender: 'player', text: "You mean everything to me, Hae-In." }
      ],
      choices: [
        { text: "Take her hand", detail: "Show affection", type: 'take_hand' },
        { text: "Plan a real date", detail: "Romance properly", type: 'plan_date' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', plan_date: 'DATE_PLANNING' }
    },
    'NATURAL_BOND': {
      prompt: "Letting the relationship develop naturally. Organic growth, anime style.",
      narration: "Sometimes the best things happen naturally.",
      chat: [
        { sender: 'Cha Hae-In', text: "I like that approach. Let's see where this takes us." },
        { sender: 'player', text: "Whatever feels right between us." }
      ],
      choices: [
        { text: "Start with this mission", detail: "Begin the journey", type: 'begin_journey' },
        { text: "Share a moment", detail: "Connect now", type: 'share_moment' }
      ],
      leadsTo: { begin_journey: 'GATE_ENTRANCE', share_moment: 'NATURAL_MOMENT' }
    },
    'QUIET_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In finding a peaceful spot together. Intimate quiet time, anime style.",
      narration: "You find a quiet park bench with a view of the city.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is perfect. Just peaceful silence with someone who understands." },
        { sender: 'player', text: "Sometimes words aren't necessary." }
      ],
      choices: [
        { text: "Enjoy the silence", detail: "Comfortable quiet", type: 'comfortable_silence' },
        { text: "Talk about dreams", detail: "Share aspirations", type: 'share_dreams' }
      ],
      leadsTo: { comfortable_silence: 'PEACEFUL_CONNECTION', share_dreams: 'DREAM_SHARING' }
    },
    'PROTECTION_APPRECIATED': {
      prompt: "Cha Hae-In appreciating Jin-Woo's protective nature in the dungeon. Warmth in danger, anime style.",
      narration: "Your continued protection earns you a warm smile from Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "I appreciate this, Jin-Woo. Even if I don't need it, knowing you care this much..." },
        { sender: 'player', text: "I'll always watch over you, no matter how strong you are." }
      ],
      choices: [
        { text: "Continue deeper", detail: "Advance through dungeon", type: 'advance_dungeon' },
        { text: "Stay close together", detail: "Maintain formation", type: 'stay_together' }
      ],
      leadsTo: { advance_dungeon: 'DUNGEON_PROGRESS', stay_together: 'CLOSE_FORMATION' }
    },
    'TRUST_DEMONSTRATED': {
      prompt: "Jin-Woo showing trust in Cha Hae-In's abilities during combat. Mutual respect, anime style.",
      narration: "You step back, giving Hae-In the space to show her true skills.",
      chat: [
        { sender: 'Cha Hae-In', text: "Thank you for trusting me. Watch this!" },
        { sender: 'system', text: "Cha Hae-In unleashes her full sword technique!" }
      ],
      choices: [
        { text: "Support from shadows", detail: "Complement her attacks", type: 'shadow_support' },
        { text: "Admire her technique", detail: "Appreciate her skill", type: 'admire_technique' }
      ],
      leadsTo: { shadow_support: 'PERFECT_COORDINATION', admire_technique: 'SKILL_APPRECIATION' }
    },
    'TACTICAL_SUCCESS': {
      prompt: "Jin-Woo and Cha Hae-In reuniting after successful tactical separation. Strategic victory, anime style.",
      narration: "You meet in the center of the dungeon, both having cleared your sections perfectly.",
      chat: [
        { sender: 'Cha Hae-In', text: "Perfect execution! Our tactical coordination is flawless." },
        { sender: 'player', text: "We make an incredible team." }
      ],
      choices: [
        { text: "Prepare for boss fight", detail: "Ready for final challenge", type: 'boss_preparation' },
        { text: "Celebrate the teamwork", detail: "Acknowledge the success", type: 'celebrate_teamwork' }
      ],
      leadsTo: { boss_preparation: 'BOSS_APPROACH', celebrate_teamwork: 'VICTORY_TOGETHER' }
    },
    'CARING_TACTICS': {
      prompt: "Jin-Woo frequently checking on Cha Hae-In during tactical separation. Caring strategy, anime style.",
      narration: "Your frequent check-ins show how much you care about her safety.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're still worried about me, aren't you? It's sweet." },
        { sender: 'player', text: "I can't help it. You matter too much to me." }
      ],
      choices: [
        { text: "Admit your feelings", detail: "Open up emotionally", type: 'admit_feelings' },
        { text: "Rejoin her side", detail: "Stay together", type: 'rejoin_formation' }
      ],
      leadsTo: { admit_feelings: 'CONFESSION', rejoin_formation: 'PROTECTIVE_DUNGEON' }
    },
    'BOSS_INSPIRATION': {
      prompt: "Mutual inspiration between Jin-Woo and Cha Hae-In before boss fight. Shared admiration, anime style.",
      narration: "The mutual respect and admiration between you creates a powerful moment.",
      chat: [
        { sender: 'Cha Hae-In', text: "We inspire each other to be better. That's... beautiful." },
        { sender: 'player', text: "Together, we're unstoppable." }
      ],
      choices: [
        { text: "Face the boss together", detail: "United front", type: 'united_boss_fight' },
        { text: "Share a meaningful look", detail: "Silent connection", type: 'meaningful_connection' }
      ],
      leadsTo: { united_boss_fight: 'BOSS_APPROACH', meaningful_connection: 'ROMANTIC_MOMENT' }
    },
    'MUTUAL_VULNERABILITY': {
      prompt: "Jin-Woo and Cha Hae-In sharing their deepest struggles. Emotional intimacy, anime style.",
      narration: "Opening up to each other creates a profound bond.",
      chat: [
        { sender: 'player', text: "I understand that feeling. Sometimes the power isolates us from everyone." },
        { sender: 'Cha Hae-In', text: "But not from each other. We understand this burden." }
      ],
      choices: [
        { text: "Promise to support each other", detail: "Mutual commitment", type: 'mutual_support' },
        { text: "Take her hand", detail: "Physical comfort", type: 'take_hand' }
      ],
      leadsTo: { mutual_support: 'ROMANTIC_MOMENT', take_hand: 'HAND_HOLDING' }
    },
    'GROWTH_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's personal growth. Encouragement and support, anime style.",
      narration: "Your recognition of her growth touches Hae-In deeply.",
      chat: [
        { sender: 'Cha Hae-In', text: "You really think I've found myself again?" },
        { sender: 'player', text: "I see the real you. Strong, compassionate, and absolutely incredible." }
      ],
      choices: [
        { text: "Tell her she's perfect", detail: "Complete acceptance", type: 'perfect_acceptance' },
        { text: "Share what you see in her", detail: "Detailed appreciation", type: 'detailed_appreciation' }
      ],
      leadsTo: { perfect_acceptance: 'ROMANTIC_MOMENT', detailed_appreciation: 'ROMANTIC_MOMENT' }
    },

    'CAFE_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing their first kiss in the café. Sweet romantic moment, anime style.",
      narration: "The kiss is gentle, perfect, and full of promise.",
      chat: [
        { sender: 'Cha Hae-In', text: "That was... perfect. I've been dreaming of this." },
        { sender: 'player', text: "Worth every moment of waiting." }
      ],
      choices: [
        { text: "Plan more dates", detail: "Build the relationship", type: 'plan_more_dates' },
        { text: "Head to the gate", detail: "Continue the mission together", type: 'mission_as_couple' }
      ],
      leadsTo: { plan_more_dates: 'DAILY_LIFE_HUB', mission_as_couple: 'GATE_ENTRANCE' }
    },
    'DATE_PLANNING': {
      prompt: "Jin-Woo and Cha Hae-In planning their first official date. Romantic anticipation, anime style.",
      narration: "Planning your first real date fills both of you with excitement.",
      chat: [
        { sender: 'Cha Hae-In', text: "A real date? I'd love that. Somewhere we can just be ourselves." },
        { sender: 'player', text: "I know the perfect place. Just you and me." }
      ],
      choices: [
        { text: "Promise something special", detail: "Commit to romance", type: 'special_promise' },
        { text: "Start with this mission", detail: "Make this the first date", type: 'mission_date' },
        { text: "Head to the gate now", detail: "Adventure together", type: 'gate_adventure' }
      ],
      leadsTo: { special_promise: 'ROMANTIC_PROMISE', mission_date: 'GATE_ENTRANCE', gate_adventure: 'GATE_ENTRANCE' }
    },
    'CONNECTION_DEEPENS': {
      prompt: "The connection between Jin-Woo and Cha Hae-In deepening profoundly. Soul bond, anime style.",
      narration: "The understanding between you transcends words.",
      chat: [
        { sender: 'Cha Hae-In', text: "This connection... it's like nothing I've ever felt." },
        { sender: 'player', text: "We're meant to be together, aren't we?" }
      ],
      choices: [
        { text: "Confirm your bond", detail: "Acknowledge the connection", type: 'confirm_bond' },
        { text: "Seal it with love", detail: "Express your love", type: 'seal_with_love' },
        { text: "Test your bond in battle", detail: "Face the gate together", type: 'battle_test' }
      ],
      leadsTo: { confirm_bond: 'SOUL_BOND', seal_with_love: 'LOVE_SEALED', battle_test: 'GATE_ENTRANCE' }
    },

    'LOVE_DECLARATION': {
      prompt: "Jin-Woo declaring his deep love to Cha Hae-In. Emotional anime scene with beautiful lighting.",
      narration: "Your heartfelt declaration changes everything between you.",
      chat: [
        { sender: 'player', text: "Cha Hae-In, I love you. More than I've ever loved anyone." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I love you too. I have for so long." }
      ],
      choices: [
        { text: "Kiss her passionately", detail: "Seal your love", type: 'passionate_kiss' },
        { text: "Plan your future together", detail: "Talk about tomorrow", type: 'plan_future' }
      ],
      leadsTo: { passionate_kiss: 'PASSIONATE_KISS', plan_future: 'FUTURE_PLANNING' }
    },
    'ROMANTIC_EMBRACE': {
      prompt: "Jin-Woo and Cha Hae-In in a tender romantic embrace. Warm anime scene with soft colors.",
      narration: "In each other's arms, the world feels perfect and complete.",
      chat: [
        { sender: 'Cha Hae-In', text: "I feel so safe and loved in your arms." },
        { sender: 'player', text: "This is where you belong, with me." }
      ],
      choices: [
        { text: "Stay like this longer", detail: "Cherish the moment", type: 'cherish_moment' },
        { text: "Plan a special date", detail: "Make plans", type: 'special_date' }
      ],
      leadsTo: { cherish_moment: 'INTIMATE_MOMENT', special_date: 'DATE_PLANNING' }
    },
    'PASSIONATE_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing a passionate, loving kiss. Intense romantic anime scene.",
      narration: "Your passionate kiss expresses all the love you feel for each other.",
      chat: [
        { sender: 'Cha Hae-In', text: "I never knew love could feel this intense..." },
        { sender: 'player', text: "This is just the beginning of our story together." }
      ],
      choices: [
        { text: "Promise forever", detail: "Make a commitment", type: 'promise_forever' },
        { text: "Enjoy the moment", detail: "Live in the present", type: 'enjoy_present' }
      ],
      leadsTo: { promise_forever: 'ETERNAL_PROMISE', enjoy_present: 'ROMANTIC_BLISS' }
    },
    'SOUL_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming a deep soul connection. Mystical anime scene with spiritual energy.",
      narration: "Your souls connect on a level beyond the physical, creating an unbreakable bond.",
      chat: [
        { sender: 'Cha Hae-In', text: "I can feel your heart beating with mine..." },
        { sender: 'player', text: "We're connected now, forever." }
      ],
      choices: [
        { text: "Strengthen the bond", detail: "Deepen connection", type: 'strengthen_bond' },
        { text: "Face the world together", detail: "Unite as one", type: 'face_together' }
      ],
      leadsTo: { strengthen_bond: 'DEEPER_CONNECTION', face_together: 'UNITED_FRONT' }
    },
    'LOVE_SEALED': {
      prompt: "Jin-Woo and Cha Hae-In sealing their love with a sacred promise. Beautiful anime scene with golden light.",
      narration: "Your love is now sealed with a promise that transcends time itself.",
      chat: [
        { sender: 'player', text: "No matter what happens, my love for you is eternal." },
        { sender: 'Cha Hae-In', text: "And mine for you. We're bound by love itself." }
      ],
      choices: [
        { text: "Begin your life together", detail: "Start your journey", type: 'life_together' },
        { text: "Face any challenge", detail: "Conquer all obstacles", type: 'face_challenges' }
      ],
      leadsTo: { life_together: 'LIFE_TOGETHER', face_challenges: 'CHALLENGE_ACCEPTED' }
    },
    'ROMANTIC_PROMISE': {
      prompt: "Jin-Woo making a romantic promise to Cha Hae-In. Heartfelt anime scene with beautiful lighting.",
      narration: "Your promise touches her heart and strengthens your bond.",
      chat: [
        { sender: 'player', text: "I promise to always cherish and protect you." },
        { sender: 'Cha Hae-In', text: "That's all I've ever wanted to hear from you." }
      ],
      choices: [
        { text: "Seal it with a kiss", detail: "Show your love", type: 'seal_kiss' },
        { text: "Plan something special", detail: "Make it memorable", type: 'plan_special' }
      ],
      leadsTo: { seal_kiss: 'PASSIONATE_KISS', plan_special: 'SPECIAL_SURPRISE' }
    },
    'ETERNAL_PROMISE': {
      prompt: "Jin-Woo making an eternal promise of love to Cha Hae-In. Sacred anime moment with divine lighting.",
      narration: "Your eternal promise creates an unbreakable bond between your souls.",
      chat: [
        { sender: 'player', text: "I promise to love you for all eternity, in this life and beyond." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I'll love you forever too. Always and always." }
      ],
      choices: [
        { text: "Begin your eternal journey", detail: "Start your life together", type: 'eternal_journey' },
        { text: "Face eternity together", detail: "Conquer all time", type: 'face_eternity' }
      ],
      leadsTo: { eternal_journey: 'ETERNAL_LOVE', face_eternity: 'TIMELESS_BOND' }
    },
    'ROMANTIC_BLISS': {
      prompt: "Jin-Woo and Cha Hae-In in perfect romantic bliss. Dreamy anime scene with soft, warm colors.",
      narration: "You're both lost in the perfect bliss of new love.",
      chat: [
        { sender: 'Cha Hae-In', text: "I never knew happiness could feel this complete." },
        { sender: 'player', text: "This is just the beginning of our happiness together." }
      ],
      choices: [
        { text: "Make more memories", detail: "Create beautiful moments", type: 'make_memories' },
        { text: "Promise a beautiful future", detail: "Plan your life", type: 'promise_future' }
      ],
      leadsTo: { make_memories: 'MEMORY_MAKING', promise_future: 'FUTURE_PLANNING' }
    },
    'DEEPER_CONNECTION': {
      prompt: "Jin-Woo and Cha Hae-In's connection deepening beyond the physical realm. Mystical anime scene.",
      narration: "Your connection transcends the physical, reaching into the very essence of your beings.",
      chat: [
        { sender: 'Cha Hae-In', text: "I can feel your thoughts, your emotions... we're truly one." },
        { sender: 'player', text: "Our souls are intertwined now. Nothing can separate us." }
      ],
      choices: [
        { text: "Explore this new bond", detail: "Understand the connection", type: 'explore_bond' },
        { text: "Use it to protect each other", detail: "Strengthen your power", type: 'protective_bond' }
      ],
      leadsTo: { explore_bond: 'SOUL_EXPLORATION', protective_bond: 'PROTECTIVE_LOVE' }
    },
    'UNITED_FRONT': {
      prompt: "Jin-Woo and Cha Hae-In standing united as one force. Powerful anime scene with combined auras.",
      narration: "Together, you're unstoppable. Your combined strength is beyond measure.",
      chat: [
        { sender: 'Cha Hae-In', text: "With you beside me, I fear nothing." },
        { sender: 'player', text: "Together, we can face any challenge the world throws at us." }
      ],
      choices: [
        { text: "Test your combined power", detail: "See your strength", type: 'test_power' },
        { text: "Protect the world together", detail: "Be heroes", type: 'protect_world' }
      ],
      leadsTo: { test_power: 'POWER_TEST', protect_world: 'HEROIC_PARTNERSHIP' }
    },
    'LIFE_TOGETHER': {
      prompt: "Jin-Woo and Cha Hae-In beginning their life together. Heartwarming anime scene of domestic bliss.",
      narration: "Your new life together is everything you both dreamed it would be.",
      chat: [
        { sender: 'Cha Hae-In', text: "Our home, our life... it's perfect." },
        { sender: 'player', text: "Every day with you is a gift I treasure." }
      ],
      choices: [
        { text: "Plan your adventures", detail: "Explore together", type: 'plan_adventures' },
        { text: "Build your family", detail: "Create a legacy", type: 'build_family' }
      ],
      leadsTo: { plan_adventures: 'ADVENTURE_PLANNING', build_family: 'FAMILY_BUILDING' }
    },
    'CHALLENGE_ACCEPTED': {
      prompt: "Jin-Woo and Cha Hae-In accepting life's challenges together. Determined anime scene with heroic poses.",
      narration: "No challenge is too great when you face it together.",
      chat: [
        { sender: 'player', text: "Whatever comes our way, we'll face it as one." },
        { sender: 'Cha Hae-In', text: "I'm ready for anything as long as you're with me." }
      ],
      choices: [
        { text: "Face the first challenge", detail: "Test your resolve", type: 'first_challenge' },
        { text: "Prepare for anything", detail: "Build your strength", type: 'prepare_together' }
      ],
      leadsTo: { first_challenge: 'FIRST_TRIAL', prepare_together: 'PREPARATION_PHASE' }
    },
    'FUTURE_PLANNING': {
      prompt: "Jin-Woo and Cha Hae-In planning their future together. Optimistic anime scene with bright horizons.",
      narration: "Planning your future together fills you both with hope and excitement.",
      chat: [
        { sender: 'Cha Hae-In', text: "I want to experience everything life has to offer with you." },
        { sender: 'player', text: "Our future is going to be amazing. I can feel it." }
      ],
      choices: [
        { text: "Start your adventures", detail: "Begin your journey", type: 'start_adventures' },
        { text: "Build your dream home", detail: "Create your sanctuary", type: 'build_home' }
      ],
      leadsTo: { start_adventures: 'ADVENTURE_BEGINNING', build_home: 'HOME_BUILDING' }
    },
    'DATE_ACCEPTED': {
      prompt: "Cha Hae-In blushing and smiling after being asked on a date. Happy romantic acceptance, anime style.",
      narration: "Your direct approach catches Hae-In off guard, but her smile tells you everything you need to know.",
      chat: [
        { sender: 'Cha Hae-In', text: "A... a real date? Just the two of us?" },
        { sender: 'player', text: "If you'd like that. Somewhere special, away from gates and monsters." },
        { sender: 'Cha Hae-In', text: "I'd love that, Jin-Woo. I've been hoping you'd ask." }
      ],
      choices: [
        { text: "Plan the perfect date", detail: "Make it memorable", type: 'plan_perfect_date' },
        { text: "Start with dinner tonight", detail: "Begin immediately", type: 'dinner_tonight' },
        { text: "Ask what she'd enjoy", detail: "Let her choose", type: 'ask_preferences' }
      ],
      leadsTo: { plan_perfect_date: 'PERFECT_DATE_PLANNING', dinner_tonight: 'DINNER_DATE', ask_preferences: 'HER_PREFERENCES' }
    },
    'CASUAL_AGREEMENT': {
      prompt: "Cha Hae-In agreeing to casual time together. Friendly but warm response, anime style.",
      narration: "Your gentle approach puts Hae-In at ease.",
      chat: [
        { sender: 'Cha Hae-In', text: "Casual hanging out sounds nice. It's been a while since I could just... relax with someone." },
        { sender: 'player', text: "No pressure, just spending time together." },
        { sender: 'Cha Hae-In', text: "I'd really like that. Maybe we could start with coffee sometime?" }
      ],
      choices: [
        { text: "Coffee sounds perfect", detail: "Accept her suggestion", type: 'coffee_perfect' },
        { text: "Or maybe a walk?", detail: "Suggest alternatives", type: 'suggest_walk' },
        { text: "Whatever makes you happy", detail: "Be considerate", type: 'your_happiness' }
      ],
      leadsTo: { coffee_perfect: 'COFFEE_AGREEMENT', suggest_walk: 'WALK_SUGGESTION', your_happiness: 'CONSIDERATE_RESPONSE' }
    },
    'PERFECT_DATE_PLANNING': {
      prompt: "Jin-Woo planning an elaborate romantic date for Cha Hae-In. Romantic planning scene, anime style.",
      narration: "You want this to be perfect for her.",
      chat: [
        { sender: 'player', text: "I want to plan something really special for you. You deserve the best." },
        { sender: 'Cha Hae-In', text: "You don't have to go overboard... though I admit I'm curious what the Shadow Monarch considers romantic." },
        { sender: 'Cha Hae-In', text: "Just being with you would be perfect enough." }
      ],
      choices: [
        { text: "Rooftop dinner under stars", detail: "Romantic and private", type: 'rooftop_dinner' },
        { text: "Private beach at sunset", detail: "Beautiful and serene", type: 'beach_sunset' },
        { text: "Cozy bookstore café", detail: "Intimate and personal", type: 'bookstore_cafe' }
      ],
      leadsTo: { rooftop_dinner: 'ROOFTOP_DATE', beach_sunset: 'BEACH_DATE', bookstore_cafe: 'BOOKSTORE_DATE' }
    },
    'DINNER_DATE': {
      prompt: "Jin-Woo and Cha Hae-In having dinner together tonight. Immediate romantic evening, anime style.",
      narration: "Sometimes the best moments happen spontaneously.",
      chat: [
        { sender: 'Cha Hae-In', text: "Tonight? That's... wonderfully impulsive of you." },
        { sender: 'player', text: "Why wait? Life's too short, and I want to spend time with you." },
        { sender: 'Cha Hae-In', text: "You're right. Let's do it. I know a quiet place that's perfect." }
      ],
      choices: [
        { text: "Follow her lead", detail: "Trust her choice", type: 'follow_lead' },
        { text: "Suggest somewhere special", detail: "Take initiative", type: 'suggest_special' },
        { text: "Anywhere with you is perfect", detail: "Focus on her company", type: 'anywhere_perfect' }
      ],
      leadsTo: { follow_lead: 'HER_CHOICE_RESTAURANT', suggest_special: 'SPECIAL_RESTAURANT', anywhere_perfect: 'ROMANTIC_DECLARATION' }
    },
    'STRENGTH_APPRECIATION': {
      prompt: "Jin-Woo admiring Cha Hae-In's incredible power and grace. Appreciation and awe, anime style.",
      narration: "Watching her strength fills you with admiration and something deeper.",
      chat: [
        { sender: 'player', text: "Your strength is incredible, Hae-In. The way you fight... it's like art." },
        { sender: 'Cha Hae-In', text: "You really think so? Coming from someone as strong as you, that means everything." },
        { sender: 'Cha Hae-In', text: "But it's not just physical strength that matters, is it?" }
      ],
      choices: [
        { text: "Your heart is strongest", detail: "Focus on her character", type: 'heart_strongest' },
        { text: "We complement each other", detail: "Partnership focus", type: 'complement_each_other' },
        { text: "You inspire me", detail: "Personal impact", type: 'you_inspire_me' }
      ],
      leadsTo: { heart_strongest: 'HEART_RECOGNITION', complement_each_other: 'PERFECT_COMPATIBILITY', you_inspire_me: 'MUTUAL_INSPIRATION' }
    },
    'ENERGIZED_MISSION': {
      prompt: "Cha Hae-In channeling her confidence toward the mission. Focused energy, anime style.",
      narration: "Her renewed confidence transforms the entire atmosphere.",
      chat: [
        { sender: 'Cha Hae-In', text: "Alright! Let's tackle this mission with everything we've got!" },
        { sender: 'player', text: "That's the spirit. Nothing can stop us now." },
        { sender: 'Cha Hae-In', text: "Ready to show this dungeon what real teamwork looks like?" }
      ],
      choices: [
        { text: "Lead the charge together", detail: "United assault", type: 'lead_together' },
        { text: "Follow her lead", detail: "Let her shine", type: 'follow_her_lead' },
        { text: "Create a strategy", detail: "Tactical approach", type: 'create_strategy' }
      ],
      leadsTo: { lead_together: 'UNITED_CHARGE', follow_her_lead: 'HER_LEADERSHIP', create_strategy: 'TACTICAL_PLANNING' }
    },
    'COOL_RESPONSE': {
      prompt: "Jin-Woo playing it cool during first meeting. Composed confidence, anime style.",
      narration: "Your calm demeanor catches her attention.",
      chat: [
        { sender: 'player', text: "Just another day for the Shadow Monarch." },
        { sender: 'Cha Hae-In', text: "Confidence suits you. I like that you don't feel the need to show off." },
        { sender: 'Cha Hae-In', text: "Most hunters would be bragging about clearing an S-rank gate solo." }
      ],
      choices: [
        { text: "Actions speak louder", detail: "Philosophy on strength", type: 'actions_speak' },
        { text: "Ask about her missions", detail: "Show interest in her", type: 'ask_missions' },
        { text: "Suggest working together", detail: "Partnership proposal", type: 'suggest_partnership' }
      ],
      leadsTo: { actions_speak: 'PHILOSOPHY_MOMENT', ask_missions: 'MISSION_DISCUSSION', suggest_partnership: 'PARTNERSHIP_INTEREST' }
    },
    'HUMBLE_RESPONSE': {
      prompt: "Jin-Woo showing humility despite his power. Modest strength, anime style.",
      narration: "Your humility impresses her more than arrogance ever could.",
      chat: [
        { sender: 'player', text: "I just did what needed to be done. Anyone would have." },
        { sender: 'Cha Hae-In', text: "Not anyone could have done that, Jin-Woo. Your humility is... refreshing." },
        { sender: 'Cha Hae-In', text: "Most S-rank hunters have egos the size of skyscrapers." }
      ],
      choices: [
        { text: "Strength without wisdom is dangerous", detail: "Share philosophy", type: 'wisdom_matters' },
        { text: "What about you?", detail: "Turn focus to her", type: 'about_you' },
        { text: "We all have our roles", detail: "Humble perspective", type: 'our_roles' }
      ],
      leadsTo: { wisdom_matters: 'WISDOM_DISCUSSION', about_you: 'ABOUT_HER', our_roles: 'ROLE_PHILOSOPHY' }
    },
    'WISDOM_DISCUSSION': {
      prompt: "Jin-Woo and Cha Hae-In having a philosophical discussion about strength and wisdom. Deep conversation, anime style.",
      narration: "Your philosophical perspective resonates deeply with her. She appreciates your thoughtful approach to power.",
      chat: [
        { sender: 'player', text: "Strength without wisdom is dangerous. I've seen too many hunters let power corrupt them." },
        { sender: 'Cha Hae-In', text: "That's... exactly what I've been thinking. Raw power means nothing without the wisdom to use it properly." },
        { sender: 'Cha Hae-In', text: "You're different from other S-rank hunters, Jin-Woo. More thoughtful." }
      ],
      choices: [
        { text: "Power is responsibility", detail: "Share your philosophy", type: 'responsibility_talk' },
        { text: "What made you realize this?", detail: "Ask about her journey", type: 'her_realization' },
        { text: "We should protect people", detail: "Express protective nature", type: 'protective_nature' }
      ],
      leadsTo: { responsibility_talk: 'RESPONSIBILITY_MOMENT', her_realization: 'HER_WISDOM_STORY', protective_nature: 'PROTECTIVE_BOND' }
    },
    'ABOUT_HER': {
      prompt: "Cha Hae-In surprised and pleased that Jin-Woo is asking about her. Warm expression, anime style.",
      narration: "Your genuine interest in her catches her off guard. She's clearly not used to being the focus of attention.",
      chat: [
        { sender: 'player', text: "What about you? I'd rather hear about what you've been up to." },
        { sender: 'Cha Hae-In', text: "Oh... you actually want to know about me? That's... nice." },
        { sender: 'Cha Hae-In', text: "I've been working on improving my sword techniques. Always trying to get stronger." }
      ],
      choices: [
        { text: "Tell me about your training", detail: "Show interest in her growth", type: 'training_interest' },
        { text: "You're already incredibly strong", detail: "Compliment her abilities", type: 'strength_compliment' },
        { text: "What drives you to improve?", detail: "Ask about her motivation", type: 'motivation_question' }
      ],
      leadsTo: { training_interest: 'TRAINING_DISCUSSION', strength_compliment: 'STRENGTH_RECOGNITION', motivation_question: 'MOTIVATION_SHARING' }
    },
    'ROLE_PHILOSOPHY': {
      prompt: "Jin-Woo expressing his humble philosophy about roles and teamwork. Wise perspective, anime style.",
      narration: "Your humble perspective on teamwork and individual roles resonates with her deeply.",
      chat: [
        { sender: 'player', text: "We all have our roles to play. No one person can handle everything alone." },
        { sender: 'Cha Hae-In', text: "That's a refreshing viewpoint. Most hunters think they're the center of the universe." },
        { sender: 'Cha Hae-In', text: "I like how you see the bigger picture, Jin-Woo." }
      ],
      choices: [
        { text: "Teamwork makes us stronger", detail: "Emphasize cooperation", type: 'teamwork_focus' },
        { text: "Everyone has unique strengths", detail: "Acknowledge individual value", type: 'unique_strengths' },
        { text: "What's your role in all this?", detail: "Ask about her perspective", type: 'her_role' }
      ],
      leadsTo: { teamwork_focus: 'TEAMWORK_BOND', unique_strengths: 'STRENGTH_APPRECIATION', her_role: 'HER_ROLE_DISCUSSION' }
    },
    'TEAMWORK_BOND': {
      prompt: "Jin-Woo and Cha Hae-In working perfectly together as a team. Synchronized combat, anime style.",
      narration: "Your emphasis on teamwork creates a deeper bond between you. She feels valued as an equal partner.",
      chat: [
        { sender: 'player', text: "Together, we're stronger than the sum of our parts." },
        { sender: 'Cha Hae-In', text: "I've never felt such perfect synchronization with another hunter." },
        { sender: 'Cha Hae-In', text: "We make a great team, Jin-Woo." }
      ],
      choices: [
        { text: "Want to take on stronger enemies?", detail: "Suggest harder challenges", type: 'stronger_enemies' },
        { text: "We should do this more often", detail: "Express desire for partnership", type: 'partnership_desire' },
        { text: "Trust is everything", detail: "Emphasize bond", type: 'trust_focus' }
      ],
      leadsTo: { stronger_enemies: 'STRONGER_CHALLENGE', partnership_desire: 'PARTNERSHIP_BOND', trust_focus: 'TRUST_DEEPENING' }
    },
    'HER_ROLE_DISCUSSION': {
      prompt: "Cha Hae-In sharing her perspective on her role as a hunter. Thoughtful expression, anime style.",
      narration: "She opens up about her own sense of purpose and responsibility.",
      chat: [
        { sender: 'player', text: "What do you see as your role in all this?" },
        { sender: 'Cha Hae-In', text: "I want to be someone who protects others, who makes a difference." },
        { sender: 'Cha Hae-In', text: "Sometimes I wonder if I'm strong enough for what's coming." }
      ],
      choices: [
        { text: "You're already making a difference", detail: "Reassure her impact", type: 'reassure_impact' },
        { text: "Strength isn't just power", detail: "Redefine strength", type: 'redefine_strength' },
        { text: "We'll face it together", detail: "Offer partnership", type: 'face_together' }
      ],
      leadsTo: { reassure_impact: 'IMPACT_RECOGNITION', redefine_strength: 'STRENGTH_REDEFINITION', face_together: 'UNITED_FRONT' }
    },
    'STRONGER_CHALLENGE': {
      prompt: "Jin-Woo and Cha Hae-In preparing for an even greater challenge. Determined partnership, anime style.",
      narration: "Your suggestion to face stronger enemies together shows your confidence in your partnership.",
      chat: [
        { sender: 'player', text: "Want to take on stronger enemies? I think we're ready." },
        { sender: 'Cha Hae-In', text: "I was hoping you'd say that. There's an S-rank gate that just opened." },
        { sender: 'Cha Hae-In', text: "Just the two of us against whatever's inside." }
      ],
      choices: [
        { text: "Let's do this", detail: "Accept the challenge", type: 'accept_challenge' },
        { text: "We make our own rules", detail: "Show confidence", type: 'confident_approach' },
        { text: "Together, we're unstoppable", detail: "Express unity", type: 'express_unity' }
      ],
      leadsTo: { accept_challenge: 'DRAGON_BATTLE', confident_approach: 'CONFIDENT_PARTNERSHIP', express_unity: 'UNITY_MOMENT' }
    },
    'DRAGON_VICTORY': {
      prompt: "Jin-Woo and Cha Hae-In standing victorious over the defeated dragon. Epic victory scene, anime style.",
      narration: "Your combined might proves unstoppable. The dragon falls, and your bond is forged in the fires of victory.",
      chat: [
        { sender: 'system', text: "Victory! The ancient dragon has been defeated!" },
        { sender: 'Cha Hae-In', text: "We did it... I can't believe how perfectly we fought together." },
        { sender: 'player', text: "This is just the beginning of what we can accomplish." }
      ],
      choices: [
        { text: "Extract the dragon's shadow", detail: "Gain new power", type: 'extract_dragon' },
        { text: "Celebrate our victory", detail: "Share the moment", type: 'celebrate_victory' },
        { text: "Check if you're injured", detail: "Show concern", type: 'check_injuries' }
      ],
      leadsTo: { extract_dragon: 'SHADOW_DRAGON_VICTORY', celebrate_victory: 'VICTORY_CELEBRATION', check_injuries: 'CARING_MOMENT' }
    },
    'SHADOW_DRAGON_VICTORY': {
      prompt: "Jin-Woo extracting the dragon's shadow while Cha Hae-In watches in amazement. Power absorption scene, anime style.",
      narration: "As you extract the dragon's shadow, Cha Hae-In witnesses the true extent of your power.",
      chat: [
        { sender: 'player', text: "Shadow Extraction!" },
        { sender: 'Cha Hae-In', text: "Incredible... your power keeps growing stronger." },
        { sender: 'Cha Hae-In', text: "But you're still the same Jin-Woo I... care about." }
      ],
      choices: [
        { text: "Power means nothing without you", detail: "Romantic confession", type: 'power_confession' },
        { text: "Want to see what we can do now?", detail: "Show new abilities", type: 'demonstrate_power' },
        { text: "This dragon will protect others", detail: "Explain purpose", type: 'protective_purpose' }
      ],
      leadsTo: { power_confession: 'POWER_LOVE_CONFESSION', demonstrate_power: 'POWER_DEMONSTRATION', protective_purpose: 'NOBLE_PURPOSE' }
    },
    'COORDINATED_VICTORY': {
      prompt: "Jin-Woo and Cha Hae-In executing perfect coordinated attacks against the dragon. Synchronized combat, anime style.",
      narration: "Your tactical coordination proves devastating. Every move perfectly timed, every strike perfectly placed.",
      chat: [
        { sender: 'player', text: "Now! Strike while I hold its attention!" },
        { sender: 'Cha Hae-In', text: "Perfect timing! We're unstoppable together!" },
        { sender: 'system', text: "The dragon falls to your coordinated assault!" }
      ],
      choices: [
        { text: "That was incredible teamwork", detail: "Praise partnership", type: 'praise_teamwork' },
        { text: "We should celebrate", detail: "Suggest celebration", type: 'suggest_celebration' },
        { text: "Extract the dragon's shadow", detail: "Gain new power", type: 'extract_shadow' }
      ],
      leadsTo: { praise_teamwork: 'TEAMWORK_PRAISE', suggest_celebration: 'VICTORY_CELEBRATION', extract_shadow: 'SHADOW_EXTRACTION' }
    },
    'TACTICAL_VICTORY': {
      prompt: "Jin-Woo distracting the dragon while Cha Hae-In delivers the decisive strike. Strategic victory, anime style.",
      narration: "Your tactical approach works perfectly. The dragon focuses on you while Cha Hae-In finds the perfect opening.",
      chat: [
        { sender: 'player', text: "I'll keep it busy - find your opening!" },
        { sender: 'Cha Hae-In', text: "Got it! Trust me!" },
        { sender: 'system', text: "Cha Hae-In's precise strike defeats the dragon!" }
      ],
      choices: [
        { text: "Amazing strike!", detail: "Praise her skill", type: 'praise_skill' },
        { text: "I knew you could do it", detail: "Show confidence in her", type: 'show_confidence' },
        { text: "We make a perfect team", detail: "Acknowledge partnership", type: 'perfect_team' }
      ],
      leadsTo: { praise_skill: 'SKILL_PRAISE', show_confidence: 'CONFIDENCE_MOMENT', perfect_team: 'PERFECT_PARTNERSHIP' }
    },
    'RESPONSIBILITY_MOMENT': {
      prompt: "Jin-Woo sharing his philosophy about power and responsibility. Wise conversation, anime style.",
      narration: "Your words about responsibility resonate deeply with her values.",
      chat: [
        { sender: 'player', text: "With great power comes great responsibility. We have to use our strength to protect others." },
        { sender: 'Cha Hae-In', text: "That's exactly how I feel. It's nice to meet someone who understands." },
        { sender: 'Cha Hae-In', text: "Most hunters just want power for its own sake." }
      ],
      choices: [
        { text: "Protection is our purpose", detail: "Share mission", type: 'protection_purpose' },
        { text: "What drives you to protect?", detail: "Ask about motivation", type: 'motivation_question' },
        { text: "We're not like other hunters", detail: "Acknowledge difference", type: 'different_hunters' }
      ],
      leadsTo: { protection_purpose: 'PROTECTION_BOND', motivation_question: 'MOTIVATION_SHARING', different_hunters: 'UNIQUE_BOND' }
    },
    'HER_WISDOM_STORY': {
      prompt: "Cha Hae-In sharing her journey to understanding wisdom and power. Personal story, anime style.",
      narration: "She opens up about her own experiences learning the balance between strength and wisdom.",
      chat: [
        { sender: 'player', text: "What made you realize the importance of wisdom?" },
        { sender: 'Cha Hae-In', text: "I saw too many hunters become monsters because they had power without understanding." },
        { sender: 'Cha Hae-In', text: "I promised myself I'd never become like them." }
      ],
      choices: [
        { text: "That shows real character", detail: "Praise her values", type: 'praise_character' },
        { text: "I've seen the same thing", detail: "Share similar experience", type: 'shared_experience' },
        { text: "You're stronger for it", detail: "Acknowledge her strength", type: 'acknowledge_strength' }
      ],
      leadsTo: { praise_character: 'CHARACTER_APPRECIATION', shared_experience: 'SHARED_UNDERSTANDING', acknowledge_strength: 'STRENGTH_RECOGNITION' }
    },
    'PROTECTIVE_BOND': {
      prompt: "Jin-Woo and Cha Hae-In bonding over their shared desire to protect others. Noble purpose, anime style.",
      narration: "Your shared commitment to protection creates a deep bond between you.",
      chat: [
        { sender: 'player', text: "We should protect people, not rule over them." },
        { sender: 'Cha Hae-In', text: "Finally, someone who gets it. Power should serve others, not ourselves." },
        { sender: 'Cha Hae-In', text: "I feel like we could do great things together." }
      ],
      choices: [
        { text: "Together we're stronger", detail: "Emphasize unity", type: 'unity_strength' },
        { text: "What should we protect first?", detail: "Plan action", type: 'plan_protection' },
        { text: "I want to fight beside you", detail: "Express partnership desire", type: 'partnership_desire' }
      ],
      leadsTo: { unity_strength: 'UNITY_BOND', plan_protection: 'PROTECTION_PLANNING', partnership_desire: 'PARTNERSHIP_BOND' }
    },
    'TRAINING_DISCUSSION': {
      prompt: "Cha Hae-In talking about her training regimen. Dedicated swordswoman, anime style.",
      narration: "She lights up when discussing her training, showing her passion for improvement.",
      chat: [
        { sender: 'player', text: "Tell me about your training. I'd love to hear about your techniques." },
        { sender: 'Cha Hae-In', text: "I spend hours every day perfecting my sword forms. Each movement must be precise." },
        { sender: 'Cha Hae-In', text: "Would you... like to train together sometime?" }
      ],
      choices: [
        { text: "I'd love to train with you", detail: "Accept training invitation", type: 'accept_training' },
        { text: "Your dedication is inspiring", detail: "Praise her commitment", type: 'praise_dedication' },
        { text: "We could learn from each other", detail: "Mutual learning", type: 'mutual_learning' }
      ],
      leadsTo: { accept_training: 'TRAINING_TOGETHER', praise_dedication: 'DEDICATION_APPRECIATION', mutual_learning: 'LEARNING_BOND' }
    },
    'MOTIVATION_SHARING': {
      prompt: "Cha Hae-In opening up about what drives her to become stronger. Personal motivation, anime style.",
      narration: "She shares her deeper motivations, revealing more of her inner self.",
      chat: [
        { sender: 'player', text: "What drives you to keep improving?" },
        { sender: 'Cha Hae-In', text: "I want to be strong enough to protect the people I care about." },
        { sender: 'Cha Hae-In', text: "I never want to feel helpless again." }
      ],
      choices: [
        { text: "You're already protecting people", detail: "Reassure her impact", type: 'reassure_protection' },
        { text: "That's a noble goal", detail: "Praise her motivation", type: 'praise_goal' },
        { text: "I understand that feeling", detail: "Share understanding", type: 'shared_feeling' }
      ],
      leadsTo: { reassure_protection: 'PROTECTION_REASSURANCE', praise_goal: 'NOBLE_RECOGNITION', shared_feeling: 'EMOTIONAL_CONNECTION' }
    },
    'IMPACT_RECOGNITION': {
      prompt: "Jin-Woo acknowledging Cha Hae-In's positive impact as a hunter. Recognition scene, anime style.",
      narration: "Your recognition of her impact brings a warm smile to her face.",
      chat: [
        { sender: 'player', text: "You're already making a huge difference. I've seen how you inspire other hunters." },
        { sender: 'Cha Hae-In', text: "Really? I sometimes wonder if what I do matters." },
        { sender: 'Cha Hae-In', text: "Thank you for saying that, Jin-Woo. It means a lot." }
      ],
      choices: [
        { text: "Your influence is incredible", detail: "Emphasize her impact", type: 'emphasize_influence' },
        { text: "People look up to you", detail: "Point out her role model status", type: 'role_model' },
        { text: "You inspire me too", detail: "Personal admission", type: 'personal_inspiration' }
      ],
      leadsTo: { emphasize_influence: 'INFLUENCE_DISCUSSION', role_model: 'ROLE_MODEL_TALK', personal_inspiration: 'INSPIRATION_MOMENT' }
    },
    'STRENGTH_REDEFINITION': {
      prompt: "Jin-Woo helping Cha Hae-In redefine what true strength means. Wisdom sharing, anime style.",
      narration: "Your perspective on strength opens her eyes to new possibilities.",
      chat: [
        { sender: 'player', text: "Strength isn't just physical power. Your compassion, your determination - that's real strength." },
        { sender: 'Cha Hae-In', text: "I never thought of it that way... You see strength differently than most hunters." },
        { sender: 'Cha Hae-In', text: "Maybe I'm stronger than I thought." }
      ],
      choices: [
        { text: "You're one of the strongest people I know", detail: "Affirm her strength", type: 'affirm_strength' },
        { text: "Strength comes in many forms", detail: "Expand on concept", type: 'expand_strength' },
        { text: "Your heart makes you powerful", detail: "Emotional strength", type: 'heart_power' }
      ],
      leadsTo: { affirm_strength: 'STRENGTH_AFFIRMATION', expand_strength: 'STRENGTH_PHILOSOPHY', heart_power: 'HEART_POWER_MOMENT' }
    },
    'HUMBLE_MOMENT': {
      prompt: "Jin-Woo deflecting praise with humility. Self-deprecating charm, anime style.",
      narration: "Your modest response draws a genuine smile from her.",
      chat: [
        { sender: 'player', text: "Mine was boring compared to yours. I just hit things until they stopped moving." },
        { sender: 'Cha Hae-In', text: "Don't sell yourself short. There's an art to what you do too." },
        { sender: 'Cha Hae-In', text: "Besides, I'd love to hear about it anyway." }
      ],
      choices: [
        { text: "Share your story", detail: "Open up about adventures", type: 'share_adventure' },
        { text: "Focus on her instead", detail: "Redirect attention", type: 'focus_on_her' },
        { text: "Suggest coffee and stories", detail: "Extend the conversation", type: 'coffee_stories' }
      ],
      leadsTo: { share_adventure: 'ADVENTURE_SHARING', focus_on_her: 'HER_FOCUS', coffee_stories: 'COFFEE_INVITATION' }
    },
    'HER_FOCUS': {
      prompt: "Jin-Woo redirecting conversation to focus on Cha Hae-In. Attentive listening, anime style.",
      narration: "You shift the conversation to focus on her, showing genuine interest in her experiences.",
      chat: [
        { sender: 'player', text: "Actually, I'd rather hear about you. What's been on your mind lately?" },
        { sender: 'Cha Hae-In', text: "Oh... that's unexpected. Most people love talking about themselves." },
        { sender: 'Cha Hae-In', text: "I've been thinking about how much I've grown as a hunter, and as a person." }
      ],
      choices: [
        { text: "Tell me more about your growth", detail: "Show deep interest", type: 'growth_interest' },
        { text: "You've definitely changed", detail: "Acknowledge her development", type: 'acknowledge_change' },
        { text: "What's helped you grow?", detail: "Ask about her journey", type: 'growth_journey' }
      ],
      leadsTo: { growth_interest: 'GROWTH_DISCUSSION', acknowledge_change: 'CHANGE_RECOGNITION', growth_journey: 'PERSONAL_JOURNEY' }
    },
    'GROWTH_DISCUSSION': {
      prompt: "Cha Hae-In opening up about her personal growth. Deep conversation, anime style.",
      narration: "She appreciates your genuine interest and opens up more than usual.",
      chat: [
        { sender: 'Cha Hae-In', text: "I used to be so focused on just being stronger, but lately I've realized strength isn't everything." },
        { sender: 'Cha Hae-In', text: "Having someone who understands... someone like you... it changes how I see things." },
        { sender: 'player', text: "You've helped me grow too, Hae-In. More than you know." }
      ],
      choices: [
        { text: "We complement each other", detail: "Acknowledge mutual growth", type: 'mutual_complement' },
        { text: "Tell me more", detail: "Continue the deep conversation", type: 'continue_deep' },
        { text: "Suggest spending more time together", detail: "Propose closer relationship", type: 'more_time' }
      ],
      leadsTo: { mutual_complement: 'MUTUAL_GROWTH', continue_deep: 'DEEPER_CONVERSATION', more_time: 'TIME_TOGETHER' }
    },
    'CHANGE_RECOGNITION': {
      prompt: "Jin-Woo acknowledging Cha Hae-In's positive changes. Recognition moment, anime style.",
      narration: "Your acknowledgment of her growth touches her deeply.",
      chat: [
        { sender: 'player', text: "You have changed. You seem more... confident. More at peace with yourself." },
        { sender: 'Cha Hae-In', text: "You noticed... I wasn't sure if anyone could see the difference." },
        { sender: 'Cha Hae-In', text: "It's partly because of you, Jin-Woo. Your presence makes me feel more myself." }
      ],
      choices: [
        { text: "You bring out the best in me too", detail: "Share mutual feelings", type: 'mutual_best' },
        { text: "I'm glad I could help", detail: "Express happiness", type: 'glad_help' },
        { text: "You're amazing as you are", detail: "Affirm her worth", type: 'amazing_as_is' }
      ],
      leadsTo: { mutual_best: 'MUTUAL_BEST', glad_help: 'HELPFUL_MOMENT', amazing_as_is: 'AFFIRMATION_MOMENT' }
    },
    'PERSONAL_JOURNEY': {
      prompt: "Cha Hae-In sharing details about her personal journey. Intimate conversation, anime style.",
      narration: "She trusts you enough to share her deeper thoughts and experiences.",
      chat: [
        { sender: 'Cha Hae-In', text: "Meeting other hunters, facing difficult dungeons... but mostly meeting you." },
        { sender: 'Cha Hae-In', text: "You showed me that strength doesn't mean being alone." },
        { sender: 'player', text: "And you showed me that partnership can make us both stronger." }
      ],
      choices: [
        { text: "We make a great team", detail: "Emphasize partnership", type: 'great_team' },
        { text: "I want to know you better", detail: "Express deeper interest", type: 'know_better' },
        { text: "Thank you for trusting me", detail: "Acknowledge her openness", type: 'thank_trust' }
      ],
      leadsTo: { great_team: 'TEAM_RECOGNITION', know_better: 'DEEPER_KNOWING', thank_trust: 'TRUST_APPRECIATION' }
    },
    'ADVENTURE_SHARING': {
      prompt: "Jin-Woo sharing his adventure stories with Cha Hae-In. Storytelling moment, anime style.",
      narration: "You share tales of dungeons and battles, and she listens with fascination.",
      chat: [
        { sender: 'player', text: "The dungeon was unlike anything I'd seen before. Ancient magic everywhere..." },
        { sender: 'Cha Hae-In', text: "That sounds incredible! I love how you notice the details others miss." },
        { sender: 'Cha Hae-In', text: "Your perspective on dungeons is so different from other hunters." }
      ],
      choices: [
        { text: "What about your experiences?", detail: "Ask about her adventures", type: 'her_experiences' },
        { text: "We should explore one together", detail: "Suggest partnership", type: 'explore_together' },
        { text: "You see things differently too", detail: "Compliment her insight", type: 'different_perspective' }
      ],
      leadsTo: { her_experiences: 'HER_ADVENTURES', explore_together: 'PARTNERSHIP_PROPOSAL', different_perspective: 'PERSPECTIVE_APPRECIATION' }
    },
    'COFFEE_INVITATION': {
      prompt: "Jin-Woo suggesting coffee and extended conversation. Casual invitation, anime style.",
      narration: "Your invitation for coffee creates a warm, intimate atmosphere between you.",
      chat: [
        { sender: 'player', text: "Want to grab some coffee? We could continue this conversation somewhere more comfortable." },
        { sender: 'Cha Hae-In', text: "I'd like that very much. There's this quiet café I know..." },
        { sender: 'Cha Hae-In', text: "It'll be nice to talk somewhere we won't be interrupted." }
      ],
      choices: [
        { text: "Lead the way", detail: "Follow her suggestion", type: 'follow_lead' },
        { text: "I know a perfect spot", detail: "Suggest your own place", type: 'suggest_spot' },
        { text: "Anywhere with you sounds perfect", detail: "Romantic response", type: 'anywhere_perfect' }
      ],
      leadsTo: { follow_lead: 'COFFEE_DATE', suggest_spot: 'COFFEE_DATE', anywhere_perfect: 'COFFEE_DATE' }
    },
    'MUTUAL_GROWTH': {
      prompt: "Jin-Woo and Cha Hae-In acknowledging their mutual growth. Deep connection, anime style.",
      narration: "The recognition of how you've both grown creates a powerful bond between you.",
      chat: [
        { sender: 'player', text: "We really do complement each other, don't we?" },
        { sender: 'Cha Hae-In', text: "More than I ever imagined. You've helped me become stronger in ways I didn't know I needed." },
        { sender: 'Cha Hae-In', text: "And I hope I've done the same for you." }
      ],
      choices: [
        { text: "You've changed my whole world", detail: "Deep confession", type: 'changed_world' },
        { text: "We're stronger together", detail: "Partnership focus", type: 'stronger_together' },
        { text: "I never want to lose this", detail: "Express attachment", type: 'never_lose' }
      ],
      leadsTo: { changed_world: 'WORLD_CHANGED', stronger_together: 'UNITED_STRENGTH', never_lose: 'PROTECTIVE_BOND' }
    },
    'TEAM_RECOGNITION': {
      prompt: "Acknowledging the perfect partnership between Jin-Woo and Cha Hae-In. Team unity, anime style.",
      narration: "Your partnership feels natural and powerful, like you were meant to work together.",
      chat: [
        { sender: 'player', text: "We really do make an incredible team." },
        { sender: 'Cha Hae-In', text: "It's like we can read each other's movements in battle. I've never felt this synchronized with anyone." },
        { sender: 'Cha Hae-In', text: "Both in combat and... in conversation." }
      ],
      choices: [
        { text: "We're unstoppable together", detail: "Confident partnership", type: 'unstoppable' },
        { text: "It feels natural with you", detail: "Acknowledge chemistry", type: 'feels_natural' },
        { text: "I trust you completely", detail: "Express deep trust", type: 'complete_trust' }
      ],
      leadsTo: { unstoppable: 'UNSTOPPABLE_DUO', feels_natural: 'NATURAL_CHEMISTRY', complete_trust: 'ABSOLUTE_TRUST' }
    },
    'STORY_SHARING': {
      prompt: "Jin-Woo sharing his adventures with Cha Hae-In. Storytelling moment, anime style.",
      narration: "As you recount your experiences, she listens with genuine interest.",
      chat: [
        { sender: 'player', text: "The dungeon was unlike anything I'd seen. Ancient magic, puzzles that tested more than just strength..." },
        { sender: 'Cha Hae-In', text: "That sounds incredible. I love dungeons that challenge the mind too." },
        { sender: 'Cha Hae-In', text: "Most hunters just want to rush in and fight, but there's beauty in the complexity." }
      ],
      choices: [
        { text: "You understand perfectly", detail: "Acknowledge her insight", type: 'perfect_understanding' },
        { text: "Want to explore one together?", detail: "Partnership invitation", type: 'explore_together' },
        { text: "Tell me about your favorites", detail: "Learn about her preferences", type: 'her_favorites' }
      ],
      leadsTo: { perfect_understanding: 'UNDERSTANDING_BOND', explore_together: 'EXPLORATION_PARTNERSHIP', her_favorites: 'FAVORITE_DUNGEONS' }
    },
    'SHADOW_VICTORY': {
      prompt: "Jin-Woo's shadow army overwhelming the ice dragon. Epic shadow dominance, anime style.",
      narration: "Your shadows surge forward like a dark tide, overwhelming the ancient beast.",
      chat: [
        { sender: 'system', text: "Shadow Army deployed! The ice dragon is completely overwhelmed!" },
        { sender: 'Cha Hae-In', text: "Incredible... the power of the Shadow Monarch in full display." },
        { sender: 'Cha Hae-In', text: "You could have handled this alone, couldn't you?" }
      ],
      choices: [
        { text: "But it's better with you", detail: "Value her presence", type: 'better_with_you' },
        { text: "Extract the dragon's shadow", detail: "Add to your army", type: 'extract_shadow' },
        { text: "Power means nothing alone", detail: "Philosophical response", type: 'power_meaningless_alone' }
      ],
      leadsTo: { better_with_you: 'VALUED_PARTNERSHIP', extract_shadow: 'SHADOW_EXTRACTION', power_meaningless_alone: 'POWER_PHILOSOPHY' }
    },
    'HAE_IN_MOMENT': {
      prompt: "Cha Hae-In taking the lead against the ice dragon. Her moment to shine, anime style.",
      narration: "You step back, allowing Hae-In to show her true strength.",
      chat: [
        { sender: 'Cha Hae-In', text: "Thank you for trusting me with this." },
        { sender: 'system', text: "Cha Hae-In unleashes her ultimate sword technique!" },
        { sender: 'Cha Hae-In', text: "That felt amazing! Having your support gave me confidence I've never felt before." }
      ],
      choices: [
        { text: "You were magnificent", detail: "Praise her performance", type: 'you_magnificent' },
        { text: "We make a perfect team", detail: "Emphasize partnership", type: 'perfect_team' },
        { text: "I believed in you completely", detail: "Show faith in her", type: 'believed_in_you' }
      ],
      leadsTo: { you_magnificent: 'MAGNIFICENT_PRAISE', perfect_team: 'PERFECT_TEAMWORK', believed_in_you: 'COMPLETE_FAITH' }
    },
    'SHADOW_EXTRACTION': {
      prompt: "Jin-Woo extracting the ice dragon's shadow. Dark power absorption, anime style.",
      narration: "The dragon's essence flows into your shadow realm, adding to your army.",
      chat: [
        { sender: 'system', text: "Shadow successfully extracted! Ice Dragon added to your army!" },
        { sender: 'Cha Hae-In', text: "Every time I see you do that, it amazes me. The power to command even death itself." },
        { sender: 'Cha Hae-In', text: "But you use that power to protect people. That's what makes you special." }
      ],
      choices: [
        { text: "You make me want to be better", detail: "Her positive influence", type: 'make_me_better' },
        { text: "Power is meaningless without purpose", detail: "Share your philosophy", type: 'power_purpose' },
        { text: "Shall we head back?", detail: "Mission complete", type: 'head_back' }
      ],
      leadsTo: { make_me_better: 'POSITIVE_INFLUENCE', power_purpose: 'PURPOSE_DISCUSSION', head_back: 'MISSION_COMPLETE' }
    },
    'TEASE_RESPONSE': {
      prompt: "Cha Hae-In's reaction to Jin-Woo's teasing. Playful romantic tension, anime style.",
      narration: "Your teasing brings out a playful side of her you've never seen.",
      chat: [
        { sender: 'Cha Hae-In', text: "Maybe I'm imagining things? You're terrible!" },
        { sender: 'player', text: "Am I though? Your face is pretty red for someone who's imagining things." },
        { sender: 'Cha Hae-In', text: "That's... that's just from the dungeon heat! You're impossible, Jin-Woo." }
      ],
      choices: [
        { text: "I love seeing you flustered", detail: "Continue the teasing", type: 'love_flustered' },
        { text: "You're cute when you're embarrassed", detail: "Sweet compliment", type: 'cute_embarrassed' },
        { text: "Okay, I'll be serious", detail: "Switch to sincerity", type: 'be_serious' }
      ],
      leadsTo: { love_flustered: 'FLUSTERED_RESPONSE', cute_embarrassed: 'CUTE_REACTION', be_serious: 'SERIOUS_MOMENT' }
    },
    'FLUSTERED_RESPONSE': {
      prompt: "Cha Hae-In becoming even more flustered from Jin-Woo's teasing. Adorable embarrassment, anime style.",
      narration: "Your words make her even more flustered, her face turning a deeper shade of red.",
      chat: [
        { sender: 'Cha Hae-In', text: "*covers her face with her hands* You're enjoying this way too much!" },
        { sender: 'player', text: "I can't help it. You're absolutely adorable when you're like this." },
        { sender: 'Cha Hae-In', text: "*peeks through her fingers* S-stop saying things like that... my heart can't take it." }
      ],
      choices: [
        { text: "I'll stop if you want me to", detail: "Give her an out", type: 'stop_teasing' },
        { text: "Your heart is racing?", detail: "Notice her reaction", type: 'heart_racing' },
        { text: "Come here", detail: "Pull her close", type: 'pull_close' }
      ],
      leadsTo: { stop_teasing: 'GENTLE_MOMENT', heart_racing: 'HEART_CONFESSION', pull_close: 'INTIMATE_CLOSENESS' }
    },
    'CUTE_REACTION': {
      prompt: "Cha Hae-In reacting cutely to Jin-Woo's compliment. Sweet romantic moment, anime style.",
      narration: "Her embarrassed reaction is so endearing that your heart skips a beat.",
      chat: [
        { sender: 'Cha Hae-In', text: "*looks down shyly* You think I'm... cute?" },
        { sender: 'player', text: "The cutest. Especially when you try to hide your smile like that." },
        { sender: 'Cha Hae-In', text: "*smiles despite herself* Jin-Woo... you're making me feel things I've never felt before." }
      ],
      choices: [
        { text: "What kind of things?", detail: "Ask about her feelings", type: 'what_feelings' },
        { text: "Good things, I hope", detail: "Hopeful response", type: 'good_things' },
        { text: "I feel the same way", detail: "Mutual confession", type: 'feel_same' }
      ],
      leadsTo: { what_feelings: 'FEELING_EXPLORATION', good_things: 'HOPEFUL_MOMENT', feel_same: 'MUTUAL_FEELINGS' }
    },
    'SERIOUS_MOMENT': {
      prompt: "Jin-Woo switching to a more serious tone with Cha Hae-In. Sincere romantic moment, anime style.",
      narration: "You decide to be sincere with her, and the atmosphere becomes more intimate.",
      chat: [
        { sender: 'player', text: "Sorry for teasing you. I just... I love seeing all these different sides of you." },
        { sender: 'Cha Hae-In', text: "*looks at him with soft eyes* Different sides?" },
        { sender: 'Cha Hae-In', text: "You bring out parts of me I didn't know existed, Jin-Woo." }
      ],
      choices: [
        { text: "You do the same for me", detail: "Mutual revelation", type: 'mutual_revelation' },
        { text: "I want to know all of you", detail: "Deep interest", type: 'know_all_you' },
        { text: "That makes me happy", detail: "Express joy", type: 'makes_happy' }
      ],
      leadsTo: { mutual_revelation: 'MUTUAL_DISCOVERY', know_all_you: 'DEEP_CONNECTION', makes_happy: 'HAPPINESS_SHARED' }
    },
    'FAVORITE_DUNGEONS': {
      prompt: "Cha Hae-In sharing her favorite dungeons with Jin-Woo. Enthusiastic discussion, anime style.",
      narration: "She lights up as she talks about her favorite dungeon experiences.",
      chat: [
        { sender: 'Cha Hae-In', text: "There's this beautiful ice dungeon in the mountains. The way the light reflects off the crystals..." },
        { sender: 'player', text: "You sound like you really love exploring. Tell me more." },
        { sender: 'Cha Hae-In', text: "And there's an ancient forest dungeon that feels almost peaceful. Would you... like to see it sometime?" }
      ],
      choices: [
        { text: "I'd love to explore with you", detail: "Accept invitation", type: 'love_explore' },
        { text: "Show me your favorite spot", detail: "Personal request", type: 'show_favorite' },
        { text: "We could make new memories there", detail: "Future focus", type: 'new_memories' }
      ],
      leadsTo: { love_explore: 'EXPLORATION_PARTNERSHIP', show_favorite: 'PERSONAL_SHARING', new_memories: 'MEMORY_MAKING' }
    },
    'EXPLORATION_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In planning their dungeon exploration partnership. Adventure planning, anime style.",
      narration: "Your shared love of adventure creates a natural partnership between you.",
      chat: [
        { sender: 'player', text: "I'd love to explore dungeons with you. We could discover new places together." },
        { sender: 'Cha Hae-In', text: "Really? That sounds wonderful! I know so many hidden dungeons others have never seen." },
        { sender: 'Cha Hae-In', text: "With your shadows and my senses, we'd make the perfect exploration team." }
      ],
      choices: [
        { text: "When do we start?", detail: "Eager to begin", type: 'when_start' },
        { text: "Perfect partnership", detail: "Acknowledge compatibility", type: 'perfect_partnership' },
        { text: "Show me the way", detail: "Follow her lead", type: 'show_way' }
      ],
      leadsTo: { when_start: 'ADVENTURE_BEGINS', perfect_partnership: 'PARTNERSHIP_BOND', show_way: 'GUIDED_EXPLORATION' }
    },
    'ADVENTURE_BEGINS': {
      prompt: "Jin-Woo and Cha Hae-In starting their first adventure together. Beginning of partnership, anime style.",
      narration: "Your first adventure together marks the beginning of something special.",
      chat: [
        { sender: 'Cha Hae-In', text: "Are you ready? This dungeon is one of my favorites." },
        { sender: 'player', text: "With you leading the way? I'm ready for anything." },
        { sender: 'Cha Hae-In', text: "Then let's go make some memories together!" }
      ],
      choices: [
        { text: "Lead the way", detail: "Follow her guidance", type: 'follow_lead' },
        { text: "Stay close to me", detail: "Protective stance", type: 'stay_close' },
        { text: "This feels right", detail: "Express contentment", type: 'feels_right' }
      ],
      leadsTo: { follow_lead: 'GUIDED_EXPLORATION', stay_close: 'PROTECTIVE_ADVENTURE', feels_right: 'NATURAL_PARTNERSHIP' }
    },
    'GUIDED_EXPLORATION': {
      prompt: "Cha Hae-In guiding Jin-Woo through her favorite dungeon. Shared adventure, anime style.",
      narration: "She guides you through the dungeon with expertise and grace.",
      chat: [
        { sender: 'Cha Hae-In', text: "Watch your step here. The crystals can be slippery." },
        { sender: 'player', text: "You know this place like the back of your hand." },
        { sender: 'Cha Hae-In', text: "I've spent so many hours here. It's like... my secret sanctuary." }
      ],
      choices: [
        { text: "Thank you for sharing it with me", detail: "Express gratitude", type: 'thank_sharing' },
        { text: "I understand why you love it", detail: "Appreciation", type: 'understand_love' },
        { text: "Now it's our sanctuary", detail: "Claim shared space", type: 'our_sanctuary' }
      ],
      leadsTo: { thank_sharing: 'GRATEFUL_MOMENT', understand_love: 'SHARED_APPRECIATION', our_sanctuary: 'CLAIMED_SPACE' }
    },
    'PERSONAL_SHARING': {
      prompt: "Cha Hae-In showing Jin-Woo her most personal favorite spot. Intimate sharing, anime style.",
      narration: "She brings you to a place that clearly means a lot to her.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is... this is where I come when I need to think." },
        { sender: 'player', text: "It's beautiful. Thank you for trusting me with this." },
        { sender: 'Cha Hae-In', text: "I've never brought anyone here before. You're the first." }
      ],
      choices: [
        { text: "I'm honored", detail: "Express honor", type: 'honored' },
        { text: "I'll treasure this moment", detail: "Promise to remember", type: 'treasure_moment' },
        { text: "What do you think about here?", detail: "Ask about her thoughts", type: 'what_think' }
      ],
      leadsTo: { honored: 'HONORED_TRUST', treasure_moment: 'TREASURED_MEMORY', what_think: 'THOUGHT_SHARING' }
    },
    'MEMORY_MAKING': {
      prompt: "Jin-Woo and Cha Hae-In focusing on creating new memories together. Future building, anime style.",
      narration: "You both focus on the future memories you'll create together.",
      chat: [
        { sender: 'player', text: "Every moment with you becomes a treasured memory." },
        { sender: 'Cha Hae-In', text: "I want to fill this place with happy memories of us together." },
        { sender: 'Cha Hae-In', text: "Years from now, when we come back here, we'll remember this conversation." }
      ],
      choices: [
        { text: "And many more to come", detail: "Promise future together", type: 'many_more' },
        { text: "I'll never forget this", detail: "Cement the memory", type: 'never_forget' },
        { text: "Kiss her gently", detail: "Create romantic memory", type: 'gentle_kiss' }
      ],
      leadsTo: { many_more: 'FUTURE_PROMISE', never_forget: 'UNFORGETTABLE_MOMENT', gentle_kiss: 'ROMANTIC_MEMORY' }
    },
    'UNDERSTANDING_BOND': {
      prompt: "Jin-Woo and Cha Hae-In sharing perfect understanding. Deep connection, anime style.",
      narration: "Your perfect understanding of each other creates an unbreakable bond.",
      chat: [
        { sender: 'player', text: "It's like you can read my thoughts sometimes." },
        { sender: 'Cha Hae-In', text: "And you always know exactly what I'm feeling. It's... magical." },
        { sender: 'Cha Hae-In', text: "I've never felt so understood by anyone before." }
      ],
      choices: [
        { text: "We're perfectly matched", detail: "Acknowledge compatibility", type: 'perfectly_matched' },
        { text: "This connection is special", detail: "Recognize uniqueness", type: 'special_connection' },
        { text: "I understand you completely", detail: "Express deep understanding", type: 'complete_understanding' }
      ],
      leadsTo: { perfectly_matched: 'PERFECT_COMPATIBILITY', special_connection: 'SPECIAL_BOND', complete_understanding: 'DEEP_UNDERSTANDING' }
    },
    'GENTLE_MOMENT': {
      prompt: "Jin-Woo being gentle with Cha Hae-In after teasing. Tender care, anime style.",
      narration: "You shift to gentleness, showing your caring side.",
      chat: [
        { sender: 'player', text: "I'm sorry if I went too far. I just love seeing you smile." },
        { sender: 'Cha Hae-In', text: "*touches his face gently* No, don't apologize. I... I like this side of you." },
        { sender: 'Cha Hae-In', text: "You make me feel things I've never felt before." }
      ],
      choices: [
        { text: "What kinds of things?", detail: "Curious about feelings", type: 'what_feelings' },
        { text: "You make me feel the same", detail: "Mutual feelings", type: 'same_feelings' },
        { text: "I want to make you happy", detail: "Express intent", type: 'make_happy' }
      ],
      leadsTo: { what_feelings: 'FEELING_EXPLORATION', same_feelings: 'MUTUAL_FEELINGS', make_happy: 'HAPPINESS_FOCUS' }
    },
    'HEART_CONFESSION': {
      prompt: "Cha Hae-In confessing her racing heart to Jin-Woo. Emotional vulnerability, anime style.",
      narration: "She admits her physical reaction to your closeness.",
      chat: [
        { sender: 'Cha Hae-In', text: "*places hand over heart* It's... it's beating so fast when you're near me." },
        { sender: 'player', text: "Mine too. Every time I see you." },
        { sender: 'Cha Hae-In', text: "What is this feeling, Jin-Woo? It's overwhelming but... wonderful." }
      ],
      choices: [
        { text: "It's love", detail: "Direct confession", type: 'its_love' },
        { text: "You're falling for me", detail: "Acknowledge her feelings", type: 'falling_for_me' },
        { text: "Let your heart guide you", detail: "Encourage following feelings", type: 'follow_heart' }
      ],
      leadsTo: { its_love: 'LOVE_CONFESSION', falling_for_me: 'FALLING_REALIZATION', follow_heart: 'HEART_GUIDANCE' }
    },

    'TENDER_EMBRACE': {
      prompt: "Jin-Woo and Cha Hae-In sharing a tender embrace. Emotional intimacy, anime style.",
      narration: "She melts into your arms, and for a moment, the world feels perfect.",
      chat: [
        { sender: 'Cha Hae-In', text: "I never thought I could feel this safe with someone." },
        { sender: 'player', text: "You are safe with me. Always." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I think I'm falling in love with you." }
      ],
      choices: [
        { text: "I love you too", detail: "Mutual confession", type: 'love_you_too' },
        { text: "I've loved you for a while", detail: "Admit longer feelings", type: 'loved_you_while' },
        { text: "Kiss her gently", detail: "Actions over words", type: 'gentle_kiss' }
      ],
      leadsTo: { love_you_too: 'MUTUAL_LOVE', loved_you_while: 'LONG_LOVE', gentle_kiss: 'GENTLE_KISS' }
    },
    'PERFECT_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In savoring a perfect moment together. Pure happiness, anime style.",
      narration: "Time seems to stop as you both realize this is where you belong.",
      chat: [
        { sender: 'Cha Hae-In', text: "I want to remember this moment forever." },
        { sender: 'player', text: "So do I. This feeling... I never want it to end." },
        { sender: 'Cha Hae-In', text: "With you, every moment feels like it could last forever." }
      ],
      choices: [
        { text: "Promise me more moments like this", detail: "Future commitment", type: 'promise_more_moments' },
        { text: "You're my everything", detail: "Deep declaration", type: 'my_everything' },
        { text: "Let's make this official", detail: "Relationship milestone", type: 'make_official' }
      ],
      leadsTo: { promise_more_moments: 'FUTURE_PROMISE', my_everything: 'EVERYTHING_DECLARATION', make_official: 'OFFICIAL_RELATIONSHIP' }
    },
    'HEART_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's inner strength. Heart connection, anime style.",
      narration: "Your words touch the core of who she is.",
      chat: [
        { sender: 'Cha Hae-In', text: "My heart? I... thank you for seeing that in me." },
        { sender: 'player', text: "Your compassion, your determination to protect others - that's your real strength." }
      ],
      choices: [
        { text: "That's what I fell for", detail: "Romantic admission", type: 'fell_for_heart' },
        { text: "Continue the mission", detail: "Focus ahead", type: 'mission_continue' }
      ],
      leadsTo: { fell_for_heart: 'HEART_CONFESSION', mission_continue: 'GATE_ENTRANCE' }
    },
    'PERFECT_MATCH': {
      prompt: "Jin-Woo and Cha Hae-In as perfect complements. Harmony, anime style.",
      narration: "The balance between you feels natural and right.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really do complement each other perfectly." },
        { sender: 'player', text: "Your light balances my shadows." }
      ],
      choices: [
        { text: "We were meant to meet", detail: "Destiny theme", type: 'meant_to_meet' },
        { text: "Let's prove it together", detail: "Action focus", type: 'prove_together' }
      ],
      leadsTo: { meant_to_meet: 'DESTINY_MOMENT', prove_together: 'GATE_ENTRANCE' }
    },
    'MUTUAL_INSPIRATION': {
      prompt: "Both inspiring each other to greater heights. Shared motivation, anime style.",
      narration: "The synergy between you creates something greater than the sum of its parts.",
      chat: [
        { sender: 'Cha Hae-In', text: "And you inspire me to be braver than I ever thought possible." },
        { sender: 'player', text: "Together, we can face anything." }
      ],
      choices: [
        { text: "Promise to always support each other", detail: "Mutual commitment", type: 'mutual_support' },
        { text: "Face the future together", detail: "Forward focus", type: 'future_together' }
      ],
      leadsTo: { mutual_support: 'SUPPORT_PROMISE', future_together: 'SHARED_FUTURE' }
    },
    'SKILL_APPRECIATION': {
      prompt: "Jin-Woo deeply appreciating Cha Hae-In's combat mastery. Technical admiration, anime style.",
      narration: "Her technique is flawless, a perfect blend of power and grace.",
      chat: [
        { sender: 'player', text: "Your swordsmanship is art in motion. Every strike has purpose and beauty." },
        { sender: 'Cha Hae-In', text: "Coming from you, that means everything. I've always admired your tactical mind." }
      ],
      choices: [
        { text: "Spar with me sometime?", detail: "Training invitation", type: 'spar_invitation' },
        { text: "Teach me your techniques", detail: "Learning request", type: 'teach_techniques' }
      ],
      leadsTo: { spar_invitation: 'SPARRING_AGREEMENT', teach_techniques: 'TEACHING_MOMENT' }
    },
    'CLOSE_FORMATION': {
      prompt: "Jin-Woo and Cha Hae-In in close protective formation. Intimate teamwork, anime style.",
      narration: "Moving as one unit, you clear the dungeon with unprecedented coordination.",
      chat: [
        { sender: 'Cha Hae-In', text: "This formation feels so natural with you." },
        { sender: 'player', text: "Like we've been fighting together for years." }
      ],
      choices: [
        { text: "We should make this permanent", detail: "Partnership proposal", type: 'permanent_team' },
        { text: "Focus on the boss ahead", detail: "Mission priority", type: 'focus_boss' }
      ],
      leadsTo: { permanent_team: 'PERMANENT_PARTNERSHIP', focus_boss: 'BOSS_APPROACH' }
    },
    'PERFECT_COORDINATION': {
      prompt: "Flawless combat coordination between Jin-Woo and Cha Hae-In. Synchronized fighting, anime style.",
      narration: "Your movements flow together like a deadly dance.",
      chat: [
        { sender: 'Cha Hae-In', text: "Our timing is perfect! It's like you can read my mind." },
        { sender: 'player', text: "Maybe I can. Or maybe we're just meant to fight together." }
      ],
      choices: [
        { text: "This is how it should always be", detail: "Permanent partnership", type: 'always_together' },
        { text: "Press the advantage", detail: "Tactical focus", type: 'press_advantage' }
      ],
      leadsTo: { always_together: 'ETERNAL_PARTNERSHIP', press_advantage: 'BOSS_APPROACH' }
    },
    'TEAMWORK_MOMENT': {
      prompt: "Celebrating successful teamwork. Victory through collaboration, anime style.",
      narration: "Your combined efforts have created something beautiful.",
      chat: [
        { sender: 'Cha Hae-In', text: "Look what we accomplished together! I've never felt this powerful." },
        { sender: 'player', text: "Teamwork makes us both stronger." }
      ],
      choices: [
        { text: "Let's keep working together", detail: "Future partnership", type: 'keep_working' },
        { text: "You make me stronger too", detail: "Mutual empowerment", type: 'make_stronger' }
      ],
      leadsTo: { keep_working: 'CONTINUED_PARTNERSHIP', make_stronger: 'MUTUAL_STRENGTH' }
    },
    'DUNGEON_CONFESSION': {
      prompt: "Jin-Woo confessing feelings in the middle of a dungeon. Romantic vulnerability, anime style.",
      narration: "Sometimes the heart chooses its moment, regardless of circumstance.",
      chat: [
        { sender: 'player', text: "Hae-In, I need to tell you something. I care about you more than just as a partner." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... in the middle of a dungeon? You really know how to surprise a girl." },
        { sender: 'Cha Hae-In', text: "But I'm glad you said it. I feel the same way." }
      ],
      choices: [
        { text: "When we get out, I want to take you somewhere special", detail: "Date promise", type: 'date_promise' },
        { text: "Can we finish this mission first?", detail: "Mission focus", type: 'mission_first' }
      ],
      leadsTo: { date_promise: 'DATE_PROMISE', mission_first: 'MISSION_PRIORITY' }
    },
    'SILENT_BOND': {
      prompt: "A moment of silent understanding between Jin-Woo and Cha Hae-In. Wordless connection, anime style.",
      narration: "Sometimes the deepest connections need no words.",
      chat: [
        { sender: 'Cha Hae-In', text: "..." },
        { sender: 'player', text: "..." },
        { sender: 'Cha Hae-In', text: "I understand completely." }
      ],
      choices: [
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' },
        { text: "Nod and continue", detail: "Respectful acknowledgment", type: 'nod_continue' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', nod_continue: 'RESPECTFUL_BOND' }
    },


    'NATURAL_MOMENT': {
      prompt: "A perfectly natural moment between Jin-Woo and Cha Hae-In. Organic connection, anime style.",
      narration: "Everything feels effortless when you're together.",
      chat: [
        { sender: 'Cha Hae-In', text: "This feels so natural, like we've always been together." },
        { sender: 'player', text: "Some things are just meant to be." }
      ],
      choices: [
        { text: "Stay in this moment", detail: "Savor the feeling", type: 'stay_moment' },
        { text: "Make it permanent", detail: "Commitment", type: 'make_permanent' }
      ],
      leadsTo: { stay_moment: 'SAVORED_MOMENT', make_permanent: 'PERMANENT_BOND' }
    },
    'RELATIONSHIP_BUILDING': {
      prompt: "Jin-Woo and Cha Hae-In building their relationship. Growing connection, anime style.",
      narration: "Each conversation deepens what you have together.",
      chat: [
        { sender: 'Cha Hae-In', text: "I love how we can talk about anything." },
        { sender: 'player', text: "With you, conversation flows like breathing." }
      ],
      choices: [
        { text: "Share your deepest thoughts", detail: "Vulnerability", type: 'deepest_thoughts' },
        { text: "Ask about her dreams", detail: "Learn about her", type: 'her_dreams' },
        { text: "Build a life together", detail: "Start your shared journey", type: 'daily_life_hub' },
        { text: "Suggest an adventure together", detail: "Action and bonding", type: 'adventure_together' }
      ],
      leadsTo: { deepest_thoughts: 'DEEP_SHARING', her_dreams: 'DREAM_SHARING', daily_life_hub: 'DAILY_LIFE_HUB', adventure_together: 'GATE_ENTRANCE' }
    },
    'FRIENDSHIP_BUILDING': {
      prompt: "Building a strong friendship foundation. Platonic but meaningful connection, anime style.",
      narration: "The foundation of trust you're building is solid and real.",
      chat: [
        { sender: 'Cha Hae-In', text: "I'm so glad we're friends, Jin-Woo. I feel like I can trust you completely." },
        { sender: 'player', text: "That trust means everything to me. I'll never betray it." }
      ],
      choices: [
        { text: "Friends who can become more", detail: "Hint at romance", type: 'friends_to_more' },
        { text: "Loyal friendship forever", detail: "Platonic commitment", type: 'loyal_friendship' }
      ],
      leadsTo: { friends_to_more: 'ROMANTIC_POTENTIAL', loyal_friendship: 'ETERNAL_FRIENDSHIP' }
    },
    'MUTUAL_FEELINGS': {
      prompt: "Both expressing mutual romantic feelings. Love confession, anime style.",
      narration: "The truth is finally out in the open.",
      chat: [
        { sender: 'Cha Hae-In', text: "I've been feeling the same way for so long." },
        { sender: 'player', text: "Then why did we wait so long to say it?" },
        { sender: 'Cha Hae-In', text: "Because now feels perfect." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal the moment", type: 'kiss_seal' },
        { text: "Hold her hands", detail: "Gentle connection", type: 'hold_hands' }
      ],
      leadsTo: { kiss_seal: 'SEALING_KISS', hold_hands: 'HAND_CONNECTION' }
    },
    'PASSIONATE_MOMENT': {
      prompt: "A passionate romantic moment between Jin-Woo and Cha Hae-In. Intense connection, anime style.",
      narration: "The intensity of your feelings overwhelms both of you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Jin-Woo... I never knew I could feel this way." },
        { sender: 'player', text: "You've awakened something in me I didn't know existed." }
      ],
      choices: [
        { text: "Express your love completely", detail: "Total vulnerability", type: 'complete_love' },
        { text: "Promise to cherish her always", detail: "Eternal commitment", type: 'cherish_always' }
      ],
      leadsTo: { complete_love: 'COMPLETE_LOVE', cherish_always: 'ETERNAL_PROMISE' }
    },

    'INTIMATE_CLOSENESS': {
      prompt: "Jin-Woo and Cha Hae-In sharing intimate closeness. Emotional intimacy, anime style.",
      narration: "Physical and emotional barriers dissolve between you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Being this close to you feels like coming home." },
        { sender: 'player', text: "You are my home, Hae-In." }
      ],
      choices: [
        { text: "Stay like this forever", detail: "Wish for permanence", type: 'stay_forever' },
        { text: "Tell her you love her", detail: "Verbal confirmation", type: 'say_love' }
      ],
      leadsTo: { stay_forever: 'ETERNAL_MOMENT', say_love: 'LOVE_WORDS' }
    },
    'SOUL_CONNECTION': {
      prompt: "A deep soul connection forming. Spiritual bond, anime style.",
      narration: "Something fundamental shifts between you, deeper than words.",
      chat: [
        { sender: 'Cha Hae-In', text: "It's like our souls recognize each other." },
        { sender: 'player', text: "Maybe they've been searching for each other all along." }
      ],
      choices: [
        { text: "Embrace the connection", detail: "Accept the bond", type: 'embrace_connection' },
        { text: "Promise never to let go", detail: "Commitment", type: 'never_let_go' }
      ],
      leadsTo: { embrace_connection: 'EMBRACED_SOULS', never_let_go: 'ETERNAL_HOLD' }
    },
    'PHILOSOPHY_SHARING': {
      prompt: "Jin-Woo sharing his philosophy about strength and protection with Cha Hae-In. Deep conversation, anime style.",
      narration: "You share your beliefs about what true strength means to you.",
      chat: [
        { sender: 'player', text: "I believe strength isn't just about power. It's about protecting those who matter to you." },
        { sender: 'Cha Hae-In', text: "That's... exactly how I feel. You put it perfectly." },
        { sender: 'Cha Hae-In', text: "I've always believed hunters should use their power to protect, not just for personal gain." }
      ],
      choices: [
        { text: "You inspire me", detail: "Express admiration", type: 'inspire_me' },
        { text: "We think alike", detail: "Note compatibility", type: 'think_alike' },
        { text: "That's why you're special", detail: "Personal compliment", type: 'youre_special' }
      ],
      leadsTo: { inspire_me: 'INSPIRATION_MOMENT', think_alike: 'COMPATIBLE_MINDS', youre_special: 'SPECIAL_RECOGNITION' }
    },
    'HER_PHILOSOPHY': {
      prompt: "Cha Hae-In explaining her philosophy about being a hunter. Thoughtful expression, anime style.",
      narration: "Hae-In opens up about her own beliefs and motivations.",
      chat: [
        { sender: 'Cha Hae-In', text: "I became a hunter to make a difference. To protect people who can't protect themselves." },
        { sender: 'Cha Hae-In', text: "Sometimes I wonder if I'm strong enough, but then I remember why I'm fighting." },
        { sender: 'player', text: "Your heart is what makes you truly strong, Hae-In." }
      ],
      choices: [
        { text: "You're stronger than you know", detail: "Encourage her", type: 'stronger_than_know' },
        { text: "I want to fight alongside you", detail: "Partnership desire", type: 'fight_alongside' },
        { text: "Your compassion is your strength", detail: "Praise her character", type: 'compassion_strength' }
      ],
      leadsTo: { stronger_than_know: 'STRENGTH_RECOGNITION', fight_alongside: 'PARTNERSHIP_DESIRE', compassion_strength: 'CHARACTER_PRAISE' }
    },
    'SHARED_PURPOSE': {
      prompt: "Jin-Woo and Cha Hae-In realizing their shared purpose. Unity moment, anime style.",
      narration: "You both realize you share the same fundamental purpose.",
      chat: [
        { sender: 'player', text: "We both want to make the world safer. To protect innocent people." },
        { sender: 'Cha Hae-In', text: "Yes! That's exactly it. We understand each other completely." },
        { sender: 'Cha Hae-In', text: "With our combined strength, we could really make a difference." }
      ],
      choices: [
        { text: "Let's change the world together", detail: "Grand partnership", type: 'change_world' },
        { text: "You make me want to be better", detail: "Personal growth", type: 'be_better' },
        { text: "Together we're unstoppable", detail: "Confidence in unity", type: 'unstoppable' }
      ],
      leadsTo: { change_world: 'WORLD_CHANGING', be_better: 'MUTUAL_IMPROVEMENT', unstoppable: 'UNSTOPPABLE_TEAM' }
    },
    'INSPIRATION_MOMENT': {
      prompt: "Cha Hae-In feeling inspired by Jin-Woo's words. Uplifting moment, anime style.",
      narration: "Your words fill her with renewed purpose and determination.",
      chat: [
        { sender: 'Cha Hae-In', text: "You always know exactly what to say to motivate me." },
        { sender: 'Cha Hae-In', text: "When I'm with you, I feel like I can accomplish anything." }
      ],
      choices: [
        { text: "Because you're amazing", detail: "Praise her directly", type: 'youre_amazing' },
        { text: "We bring out the best in each other", detail: "Mutual enhancement", type: 'best_in_each' }
      ],
      leadsTo: { youre_amazing: 'DIRECT_PRAISE', best_in_each: 'MUTUAL_ENHANCEMENT' }
    },
    'COMPATIBLE_MINDS': {
      prompt: "Jin-Woo and Cha Hae-In discovering their mental compatibility. Understanding moment, anime style.",
      narration: "You both realize how perfectly your thoughts align.",
      chat: [
        { sender: 'Cha Hae-In', text: "It's like we share the same mind sometimes." },
        { sender: 'player', text: "Great minds think alike, they say." },
        { sender: 'Cha Hae-In', text: "I've never met anyone who understands me like you do." }
      ],
      choices: [
        { text: "That's what makes us perfect partners", detail: "Partnership focus", type: 'perfect_partners' },
        { text: "You understand me too", detail: "Mutual understanding", type: 'understand_me_too' }
      ],
      leadsTo: { perfect_partners: 'PERFECT_PARTNERSHIP', understand_me_too: 'MUTUAL_UNDERSTANDING' }
    },
    'SPECIAL_RECOGNITION': {
      prompt: "Cha Hae-In feeling recognized and valued by Jin-Woo. Emotional recognition, anime style.",
      narration: "Your recognition of her special qualities touches her deeply.",
      chat: [
        { sender: 'Cha Hae-In', text: "*blushes deeply* You really think I'm special?" },
        { sender: 'player', text: "More special than you know." },
        { sender: 'Cha Hae-In', text: "No one has ever made me feel this valued before." }
      ],
      choices: [
        { text: "You deserve to feel special", detail: "Affirm her worth", type: 'deserve_special' },
        { text: "You're one of a kind", detail: "Emphasize uniqueness", type: 'one_of_kind' }
      ],
      leadsTo: { deserve_special: 'DESERVED_WORTH', one_of_kind: 'UNIQUE_VALUE' }
    },
    'STRENGTH_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's true strength. Empowering moment, anime style.",
      narration: "You help her see the strength she already possesses.",
      chat: [
        { sender: 'player', text: "Your strength isn't just physical. It's your determination, your compassion." },
        { sender: 'Cha Hae-In', text: "I... I never thought of it that way." },
        { sender: 'Cha Hae-In', text: "You make me see myself differently." }
      ],
      choices: [
        { text: "You're a natural leader", detail: "Leadership recognition", type: 'natural_leader' },
        { text: "Your heart guides your strength", detail: "Heart-centered power", type: 'heart_guides' }
      ],
      leadsTo: { natural_leader: 'LEADERSHIP_MOMENT', heart_guides: 'HEART_STRENGTH' }
    },
    'PARTNERSHIP_DESIRE': {
      prompt: "Jin-Woo expressing desire to fight alongside Cha Hae-In. Partnership bond, anime style.",
      narration: "You express your genuine desire to stand beside her in battle.",
      chat: [
        { sender: 'Cha Hae-In', text: "You really want to fight with me? Not just protect me?" },
        { sender: 'player', text: "As equals. As partners. I trust your strength completely." },
        { sender: 'Cha Hae-In', text: "That means everything to me, Jin-Woo." }
      ],
      choices: [
        { text: "We're stronger together", detail: "Combined strength", type: 'stronger_together' },
        { text: "I want you by my side", detail: "Personal desire", type: 'by_my_side' }
      ],
      leadsTo: { stronger_together: 'COMBINED_STRENGTH', by_my_side: 'SIDE_BY_SIDE' }
    },
    'CHARACTER_PRAISE': {
      prompt: "Jin-Woo praising Cha Hae-In's character and compassion. Character appreciation, anime style.",
      narration: "You acknowledge what makes her truly exceptional.",
      chat: [
        { sender: 'player', text: "Your compassion is what sets you apart from other hunters." },
        { sender: 'Cha Hae-In', text: "Sometimes I worry it makes me weak..." },
        { sender: 'player', text: "It makes you stronger. It's why people trust you, why I trust you." }
      ],
      choices: [
        { text: "Never lose that compassion", detail: "Preserve her nature", type: 'keep_compassion' },
        { text: "It's your greatest strength", detail: "Emphasize importance", type: 'greatest_strength' }
      ],
      leadsTo: { keep_compassion: 'PRESERVED_NATURE', greatest_strength: 'GREATEST_ASSET' }
    },
    'WORLD_CHANGING': {
      prompt: "Jin-Woo and Cha Hae-In planning to change the world together. Epic partnership, anime style.",
      narration: "Together, you envision a future where hunters truly protect humanity.",
      chat: [
        { sender: 'Cha Hae-In', text: "With your shadows and my sword, we could revolutionize how hunters operate." },
        { sender: 'player', text: "A new era of protection, not just power." },
        { sender: 'Cha Hae-In', text: "I want to build that future with you, Jin-Woo." }
      ],
      choices: [
        { text: "Let's start today", detail: "Immediate action", type: 'start_today' },
        { text: "We'll need allies", detail: "Strategic thinking", type: 'need_allies' }
      ],
      leadsTo: { start_today: 'IMMEDIATE_ACTION', need_allies: 'STRATEGIC_PLANNING' }
    },
    'MUTUAL_IMPROVEMENT': {
      prompt: "Jin-Woo and Cha Hae-In inspiring each other to grow. Mutual enhancement, anime style.",
      narration: "You both realize how much you've grown since meeting each other.",
      chat: [
        { sender: 'Cha Hae-In', text: "You make me want to push my limits, to become stronger." },
        { sender: 'player', text: "And you show me there's more to strength than just power." },
        { sender: 'Cha Hae-In', text: "We're both becoming better versions of ourselves." }
      ],
      choices: [
        { text: "That's what partners do", detail: "Partnership definition", type: 'partners_do' },
        { text: "You inspire me every day", detail: "Daily inspiration", type: 'inspire_daily' }
      ],
      leadsTo: { partners_do: 'PARTNER_DEFINITION', inspire_daily: 'DAILY_INSPIRATION' }
    },
    'UNSTOPPABLE_TEAM': {
      prompt: "Jin-Woo and Cha Hae-In as an unstoppable team. Power couple, anime style.",
      narration: "The confidence in your combined abilities is absolute.",
      chat: [
        { sender: 'player', text: "Nothing can stand against us when we're together." },
        { sender: 'Cha Hae-In', text: "Our synergy is perfect. We complement each other completely." },
        { sender: 'Cha Hae-In', text: "I've never felt so powerful, so... complete." }
      ],
      choices: [
        { text: "You complete me too", detail: "Mutual completion", type: 'complete_me' },
        { text: "This is just the beginning", detail: "Future potential", type: 'just_beginning' }
      ],
      leadsTo: { complete_me: 'MUTUAL_COMPLETION', just_beginning: 'FUTURE_POTENTIAL' }
    },
    'PERFECT_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In achieving perfect partnership. Ideal team, anime style.",
      narration: "You've found the perfect balance in your partnership.",
      chat: [
        { sender: 'Cha Hae-In', text: "We work together like we were meant to be a team." },
        { sender: 'player', text: "Maybe we were. Some things are just destiny." },
        { sender: 'Cha Hae-In', text: "Destiny... I like the sound of that." }
      ],
      choices: [
        { text: "Our destiny is together", detail: "Romantic destiny", type: 'destiny_together' },
        { text: "We make our own destiny", detail: "Self-determination", type: 'make_destiny' }
      ],
      leadsTo: { destiny_together: 'ROMANTIC_DESTINY', make_destiny: 'SELF_MADE_DESTINY' }
    },
    'MUTUAL_UNDERSTANDING': {
      prompt: "Jin-Woo and Cha Hae-In sharing deep mutual understanding. Soul connection, anime style.",
      narration: "Your understanding of each other transcends words.",
      chat: [
        { sender: 'Cha Hae-In', text: "Sometimes I feel like you know me better than I know myself." },
        { sender: 'player', text: "That's because I see all the amazing things you don't see in yourself." },
        { sender: 'Cha Hae-In', text: "And you help me see them too." }
      ],
      choices: [
        { text: "That's what love does", detail: "Love recognition", type: 'what_love_does' },
        { text: "We see each other's truth", detail: "Truth seeing", type: 'see_truth' }
      ],
      leadsTo: { what_love_does: 'LOVE_RECOGNITION', see_truth: 'TRUTH_SEEING' }
    },
    'DIRECT_PRAISE': {
      prompt: "Jin-Woo directly praising Cha Hae-In's amazing qualities. Sincere admiration, anime style.",
      narration: "Your sincere praise touches her heart deeply.",
      chat: [
        { sender: 'player', text: "You really are amazing, Hae-In. Everything about you." },
        { sender: 'Cha Hae-In', text: "*blushes deeply* You make me feel so special when you say things like that." },
        { sender: 'Cha Hae-In', text: "I've never had someone believe in me the way you do." }
      ],
      choices: [
        { text: "Because you deserve it", detail: "Affirm her worth", type: 'deserve_praise' },
        { text: "I see your true self", detail: "Deep understanding", type: 'true_self' }
      ],
      leadsTo: { deserve_praise: 'DESERVED_WORTH', true_self: 'TRUE_SELF_RECOGNITION' }
    },
    'MUTUAL_ENHANCEMENT': {
      prompt: "Jin-Woo and Cha Hae-In bringing out the best in each other. Synergistic growth, anime style.",
      narration: "Together, you both become better versions of yourselves.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really do bring out the best in each other, don't we?" },
        { sender: 'player', text: "You make me want to be worthy of standing beside you." },
        { sender: 'Cha Hae-In', text: "And you show me strengths I never knew I had." }
      ],
      choices: [
        { text: "That's true partnership", detail: "Define partnership", type: 'true_partnership' },
        { text: "We're perfect together", detail: "Express compatibility", type: 'perfect_together' }
      ],
      leadsTo: { true_partnership: 'TRUE_PARTNERSHIP', perfect_together: 'PERFECT_COMPATIBILITY' }
    },
    'DESERVED_WORTH': {
      prompt: "Cha Hae-In realizing her own worth through Jin-Woo's recognition. Self-acceptance, anime style.",
      narration: "She begins to see herself through your eyes.",
      chat: [
        { sender: 'Cha Hae-In', text: "Maybe... maybe I really am worth all these kind words." },
        { sender: 'player', text: "You're worth so much more than you realize." },
        { sender: 'Cha Hae-In', text: "Thank you for helping me see that." }
      ],
      choices: [
        { text: "You're incredible", detail: "Continue praise", type: 'continue_praise' },
        { text: "Now you're seeing clearly", detail: "Affirm realization", type: 'seeing_clearly' }
      ],
      leadsTo: { continue_praise: 'ROMANTIC_MOMENT', seeing_clearly: 'CLEAR_VISION' }
    },
    'UNIQUE_VALUE': {
      prompt: "Jin-Woo emphasizing Cha Hae-In's unique and irreplaceable value. Special recognition, anime style.",
      narration: "You help her understand just how special she truly is.",
      chat: [
        { sender: 'player', text: "There's no one else like you, Hae-In. You're one of a kind." },
        { sender: 'Cha Hae-In', text: "One of a kind... I like how that sounds coming from you." },
        { sender: 'Cha Hae-In', text: "You make me feel irreplaceable." }
      ],
      choices: [
        { text: "Because you are irreplaceable", detail: "Affirm uniqueness", type: 'irreplaceable' },
        { text: "That's why I treasure you", detail: "Express value", type: 'treasure_you' }
      ],
      leadsTo: { irreplaceable: 'IRREPLACEABLE_BOND', treasure_you: 'TREASURED_CONNECTION' }
    },
    'LEADERSHIP_MOMENT': {
      prompt: "Cha Hae-In showing natural leadership qualities. Leadership recognition, anime style.",
      narration: "Her natural leadership abilities shine through.",
      chat: [
        { sender: 'player', text: "You're a natural leader, Hae-In. People follow you because they trust you." },
        { sender: 'Cha Hae-In', text: "I... I never thought of myself as a leader." },
        { sender: 'Cha Hae-In', text: "But when you say it, I can almost believe it." }
      ],
      choices: [
        { text: "Lead and I'll follow", detail: "Show trust", type: 'follow_lead' },
        { text: "We can lead together", detail: "Partnership leadership", type: 'lead_together' }
      ],
      leadsTo: { follow_lead: 'TRUSTED_LEADER', lead_together: 'JOINT_LEADERSHIP' }
    },
    'HEART_STRENGTH': {
      prompt: "Jin-Woo recognizing that Cha Hae-In's heart guides her strength. Heart-centered power, anime style.",
      narration: "You acknowledge the source of her true power.",
      chat: [
        { sender: 'player', text: "Your heart is what guides your strength. That's what makes you so powerful." },
        { sender: 'Cha Hae-In', text: "My heart... I never thought of it as a strength before." },
        { sender: 'Cha Hae-In', text: "You see things in me that I miss completely." }
      ],
      choices: [
        { text: "Your heart chose to protect", detail: "Noble purpose", type: 'chose_protect' },
        { text: "It's your greatest weapon", detail: "Heart as strength", type: 'greatest_weapon' }
      ],
      leadsTo: { chose_protect: 'PROTECTIVE_HEART', greatest_weapon: 'HEART_WEAPON' }
    },
    'COMBINED_STRENGTH': {
      prompt: "Jin-Woo and Cha Hae-In realizing their combined strength. United power, anime style.",
      narration: "Together, your strengths multiply exponentially.",
      chat: [
        { sender: 'Cha Hae-In', text: "When we fight together, it's like our strengths multiply." },
        { sender: 'player', text: "We're stronger together than apart. That's the power of partnership." },
        { sender: 'Cha Hae-In', text: "I want to keep fighting by your side." }
      ],
      choices: [
        { text: "Always", detail: "Promise partnership", type: 'always_together' },
        { text: "We're unstoppable", detail: "Confidence in team", type: 'unstoppable_team' }
      ],
      leadsTo: { always_together: 'ETERNAL_PARTNERSHIP', unstoppable_team: 'UNSTOPPABLE_FORCE' }
    },
    'SIDE_BY_SIDE': {
      prompt: "Jin-Woo expressing desire to stand side by side with Cha Hae-In. Equal partnership, anime style.",
      narration: "You want her by your side as an equal partner.",
      chat: [
        { sender: 'player', text: "I want you by my side, Hae-In. Not behind me, not in front. Right beside me." },
        { sender: 'Cha Hae-In', text: "Side by side... as equals." },
        { sender: 'Cha Hae-In', text: "That's all I've ever wanted from a partner." }
      ],
      choices: [
        { text: "As equals in everything", detail: "Complete equality", type: 'complete_equals' },
        { text: "Partners in every way", detail: "Full partnership", type: 'full_partners' }
      ],
      leadsTo: { complete_equals: 'EQUAL_PARTNERSHIP', full_partners: 'COMPLETE_PARTNERSHIP' }
    },
    'PRESERVED_NATURE': {
      prompt: "Jin-Woo encouraging Cha Hae-In to preserve her compassionate nature. Character preservation, anime style.",
      narration: "You want her to keep what makes her special.",
      chat: [
        { sender: 'player', text: "Never lose that compassion, Hae-In. It's what makes you who you are." },
        { sender: 'Cha Hae-In', text: "Sometimes I worry it makes me weak in this harsh world." },
        { sender: 'player', text: "It makes you strong in ways that matter most." }
      ],
      choices: [
        { text: "The world needs your compassion", detail: "Global importance", type: 'world_needs' },
        { text: "I need your compassion", detail: "Personal need", type: 'i_need' }
      ],
      leadsTo: { world_needs: 'WORLD_HEALER', i_need: 'PERSONAL_HEALING' }
    },
    'GREATEST_ASSET': {
      prompt: "Jin-Woo recognizing Cha Hae-In's compassion as her greatest asset. Asset recognition, anime style.",
      narration: "You help her see her compassion as a powerful strength.",
      chat: [
        { sender: 'player', text: "Your compassion is your greatest asset. It's what sets you apart from everyone else." },
        { sender: 'Cha Hae-In', text: "An asset... I never thought of kindness that way." },
        { sender: 'Cha Hae-In', text: "You make me proud of who I am." }
      ],
      choices: [
        { text: "You should be proud", detail: "Encourage pride", type: 'should_be_proud' },
        { text: "It's your superpower", detail: "Compassion as power", type: 'superpower' }
      ],
      leadsTo: { should_be_proud: 'RIGHTFUL_PRIDE', superpower: 'COMPASSION_POWER' }
    },
    'IMMEDIATE_ACTION': {
      prompt: "Jin-Woo and Cha Hae-In taking immediate action together. Dynamic partnership, anime style.",
      narration: "You both decide to act on your shared vision immediately.",
      chat: [
        { sender: 'player', text: "Let's start making a difference today. No more waiting." },
        { sender: 'Cha Hae-In', text: "Yes! I love your determination. Let's change things now." },
        { sender: 'Cha Hae-In', text: "Together, we can accomplish anything." }
      ],
      choices: [
        { text: "Plan our first mission", detail: "Strategic approach", type: 'plan_mission' },
        { text: "Find others to help", detail: "Build team", type: 'find_allies' }
      ],
      leadsTo: { plan_mission: 'MISSION_PLANNING', find_allies: 'ALLY_RECRUITMENT' }
    },
    'STRATEGIC_PLANNING': {
      prompt: "Jin-Woo and Cha Hae-In strategically planning their future. Tactical partnership, anime style.",
      narration: "You both approach your shared goals with careful planning.",
      chat: [
        { sender: 'Cha Hae-In', text: "We should plan this carefully. A strategic approach will be more effective." },
        { sender: 'player', text: "Good thinking. Let's map out our strategy step by step." },
        { sender: 'Cha Hae-In', text: "With both our skills, we can create something incredible." }
      ],
      choices: [
        { text: "Start with small steps", detail: "Gradual approach", type: 'small_steps' },
        { text: "Think big from the start", detail: "Ambitious planning", type: 'think_big' }
      ],
      leadsTo: { small_steps: 'GRADUAL_PROGRESS', think_big: 'AMBITIOUS_VISION' }
    },
    'PARTNER_DEFINITION': {
      prompt: "Jin-Woo defining what true partnership means. Partnership values, anime style.",
      narration: "You express your understanding of what real partnership looks like.",
      chat: [
        { sender: 'player', text: "That's what true partners do - we lift each other up, make each other stronger." },
        { sender: 'Cha Hae-In', text: "I've never had a partnership like this before." },
        { sender: 'Cha Hae-In', text: "You make me believe in what we can accomplish together." }
      ],
      choices: [
        { text: "This is just the beginning", detail: "Future potential", type: 'just_beginning' },
        { text: "We're perfect partners", detail: "Acknowledge compatibility", type: 'perfect_partners' }
      ],
      leadsTo: { just_beginning: 'BEGINNING_JOURNEY', perfect_partners: 'PERFECT_PARTNERSHIP' }
    },
    'DAILY_INSPIRATION': {
      prompt: "Cha Hae-In being inspired by Jin-Woo every day. Ongoing motivation, anime style.",
      narration: "She expresses how you motivate her continuously.",
      chat: [
        { sender: 'Cha Hae-In', text: "Every day with you brings new inspiration. You push me to be better." },
        { sender: 'player', text: "And you inspire me just as much. We're good for each other." },
        { sender: 'Cha Hae-In', text: "I love how we motivate each other to grow." }
      ],
      choices: [
        { text: "Let's keep growing together", detail: "Continued development", type: 'keep_growing' },
        { text: "You're my motivation too", detail: "Mutual inspiration", type: 'my_motivation' }
      ],
      leadsTo: { keep_growing: 'CONTINUED_GROWTH', my_motivation: 'MUTUAL_MOTIVATION' }
    },
    'MUTUAL_COMPLETION': {
      prompt: "Jin-Woo and Cha Hae-In feeling complete together. Soul completion, anime style.",
      narration: "You both feel like missing pieces of yourselves have been found.",
      chat: [
        { sender: 'player', text: "You complete me too, Hae-In. I never knew what was missing until I found you." },
        { sender: 'Cha Hae-In', text: "It's like we were meant to find each other." },
        { sender: 'Cha Hae-In', text: "Two halves becoming whole." }
      ],
      choices: [
        { text: "Destiny brought us together", detail: "Fate recognition", type: 'destiny_brought' },
        { text: "We make each other whole", detail: "Completeness", type: 'make_whole' }
      ],
      leadsTo: { destiny_brought: 'DESTINED_MEETING', make_whole: 'WHOLENESS_ACHIEVED' }
    },
    'FUTURE_POTENTIAL': {
      prompt: "Jin-Woo and Cha Hae-In excited about their future potential. Unlimited possibilities, anime style.",
      narration: "The potential of what you could accomplish together is limitless.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is just the beginning of what we can do together." },
        { sender: 'player', text: "Our potential is limitless. There's nothing we can't face together." },
        { sender: 'Cha Hae-In', text: "The future has never looked so bright." }
      ],
      choices: [
        { text: "Let's make that future reality", detail: "Action commitment", type: 'make_reality' },
        { text: "Together, anything is possible", detail: "Unlimited belief", type: 'anything_possible' }
      ],
      leadsTo: { make_reality: 'FUTURE_CREATION', anything_possible: 'UNLIMITED_POTENTIAL' }
    },
    'ROMANTIC_DESTINY': {
      prompt: "Jin-Woo and Cha Hae-In accepting their romantic destiny. Fated love, anime style.",
      narration: "You both acknowledge that your connection was destined to be romantic.",
      chat: [
        { sender: 'player', text: "Our destiny is to be together, Hae-In. Not just as partners, but as something more." },
        { sender: 'Cha Hae-In', text: "*blushes deeply* I... I feel it too. This connection between us." },
        { sender: 'Cha Hae-In', text: "Maybe some things really are meant to be." }
      ],
      choices: [
        { text: "I'm falling for you", detail: "Romantic confession", type: 'falling_for' },
        { text: "Let destiny guide us", detail: "Accept fate", type: 'guide_us' }
      ],
      leadsTo: { falling_for: 'ROMANTIC_CONFESSION', guide_us: 'DESTINY_ACCEPTANCE' }
    },
    'SELF_MADE_DESTINY': {
      prompt: "Jin-Woo and Cha Hae-In choosing to create their own destiny. Self-determination, anime style.",
      narration: "You both decide to forge your own path together.",
      chat: [
        { sender: 'player', text: "We don't need fate to decide for us. We can make our own destiny." },
        { sender: 'Cha Hae-In', text: "I like that. We're in control of our own story." },
        { sender: 'Cha Hae-In', text: "What kind of destiny should we create together?" }
      ],
      choices: [
        { text: "One where we're always together", detail: "Togetherness focus", type: 'always_together' },
        { text: "One where we protect what matters", detail: "Protection mission", type: 'protect_matters' }
      ],
      leadsTo: { always_together: 'ETERNAL_TOGETHERNESS', protect_matters: 'PROTECTIVE_DESTINY' }
    },
    'LOVE_RECOGNITION': {
      prompt: "Jin-Woo and Cha Hae-In recognizing love between them. Love acknowledgment, anime style.",
      narration: "The word 'love' hangs in the air between you, acknowledged and real.",
      chat: [
        { sender: 'Cha Hae-In', text: "Love... is that what this is? What I'm feeling?" },
        { sender: 'player', text: "I think it is. I love you, Hae-In." },
        { sender: 'Cha Hae-In', text: "*tears in her eyes* I love you too, Jin-Woo." }
      ],
      choices: [
        { text: "Kiss her gently", detail: "Romantic gesture", type: 'gentle_kiss' },
        { text: "Hold her close", detail: "Intimate embrace", type: 'hold_close' }
      ],
      leadsTo: { gentle_kiss: 'LOVE_KISS', hold_close: 'LOVE_EMBRACE' }
    },
    'TRUTH_SEEING': {
      prompt: "Jin-Woo and Cha Hae-In seeing each other's true selves. Authentic connection, anime style.",
      narration: "All pretenses fall away as you see each other completely.",
      chat: [
        { sender: 'player', text: "We see each other's truth - the real person behind all the walls." },
        { sender: 'Cha Hae-In', text: "No masks, no pretending. Just... us." },
        { sender: 'Cha Hae-In', text: "I've never felt so known by anyone before." }
      ],
      choices: [
        { text: "That's true intimacy", detail: "Define connection", type: 'true_intimacy' },
        { text: "I want to know all of you", detail: "Deeper connection", type: 'know_all' }
      ],
      leadsTo: { true_intimacy: 'INTIMATE_TRUTH', know_all: 'COMPLETE_KNOWING' }
    },
    'TRUE_SELF_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's true self completely. Deep recognition, anime style.",
      narration: "You see past all facades to who she really is.",
      chat: [
        { sender: 'player', text: "I see your true self, Hae-In. The real you behind everything else." },
        { sender: 'Cha Hae-In', text: "No one has ever seen me so clearly before." },
        { sender: 'Cha Hae-In', text: "It's both terrifying and wonderful." }
      ],
      choices: [
        { text: "Your true self is beautiful", detail: "Affirm her authenticity", type: 'true_beautiful' },
        { text: "That's who I fell for", detail: "Romantic recognition", type: 'fell_for_true' }
      ],
      leadsTo: { true_beautiful: 'AUTHENTIC_BEAUTY', fell_for_true: 'TRUE_LOVE' }
    },
    'TRUE_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In achieving true partnership. Perfect collaboration, anime style.",
      narration: "You've found what real partnership means.",
      chat: [
        { sender: 'player', text: "This is what true partnership looks like - equals supporting each other." },
        { sender: 'Cha Hae-In', text: "I've never experienced anything like this before." },
        { sender: 'Cha Hae-In', text: "We really do make each other better." }
      ],
      choices: [
        { text: "Partners in everything", detail: "Complete partnership", type: 'partners_everything' },
        { text: "This is just the start", detail: "Future focus", type: 'just_start' }
      ],
      leadsTo: { partners_everything: 'COMPLETE_PARTNERSHIP', just_start: 'PARTNERSHIP_BEGINNING' }
    },
    'PERFECT_COMPATIBILITY': {
      prompt: "Jin-Woo and Cha Hae-In realizing they're perfectly compatible. Ideal compatibility, anime style.",
      narration: "Every aspect of your personalities complement each other perfectly.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really are perfect together, aren't we?" },
        { sender: 'player', text: "Like two pieces of a puzzle that were made to fit." },
        { sender: 'Cha Hae-In', text: "I can't imagine being with anyone else." }
      ],
      choices: [
        { text: "You're my perfect match", detail: "Confirm compatibility", type: 'perfect_match' },
        { text: "We were made for each other", detail: "Destiny acknowledgment", type: 'made_for_each' }
      ],
      leadsTo: { perfect_match: 'CONFIRMED_MATCH', made_for_each: 'DESTINED_PAIR' }
    },
    'CONFIRMED_MATCH': {
      prompt: "Cha Hae-In and Jin-Woo in a romantic moment, perfect understanding between them, hearts connecting, Solo Leveling art style.",
      narration: "*Her heart races as she realizes the depth of your connection* Yes... we are perfect matches, Jin-Woo. In every way that matters.",
      chat: [
        { sender: 'Cha Hae-In', text: "*reaches for your hand with a radiant smile* You're right, Jin-Woo. We understand each other completely. I feel like I've been waiting my whole life to meet you." },
        { sender: 'player', text: "And I've been waiting for someone who could understand my heart." },
        { sender: 'Cha Hae-In', text: "*intertwines fingers with yours* This feels so right, so natural..." }
      ],
      choices: [
        { text: "Take her hand closer", detail: "Deepen the connection", type: 'take_hand' },
        { text: "Move closer to her", detail: "Close the distance", type: 'move_closer' },
        { text: "Look into her eyes", detail: "Share the moment", type: 'eye_contact' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', move_closer: 'ROMANTIC_MOMENT', eye_contact: 'INTIMATE_GAZE' }
    },
    'DESTINED_PAIR': {
      prompt: "Jin-Woo and Cha Hae-In under starlight, destiny bringing them together, romantic fate, Solo Leveling style.",
      narration: "*She looks into your eyes with wonder and certainty* You really believe we were destined to find each other, don't you? *her voice soft with emotion* I... I think you might be right.",
      chat: [
        { sender: 'Cha Hae-In', text: "*steps even closer, her eyes shining* If this is destiny, Jin-Woo, then I'm grateful for every choice that led me to you. You make me feel complete." },
        { sender: 'player', text: "Every battle, every struggle... it all led me to this moment with you." },
        { sender: 'Cha Hae-In', text: "*voice trembling with emotion* Then let's not waste another moment of this destiny we've been given." }
      ],
      choices: [
        { text: "Kiss her gently", detail: "Follow your heart", type: 'gentle_kiss' },
        { text: "Hold her close", detail: "Embrace destiny", type: 'hold_close' },
        { text: "Promise forever", detail: "Commit to this fate", type: 'promise_forever' }
      ],
      leadsTo: { gentle_kiss: 'FIRST_KISS', hold_close: 'ROMANTIC_EMBRACE', promise_forever: 'ETERNAL_PROMISE' }
    },
    'INTIMATE_GAZE': {
      prompt: "Jin-Woo and Cha Hae-In sharing an intimate, prolonged eye contact moment. Deep connection, anime style with soft lighting.",
      narration: "*Your eyes meet and hold, creating an electric moment of perfect understanding. Time seems to stop as you both recognize the depth of what's between you.*",
      chat: [
        { sender: 'Cha Hae-In', text: "*whispers softly* The way you look at me... like I'm the only person in the world that matters." },
        { sender: 'player', text: "Because to me, you are." },
        { sender: 'Cha Hae-In', text: "*blushes deeply, unable to look away* Jin-Woo..." }
      ],
      choices: [
        { text: "Tell her how you feel", detail: "Open your heart", type: 'confess_feelings' },
        { text: "Kiss her softly", detail: "Let actions speak", type: 'soft_kiss' },
        { text: "Hold this moment", detail: "Cherish the connection", type: 'cherish_gaze' }
      ],
      leadsTo: { confess_feelings: 'LOVE_DECLARATION', soft_kiss: 'FIRST_KISS', cherish_gaze: 'ROMANTIC_MOMENT' }
    },
    'CLEAR_VISION': {
      prompt: "Cha Hae-In seeing herself clearly through Jin-Woo's eyes. Self-clarity, anime style.",
      narration: "She finally sees herself as you see her.",
      chat: [
        { sender: 'Cha Hae-In', text: "Now I'm seeing clearly... seeing myself the way you see me." },
        { sender: 'player', text: "That's the real you - amazing, strong, beautiful." },
        { sender: 'Cha Hae-In', text: "Thank you for helping me find myself." }
      ],
      choices: [
        { text: "You were always there", detail: "Inherent worth", type: 'always_there' },
        { text: "Now you can shine", detail: "Encourage confidence", type: 'now_shine' }
      ],
      leadsTo: { always_there: 'INHERENT_WORTH', now_shine: 'CONFIDENT_SHINE' }
    },
    'IRREPLACEABLE_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming an irreplaceable bond. Unique connection, anime style.",
      narration: "Your bond is one-of-a-kind, irreplaceable and precious.",
      chat: [
        { sender: 'player', text: "What we have is irreplaceable, Hae-In. No one could ever take your place." },
        { sender: 'Cha Hae-In', text: "And no one could take yours. You're irreplaceable to me too." },
        { sender: 'Cha Hae-In', text: "This bond we share... it's special." }
      ],
      choices: [
        { text: "It's precious to me", detail: "Value the bond", type: 'precious_bond' },
        { text: "Let's protect this", detail: "Preserve connection", type: 'protect_this' }
      ],
      leadsTo: { precious_bond: 'PRECIOUS_CONNECTION', protect_this: 'PROTECTED_BOND' }
    },
    'TREASURED_CONNECTION': {
      prompt: "Jin-Woo treasuring his connection with Cha Hae-In. Valued relationship, anime style.",
      narration: "You hold your connection with her as your most treasured possession.",
      chat: [
        { sender: 'player', text: "I treasure you, Hae-In. You're the most precious thing in my life." },
        { sender: 'Cha Hae-In', text: "*touched deeply* You treasure me... no one has ever said that before." },
        { sender: 'Cha Hae-In', text: "You're precious to me too, more than you know." }
      ],
      choices: [
        { text: "You're my greatest treasure", detail: "Ultimate value", type: 'greatest_treasure' },
        { text: "I'll always treasure you", detail: "Eternal promise", type: 'always_treasure' }
      ],
      leadsTo: { greatest_treasure: 'ULTIMATE_TREASURE', always_treasure: 'ETERNAL_TREASURING' }
    },
    'TRUSTED_LEADER': {
      prompt: "Cha Hae-In as a trusted leader with Jin-Woo's support. Leadership trust, anime style.",
      narration: "You show complete trust in her leadership abilities.",
      chat: [
        { sender: 'player', text: "Lead the way, Hae-In. I trust your judgment completely." },
        { sender: 'Cha Hae-In', text: "Your trust means everything to me. I won't let you down." },
        { sender: 'Cha Hae-In', text: "Together, we can accomplish anything." }
      ],
      choices: [
        { text: "I believe in you", detail: "Express faith", type: 'believe_you' },
        { text: "Lead us to victory", detail: "Victory focus", type: 'lead_victory' }
      ],
      leadsTo: { believe_you: 'COMPLETE_FAITH', lead_victory: 'VICTORY_LEADERSHIP' }
    },
    'JOINT_LEADERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In leading together as equals. Shared leadership, anime style.",
      narration: "You both step up as co-leaders, sharing the responsibility.",
      chat: [
        { sender: 'player', text: "We can lead together, as equals. Your strength and mine combined." },
        { sender: 'Cha Hae-In', text: "Co-leaders... I like that. We complement each other perfectly." },
        { sender: 'Cha Hae-In', text: "No one could stand against us." }
      ],
      choices: [
        { text: "Perfect partnership", detail: "Ideal collaboration", type: 'perfect_partnership' },
        { text: "Unstoppable together", detail: "Combined power", type: 'unstoppable_together' }
      ],
      leadsTo: { perfect_partnership: 'IDEAL_PARTNERSHIP', unstoppable_together: 'COMBINED_LEADERSHIP' }
    },
    'PROTECTIVE_HEART': {
      prompt: "Cha Hae-In's heart choosing to protect others. Noble heart, anime style.",
      narration: "Her heart's choice to protect defines her true strength.",
      chat: [
        { sender: 'player', text: "Your heart chose to protect the innocent. That's what makes you a true hero." },
        { sender: 'Cha Hae-In', text: "A hero... I never thought of myself that way." },
        { sender: 'Cha Hae-In', text: "But if my heart can help people, then I'm proud of that choice." }
      ],
      choices: [
        { text: "You're my hero", detail: "Personal admiration", type: 'my_hero' },
        { text: "The world's hero", detail: "Global recognition", type: 'worlds_hero' }
      ],
      leadsTo: { my_hero: 'PERSONAL_HERO', worlds_hero: 'GLOBAL_HERO' }
    },
    'HEART_WEAPON': {
      prompt: "Cha Hae-In's heart as her greatest weapon. Heart power, anime style.",
      narration: "Her compassionate heart becomes her most powerful weapon.",
      chat: [
        { sender: 'player', text: "Your heart is your greatest weapon - it can defeat any darkness." },
        { sender: 'Cha Hae-In', text: "My heart as a weapon... that's a beautiful way to think about it." },
        { sender: 'Cha Hae-In', text: "Then I'll wield it with pride." }
      ],
      choices: [
        { text: "Wield it together", detail: "Combined heart power", type: 'wield_together' },
        { text: "Unstoppable weapon", detail: "Ultimate power", type: 'unstoppable_weapon' }
      ],
      leadsTo: { wield_together: 'COMBINED_HEARTS', unstoppable_weapon: 'ULTIMATE_HEART_POWER' }
    },
    'ETERNAL_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In promising eternal partnership. Lifetime commitment, anime style.",
      narration: "You both commit to standing together forever.",
      chat: [
        { sender: 'player', text: "Always, Hae-In. Through every battle, every challenge, every moment." },
        { sender: 'Cha Hae-In', text: "Always. No matter what comes, we face it together." },
        { sender: 'Cha Hae-In', text: "Our partnership is eternal." }
      ],
      choices: [
        { text: "Seal it with a promise", detail: "Formal commitment", type: 'seal_promise' },
        { text: "Forever and always", detail: "Eternal vow", type: 'forever_always' }
      ],
      leadsTo: { seal_promise: 'PROMISE_SEALED', forever_always: 'ETERNAL_VOW' }
    },
    'UNSTOPPABLE_FORCE': {
      prompt: "Jin-Woo and Cha Hae-In as an unstoppable force. Ultimate power couple, anime style.",
      narration: "Together, you become a force that cannot be stopped.",
      chat: [
        { sender: 'Cha Hae-In', text: "We're unstoppable together. Nothing can stand in our way." },
        { sender: 'player', text: "The perfect storm - your precision and my shadows." },
        { sender: 'Cha Hae-In', text: "Let's show the world what we can do." }
      ],
      choices: [
        { text: "Conquer everything together", detail: "Unlimited ambition", type: 'conquer_everything' },
        { text: "Protect everything together", detail: "Noble purpose", type: 'protect_everything' }
      ],
      leadsTo: { conquer_everything: 'ULTIMATE_CONQUEST', protect_everything: 'ULTIMATE_PROTECTION' }
    },
    'EQUAL_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In in perfect equal partnership. Complete equality, anime style.",
      narration: "You achieve true equality in every aspect of your relationship.",
      chat: [
        { sender: 'player', text: "As equals in everything - strength, decisions, dreams, everything." },
        { sender: 'Cha Hae-In', text: "True equals. I've always wanted a partnership like this." },
        { sender: 'Cha Hae-In', text: "No one above, no one below. Just us, together." }
      ],
      choices: [
        { text: "Partners for life", detail: "Lifetime equality", type: 'partners_life' },
        { text: "Equal in love too", detail: "Romantic equality", type: 'equal_love' }
      ],
      leadsTo: { partners_life: 'LIFETIME_PARTNERSHIP', equal_love: 'EQUAL_ROMANCE' }
    },
    'COMPLETE_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In achieving complete partnership. Total unity, anime style.",
      narration: "Your partnership encompasses every aspect of life.",
      chat: [
        { sender: 'Cha Hae-In', text: "Partners in every way - fighting, dreaming, living..." },
        { sender: 'player', text: "Complete partnership. Nothing held back, nothing separate." },
        { sender: 'Cha Hae-In', text: "This is what I've always dreamed of." }
      ],
      choices: [
        { text: "Share everything", detail: "Complete openness", type: 'share_everything' },
        { text: "Build our future", detail: "Future planning", type: 'build_future' }
      ],
      leadsTo: { share_everything: 'COMPLETE_SHARING', build_future: 'FUTURE_BUILDING' }
    },
    'WORLD_HEALER': {
      prompt: "Cha Hae-In as a healer for the world through compassion. Global healing, anime style.",
      narration: "Her compassion becomes a healing force for the entire world.",
      chat: [
        { sender: 'player', text: "The world needs your compassion, Hae-In. You can heal hearts and souls." },
        { sender: 'Cha Hae-In', text: "A healer... not just of bodies, but of spirits." },
        { sender: 'Cha Hae-In', text: "If I can bring healing to the world, then that's my purpose." }
      ],
      choices: [
        { text: "I'll help you heal the world", detail: "Support her mission", type: 'help_heal' },
        { text: "You're the light the world needs", detail: "Recognize her role", type: 'worlds_light' }
      ],
      leadsTo: { help_heal: 'HEALING_PARTNERSHIP', worlds_light: 'GUIDING_LIGHT' }
    },
    'PERSONAL_HEALING': {
      prompt: "Cha Hae-In's compassion healing Jin-Woo personally. Personal restoration, anime style.",
      narration: "Her compassion heals wounds in your soul you didn't know existed.",
      chat: [
        { sender: 'player', text: "I need your compassion, Hae-In. It heals parts of me I thought were broken forever." },
        { sender: 'Cha Hae-In', text: "*touches his face gently* Let me heal those wounds." },
        { sender: 'Cha Hae-In', text: "You've been carrying so much pain alone." }
      ],
      choices: [
        { text: "You make me whole", detail: "Personal completion", type: 'make_whole' },
        { text: "Heal me completely", detail: "Total restoration", type: 'heal_completely' }
      ],
      leadsTo: { make_whole: 'PERSONAL_WHOLENESS', heal_completely: 'COMPLETE_HEALING' }
    },
    'RIGHTFUL_PRIDE': {
      prompt: "Cha Hae-In feeling rightful pride in her compassion. Deserved confidence, anime style.",
      narration: "She finally feels proud of the qualities that make her special.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right. I should be proud of my compassion." },
        { sender: 'player', text: "It's one of your greatest strengths. Never hide it." },
        { sender: 'Cha Hae-In', text: "I won't. I'll wear my heart proudly." }
      ],
      choices: [
        { text: "Shine with that pride", detail: "Encourage confidence", type: 'shine_pride' },
        { text: "The world will see your light", detail: "Global recognition", type: 'world_see_light' }
      ],
      leadsTo: { shine_pride: 'PRIDEFUL_SHINE', world_see_light: 'VISIBLE_LIGHT' }
    },
    'COMPASSION_POWER': {
      prompt: "Cha Hae-In's compassion as her superpower. Ultimate ability, anime style.",
      narration: "Her compassion becomes recognized as a true superpower.",
      chat: [
        { sender: 'player', text: "It really is your superpower - the ability to care, to heal, to inspire." },
        { sender: 'Cha Hae-In', text: "A superpower... I never thought of kindness that way." },
        { sender: 'Cha Hae-In', text: "Then I'll use this power to help everyone I can." }
      ],
      choices: [
        { text: "The strongest power there is", detail: "Ultimate strength", type: 'strongest_power' },
        { text: "Use it to change everything", detail: "World transformation", type: 'change_everything' }
      ],
      leadsTo: { strongest_power: 'ULTIMATE_COMPASSION', change_everything: 'COMPASSIONATE_CHANGE' }
    },
    'DEEP_APPRECIATION': {
      prompt: "Jin-Woo expressing deep appreciation for Cha Hae-In. Heartfelt gratitude, anime style.",
      narration: "Your appreciation goes beyond words.",
      chat: [
        { sender: 'player', text: "You've changed my life in ways I never imagined possible." },
        { sender: 'Cha Hae-In', text: "You've done the same for me. I'm a better person because of you." }
      ],
      choices: [
        { text: "We make each other better", detail: "Mutual growth", type: 'mutual_better' },
        { text: "Thank you for being you", detail: "Pure appreciation", type: 'thank_you' }
      ],
      leadsTo: { mutual_better: 'MUTUAL_IMPROVEMENT', thank_you: 'GRATITUDE_MOMENT' }
    },
    'TENDER_CARE': {
      prompt: "Jin-Woo showing tender care for Cha Hae-In. Gentle affection, anime style.",
      narration: "Your gentleness touches her heart.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're so gentle with me. It makes me feel precious." },
        { sender: 'player', text: "Because you are precious. The most precious thing in my world." }
      ],
      choices: [
        { text: "Promise to always be gentle", detail: "Tender vow", type: 'gentle_promise' },
        { text: "Show her how much she means to you", detail: "Demonstration", type: 'show_meaning' }
      ],
      leadsTo: { gentle_promise: 'GENTLE_VOW', show_meaning: 'MEANINGFUL_GESTURE' }
    },
    'PARTNERSHIP_VOW': {
      prompt: "Making a partnership vow. Professional and personal commitment, anime style.",
      narration: "Your vow encompasses both mission and heart.",
      chat: [
        { sender: 'player', text: "I vow to stand by you in battle and in life." },
        { sender: 'Cha Hae-In', text: "And I vow the same. Partners in everything." }
      ],
      choices: [
        { text: "Seal the vow", detail: "Make it official", type: 'seal_vow' },
        { text: "Begin your partnership", detail: "Start immediately", type: 'begin_partnership' }
      ],
      leadsTo: { seal_vow: 'SEALED_VOW', begin_partnership: 'PARTNERSHIP_BEGINS' }
    },
    'OFFICIAL_TEAM': {
      prompt: "Officially becoming a team. Professional partnership, anime style.",
      narration: "Your partnership is now official and recognized.",
      chat: [
        { sender: 'Cha Hae-In', text: "The Shadow Monarch and the Sword Saint, official partners." },
        { sender: 'player', text: "The perfect combination of power and grace." }
      ],
      choices: [
        { text: "Take on our first mission", detail: "Begin working together", type: 'first_mission' },
        { text: "Celebrate our partnership", detail: "Mark the occasion", type: 'celebrate_partnership' }
      ],
      leadsTo: { first_mission: 'FIRST_TEAM_MISSION', celebrate_partnership: 'PARTNERSHIP_CELEBRATION' }
    },
    'FUTURE_PROMISE': {
      prompt: "Jin-Woo and Cha Hae-In making promises for their future together. Hopeful romantic scene, anime style.",
      narration: "You both make a sacred promise to create countless beautiful moments together.",
      chat: [
        { sender: 'player', text: "I promise you a future filled with moments like this, and even better ones." },
        { sender: 'Cha Hae-In', text: "And I promise to treasure every single one. Our story is just beginning." },
        { sender: 'Cha Hae-In', text: "I love you, Jin-Woo. Forever and always." }
      ],
      choices: [
        { text: "I love you too, always", detail: "Mutual eternal love", type: 'love_always' },
        { text: "Our adventure continues", detail: "Look to the future", type: 'continue_adventure' },
        { text: "Kiss her tenderly", detail: "Seal the promise", type: 'tender_kiss' }
      ],
      leadsTo: { love_always: 'ETERNAL_LOVE', continue_adventure: 'SHARED_FUTURE', tender_kiss: 'PROMISE_KISS' }
    },
    'EVERYTHING_DECLARATION': {
      prompt: "Jin-Woo declaring Cha Hae-In is everything to him. Ultimate romantic declaration, anime style.",
      narration: "Your words carry the weight of your entire heart and soul.",
      chat: [
        { sender: 'player', text: "You're not just important to me, Hae-In. You're everything. My world, my heart, my future." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... you're everything to me too. I can't imagine life without you anymore." },
        { sender: 'Cha Hae-In', text: "You've become the most precious part of my existence." }
      ],
      choices: [
        { text: "Then let's never be apart", detail: "Unity promise", type: 'never_apart' },
        { text: "You complete me", detail: "Soul completion", type: 'complete_me' },
        { text: "Be mine forever", detail: "Eternal commitment", type: 'be_mine_forever' }
      ],
      leadsTo: { never_apart: 'INSEPARABLE_BOND', complete_me: 'SOUL_COMPLETION', be_mine_forever: 'ETERNAL_COMMITMENT' }
    },
    'OFFICIAL_RELATIONSHIP': {
      prompt: "Jin-Woo and Cha Hae-In making their relationship official. Milestone moment, anime style.",
      narration: "This moment marks the beginning of your official journey together.",
      chat: [
        { sender: 'player', text: "I want the whole world to know that you're mine and I'm yours." },
        { sender: 'Cha Hae-In', text: "Yes! I want that too. Let's make this official, Jin-Woo." },
        { sender: 'Cha Hae-In', text: "From this moment on, we're officially together. Partners in everything." }
      ],
      choices: [
        { text: "Announce to the guild", detail: "Public declaration", type: 'announce_guild' },
        { text: "Celebrate privately first", detail: "Intimate celebration", type: 'celebrate_private' },
        { text: "Seal it with a promise ring", detail: "Symbol of commitment", type: 'promise_ring' }
      ],
      leadsTo: { announce_guild: 'PUBLIC_ANNOUNCEMENT', celebrate_private: 'PRIVATE_CELEBRATION', promise_ring: 'RING_CEREMONY' }
    },
    'ETERNAL_LOVE': {
      prompt: "Jin-Woo and Cha Hae-In in eternal love embrace. Perfect romantic ending, anime style.",
      narration: "Your love transcends time and space, creating an unbreakable bond.",
      chat: [
        { sender: 'Cha Hae-In', text: "This love we share... it feels eternal, doesn't it?" },
        { sender: 'player', text: "It is eternal. Nothing in this world or any other could break what we have." },
        { sender: 'Cha Hae-In', text: "Then we'll love each other across lifetimes, in every reality." }
      ],
      choices: [
        { text: "In every lifetime", detail: "Transcendent love", type: 'every_lifetime' },
        { text: "Beyond eternity", detail: "Infinite love", type: 'beyond_eternity' },
        { text: "Start our forever now", detail: "Begin eternal journey", type: 'start_forever' }
      ],
      leadsTo: { every_lifetime: 'TRANSCENDENT_ENDING', beyond_eternity: 'INFINITE_ENDING', start_forever: 'ETERNAL_BEGINNING' }
    },
    'SHARED_FUTURE': {
      prompt: "Jin-Woo and Cha Hae-In planning their shared future. Hopeful and romantic, anime style.",
      narration: "Together, you envision a future filled with adventure, love, and endless possibilities.",
      chat: [
        { sender: 'Cha Hae-In', text: "What kind of future do you see for us?" },
        { sender: 'player', text: "I see us conquering dungeons together, protecting each other, building something beautiful." },
        { sender: 'Cha Hae-In', text: "That sounds perfect. Adventure by day, love by night." }
      ],
      choices: [
        { text: "Plan our next adventure", detail: "Continue the journey", type: 'next_adventure' },
        { text: "Focus on our love", detail: "Relationship priority", type: 'focus_love' },
        { text: "Build our legacy together", detail: "Create something lasting", type: 'build_legacy' }
      ],
      leadsTo: { next_adventure: 'ADVENTURE_PLANNING', focus_love: 'LOVE_FOCUS', build_legacy: 'LEGACY_BUILDING' }
    },
    'PROMISE_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing a tender promise-sealing kiss. Perfect romantic moment, anime style.",
      narration: "Your kiss seals the promise, binding your hearts forever.",
      chat: [
        { sender: 'system', text: "Your tender kiss seals the promise between you, creating an unbreakable bond." },
        { sender: 'Cha Hae-In', text: "That was... perfect. I can feel our connection deepening." },
        { sender: 'player', text: "Every kiss with you feels like the first and the last I'll ever need." }
      ],
      choices: [
        { text: "Hold her close", detail: "Intimate embrace", type: 'hold_close' },
        { text: "Whisper sweet words", detail: "Romantic expression", type: 'sweet_words' },
        { text: "Look into her eyes", detail: "Soul connection", type: 'look_eyes' }
      ],
      leadsTo: { hold_close: 'INTIMATE_EMBRACE', sweet_words: 'ROMANTIC_WHISPERS', look_eyes: 'SOUL_GAZE' }
    },
    'TRANSCENDENT_ENDING': {
      prompt: "Jin-Woo and Cha Hae-In transcending mortal bonds, eternal spiritual connection, cosmic romance, anime style.",
      narration: "Your love transcends the boundaries of time and space. In every dimension, across every reality, your souls will find each other again and again. This is not just love - it's cosmic destiny.",
      chat: [
        { sender: 'Cha Hae-In', text: "I can feel it... our connection goes beyond this life, beyond this world." },
        { sender: 'player', text: "In every lifetime, I'll search for you. In every reality, I'll love you." },
        { sender: 'Cha Hae-In', text: "And I'll be waiting, always. Our love is written in the stars themselves." }
      ],
      choices: [
        { text: "Begin a new adventure", detail: "Start fresh", type: 'new_game' },
        { text: "Return to Daily Life Hub", detail: "Continue living", type: 'daily_hub' }
      ],
      leadsTo: { new_game: 'START', daily_hub: 'DAILY_LIFE_HUB' }
    },
    'INFINITE_ENDING': {
      prompt: "Jin-Woo and Cha Hae-In in infinite cosmic embrace, love beyond eternity, transcendent anime style.",
      narration: "Your love becomes infinite, stretching beyond the concept of eternity itself. You are no longer bound by time, space, or mortality. Together, you become a force of pure love that will guide other souls throughout existence.",
      chat: [
        { sender: 'Cha Hae-In', text: "This feeling... it's bigger than infinity. It's everything that ever was or will be." },
        { sender: 'player', text: "We've become something beyond words. Pure love, pure connection." },
        { sender: 'Cha Hae-In', text: "Let's help others find what we've found. Let's be guardians of love itself." }
      ],
      choices: [
        { text: "Begin a new adventure", detail: "Start fresh", type: 'new_game' },
        { text: "Return to Daily Life Hub", detail: "Continue living", type: 'daily_hub' }
      ],
      leadsTo: { new_game: 'START', daily_hub: 'DAILY_LIFE_HUB' }
    },
    'ETERNAL_BEGINNING': {
      prompt: "Jin-Woo and Cha Hae-In starting their eternal journey together, new beginning, anime style.",
      narration: "This isn't an ending - it's the beginning of forever. Hand in hand, you step into eternity together, ready for whatever adventures await. Your love story has no final chapter because true love never ends.",
      chat: [
        { sender: 'Cha Hae-In', text: "Ready for forever?" },
        { sender: 'player', text: "With you? I'm ready for anything." },
        { sender: 'Cha Hae-In', text: "Then let's write our eternal story together." }
      ],
      choices: [
        { text: "Begin a new adventure", detail: "Start fresh", type: 'new_game' },
        { text: "Return to Daily Life Hub", detail: "Continue living", type: 'daily_hub' }
      ],
      leadsTo: { new_game: 'START', daily_hub: 'DAILY_LIFE_HUB' }
    },
    'MISSION_DISCUSSION': {
      prompt: "Jin-Woo and Cha Hae-In discussing their latest missions together, professional meeting, anime style.",
      narration: "You and Hae-In discuss your recent missions and experiences as S-rank hunters.",
      chat: [
        { sender: 'Cha Hae-In', text: "How did your latest dungeon raid go?" },
        { sender: 'player', text: "It went well. My shadows are getting stronger." },
        { sender: 'Cha Hae-In', text: "I can sense their power. It's... impressive and a little intimidating." }
      ],
      choices: [
        { text: "Share mission details", detail: "Tell her about the raid", type: 'share_details' },
        { text: "Ask about her missions", detail: "Learn about her work", type: 'ask_missions' },
        { text: "Suggest teaming up", detail: "Work together", type: 'team_up' }
      ],
      leadsTo: { share_details: 'MISSION_SHARING', ask_missions: 'HER_MISSIONS', team_up: 'TEAM_PROPOSAL' }
    },
    'PARTNERSHIP_INTEREST': {
      prompt: "Cha Hae-In showing interest in partnering with Jin-Woo, professional curiosity, anime style.",
      narration: "Hae-In expresses genuine interest in working together more often.",
      chat: [
        { sender: 'Cha Hae-In', text: "I've been thinking... we work well together." },
        { sender: 'player', text: "I've noticed that too. Our abilities complement each other." },
        { sender: 'Cha Hae-In', text: "Would you be interested in forming a more permanent partnership?" }
      ],
      choices: [
        { text: "Accept partnership", detail: "Form official team", type: 'accept_partnership' },
        { text: "Suggest casual cooperation", detail: "Stay flexible", type: 'casual_cooperation' },
        { text: "Express romantic interest", detail: "Beyond professional", type: 'romantic_hint' }
      ],
      leadsTo: { accept_partnership: 'OFFICIAL_PARTNERSHIP', casual_cooperation: 'CASUAL_TEAM', romantic_hint: 'ROMANTIC_HINT' }
    },
    'PHILOSOPHY_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In having a deep philosophical discussion about power and responsibility, thoughtful moment, anime style.",
      narration: "A quiet moment leads to a deeper conversation about what it means to have power.",
      chat: [
        { sender: 'Cha Hae-In', text: "Do you ever wonder if we're doing enough with our power?" },
        { sender: 'player', text: "I think about it constantly. With great power..." },
        { sender: 'Cha Hae-In', text: "Comes great responsibility. But sometimes I wonder if that's enough." }
      ],
      choices: [
        { text: "Share your philosophy", detail: "Express your beliefs", type: 'share_philosophy' },
        { text: "Ask her thoughts", detail: "Learn her perspective", type: 'ask_thoughts' },
        { text: "Suggest making a difference", detail: "Take action together", type: 'make_difference' }
      ],
      leadsTo: { share_philosophy: 'PHILOSOPHY_SHARING', ask_thoughts: 'HER_PHILOSOPHY', make_difference: 'SHARED_PURPOSE' }
    },
    'MISSION_SHARING': {
      prompt: "Jin-Woo sharing details about his shadow army missions with Cha Hae-In, tactical discussion, anime style.",
      narration: "You share the details of your recent missions, and Hae-In listens with professional interest.",
      chat: [
        { sender: 'player', text: "The latest A-rank dungeon was more challenging than expected. My shadows adapted well though." },
        { sender: 'Cha Hae-In', text: "Your shadow soldiers are incredible. The way they coordinate..." },
        { sender: 'Cha Hae-In', text: "It's like watching a perfectly orchestrated battle symphony." }
      ],
      choices: [
        { text: "Offer to show her", detail: "Demonstrate abilities", type: 'demonstrate' },
        { text: "Ask about her techniques", detail: "Learn her methods", type: 'ask_techniques' },
        { text: "Suggest joint training", detail: "Train together", type: 'joint_training' }
      ],
      leadsTo: { demonstrate: 'SHADOW_DEMONSTRATION', ask_techniques: 'SWORD_TECHNIQUES', joint_training: 'TRAINING_TOGETHER' }
    },
    'HER_MISSIONS': {
      prompt: "Cha Hae-In sharing her recent hunter missions with Jin-Woo, professional exchange, anime style.",
      narration: "Hae-In opens up about her recent experiences as an S-rank hunter.",
      chat: [
        { sender: 'Cha Hae-In', text: "I've been dealing with some unusual magic beasts lately. Their scent..." },
        { sender: 'player', text: "Your sensitivity to magic energy is incredible. What did you sense?" },
        { sender: 'Cha Hae-In', text: "Something different. Darker. Like they're being influenced by something else." }
      ],
      choices: [
        { text: "Offer assistance", detail: "Help investigate", type: 'offer_help' },
        { text: "Share similar experiences", detail: "Compare notes", type: 'share_experiences' },
        { text: "Express concern", detail: "Worry about her safety", type: 'express_concern' }
      ],
      leadsTo: { offer_help: 'INVESTIGATION_TEAM', share_experiences: 'SHARED_MYSTERIES', express_concern: 'PROTECTIVE_ROUTE' }
    },
    'OFFICIAL_PARTNERSHIP': {
      prompt: "Jin-Woo and Cha Hae-In forming an official hunter partnership, professional handshake, anime style.",
      narration: "You formally agree to work together as an official hunter partnership.",
      chat: [
        { sender: 'player', text: "I'd be honored to work with you officially." },
        { sender: 'Cha Hae-In', text: "Perfect. We'll need to register with the Association." },
        { sender: 'Cha Hae-In', text: "I think we're going to accomplish great things together." }
      ],
      choices: [
        { text: "Plan first mission", detail: "Discuss objectives", type: 'plan_mission' },
        { text: "Celebrate partnership", detail: "Mark the occasion", type: 'celebrate' },
        { text: "Express excitement", detail: "Share enthusiasm", type: 'excited' }
      ],
      leadsTo: { plan_mission: 'MISSION_PLANNING', celebrate: 'PARTNERSHIP_CELEBRATION', excited: 'ENTHUSIASTIC_RESPONSE' }
    },
    'CASUAL_TEAM': {
      prompt: "Jin-Woo and Cha Hae-In agreeing to casual cooperation, relaxed partnership, anime style.",
      narration: "You agree to work together when it makes sense, keeping things flexible.",
      chat: [
        { sender: 'player', text: "I like the idea of staying flexible. No formal obligations." },
        { sender: 'Cha Hae-In', text: "Exactly. We can help each other when our goals align." },
        { sender: 'Cha Hae-In', text: "This feels more natural, doesn't it?" }
      ],
      choices: [
        { text: "Agree completely", detail: "Support the approach", type: 'agree' },
        { text: "Suggest trial period", detail: "Test the waters", type: 'trial_period' },
        { text: "Ask about boundaries", detail: "Clarify expectations", type: 'boundaries' }
      ],
      leadsTo: { agree: 'MUTUAL_UNDERSTANDING', trial_period: 'TRIAL_PARTNERSHIP', boundaries: 'CLEAR_BOUNDARIES' }
    },
    'SHADOW_DEMONSTRATION': {
      prompt: "Jin-Woo demonstrating his shadow army abilities to Cha Hae-In, impressive display, anime style.",
      narration: "You summon several shadow soldiers to demonstrate their capabilities to Hae-In.",
      chat: [
        { sender: 'player', text: "Arise." },
        { sender: 'Cha Hae-In', text: "Incredible... they move with such precision and coordination." },
        { sender: 'Cha Hae-In', text: "It's like watching a perfectly trained elite unit." }
      ],
      choices: [
        { text: "Show advanced techniques", detail: "Demonstrate more abilities", type: 'advanced_demo' },
        { text: "Ask for her opinion", detail: "Get her thoughts", type: 'ask_opinion' },
        { text: "Suggest sparring", detail: "Practice together", type: 'sparring' }
      ],
      leadsTo: { advanced_demo: 'ADVANCED_ABILITIES', ask_opinion: 'HER_ASSESSMENT', sparring: 'TRAINING_TOGETHER' }
    },
    'SWORD_TECHNIQUES': {
      prompt: "Cha Hae-In demonstrating her sword techniques to Jin-Woo, elegant swordsmanship, anime style.",
      narration: "Hae-In gracefully demonstrates her sword techniques, each movement flowing like a deadly dance.",
      chat: [
        { sender: 'Cha Hae-In', text: "My style focuses on precision and efficiency. Every cut has purpose." },
        { sender: 'player', text: "Your form is flawless. The way you channel your mana through the blade..." },
        { sender: 'Cha Hae-In', text: "Would you like to try some techniques together?" }
      ],
      choices: [
        { text: "Accept training offer", detail: "Learn together", type: 'accept_training' },
        { text: "Share your techniques", detail: "Exchange knowledge", type: 'share_techniques' },
        { text: "Compliment her skill", detail: "Express admiration", type: 'compliment' }
      ],
      leadsTo: { accept_training: 'TRAINING_TOGETHER', share_techniques: 'TECHNIQUE_EXCHANGE', compliment: 'SKILL_APPRECIATION' }
    },
    'TRAINING_TOGETHER': {
      prompt: "Jin-Woo and Cha Hae-In training together, sparring session, anime style.",
      narration: "You and Hae-In engage in a friendly sparring session, learning from each other's techniques.",
      chat: [
        { sender: 'Cha Hae-In', text: "Your reflexes are incredible. You adapt so quickly." },
        { sender: 'player', text: "You're pushing me to be better. This is exactly what I needed." },
        { sender: 'Cha Hae-In', text: "We make a good team, don't we?" }
      ],
      choices: [
        { text: "Agree about teamwork", detail: "Acknowledge synergy", type: 'teamwork' },
        { text: "Suggest regular training", detail: "Make it routine", type: 'regular_training' },
        { text: "Express gratitude", detail: "Thank her", type: 'grateful' }
      ],
      leadsTo: { teamwork: 'TEAM_SYNERGY', regular_training: 'TRAINING_PARTNERSHIP', grateful: 'GRATEFUL_MOMENT' }
    },
    'INVESTIGATION_TEAM': {
      prompt: "Jin-Woo and Cha Hae-In forming an investigation team, detective work, anime style.",
      narration: "You agree to work together to investigate the mysterious dark influences affecting magic beasts.",
      chat: [
        { sender: 'player', text: "Let's get to the bottom of this. My shadows can scout ahead." },
        { sender: 'Cha Hae-In', text: "Perfect. My sensitivity to magic energy will help track the source." },
        { sender: 'Cha Hae-In', text: "Whatever's causing this, we'll find it together." }
      ],
      choices: [
        { text: "Plan investigation strategy", detail: "Organize approach", type: 'plan_strategy' },
        { text: "Start immediately", detail: "Begin right away", type: 'start_now' },
        { text: "Gather more information", detail: "Research first", type: 'research' }
      ],
      leadsTo: { plan_strategy: 'STRATEGIC_PLANNING', start_now: 'IMMEDIATE_ACTION', research: 'INFORMATION_GATHERING' }
    },
    'SHARED_MYSTERIES': {
      prompt: "Jin-Woo and Cha Hae-In sharing mysterious experiences, comparing notes, anime style.",
      narration: "You compare your recent strange encounters, finding disturbing similarities.",
      chat: [
        { sender: 'player', text: "I've noticed something similar. The monsters seem... different lately." },
        { sender: 'Cha Hae-In', text: "Yes! Their scent is wrong, like they're being controlled." },
        { sender: 'Cha Hae-In', text: "This could be connected to something bigger." }
      ],
      choices: [
        { text: "Share shadow observations", detail: "Reveal what you've seen", type: 'shadow_intel' },
        { text: "Discuss possible causes", detail: "Theorize together", type: 'theorize' },
        { text: "Suggest joint investigation", detail: "Work together", type: 'investigate_together' }
      ],
      leadsTo: { shadow_intel: 'SHADOW_INTELLIGENCE', theorize: 'THEORY_SESSION', investigate_together: 'INVESTIGATION_TEAM' }
    }
  };

  // Use cached Jin-Woo cover for instant loading
  useEffect(() => {
    const loadJinWooCover = async () => {
      console.log('Loading cached Jin-Woo cover for instant display...');
      try {
        // Import the cached cover image for immediate loading
        const cachedCoverModule = await import('@assets/image_1749415701105.png');
        const cachedCoverUrl = cachedCoverModule.default;
        setCurrentBackground(cachedCoverUrl);
        console.log('Cached Jin-Woo cover loaded instantly');
      } catch (error) {
        console.log('Asset import failed, using gradient background fallback');
        setCurrentBackground('linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)');
      }
    };
    
    loadJinWooCover();
    
    const updateTime = () => {
      if (timeRef.current) {
        const now = new Date();
        timeRef.current.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [chatMessages]);

  // Reset choice index when story changes to prevent out-of-bounds errors
  useEffect(() => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.choices && currentStory.choices.length > 0) {
      setCurrentChoiceIndex(0); // Always reset to first choice when scene changes
    }
  }, [gameState.currentScene]);

  // Ensure choice index is always valid
  useEffect(() => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.choices && currentStory.choices.length > 0) {
      if (currentChoiceIndex >= currentStory.choices.length) {
        setCurrentChoiceIndex(0);
      }
    }
  }, [currentChoiceIndex, gameState.currentScene]);

  // Play story narration when scene changes
  useEffect(() => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.narration) {
      setTimeout(() => {
        // Use the main voice system with narrator priority
        playVoice(currentStory.narration, 'narrator');
      }, 1000); // Delay to allow scene transition
    }
  }, [gameState.currentScene, playVoice]);

  // iMessage-style message lifecycle management
  const startMessageAnimation = (messageId: number) => {
    // Clear any existing timer for this message
    if (messageTimers[messageId]) {
      clearTimeout(messageTimers[messageId]);
    }

    // Start with entering animation
    setMessageStates(prev => ({ ...prev, [messageId]: 'entering' }));

    // After entering, transition to staying (longer readable time)
    const stayingTimer = setTimeout(() => {
      setMessageStates(prev => ({ ...prev, [messageId]: 'staying' }));
      
      // After staying visible for reading, start exit animation
      const exitTimer = setTimeout(() => {
        setMessageStates(prev => ({ ...prev, [messageId]: 'exiting' }));
        
        // Finally hide the message completely
        const hideTimer = setTimeout(() => {
          setMessageStates(prev => ({ ...prev, [messageId]: 'hidden' }));
        }, 500); // Exit animation duration
        
        setMessageTimers(prev => ({ ...prev, [messageId]: hideTimer }));
      }, 8000); // Stay visible for 8 seconds for comfortable reading
      
      setMessageTimers(prev => ({ ...prev, [messageId]: exitTimer }));
    }, 300); // Entering animation duration

    setMessageTimers(prev => ({ ...prev, [messageId]: stayingTimer }));
  };

  // Start animation for new messages
  useEffect(() => {
    chatMessages.forEach((message, index) => {
      if (!messageStates[index]) {
        startMessageAnimation(index);
      }
    });
  }, [chatMessages]);

  // Update fade effects every 5 seconds for immersion
  useEffect(() => {
    const interval = setInterval(() => {
      setChatMessages(prev => [...prev]); // Force re-render to update fade effects
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle scrollbar fade effects and message visibility
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // Show chat when user scrolls
      setAutoMessageVisible(true);
      setChatPinned(true);
      
      chatContainer.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        chatContainer.classList.remove('scrolling');
        setIsScrolling(false);
      }, 1500); // Hide after 1.5 seconds of no scrolling

      // Check message visibility during scroll
      const messageElements = chatContainer.querySelectorAll('[data-message-id]');
      const containerRect = chatContainer.getBoundingClientRect();
      const newVisibility: Record<number, boolean> = {};

      messageElements.forEach((element) => {
        const messageId = parseInt(element.getAttribute('data-message-id') || '0');
        const messageRect = element.getBoundingClientRect();
        
        // Check if message is in viewport
        const isInViewport = messageRect.bottom >= containerRect.top && 
                            messageRect.top <= containerRect.bottom;
        
        if (isInViewport) {
          newVisibility[messageId] = true;
        }
      });

      setScrollBasedVisibility(prev => ({ ...prev, ...newVisibility }));
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [chatMessages]);

  // Enhanced scroll to bottom with iMessage-like behavior
  const scrollToBottom = (force = false) => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      
      // For force scrolling (new messages), use instant scroll then smooth
      if (force) {
        element.scrollTop = element.scrollHeight;
        requestAnimationFrame(() => {
          element.scrollTo({
            top: element.scrollHeight,
            behavior: 'smooth'
          });
        });
      } else {
        // Regular smooth scroll
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      }
      
      // Ensure chat is visible when scrolling to new messages
      setAutoMessageVisible(true);
      setChatPinned(true);
    }
  };

  const generateSceneImage = async (prompt: string) => {
    try {
      setIsLoading(true);
      
      // Call backend image generation API
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt,
          gameState: {
            narration: prompt,
            storyPath: gameState.currentScene
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          // Set the generated image as background
          console.log('AI image generated successfully:', {
            type: data.imageUrl.startsWith('data:') ? 'base64' : 'url',
            length: data.imageUrl.length
          });
          console.log('Setting background to:', data.imageUrl.substring(0, 50) + '...');
          setCurrentBackground(data.imageUrl);
          setSceneBackground(data.imageUrl);
          
          console.log('Background updated for scene display');
          console.log('Current states - sceneBackground length:', data.imageUrl.length, 'currentBackground length:', data.imageUrl.length);
        } else {
          // Fallback to gradient if no image generated
          const fallbackGradients = [
            'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)',
            'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #0f0f0f 100%)',
            'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #0f0f0f 100%)'
          ];
          const randomGradient = fallbackGradients[Math.floor(Math.random() * fallbackGradients.length)];
          setCurrentBackground(randomGradient);
        }
      } else {
        console.error('Image generation failed:', response.status);
        // Use fallback gradient
        setCurrentBackground('linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)');
      }
    } catch (error) {
      console.error('Error generating scene image:', error);
      // Use fallback gradient
      setCurrentBackground('linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)');
    } finally {
      setIsLoading(false);
    }
  };

  const addChatMessage = (sender: string, text: string) => {
    const messageId = Date.now() + Math.random();
    const newMessage = {
      sender,
      text,
      id: messageId,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Play voice for character dialogue automatically if auto-play is enabled
    if (sender === 'Cha Hae-In' && autoPlayVoice && !audioMuted) {
      setTimeout(() => playVoice(text, 'cha-hae-in'), 300);
      
      // Check for visual descriptions and generate images automatically
      const visualDescriptions = [
        // Facial expressions and emotions
        /\*.*(?:blush|blushing|cheeks|face.*red|face.*pink|face.*flushed).*\*/gi,
        /\*.*(?:smirk|grin|smile|smiling|lips.*curve|lips.*tug).*\*/gi,
        /\*.*(?:eyes.*light|eyes.*sparkle|eyes.*narrow|gaze|stares|looks).*\*/gi,
        /\*.*(?:eyebrow|brow.*raise|brow.*arch|questioning look).*\*/gi,
        
        // Body language and movement
        /\*.*(?:tilts.*head|head.*tilt|leans|steps|moves|shifts|adjusts).*\*/gi,
        /\*.*(?:crosses.*arms|hands.*hips|reaches|extends|touches).*\*/gi,
        /\*.*(?:sits|stands|approaches|closer|away|forward|back).*\*/gi,
        
        // Physical appearance descriptions
        /\*.*(?:blonde hair|hair.*flow|hair.*catch|hair.*gleam|golden hair).*\*/gi,
        /\*.*(?:red armor|armor.*gleam|armor.*shine|armor.*catch).*\*/gi,
        /\*.*(?:sword|weapon|blade|equipment).*\*/gi,
        
        // Intimate or romantic descriptions
        /\*.*(?:pulls.*close|embrace|hug|kiss|caress|hold.*hand|take.*hand).*\*/gi,
        /\*.*(?:melts|breathless|heart.*race|overwhelmed|vulnerable).*\*/gi,
        
        // Environmental and lighting
        /\*.*(?:light.*catch|gleam|glow|shine|sparkle|illuminate).*\*/gi,
        
        // Emotional states with visual impact
        /\*.*(?:tears|crying|emotional|moved|touched|shocked|surprised).*\*/gi,
        /\*.*(?:confident|playful|shy|nervous|excited|happy|sad).*\*/gi
      ];
      
      const hasVisualDescription = visualDescriptions.some(pattern => pattern.test(text));
      
      if (hasVisualDescription) {
        console.log('Visual description detected in Cha Hae-In response, generating image');
        
        // Generate image based on the visual description
        setTimeout(() => {
          fetch('/api/generate-chat-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatResponse: text,
              userMessage: 'conversation',
              characterFocus: 'cha_hae_in'
            }),
          })
          .then(res => res.json())
          .then(imageData => {
            if (imageData.imageUrl) {
              console.log('Chat visual update generated, updating background');
              setCurrentBackground(imageData.imageUrl);
              setSceneBackground(imageData.imageUrl);
            }
          })
          .catch(err => console.log('Image generation failed:', err.message));
        }, 800); // Slight delay to let message appear first
      }
    } else if (sender === 'system' || sender === 'Game Master') {
      setTimeout(() => playVoice(text, 'game-master'), 300);
    }
    
    // Show overlay automatically when new messages appear - iMessage behavior
    setAutoMessageVisible(true);
    setChatPinned(true); // Keep chat visible for new messages
    
    // Force scroll to bottom for new messages - iMessage behavior
    setTimeout(() => scrollToBottom(true), 50);   // Immediate force scroll
    setTimeout(() => scrollToBottom(true), 150);  // Second attempt after render
    setTimeout(() => scrollToBottom(true), 300);  // Final attempt after animations
    
    // Hide individual message after 15 seconds (increased for better UX)
    setTimeout(() => {
      setAutoHiddenMessages((prev: Set<number>) => {
        const newSet = new Set(prev);
        newSet.add(messageId);
        return newSet;
      });
    }, 15000);
    
    // Auto-hide overlay after 20 seconds if not manually pinned
    setTimeout(() => {
      if (!chatPinned) {
        setAutoMessageVisible(false);
      }
    }, 20000);
  };

  // State for tracking scroll-based message visibility
  const [scrollBasedVisibility, setScrollBasedVisibility] = useState<Record<number, boolean>>({});
  const [isScrolling, setIsScrolling] = useState(false);

  // Calculate message opacity for fade effect with scroll visibility
  const getMessageOpacity = (timestamp: number | undefined, messageId: number) => {
    if (!timestamp) return 1; // Show full opacity for messages without timestamp
    
    // Check if message is currently visible due to scrolling
    if (scrollBasedVisibility[messageId]) return 1;
    
    const age = Date.now() - timestamp;
    const fadeStart = 15000; // Start fading after 15 seconds
    const fadeComplete = 30000; // Completely faded after 30 seconds
    
    if (age < fadeStart) return 1;
    if (age > fadeComplete) return 0.1;
    
    const fadeProgress = (age - fadeStart) / (fadeComplete - fadeStart);
    return Math.max(0.1, 1 - (fadeProgress * 0.9));
  };

  // Get all messages for display (not just recent)
  const getDisplayMessages = () => {
    return chatMessages;
  };

  // Navigation functions for choice carousel
  const nextChoice = () => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.choices && currentStory.choices.length > 0) {
      setCurrentChoiceIndex((prev) => 
        prev < currentStory.choices.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevChoice = () => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.choices && currentStory.choices.length > 0) {
      setCurrentChoiceIndex((prev) => 
        prev > 0 ? prev - 1 : currentStory.choices.length - 1
      );
    }
  };

  // Save game state to localStorage
  const saveGameState = (state: GameState) => {
    try {
      localStorage.setItem('solo-leveling-game-state', JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  };





  const createShadowSlashEffect = () => {
    const effectsContainer = document.querySelector('#effects-container');
    if (!effectsContainer) return;

    const slash = document.createElement('div');
    slash.className = 'shadow-slash';
    slash.style.left = Math.random() * 80 + 10 + '%';
    slash.style.top = Math.random() * 60 + 20 + '%';
    effectsContainer.appendChild(slash);

    setTimeout(() => {
      if (slash.parentNode) {
        slash.parentNode.removeChild(slash);
      }
    }, 300);
  };

  const showAffectionIncreaseIndicator = (newLevel: number, previousLevel: number) => {
    const increase = newLevel - previousLevel;
    if (increase > 0) {
      setAffectionIncreaseAmount(increase);
      setShowAffectionIncrease(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setShowAffectionIncrease(false);
      }, 3000);
    }
  };

  const showAffectionDecreaseIndicator = (newLevel: number, previousLevel: number) => {
    const decrease = previousLevel - newLevel;
    if (decrease > 0) {
      setAffectionDecreaseAmount(decrease);
      setShowAffectionDecrease(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setShowAffectionDecrease(false);
      }, 3000);
    }
  };

  const getUserBehaviorType = (message: string): 'positive' | 'neutral' | 'rude' | 'mean' => {
    const messageLower = message.toLowerCase();
    
    // Check for mean/very negative behavior
    const meanKeywords = [
      'hate you', 'stupid', 'idiot', 'worthless', 'pathetic', 'loser', 
      'ugly', 'useless', 'waste of time', 'boring as hell', 'annoying bitch'
    ];
    
    // Check for rude behavior
    const rudeKeywords = [
      'shut up', 'whatever', 'don\'t care', 'leave me alone', 'go away',
      'boring', 'annoying', 'dumb', 'weak', 'lame'
    ];
    
    // Check for positive behavior
    const positiveKeywords = [
      'love', 'beautiful', 'amazing', 'wonderful', 'thank you', 'appreciate',
      'care about', 'special', 'incredible', 'gorgeous', 'perfect', 'sweet'
    ];
    
    if (meanKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'mean';
    }
    
    if (rudeKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'rude';
    }
    
    if (positiveKeywords.some(keyword => messageLower.includes(keyword))) {
      return 'positive';
    }
    
    return 'neutral';
  };

  const createHeartEffect = () => {
    const hearts = document.querySelectorAll('.heart');
    const targetHeart = hearts[gameState.affection - 1] as HTMLElement; // -1 because we just incremented affection
    if (targetHeart) {
      // Animate the heart filling
      targetHeart.style.animation = 'heartFill 0.8s ease';
      targetHeart.style.transform = 'scale(1.3)';
      
      setTimeout(() => {
        targetHeart.style.animation = '';
        targetHeart.style.transform = 'scale(1.1)';
      }, 800);
    }
  };

  const addScreenShake = () => {
    const screen = document.querySelector('.screen') as HTMLElement;
    if (screen) {
      screen.classList.add('shake');
      setTimeout(() => {
        screen.classList.remove('shake');
      }, 400);
    }
  };

  // Speech-to-text functionality
  const startRecording = async () => {
    if (isRecording) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await processAudioToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const processAudioToText = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          setUserInput(data.text);
          // Auto-submit the transcribed text
          setTimeout(() => {
            if (data.text.trim()) {
              handleUserInput();
            }
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error processing speech to text:', error);
    }
  };

  const isCombatChoice = (choice: any, scene: string, narration: string) => {
    const combatKeywords = [
      'shadow_attack', 'sword_strike', 'magic_blast', 'combined_attack', 'finisher',
      'boss_fight', 'dragon_fight', 'monster_battle', 'final_attack', 'ultimate_strike',
      'engage_enemy', 'charge_monster', 'slash_beast', 'pierce_dragon', 'crush_boss', 
      'destroy_monster', 'eliminate_threat', 'extract_shadow'
    ];
    
    const combatScenes = [
      'BOSS_BATTLE', 'DRAGON_FIGHT', 'MONSTER_ENCOUNTER', 'COMBAT_SCENE',
      'BATTLE_START', 'ENEMY_ENCOUNTER', 'FINAL_BOSS', 'DUNGEON_BOSS'
    ];
    
    const combatNarration = [
      'monsters block your path', 'hostile detected', 'battle is fierce',
      'dragon roar', 'creature lurking', 'beast attacks', 'demon emerges',
      'enemy encounters', 'combat encounter'
    ];
    
    // Check for exact combat keywords in choice type (more specific)
    const hasExactCombatKeyword = combatKeywords.some(keyword => 
      choice.type === keyword || choice.type.includes('_attack') || choice.type.includes('_strike')
    );
    
    // Check if scene is explicitly combat
    const isCombatScene = combatScenes.includes(scene);
    
    // Check for combat phrases in narration (more specific)
    const hasCombatNarration = combatNarration.some(phrase => 
      narration.toLowerCase().includes(phrase)
    );
    
    return hasExactCombatKeyword || isCombatScene || hasCombatNarration;
  };

  const triggerCombatMiniGame = (choice: any) => {
    setPendingChoice(choice);
    
    // Determine mini-game type based on choice and scene context
    const choiceType = choice.type.toLowerCase();
    const choiceText = choice.text.toLowerCase();
    const currentScene = gameState.currentScene;
    
    // Dragon encounters for boss-level enemies
    if (choiceType.includes('boss') || choiceType.includes('dragon') || choiceType.includes('final') ||
        currentScene.includes('BOSS') || choiceText.includes('boss') || choiceText.includes('dragon')) {
      setActiveMiniGame('dragon');
    }
    // Rune sequence for magic/shadow attacks and spells
    else if (choiceType.includes('magic') || choiceType.includes('rune') || choiceType.includes('spell') ||
             choiceType.includes('shadow') || choiceType.includes('cast') || choiceType.includes('blast') ||
             choiceText.includes('magic') || choiceText.includes('shadow') || choiceText.includes('cast')) {
      setActiveMiniGame('runes');
    }
    // Lockpicking only for actual lockpicking scenarios (doors, chests, etc.)
    else if (choiceType.includes('lock') || choiceType.includes('pick') || choiceType.includes('unlock') ||
             choiceText.includes('lock') || choiceText.includes('unlock') || choiceText.includes('door')) {
      setActiveMiniGame('lockpicking');
    }
    // Default to rune sequence for general combat attacks
    else {
      setActiveMiniGame('runes');
    }
  };

  const handleMiniGameComplete = (success: boolean) => {
    setActiveMiniGame(null);
    
    if (pendingChoice) {
      // Process the original choice with success/failure modifier
      const modifiedChoice = {
        ...pendingChoice,
        success: success
      };
      
      // Add combat result message
      if (success) {
        addChatMessage('system', '🎯 Combat successful! Your skills prevailed.');
        createShadowSlashEffect();
        addScreenShake();
      } else {
        addChatMessage('system', '💥 Combat challenging but you managed to survive.');
      }
      
      // Process the choice normally
      processChoice(modifiedChoice);
      setPendingChoice(null);
    }
  };

  const processChoice = (choice: any) => {
    const currentStory = story[gameState.currentScene];
    
    // Universal gate navigation - if choice contains "gate" or "mission", go to gate
    const isGateChoice = choice.type.includes('gate') || choice.type.includes('mission') || 
                        choice.text.toLowerCase().includes('gate') || choice.text.toLowerCase().includes('mission');
    
    if (isGateChoice && !currentStory?.leadsTo?.[choice.type]) {
      const nextStory = story['GATE_ENTRANCE'];
      if (nextStory) {
        setGameState(prev => ({ ...prev, currentScene: 'GATE_ENTRANCE' }));
        addChatMessage('player', choice.text);
        nextStory.chat.forEach(msg => {
          addChatMessage(msg.sender, msg.text);
        });
        generateSceneImage(nextStory.prompt);
        return;
      }
    }
    
    if (currentStory?.leadsTo?.[choice.type]) {
      const nextScene = currentStory.leadsTo[choice.type];
      const nextStory = story[nextScene];
      
      if (nextStory) {
        setGameState(prev => ({ ...prev, currentScene: nextScene }));
        addChatMessage('player', choice.text);
        
        // Add Game Master narration with voice
        if (nextStory.narration) {
          setTimeout(() => {
            playVoice(nextStory.narration, 'game-master', audioMuted);
          }, 500);
        }
        
        // Add story messages
        nextStory.chat.forEach(msg => {
          addChatMessage(msg.sender, msg.text);
        });
        
        // Generate images for significant actions
        const significantActions = [
          'enter_dungeon', 'boss_fight', 'new_location', 'major_battle', 
          'confession', 'kiss', 'date', 'travel', 'guild_meeting',
          'awakening', 'power_up', 'transformation', 'death', 'victory'
        ];
        
        const isSignificantAction = significantActions.some(action => 
          choice.type.includes(action) || nextScene.toLowerCase().includes(action)
        );
        
        if (isSignificantAction) {
          generateSceneImage(nextStory.prompt);
        }

        // Handle combat victories and reward distribution
        if (nextScene === 'COMBAT_VICTORY' || choice.type.includes('attack') || choice.type.includes('fight') || 
            choice.type === 'shadow_attack' || choice.type === 'dragon_fight' || choice.type === 'ultimate_strike' ||
            choice.type === 'celebrate_victory' || nextScene.includes('VICTORY')) {
          const monsterType = choice.type.includes('dragon') || nextScene.includes('DRAGON') ? 'ice_dragon' : 
                             choice.type.includes('orc') || nextScene.includes('ORC') ? 'orc_berserker' : 'goblin_warrior';
          handleCombatVictory(monsterType);
        }

        // Special effects for certain actions
        if (choice.type === 'summon' || choice.type === 'shadow_attack' || choice.type === 'extract_shadow') {
          createShadowSlashEffect();
          addScreenShake();
        }

        if (choice.type === 'confess' || choice.type === 'kiss') {
          // Create romantic particle effects
          setTimeout(() => {
            const container = document.querySelector('#scene-container');
            if (container) {
              for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: #ff69b4;
                  border-radius: 50%;
                  left: ${Math.random() * 100}%;
                  top: ${Math.random() * 100}%;
                  animation: float-up 2s ease-out forwards;
                  pointer-events: none;
                  box-shadow: 0 0 6px #ff69b4;
                `;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
              }
            }
          }, 500);
        }
      }
    }

    // Handle affection changes with visual feedback
    const affectionGain = getAffectionGain(choice.type);
    if (affectionGain > 0) {
      setGameState(prev => ({ 
        ...prev, 
        affection: Math.min(5, prev.affection + affectionGain) 
      }));
      triggerAffectionSparkle();
      
      // Show affection gain effect
      setTimeout(() => {
        const container = document.querySelector('#scene-container');
        if (container) {
          const heart = document.createElement('div');
          heart.style.cssText = `
            position: absolute;
            font-size: 24px;
            left: 50%;
            top: 20%;
            transform: translateX(-50%);
            animation: float-up 2s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
          `;
          heart.textContent = '💕';
          container.appendChild(heart);
          setTimeout(() => heart.remove(), 2000);
        }
      }, 300);
    }
  };

  // Add missing chat handlers
  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    
    const message = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    addChatMessage('player', message);
    
    // Process chat with Cha Hae-In directly
    try {
      setIsLoading(true);
      const response = await fetch('/api/chat-with-hae-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          gameState: gameState,
          affectionLevel: gameState.affection || 0,
          userBehavior: getUserBehaviorType(message)
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add Cha Hae-In's response
        addChatMessage('Cha Hae-In', data.response);
        
        // Generate voice for her response
        if (!audioMuted) {
          playVoice(data.response, 'Cha Hae-In', audioMuted);
        }
        
        // Enhanced visual description detection for comprehensive image generation
        const visualDescriptions = [
          // Facial expressions and micro-expressions
          /\*.*(?:slight smile|small smile|gentle smile|shy smile|warm smile|soft smile|knowing smile|playful smile).*\*/gi,
          /\*.*(?:bites her lip|biting her lip|lip bite|nervously bites|touches her lips|runs her finger|traces her lip).*\*/gi,
          /\*.*(?:looks away shyly|glances away|averts her gaze|looks down bashfully|meets your eyes|stares into|gazes at).*\*/gi,
          /\*.*(?:cheeks flush|face turns red|blushes deeply|rosy cheeks|pink cheeks|blushes).*\*/gi,
          /\*.*(?:raises an eyebrow|eyebrow raised|arched eyebrow|questioning look).*\*/gi,
          
          // Body language and posture
          /\*.*(?:tilts her head|head tilt|leans forward|leans back|sits up straight|relaxes).*\*/gi,
          /\*.*(?:crosses her arms|uncrosses arms|hands on hips|adjusts her stance|shifts position).*\*/gi,
          /\*.*(?:steps closer|moves away|takes a step back|moves forward|approaches).*\*/gi,
          
          // Equipment and clothing descriptions
          /\*.*(?:red armor|armor gleaming|gleaming faintly|armor shining|adjusts her sword|sword at her side).*\*/gi,
          /\*.*(?:blonde hair|hair catches the light|hair flowing|hair gleaming|golden hair).*\*/gi,
          
          // Physical interactions
          /\*.*(?:reaches out|extends her hand|takes your hand|touches|caresses|embraces|hugs).*\*/gi,
          /\*.*(?:kisses|pulls close|holds close|pulls away|leans in|sits closer|stands up).*\*/gi,
          
          // Emotional states with visual cues
          /(confession|first time|never felt|heart racing|can't breathe|overwhelmed|moved|touched)/gi,
          /(she blushes|her cheeks turn red|her face turns red|eyes light up|smiles warmly|face softens)/gi,
          /(tears in her eyes|starts crying|gets emotional|voice trembles|voice breaks|choked up)/gi,
          /(gasps|shocked|surprised|laughs|giggles|sighs)/gi,
          
          // Environmental and lighting descriptions
          /(in the light|light catches|gleaming|shining|glowing|soft lighting|warm glow)/gi,
          /(red armor gleaming|armor catching light|faintly gleaming|gleams softly)/gi,
          
          // Conversational visual cues  
          /(genuinely curious|thoughtful expression|contemplative look|focused gaze|intense stare)/gi,
          /(playful grin|mischievous smile|teasing look|competitive glint|challenging expression)/gi
        ];
        
        const hasVisualDescription = visualDescriptions.some(pattern => 
          pattern.test(data.response)
        );
        
        if (hasVisualDescription) {
          console.log('Generating image for visual description in chat:', data.response);
          fetch('/api/generate-chat-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatResponse: data.response,
              userMessage: message
            }),
          })
          .then(res => res.json())
          .then(imageData => {
            if (imageData.imageUrl) {
              console.log('Chat reaction image generated, updating background');
              setCurrentBackground(imageData.imageUrl);
              setSceneBackground(imageData.imageUrl);
            }
          })
          .catch(err => console.log('Image generation skipped:', err.message));
        }
        
        // Check for affection changes based on user behavior and Cha Hae-In's response
        const affectionIncreaseKeywords = [
          'blush', 'smile', 'happy', 'glad', 'warm', 'comfort', 'drawn', 
          'heart', 'feel', 'love', 'care', 'special', 'close', 'trust'
        ];
        
        const affectionDecreaseKeywords = [
          'upset', 'hurt', 'disappointed', 'angry', 'annoyed', 'frustrated',
          'uncomfortable', 'offended', 'bothered', 'disturbed', 'concerned',
          'worried', 'sad', 'distance', 'cold', 'withdrawn', 'hesitant'
        ];
        
        // Check user message for rude/mean behavior
        const userRudeBehavior = [
          'shut up', 'stupid', 'dumb', 'idiot', 'hate you', 'annoying',
          'boring', 'whatever', 'don\'t care', 'leave me alone', 'go away',
          'ugly', 'worthless', 'pathetic', 'loser', 'weak', 'useless'
        ];
        
        const userMessageLower = message.toLowerCase();
        const responseText = data.response.toLowerCase();
        
        const hasRudeBehavior = userRudeBehavior.some(keyword => 
          userMessageLower.includes(keyword)
        );
        
        const hasAffectionIncrease = affectionIncreaseKeywords.some(keyword => 
          responseText.includes(keyword)
        );
        
        const hasAffectionDecrease = affectionDecreaseKeywords.some(keyword => 
          responseText.includes(keyword)
        ) || hasRudeBehavior;
        
        console.log('Affection check:', { hasAffectionIncrease, hasAffectionDecrease, responseText: responseText.substring(0, 100) });
        
        // Auto-generate negative emotion images for visual feedback
        const negativeEmotionPatterns = [
          /\*.*(?:looks away|averts her gaze|turns away|steps back|crosses arms).*\*/gi,
          /\*.*(?:frowns|scowls|disappointed look|hurt expression|sad eyes).*\*/gi,
          /\*.*(?:sighs|shakes her head|looks disappointed|seems upset|appears hurt).*\*/gi,
          /(disappointed|upset|hurt|bothered|uncomfortable|concerned)/gi
        ];

        const hasNegativeVisual = negativeEmotionPatterns.some(pattern => 
          data.response.match(pattern)
        ) || hasRudeBehavior;

        if (hasNegativeVisual) {
          fetch('/api/generate-chat-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              chatResponse: data.response,
              userMessage: message,
              emotionalState: 'negative'
            }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.imageUrl) {
              setCurrentBackground(data.imageUrl);
              setSceneBackground(data.imageUrl);
              console.log('Generated negative emotion scene image');
            }
          })
          .catch(err => console.log('Negative emotion image generation skipped:', err.message));
        }

        // Apply affection changes with balanced difficulty
        if (hasAffectionDecrease && gameState.affection > 0) {
          const previousAffection = gameState.affection;
          setGameState(prev => ({ 
            ...prev, 
            affection: Math.max(0, prev.affection - 1) 
          }));
          setTimeout(() => {
            showAffectionDecreaseIndicator(Math.max(0, previousAffection - 1), previousAffection);
          }, 500);
        } else if (hasAffectionIncrease && gameState.affection < 5) {
          const previousAffection = gameState.affection;
          console.log('Affection increasing! Triggering sparkle effect');
          setGameState(prev => ({ 
            ...prev, 
            affection: Math.min(5, prev.affection + 1) 
          }));
          triggerAffectionSparkle();
          setTimeout(() => {
            createHeartEffect();
            showAffectionIncreaseIndicator(Math.min(5, previousAffection + 1), previousAffection);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage('system', "Cha Hae-In seems distracted and doesn't respond...");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoiceClick = (choice: any) => {
    handleChoice(choice);
  };

  const handleChoice = (choice: any) => {
    const currentStory = story[gameState.currentScene];
    console.log('Choice clicked:', choice);
    console.log('Current scene:', gameState.currentScene);
    console.log('Current story leadsTo:', currentStory?.leadsTo);
    console.log('Looking for choice type:', choice.type);
    console.log('Available story scenes:', Object.keys(story));
    
    // Check for Daily Life Hub navigation
    if (choice.type === 'daily_life_hub') {
      console.log('Navigating to Daily Life Hub...');
      // Navigate to Daily Life Hub page
      window.location.href = '/daily-life-hub';
      return;
    }
    
    // Check if this is a combat choice and trigger mini-game
    if (isCombatChoice(choice, gameState.currentScene, currentStory?.narration || '')) {
      console.log('Combat detected! Triggering mini-game...');
      triggerCombatMiniGame(choice);
      return;
    }
    
    // Universal gate navigation - if choice contains "gate" or "mission", go to gate
    const isGateChoice = choice.type.includes('gate') || choice.type.includes('mission') || 
                        choice.text.toLowerCase().includes('gate') || choice.text.toLowerCase().includes('mission');
    
    if (isGateChoice && !currentStory?.leadsTo?.[choice.type]) {
      console.log('Universal gate navigation triggered');
      const nextStory = story['GATE_ENTRANCE'];
      if (nextStory) {
        setGameState(prev => ({ ...prev, currentScene: 'GATE_ENTRANCE' }));
        addChatMessage('player', choice.text);
        nextStory.chat.forEach((msg, index) => {
          setTimeout(() => {
            addChatMessage(msg.sender, msg.text);
          }, index * 150); // 150ms delay between messages for better UX
        });
        generateSceneImage(nextStory.prompt);
        return;
      }
    }
    
    if (currentStory?.leadsTo?.[choice.type]) {
      const nextScene = currentStory.leadsTo[choice.type];
      const nextStory = story[nextScene];
      console.log('Next scene found:', nextScene);
      console.log('Next story exists:', !!nextStory);
      
      if (nextStory) {
        setGameState(prev => ({ ...prev, currentScene: nextScene }));
        addChatMessage('player', choice.text);
        
        // Add story messages with slight delay for proper scrolling
        nextStory.chat.forEach((msg, index) => {
          setTimeout(() => {
            addChatMessage(msg.sender, msg.text);
          }, index * 150); // 150ms delay between messages for better UX
        });
        
        // Generate new image whenever scene changes to a different location or context
        const previousScene = gameState.currentScene;
        const shouldGenerateImage = (
          // Always generate for major scene transitions
          previousScene !== nextScene ||
          // Location-based scenes
          ['GATE_ENTRANCE', 'COMBAT_DUNGEON', 'BOSS_CHAMBER', 'GUILD_HQ', 'CAFE', 'RESTAURANT', 'PARK', 'APARTMENT'].includes(nextScene) ||
          // Action-based scenes  
          ['enter_gate', 'enter_dungeon', 'boss_fight', 'combat', 'battle', 'fight', 'attack'].some(action => choice.type.includes(action)) ||
          // Relationship scenes
          ['confession', 'kiss', 'date', 'intimate', 'romance', 'together'].some(action => choice.type.includes(action)) ||
          // Story progression scenes
          nextScene.includes('TRUST') || nextScene.includes('UNIFIED') || nextScene.includes('CONFIDENCE') ||
          // Any scene with different environmental context
          nextStory.prompt.toLowerCase().includes('location') || 
          nextStory.prompt.toLowerCase().includes('setting') ||
          nextStory.prompt.toLowerCase().includes('environment')
        );
        
        if (shouldGenerateImage) {
          console.log('Generating new scene image for:', nextScene);
          generateSceneImage(nextStory.prompt);
        }

        // Special effects for certain actions
        if (choice.type === 'summon' || choice.type === 'shadow_attack' || choice.type === 'extract_shadow') {
          createShadowSlashEffect();
          addScreenShake();
        }

        if (choice.type === 'confess' || choice.type === 'kiss') {
          // Create romantic particle effects
          setTimeout(() => {
            const container = document.querySelector('#scene-container');
            if (container) {
              for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: #ff69b4;
                  border-radius: 50%;
                  left: ${Math.random() * 100}%;
                  top: ${Math.random() * 100}%;
                  animation: float-up 2s ease-out forwards;
                  pointer-events: none;
                  box-shadow: 0 0 6px #ff69b4;
                `;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
              }
            }
          }, 500);
        }

        // Handle affection changes for successful story navigation
        const affectionGain = getAffectionGain(choice.type);
        if (affectionGain > 0) {
          const previousAffection = gameState.affection;
          setGameState(prev => {
            const newAffection = Math.min(5, prev.affection + affectionGain);
            console.log(`Affection increased by ${affectionGain}: ${previousAffection} -> ${newAffection}`);
            setTimeout(() => createHeartEffect(), 300);
            return { ...prev, affection: newAffection };
          });
          triggerAffectionSparkle();
        }

        return; // Early return for successful navigation
      } else {
        console.log('ERROR: Next story scene not found:', nextScene);
        addChatMessage('system', `Navigation error: Scene "${nextScene}" not found`);
      }
    } else {
      console.log('No matching choice found in story navigation, using fallback handling');
      console.log('Available choice types in leadsTo:', Object.keys(currentStory?.leadsTo || {}));
      
      // Enhanced fallback system for missing scenes
      const fallbackScenes: Record<string, string> = {
        // Romantic scenes
        'PERFECT_MATCH': 'ROMANTIC_MOMENT',
        'SPECIAL_BOND': 'ROMANTIC_MOMENT', 
        'DEEP_UNDERSTANDING': 'UNDERSTANDING_MOMENT',
        'FEELING_EXPLORATION': 'FEELINGS_REVEALED',
        'MUTUAL_FEELINGS': 'ROMANTIC_MOMENT',
        'HAPPINESS_FOCUS': 'ROMANTIC_MOMENT',
        'LOVE_CONFESSION': 'CONFESSION',
        'FALLING_REALIZATION': 'CONFESSION_RESPONSE',
        'HEART_GUIDANCE': 'ROMANTIC_MOMENT',
        'EYE_CONTACT_MOMENT': 'ROMANTIC_MOMENT',
        'ROMANTIC_MEMORY': 'ROMANTIC_MOMENT',
        'UNFORGETTABLE_MOMENT': 'SPECIAL_MOMENT',
        'HOPEFUL_MOMENT': 'ROMANTIC_MOMENT',
        'PROTECTED_ADVENTURE': 'PROTECTIVE_ROUTE',
        'NATURAL_PARTNERSHIP': 'PARTNERSHIP_BOND',
        'GRATEFUL_MOMENT': 'SPECIAL_MOMENT',
        'SHARED_APPRECIATION': 'UNDERSTANDING_MOMENT',
        'CLAIMED_SPACE': 'SPECIAL_MOMENT',
        'HONORED_TRUST': 'TRUST_ROUTE',
        'TREASURED_MEMORY': 'SPECIAL_MOMENT',
        'THOUGHT_SHARING': 'PAST_SHARING',
        'MUTUAL_DISCOVERY': 'MUTUAL_OPENING',
        'DEEP_CONNECTION': 'DEEP_CONFESSION',
        'HAPPINESS_SHARED': 'ROMANTIC_MOMENT',
        // Philosophy scenes
        'DIRECT_PRAISE': 'ROMANTIC_MOMENT',
        'MUTUAL_ENHANCEMENT': 'ROMANTIC_MOMENT',
        'DESERVED_WORTH': 'SPECIAL_MOMENT',
        'UNIQUE_VALUE': 'SPECIAL_MOMENT',
        'LEADERSHIP_MOMENT': 'ROMANTIC_MOMENT',
        'HEART_STRENGTH': 'ROMANTIC_MOMENT',
        'COMBINED_STRENGTH': 'ROMANTIC_MOMENT',
        'SIDE_BY_SIDE': 'ROMANTIC_MOMENT',
        'PRESERVED_NATURE': 'ROMANTIC_MOMENT',
        'GREATEST_ASSET': 'ROMANTIC_MOMENT',
        'IMMEDIATE_ACTION': 'ROMANTIC_MOMENT',
        'STRATEGIC_PLANNING': 'ROMANTIC_MOMENT',
        'PARTNER_DEFINITION': 'PARTNERSHIP_BOND',
        'DAILY_INSPIRATION': 'ROMANTIC_MOMENT',
        'MUTUAL_COMPLETION': 'ROMANTIC_MOMENT',
        'FUTURE_POTENTIAL': 'ROMANTIC_MOMENT',
        'ROMANTIC_DESTINY': 'ROMANTIC_MOMENT',
        'SELF_MADE_DESTINY': 'ROMANTIC_MOMENT',
        'LOVE_RECOGNITION': 'CONFESSION',
        'TRUTH_SEEING': 'ROMANTIC_MOMENT'
      };
      
      // Try fallback mapping first
      const nextScene = currentStory?.leadsTo?.[choice.type];
      if (nextScene && (fallbackScenes as any)[nextScene] && story[(fallbackScenes as any)[nextScene]]) {
        console.log('Using fallback mapping:', nextScene, '->', (fallbackScenes as any)[nextScene]);
        const fallbackStory = story[(fallbackScenes as any)[nextScene]];
        setGameState(prev => ({ ...prev, currentScene: (fallbackScenes as any)[nextScene] }));
        addChatMessage('player', choice.text);
        fallbackStory.chat.forEach((msg, index) => {
          setTimeout(() => {
            addChatMessage(msg.sender, msg.text);
          }, index * 150);
        });
        generateSceneImage(fallbackStory.prompt);
        return;
      }
      
      // Fallback: try to find a scene that matches the choice text or type
      if (choice.text.toLowerCase().includes('future') || choice.type.includes('future') || choice.type.includes('plan')) {
        const fallbackScene = 'SHARED_FUTURE';
        if (story[fallbackScene]) {
          console.log('Using fallback navigation to:', fallbackScene);
          const nextStory = story[fallbackScene];
          setGameState(prev => ({ ...prev, currentScene: fallbackScene }));
          addChatMessage('player', choice.text);
          nextStory.chat.forEach((msg, index) => {
            setTimeout(() => {
              addChatMessage(msg.sender, msg.text);
            }, index * 150);
          });
          generateSceneImage(nextStory.prompt);
          return;
        }
      }
      
      // Generic fallback - add the choice as dialogue and continue in current scene
      addChatMessage('player', choice.text);
      addChatMessage('system', 'Cha Hae-In smiles warmly at your words, her eyes sparkling with affection.');
    }

    // Handle affection changes with visual feedback
    const affectionGain = getAffectionGain(choice.type);
    if (affectionGain > 0) {
      setGameState(prev => {
        const newAffection = Math.min(5, prev.affection + affectionGain);
        setTimeout(() => createHeartEffect(), 300);
        return { ...prev, affection: newAffection };
      });
    }
  };

  const getAffectionGain = (choiceType: string): number => {
    const affectionMap: Record<string, number> = {
      'ask_about_her': 1,
      'be_humble': 1,
      'team_up': 1,
      'trust': 1,
      'confess': 2,
      'kiss': 1,
      'compliment': 1,
      'focus_hae_in': 1,
      'take_hand': 1,
      'caring': 1,
      'protective': 1,
      'romantic': 1,
      'sweet': 1,
      'understanding': 1,
      'supportive': 1,
      'empathetic': 1,
      'honest': 1,
      'kind': 1,
      'gentle': 1
    };
    return affectionMap[choiceType] || 0;
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    const message = userInput;
    setUserInput('');
    
    // Add user message immediately and scroll to show it
    addChatMessage('player', message);
    setTimeout(() => scrollToBottom(), 100);
    
    if (inputMode === 'speak') {
      // Use Gemini for dynamic conversation with Cha Hae-In
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat-with-hae-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            gameState,
            conversationHistory: chatMessages.slice(-5) // Last 5 messages for context
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Add AI response and ensure it's visible (voice will be automatically triggered by addChatMessage)
        addChatMessage('Cha Hae-In', data.response);
        
        // If chat response includes an image, update background
        if (data.imageUrl) {
          setCurrentBackground(data.imageUrl);
          setSceneBackground(data.imageUrl);
          console.log('Chat response generated image, updating background');
        } else {
          // Check for mature content requests in chat messages first
          const matureContentKeywords = [
            'nude', 'naked', 'strip', 'undress', 'sexy', 'hot', 'sensual', 'erotic',
            'intimate', 'make love', 'passionate', 'bedroom', 'show me', 'picture of',
            'image of', 'generate', 'create image', 'breast', 'thigh', 'revealing',
            'aroused', 'desire', 'pleasure', 'seduce', 'tease', 'foreplay'
          ];
          
          const isMatureRequest = matureContentKeywords.some(keyword =>
            message.toLowerCase().includes(keyword)
          );
          
          if (isMatureRequest) {
            // Generate mature content image using NovelAI
            console.log('Generating mature content for chat request:', message);
            
            fetch('/api/generate-intimate-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                activityId: 'custom_intimate',
                relationshipStatus: gameState.affection >= 5 ? 'married' : gameState.affection >= 4 ? 'engaged' : 'dating',
                intimacyLevel: gameState.affection || 1,
                specificAction: message
              }),
            })
            .then(response => response.json())
            .then(data => {
              if (data.imageUrl) {
                setCurrentBackground(data.imageUrl);
                setSceneBackground(data.imageUrl);
                console.log('Generated mature content image from chat');
              }
            })
            .catch(error => console.error('Error generating mature content:', error));
          }
          
          // Enhanced emotional detection for automatic image generation
          const significantEmotions = [
            /\(.*(?:blush|blushing|flushed|cheeks.*red|face.*red|tears|crying|shocked|gasped|eyes wide).*\)/gi,
            /\*.*(?:kisses|embraces|holds close|pulls away|touches|caresses).*\*/gi,
            /(confession|first time|never felt|heart racing|can't breathe)/gi,
            /(she blushes|her cheeks turn red|her face turns red|eyes light up|smiles warmly)/gi,
            /(tears in her eyes|starts crying|gets emotional|voice trembles)/gi
          ];
          
          const isSignificantEmotion = significantEmotions.some(pattern => 
            pattern.test(data.response)
          );
          
          // Also check if this is a major conversational moment
          const majorConversationTopics = [
            'love', 'confession', 'feelings', 'heart', 'first time', 'never felt',
            'marry', 'future', 'together forever', 'soul', 'destiny'
          ];
          
          const isMajorTopic = majorConversationTopics.some(topic =>
            message.toLowerCase().includes(topic) || data.response.toLowerCase().includes(topic)
          );
          
          if (isSignificantEmotion || isMajorTopic) {
            // Generate emotion-based scene image only for major moments
            fetch('/api/generate-chat-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                chatResponse: data.response,
                userMessage: message
              }),
            })
            .then(res => res.json())
            .then(imageData => {
              if (imageData.imageUrl) {
                setCurrentBackground(imageData.imageUrl);
                setSceneBackground(imageData.imageUrl);
                console.log('Generated image for significant emotional moment');
              }
            })
            .catch(err => console.log('Image generation skipped:', err.message));
          }
        }
        
        // Scroll to show the new AI response
        setTimeout(() => scrollToBottom(), 200);
        
        // Clear any temporary visibility states for older messages
        setTimeout(() => {
          setScrollBasedVisibility({});
        }, 1000);
        
        // Dynamic affection tracking based on conversation depth
        const affectionKeywords = [
          'blush', 'smile', 'happy', 'glad', 'warm', 'comfort', 'drawn', 
          'heart', 'feel', 'love', 'care', 'special', 'close', 'trust'
        ];
        
        const responseText = data.response.toLowerCase();
        const hasAffectionTrigger = affectionKeywords.some(keyword => 
          responseText.includes(keyword)
        );
        
        if (hasAffectionTrigger && gameState.affection < 5) {
          setGameState(prev => ({ 
            ...prev, 
            affection: Math.min(5, prev.affection + 1) 
          }));
          setTimeout(() => createHeartEffect(), 500);
        }
      } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('system', "Cha Hae-In seems distracted and doesn't respond...");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Action mode - detect intimate actions and explicit image requests
      const intimateKeywords = [
        // Direct intimate requests
        'lets make love', 'let\'s make love', 'make love', 'have sex', 'fuck', 'fucking',
        'fuck me', 'fuck her', 'sex', 'sexual', 'intimate', 'intimacy',
        // Explicit requests for mature images
        'show me', 'generate', 'create image', 'make image', 'picture of', 'scene of',
        // Physical intimate actions
        'grab her hair', 'from behind', 'doggystyle', 'doggy style', 'position', 'missionary', 
        'on top', 'underneath', 'legs', 'kiss her neck', 'touch her', 'caress', 'massage',
        'undress', 'clothes off', 'naked', 'bare', 'skin', 'breast', 'thigh',
        'passionate', 'thrust', 'moan', 'whisper', 'gentle', 'rough',
        'bedroom', 'bed', 'sheet', 'pillow', 'cuddle', 'embrace', 'hold close',
        // Explicit content requests
        'nude', 'strip', 'sexy', 'hot', 'sensual', 'erotic', 'aroused', 'desire',
        'pleasure', 'orgasm', 'climax', 'seduce', 'tease', 'foreplay', 'afterglow',
        // Romantic/intimate scenarios
        'alone together', 'private moment', 'secret place', 'just us', 'no one around',
        'take off', 'remove clothes', 'undressing', 'revealing', 'exposed'
      ];
      
      const isIntimateAction = intimateKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
      );
      
      if (isIntimateAction) {
        // Generate intimate scene with NovelAI for explicit actions
        console.log('Generating intimate scene for action:', message);
        
        fetch('/api/generate-intimate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: activeActivity?.id || 'custom_intimate',
            relationshipStatus: gameState.affection >= 5 ? 'married' : gameState.affection >= 4 ? 'engaged' : 'dating',
            intimacyLevel: gameState.affection || 1,
            specificAction: message // Pass the specific action for custom scene generation
          }),
        })
        .then(response => response.json())
        .then(data => {
          if (data.imageUrl) {
            setCurrentBackground(data.imageUrl);
            setSceneBackground(data.imageUrl);
            console.log('Generated intimate scene for action');
          }
        })
        .catch(error => console.error('Error generating intimate scene:', error));
        
        // Generate contextual response from Cha Hae-In
        const intimateResponses = [
          "*breathes heavily* Jin-Woo... *her voice trembles with desire*",
          "*gasps softly* You're so... *blushes deeply* I love when you take control...",
          "*moans quietly* That feels incredible... *pulls you closer*",
          "*whispers against your ear* I'm all yours... *heart racing*",
          "*eyes flutter closed* Don't stop... *grips the sheets*"
        ];
        
        setTimeout(() => {
          const response = intimateResponses[Math.floor(Math.random() * intimateResponses.length)];
          addChatMessage('Cha Hae-In', response);
          // Voice will be automatically triggered by addChatMessage
        }, 1500);
        
      } else {
        // Enhanced action processing for contextual responses
        const actionLower = message.toLowerCase();
        
        // Movement/location actions
        if (actionLower.includes('go to') || actionLower.includes('move to') || actionLower.includes('head to')) {
          const location = actionLower.replace(/.*(?:go to|move to|head to)\s+(?:the\s+)?/, '');
          
          let locationPrompt = '';
          let responseText = '';
          
          if (location.includes('car')) {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In walking to a sleek black car in a Korean city street, modern urban setting, manhwa art style`;
            responseText = `*Cha Hae-In walks beside you toward the car* "Where are we heading, Jin-Woo?"`;
          } else if (location.includes('café') || location.includes('coffee')) {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In approaching a cozy Korean café, warm lighting visible through windows, manhwa art style`;
            responseText = `*Cha Hae-In's eyes light up* "A café sounds perfect! I could use some coffee."`;
          } else if (location.includes('restaurant')) {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In entering an elegant Korean restaurant, traditional interior design, manhwa art style`;
            responseText = `*Cha Hae-In smiles warmly* "This place looks wonderful. Good choice, Jin-Woo."`;
          } else if (location.includes('park')) {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In walking into a beautiful Korean park with cherry blossoms, romantic setting, manhwa art style`;
            responseText = `*Cha Hae-In takes a deep breath* "The fresh air feels amazing. Walking with you makes it even better."`;
          } else if (location.includes('home') || location.includes('apartment')) {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In arriving at a modern Korean apartment building, evening lighting, manhwa art style`;
            responseText = `*Cha Hae-In looks at the building* "Your place? I'd love to see how you live, Jin-Woo."`;
          } else {
            locationPrompt = `Sung Jin-Woo and Cha Hae-In moving to ${location}, Korean urban environment, manhwa art style`;
            responseText = `*Cha Hae-In follows your lead* "Lead the way, Jin-Woo. I trust your judgment."`;
          }
          
          generateSceneImage(locationPrompt);
          setTimeout(() => {
            addChatMessage('Cha Hae-In', responseText);
          }, 1500);
          
        // Physical actions  
        } else if (actionLower.includes('take her hand') || actionLower.includes('hold her hand')) {
          const handPrompt = `Close-up of Sung Jin-Woo gently taking Cha Hae-In's hand, romantic moment, soft lighting, manhwa art style`;
          generateSceneImage(handPrompt);
          setTimeout(() => {
            addChatMessage('Cha Hae-In', `*blushes as you take her hand* "Your hand feels so warm... I feel safe with you, Jin-Woo."`);
          }, 1500);
          
        } else if (actionLower.includes('hug') || actionLower.includes('embrace')) {
          const hugPrompt = `Sung Jin-Woo and Cha Hae-In in a warm embrace, romantic scene, soft lighting, manhwa art style`;
          generateSceneImage(hugPrompt);
          setTimeout(() => {
            addChatMessage('Cha Hae-In', `*melts into your embrace* "I love how you hold me... it feels like home."`);
          }, 1500);
          
        } else if (actionLower.includes('sit down') || actionLower.includes('sit together')) {
          const sitPrompt = `Sung Jin-Woo and Cha Hae-In sitting together on a comfortable couch or bench, intimate setting, manhwa art style`;
          generateSceneImage(sitPrompt);
          setTimeout(() => {
            addChatMessage('Cha Hae-In', `*sits close to you* "This is nice... just being here with you."`);
          }, 1500);
          
        // Conversation starters
        } else if (actionLower.includes('tell her') || actionLower.includes('say to her')) {
          const what = actionLower.replace(/.*(?:tell her|say to her)\s+/, '');
          setTimeout(() => {
            addChatMessage('Cha Hae-In', `*listens intently* "Thank you for sharing that with me, Jin-Woo. What you say means a lot to me."`);
          }, 1000);
          
        // Look actions
        } else if (actionLower.includes('look at her') || actionLower.includes('gaze at her')) {
          const gazePrompt = `Close-up portrait of Cha Hae-In with beautiful golden blonde hair, gentle expression as she notices your gaze, manhwa art style`;
          generateSceneImage(gazePrompt);
          setTimeout(() => {
            addChatMessage('Cha Hae-In', `*notices you looking and smiles shyly* "What is it? Do I have something on my face?" *touches her cheek self-consciously*`);
          }, 1500);
          
        // Generic fallback with context
        } else {
          const contextualPrompt = `Sung Jin-Woo performing action: ${message}, with Cha Hae-In nearby, Korean setting, manhwa art style, detailed scene`;
          generateSceneImage(contextualPrompt);
          
          // Generate contextual response through AI
          setTimeout(async () => {
            try {
              const response = await fetch('/api/chat-with-hae-in', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  message: `*${message}*`,
                  gameState: gameState,
                  context: 'action_response'
                }),
              });
              
              if (response.ok) {
                const data = await response.json();
                addChatMessage('Cha Hae-In', data.response);
              } else {
                addChatMessage('Cha Hae-In', `*reacts to your action* "That's interesting, Jin-Woo. What are you thinking?"`);
              }
            } catch (error) {
              addChatMessage('Cha Hae-In', `*watches you thoughtfully* "You always surprise me with your actions, Jin-Woo."`);
            }
          }, 1000);
        }
        
        // Add some visual effects for actions
        if (Math.random() > 0.6) {
          createShadowSlashEffect();
        }
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    const startStory = story[gameState.currentScene];
    startStory.chat.forEach(msg => {
      addChatMessage(msg.sender, msg.text);
    });
    generateSceneImage(startStory.prompt);
  };

  const renderAffectionHearts = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`heart ${i < gameState.affection ? 'filled' : 'empty'}`}
        style={{
          fontSize: '18px',
          margin: '0 2px',
          filter: i < gameState.affection ? 'drop-shadow(0 0 6px rgba(255, 107, 157, 0.8))' : 'none',
          transform: i < gameState.affection ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease'
        }}
      >
        {i < gameState.affection ? '❤️' : '🤍'}
      </span>
    ));
  };

  const currentStory = story[gameState.currentScene];

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Responsive Fullscreen Container */}
      <div className="w-full h-screen min-h-[600px] max-h-screen bg-black relative flex flex-col">
        
        {/* Start Overlay */}
        {!gameStarted && (
            <div className="absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-1000">
              {/* AI-Generated Jin-Woo Cover */}
              {(currentBackground.startsWith('data:') || currentBackground.startsWith('http')) ? (
                <img 
                  src={currentBackground}
                  alt="Jin-Woo Solo Leveling Cover"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  {/* Fallback Solo Leveling Background */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.7)), 
                        radial-gradient(circle at 30% 40%, rgba(138, 43, 226, 0.8) 0%, transparent 50%),
                        radial-gradient(circle at 70% 30%, rgba(75, 0, 130, 0.6) 0%, transparent 50%),
                        linear-gradient(135deg, #0f0f23 0%, #1a1a3a 30%, #2d1b69 60%, #0f0f0f 100%)`
                    }}
                  />
                  
                  {/* Jin-Woo Silhouette SVG */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="200" height="300" viewBox="0 0 200 300" className="opacity-30">
                      <defs>
                        <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#3b0764" stopOpacity="0.9"/>
                        </linearGradient>
                      </defs>
                      {/* Jin-Woo Figure */}
                      <path d="M100 50 L110 60 L105 100 L120 120 L115 200 L125 280 L100 290 L75 280 L85 200 L80 120 L95 100 L90 60 Z" 
                            fill="url(#shadowGrad)" opacity="0.7"/>
                      {/* Coat */}
                      <path d="M85 100 L115 100 L120 180 L110 200 L90 200 L80 180 Z" 
                            fill="#1a1a1a" opacity="0.8"/>
                      {/* Glowing Eyes */}
                      <circle cx="95" cy="65" r="2" fill="#8b5cf6" opacity="0.9"/>
                      <circle cx="105" cy="65" r="2" fill="#8b5cf6" opacity="0.9"/>
                    </svg>
                  </div>
                </>
              )}
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="relative z-10 p-6 text-center text-white">
                <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Solo Leveling
                </h1>
                <p className="text-white/70 mb-6">Shadow & Heart</p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Enter the Gate
                </button>
              </div>
            </div>
          )}

          {/* Game Content */}
          {gameStarted && (
            <>
              {/* Full Screen Game Container with Overlaid UI */}
              <div className="flex-1 relative overflow-hidden">
                {/* AI-Generated Scene Background - Full Screen iPhone Display */}
                {(sceneBackground || currentBackground.startsWith('data:')) && (
                  <img 
                    key={sceneBackground || currentBackground}
                    src={sceneBackground || currentBackground}
                    alt="AI Generated Scene"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ zIndex: 1 }}
                    onLoad={() => console.log('AI scene background loaded and displayed')}
                    onError={(e) => console.log('AI scene background failed:', e)}
                  />
                )}
                
                {/* Fallback gradient if no AI image */}
                {!sceneBackground && !currentBackground.startsWith('data:') && (
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-gray-900"
                    style={{ zIndex: 1 }}
                  />
                )}
                
                {/* Dark overlay for UI readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" style={{ zIndex: 2 }} />
                

                

                
                {/* Effects Layer */}
                <div id="effects-container" className="absolute inset-0 z-20 pointer-events-none" />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                    <div className="spinner" />
                  </div>
                )}



                {/* Vertical Toolbar */}
                <div className="absolute top-16 right-3 z-50 flex flex-col gap-2" style={{ pointerEvents: 'auto' }}>
                  {/* Chat Toggle Button */}
                  <button
                    onClick={() => setChatPinned(!chatPinned)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                  >
                    {chatPinned ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-purple-300">
                        <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8S17.1 10 16 10H14V12C14 13.1 13.1 14 12 14S10 13.1 10 12V10H8C6.9 10 6 9.1 6 8S6.9 6 8 6H10V4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
                        <path d="M12 16L8 20H16L12 16Z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-300">
                        <path d="M8 12H16M8 8H16M8 16H12M21 12C21 16.9706 16.9706 21 12 21C10.2734 21 8.65849 20.4784 7.31387 19.5849L3 21L4.41506 16.6861C3.52157 15.3415 3 13.7266 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>



                  {/* Inventory Button */}
                  <button 
                    onClick={() => setShowInventory(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                    title="Inventory"
                  >
                    🎒
                  </button>

                  {/* Character Profile Button */}
                  <button 
                    onClick={() => setShowCharacterProfile(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-blue-500/50 transition-all border border-blue-400/30 shadow-lg relative"
                    title="Character Profile"
                  >
                    👤
                    {((gameState.skillPoints || 0) + (gameState.statPoints || 0)) > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {(gameState.skillPoints || 0) + (gameState.statPoints || 0)}
                      </div>
                    )}
                  </button>

                  {/* Equipment Button */}
                  <button 
                    onClick={() => setShowEquipmentSystem(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-purple-500/50 transition-all border border-purple-400/30 shadow-lg"
                    title="Equipment & Gear"
                  >
                    ⚔️
                  </button>

                  {/* Daily Life Hub Button - Available after romantic relationship */}
                  {gameState.affection >= 3 && (
                    <button 
                      onClick={() => {
                        setPreviousPage('story');
                        setShowDailyLifeHub(true);
                      }}
                      className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-pink-500/50 transition-all border border-pink-400/30 shadow-lg"
                      title="Daily Life Hub"
                    >
                      🏠
                    </button>
                  )}



                  {/* Raid System Button - Available after level 5 */}
                  {gameState.level >= 5 && (
                    <button 
                      onClick={() => setShowRaidSystem(true)}
                      className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-all border border-red-400/30 shadow-lg"
                      title="Gate Raids"
                    >
                      ⚔️
                    </button>
                  )}



                  {/* Relationship System Button */}
                  <button 
                    onClick={() => {
                      console.log('Relationship Store button clicked');
                      setShowRelationshipSystem(true);
                    }}
                    onDoubleClick={() => {
                      console.log('Manual sparkle trigger test');
                      triggerAffectionSparkle();
                    }}
                    className={`w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-pink-500/50 transition-all border border-pink-400/30 shadow-lg ${affectionButtonSparkle ? 'sparkle-effect' : ''}`}
                    title="Relationship Status (Double-click to test sparkle)"
                    style={{ pointerEvents: 'auto' }}
                  >
                    💖
                  </button>

                  {/* Hunter Marketplace */}
                  <button 
                    onClick={() => setShowUnifiedShop(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-green-500/50 transition-all border border-green-400/30 shadow-lg"
                    title="Hunter Marketplace - Weapons, Armor, Gifts & More"
                  >
                    🏪
                  </button>



                  {/* Developer Controls Button */}
                  <button 
                    onClick={() => {
                      console.log('Developer Controls button clicked');
                      setShowDevControls(!showDevControls);
                    }}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-purple-500/50 transition-all border border-purple-400/30 shadow-lg"
                    title="Developer Controls"
                    style={{ pointerEvents: 'auto' }}
                  >
                    ⚙️
                  </button>

                  {/* Help Button */}
                  <button 
                    onClick={() => setShowChatTutorial(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10 shadow-lg"
                    title="Chat Help"
                  >
                    💡
                  </button>
                </div>

                {/* Combined Messages Container - Full Screen Coverage */}
                <div className={`absolute top-16 left-0 right-0 bottom-52 sm:bottom-56 z-30 flex flex-col transition-opacity duration-300 ${(chatPinned || autoMessageVisible) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div ref={chatContainerRef} className="h-full p-2 sm:p-3 pb-8 overflow-y-auto chat-container space-y-2 sm:space-y-3">
                      
                      {/* Story Narration - Game Master Message */}
                      {currentStory && (
                        <div className={`chat-message message-bubble message-staying mb-4 ${
                          currentSpeaker && currentSpeaker.includes('narrator') ? 'message-speaking-narrator' : ''
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 glassmorphism flex items-center justify-center flex-shrink-0 ${
                              isPlaying && currentSpeaker && currentSpeaker.includes('narrator') ? 'animate-pulse ring-2 ring-purple-400' : ''
                            }`}>
                              <span className="text-white text-sm">📖</span>
                            </div>
                            <div className="flex-1">
                              <div className="glassmorphism rounded-2xl p-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-semibold text-sm">Narrator</span>
                                    {isPlaying && (
                                      <span className="text-purple-300 text-xs animate-pulse">🎵 Speaking...</span>
                                    )}
                                  </div>
                                  {!autoPlayVoice && !audioMuted && (
                                    <button
                                      onClick={() => playVoice(currentStory.narration, 'narrator', audioMuted)}
                                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-white/20"
                                      title="Play voice"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                                <div className="text-white text-sm leading-relaxed">{currentStory.narration}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* System/Story Messages with iMessage-style animation */}
                      {currentStory?.chat && currentStory.chat.map((msg, index) => (
                        <div key={`story-${index}`} className={`chat-message message-bubble message-staying mb-4 ${
                          currentSpeaker && currentSpeaker.includes('system') ? 'message-speaking' : ''
                        }`}>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 glassmorphism flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-sm">
                                {msg.sender === 'system' ? '⚙️' : '⚔️'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="glassmorphism rounded-2xl p-4">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <span className="text-white font-semibold text-sm">
                                    {msg.sender === 'system' ? 'System' : msg.sender}
                                  </span>
                                  {!autoPlayVoice && (
                                    <button
                                      onClick={() => {
                                        if (!audioMuted) {
                                          playVoice(msg.text, msg.sender === 'Cha Hae-In' ? 'cha-hae-in' : 'system', audioMuted);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-white/20"
                                      title="Play voice"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                      </svg>
                                    </button>
                                  )}
                                </div>
                                <div className="text-white text-sm leading-relaxed">{msg.text}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Chat Messages - Full Width Design with iMessage-style animations */}
                      {getDisplayMessages().map((msg: any, index) => {
                        const opacity = getMessageOpacity(msg.timestamp, msg.id);
                        const isPlayer = msg.sender === 'player';
                        const isHaeIn = msg.sender === 'Cha Hae-In';
                        const messageState = messageStates[index] || 'hidden';
                        
                        // Apply iMessage-style animation classes
                        const animationClass = messageState === 'entering' ? 'message-entering' :
                                             messageState === 'staying' ? 'message-staying' :
                                             messageState === 'exiting' ? 'message-exiting' :
                                             'opacity-0';

                        // Apply speaking glow effects based on current speaker
                        const isSpeaking = currentSpeaker && (
                          (isHaeIn && currentSpeaker.includes('cha-hae-in')) ||
                          (isPlayer && currentSpeaker.includes('player')) ||
                          (msg.sender === 'System' && currentSpeaker.includes('system'))
                        );
                        
                        const speakingClass = isSpeaking ? 
                          (isHaeIn ? 'message-speaking-cha-hae-in' : 
                           isPlayer ? 'message-speaking' : 
                           'message-speaking') : '';
                        
                        return (
                          <div 
                            key={msg.id}
                            data-message-id={msg.id}
                            className={`chat-message message-bubble ${animationClass} ${speakingClass} mb-4`}
                            style={{ opacity: messageState === 'hidden' ? 0 : opacity }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full glassmorphism flex items-center justify-center flex-shrink-0 ${
                                isPlayer 
                                  ? 'bg-gradient-to-br from-blue-600 to-purple-700' 
                                  : isHaeIn 
                                    ? 'bg-gradient-to-br from-pink-500 to-rose-600' 
                                    : 'bg-gradient-to-br from-gray-500 to-gray-700'
                              }`}>
                                <span className="text-white text-sm font-bold">
                                  {isPlayer ? '🦸' : isHaeIn ? '👸' : '⚡'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="glassmorphism rounded-2xl p-4">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="text-white font-semibold text-sm">{msg.sender}</span>
                                    {!autoPlayVoice && (isHaeIn || msg.sender === 'System') && (
                                      <button
                                        onClick={() => playVoice(msg.text, isHaeIn ? 'cha-hae-in' : 'system')}
                                        className="w-6 h-6 rounded-full flex items-center justify-center transition-all bg-white/10 hover:bg-white/20"
                                        title="Play voice"
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-white text-sm leading-relaxed">{msg.text}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Chat History Access Hint */}
                      {chatMessages.length > 3 && (
                        <div className="text-center py-2">
                          <div className="text-xs text-white/40">Scroll up to see chat history</div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* New Combined Chat and Actions Panel */}
                <div className="absolute bottom-0 left-0 right-0 z-50">
                  {/* Action Pills - Above Stats */}
                  {currentStory?.choices && currentStory.choices.length > 0 && (
                    <div className="px-4 pb-3">
                      <div className="flex flex-wrap gap-2 justify-center max-w-full">
                        {currentStory.choices.map((choice, index) => (
                          <button
                            key={index}
                            onClick={() => handleChoice(choice)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 glassmorphism-choice hover:glassmorphism-choice-hover rounded-full px-4 py-2 text-white text-sm font-medium transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed max-w-xs"
                            title={choice.detail}
                          >
                            <span className="text-base">⚡</span>
                            <span className="truncate">{choice.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mobile Stats Bar - Below Action Pills */}
                  <div className="glassmorphism px-4 py-2">
                    <div className="flex items-center justify-between">
                      {/* Left Stats */}
                      <div className="flex items-center gap-4">
                        {/* Level */}
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">⭐</span>
                          <span className="text-white text-xs font-medium">{gameState.level}</span>
                        </div>
                        
                        {/* Health */}
                        <div className="flex items-center gap-1">
                          <span className="text-red-400 text-xs">❤️</span>
                          <div className="w-8 h-1 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-red-500 transition-all duration-500"
                              style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Mana */}
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400 text-xs">💎</span>
                          <div className="w-8 h-1 bg-black/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${(gameState.mana / gameState.maxMana) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Stats */}
                      <div className="flex items-center gap-4">
                        {/* Gold */}
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-xs">Gold:</span>
                          <span className="text-white text-xs font-medium">{gameState.gold || 500}</span>
                        </div>
                        
                        {/* Audio Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (audioMuted) {
                                setAudioMuted(false);
                                setAutoPlayVoice(true);
                              } else if (autoPlayVoice) {
                                setAutoPlayVoice(false);
                              } else {
                                setAudioMuted(true);
                                stopVoice(); // Stop any currently playing audio
                              }
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                              audioMuted 
                                ? 'bg-red-600/90 text-white' 
                                : autoPlayVoice
                                ? 'bg-blue-600/90 text-white'
                                : 'bg-gray-600/90 text-white'
                            }`}
                            title={
                              audioMuted 
                                ? 'Audio Muted - Click to Enable Auto-Play' 
                                : autoPlayVoice
                                ? 'Auto-Play Voice Enabled - Click to Disable'
                                : 'Voice Disabled - Click to Mute All Audio'
                            }
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              {audioMuted ? (
                                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                              ) : (
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                              )}
                            </svg>
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Chat Input Bar */}
                  <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-4">
                    <div className="flex items-center gap-3">
                      {/* Chat Input */}
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={handleChatKeyPress}
                          placeholder="Chat with Cha Hae-In..."
                          disabled={isLoading}
                          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2.5 text-white placeholder-white/60 focus:outline-none focus:border-white/40 transition-all disabled:opacity-50"
                        />
                      </div>

                      {/* Send Button */}
                      <button
                        onClick={handleChatSubmit}
                        disabled={isLoading || !chatInput.trim()}
                        className="w-10 h-10 bg-blue-600/90 backdrop-blur-xl border border-blue-400/30 rounded-full flex items-center justify-center text-white hover:bg-blue-500/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="m22 2-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar - Clean text input only */}
                <div className="absolute bottom-0 left-0 right-0 z-50 p-3 bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-lg flex items-center gap-3">
                  <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full h-11 flex items-center px-1 shadow-lg">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                      placeholder={inputMode === 'speak' ? "Talk to Cha Hae-In..." : "What do you do?"}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none text-white text-sm outline-none px-4 disabled:opacity-50 placeholder-white/50"
                    />
                    {isLoading && inputMode === 'speak' && (
                      <div className="px-2">
                        <div className="w-4 h-4 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                      </div>
                    )}
                    {speechToTextEnabled && (
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border border-white/20 shadow-lg touch-manipulation mr-2 ${
                          isRecording 
                            ? 'bg-red-600/90 hover:bg-red-500/90 animate-pulse' 
                            : 'bg-blue-600/90 hover:bg-blue-500/90'
                        }`}
                        title={isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                      >
                        {isRecording ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="2"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C10.34 2 9 3.34 9 5v6c0 1.66 1.34 3 3 3s3-1.34 3-3V5c0-1.66-1.34-3-3-3z"/>
                            <path d="M19 11c0 4.97-4.03 9-9 9s-9-4.03-9-9h2c0 3.87 3.13 7 7 7s7-3.13 7-7h2z"/>
                            <path d="M10 20h4v2h-4v-2z"/>
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setInputMode(inputMode === 'speak' ? 'action' : 'speak')}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-xl border border-white/20 shadow-lg touch-manipulation ${
                        inputMode === 'speak' 
                          ? 'bg-pink-600/90 hover:bg-pink-500/90' 
                          : 'bg-purple-600/90 hover:bg-purple-500/90'
                      }`}
                      title={inputMode === 'speak' ? 'Switch to Action Mode' : 'Switch to Chat Mode'}
                    >
                      {inputMode === 'speak' ? '💬' : '⚔️'}
                    </button>
                  </div>
                  <button 
                    onClick={handleUserInput}
                    disabled={!userInput.trim() || isLoading}
                    className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all text-white backdrop-blur-xl border border-white/20 shadow-lg touch-manipulation ${
                      userInput.trim() && !isLoading
                        ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 hover:from-purple-700/90 hover:to-pink-700/90'
                        : 'bg-white/10 cursor-not-allowed opacity-50'
                    }`}
                    title="Send Message"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="m22 2-7 20-4-9-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m22 2-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Character Profile Modal */}
        <CharacterProfile
          isVisible={showCharacterProfile}
          onClose={() => setShowCharacterProfile(false)}
          gameState={gameState}
          equippedGear={playerEquippedGear}
          shadowArmy={shadowArmy}
          onStatIncrease={(stat: string) => {
            if (gameState.statPoints && gameState.statPoints > 0) {
              setGameState(prev => ({
                ...prev,
                statPoints: (prev.statPoints || 0) - 1,
                stats: {
                  ...prev.stats,
                  [stat]: (prev.stats?.[stat] || 10) + 1
                } as any
              }));
            }
          }}
          onSkillUpgrade={(skillId) => {
            if (gameState.skillPoints && gameState.skillPoints > 0) {
              setGameState(prev => ({
                ...prev,
                skillPoints: (prev.skillPoints || 0) - 1,
                skills: (prev.skills || []).map(skill =>
                  skill.id === skillId 
                    ? { ...skill, level: Math.min(skill.maxLevel, skill.level + 1) }
                    : skill
                )
              }));
            }
          }}
        />

        {/* Enhanced Inventory System */}
        <InventorySystem
          isVisible={showInventory}
          onClose={() => setShowInventory(false)}
          items={playerInventory}
          equippedGear={playerEquippedGear}
          availableEquipment={availableEquipment}
          onItemUse={(item) => {
            if (item.usableInCombat && gameState.inCombat) {
              // Handle combat item usage
              if (item.id === 'health_potion') {
                setGameState(prev => ({
                  ...prev,
                  health: Math.min(prev.maxHealth, prev.health + 50)
                }));
              } else if (item.id === 'mana_potion') {
                setGameState(prev => ({
                  ...prev,
                  mana: Math.min(prev.maxMana, prev.mana + 30)
                }));
              } else if (item.id === 'strength_potion') {
                addChatMessage('System', 'You feel a surge of power! Attack increased for this battle.');
              }
              
              // Remove item from inventory
              setPlayerInventory(prev => 
                prev.map(invItem => 
                  invItem.id === item.id 
                    ? { ...invItem, quantity: invItem.quantity - 1 }
                    : invItem
                ).filter(invItem => invItem.quantity > 0)
              );
              
              addChatMessage('System', `Used ${item.name}!`);
            }
          }}
          playerGold={playerGold}
        />

        {/* Skill Tree Modal */}
        <SkillTree
          gameState={gameState as any}
        onUpgradeSkill={(skillId) => {
          characterProgression.upgradeSkill(skillId);
          // Update local state for immediate feedback
          setGameState(prev => ({
            ...prev,
            skillPoints: (prev.skillPoints || 0) - 1,
            skills: prev.skills?.map(skill => 
              skill.id === skillId 
                ? { ...skill, level: skill.level + 1 }
                : skill
            ) || []
          }));
        }}
        onAllocateStat={(stat) => {
          characterProgression.allocateStat(stat);
          // Update local state for immediate feedback
          setGameState(prev => ({
            ...prev,
            statPoints: (prev.statPoints || 0) - 1,
            stats: {
              ...prev.stats,
              [stat]: (prev.stats?.[stat] || 0) + 1
            }
          }));
        }}
        onLevelUp={() => {
          characterProgression.levelUp();
          const expNeeded = gameState.level * 100;
          setGameState(prev => ({
            ...prev,
            level: prev.level + 1,
            experience: (prev.experience || 0) - expNeeded,
            statPoints: (prev.statPoints || 0) + 5,
            skillPoints: (prev.skillPoints || 0) + 1,
            maxHealth: prev.maxHealth + 20,
            maxMana: prev.maxMana + 10,
            health: prev.maxHealth + 20,
            mana: prev.maxMana + 10
          }));
        }}
        isVisible={showSkillTree}
        onClose={() => setShowSkillTree(false)}
      />

      {/* Chat Tutorial Modal */}
      {showChatTutorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 max-w-[90%] border border-blue-500/30">
            <div className="text-lg font-semibold mb-5 text-white">💡 Enhanced Chat System</div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">🔮 AI-Powered Conversations</h3>
                <p>Your Gemini API key enables dynamic conversations with Cha Hae-In. She responds intelligently based on your affection level and story context.</p>
              </div>
              
              <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
                <h3 className="text-pink-400 font-semibold mb-2">💬 Chat Mode</h3>
                <p>Click the pink chat button to enter conversation mode. Ask Cha Hae-In anything - about missions, her feelings, or just casual talk.</p>
              </div>
              
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-400 font-semibold mb-2">⚔️ Action Mode</h3>
                <p>Use the purple action button for gameplay actions like using shadow skills or exploring the environment.</p>
              </div>
              
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-2">❤️ Affection System</h3>
                <p>Positive conversations increase Cha Hae-In's affection. Her responses become warmer as your relationship develops.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowChatTutorial(false)}
              className="w-full mt-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Combat Mini-Games */}
      {activeMiniGame === 'lockpicking' && (
        <LockPickingGame
          onComplete={handleMiniGameComplete}
          onCancel={() => {
            setActiveMiniGame(null);
            setPendingChoice(null);
          }}
        />
      )}

      {activeMiniGame === 'runes' && (
        <RuneSequenceGame
          onComplete={handleMiniGameComplete}
          onCancel={() => {
            setActiveMiniGame(null);
            setPendingChoice(null);
          }}
        />
      )}

      {activeMiniGame === 'dragon' && (
        <DragonEncounterGame
          onComplete={handleMiniGameComplete}
          onCancel={() => {
            setActiveMiniGame(null);
            setPendingChoice(null);
          }}
        />
      )}





      {/* Raid System Modal */}
      <RaidSystem
        isVisible={showRaidSystem}
        onClose={() => setShowRaidSystem(false)}
        onVictory={(rewards) => {
          setGameState(prev => ({
            ...prev,
            gold: (prev.gold || 500) + rewards.gold,
            experience: (prev.experience || 0) + rewards.exp,
            affection: Math.min(5, prev.affection + rewards.affection / 100),
            skillPoints: (prev.skillPoints || 0) + rewards.skillPoints,
            statPoints: (prev.statPoints || 0) + rewards.statPoints
          }));
          
          addChatMessage('System', `Raid complete! Earned ${rewards.gold} gold, ${rewards.exp} EXP, ${rewards.skillPoints} skill points, and ${rewards.statPoints} stat points!`);
          setShowRaidSystem(false);
        }}
        playerLevel={gameState.level}
        affectionLevel={gameState.affection}
      />

      {/* Daily Life Hub Modal */}
      <DailyLifeHubModal
        isVisible={showDailyLifeHub}
        onClose={() => setShowDailyLifeHub(false)}
        audioMuted={audioMuted}
        onActivitySelect={(activity) => {
          // Set as active activity for continuous interaction
          setActiveActivity(activity);
          
          // Handle intimate activities
          const intimateActivities = ['shower_together', 'cuddle_together', 'bedroom_intimacy', 'make_love'];
          if (intimateActivities.includes(activity.id)) {
            setCurrentIntimateActivity(activity.id);
            setCurrentActivityContext(activity.id);
            setShowIntimateActivity(true);
            setShowDailyLifeHub(false);
            return;
          }
          
          // Handle special combat activities
          if (activity.id === 'dungeon_raid') {
            setShowDungeonRaid(true);
            setShowDailyLifeHub(false);
            return;
          } else if (activity.id === 'shadow_training') {
            setShowShadowArmy(true);
            setShowDailyLifeHub(false);
            return;
          }
          
          // Handle regular activity selection with chat response
          const activityDialogue = getActivityDialogue(activity);
          addChatMessage('Cha Hae-In', activityDialogue);
          
          // Update stats based on activity
          setGameState(prev => ({
            ...prev,
            affection: Math.min(5, prev.affection + (activity.affectionReward || 0) / 10),
            experience: (prev.experience || 0) + (activity.experienceReward || 0),
            gold: (prev.gold || 500) + (activity.goldReward || 0)
          }));
          
          setShowDailyLifeHub(false);
        }}
        onImageGenerated={(imageUrl) => {
          setCurrentBackground(imageUrl);
          setSceneBackground(imageUrl);
        }}
        gameState={gameState}
      />

      {/* Enhanced Combat System */}
      {showCombatSystem && currentCombatEnemy && (
        <CombatSystem
          isVisible={showCombatSystem}
          onCombatEnd={(result: 'victory' | 'defeat', rewards?: any) => {
            setShowCombatSystem(false);
            setCurrentCombatEnemy(null);
            
            if (result === 'victory') {
              trackCombatWin();
              
              if (rewards) {
                setGameState(prev => ({
                  ...prev,
                  experience: (prev.experience || 0) + rewards.experience,
                  gold: (prev.gold || 500) + rewards.gold
                }));
                
                if (rewards.shadowSoldier) {
                  trackShadowExtraction();
                  addChatMessage('System', `Shadow extraction successful! ${rewards.shadowSoldier.name} has joined your army.`);
                }
                
                addChatMessage('System', `Victory! Gained ${rewards.experience} EXP and ${rewards.gold} gold.`);
              }
            } else {
              addChatMessage('System', 'Defeat... You retreat to safety.');
            }
          }}
          playerLevel={gameState.level}
          playerStats={{
            ...gameState,
            stats: {
              ...gameState.stats,
              strength: totalStats.totalStrength,
              agility: totalStats.totalAgility,
              intelligence: totalStats.totalIntelligence,
              vitality: totalStats.totalVitality
            },
            attack: totalStats.totalAttack,
            defense: totalStats.totalDefense
          }}
          enemy={currentCombatEnemy}
        />
      )}

      {/* Achievement System */}
      {showAchievementSystem && (
        <AchievementSystem
          isVisible={showAchievementSystem}
          onClose={() => setShowAchievementSystem(false)}
          playerStats={{
            affectionLevel: Math.floor(gameState.affection * 20),
            combatWins: achievementStats.combatWins,
            shadowSoldiers: achievementStats.shadowSoldiers,
            scenesUnlocked: achievementStats.scenesUnlocked,
            optimalChoices: achievementStats.optimalChoices,
            storyProgress: achievementStats.storyProgress
          }}
          onAchievementUnlock={(achievement: any) => {
            addChatMessage('System', `🏆 Achievement Unlocked: ${achievement.title}!`);
            
            if (achievement.rewards?.unlockedScenes) {
              achievement.rewards.unlockedScenes.forEach((scene: string) => {
                trackSceneUnlock();
              });
            }
            
            if (achievement.rewards?.experience) {
              setGameState(prev => ({
                ...prev,
                experience: (prev.experience || 0) + achievement.rewards.experience
              }));
            }
          }}
        />
      )}

      {/* Relationship System Display */}
      {showRelationshipSystem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-300">Relationship Status</h2>
              <button 
                onClick={() => setShowRelationshipSystem(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <RelationshipSystem
              isVisible={true}
              onClose={() => setShowRelationshipSystem(false)}
              onMemoryLaneOpen={() => {
                setShowMemoryLane(true);
                setShowRelationshipSystem(false);
              }}
              gameState={{
                affection: gameState.affection,
                level: gameState.level,
                currentScene: gameState.currentScene
              }}
            />
          </div>
        </div>
      )}

      {/* Memory Lane Animation */}
      {showMemoryLane && (
        <MemoryLaneAnimation
          isVisible={showMemoryLane}
          onClose={() => setShowMemoryLane(false)}
          currentAffectionLevel={gameState.affection}
          gameState={{
            affection: gameState.affection,
            level: gameState.level,
            currentScene: gameState.currentScene,
            previousChoices: storyFlags
          }}
        />
      )}

      {/* Affection Increase Indicator */}
      {showAffectionIncrease && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce flex items-center gap-2">
            <span className="text-2xl">💖</span>
            <span className="font-bold">Affection +{affectionIncreaseAmount}</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="text-lg">
                  {i < gameState.affection ? '❤️' : '🤍'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Affection Decrease Indicator */}
      {showAffectionDecrease && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-6 py-3 rounded-full shadow-lg animate-pulse flex items-center gap-2">
            <span className="text-2xl">💔</span>
            <span className="font-bold">Affection -{affectionDecreaseAmount}</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="text-lg">
                  {i < gameState.affection ? '❤️' : '🤍'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dungeon Raid System */}
      <DungeonRaidSystem
        isVisible={showDungeonRaid}
        onClose={() => setShowDungeonRaid(false)}
        playerLevel={gameState.level}
        shadowArmy={shadowArmy}
        onShadowGain={(shadow) => {
          setShadowArmy(prev => [...prev, shadow]);
          addChatMessage('System', `New shadow extracted: ${shadow.name}!`);
        }}
        onExperienceGain={(exp) => {
          setPlayerExperience(prev => prev + exp);
          setGameState(prev => ({
            ...prev,
            experience: (prev.experience || 0) + exp
          }));
        }}
      />

      {/* Shadow Army Manager */}
      <ShadowArmyManager
        isVisible={showShadowArmy}
        onClose={() => setShowShadowArmy(false)}
        shadowArmy={shadowArmy}
        onShadowUpdate={setShadowArmy}
        playerLevel={gameState.level}
        availableMaterials={[
          { name: 'Shadow Essence', quantity: 15 },
          { name: 'Dark Crystal', quantity: 8 },
          { name: 'Soul Fragment', quantity: 22 }
        ]}
      />

      {/* Equipment System */}
      <EquipmentSystem
        isVisible={showEquipmentSystem}
        onClose={() => setShowEquipmentSystem(false)}
        playerLevel={gameState.level}
        equippedGear={playerEquippedGear}
        availableEquipment={availableEquipment}
        playerStats={{
          level: gameState.level,
          health: gameState.health,
          maxHealth: gameState.maxHealth,
          mana: gameState.mana,
          maxMana: gameState.maxMana,
          stats: gameState.stats || {
            strength: 10,
            agility: 10,
            intelligence: 10,
            vitality: 10
          }
        }}
        onEquip={(equipment) => {
          console.log('Equipping item:', equipment.name, 'to slot:', equipment.slot);
          const slot = equipment.slot as keyof EquippedGear;
          
          // If something is already equipped in this slot, unequip it first
          const currentlyEquipped = playerEquippedGear[slot];
          if (currentlyEquipped) {
            console.log('Unequipping current item:', currentlyEquipped.name);
            // Remove current equipment stats
            const currentStats = currentlyEquipped.stats;
            setGameState(prev => ({
              ...prev,
              maxHealth: Math.max(100, prev.maxHealth - (currentStats.health || 0)),
              health: Math.max(1, prev.health - (currentStats.health || 0)),
              maxMana: Math.max(50, prev.maxMana - (currentStats.mana || 0)),
              mana: Math.max(0, prev.mana - (currentStats.mana || 0))
            }));
          }
          
          // Equip new item
          setPlayerEquippedGear(prev => {
            const newGear = {
              ...prev,
              [slot]: equipment
            };
            console.log('New equipped gear:', newGear);
            return newGear;
          });
          
          // Remove item from available equipment
          setAvailableEquipment(prev => {
            const filtered = prev.filter(item => item.id !== equipment.id);
            console.log('Available equipment after removal:', filtered.length, 'items');
            return filtered;
          });
          
          // Add previously equipped item back to available equipment if it exists
          if (currentlyEquipped) {
            setAvailableEquipment(prev => [...prev, currentlyEquipped]);
          }
          
          // Apply new equipment stats
          const stats = equipment.stats;
          setGameState(prev => ({
            ...prev,
            maxHealth: prev.maxHealth + (stats.health || 0),
            health: prev.health + (stats.health || 0),
            maxMana: prev.maxMana + (stats.mana || 0),
            mana: prev.mana + (stats.mana || 0)
          }));
          
          addChatMessage('System', `Equipped ${equipment.name}! Attack +${stats.attack || 0}, Defense +${stats.defense || 0}`);
        }}
        onUnequip={(slot) => {
          const unequipped = playerEquippedGear[slot as keyof EquippedGear];
          if (unequipped) {
            // Remove from equipped gear
            setPlayerEquippedGear(prev => ({
              ...prev,
              [slot]: undefined
            }));
            
            // Add back to available equipment if not already there
            setAvailableEquipment(prev => {
              const exists = prev.some(item => item.id === unequipped.id);
              if (!exists) {
                return [...prev, unequipped];
              }
              return prev;
            });
            
            // Remove equipment bonuses
            const stats = unequipped.stats;
            setGameState(prev => ({
              ...prev,
              maxHealth: Math.max(100, prev.maxHealth - (stats.health || 0)),
              health: Math.max(1, prev.health - (stats.health || 0)),
              maxMana: Math.max(50, prev.maxMana - (stats.mana || 0)),
              mana: Math.max(0, prev.mana - (stats.mana || 0))
            }));
            
            addChatMessage('System', `Unequipped ${unequipped.name}. It's now available in your inventory.`);
          }
        }}
      />

      {/* Gift System */}
      <GiftSystem
        isVisible={showGiftSystem}
        onClose={() => setShowGiftSystem(false)}
        playerGold={gameState.gold || 0}
        currentAffection={gameState.affection}
        currentIntimacy={intimacyLevel}
        onPurchaseGift={(gift) => {
          if ((gameState.gold || 0) >= gift.price) {
            // Deduct gold but don't apply affection yet - wait for gift presentation
            setGameState(prev => ({
              ...prev,
              gold: (prev.gold || 0) - gift.price
            }));
            
            // Calculate proper affection gain with guaranteed minimum
            let calculatedAffectionGain = gift.affectionGain;
            if (!calculatedAffectionGain || calculatedAffectionGain <= 0) {
              calculatedAffectionGain = Math.max(2, Math.floor(gift.price / 1000));
              if (calculatedAffectionGain <= 0) {
                calculatedAffectionGain = gift.price >= 5000 ? 5 : gift.price >= 2000 ? 3 : 2;
              }
            }
            
            // Show gift presentation modal with calculated affection
            setSelectedGift({
              id: gift.id,
              name: gift.name,
              description: gift.description,
              price: gift.price,
              rarity: gift.rarity,
              type: 'gift',
              category: 'gifts',
              icon: '🎁',
              affectionGain: calculatedAffectionGain,
              intimacyGain: gift.intimacyGain || 1,
              chaHaeInReaction: gift.chaHaeInReaction
            } as ShopItem);
            setShowGiftGiving(true);
          }
        }}
      />

      {/* Gift Presentation Modal */}
      {showGiftGiving && selectedGift && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-md rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎁</span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Present Gift</h2>
              <p className="text-purple-200 mb-4">Give this gift to Cha Hae-In?</p>
              
              <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedGift.name}</h3>
                <p className="text-gray-300 text-sm mb-2">{selectedGift.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-purple-300">Value: {selectedGift.price} gold</span>
                  <span className="text-pink-300 capitalize">{selectedGift.rarity} quality</span>
                  <span className="text-green-300">Affection: +{selectedGift?.affectionGain ?? 2}</span>
                  <span className="text-blue-300">Intimacy: +{selectedGift?.intimacyGain ?? 1}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGiftGiving(false);
                    setSelectedGift(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-xl transition-all border border-gray-500/30"
                >
                  Cancel
                </button>
                <button
                  onClick={() => presentGiftToChaHaeIn(selectedGift)}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl transition-all shadow-lg transform hover:scale-105"
                >
                  Give Gift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Intimate Activity Modal */}
      <IntimateActivityModal
        isVisible={showIntimateActivity}
        onClose={() => {
          setShowIntimateActivity(false);
          setCurrentIntimateActivity(null);
          setCurrentActivityContext(null);
          setIntimateActivityResponse('');
        }}
        onReturnToHub={() => {
          setShowIntimateActivity(false);
          setCurrentIntimateActivity(null);
          setCurrentActivityContext(null);
          setIntimateActivityResponse('');
          setShowDailyLifeHub(true);
        }}
        activityType={currentIntimateActivity as any}
        onAction={async (action: string, isCustom?: boolean) => {
          // Generate AI response for the intimate action
          try {
            const context = currentActivityContext || 'intimate_moment';
            const prompt = isCustom 
              ? `In the context of ${context}, respond to: "${action}". Cha Hae-In's response should be intimate, loving, and appropriate for the situation.`
              : `In the context of ${context}, respond to the action: "${action}". Generate Cha Hae-In's intimate response.`;

            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: prompt,
                gameState: {
                  ...gameState,
                  currentScene: context,
                  intimacyLevel,
                  affectionLevel: gameState.affection
                }
              })
            });

            if (response.ok) {
              const data = await response.json();
              setIntimateActivityResponse(data.response);
              
              // Increase intimacy and affection
              setIntimacyLevel(prev => Math.min(100, prev + 2));
              setGameState(prev => ({
                ...prev,
                affection: Math.min(5, prev.affection + 0.1)
              }));

              // Auto-generate scene image for intimate actions
              setTimeout(() => {
                fetch('/api/generate-intimate-image', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    activityId: currentIntimateActivity || 'custom_intimate',
                    relationshipStatus: gameState.affection >= 5 ? 'married' : 'dating',
                    intimacyLevel,
                    specificAction: action
                  })
                })
                .then(res => res.json())
                .then(imageData => {
                  if (imageData.imageUrl) {
                    setCurrentBackground(imageData.imageUrl);
                    setSceneBackground(imageData.imageUrl);
                  }
                })
                .catch(err => console.log('Auto scene generation skipped:', err.message));
              }, 1000);

            } else {
              throw new Error(`API response ${response.status}`);
            }

          } catch (error) {
            console.error('Error generating intimate response:', error);
            setIntimateActivityResponse("*moves closer with loving eyes* Jin-Woo... I love spending this intimate time with you.");
          }
        }}
        onImageGenerate={async (prompt: string) => {
          // Context-aware image generation that stays within the current activity
          try {
            const contextualPrompt = `${prompt}. Context: ${currentActivityContext}. Jin-Woo and Cha Hae-In in intimate moment within this specific setting. Maintain scene continuity, romantic atmosphere, Solo Leveling anime art style.`;
            
            const response = await fetch('/api/generate-scene-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                gameState: {
                  ...gameState,
                  currentScene: currentActivityContext,
                  prompt: contextualPrompt
                }
              })
            });

            const data = await response.json();
            if (data.imageUrl) {
              setSceneBackground(data.imageUrl);
            }
          } catch (error) {
            console.error('Error generating contextual image:', error);
          }
        }}
        currentResponse={intimateActivityResponse}
        intimacyLevel={intimacyLevel}
        affectionLevel={gameState.affection * 20}
      />

      {/* Unified Shop */}
      <UnifiedShop
        isVisible={showUnifiedShop}
        onClose={() => setShowUnifiedShop(false)}
        playerGold={playerGold}
        playerLevel={gameState.level}
        currentAffection={gameState.affection}
        currentIntimacy={intimacyLevel}
        onPurchase={handleUnifiedShopPurchase}
      />

      {/* Developer Controls Panel */}
      {showDevControls && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-purple-400/30 shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Developer Controls</h3>
              <button
                onClick={() => setShowDevControls(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Affection Control */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  Set Affection Level (0-5):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={affectionInput}
                    onChange={(e) => setAffectionInput(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="Enter 0-5"
                  />
                  <button
                    onClick={() => {
                      const value = parseFloat(affectionInput);
                      if (!isNaN(value) && value >= 0 && value <= 5) {
                        setGameState(prev => ({ ...prev, affection: value }));
                        setAffectionInput('');
                        triggerAffectionSparkle();
                      }
                    }}
                    className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Set
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Current: {gameState.affection.toFixed(1)}
                </div>
              </div>

              {/* Level Control */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  Set Player Level:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={levelInput}
                    onChange={(e) => setLevelInput(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="Enter level"
                  />
                  <button
                    onClick={() => {
                      const value = parseInt(levelInput);
                      if (!isNaN(value) && value >= 1 && value <= 100) {
                        setGameState(prev => ({ ...prev, level: value }));
                        setLevelInput('');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Set
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Current: {gameState.level}
                </div>
              </div>

              {/* Gold Control */}
              <div>
                <label className="text-gray-300 text-sm block mb-2">
                  Set Gold Amount:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={goldInput}
                    onChange={(e) => setGoldInput(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                    placeholder="Enter gold"
                  />
                  <button
                    onClick={() => {
                      const value = parseInt(goldInput);
                      if (!isNaN(value) && value >= 0) {
                        setPlayerGold(value);
                        setGoldInput('');
                      }
                    }}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
                  >
                    Set
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Current: {playerGold}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setGameState(prev => ({ ...prev, affection: 5 }));
                    triggerAffectionSparkle();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  Max Love
                </button>
                <button
                  onClick={() => {
                    setPlayerGold(999999);
                  }}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs transition-colors"
                >
                  Rich Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

