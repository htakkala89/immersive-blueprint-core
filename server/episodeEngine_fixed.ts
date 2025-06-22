import { EpisodeData, StoryBeat } from '../shared/schema';
import { storage } from './storage';

export class EpisodeEngine {
  private episodes: Map<string, EpisodeData> = new Map();
  private episodeProgressState?: Map<string, boolean>;

  constructor() {
    this.loadDefaultEpisodeIfNeeded();
  }

  private async loadDefaultEpisodeIfNeeded() {
    if (this.episodes.size === 0) {
      this.createDefaultEpisode();
    }
  }

  private createDefaultEpisode() {
    const ep01: EpisodeData = {
      id: "EP01_Red_Echo",
      title: "Episode 1: Echoes of the Red Gate",
      prerequisite: {
        player_level: 1,
        relationship_level: 0
      },
      beats: [
        {
          beat_id: 1.1,
          title: "A Call to Action",
          trigger: "episode_start",
          actions: [
            {
              command: "ADD_COMMUNICATOR_MESSAGE",
              params: {
                sender: "Cha Hae-In",
                message: "There's been unusual activity detected at a Red Gate. I could use your expertise on this one.",
                timestamp: "now"
              }
            },
            {
              command: "SET_CHA_LOCATION_OVERRIDE",
              params: { location_id: "hunter_association", reason: "mission_briefing" }
            }
          ],
          completion_condition: {
            event: "message_acknowledged",
            params: { message_id: "red_gate_briefing" }
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
              command: "ADD_COMMUNICATOR_MESSAGE",
              params: {
                sender: "Cha Hae-In",
                message: "That was... incredible. You handled that Red Gate like it was nothing.",
                timestamp: "now"
              }
            },
            {
              command: "UNLOCK_RELATIONSHIP_STAR",
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

  // Core methods for episode management with deletion persistence
  async getAvailableEpisodes(): Promise<EpisodeData[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Check for deleted episodes first
      const deletedEpisodes = await this.getDeletedEpisodes();
      
      const episodesDir = path.join(process.cwd(), 'server/episodes');
      
      if (!fs.existsSync(episodesDir)) {
        // Return default episode if no creator portal episodes exist, but filter deleted ones
        const defaultEpisodes = Array.from(this.episodes.values());
        return defaultEpisodes.filter(ep => !deletedEpisodes.includes(ep.id));
      }
      
      const files = fs.readdirSync(episodesDir).filter(file => file.endsWith('.json'));
      const episodes = [];
      
      for (const file of files) {
        try {
          const filePath = path.join(episodesDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          
          if (!content.trim()) {
            console.log(`⚠️ Empty episode file: ${file}`);
            continue;
          }
          
          const episode = JSON.parse(content);
          
          // Skip deleted episodes
          if (!deletedEpisodes.includes(episode.id)) {
            episodes.push(episode);
            console.log(`✓ Loaded episode: ${episode.id}`);
          } else {
            console.log(`⚠️ Skipped deleted episode: ${episode.id}`);
          }
        } catch (error) {
          console.error(`❌ Failed to load episode from ${file}:`, error);
        }
      }
      
      // If no creator portal episodes, return default but filter deleted ones
      if (episodes.length === 0) {
        const defaultEpisodes = Array.from(this.episodes.values());
        return defaultEpisodes.filter(ep => !deletedEpisodes.includes(ep.id));
      }
      
      return episodes;
    } catch (error) {
      const deletedEpisodes = await this.getDeletedEpisodes();
      const defaultEpisodes = Array.from(this.episodes.values());
      return defaultEpisodes.filter(ep => !deletedEpisodes.includes(ep.id));
    }
  }

  // Method to track deleted episodes using file storage
  private async getDeletedEpisodes(): Promise<string[]> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const deletedEpisodesFile = path.join(process.cwd(), 'deleted_episodes.json');
      
      if (fs.existsSync(deletedEpisodesFile)) {
        const content = fs.readFileSync(deletedEpisodesFile, 'utf-8');
        try {
          return JSON.parse(content) || [];
        } catch (e) {
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get deleted episodes:', error);
      return [];
    }
  }

  async deleteEpisode(profileId: number, episodeId: string): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Store deleted episodes in a simple file for now
      const deletedEpisodesFile = path.join(process.cwd(), 'deleted_episodes.json');
      
      let deletedEpisodes: string[] = [];
      
      // Read existing deleted episodes
      if (fs.existsSync(deletedEpisodesFile)) {
        const content = fs.readFileSync(deletedEpisodesFile, 'utf-8');
        try {
          deletedEpisodes = JSON.parse(content) || [];
        } catch (e) {
          deletedEpisodes = [];
        }
      }
      
      // Add episode to deleted list if not already there
      if (!deletedEpisodes.includes(episodeId)) {
        deletedEpisodes.push(episodeId);
        fs.writeFileSync(deletedEpisodesFile, JSON.stringify(deletedEpisodes, null, 2));
        console.log(`✅ Episode ${episodeId} marked as deleted and will not reappear`);
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      throw error;
    }
  }

  async getEpisode(episodeId: string): Promise<EpisodeData | undefined> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      // Check if episode is deleted
      const deletedEpisodes = await this.getDeletedEpisodes();
      if (deletedEpisodes.includes(episodeId)) {
        return undefined;
      }
      
      const episodePath = path.join(process.cwd(), 'server/episodes', `${episodeId}.json`);
      
      if (fs.existsSync(episodePath)) {
        const content = fs.readFileSync(episodePath, 'utf-8');
        return JSON.parse(content);
      }
      
      // Fallback to default episodes
      return this.episodes.get(episodeId);
    } catch (error) {
      console.error(`Failed to get episode ${episodeId}:`, error);
      return undefined;
    }
  }

  async executeEpisodeAction(episodeId: string, beatId: number, actionIndex: number): Promise<void> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return;
    
    const beat = episode.beats.find(b => b.beat_id === beatId);
    if (!beat || !beat.actions[actionIndex]) return;
    
    const action = beat.actions[actionIndex];
    await this.processGameCommand(action);
  }

  private async processGameCommand(action: any): Promise<void> {
    switch (action.command) {
      case "ADD_COMMUNICATOR_MESSAGE":
        await this.addCommunicatorMessage(action.params);
        break;
      case "SET_QUEST_OBJECTIVE":
        await this.setQuestObjective(action.params);
        break;
      case "UPDATE_QUEST_OBJECTIVE":
        await this.updateQuestObjective(action.params);
        break;
      case "SET_CHA_LOCATION_OVERRIDE":
        await this.setChaLocation(action.params);
        break;
      case "SET_CHA_MOOD":
        await this.setChaMood(action.params);
        break;
      case "COMPLETE_EPISODE":
        await this.completeEpisode(action.params);
        break;
    }
  }

  private async addCommunicatorMessage(params: any): Promise<void> {
    console.log(`📱 Adding communicator message from ${params.sender}: ${params.message}`);
  }

  private async setQuestObjective(params: any): Promise<void> {
    console.log(`🎯 Setting quest objective: ${params.objective_text}`);
  }

  private async updateQuestObjective(params: any): Promise<void> {
    console.log(`🎯 Updating quest objective: ${params.objective_text}`);
  }

  private async setChaLocation(params: any): Promise<void> {
    console.log(`📍 Setting Cha Hae-In location: ${params.location_id}`);
  }

  private async setChaMood(params: any): Promise<void> {
    console.log(`😊 Setting Cha Hae-In mood: ${params.mood}`);
  }

  private async completeEpisode(params: any): Promise<void> {
    console.log(`✅ Episode completed: ${params.episode_id}`);
  }

  async getEpisodeGuidance(episodeId: string, currentBeat: number): Promise<string | null> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return null;
    
    const beat = episode.beats.find(b => b.beat_id === currentBeat);
    if (!beat) return null;
    
    // Generate location-specific guidance
    if (beat.actions) {
      for (const action of beat.actions) {
        if (action.command === "SET_CHA_LOCATION_OVERRIDE") {
          return this.generateLocationGuidance(action.params.location_id);
        }
        if (action.command === "SPAWN_LOCATION") {
          return this.generateActivityGuidance(action.params.location_id);
        }
      }
    }
    
    return `Current objective: ${beat.title}`;
  }

  private generateLocationGuidance(locationId: string): string {
    const locationGuidance = {
      'hunter_association': 'Head to the Hunter Association to meet with Cha Hae-In for the mission briefing.',
      'hongdae_cafe': 'Visit the cozy Hongdae café where Cha Hae-In likes to unwind after missions.',
      'chahaein_apartment': 'Go to Cha Hae-In\'s apartment for a more personal conversation.',
      'hangang_park': 'Take a peaceful walk with Cha Hae-In along the Han River.',
      'gangnam_shopping': 'Accompany Cha Hae-In on a shopping trip in Gangnam district.'
    };
    
    return locationGuidance[locationId] || `Visit ${locationId} to continue the story.`;
  }

  private generateActivityGuidance(activityId: string): string {
    const activityGuidance = {
      'dungeon_red_echo': 'Enter the Red Echo dungeon and clear it with Cha Hae-In.',
      'training_facility': 'Practice your combat skills at the training facility.',
      'guild_meeting': 'Attend the important guild meeting.'
    };
    
    return activityGuidance[activityId] || `Complete the ${activityId} activity to progress.`;
  }

  private generateChatGuidance(params: any): string {
    return `Continue your conversation with ${params.character || 'Cha Hae-In'} to deepen your relationship.`;
  }

  async triggerBeatCompletion(episodeId: string, beatId: number, eventData: any): Promise<boolean> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return false;
    
    const beat = episode.beats.find(b => b.beat_id === beatId);
    if (!beat) return false;
    
    console.log(`✓ Beat ${beatId} completed for episode ${episodeId}`);
    return true;
  }

  async trackGameplayEvent(event: string, data: any, profileId: string): Promise<void> {
    console.log(`📊 Tracking event: ${event} for profile ${profileId}`);
    
    // Check for episode progression triggers
    await this.checkEpisodeProgression(data.episodeId || 'EP01_Red_Echo', event, data, profileId);
  }

  async setActiveEpisodes(profileId: number, episodes: Array<{episodeId: string; priority: 'primary' | 'secondary' | 'background'; weight?: number}>): Promise<void> {
    console.log(`📝 Setting active episodes for profile ${profileId}:`, episodes);
    
    // Calculate weights for each priority level
    const episodesWithWeights = episodes.map(ep => ({
      ...ep,
      weight: ep.weight || this.calculatePriorityWeight(ep.priority)
    }));
    
    // Store in some persistent storage (could be database or file)
    // For now just log the weighted episodes
    console.log('📊 Episodes with calculated weights:', episodesWithWeights);
  }

  private calculatePriorityWeight(priority: 'primary' | 'secondary' | 'background'): number {
    const weights = {
      'primary': 60,
      'secondary': 30,
      'background': 10
    };
    return weights[priority];
  }

  async getActiveEpisodes(profileId: number): Promise<Array<{episodeId: string; priority: 'primary' | 'secondary' | 'background'; weight: number}>> {
    // For now return empty array, but this should load from persistent storage
    return [];
  }

  async getContextualEpisodeGuidance(profileId: number, location: string, timeOfDay: string): Promise<string | null> {
    const activeEpisodes = await this.getActiveEpisodes(profileId);
    
    if (activeEpisodes.length === 0) {
      return null;
    }
    
    // Find the most relevant episode based on location and time
    let bestMatch = null;
    let bestScore = 0;
    
    for (const activeEpisode of activeEpisodes) {
      const episode = await this.getEpisode(activeEpisode.episodeId);
      if (!episode) continue;
      
      const relevanceScore = this.calculateContextRelevance(episode, location, timeOfDay);
      const weightedScore = relevanceScore * (activeEpisode.weight / 100);
      
      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestMatch = episode;
      }
    }
    
    if (bestMatch) {
      return `Episode guidance: ${bestMatch.title} - Check your objectives for next steps.`;
    }
    
    return null;
  }

  private calculateContextRelevance(episode: any, location: string, timeOfDay: string): number {
    let score = 0;
    
    // Check if episode has location-specific beats
    for (const beat of episode.beats || []) {
      for (const action of beat.actions || []) {
        if (action.command === "SET_CHA_LOCATION_OVERRIDE" && action.params.location_id === location) {
          score += 50;
        }
      }
    }
    
    // Base score for active episodes
    score += 20;
    
    return Math.min(score, 100);
  }

  async setFocusedEpisode(profileId: number, episodeId: string | null): Promise<void> {
    console.log(`🎯 Setting focused episode for profile ${profileId}: ${episodeId}`);
    // Store the focused episode in persistent storage
  }

  async getFocusedEpisode(profileId: number): Promise<string | null> {
    // For now return null, but this should load from persistent storage
    return null;
  }

  async saveEpisodeProgress(profileId: number): Promise<void> {
    console.log(`💾 Saving episode progress for profile ${profileId}`);
    // Save current episode progress state
  }

  async loadEpisodeProgress(profileId: number, episodeId: string): Promise<{ currentBeat: number; playerChoices: any } | null> {
    // For now return null, but this should load progress from persistent storage
    return null;
  }

  private async checkEpisodeProgression(episodeId: string, event: string, data: any, profileId: string): Promise<void> {
    const episode = await this.getEpisode(episodeId);
    if (!episode) return;
    
    // Check if any beats should be triggered by this event
    for (const beat of episode.beats) {
      if (beat.completion_condition?.event === event) {
        console.log(`🎯 Episode ${episodeId} beat ${beat.beat_id} triggered by ${event}`);
        await this.progressEpisodeBeat(episodeId, beat.beat_id);
      }
    }
  }

  private async progressEpisodeBeat(episodeId: string, beatId: number): Promise<void> {
    console.log(`⏭️ Progressing episode ${episodeId} to beat ${beatId}`);
    // Update episode progress state
    if (!this.episodeProgressState) {
      this.episodeProgressState = new Map();
    }
    this.episodeProgressState.set(`${episodeId}_${beatId}`, true);
  }
}

export const episodeEngine = new EpisodeEngine();