import { GoogleGenerativeAI } from "@google/generative-ai";

interface StoryPrompt {
  prompt: string;
  genre?: string;
  setting?: string;
  targetLength?: 'short' | 'medium' | 'long';
  matureContent?: boolean;
}

interface StoryScaffold {
  title: string;
  synopsis: string;
  characters: Character[];
  locations: Location[];
  episodes: Episode[];
  systemPopulation: SystemPopulation;
}

interface Character {
  id: string;
  name: string;
  role: 'protagonist' | 'love_interest' | 'antagonist' | 'supporting';
  personality: string[];
  background: string;
  appearance: string;
  dialogueStyle: string;
}

interface Location {
  id: string;
  name: string;
  description: string;
  mood: string;
  timeOfDay: string[];
  activities: string[];
}

interface Episode {
  id: string;
  title: string;
  synopsis: string;
  beats: Beat[];
  objectives: string[];
}

interface Beat {
  id: string;
  title: string;
  description: string;
  location: string;
  characters: string[];
  dialogue: DialogueEntry[];
  choices: Choice[];
  mood: string;
}

interface DialogueEntry {
  character: string;
  text: string;
  emotion: string;
}

interface Choice {
  id: string;
  text: string;
  consequence: string;
  affectionChange?: number;
}

interface SystemPopulation {
  spatialView: any;
  dialogue: any;
  questLog: any;
  dailyLife: any;
  relationships: any;
  worldMap: any;
  moodEngine: any;
  episodicEngine: any;
}

export class AIStoryArchitect {
  private gemini: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key required for AI Story Architect');
    }
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  async generateStoryScaffold(storyPrompt: StoryPrompt): Promise<StoryScaffold> {
    console.log('🏗️ AI Story Architect: Analyzing creative prompt...');
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
You are the AI Story Architect for the Blueprint Engine. Your task is to analyze a creative prompt and generate a complete story scaffold that will populate all systems of an interactive narrative experience.

USER PROMPT: "${storyPrompt.prompt}"
GENRE: ${storyPrompt.genre || 'Auto-detect'}
SETTING: ${storyPrompt.setting || 'Auto-detect'}
TARGET LENGTH: ${storyPrompt.targetLength || 'medium'}
MATURE CONTENT: ${storyPrompt.matureContent ? 'Allowed' : 'No'}

Generate a comprehensive story scaffold in JSON format with the following structure:

1. STORY ANALYSIS:
- Extract key entities (characters, setting, plot elements)
- Identify the central conflict and emotional arc
- Determine appropriate pacing and episode structure

2. CHARACTER CREATION:
- Create 3-5 main characters with distinct personalities
- Define their roles, backgrounds, and relationship dynamics
- Establish dialogue styles and emotional patterns

3. LOCATION DESIGN:
- Design 4-6 key locations that support the narrative
- Include mood, atmosphere, and available activities
- Consider different times of day and weather conditions

4. EPISODIC STRUCTURE:
- Break the story into 3-5 episodes with clear beats
- Each episode should have 4-6 beats (scenes)
- Include meaningful choices that affect relationships and story

5. SYSTEM POPULATION:
- Map story elements to Blueprint Engine systems
- Populate dialogue system with character-specific content
- Create quest objectives and relationship tracking

Return ONLY valid JSON without markdown formatting.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      const scaffold = JSON.parse(text);
      console.log('✅ Story scaffold generated successfully');
      return this.validateAndEnhanceScaffold(scaffold);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI Story Architect failed to generate valid scaffold');
    }
  }

  private validateAndEnhanceScaffold(scaffold: any): StoryScaffold {
    // Validate required fields and enhance with Blueprint Engine specifics
    const enhanced: StoryScaffold = {
      title: scaffold.title || 'Untitled Story',
      synopsis: scaffold.synopsis || 'A generated interactive experience',
      characters: this.enhanceCharacters(scaffold.characters || []),
      locations: this.enhanceLocations(scaffold.locations || []),
      episodes: this.enhanceEpisodes(scaffold.episodes || []),
      systemPopulation: this.generateSystemPopulation(scaffold)
    };

    return enhanced;
  }

  private enhanceCharacters(characters: any[]): Character[] {
    return characters.map((char, index) => ({
      id: char.id || `char_${index}`,
      name: char.name || `Character ${index + 1}`,
      role: char.role || 'supporting',
      personality: char.personality || ['mysterious'],
      background: char.background || 'Unknown background',
      appearance: char.appearance || 'Appears normal',
      dialogueStyle: char.dialogueStyle || 'casual'
    }));
  }

  private enhanceLocations(locations: any[]): Location[] {
    return locations.map((loc, index) => ({
      id: loc.id || `loc_${index}`,
      name: loc.name || `Location ${index + 1}`,
      description: loc.description || 'A mysterious place',
      mood: loc.mood || 'neutral',
      timeOfDay: loc.timeOfDay || ['day', 'night'],
      activities: loc.activities || ['explore', 'talk']
    }));
  }

  private enhanceEpisodes(episodes: any[]): Episode[] {
    return episodes.map((ep, index) => ({
      id: ep.id || `ep_${index}`,
      title: ep.title || `Episode ${index + 1}`,
      synopsis: ep.synopsis || 'An important chapter in the story',
      beats: this.enhanceBeats(ep.beats || []),
      objectives: ep.objectives || ['Progress the story']
    }));
  }

  private enhanceBeats(beats: any[]): Beat[] {
    return beats.map((beat, index) => ({
      id: beat.id || `beat_${index}`,
      title: beat.title || `Scene ${index + 1}`,
      description: beat.description || 'An important scene',
      location: beat.location || 'unknown',
      characters: beat.characters || [],
      dialogue: beat.dialogue || [],
      choices: beat.choices || [],
      mood: beat.mood || 'neutral'
    }));
  }

  private generateSystemPopulation(scaffold: any): SystemPopulation {
    return {
      spatialView: this.populateSpatialView(scaffold),
      dialogue: this.populateDialogue(scaffold),
      questLog: this.populateQuestLog(scaffold),
      dailyLife: this.populateDailyLife(scaffold),
      relationships: this.populateRelationships(scaffold),
      worldMap: this.populateWorldMap(scaffold),
      moodEngine: this.populateMoodEngine(scaffold),
      episodicEngine: this.populateEpisodicEngine(scaffold)
    };
  }

  private populateSpatialView(scaffold: any) {
    return {
      locations: scaffold.locations || [],
      defaultView: scaffold.locations?.[0]?.id || 'default',
      interactionNodes: []
    };
  }

  private populateDialogue(scaffold: any) {
    const dialogueBank = {};
    scaffold.characters?.forEach((char: any) => {
      dialogueBank[char.id] = {
        greetings: [`Hello there.`],
        responses: [`I see.`, `Interesting.`],
        style: char.dialogueStyle || 'neutral'
      };
    });
    return dialogueBank;
  }

  private populateQuestLog(scaffold: any) {
    return {
      mainQuests: scaffold.episodes?.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        objectives: ep.objectives || []
      })) || [],
      sideQuests: []
    };
  }

  private populateDailyLife(scaffold: any) {
    return {
      activities: scaffold.locations?.flatMap((loc: any) => 
        loc.activities?.map((activity: string) => ({
          id: `${loc.id}_${activity}`,
          name: activity,
          location: loc.id,
          available: true
        })) || []
      ) || []
    };
  }

  private populateRelationships(scaffold: any) {
    const relationships = {};
    scaffold.characters?.forEach((char: any) => {
      if (char.role === 'love_interest' || char.role === 'protagonist') {
        relationships[char.id] = {
          affection: 0,
          intimacy: 0,
          trust: 0,
          status: 'acquaintance'
        };
      }
    });
    return relationships;
  }

  private populateWorldMap(scaffold: any) {
    return {
      locations: scaffold.locations?.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        unlocked: loc.id === scaffold.locations[0]?.id,
        coordinates: { x: 0, y: 0 }
      })) || []
    };
  }

  private populateMoodEngine(scaffold: any) {
    const moods = {};
    scaffold.characters?.forEach((char: any) => {
      moods[char.id] = {
        current: 'neutral',
        base: char.personality?.[0] || 'neutral',
        modifiers: []
      };
    });
    return moods;
  }

  private populateEpisodicEngine(scaffold: any) {
    return {
      episodes: scaffold.episodes || [],
      currentEpisode: scaffold.episodes?.[0]?.id || null,
      currentBeat: scaffold.episodes?.[0]?.beats?.[0]?.id || null,
      progressTracking: {}
    };
  }

  async refineStoryElement(elementType: string, elementId: string, userFeedback: string, currentScaffold: StoryScaffold): Promise<any> {
    console.log(`🔧 Refining ${elementType}: ${elementId} based on user feedback`);
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
You are refining a story element based on user feedback. 

ELEMENT TYPE: ${elementType}
ELEMENT ID: ${elementId}
USER FEEDBACK: "${userFeedback}"

CURRENT ELEMENT: ${JSON.stringify(this.getElementFromScaffold(currentScaffold, elementType, elementId))}

Based on the user's feedback, modify and improve this element while maintaining consistency with the overall story. Return the refined element as JSON.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse refinement response:', error);
      return null;
    }
  }

  private getElementFromScaffold(scaffold: StoryScaffold, elementType: string, elementId: string): any {
    switch (elementType) {
      case 'character':
        return scaffold.characters.find(c => c.id === elementId);
      case 'location':
        return scaffold.locations.find(l => l.id === elementId);
      case 'episode':
        return scaffold.episodes.find(e => e.id === elementId);
      default:
        return null;
    }
  }
}

export const aiStoryArchitect = new AIStoryArchitect();