import { EpisodeData, StoryBeat, EpisodeAction, episodes, Episode, InsertEpisode } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export class EpisodeEngine {
  constructor() {
    this.initializeEpisodes();
  }

  private async initializeEpisodes() {
    // Check if Episode 1 exists in database, if not, create it
    const existingEpisode = await db.select().from(episodes).where(eq(episodes.id, "EP01_Red_Echo"));
    
    if (existingEpisode.length === 0) {
      await this.createDefaultEpisode();
    }
  }

  private async createDefaultEpisode() {
    // Load Episode 1: Echoes of the Red Gate using the JSON format
    const ep01: EpisodeData = {
      id: "EP01_Red_Echo",
      title: "Episode 1: Echoes of the Red Gate",
      prerequisite: {
        player_level: 25,
        relationship_level: 4
      },
      beats: [
        {
          beat_id: 1.0,
          title: "The Ominous Discovery",
          trigger: "initial",
          actions: [
            {
              command: "DELIVER_MESSAGE",
              params: { 
                target_system: 15, 
                sender: "Hunter Association", 
                message_id: "EP01_Alert_Message" 
              }
            },
            {
              command: "ACTIVATE_QUEST",
              params: { 
                quest_id: "EP01_Main_Quest", 
                title: "Investigate the A-Rank Gate Alert." 
              }
            }
          ],
          completion_condition: {
            event: "player_accepts_episode",
            params: { quest_id: "EP01_Main_Quest" }
          }
        },
        {
          beat_id: 1.1,
          title: "A Partner's Fear",
          trigger: "previous_beat_complete",
          actions: [
            {
              command: "SET_CHA_MOOD",
              params: { mood: "Anxious" }
            },
            {
              command: "FORCE_CHA_LOCATION",
              params: { location_id: "Hunter Association HQ" }
            },
            {
              command: "START_DIALOGUE_SCENE",
              params: { dialogue_id: "EP01_Anxious_Convo" }
            }
          ],
          completion_condition: {
            event: "dialogue_scene_complete",
            params: { dialogue_id: "EP01_Anxious_Convo" }
          }
        },
        {
          beat_id: 1.2,
          title: "The Dungeon Objective",
          trigger: "previous_beat_complete",
          actions: [
            {
              command: "SET_QUEST_OBJECTIVE",
              params: { 
                quest_id: "EP01_Main_Quest", 
                objective_text: "Enter the Red Echo Gate with Cha Hae-In." 
              }
            },
            {
              command: "SPAWN_LOCATION",
              params: { 
                target_system: 8, 
                location_id: "dungeon_red_echo", 
                rank: "A-Rank" 
              }
            }
          ],
          completion_condition: {
            event: "player_enters_dungeon",
            params: { dungeon_id: "dungeon_red_echo" }
          }
        },
        {
          beat_id: 1.3,
          title: "The Aftermath",
          trigger: "boss_defeated",
          actions: [
            {
              command: "REMOVE_CHA_LOCATION_OVERRIDE",
              params: {}
            },
            {
              command: "SET_CHA_MOOD",
              params: { mood: "Relieved" }
            },
            {
              command: "START_DIALOGUE_SCENE",
              params: { dialogue_id: "EP01_Aftermath_Convo" }
            }
          ],
          completion_condition: {
            event: "dialogue_scene_complete",
            params: { dialogue_id: "EP01_Aftermath_Convo" }
          }
        },
        {
          beat_id: 1.4,
          title: "Episode Complete",
          trigger: "previous_beat_complete",
          actions: [
            {
              command: "COMPLETE_QUEST",
              params: { quest_id: "EP01_Main_Quest" }
            },
            {
              command: "REWARD_PLAYER",
              params: { rewards: ["Gold:50000000", "Item:Shadow_Elf_Dagger"] }
            },
            {
              command: "CREATE_MEMORY_STAR",
              params: { 
                target_system: 6, 
                star_id: "Red_Gate_Echo_Star", 
                description: "We faced your past together and won.", 
                rank: "S_Rank" 
              }
            },
            {
              command: "UNLOCK_ACTIVITY",
              params: { 
                target_system: 4, 
                activity_id: "Intimate_Activity_Cuddle_All_Morning" 
              }
            }
          ],
          completion_condition: {
            event: "end_episode",
            params: {}
          }
        }
      ]
    };

    // Insert the episode into the database
    await db.insert(episodes).values({
      id: ep01.id,
      title: ep01.title,
      prerequisite: ep01.prerequisite,
      beats: ep01.beats,
      isActive: true
    });
  }

  // Core methods for episode management
  async getAvailableEpisodes(): Promise<EpisodeData[]> {
    const dbEpisodes = await db.select().from(episodes).where(eq(episodes.isActive, true));
    return dbEpisodes.map(ep => ({
      id: ep.id,
      title: ep.title,
      prerequisite: ep.prerequisite,
      beats: ep.beats
    }));
  }

  async getEpisode(episodeId: string): Promise<EpisodeData | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, episodeId));
    if (!episode) return undefined;
    
    return {
      id: episode.id,
      title: episode.title,
      prerequisite: episode.prerequisite,
      beats: episode.beats
    };
  }

  async createEpisode(episodeData: EpisodeData): Promise<void> {
    await db.insert(episodes).values({
      id: episodeData.id,
      title: episodeData.title,
      prerequisite: episodeData.prerequisite,
      beats: episodeData.beats,
      isActive: true
    });
  }

  async deleteEpisode(episodeId: string): Promise<void> {
    await db.update(episodes)
      .set({ isActive: false })
      .where(eq(episodes.id, episodeId));
  }

  async executeEpisodeAction(episodeId: string, beatId: number, actionIndex: number): Promise<void> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return;

    const beat = episode.beats.find((b: any) => b.beat_id === beatId);
    if (!beat || !beat.actions[actionIndex]) return;

    const action = beat.actions[actionIndex];
    console.log(`🎬 Executing ${action.command}: ${JSON.stringify(action.params)}`);
    
    // For now, just log the action execution
    // In a full implementation, this would integrate with the game systems
  }

  async triggerBeatCompletion(episodeId: string, beatId: number, eventData: any): Promise<boolean> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return false;

    const beat = episode.beats.find((b: any) => b.beat_id === beatId);
    if (!beat) return false;

    // Check if completion condition is met
    const condition = beat.completion_condition;
    console.log(`🎯 Checking completion for beat ${beatId}: ${condition.event}`);
    
    // This would contain the actual completion logic
    return true;
  }
}

export const episodeEngine = new EpisodeEngine();