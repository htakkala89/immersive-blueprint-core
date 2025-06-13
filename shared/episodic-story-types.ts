// System 18: Episodic Story Engine - Type Definitions

export interface Episode {
  id: string;
  title: string;
  description: string;
  prerequisite: EpisodePrerequisite;
  beats: StoryBeat[];
  status: 'inactive' | 'available' | 'active' | 'completed';
  currentBeatIndex: number;
}

export interface EpisodePrerequisite {
  player_level?: number;
  affection_level?: number;
  completed_episodes?: string[];
  has_items?: string[];
  location?: string;
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
  relationship_status?: 'dating' | 'engaged' | 'married';
}

export interface StoryBeat {
  beat_id: string;
  title: string;
  description: string;
  trigger: BeatTrigger;
  actions: StoryAction[];
  completion_condition: CompletionCondition;
  optional?: boolean;
}

export interface BeatTrigger {
  type: 'previous_beat_complete' | 'player_action' | 'location_enter' | 'time_condition' | 'immediate';
  conditions?: any;
}

export interface CompletionCondition {
  type: 'player_accept' | 'dialogue_complete' | 'boss_defeated' | 'location_visited' | 'item_obtained' | 'end_episode' | 'activity_completed';
  target?: string;
  value?: any;
}

// Creator Commands for Story Actions
export type StoryAction = 
  | DeliverMessageAction
  | ActivateQuestAction
  | SetChaMoodAction
  | ForceChaLocationAction
  | StartDialogueSceneAction
  | SetQuestObjectiveAction
  | LoadDungeonEnvironmentAction
  | StartBossBattleAction
  | RewardPlayerAction
  | CreateMemoryStarAction
  | UnlockActivityAction
  | SetLocationAction
  | PlayMusicAction
  | ShowNotificationAction;

export interface DeliverMessageAction {
  type: 'DELIVER_MESSAGE';
  target_system: string;
  sender: string;
  message_content: string;
  urgent?: boolean;
}

export interface ActivateQuestAction {
  type: 'ACTIVATE_QUEST';
  quest_id: string;
  quest_title: string;
  quest_description: string;
}

export interface SetChaMoodAction {
  type: 'SET_CHA_MOOD';
  mood: 'happy' | 'anxious' | 'focused_professional' | 'romantic' | 'excited' | 'worried' | 'confident';
  duration?: number; // minutes
}

export interface ForceChaLocationAction {
  type: 'FORCE_CHA_LOCATION';
  location_id: string;
  reason?: string;
}

export interface StartDialogueSceneAction {
  type: 'START_DIALOGUE_SCENE';
  dialogue_id: string;
  scene_context?: any;
}

export interface SetQuestObjectiveAction {
  type: 'SET_QUEST_OBJECTIVE';
  quest_id: string;
  objective_text: string;
  objective_id?: string;
}

export interface LoadDungeonEnvironmentAction {
  type: 'LOAD_DUNGEON_ENVIRONMENT';
  dungeon_id: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'nightmare';
}

export interface StartBossBattleAction {
  type: 'START_BOSS_BATTLE';
  boss_id: string;
  environment?: string;
}

export interface RewardPlayerAction {
  type: 'REWARD_PLAYER';
  rewards: {
    gold?: number;
    experience?: number;
    items?: string[];
    affection?: number;
  };
}

export interface CreateMemoryStarAction {
  type: 'CREATE_MEMORY_STAR';
  star_id: string;
  description: string;
  rank: 'C' | 'B' | 'A' | 'S' | 'SS';
  category?: string;
}

export interface UnlockActivityAction {
  type: 'UNLOCK_ACTIVITY';
  activity_id: string;
  permanent?: boolean;
}

export interface SetLocationAction {
  type: 'SET_LOCATION';
  location_id: string;
  time_of_day?: string;
  weather?: string;
}

export interface PlayMusicAction {
  type: 'PLAY_MUSIC';
  track_id: string;
  fade_in?: boolean;
}

export interface ShowNotificationAction {
  type: 'SHOW_NOTIFICATION';
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'error';
}

// Episode State Management
export interface EpisodeState {
  activeEpisodes: string[];
  completedEpisodes: string[];
  availableEpisodes: string[];
  currentQuests: Quest[];
  storyFlags: Record<string, any>;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  status: 'active' | 'completed' | 'failed';
  rewards?: any;
}

export interface QuestObjective {
  id: string;
  text: string;
  completed: boolean;
  optional?: boolean;
}