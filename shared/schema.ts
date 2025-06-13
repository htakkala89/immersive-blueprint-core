import { pgTable, text, serial, integer, jsonb, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
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
  apartmentTier: integer("apartment_tier").notNull().default(1),
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
  activeQuests: jsonb("active_quests").notNull().default([]).$type<z.infer<typeof Quest>[]>(),
  completedQuests: jsonb("completed_quests").notNull().default([]).$type<z.infer<typeof Quest>[]>(),
});

// Player Profiles for Save/Load System
export const playerProfiles = pgTable("player_profiles", {
  id: serial("id").primaryKey(),
  profileName: varchar("profile_name", { length: 100 }).notNull(),
  gameStateId: integer("game_state_id").references(() => gameStates.id),
  completedEpisodes: jsonb("completed_episodes").notNull().default([]).$type<string[]>(),
  currentEpisode: text("current_episode"),
  currentEpisodeBeat: integer("current_episode_beat").default(0),
  episodeProgress: jsonb("episode_progress").notNull().default({}).$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastPlayed: timestamp("last_played").defaultNow().notNull(),
  isActive: boolean("is_active").default(false).notNull(),
});

// Episodes Storage
export const episodes = pgTable("episodes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  prerequisite: jsonb("prerequisite").notNull().$type<{ player_level: number; relationship_level: number }>(),
  beats: jsonb("beats").notNull().$type<StoryBeat[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// Episode Progress Tracking
export const episodeProgress = pgTable("episode_progress", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => playerProfiles.id).notNull(),
  episodeId: text("episode_id").references(() => episodes.id).notNull(),
  currentBeat: integer("current_beat").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  playerChoices: jsonb("player_choices").notNull().default({}).$type<Record<string, any>>(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  lastPlayedAt: timestamp("last_played_at").defaultNow().notNull(),
});

// Relations
export const playerProfilesRelations = relations(playerProfiles, ({ one, many }) => ({
  gameState: one(gameStates, {
    fields: [playerProfiles.gameStateId],
    references: [gameStates.id]
  }),
  episodeProgress: many(episodeProgress)
}));

export const episodesRelations = relations(episodes, ({ many }) => ({
  progress: many(episodeProgress)
}));

export const episodeProgressRelations = relations(episodeProgress, ({ one }) => ({
  profile: one(playerProfiles, {
    fields: [episodeProgress.profileId],
    references: [playerProfiles.id]
  }),
  episode: one(episodes, {
    fields: [episodeProgress.episodeId],
    references: [episodes.id]
  })
}));

// Schema types for TypeScript
export type PlayerProfile = typeof playerProfiles.$inferSelect;
export type InsertPlayerProfile = typeof playerProfiles.$inferInsert;
export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = typeof episodes.$inferInsert;
export type EpisodeProgress = typeof episodeProgress.$inferSelect;
export type InsertEpisodeProgress = typeof episodeProgress.$inferInsert;

// Zod schemas for validation
export const insertPlayerProfileSchema = createInsertSchema(playerProfiles).omit({ id: true, createdAt: true, lastPlayed: true });
export const insertEpisodeSchema = createInsertSchema(episodes).omit({ createdAt: true, updatedAt: true });
export const insertEpisodeProgressSchema = createInsertSchema(episodeProgress).omit({ id: true, startedAt: true, lastPlayedAt: true });

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
  type: z.enum(['weapon', 'armor', 'consumable', 'key', 'treasure', 'misc', 'mana_crystal', 'monster_core']),
  quantity: z.number().default(1),
  value: z.number().optional(), // For sellable items like mana crystals and monster cores
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']).optional(),
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
  type: z.enum(['dinner', 'coffee', 'raid', 'training', 'shopping', 'movie', 'walk', 'intimate', 'quest', 'dungeon_clear']),
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

// Quest System Data Types
export const Quest = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  longDescription: z.string(),
  rank: z.enum(['E', 'D', 'C', 'B', 'A', 'S']),
  type: z.enum(['gate_clearance', 'monster_hunt', 'escort', 'investigation', 'emergency']),
  sender: z.string(),
  targetLocation: z.string(),
  objectives: z.array(z.object({
    id: z.string(),
    description: z.string(),
    completed: z.boolean(),
    progress: z.number().optional(),
    target: z.number().optional()
  })),
  rewards: z.object({
    gold: z.number(),
    experience: z.number(),
    items: z.array(z.string()).optional(),
    affection: z.number().optional()
  }),
  timeLimit: z.number().optional(), // hours
  difficulty: z.number().min(1).max(10),
  status: z.enum(['received', 'accepted', 'in_progress', 'completed', 'failed', 'expired']),
  acceptedAt: z.string().optional(), // ISO date string
  completedAt: z.string().optional(), // ISO date string
});

// Episode System Data Types
export const EpisodeAction = z.object({
  command: z.enum([
    "DELIVER_MESSAGE",
    "ACTIVATE_QUEST", 
    "SET_CHA_MOOD",
    "FORCE_CHA_LOCATION",
    "START_DIALOGUE_SCENE",
    "SET_QUEST_OBJECTIVE",
    "SPAWN_LOCATION",
    "REMOVE_CHA_LOCATION_OVERRIDE",
    "COMPLETE_QUEST",
    "REWARD_PLAYER",
    "CREATE_MEMORY_STAR",
    "UNLOCK_ACTIVITY"
  ]),
  params: z.record(z.any()),
});

export const StoryBeat = z.object({
  beat_id: z.number(),
  title: z.string(),
  trigger: z.string(),
  actions: z.array(EpisodeAction),
  completion_condition: z.object({
    event: z.string(),
    params: z.record(z.any()),
  }),
});

export const EpisodeData = z.object({
  id: z.string(),
  title: z.string(),
  prerequisite: z.object({
    player_level: z.number().optional(),
    relationship_level: z.number().optional(),
    completed_quests: z.array(z.string()).optional(),
    flags: z.record(z.boolean()).optional(),
  }),
  beats: z.array(StoryBeat),
});

export const MarketItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  baseValue: z.number(),
  marketValue: z.number(), // Can fluctuate based on demand
  category: z.enum(['mana_crystal', 'monster_core', 'equipment', 'consumable']),
  rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary']),
});

export const WealthTransaction = z.object({
  id: z.string(),
  type: z.enum(['dungeon_reward', 'quest_completion', 'item_sale', 'purchase', 'gift']),
  amount: z.number(),
  description: z.string(),
  timestamp: z.string(),
  relatedItems: z.array(z.string()).optional(),
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
export type Quest = z.infer<typeof Quest>;
export type MarketItem = z.infer<typeof MarketItem>;
export type WealthTransaction = z.infer<typeof WealthTransaction>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;
export type EpisodeAction = z.infer<typeof EpisodeAction>;
export type StoryBeat = z.infer<typeof StoryBeat>;
export type EpisodeData = z.infer<typeof EpisodeData>;
