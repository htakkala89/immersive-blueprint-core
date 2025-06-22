// Backup of working episode engine with fixes for episode deletion persistence and dialogue context
import { EpisodeData, StoryBeat } from '../shared/types';
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
      title: "Echoes of the Red Gate",
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
    
    return `Current objective: ${beat.title}`;
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
  }

  async setActiveEpisodes(profileId: number, episodes: Array<{episodeId: string; priority: 'primary' | 'secondary' | 'background'; weight?: number}>): Promise<void> {
    console.log(`📝 Setting active episodes for profile ${profileId}:`, episodes);
  }

  async getActiveEpisodes(profileId: number): Promise<Array<{episodeId: string; priority: 'primary' | 'secondary' | 'background'; weight: number}>> {
    return [];
  }

  async getContextualEpisodeGuidance(profileId: number, location: string, timeOfDay: string): Promise<string | null> {
    return null;
  }

  async setFocusedEpisode(profileId: number, episodeId: string | null): Promise<void> {
    console.log(`🎯 Setting focused episode for profile ${profileId}: ${episodeId}`);
  }

  async getFocusedEpisode(profileId: number): Promise<string | null> {
    return null;
  }

  async saveEpisodeProgress(profileId: number): Promise<void> {
    console.log(`💾 Saving episode progress for profile ${profileId}`);
  }

  async loadEpisodeProgress(profileId: number, episodeId: string): Promise<{ currentBeat: number; playerChoices: any } | null> {
    return null;
  }
}

export const episodeEngine = new EpisodeEngine();