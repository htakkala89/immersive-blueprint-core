import type { SkillNode } from "@shared/schema";

export const SKILL_TREE_DATA: Record<string, SkillNode> = {
  // Tier 1 - Basic Skills
  shadow_extraction: {
    id: "shadow_extraction",
    name: "Shadow Extraction",
    description: "Extract shadows from defeated enemies to add to your army",
    type: "active",
    tier: 1,
    level: 0,
    maxLevel: 10,
    cooldown: 0,
    manaCost: 50,
    unlocked: true,
    prerequisites: [],
    effects: { shadowCapacity: 5, extractionRate: 75 },
    position: { x: 2, y: 0 },
    icon: "👤",
    category: "shadow"
  },

  dagger_mastery: {
    id: "dagger_mastery",
    name: "Dagger Mastery",
    description: "Increases damage and attack speed with daggers",
    type: "passive",
    tier: 1,
    level: 0,
    maxLevel: 10,
    unlocked: true,
    prerequisites: [],
    effects: { daggerDamage: 15, attackSpeed: 8 },
    position: { x: 0, y: 0 },
    icon: "🗡️",
    category: "combat"
  },

  enhanced_strength: {
    id: "enhanced_strength",
    name: "Enhanced Strength",
    description: "Increases physical damage and carrying capacity",
    type: "passive",
    tier: 1,
    level: 0,
    maxLevel: 10,
    unlocked: true,
    prerequisites: [],
    effects: { physicalDamage: 12, carryingCapacity: 25 },
    position: { x: 4, y: 0 },
    icon: "💪",
    category: "physical"
  },

  // Tier 2 - Intermediate Skills
  stealth: {
    id: "stealth",
    name: "Stealth",
    description: "Become invisible to enemies for a short duration",
    type: "active",
    tier: 2,
    level: 0,
    maxLevel: 10,
    cooldown: 30,
    manaCost: 25,
    unlocked: false,
    prerequisites: ["dagger_mastery"],
    effects: { stealthDuration: 8, movementSpeed: 20 },
    position: { x: 0, y: 1 },
    icon: "🌫️",
    category: "combat"
  },

  shadow_preservation: {
    id: "shadow_preservation",
    name: "Shadow Preservation",
    description: "Allows shadows to remain active even when you're unconscious",
    type: "passive",
    tier: 2,
    level: 0,
    maxLevel: 5,
    unlocked: false,
    prerequisites: ["shadow_extraction"],
    effects: { preservationChance: 60, shadowDuration: 300 },
    position: { x: 1, y: 1 },
    icon: "🛡️",
    category: "shadow"
  },

  shadow_storage: {
    id: "shadow_storage",
    name: "Shadow Storage",
    description: "Store defeated shadows for later summoning",
    type: "passive",
    tier: 2,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    prerequisites: ["shadow_extraction"],
    effects: { storageCapacity: 10, summonCost: -5 },
    position: { x: 3, y: 1 },
    icon: "📦",
    category: "shadow"
  },

  enhanced_agility: {
    id: "enhanced_agility",
    name: "Enhanced Agility",
    description: "Increases movement speed and evasion rate",
    type: "passive",
    tier: 2,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    prerequisites: ["enhanced_strength"],
    effects: { movementSpeed: 15, evasionRate: 10 },
    position: { x: 4, y: 1 },
    icon: "🏃",
    category: "physical"
  },

  // Tier 3 - Advanced Skills
  shadow_exchange: {
    id: "shadow_exchange",
    name: "Shadow Exchange",
    description: "Instantly teleport to any of your shadows",
    type: "active",
    tier: 3,
    level: 0,
    maxLevel: 5,
    cooldown: 15,
    manaCost: 30,
    unlocked: false,
    prerequisites: ["shadow_storage", "stealth"],
    effects: { teleportRange: 100, cooldownReduction: 2 },
    position: { x: 1, y: 2 },
    icon: "⚡",
    category: "shadow"
  },

  shadow_armor: {
    id: "shadow_armor",
    name: "Shadow Armor",
    description: "Summon protective shadow armor that absorbs damage",
    type: "active",
    tier: 3,
    level: 0,
    maxLevel: 10,
    cooldown: 45,
    manaCost: 40,
    unlocked: false,
    prerequisites: ["shadow_preservation"],
    effects: { damageReduction: 25, armorDuration: 60 },
    position: { x: 2, y: 2 },
    icon: "🛡️",
    category: "shadow"
  },

  enhanced_senses: {
    id: "enhanced_senses",
    name: "Enhanced Senses",
    description: "Detect enemies and hidden objects through walls",
    type: "passive",
    tier: 3,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    prerequisites: ["enhanced_agility"],
    effects: { detectionRange: 50, criticalHitRate: 15 },
    position: { x: 4, y: 2 },
    icon: "👁️",
    category: "mental"
  },

  // Tier 4 - Elite Skills
  shadow_army: {
    id: "shadow_army",
    name: "Shadow Army",
    description: "Command multiple shadows simultaneously in battle",
    type: "active",
    tier: 4,
    level: 0,
    maxLevel: 10,
    cooldown: 60,
    manaCost: 80,
    unlocked: false,
    prerequisites: ["shadow_exchange", "shadow_armor"],
    effects: { simultaneousShadows: 5, commandEfficiency: 20 },
    position: { x: 2, y: 3 },
    icon: "👥",
    category: "shadow"
  },

  murderous_intent: {
    id: "murderous_intent",
    name: "Murderous Intent",
    description: "Release killing intent to paralyze weaker enemies",
    type: "active",
    tier: 4,
    level: 0,
    maxLevel: 10,
    cooldown: 30,
    manaCost: 20,
    unlocked: false,
    prerequisites: ["enhanced_senses"],
    effects: { paralysisDuration: 5, intimidationRadius: 30 },
    position: { x: 4, y: 3 },
    icon: "😈",
    category: "mental"
  },

  // Tier 5 - Ultimate Skills
  monarch_domain: {
    id: "monarch_domain",
    name: "Monarch's Domain",
    description: "Create a domain where all shadow abilities are enhanced",
    type: "ultimate",
    tier: 5,
    level: 0,
    maxLevel: 5,
    cooldown: 300,
    manaCost: 200,
    unlocked: false,
    prerequisites: ["shadow_army"],
    effects: { domainRadius: 100, abilityBoost: 100, duration: 30 },
    position: { x: 2, y: 4 },
    icon: "👑",
    category: "shadow"
  },

  shadow_monarch: {
    id: "shadow_monarch",
    name: "Shadow Monarch",
    description: "Unlock the true power of the Shadow Monarch",
    type: "ultimate",
    tier: 5,
    level: 0,
    maxLevel: 1,
    cooldown: 600,
    manaCost: 500,
    unlocked: false,
    prerequisites: ["monarch_domain", "murderous_intent"],
    effects: { allStatsBoost: 200, shadowPowerMultiplier: 300 },
    position: { x: 3, y: 4 },
    icon: "🖤",
    category: "shadow"
  },

  // Job Change Skills
  necromancer: {
    id: "necromancer",
    name: "Necromancer",
    description: "Access to necromancy spells and undead summoning",
    type: "job",
    tier: 1,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    prerequisites: [],
    effects: { undeadSummoning: 1, necromancyPower: 50 },
    position: { x: 6, y: 0 },
    icon: "💀",
    category: "shadow"
  },

  shadow_knight: {
    id: "shadow_knight",
    name: "Shadow Knight",
    description: "Enhanced combat abilities with shadow-infused weapons",
    type: "job",
    tier: 2,
    level: 0,
    maxLevel: 1,
    unlocked: false,
    prerequisites: ["necromancer", "shadow_armor"],
    effects: { shadowWeaponDamage: 100, combatMastery: 75 },
    position: { x: 6, y: 2 },
    icon: "⚔️",
    category: "combat"
  },

  // Leadership Skills
  tactical_command: {
    id: "tactical_command",
    name: "Tactical Command",
    description: "Improve coordination and effectiveness of your shadow army",
    type: "passive",
    tier: 3,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    prerequisites: ["shadow_army"],
    effects: { armyEfficiency: 25, formationBonus: 15 },
    position: { x: 1, y: 3 },
    icon: "📋",
    category: "leadership"
  },

  inspiring_presence: {
    id: "inspiring_presence",
    name: "Inspiring Presence",
    description: "Boost allies' morale and combat effectiveness",
    type: "passive",
    tier: 4,
    level: 0,
    maxLevel: 10,
    unlocked: false,
    prerequisites: ["tactical_command"],
    effects: { allyDamageBoost: 20, allyDefenseBoost: 15 },
    position: { x: 0, y: 4 },
    icon: "✨",
    category: "leadership"
  }
};

export function getSkillRequirementsMet(skillId: string, unlockedSkills: string[]): boolean {
  const skill = SKILL_TREE_DATA[skillId];
  if (!skill) return false;
  
  return skill.prerequisites.every(prereq => unlockedSkills.includes(prereq));
}

export function calculateSkillCost(currentLevel: number, tier: number): number {
  const baseCost = tier;
  return baseCost + Math.floor(currentLevel * 1.5);
}

export function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function getSkillsByCategory(category: string): SkillNode[] {
  return Object.values(SKILL_TREE_DATA).filter(skill => skill.category === category);
}

export function getUnlockedSkills(skillPoints: Record<string, number>): string[] {
  return Object.entries(skillPoints)
    .filter(([_, level]) => level > 0)
    .map(([skillId, _]) => skillId);
}