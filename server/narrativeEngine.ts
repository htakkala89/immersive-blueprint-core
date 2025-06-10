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
  longTermMemories: string[];
  narrativeFlags: Record<string, string>;
  relationshipMilestones: string[];
  prevailingMood: string;
  playerProfile: string;
  currentChapter: number;
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
  private longTermMemories: Map<string, string[]> = new Map();
  private narrativeFlags: Map<string, Record<string, string>> = new Map();
  private relationshipMilestones: Map<string, string[]> = new Map();
  private prevailingMoods: Map<string, string> = new Map();
  private playerProfiles: Map<string, string> = new Map();
  private storyChapters: Map<string, number> = new Map();

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
    
    // Check for long-term memory creation (Memory Star equivalent)
    this.processLongTermMemory(playerId, fullMemory);
    
    // Update player profile based on choices
    this.updatePlayerProfile(playerId, fullMemory);
    
    // Trigger narrative analysis
    this.analyzeStoryProgression(playerId, fullMemory);
    
    return memoryId;
  }

  // Process Long-Term Memory (Memory Star Integration)
  private processLongTermMemory(playerId: string, memory: StoryMemory) {
    const longTermTriggers = [
      'first_kiss', 'confession', 'first_date', 'relationship_milestone',
      'major_battle', 'emotional_breakthrough', 'intimate_moment',
      'tragic_event', 'achievement', 'world_changing_event'
    ];

    const shouldCreateLongTermMemory = longTermTriggers.some(trigger =>
      memory.storyTags.includes(trigger) || memory.event.toLowerCase().includes(trigger)
    );

    if (shouldCreateLongTermMemory || memory.emotionalImpact >= 8) {
      if (!this.longTermMemories.has(playerId)) {
        this.longTermMemories.set(playerId, []);
      }

      const longTermMemory = `${memory.event.split(':')[0]}_at_${memory.location}`;
      this.longTermMemories.get(playerId)!.push(longTermMemory);
      
      console.log(`⭐ Long-term memory created: ${longTermMemory}`);
    }
  }

  // Update Player Profile (Narrative Flags)
  private updatePlayerProfile(playerId: string, memory: StoryMemory) {
    if (!this.narrativeFlags.has(playerId)) {
      this.narrativeFlags.set(playerId, {});
    }

    const flags = this.narrativeFlags.get(playerId)!;
    
    // Analyze dialogue choices for player personality
    const empathyKeywords = ['care', 'help', 'understand', 'comfort', 'support', 'gentle'];
    const pragmaticKeywords = ['efficient', 'practical', 'logical', 'strategic', 'focus', 'mission'];
    const romanticKeywords = ['love', 'beautiful', 'together', 'heart', 'feelings', 'romantic'];
    
    const eventText = memory.event.toLowerCase();
    
    let empathyScore = empathyKeywords.filter(word => eventText.includes(word)).length;
    let pragmaticScore = pragmaticKeywords.filter(word => eventText.includes(word)).length;
    let romanticScore = romanticKeywords.filter(word => eventText.includes(word)).length;

    // Update cumulative scores
    flags.empathy_score = (parseInt(flags.empathy_score || '0') + empathyScore).toString();
    flags.pragmatic_score = (parseInt(flags.pragmatic_score || '0') + pragmaticScore).toString();
    flags.romantic_score = (parseInt(flags.romantic_score || '0') + romanticScore).toString();

    // Determine dominant player profile
    const totalEmpathy = parseInt(flags.empathy_score);
    const totalPragmatic = parseInt(flags.pragmatic_score);
    const totalRomantic = parseInt(flags.romantic_score);

    if (totalEmpathy > totalPragmatic && totalEmpathy > totalRomantic) {
      this.playerProfiles.set(playerId, 'empathetic');
    } else if (totalPragmatic > totalEmpathy && totalPragmatic > totalRomantic) {
      this.playerProfiles.set(playerId, 'pragmatic');
    } else if (totalRomantic > 5) {
      this.playerProfiles.set(playerId, 'romantic');
    }
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
      this.storyChapters.set(playerId, arc.currentChapter);
      console.log(`📖 Story Arc Advanced: ${arc.title} - Chapter ${arc.currentChapter}`);
      
      // Trigger chapter-specific events
      this.triggerChapterEvents(playerId, arc);
      
      // Check for relationship milestone requirements
      this.evaluateRelationshipMilestones(playerId, arc.currentChapter);
    }
  }

  // Relationship Milestone System
  private evaluateRelationshipMilestones(playerId: string, currentChapter: number) {
    if (!this.relationshipMilestones.has(playerId)) {
      this.relationshipMilestones.set(playerId, []);
    }

    const milestones = this.relationshipMilestones.get(playerId)!;
    const chapterMilestones = {
      2: 'first_meaningful_conversation',
      3: 'casual_meeting_outside_work', 
      4: 'emotional_vulnerability_shared',
      5: 'romantic_tension_acknowledged',
      6: 'physical_intimacy_begun',
      7: 'exclusive_relationship_status',
      8: 'deep_emotional_intimacy',
      9: 'future_planning_together',
      10: 'complete_trust_established'
    };

    const milestone = chapterMilestones[currentChapter as keyof typeof chapterMilestones];
    if (milestone && !milestones.includes(milestone)) {
      milestones.push(milestone);
      console.log(`💖 Relationship Milestone Achieved: ${milestone}`);
      
      // Update narrative flags for milestone achievements
      const flags = this.narrativeFlags.get(playerId) || {};
      flags.relationship_status = milestone;
      this.narrativeFlags.set(playerId, flags);

      // Trigger world event for major milestones
      if (currentChapter >= 6) {
        this.triggerMilestoneWorldEvent(playerId, milestone);
      }
    }
  }

  // Prevailing Mood System
  setPrevailingMood(playerId: string, mood: string, duration?: number) {
    this.prevailingMoods.set(playerId, mood);
    console.log(`🎭 Prevailing mood set: ${mood}`);
    
    // Auto-reset mood after duration (if specified)
    if (duration) {
      setTimeout(() => {
        const currentMood = this.prevailingMoods.get(playerId);
        if (currentMood === mood) {
          this.prevailingMoods.set(playerId, 'focused');
          console.log(`🎭 Mood automatically reset to focused`);
        }
      }, duration * 60 * 1000); // Convert minutes to milliseconds
    }
  }

  // Dynamic Event Trigger System
  private triggerMilestoneWorldEvent(playerId: string, milestone: string) {
    const milestoneEvents = {
      'exclusive_relationship_status': {
        id: 'relationship_official',
        type: 'relationship_milestone' as const,
        title: 'Official Relationship',
        description: 'Your relationship with Cha Hae-In is now officially recognized',
        triggerConditions: [`milestone_${milestone}`],
        consequences: ['new_dialogue_options', 'intimate_activities_unlocked'],
        isTriggered: true,
        triggerDate: new Date()
      },
      'deep_emotional_intimacy': {
        id: 'emotional_bond_complete',
        type: 'personal_growth' as const,
        title: 'Deep Emotional Bond',
        description: 'You and Cha Hae-In share complete emotional intimacy',
        triggerConditions: [`milestone_${milestone}`],
        consequences: ['advanced_conversations', 'future_planning_unlocked'],
        isTriggered: true,
        triggerDate: new Date()
      }
    };

    const event = milestoneEvents[milestone as keyof typeof milestoneEvents];
    if (event && !this.worldEvents.find(e => e.id === event.id)) {
      this.worldEvents.push(event);
      console.log(`🌍 Milestone World Event Triggered: ${event.title}`);
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
      pacing: this.calculateNarrativePacing(playerId),
      longTermMemories: this.longTermMemories.get(playerId) || [],
      narrativeFlags: this.narrativeFlags.get(playerId) || {},
      relationshipMilestones: this.relationshipMilestones.get(playerId) || [],
      prevailingMood: this.prevailingMoods.get(playerId) || 'focused',
      playerProfile: this.playerProfiles.get(playerId) || 'neutral',
      currentChapter: this.storyChapters.get(playerId) || 1
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
    
    // Apply location-based contextual weighting
    const narrativePrompt = this.buildContextualNarrativePrompt(context, currentSituation);
    const emotionalContext = this.buildEmotionalContext(chaState);
    const suggestedResponses = this.generateContextualResponses(context, chaState, currentSituation);

    return {
      narrativePrompt,
      emotionalContext,
      suggestedResponses
    };
  }

  // Location-Based Contextual Story Generation
  private buildContextualNarrativePrompt(context: NarrativeContext, situation: string): string {
    const location = this.extractLocationFromSituation(situation);
    const timeOfDay = this.extractTimeFromSituation(situation);
    
    // Base narrative context
    let prompt = this.buildNarrativePrompt(context, situation);
    
    // Apply location-specific narrative weighting
    const locationWeights = {
      'hunter_association': {
        topics: ['combat', 'missions', 'professional_development', 'hunter_politics'],
        mood: 'professional_focused'
      },
      'chahaein_apartment': {
        topics: ['personal_feelings', 'intimacy', 'future_plans', 'vulnerability'],
        mood: 'intimate_personal'
      },
      'hongdae_cafe': {
        topics: ['casual_conversation', 'hobbies', 'relaxation', 'getting_to_know'],
        mood: 'relaxed_friendly'
      },
      'myeongdong_restaurant': {
        topics: ['sharing_meals', 'cultural_experiences', 'romantic_atmosphere'],
        mood: 'romantic_warm'
      }
    };

    const locationData = locationWeights[location as keyof typeof locationWeights];
    if (locationData) {
      prompt += ` LOCATION_CONTEXT: Currently at ${location}. Conversation topics should be weighted towards: ${locationData.topics.join(', ')}. Emotional tone: ${locationData.mood}.`;
    }

    // Apply time-based contextual modifications
    if (timeOfDay === 'night' && (location === 'chahaein_apartment' || location === 'player_apartment')) {
      prompt += ` TIME_CONTEXT: Evening/night setting encourages more intimate, personal conversations and emotional vulnerability.`;
    }

    // Apply prevailing mood influence
    const prevailingMood = context.prevailingMood;
    if (prevailingMood !== 'focused') {
      prompt += ` MOOD_CONTEXT: Cha Hae-In's current prevailing mood is ${prevailingMood}. This affects her receptiveness and conversation style.`;
    }

    // Apply player profile influence
    const playerProfile = context.playerProfile;
    if (playerProfile !== 'neutral') {
      prompt += ` PLAYER_PROFILE: Based on past interactions, player tends to be ${playerProfile}. Adjust Cha Hae-In's responses accordingly.`;
    }

    return prompt;
  }

  // Enhanced contextual response generation
  private generateContextualResponses(context: NarrativeContext, chaState?: CharacterEmotionalState, situation?: string): string[] {
    // Return empty array to rely solely on dynamic prompts and ensure 4 total limit
    return [];
  }

  // Utility methods for context extraction
  private extractLocationFromSituation(situation: string): string {
    const locationKeywords = {
      'hunter_association': ['association', 'office', 'headquarters', 'hq'],
      'chahaein_apartment': ['apartment', 'home', 'her place'],
      'hongdae_cafe': ['cafe', 'coffee', 'hongdae'],
      'myeongdong_restaurant': ['restaurant', 'dining', 'myeongdong']
    };

    for (const [location, keywords] of Object.entries(locationKeywords)) {
      if (keywords.some(keyword => situation.toLowerCase().includes(keyword))) {
        return location;
      }
    }
    return 'unknown';
  }

  private extractTimeFromSituation(situation: string): string {
    const timeKeywords = {
      'morning': ['morning', 'breakfast', 'early'],
      'afternoon': ['afternoon', 'lunch', 'day'],
      'evening': ['evening', 'dinner', 'sunset'],
      'night': ['night', 'late', 'midnight', 'dark']
    };

    for (const [time, keywords] of Object.entries(timeKeywords)) {
      if (keywords.some(keyword => situation.toLowerCase().includes(keyword))) {
        return time;
      }
    }
    return 'unknown';
  }

  // Multi-Character Story Thread Management
  initializeSubStoryline(playerId: string, characterId: string, storylineId: string) {
    const flags = this.narrativeFlags.get(playerId) || {};
    flags[`substory_${characterId}_${storylineId}`] = 'active';
    this.narrativeFlags.set(playerId, flags);
    
    console.log(`📚 Sub-storyline initialized: ${characterId} - ${storylineId}`);
  }

  progressSubStoryline(playerId: string, characterId: string, storylineId: string, progressLevel: number) {
    const flags = this.narrativeFlags.get(playerId) || {};
    flags[`substory_${characterId}_${storylineId}_progress`] = progressLevel.toString();
    this.narrativeFlags.set(playerId, flags);
    
    console.log(`📚 Sub-storyline progressed: ${characterId} - ${storylineId} (Level ${progressLevel})`);
  }

  // Public methods for external access
  public setPlayerProfile(playerId: string, profile: string) {
    this.playerProfiles.set(playerId, profile);
  }

  public addRelationshipMilestone(playerId: string, milestone: string) {
    if (!this.relationshipMilestones.has(playerId)) {
      this.relationshipMilestones.set(playerId, []);
    }
    this.relationshipMilestones.get(playerId)!.push(milestone);
  }

  public addNarrativeFlag(playerId: string, key: string, value: string) {
    if (!this.narrativeFlags.has(playerId)) {
      this.narrativeFlags.set(playerId, {});
    }
    this.narrativeFlags.get(playerId)![key] = value;
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