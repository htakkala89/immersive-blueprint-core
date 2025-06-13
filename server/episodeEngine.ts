import { EpisodeData, StoryBeat, EpisodeAction } from "@shared/schema";

export class EpisodeEngine {
  private episodes: Map<string, EpisodeData> = new Map();
  
  constructor() {
    // Only load Episode 1 if no episodes exist from creator portal
    this.loadDefaultEpisodeIfNeeded();
  }

  private async loadDefaultEpisodeIfNeeded() {
    // Check if episodes directory exists and has files
    try {
      const fs = await import('fs');
      const path = await import('path');
      const episodesDir = path.join(process.cwd(), 'server/episodes');
      
      if (!fs.existsSync(episodesDir) || fs.readdirSync(episodesDir).length === 0) {
        this.createDefaultEpisode();
      }
    } catch (error) {
      this.createDefaultEpisode();
    }
  }

  private createDefaultEpisode() {
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

    this.episodes.set("EP01_Red_Echo", ep01);
  }

  // Core methods for episode management - use creator portal files only
  async getAvailableEpisodes(): Promise<EpisodeData[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const episodesDir = path.join(process.cwd(), 'server/episodes');
      
      if (!fs.existsSync(episodesDir)) {
        // Return default episode if no creator portal episodes exist
        return Array.from(this.episodes.values());
      }
      
      const files = fs.readdirSync(episodesDir).filter(file => file.endsWith('.json'));
      const episodes = [];
      
      for (const file of files) {
        try {
          const filePath = path.join(episodesDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          if (!content.trim()) {
            continue;
          }
          
          const episode = JSON.parse(content);
          
          // Only load episodes with the beats structure for gameplay integration
          if (episode.id && episode.title && episode.beats && Array.isArray(episode.beats)) {
            episodes.push(episode);
            console.log(`✓ Loaded episode: ${episode.id}`);
          }
        } catch (error) {
          // Silent skip to prevent runtime errors
          continue;
        }
      }
      
      // If no creator portal episodes, return default
      return episodes.length > 0 ? episodes : Array.from(this.episodes.values());
    } catch (error) {
      return Array.from(this.episodes.values());
    }
  }

  async getEpisode(episodeId: string): Promise<EpisodeData | undefined> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const episodePath = path.join(process.cwd(), 'server/episodes', `${episodeId}.json`);
      
      if (fs.existsSync(episodePath)) {
        const content = fs.readFileSync(episodePath, 'utf-8');
        return JSON.parse(content);
      }
      
      // Fallback to default episodes
      return this.episodes.get(episodeId);
    } catch (error) {
      return this.episodes.get(episodeId);
    }
  }

  async executeEpisodeAction(episodeId: string, beatId: number, actionIndex: number): Promise<void> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return;

    const beat = episode.beats.find((b: any) => b.beat_id === beatId);
    if (!beat || !beat.actions[actionIndex]) return;

    const action = beat.actions[actionIndex];
    console.log(`🎬 Executing ${action.command}: ${JSON.stringify(action.params)}`);
    
    // Execute actual game system commands
    await this.processGameCommand(action);
  }

  private async processGameCommand(action: any): Promise<void> {
    switch (action.command) {
      case 'DELIVER_MESSAGE':
        // Add message to Hunter Communicator alerts
        await this.addCommunicatorMessage(action.params);
        break;
        
      case 'SET_QUEST_OBJECTIVE':
        // Add quest objective to game state
        await this.setQuestObjective(action.params);
        break;
        
      case 'UPDATE_QUEST_OBJECTIVE':
        // Update existing quest objective
        await this.updateQuestObjective(action.params);
        break;
        
      case 'SET_CHA_LOCATION':
        // Update Cha Hae-In's location in game state
        await this.setChaLocation(action.params);
        break;
        
      case 'SET_CHA_MOOD':
        // Update Cha Hae-In's mood in game state
        await this.setChaMood(action.params);
        break;
        
      case 'COMPLETE_EPISODE':
        // Award rewards and mark episode complete
        await this.completeEpisode(action.params);
        break;
        
      default:
        console.log(`Unknown command: ${action.command}`);
    }
  }

  private async addCommunicatorMessage(params: any): Promise<void> {
    // This integrates with System 15 - Hunter Communicator
    console.log(`📨 Adding communicator message from ${params.sender}: ${params.message}`);
  }

  private async setQuestObjective(params: any): Promise<void> {
    // This sets a quest objective that appears in the game UI
    console.log(`🎯 Setting quest objective: ${params.objective}`);
  }

  private async updateQuestObjective(params: any): Promise<void> {
    // This updates the current quest objective
    console.log(`🔄 Updating quest objective: ${params.objective}`);
  }

  private async setChaLocation(params: any): Promise<void> {
    // This updates Cha Hae-In's location in the spatial system
    console.log(`📍 Setting Cha Hae-In location: ${params.location_id}`);
  }

  private async setChaMood(params: any): Promise<void> {
    // This updates Cha Hae-In's emotional state
    console.log(`💭 Setting Cha Hae-In mood: ${params.mood}`);
  }

  private async completeEpisode(params: any): Promise<void> {
    // Award rewards and mark episode as completed
    console.log(`🎉 Episode complete! Rewards: ${JSON.stringify(params)}`);
  }

  // Get natural dialogue guidance for episode progression
  async getEpisodeGuidance(episodeId: string, currentBeat: number): Promise<string | null> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return null;

    const nextBeat = episode.beats.find((b: any) => b.beat_id === currentBeat + 1);
    if (!nextBeat) return null;

    // Generate natural dialogue based on the next beat's completion condition
    const condition = nextBeat.completion_condition;
    
    switch (condition.event) {
      case 'player_visits_location':
        return this.generateLocationGuidance(condition.params.location_id);
      case 'activity_completed':
        return this.generateActivityGuidance(condition.params.activity_id);
      case 'player_chats_with_cha':
        return this.generateChatGuidance(condition.params);
      default:
        return null;
    }
  }

  private generateLocationGuidance(locationId: string): string {
    const locationDialogue: Record<string, string> = {
      'training_facility': "Let's head to the training facility. I want to work on our coordination for the upcoming mission.",
      'hongdae_cafe': "How about we grab some coffee at that place in Hongdae? We can discuss the mission details there.",
      'hunter_association': "We should check in at the Hunter Association. There might be updates on the situation.",
      'hangang_park': "Want to take a walk by the river? The fresh air might help us think more clearly.",
      'player_apartment': "Let's go back to your place. We can review the plans in private.",
      'cha_apartment': "Come over to my apartment. I have some materials we should go over together."
    };
    
    return locationDialogue[locationId] || `Let's meet at the ${locationId.replace('_', ' ')}.`;
  }

  private generateActivityGuidance(activityId: string): string {
    const activityDialogue: Record<string, string> = {
      'sparring_session': "I think it's time for some sparring practice. Meet me at the training facility when you're ready.",
      'coffee_date': "How about we grab some coffee together? I know a nice quiet place we can talk.",
      'equipment_maintenance': "We should maintain our equipment together. Proper gear maintenance is crucial for our safety.",
      'raid_footage_review': "Let's review some raid footage. Analyzing our past missions will help us improve our teamwork."
    };
    
    return activityDialogue[activityId] || `Let's do the ${activityId.replace('_', ' ')} activity together.`;
  }

  private generateChatGuidance(params: any): string {
    if (params.topic) {
      return `We need to talk about ${params.topic}. It's important for our next mission.`;
    }
    return "There's something important I need to discuss with you.";
  }

  async triggerBeatCompletion(episodeId: string, beatId: number, eventData: any): Promise<boolean> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return false;

    const beat = episode.beats.find((b: any) => b.beat_id === beatId);
    if (!beat) return false;

    const condition = beat.completion_condition;
    console.log(`🎯 Checking completion for beat ${beatId}: ${condition.event}`);
    
    return true;
  }

  // Episode Event Tracking System - Integrates episodes with actual gameplay
  async trackGameplayEvent(event: string, data: any, profileId: string): Promise<void> {
    console.log(`🎮 Tracking episode event: ${event}`, data);
    
    // Get all available episodes
    const episodes = await this.getAvailableEpisodes();
    
    // Check each episode for progression opportunities
    for (const episode of episodes) {
      await this.checkEpisodeProgression(episode.id, event, data, profileId);
    }
    
    // Save episode progress after tracking event
    await this.saveEpisodeProgress(Number(profileId));
  }

  // Episode Progression Persistence
  async saveEpisodeProgress(profileId: number): Promise<void> {
    try {
      const { db } = await import('./db');
      const { playerProfiles, episodeProgress } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Get current profile
      const [profile] = await db.select().from(playerProfiles).where(eq(playerProfiles.id, profileId));
      if (!profile) return;
      
      // If there's a current episode, save progress
      if (profile.currentEpisode) {
        await db.insert(episodeProgress).values({
          profileId: profileId,
          episodeId: profile.currentEpisode,
          currentBeat: profile.currentEpisodeBeat || 0,
          isCompleted: false,
          playerChoices: profile.episodeProgress || {},
          lastPlayedAt: new Date()
        }).onConflictDoUpdate({
          target: [episodeProgress.profileId, episodeProgress.episodeId],
          set: {
            currentBeat: profile.currentEpisodeBeat || 0,
            playerChoices: profile.episodeProgress || {},
            lastPlayedAt: new Date()
          }
        });
        
        console.log(`💾 Saved episode progress: ${profile.currentEpisode} beat ${profile.currentEpisodeBeat}`);
      }
    } catch (error) {
      console.error('Failed to save episode progress:', error);
    }
  }

  async loadEpisodeProgress(profileId: number, episodeId: string): Promise<{ currentBeat: number; playerChoices: any } | null> {
    try {
      const { db } = await import('./db');
      const { episodeProgress } = await import('../shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const [progress] = await db.select().from(episodeProgress)
        .where(and(
          eq(episodeProgress.profileId, profileId),
          eq(episodeProgress.episodeId, episodeId)
        ));
      
      if (progress) {
        console.log(`📖 Loaded episode progress: ${episodeId} beat ${progress.currentBeat}`);
        return {
          currentBeat: progress.currentBeat,
          playerChoices: progress.playerChoices as any
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load episode progress:', error);
      return null;
    }
  }

  private async checkEpisodeProgression(episodeId: string, event: string, data: any, profileId: string): Promise<void> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return;

    // Find the next incomplete beat
    const nextBeat = episode.beats.find((beat: any) => !beat.completed);
    if (!nextBeat) return;

    let shouldProgress = false;
    const condition = nextBeat.completion_condition;

    if (!condition) return;

    // Check if this event satisfies the beat's progression condition
    switch (condition.event) {
      case 'player_visits_location':
        if (event === 'player_visits_location' && 
            condition.params?.location_id === data.location_id) {
          shouldProgress = true;
          console.log(`🎯 Episode ${episodeId} beat ${nextBeat.beat_id} progressed: location visit to ${data.location_id}`);
        }
        break;

      case 'player_chats_with_cha':
        if (event === 'player_chats_with_cha') {
          shouldProgress = true;
          console.log(`🎯 Episode ${episodeId} beat ${nextBeat.beat_id} progressed: conversation with Cha Hae-In`);
        }
        break;

      case 'activity_completed':
        if (event === 'activity_completed' && 
            condition.params?.activity_id === data.activity_id) {
          shouldProgress = true;
          console.log(`🎯 Episode ${episodeId} beat ${nextBeat.beat_id} progressed: activity ${data.activity_id} completed`);
        }
        break;

      case 'quest_objective_met':
        if (event === 'quest_objective_met' && 
            condition.params?.quest_id === data.quest_id) {
          shouldProgress = true;
          console.log(`🎯 Episode ${episodeId} beat ${nextBeat.beat_id} progressed: quest ${data.quest_id} completed`);
        }
        break;

      case 'dialogue_complete':
        if (event === 'player_chats_with_cha') {
          shouldProgress = true;
          console.log(`🎯 Episode ${episodeId} beat ${nextBeat.beat_id} progressed: dialogue completed`);
        }
        break;
    }

    if (shouldProgress) {
      await this.progressEpisodeBeat(episodeId, nextBeat.beat_id);
    }
  }

  private async progressEpisodeBeat(episodeId: string, beatId: number): Promise<void> {
    try {
      // Store completion state separately to avoid TypeScript issues
      if (!this.episodeProgressState) {
        this.episodeProgressState = new Map();
      }
      
      const episodeStateKey = `${episodeId}_${beatId}`;
      this.episodeProgressState.set(episodeStateKey, true);

      // Execute all actions in this beat
      await this.executeEpisodeAction(episodeId, beatId, 0);

      console.log(`🎬 Episode ${episodeId} beat ${beatId} automatically progressed through gameplay`);

      // Check if episode is complete by examining all beats for this episode
      const episode = await this.getEpisode(episodeId);
      if (episode) {
        const allBeatsComplete = episode.beats.every((beat: any) => 
          this.episodeProgressState?.get(`${episodeId}_${beat.beat_id}`) === true
        );
        
        if (allBeatsComplete) {
          console.log(`🏆 Episode ${episodeId} completed through gameplay progression!`);
          await this.completeEpisode({ 
            episodeId, 
            experienceGained: 1000, 
            affectionBonus: 15 
          });
        }
      }
    } catch (error) {
      console.error(`Failed to progress episode beat ${episodeId}:${beatId}`, error);
    }
  }

  private episodeProgressState?: Map<string, boolean>;
}

export const episodeEngine = new EpisodeEngine();