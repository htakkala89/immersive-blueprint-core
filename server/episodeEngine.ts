import { EpisodeData } from "@shared/schema";
import { storage } from "./storage";

export class EpisodeEngine {
  private episodes: Map<string, EpisodeData> = new Map();
  private activeListeners: Map<string, Function[]> = new Map();
  
  constructor() {
    this.loadEpisodes();
    this.startBackgroundTasks();
  }

  private loadEpisodes() {
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
              params: { location_id: "hunter_association" }
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

  private startBackgroundTasks() {
    // Check prerequisites every 30 seconds
    setInterval(() => {
      this.checkPrerequisites();
    }, 30000);
  }

  private async checkPrerequisites() {
    const profiles = await storage.getAllProfiles();
    
    for (const profile of profiles) {
      const gameState = await storage.getGameState(profile.id);
      if (!gameState) continue;

      for (const [episodeId, episode] of this.episodes) {
        // Skip if already completed or in progress
        if (profile.completedEpisodes.includes(episodeId) || profile.currentEpisode === episodeId) {
          continue;
        }

        // Check prerequisites
        if (this.checkEpisodePrerequisites(episode, gameState, profile)) {
          console.log(`🎬 Episode ${episodeId} prerequisites met for profile ${profile.id}`);
          await this.startEpisode(episodeId, profile.id);
        }
      }
    }
  }

  private checkEpisodePrerequisites(episode: Episode, gameState: any, profile: any): boolean {
    const prereqs = episode.prerequisites;
    
    if (prereqs.level && gameState.level < prereqs.level) return false;
    if (prereqs.relationshipLevel && gameState.affectionLevel < prereqs.relationshipLevel) return false;
    
    if (prereqs.completedQuests) {
      for (const questId of prereqs.completedQuests) {
        if (!profile.completedEpisodes.includes(questId)) return false;
      }
    }
    
    if (prereqs.flags) {
      for (const [flag, required] of Object.entries(prereqs.flags)) {
        if (gameState.storyFlags[flag] !== required) return false;
      }
    }
    
    return true;
  }

  async startEpisode(episodeId: string, profileId: number) {
    const episode = this.episodes.get(episodeId);
    if (!episode) return;

    console.log(`🎬 Starting episode ${episodeId} for profile ${profileId}`);
    
    await storage.updateProfileEpisode(profileId, episodeId, 0);
    
    // Trigger the first beat
    const firstBeat = episode.storyBeats[0];
    if (firstBeat) {
      await this.executeBeat(episodeId, firstBeat, profileId);
    }
  }

  async executeBeat(episodeId: string, beat: StoryBeat, profileId: number) {
    console.log(`🎭 Executing beat ${beat.id} for episode ${episodeId}`);
    
    // Execute all actions in the beat
    for (const action of beat.actions) {
      await this.executeAction(action, profileId);
    }
    
    // Set up completion listener
    this.setupCompletionListener(episodeId, beat, profileId);
  }

  private async executeAction(action: EpisodeAction, profileId: number) {
    console.log(`🎬 Executing action: ${action.type}`);
    
    switch (action.type) {
      case "DELIVER_MESSAGE":
        await this.deliverMessage(action, profileId);
        break;
      case "ACTIVATE_QUEST":
        await this.activateQuest(action, profileId);
        break;
      case "SET_CHA_MOOD":
        await this.setChaHaeinMood(action, profileId);
        break;
      case "FORCE_CHA_LOCATION":
        await this.forceChaLocation(action, profileId);
        break;
      case "START_DIALOGUE_SCENE":
        await this.startDialogueScene(action, profileId);
        break;
      case "SET_QUEST_OBJECTIVE":
        await this.setQuestObjective(action, profileId);
        break;
      case "SPAWN_LOCATION":
        await this.spawnLocation(action, profileId);
        break;
      case "REMOVE_CHA_LOCATION_OVERRIDE":
        await this.removeChaLocationOverride(profileId);
        break;
      case "COMPLETE_QUEST":
        await this.completeQuest(action, profileId);
        break;
      case "REWARD_PLAYER":
        await this.rewardPlayer(action, profileId);
        break;
      case "CREATE_MEMORY_STAR":
        await this.createMemoryStar(action, profileId);
        break;
      case "UNLOCK_ACTIVITY":
        await this.unlockActivity(action, profileId);
        break;
    }
  }

  private async deliverMessage(action: EpisodeAction, profileId: number) {
    // Implementation for System 15 (Communicator)
    console.log(`📱 Delivering message: ${action.data?.messageId}`);
  }

  private async activateQuest(action: EpisodeAction, profileId: number) {
    const gameState = await storage.getGameState(profileId);
    if (!gameState) return;

    const quest = {
      id: action.target!,
      title: action.value!,
      description: "Investigate the mysterious A-Rank Gate that appeared in the city.",
      longDescription: "A powerful magical anomaly has been detected. Work with Cha Hae-In to investigate and eliminate the threat.",
      rank: "A" as const,
      type: "investigation" as const,
      sender: "Hunter Association",
      targetLocation: "hunter_association",
      objectives: [
        {
          id: "investigate_gate",
          description: "Meet with Cha Hae-In at the Hunter Association",
          completed: false,
          progress: 0,
          target: 1
        }
      ],
      rewards: {
        gold: 50000000,
        experience: 100000,
        items: ["Shadow_Elf_Dagger"]
      },
      difficulty: 8,
      status: "received" as const,
      receivedAt: new Date().toISOString(),
      estimatedDuration: 2,
      isUrgent: true
    };

    gameState.activeQuests.push(quest);
    await storage.updateGameState(profileId, gameState);
    
    console.log(`⚔️ Activated quest: ${action.target}`);
  }

  private async setChaHaeinMood(action: EpisodeAction, profileId: number) {
    // Set global character state for Cha Hae-In
    console.log(`💭 Setting Cha Hae-In mood to: ${action.value}`);
    // This would integrate with the character AI system
  }

  private async forceChaLocation(action: EpisodeAction, profileId: number) {
    console.log(`📍 Forcing Cha Hae-In location to: ${action.value}`);
    // This would override the normal schedule system
  }

  private async startDialogueScene(action: EpisodeAction, profileId: number) {
    console.log(`💬 Starting dialogue scene: ${action.value}`);
    // This would trigger the dialogue system with specific scene data
  }

  private async setQuestObjective(action: EpisodeAction, profileId: number) {
    const gameState = await storage.getGameState(profileId);
    if (!gameState) return;

    const quest = gameState.activeQuests.find(q => q.id === action.target);
    if (quest) {
      quest.objectives[0].description = action.value!;
      await storage.updateGameState(profileId, gameState);
      console.log(`🎯 Updated quest objective: ${action.value}`);
    }
  }

  private async spawnLocation(action: EpisodeAction, profileId: number) {
    console.log(`🗺️ Spawning location: ${action.value} (${action.data?.rank})`);
    // This would add a temporary location to the world map
  }

  private async removeChaLocationOverride(profileId: number) {
    console.log(`📍 Removing Cha Hae-In location override`);
    // This would restore normal schedule behavior
  }

  private async completeQuest(action: EpisodeAction, profileId: number) {
    const gameState = await storage.getGameState(profileId);
    if (!gameState) return;

    const questIndex = gameState.activeQuests.findIndex(q => q.id === action.target);
    if (questIndex !== -1) {
      const quest = gameState.activeQuests[questIndex];
      quest.status = "completed";
      quest.completedAt = new Date().toISOString();
      
      // Move to completed quests
      gameState.completedQuests.push(quest);
      gameState.activeQuests.splice(questIndex, 1);
      
      await storage.updateGameState(profileId, gameState);
      console.log(`✅ Completed quest: ${action.target}`);
    }
  }

  private async rewardPlayer(action: EpisodeAction, profileId: number) {
    const gameState = await storage.getGameState(profileId);
    if (!gameState) return;

    if (action.data?.gold) {
      gameState.gold += action.data.gold;
    }
    
    if (action.data?.items) {
      for (const item of action.data.items) {
        gameState.inventory.push({
          id: item,
          name: item,
          type: "weapon",
          quantity: 1,
          rarity: "legendary"
        });
      }
    }

    await storage.updateGameState(profileId, gameState);
    console.log(`🎁 Rewarded player: ${JSON.stringify(action.data)}`);
  }

  private async createMemoryStar(action: EpisodeAction, profileId: number) {
    console.log(`⭐ Creating memory star: ${action.data?.title}`);
    // This would integrate with the relationship constellation system
  }

  private async unlockActivity(action: EpisodeAction, profileId: number) {
    console.log(`🔓 Unlocking activities: ${action.data?.activities?.join(", ")}`);
    // This would add activities to the daily life system
  }

  private setupCompletionListener(episodeId: string, beat: StoryBeat, profileId: number) {
    const listenerId = `${episodeId}_${beat.id}_${profileId}`;
    
    if (!this.activeListeners.has(listenerId)) {
      this.activeListeners.set(listenerId, []);
    }

    // Set up listener for completion condition
    const listener = async (eventData: any) => {
      if (this.checkCompletionCondition(beat, eventData)) {
        console.log(`✅ Beat ${beat.id} completed`);
        await this.advanceToNextBeat(episodeId, profileId);
        this.removeListener(listenerId);
      }
    };

    this.activeListeners.get(listenerId)!.push(listener);
  }

  private checkCompletionCondition(beat: StoryBeat, eventData: any): boolean {
    // This would check if the completion condition has been met
    // For now, we'll simulate this based on the condition type
    switch (beat.completionCondition) {
      case "player_accepts_episode":
        return eventData.type === "player_accepts_episode" && 
               eventData.episodeId === beat.completionData?.episodeId;
      case "dialogue_scene_complete":
        return eventData.type === "dialogue_scene_complete" && 
               eventData.sceneId === beat.completionData?.sceneId;
      case "player_enters_dungeon":
        return eventData.type === "player_enters_dungeon" && 
               eventData.dungeonId === beat.completionData?.dungeonId;
      default:
        return false;
    }
  }

  private async advanceToNextBeat(episodeId: string, profileId: number) {
    const episode = this.episodes.get(episodeId);
    const profile = await storage.getProfile(profileId);
    if (!episode || !profile) return;

    const currentBeatIndex = profile.currentEpisodeBeat || 0;
    const nextBeatIndex = currentBeatIndex + 1;

    if (nextBeatIndex < episode.storyBeats.length) {
      // Advance to next beat
      await storage.updateProfileEpisode(profileId, episodeId, nextBeatIndex);
      const nextBeat = episode.storyBeats[nextBeatIndex];
      await this.executeBeat(episodeId, nextBeat, profileId);
    } else {
      // Episode complete
      await this.completeEpisode(episodeId, profileId);
    }
  }

  private async completeEpisode(episodeId: string, profileId: number) {
    console.log(`🎊 Episode ${episodeId} completed for profile ${profileId}`);
    
    const profile = await storage.getProfile(profileId);
    if (profile) {
      profile.completedEpisodes.push(episodeId);
      profile.currentEpisode = null;
      profile.currentEpisodeBeat = 0;
      await storage.updateProfile(profileId, profile);
    }

    // Apply final episode rewards
    const episode = this.episodes.get(episodeId);
    if (episode?.rewards) {
      await this.rewardPlayer({ 
        type: "REWARD_PLAYER", 
        data: episode.rewards 
      } as EpisodeAction, profileId);
    }
  }

  private removeListener(listenerId: string) {
    this.activeListeners.delete(listenerId);
  }

  // Public methods for triggering events
  async triggerEvent(eventType: string, eventData: any) {
    console.log(`🎬 Event triggered: ${eventType}`, eventData);
    
    // Notify all active listeners
    for (const [listenerId, listeners] of this.activeListeners) {
      for (const listener of listeners) {
        await listener({ type: eventType, ...eventData });
      }
    }
  }

  getAvailableEpisodes(): Episode[] {
    return Array.from(this.episodes.values());
  }

  getEpisode(episodeId: string): Episode | undefined {
    return this.episodes.get(episodeId);
  }
}

export const episodeEngine = new EpisodeEngine();