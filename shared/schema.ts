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
  choices: jsonb("choices").notNull().$type<Choice[]>(),
  sceneData: jsonb("scene_data").$type<SceneData>(),
});

export const Choice = z.object({
  id: z.string(),
  icon: z.string(),
  text: z.string(),
  detail: z.string().optional(),
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

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
});

export type Choice = z.infer<typeof Choice>;
export type SceneData = z.infer<typeof SceneData>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type GameState = typeof gameStates.$inferSelect;
