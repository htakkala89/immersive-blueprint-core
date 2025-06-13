// System 18: Episodic Story Engine - Core Implementation

import { Episode, StoryBeat, StoryAction, EpisodeState, Quest, EpisodePrerequisite, CompletionCondition } from '../shared/episodic-story-types.js';

export class EpisodicStoryEngine {
  private episodes: Map<string, Episode> = new Map();
  private state: EpisodeState = {
    activeEpisodes: [],
    completedEpisodes: [],
    availableEpisodes: [],
    currentQuests: [],
    storyFlags: {}
  };
  
  private actionHandlers: Map<string, Function> = new Map();
  private completionCheckers: Map<string, Function> = new Map();

  constructor() {
    this.initializeActionHandlers();
    this.initializeCompletionCheckers();
  }

  // Register episodes from JSON files
  registerEpisode(episodeData: Episode): void {
    this.episodes.set(episodeData.id, {
      ...episodeData,
      status: 'inactive',
      currentBeatIndex: 0
    });
  }

  // Main engine tick - checks prerequisites and advances beats
  update(playerStats: any, gameState: any): void {
    this.checkEpisodePrerequisites(playerStats, gameState);
    this.processActiveBeatCompletions(playerStats, gameState);
  }

  // Check if any inactive episodes should become available
  private checkEpisodePrerequisites(playerStats: any, gameState: any): void {
    this.episodes.forEach((episode, episodeId) => {
      if (episode.status === 'inactive' && this.meetsPrerequisites(episode.prerequisite, playerStats, gameState)) {
        this.activateEpisode(episodeId);
      }
    });
  }

  // Check if prerequisites are met
  private meetsPrerequisites(prereq: EpisodePrerequisite, playerStats: any, gameState: any): boolean {
    if (prereq.player_level && playerStats.level < prereq.player_level) return false;
    if (prereq.affection_level && playerStats.affectionLevel < prereq.affection_level) return false;
    if (prereq.completed_episodes) {
      for (const requiredEpisode of prereq.completed_episodes) {
        if (!this.state.completedEpisodes.includes(requiredEpisode)) return false;
      }
    }
    if (prereq.relationship_status && playerStats.relationshipStatus !== prereq.relationship_status) return false;
    if (prereq.location && gameState.currentLocation !== prereq.location) return false;
    if (prereq.time_of_day && gameState.timeOfDay !== prereq.time_of_day) return false;
    
    return true;
  }

  // Activate an episode and start its first beat
  private activateEpisode(episodeId: string): void {
    const episode = this.episodes.get(episodeId);
    if (!episode) return;

    episode.status = 'available';
    this.state.availableEpisodes.push(episodeId);
    
    // Execute first beat actions (usually delivering a quest offer)
    if (episode.beats.length > 0) {
      this.executeBeatActions(episode.beats[0].actions);
    }
  }

  // Player accepts an episode (moves from available to active)
  acceptEpisode(episodeId: string): void {
    const episode = this.episodes.get(episodeId);
    if (!episode || episode.status !== 'available') return;

    episode.status = 'active';
    this.state.activeEpisodes.push(episodeId);
    this.state.availableEpisodes = this.state.availableEpisodes.filter(id => id !== episodeId);
  }

  // Check active episodes for beat completion
  private processActiveBeatCompletions(playerStats: any, gameState: any): void {
    for (const episodeId of this.state.activeEpisodes) {
      const episode = this.episodes.get(episodeId);
      if (!episode) continue;

      const currentBeat = episode.beats[episode.currentBeatIndex];
      if (!currentBeat) continue;

      if (this.isBeatComplete(currentBeat.completion_condition, playerStats, gameState)) {
        this.completeBeat(episodeId);
      }
    }
  }

  // Check if a beat's completion condition is met
  private isBeatComplete(condition: CompletionCondition, playerStats: any, gameState: any): boolean {
    const checker = this.completionCheckers.get(condition.type);
    return checker ? checker(condition, playerStats, gameState) : false;
  }

  // Complete current beat and advance to next
  private completeBeat(episodeId: string): void {
    const episode = this.episodes.get(episodeId);
    if (!episode) return;

    episode.currentBeatIndex++;
    
    // Check if episode is complete
    if (episode.currentBeatIndex >= episode.beats.length) {
      this.completeEpisode(episodeId);
      return;
    }

    // Execute next beat's actions
    const nextBeat = episode.beats[episode.currentBeatIndex];
    if (nextBeat) {
      this.executeBeatActions(nextBeat.actions);
    }
  }

  // Complete entire episode
  private completeEpisode(episodeId: string): void {
    const episode = this.episodes.get(episodeId);
    if (!episode) return;

    episode.status = 'completed';
    this.state.activeEpisodes = this.state.activeEpisodes.filter(id => id !== episodeId);
    this.state.completedEpisodes.push(episodeId);
  }

  // Execute story actions
  private executeBeatActions(actions: StoryAction[]): void {
    for (const action of actions) {
      const handler = this.actionHandlers.get(action.type);
      if (handler) {
        handler(action);
      }
    }
  }

  // Initialize action handlers
  private initializeActionHandlers(): void {
    this.actionHandlers.set('DELIVER_MESSAGE', (action: any) => {
      // Send message to communicator system
      console.log(`📨 Delivering message from ${action.sender}: ${action.message_content}`);
    });

    this.actionHandlers.set('ACTIVATE_QUEST', (action: any) => {
      const quest: Quest = {
        id: action.quest_id,
        title: action.quest_title,
        description: action.quest_description,
        objectives: [],
        status: 'active'
      };
      this.state.currentQuests.push(quest);
      console.log(`🎯 Quest activated: ${action.quest_title}`);
    });

    this.actionHandlers.set('SET_CHA_MOOD', (action: any) => {
      console.log(`😊 Setting Cha Hae-In mood to: ${action.mood}`);
      // Integration with emotional state system
    });

    this.actionHandlers.set('FORCE_CHA_LOCATION', (action: any) => {
      console.log(`📍 Moving Cha Hae-In to: ${action.location_id}`);
      // Integration with location system
    });

    this.actionHandlers.set('START_DIALOGUE_SCENE', (action: any) => {
      console.log(`💬 Starting dialogue scene: ${action.dialogue_id}`);
      // Integration with dialogue system
    });

    this.actionHandlers.set('SET_QUEST_OBJECTIVE', (action: any) => {
      const quest = this.state.currentQuests.find(q => q.id === action.quest_id);
      if (quest) {
        quest.objectives.push({
          id: action.objective_id || Date.now().toString(),
          text: action.objective_text,
          completed: false
        });
      }
      console.log(`📋 Quest objective set: ${action.objective_text}`);
    });

    this.actionHandlers.set('LOAD_DUNGEON_ENVIRONMENT', (action: any) => {
      console.log(`🏰 Loading dungeon: ${action.dungeon_id}`);
      // Integration with raid system
    });

    this.actionHandlers.set('START_BOSS_BATTLE', (action: any) => {
      console.log(`⚔️ Starting boss battle: ${action.boss_id}`);
      // Integration with combat system
    });

    this.actionHandlers.set('REWARD_PLAYER', (action: any) => {
      console.log(`🎁 Rewarding player:`, action.rewards);
      // Integration with player stats system
    });

    this.actionHandlers.set('CREATE_MEMORY_STAR', (action: any) => {
      console.log(`⭐ Creating ${action.rank}-rank memory: ${action.description}`);
      // Integration with memory system
    });

    this.actionHandlers.set('UNLOCK_ACTIVITY', (action: any) => {
      console.log(`🔓 Unlocking activity: ${action.activity_id}`);
      // Integration with daily life hub
    });

    this.actionHandlers.set('SET_LOCATION', (action: any) => {
      console.log(`🌍 Setting location: ${action.location_id}`);
      // Integration with world map system
    });

    this.actionHandlers.set('SHOW_NOTIFICATION', (action: any) => {
      console.log(`🔔 Notification: ${action.title} - ${action.message}`);
      // Integration with UI notification system
    });
  }

  // Initialize completion condition checkers
  private initializeCompletionCheckers(): void {
    this.completionCheckers.set('player_accept', (condition: any, playerStats: any, gameState: any) => {
      // Check if player has accepted the quest
      return gameState.questAccepted === condition.target;
    });

    this.completionCheckers.set('dialogue_complete', (condition: any, playerStats: any, gameState: any) => {
      return gameState.completedDialogues?.includes(condition.target);
    });

    this.completionCheckers.set('boss_defeated', (condition: any, playerStats: any, gameState: any) => {
      return gameState.defeatedBosses?.includes(condition.target);
    });

    this.completionCheckers.set('location_visited', (condition: any, playerStats: any, gameState: any) => {
      return gameState.visitedLocations?.includes(condition.target);
    });

    this.completionCheckers.set('item_obtained', (condition: any, playerStats: any, gameState: any) => {
      return playerStats.inventory?.includes(condition.target);
    });

    this.completionCheckers.set('activity_completed', (condition: any, playerStats: any, gameState: any) => {
      return gameState.completedActivities?.includes(condition.target);
    });

    this.completionCheckers.set('end_episode', () => true);
  }

  // Public API methods
  getActiveEpisodes(): Episode[] {
    return this.state.activeEpisodes.map(id => this.episodes.get(id)!).filter(Boolean);
  }

  getAvailableEpisodes(): Episode[] {
    return this.state.availableEpisodes.map(id => this.episodes.get(id)!).filter(Boolean);
  }

  getCurrentQuests(): Quest[] {
    return this.state.currentQuests.filter(q => q.status === 'active');
  }

  getEpisodeState(): EpisodeState {
    return { ...this.state };
  }

  // Story flag management
  setStoryFlag(key: string, value: any): void {
    this.state.storyFlags[key] = value;
  }

  getStoryFlag(key: string): any {
    return this.state.storyFlags[key];
  }
}

// Singleton instance
export const storyEngine = new EpisodicStoryEngine();