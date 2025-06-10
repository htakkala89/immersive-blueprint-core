// System 9: Advanced AI Narrative Engine
// Complete storytelling system with persistent memory, branching narratives, and dynamic world events

interface StoryMemory {
  id: string;
  timestamp: Date;
  event: string;
  location: string;
  participants: string[];
  emotionalImpact: number;
  storyTags: string[];
  consequences: string[];
}

interface StoryArc {
  id: string;
  title: string;
  currentChapter: number;
  totalChapters: number;
  theme: string;
  majorEvents: StoryMemory[];
  relationshipMilestones: string[];
  isComplete: boolean;
}

interface CharacterEmotionalState {
  characterId: string;
  basePersonality: Record<string, number>;
  currentMood: Record<string, number>;
  relationshipDynamics: Record<string, number>;
  growthTrajectory: string[];
  traumaEvents: string[];
  joyfulMemories: string[];
}

interface NarrativeContext {
  activeStoryArcs: StoryArc[];
  storyMemories: StoryMemory[];
  emotionalStates: Record<string, CharacterEmotionalState>;
  worldEvents: WorldEvent[];
  narrativeTension: number;
  pacing: 'slow' | 'moderate' | 'intense' | 'climactic';
}

interface WorldEvent {
  id: string;
  type: 'gate_outbreak' | 'hunter_politics' | 'relationship_milestone' | 'personal_growth';
  title: string;
  description: string;
  triggerConditions: string[];
  consequences: string[];
  isTriggered: boolean;
  triggerDate?: Date;
}

class NarrativeEngine {
  private storyMemories: Map<string, StoryMemory[]> = new Map();
  private activeArcs: Map<string, StoryArc[]> = new Map();
  private emotionalStates: Map<string, CharacterEmotionalState> = new Map();
  private worldEvents: WorldEvent[] = [];

  constructor() {
    this.initializeBaseNarrative();
  }

  private initializeBaseNarrative() {
    // Initialize Cha Hae-In's base emotional state
    this.emotionalStates.set('cha_hae_in', {
      characterId: 'cha_hae_in',
      basePersonality: {
        professionalism: 0.8,
        kindness: 0.7,
        strength: 0.9,
        vulnerability: 0.3,
        romanticism: 0.4,
        independence: 0.8
      },
      currentMood: {
        happiness: 0.6,
        confidence: 0.8,
        attraction: 0.4,
        trust: 0.5,
        openness: 0.3
      },
      relationshipDynamics: {
        professional_respect: 0.8,
        personal_affection: 0.3,
        romantic_tension: 0.2,
        emotional_intimacy: 0.1
      },
      growthTrajectory: ['hunter_career_focus', 'personal_walls'],
      traumaEvents: [],
      joyfulMemories: []
    });

    // Initialize base story arc
    this.activeArcs.set('main_romance', [{
      id: 'main_romance_arc',
      title: 'The Hunter\'s Heart',
      currentChapter: 1,
      totalChapters: 12,
      theme: 'professional_to_personal',
      majorEvents: [],
      relationshipMilestones: [],
      isComplete: false
    }]);

    // Initialize world events
    this.worldEvents = [
      {
        id: 'first_coffee_date',
        type: 'relationship_milestone',
        title: 'First Casual Meeting',
        description: 'Jin-Woo and Cha Hae-In meet outside of work for the first time',
        triggerConditions: ['affection_above_40', 'location_hongdae_cafe'],
        consequences: ['relationship_dynamic_shift', 'personal_conversation_unlocked'],
        isTriggered: false
      },
      {
        id: 'vulnerability_moment',
        type: 'personal_growth',
        title: 'Walls Coming Down',
        description: 'Cha Hae-In shares something personal about her past',
        triggerConditions: ['affection_above_60', 'intimate_conversation_count_5'],
        consequences: ['emotional_intimacy_increase', 'new_dialogue_options'],
        isTriggered: false
      },
      {
        id: 'jealousy_scene',
        type: 'relationship_milestone',
        title: 'Unspoken Feelings',
        description: 'A moment that reveals deeper feelings',
        triggerConditions: ['affection_above_70', 'other_female_interaction'],
        consequences: ['romantic_tension_increase', 'confession_path_opened'],
        isTriggered: false
      }
    ];
  }

  // Core narrative memory management
  addStoryMemory(playerId: string, memory: Omit<StoryMemory, 'id' | 'timestamp'>): string {
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMemory: StoryMemory = {
      id: memoryId,
      timestamp: new Date(),
      ...memory
    };

    if (!this.storyMemories.has(playerId)) {
      this.storyMemories.set(playerId, []);
    }

    this.storyMemories.get(playerId)!.push(fullMemory);
    
    // Trigger narrative analysis
    this.analyzeStoryProgression(playerId, fullMemory);
    
    return memoryId;
  }

  // Dynamic story arc progression
  private analyzeStoryProgression(playerId: string, newMemory: StoryMemory) {
    const playerArcs = this.activeArcs.get(playerId) || [];
    const playerMemories = this.storyMemories.get(playerId) || [];

    // Check for story arc advancement
    for (const arc of playerArcs) {
      if (this.shouldAdvanceArc(arc, newMemory, playerMemories)) {
        this.advanceStoryArc(playerId, arc.id);
      }
    }

    // Check for world event triggers
    this.checkWorldEventTriggers(playerId, newMemory);

    // Update character emotional states
    this.updateEmotionalStates(newMemory);
  }

  private shouldAdvanceArc(arc: StoryArc, newMemory: StoryMemory, allMemories: StoryMemory[]): boolean {
    // Check if memory contains arc advancement triggers
    const arcTriggers = {
      1: ['first_meaningful_conversation', 'professional_recognition'],
      2: ['casual_interaction_outside_work', 'personal_interest_shown'],
      3: ['vulnerability_displayed', 'emotional_moment_shared'],
      4: ['romantic_tension_acknowledged', 'intimate_conversation'],
      5: ['physical_closeness', 'emotional_barrier_broken'],
      6: ['confession_or_kiss', 'relationship_defined']
    };

    const currentTriggers = arcTriggers[arc.currentChapter as keyof typeof arcTriggers] || [];
    return currentTriggers.some(trigger => 
      newMemory.storyTags.includes(trigger) || newMemory.event.toLowerCase().includes(trigger)
    );
  }

  private advanceStoryArc(playerId: string, arcId: string) {
    const playerArcs = this.activeArcs.get(playerId) || [];
    const arc = playerArcs.find(a => a.id === arcId);
    
    if (arc && arc.currentChapter < arc.totalChapters) {
      arc.currentChapter++;
      console.log(`📖 Story Arc Advanced: ${arc.title} - Chapter ${arc.currentChapter}`);
      
      // Trigger chapter-specific events
      this.triggerChapterEvents(playerId, arc);
    }
  }

  private triggerChapterEvents(playerId: string, arc: StoryArc) {
    // Generate dynamic events based on current chapter
    const chapterEvents = {
      2: 'New dialogue options unlocked - casual conversation topics',
      3: 'Cha Hae-In becomes more open in private conversations',
      4: 'Romantic undertones begin appearing in interactions',
      5: 'Intimate activity options become available',
      6: 'Relationship milestone: official romantic connection'
    };

    const event = chapterEvents[arc.currentChapter as keyof typeof chapterEvents];
    if (event) {
      console.log(`🎭 Chapter Event: ${event}`);
    }
  }

  // World event trigger system
  private checkWorldEventTriggers(playerId: string, newMemory: StoryMemory) {
    const playerMemories = this.storyMemories.get(playerId) || [];
    const chaEmotionalState = this.emotionalStates.get('cha_hae_in');

    for (const event of this.worldEvents) {
      if (event.isTriggered) continue;

      const shouldTrigger = event.triggerConditions.every(condition => {
        // Parse condition logic
        if (condition.startsWith('affection_above_')) {
          const threshold = parseInt(condition.split('_')[2]);
          const affection = chaEmotionalState?.relationshipDynamics.personal_affection || 0;
          return (affection * 100) > threshold;
        }

        if (condition.startsWith('location_')) {
          const requiredLocation = condition.replace('location_', '');
          return newMemory.location === requiredLocation;
        }

        if (condition.startsWith('intimate_conversation_count_')) {
          const requiredCount = parseInt(condition.split('_')[3]);
          const intimateConversations = playerMemories.filter(m => 
            m.storyTags.includes('intimate_conversation')
          ).length;
          return intimateConversations >= requiredCount;
        }

        return false;
      });

      if (shouldTrigger) {
        this.triggerWorldEvent(playerId, event);
      }
    }
  }

  private triggerWorldEvent(playerId: string, event: WorldEvent) {
    event.isTriggered = true;
    event.triggerDate = new Date();
    
    console.log(`🌍 World Event Triggered: ${event.title}`);
    
    // Apply consequences
    for (const consequence of event.consequences) {
      this.applyEventConsequence(playerId, consequence);
    }
  }

  private applyEventConsequence(playerId: string, consequence: string) {
    const chaState = this.emotionalStates.get('cha_hae_in');
    if (!chaState) return;

    switch (consequence) {
      case 'relationship_dynamic_shift':
        chaState.relationshipDynamics.personal_affection += 0.1;
        chaState.currentMood.openness += 0.1;
        break;
      case 'emotional_intimacy_increase':
        chaState.relationshipDynamics.emotional_intimacy += 0.2;
        break;
      case 'romantic_tension_increase':
        chaState.relationshipDynamics.romantic_tension += 0.15;
        break;
    }
  }

  // Character emotional state updates
  private updateEmotionalStates(memory: StoryMemory) {
    const chaState = this.emotionalStates.get('cha_hae_in');
    if (!chaState) return;

    // Analyze memory emotional impact
    const emotionalModifiers = {
      happiness: this.calculateEmotionalChange(memory, 'happiness'),
      confidence: this.calculateEmotionalChange(memory, 'confidence'),
      attraction: this.calculateEmotionalChange(memory, 'attraction'),
      trust: this.calculateEmotionalChange(memory, 'trust'),
      openness: this.calculateEmotionalChange(memory, 'openness')
    };

    // Apply emotional changes with bounds checking
    for (const [emotion, change] of Object.entries(emotionalModifiers)) {
      chaState.currentMood[emotion] = Math.max(0, Math.min(1, 
        chaState.currentMood[emotion] + change
      ));
    }
  }

  private calculateEmotionalChange(memory: StoryMemory, emotion: string): number {
    const impactMultiplier = memory.emotionalImpact / 10;
    
    // Tag-based emotional impacts
    const emotionalTags = {
      happiness: ['laughter', 'joy', 'success', 'gift', 'surprise'],
      confidence: ['praise', 'achievement', 'support', 'validation'],
      attraction: ['romantic', 'intimate', 'physical', 'charming'],
      trust: ['honesty', 'vulnerability', 'protection', 'reliability'],
      openness: ['personal_sharing', 'intimate_conversation', 'emotional_moment']
    };

    const relevantTags = emotionalTags[emotion as keyof typeof emotionalTags] || [];
    const tagMatches = memory.storyTags.filter(tag => relevantTags.includes(tag)).length;

    return tagMatches * 0.05 * impactMultiplier;
  }

  // Public interface methods
  getStoryContext(playerId: string): NarrativeContext {
    return {
      activeStoryArcs: this.activeArcs.get(playerId) || [],
      storyMemories: this.storyMemories.get(playerId) || [],
      emotionalStates: Object.fromEntries(this.emotionalStates),
      worldEvents: this.worldEvents,
      narrativeTension: this.calculateNarrativeTension(playerId),
      pacing: this.calculateNarrativePacing(playerId)
    };
  }

  private calculateNarrativeTension(playerId: string): number {
    const memories = this.storyMemories.get(playerId) || [];
    const recentMemories = memories.slice(-10);
    
    const tensionFactors = recentMemories.reduce((sum, memory) => {
      return sum + Math.abs(memory.emotionalImpact);
    }, 0);

    return Math.min(1, tensionFactors / 50);
  }

  private calculateNarrativePacing(playerId: string): 'slow' | 'moderate' | 'intense' | 'climactic' {
    const tension = this.calculateNarrativeTension(playerId);
    const arcs = this.activeArcs.get(playerId) || [];
    const mainArc = arcs.find(a => a.id === 'main_romance_arc');
    
    if (tension > 0.8 || (mainArc && mainArc.currentChapter >= 10)) return 'climactic';
    if (tension > 0.6 || (mainArc && mainArc.currentChapter >= 7)) return 'intense';
    if (tension > 0.3 || (mainArc && mainArc.currentChapter >= 4)) return 'moderate';
    return 'slow';
  }

  // Generate context-aware narrative content
  generateContextualNarrative(playerId: string, currentSituation: string): {
    narrativePrompt: string;
    emotionalContext: string;
    suggestedResponses: string[];
  } {
    const context = this.getStoryContext(playerId);
    const chaState = this.emotionalStates.get('cha_hae_in');
    
    const narrativePrompt = this.buildNarrativePrompt(context, currentSituation);
    const emotionalContext = this.buildEmotionalContext(chaState);
    const suggestedResponses = this.generateSuggestedResponses(context, chaState);

    return {
      narrativePrompt,
      emotionalContext,
      suggestedResponses
    };
  }

  private buildNarrativePrompt(context: NarrativeContext, situation: string): string {
    const mainArc = context.activeStoryArcs.find(a => a.id === 'main_romance_arc');
    const chapterContext = mainArc ? `Chapter ${mainArc.currentChapter} of ${mainArc.title}` : 'Beginning of story';
    
    return `${chapterContext}. Current pacing: ${context.pacing}. Narrative tension: ${Math.round(context.narrativeTension * 100)}%. Situation: ${situation}`;
  }

  private buildEmotionalContext(chaState?: CharacterEmotionalState): string {
    if (!chaState) return 'Neutral emotional state';
    
    const dominantMood = Object.entries(chaState.currentMood)
      .sort(([,a], [,b]) => b - a)[0];
    
    const relationshipLevel = Object.entries(chaState.relationshipDynamics)
      .sort(([,a], [,b]) => b - a)[0];

    return `Dominant mood: ${dominantMood[0]} (${Math.round(dominantMood[1] * 100)}%). Relationship level: ${relationshipLevel[0]} (${Math.round(relationshipLevel[1] * 100)}%)`;
  }

  private generateSuggestedResponses(context: NarrativeContext, chaState?: CharacterEmotionalState): string[] {
    const pacing = context.pacing;
    const tension = context.narrativeTension;
    
    if (pacing === 'climactic') {
      return [
        "Express your true feelings",
        "Take a decisive action",
        "Embrace the moment fully"
      ];
    }
    
    if (pacing === 'intense') {
      return [
        "Share something personal",
        "Move closer to her",
        "Ask about her feelings"
      ];
    }
    
    if (pacing === 'moderate') {
      return [
        "Deepen the conversation",
        "Suggest spending more time together",
        "Show your caring side"
      ];
    }
    
    return [
      "Get to know her better",
      "Find common ground",
      "Be genuinely interested"
    ];
  }
}

export const narrativeEngine = new NarrativeEngine();
export { NarrativeEngine, type NarrativeContext, type StoryMemory, type CharacterEmotionalState };