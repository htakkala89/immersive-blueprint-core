import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  narration: text("narration").notNull(),
  health: integer("health").notNull().default(100),
  maxHealth: integer("max_health").notNull().default(100),
  mana: integer("mana").notNull().default(50),
  maxMana: integer("max_mana").notNull().default(50),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  statPoints: integer("stat_points").notNull().default(0),
  skillPoints: integer("skill_points").notNull().default(0),
  gold: integer("gold").notNull().default(100),
  affectionLevel: integer("affection_level").notNull().default(0),
  energy: integer("energy").notNull().default(100),
  maxEnergy: integer("max_energy").notNull().default(100),
  relationshipStatus: text("relationship_status").notNull().default("dating"),
  intimacyLevel: integer("intimacy_level").notNull().default(1),
  sharedMemories: integer("shared_memories").notNull().default(0),
  livingTogether: integer("living_together").notNull().default(0), // 0 = false, 1 = true
  daysTogether: integer("days_together").notNull().default(1),
  currentScene: text("current_scene").notNull().default("entrance"),
  choices: jsonb("choices").notNull().$type<Choice[]>(),
  sceneData: jsonb("scene_data").$type<SceneData>(),
  storyPath: text("story_path").notNull().default("entrance"),
  choiceHistory: jsonb("choice_history").notNull().default([]).$type<string[]>(),
  storyFlags: jsonb("story_flags").notNull().default({}).$type<Record<string, boolean>>(),
  inventory: jsonb("inventory").notNull().default([]).$type<z.infer<typeof InventoryItem>[]>(),
  stats: jsonb("stats").notNull().default({}).$type<z.infer<typeof CharacterStats>>(),
  skills: jsonb("skills").notNull().default([]).$type<z.infer<typeof Skill>[]>(),
  scheduledActivities: jsonb("scheduled_activities").notNull().default([]).$type<z.infer<typeof ScheduledActivity>[]>(),
});

export const Choice = z.object({
  id: z.string(),
  icon: z.string(),
  text: z.string(),
  detail: z.string().optional(),
});

export const InventoryItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  type: z.enum(['weapon', 'armor', 'consumable', 'key', 'treasure', 'misc']),
  quantity: z.number().default(1),
});

export const Skill = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['passive', 'active', 'ultimate']),
  level: z.number().default(1),
  maxLevel: z.number().default(10),
  cooldown: z.number().optional(),
  manaCost: z.number().optional(),
  unlocked: z.boolean().default(false),
  prerequisites: z.array(z.string()).default([]),
  effects: z.record(z.number()).default({}),
});

export const CharacterStats = z.object({
  strength: z.number().default(10),
  agility: z.number().default(10),
  intelligence: z.number().default(10),
  vitality: z.number().default(10),
  sense: z.number().default(10),
});

export const SceneData = z.object({
  runes: z.array(z.object({
    x: z.number(),
    y: z.number(),
    isRed: z.boolean(),
    phase: z.number(),
  })),
  particles: z.array(z.object({
    x: z.number(),
    y: z.number(),
    phase: z.number(),
  })),
  imageUrl: z.string().optional(),
});

export const ScheduledActivity = z.object({
  id: z.string(),
  type: z.enum(['dinner', 'coffee', 'raid', 'training', 'shopping', 'movie', 'walk', 'intimate']),
  title: z.string(),
  description: z.string(),
  location: z.string(),
  scheduledTime: z.string(), // ISO date string
  status: z.enum(['proposed', 'confirmed', 'active', 'completed', 'cancelled']),
  participants: z.array(z.string()),
  requirements: z.object({
    affectionLevel: z.number().optional(),
    energy: z.number().optional(),
    gold: z.number().optional(),
  }).optional(),
  rewards: z.object({
    affection: z.number().optional(),
    experience: z.number().optional(),
    gold: z.number().optional(),
    items: z.array(z.string()).optional(),
  }).optional(),
  conversationContext: z.string().optional(),
});

export const ActivityProposal = z.object({
  activityType: z.string(),
  suggestedLocation: z.string().optional(),
  suggestedTime: z.string().optional(),
  userMessage: z.string(),
  chaHaeInResponse: z.string(),
  status: z.enum(['negotiating', 'agreed', 'declined', 'rescheduling']),
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
});

export type Choice = z.infer<typeof Choice>;
export type InventoryItem = z.infer<typeof InventoryItem>;
export type Skill = z.infer<typeof Skill>;
export type CharacterStats = z.infer<typeof CharacterStats>;
export type SceneData = z.infer<typeof SceneData>;
export type ScheduledActivity = z.infer<typeof ScheduledActivity>;
export type ActivityProposal = z.infer<typeof ActivityProposal>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;
