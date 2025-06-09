import { useState, useEffect, useRef } from "react";
import { SkillTree } from "@/components/SkillTree";
import { useCharacterProgression } from "@/hooks/useCharacterProgression";
import { useVoice } from "@/hooks/useVoice";
import { useStoryNarration } from "@/hooks/useStoryNarration";
import { LockPickingGame, RuneSequenceGame, DragonEncounterGame } from "@/components/MiniGames";
import { DailyLifeHubModal } from "@/components/DailyLifeHubModal";
import { RaidSystem } from "@/components/RaidSystem";
import { Marketplace } from "../components/Marketplace";
import { RelationshipSystem } from "@/components/RelationshipSystem";
import { MemoryLaneAnimation } from "@/components/MemoryLaneAnimation";
import { CombatSystem } from "@/components/CombatSystem";
import { AchievementSystem, useAchievementSystem } from "@/components/AchievementSystem";
import { CharacterProfile } from "@/components/CharacterProfile";
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
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [chatPinned, setChatPinned] = useState(false);
  const [autoMessageVisible, setAutoMessageVisible] = useState(true);
  const [autoHiddenMessages, setAutoHiddenMessages] = useState<Set<number>>(new Set());
  const [showDailyLifeHub, setShowDailyLifeHub] = useState(false);
  const [activeActivity, setActiveActivity] = useState<any>(null);
  const [showMarketplace, setShowMarketplace] = useState(false);
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
        critRate: 25,
        critDamage: 50,
        speed: 15
      },
      description: 'Ancient daggers forged in the depths of hell. They hunger for battle and grow stronger with each kill.',
      requirements: { level: 1 }
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
      requirements: { level: 1 }
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
      requirements: { level: 1 }
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
      requirements: { level: 1 }
    },
    {
      id: 'steel_sword',
      name: 'Reinforced Steel Sword',
      type: 'weapon',
      slot: 'weapon',
      rarity: 'rare',
      stats: {
        attack: 120,
        critRate: 10
      },
      description: 'A well-balanced sword made from reinforced steel.',
      requirements: { level: 1 }
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
      requirements: { level: 1 }
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

  const handleUnifiedShopPurchase = (item: ShopItem) => {
    if (playerGold < item.price) {
      return;
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
        stats: item.stats || {},
        description: item.description,
        requirements: item.requirements
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
      
      // Show Cha Hae-In's reaction
      if (item.chaHaeInReaction) {
        setTimeout(() => {
          addChatMessage('Cha Hae-In', item.chaHaeInReaction!);
        }, 1000);
      }
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
      leadsTo: { celebrate_together: 'ROMANTIC_CELEBRATION', return_hub: 'DAILY_LIFE_HUB' }
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
      leadsTo: { boss_preparation: 'BOSS_APPROACH', celebrate_teamwork: 'TEAMWORK_MOMENT' }
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
      leadsTo: { admit_feelings: 'DUNGEON_CONFESSION', rejoin_formation: 'PROTECTIVE_DUNGEON' }
    },
    'INSPIRATION_MOMENT': {
      prompt: "Mutual inspiration between Jin-Woo and Cha Hae-In. Shared admiration, anime style.",
      narration: "The mutual respect and admiration between you creates a powerful moment.",
      chat: [
        { sender: 'Cha Hae-In', text: "We inspire each other to be better. That's... beautiful." },
        { sender: 'player', text: "Together, we're unstoppable." }
      ],
      choices: [
        { text: "Face the boss together", detail: "United front", type: 'united_boss_fight' },
        { text: "Share a meaningful look", detail: "Silent connection", type: 'meaningful_connection' }
      ],
      leadsTo: { united_boss_fight: 'BOSS_APPROACH', meaningful_connection: 'SILENT_BOND' }
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
      leadsTo: { mutual_support: 'SUPPORT_PROMISE', take_hand: 'HAND_HOLDING' }
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
      leadsTo: { perfect_acceptance: 'PERFECT_MOMENT', detailed_appreciation: 'DEEP_APPRECIATION' }
    },
    'INTIMATE_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing intense eye contact. Deep emotional connection, anime style.",
      narration: "Looking into her eyes, you see everything you've been searching for.",
      chat: [
        { sender: 'Cha Hae-In', text: "When you look at me like that... I feel like I could face anything." },
        { sender: 'player', text: "You're my strength, Hae-In." }
      ],
      choices: [
        { text: "Move closer", detail: "Close the distance", type: 'move_closer' },
        { text: "Confess your love", detail: "Express your feelings", type: 'love_confession' }
      ],
      leadsTo: { move_closer: 'INTIMATE_CLOSENESS', love_confession: 'LOVE_DECLARATION' }
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
      leadsTo: { plan_more_dates: 'RELATIONSHIP_BUILDING', mission_as_couple: 'COUPLE_MISSION' }
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
      leadsTo: { heart_strongest: 'HEART_RECOGNITION', complement_each_other: 'PERFECT_MATCH', you_inspire_me: 'MUTUAL_INSPIRATION' }
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
      leadsTo: { follow_lead: 'CAFE_SCENE', suggest_spot: 'YOUR_CHOICE_CAFE', anywhere_perfect: 'ROMANTIC_CAFE' }
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
    'LOVE_DECLARATION': {
      prompt: "Jin-Woo declaring his love for Cha Hae-In. Ultimate confession, anime style.",
      narration: "The words come from the deepest part of your heart.",
      chat: [
        { sender: 'player', text: "I love you, Cha Hae-In. Completely and utterly." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I love you too. More than I ever thought possible." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal the declaration", type: 'sealing_kiss' },
        { text: "Hold her close", detail: "Tender embrace", type: 'tender_hold' }
      ],
      leadsTo: { sealing_kiss: 'LOVE_KISS', tender_hold: 'LOVE_EMBRACE' }
    },
    'LOVE_SEALED': {
      prompt: "Their love officially sealed. Complete romantic union, anime style.",
      narration: "Nothing can separate you now.",
      chat: [
        { sender: 'Cha Hae-In', text: "This feels like a dream come true." },
        { sender: 'player', text: "The best kind of dream - one we're living together." }
      ],
      choices: [
        { text: "Plan our future", detail: "Look ahead together", type: 'plan_future' },
        { text: "Start building a life together", detail: "Begin your shared journey", type: 'daily_life_hub' },
        { text: "Savor this moment", detail: "Stay in the present", type: 'savor_now' }
      ],
      leadsTo: { plan_future: 'FUTURE_PLANNING', daily_life_hub: 'DAILY_LIFE_HUB', savor_now: 'PRESENT_BLISS' }
    },
    'SOUL_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming a soul bond. Spiritual connection, anime style.",
      narration: "Your souls resonate at the same frequency, creating an unbreakable bond.",
      chat: [
        { sender: 'Cha Hae-In', text: "I can feel it... our connection goes deeper than anything physical." },
        { sender: 'player', text: "We're bound now, in every way that matters." }
      ],
      choices: [
        { text: "Promise to protect this bond", detail: "Sacred vow", type: 'protect_bond' },
        { text: "Embrace the eternal connection", detail: "Accept destiny", type: 'embrace_eternal' }
      ],
      leadsTo: { protect_bond: 'BOND_PROTECTION', embrace_eternal: 'ETERNAL_LOVE' }
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
    'ROMANTIC_PROMISE': {
      prompt: "Jin-Woo making a romantic promise to Cha Hae-In. Commitment, anime style.",
      narration: "Your words carry the weight of your entire heart.",
      chat: [
        { sender: 'player', text: "I promise to love you, protect you, and stand by you always." },
        { sender: 'Cha Hae-In', text: "And I promise the same to you. We're in this together, forever." }
      ],
      choices: [
        { text: "Seal it with a kiss", detail: "Physical confirmation", type: 'seal_kiss' },
        { text: "Plan your future together", detail: "Look ahead", type: 'plan_together' }
      ],
      leadsTo: { seal_kiss: 'PROMISE_KISS', plan_together: 'FUTURE_TOGETHER' }
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
    
    // Play voice for character dialogue automatically
    if (sender === 'Cha Hae-In') {
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
            playVoice(nextStory.narration, 'game-master');
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
        playVoice(data.response, 'Cha Hae-In');
        
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
        return; // Early return for successful navigation
      } else {
        console.log('ERROR: Next story scene not found:', nextScene);
        addChatMessage('system', `Navigation error: Scene "${nextScene}" not found`);
      }
    } else {
      console.log('No matching choice found in story navigation, using fallback handling');
      console.log('Available choice types in leadsTo:', Object.keys(currentStory?.leadsTo || {}));
      
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
      'take_hand': 1
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
                <div className="absolute top-16 right-3 z-40 flex flex-col gap-2">
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

                  {/* Marketplace Button - Available after meeting Cha Hae-In */}
                  {gameState.affection >= 1 && (
                    <button 
                      onClick={() => {
                        setPreviousPage('story');
                        setShowMarketplace(true);
                      }}
                      className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-yellow-500/50 transition-all border border-yellow-400/30 shadow-lg"
                      title="Hunter Marketplace"
                    >
                      🛒
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
                    onClick={() => setShowRelationshipSystem(true)}
                    onDoubleClick={() => {
                      console.log('Manual sparkle trigger test');
                      triggerAffectionSparkle();
                    }}
                    className={`w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-pink-500/50 transition-all border border-pink-400/30 shadow-lg ${affectionButtonSparkle ? 'sparkle-effect' : ''}`}
                    title="Relationship Status (Double-click to test sparkle)"
                  >
                    💖
                  </button>

                  {/* Unified Marketplace Button */}
                  <button 
                    onClick={() => setShowUnifiedShop(true)}
                    className="w-10 h-10 glassmorphism rounded-full flex items-center justify-center text-white hover:bg-green-500/50 transition-all border border-green-400/30 shadow-lg"
                    title="Hunter's Marketplace - Weapons, Armor, Gifts & More"
                  >
                    🏪
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
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-white font-semibold text-sm">Narrator</span>
                                  {isPlaying && (
                                    <span className="text-purple-300 text-xs animate-pulse">🎵 Speaking...</span>
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
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-white font-semibold text-sm">
                                    {msg.sender === 'system' ? 'System' : msg.sender}
                                  </span>
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
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-white font-semibold text-sm">{msg.sender}</span>
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
          achievements={achievements}
          onStatPointAllocate={(stat) => {
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



      {/* Marketplace Modal */}
      {showMarketplace && (
        <Marketplace
          isVisible={showMarketplace}
          onClose={() => {
            setShowMarketplace(false);
            // Return to previous page logic
            if (previousPage === 'hub') {
              setShowDailyLifeHub(true);
            }
          }}
          onPurchase={(item, quantity) => {
            const totalCost = item.price * quantity;
            if ((gameState.gold || 500) >= totalCost) {
              setGameState(prev => ({
                ...prev,
                gold: (prev.gold || 500) - totalCost,
                inventory: [
                  ...(prev.inventory || []),
                  {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    type: item.category as any,
                    icon: item.icon,
                    quantity: quantity
                  }
                ]
              }));
              
              addChatMessage('System', `Successfully purchased ${quantity}x ${item.name} for ${totalCost} gold!`);
            } else {
              addChatMessage('System', 'Not enough gold for this purchase.');
            }
          }}
          playerGold={gameState.gold || 500}
          playerLevel={gameState.level}
          affectionLevel={gameState.affection}
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
            setGameState(prev => ({
              ...prev,
              gold: (prev.gold || 0) - gift.price,
              affection: Math.min(100, prev.affection + gift.affectionGain)
            }));
            setIntimacyLevel(prev => Math.min(100, prev + gift.intimacyGain));
            
            // Show gift reaction
            addChatMessage('Cha Hae-In', gift.chaHaeInReaction);
            setShowAffectionIncrease(true);
            setAffectionIncreaseAmount(gift.affectionGain);
            setTimeout(() => setShowAffectionIncrease(false), 3000);
          }
        }}
      />

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

            const data = await response.json();
            setIntimateActivityResponse(data.response);
            
            // Increase intimacy and affection
            setIntimacyLevel(prev => Math.min(100, prev + 2));
            setGameState(prev => ({
              ...prev,
              affection: Math.min(5, prev.affection + 0.1)
            }));

          } catch (error) {
            console.error('Error generating intimate response:', error);
            setIntimateActivityResponse("Cha Hae-In smiles warmly at your gesture, feeling closer to you.");
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
    </div>
  );
}

