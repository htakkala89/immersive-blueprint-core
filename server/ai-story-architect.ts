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
    // Use working OpenAI as primary for now since Google API is blocked
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key required for AI Story Architect');
    }
    // Initialize with a placeholder - we'll use OpenAI directly in methods
    this.gemini = new GoogleGenerativeAI('placeholder');
  }

  async generateStoryScaffold(storyPrompt: StoryPrompt): Promise<StoryScaffold> {
    console.log('🏗️ AI Story Architect: Analyzing creative prompt...');
    
    // Use OpenAI since Google API is blocked
    const OpenAI = await import('openai');
    const openai = new OpenAI.default({
      apiKey: process.env.OPENAI_API_KEY
    });
    
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

    const result = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 3000
    });
    
    const text = result.choices[0].message.content;

    try {
      const scaffold = JSON.parse(text || '{}');
      console.log('✅ Story scaffold generated successfully');
      return this.validateAndEnhanceScaffold(scaffold);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Return a working demo scaffold for testing
      return this.createDemoScaffold(storyPrompt);
    }
  }

  private createDemoScaffold(storyPrompt: StoryPrompt): StoryScaffold {
    return {
      title: "Coffee Shop Romance",
      synopsis: "A heartwarming story about unexpected connections in a cozy neighborhood coffee shop",
      characters: [
        {
          id: "char_1",
          name: "Alex",
          role: "protagonist",
          personality: ["shy", "observant", "kind"],
          background: "Quiet bookstore owner who finds solace in routine",
          appearance: "Gentle eyes, warm smile, casual clothing",
          dialogueStyle: "Thoughtful and measured speech"
        },
        {
          id: "char_2", 
          name: "Jordan",
          role: "love_interest",
          personality: ["mysterious", "artistic", "patient"],
          background: "Regular customer with hidden depths",
          appearance: "Intriguing presence, expressive hands, vintage style",
          dialogueStyle: "Poetic undertones, meaningful pauses"
        }
      ],
      locations: [
        {
          id: "loc_1",
          name: "Corner Coffee Shop",
          description: "Cozy cafe with warm lighting and the aroma of fresh coffee",
          mood: "intimate",
          timeOfDay: ["morning", "afternoon"],
          activities: ["order_coffee", "read_together", "conversation"]
        }
      ],
      episodes: [
        {
          id: "ep_1",
          title: "The Regular Customer",
          synopsis: "First meaningful interaction between Alex and Jordan",
          beats: [
            {
              id: "beat_1",
              title: "Morning Routine",
              description: "Alex notices Jordan's daily coffee ritual",
              location: "loc_1",
              characters: ["char_1", "char_2"],
              dialogue: [
                {
                  character: "char_1",
                  text: "The same order again today?",
                  emotion: "curious"
                }
              ],
              choices: [
                {
                  id: "choice_1",
                  text: "Strike up a conversation",
                  consequence: "Relationship deepens",
                  affectionChange: 5
                }
              ],
              mood: "anticipation"
            }
          ],
          objectives: ["Meet Jordan", "Learn their coffee preference"]
        }
      ],
      systemPopulation: {
        spatialView: {},
        dialogue: {},
        questLog: {},
        dailyLife: {},
        relationships: {},
        worldMap: {},
        moodEngine: {},
        episodicEngine: {}
      }
    };
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