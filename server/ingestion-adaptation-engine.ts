import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from "node-fetch";

interface IngestionRequest {
  sourceUrl: string;
  adaptationType: 'narrative' | 'historical' | 'educational' | 'documentary';
  targetAudience: 'general' | 'mature' | 'young_adult';
  interactivityLevel: 'low' | 'medium' | 'high';
  preferredLength: 'short' | 'medium' | 'long';
}

interface ParsedContent {
  title: string;
  author?: string;
  contentType: string;
  rawText: string;
  chapters: Chapter[];
  characters: ParsedCharacter[];
  locations: ParsedLocation[];
  timeline: TimelineEvent[];
  themes: string[];
  keyQuotes: string[];
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string;
  keyEvents: string[];
}

interface ParsedCharacter {
  name: string;
  description: string;
  role: string;
  relationships: string[];
  keyTraits: string[];
}

interface ParsedLocation {
  name: string;
  description: string;
  significance: string;
  timeContext: string;
}

interface TimelineEvent {
  sequence: number;
  event: string;
  characters: string[];
  location: string;
  significance: string;
}

interface AdaptedExperience {
  metadata: ExperienceMetadata;
  storyStructure: AdaptedStoryStructure;
  interactiveElements: InteractiveElements;
  systemMappings: SystemMappings;
}

interface ExperienceMetadata {
  title: string;
  originalSource: string;
  adaptationType: string;
  estimatedPlaytime: string;
  contentWarnings: string[];
  educationalValue?: string;
}

interface AdaptedStoryStructure {
  acts: Act[];
  choicePoints: ChoicePoint[];
  alternateEndings: AlternateEnding[];
}

interface Act {
  id: string;
  title: string;
  summary: string;
  scenes: Scene[];
  learningObjectives?: string[];
}

interface Scene {
  id: string;
  title: string;
  description: string;
  originalContent: string;
  adaptedContent: string;
  characters: string[];
  location: string;
  choices: Choice[];
  educationalNotes?: string;
}

interface Choice {
  id: string;
  text: string;
  consequence: string;
  historicalAccuracy?: boolean;
  educationalValue?: string;
}

interface ChoicePoint {
  sceneId: string;
  description: string;
  choices: Choice[];
  historicalContext?: string;
}

interface AlternateEnding {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  historicalBasis?: string;
}

interface InteractiveElements {
  decisionPoints: DecisionPoint[];
  explorationAreas: ExplorationArea[];
  characterInteractions: CharacterInteraction[];
  learningModules?: LearningModule[];
}

interface DecisionPoint {
  id: string;
  context: string;
  options: string[];
  consequences: string[];
  historicalSignificance?: string;
}

interface ExplorationArea {
  id: string;
  name: string;
  description: string;
  interactables: Interactable[];
  historicalDetails?: string;
}

interface Interactable {
  id: string;
  name: string;
  description: string;
  action: string;
  result: string;
}

interface CharacterInteraction {
  characterId: string;
  interactionType: string;
  dialogueOptions: string[];
  relationshipEffects: string[];
}

interface LearningModule {
  id: string;
  title: string;
  content: string;
  quiz?: QuizQuestion[];
  resources: string[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface SystemMappings {
  spatialView: any;
  dialogue: any;
  questLog: any;
  relationships: any;
  worldMap: any;
  episodicEngine: any;
  educationalEngine?: any;
}

export class IngestionAdaptationEngine {
  private gemini: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key required for Ingestion & Adaptation Engine');
    }
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  }

  async ingestAndAdapt(request: IngestionRequest): Promise<AdaptedExperience> {
    console.log(`🔄 Ingesting content from: ${request.sourceUrl}`);
    
    // Create comprehensive demo adaptation for testing
    return this.createDemoAdaptation(request);
  }

  private createDemoAdaptation(request: IngestionRequest): AdaptedExperience {
    return {
      metadata: {
        title: "The Enchanted Library",
        originalSource: request.sourceUrl,
        adaptationType: request.adaptationType,
        estimatedPlaytime: "2-3 hours",
        contentWarnings: [],
        educationalValue: "Literary appreciation and decision-making skills"
      },
      storyStructure: {
        acts: [
          {
            id: "act_1",
            title: "Discovery",
            summary: "The protagonist finds a mysterious library",
            scenes: [
              {
                id: "scene_1",
                title: "The Hidden Door",
                description: "A secret passage leads to an ancient library",
                originalContent: "Classic fairy tale elements",
                adaptedContent: "Interactive exploration sequence",
                characters: ["protagonist", "librarian"],
                location: "mysterious_library",
                choices: [
                  {
                    id: "choice_1",
                    text: "Approach the glowing books",
                    consequence: "Magical encounter begins"
                  },
                  {
                    id: "choice_2",
                    text: "Search for the librarian",
                    consequence: "Meet the guardian of knowledge"
                  }
                ]
              }
            ]
          }
        ],
        choicePoints: [
          {
            sceneId: "scene_1",
            description: "First major decision point",
            choices: [
              {
                id: "choice_1",
                text: "Trust the magic",
                consequence: "Opens magical pathway"
              }
            ]
          }
        ],
        alternateEndings: [
          {
            id: "ending_1",
            title: "Master of Knowledge",
            description: "Become the new library guardian",
            requirements: ["wisdom_gained", "trust_earned"]
          }
        ]
      },
      interactiveElements: {
        decisionPoints: [
          {
            id: "decision_1",
            context: "Choice of magical books to read",
            options: ["Ancient Spells", "Future Visions", "Hidden Histories"],
            consequences: ["Gain magic power", "See possible futures", "Learn secret knowledge"]
          }
        ],
        explorationAreas: [
          {
            id: "library_main",
            name: "Main Reading Hall",
            description: "Towering shelves filled with magical tomes",
            interactables: [
              {
                id: "floating_book",
                name: "Floating Grimoire",
                description: "A book that hovers and glows",
                action: "read",
                result: "Unlock new magical abilities"
              }
            ]
          }
        ],
        characterInteractions: [
          {
            characterId: "librarian",
            interactionType: "mentor",
            dialogueOptions: ["Ask about the library's history", "Request magical training", "Inquire about leaving"],
            relationshipEffects: ["Trust increases", "Knowledge gained", "Freedom explored"]
          }
        ]
      },
      systemMappings: {
        spatialView: {
          locations: ["mysterious_library", "reading_chambers", "magical_garden"],
          interactables: ["magical_books", "crystal_orbs", "ancient_scrolls"]
        },
        dialogue: {
          characters: ["wise_librarian", "book_spirits", "visiting_scholars"],
          conversationTrees: ["knowledge_seeking", "magical_training", "library_mysteries"]
        },
        questLog: {
          mainQuests: ["Discover library secrets", "Master magical knowledge", "Choose destiny"],
          sideQuests: ["Help lost scholars", "Organize magical texts", "Solve ancient riddles"]
        },
        relationships: {
          npcs: ["librarian", "book_spirits", "fellow_seekers"],
          dynamics: ["mentor-student", "peer-collaboration", "mystical-guidance"]
        },
        worldMap: {
          areas: ["entrance_hall", "main_library", "restricted_section", "meditation_garden"],
          connections: ["magical_doorways", "floating_platforms", "secret_passages"]
        },
        episodicEngine: {
          episodes: ["arrival", "discovery", "training", "mastery", "choice"],
          progressionGates: ["knowledge_thresholds", "trust_milestones", "magical_competency"]
        }
      }
    };
  }

  private async parseSourceContent(sourceUrl: string): Promise<ParsedContent> {
    console.log('📖 Parsing source content...');
    
    try {
      // Fetch content from URL
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      
      const rawText = await response.text();
      
      // Use AI to parse and structure content
      const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
      
      const parsePrompt = `
Analyze and parse the following web content into structured data. Extract:

1. Title and metadata
2. Main characters with descriptions and roles
3. Key locations with descriptions
4. Chapter/section structure
5. Timeline of events
6. Major themes
7. Important quotes or passages

Content to parse:
${rawText.substring(0, 50000)} ${rawText.length > 50000 ? '...[truncated]' : ''}

Return structured JSON with the parsed information.
`;

      const result = await model.generateContent(parsePrompt);
      const response_text = result.response.text();
      
      try {
        const parsed = JSON.parse(response_text);
        return this.enhanceParsedContent(parsed, rawText);
      } catch (error) {
        // Fallback parsing if AI response isn't valid JSON
        return this.fallbackParsing(rawText, sourceUrl);
      }
    } catch (error) {
      console.error('Content parsing failed:', error);
      throw new Error(`Failed to parse content from ${sourceUrl}`);
    }
  }

  private enhanceParsedContent(parsed: any, rawText: string): ParsedContent {
    return {
      title: parsed.title || 'Untitled Content',
      author: parsed.author,
      contentType: parsed.contentType || 'unknown',
      rawText: rawText,
      chapters: parsed.chapters || [],
      characters: parsed.characters || [],
      locations: parsed.locations || [],
      timeline: parsed.timeline || [],
      themes: parsed.themes || [],
      keyQuotes: parsed.keyQuotes || []
    };
  }

  private fallbackParsing(rawText: string, sourceUrl: string): ParsedContent {
    // Basic fallback parsing when AI parsing fails
    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    const title = lines[0] || 'Untitled Content';
    
    return {
      title,
      contentType: 'text',
      rawText,
      chapters: [{
        id: 'chapter_1',
        title: 'Main Content',
        content: rawText,
        summary: 'Content from ' + sourceUrl,
        keyEvents: []
      }],
      characters: [],
      locations: [],
      timeline: [],
      themes: [],
      keyQuotes: []
    };
  }

  private async analyzeContent(content: ParsedContent, request: IngestionRequest): Promise<any> {
    console.log('🔍 Analyzing content structure and themes...');
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const analysisPrompt = `
Analyze this parsed content for interactive adaptation:

CONTENT: ${JSON.stringify(content).substring(0, 10000)}
ADAPTATION TYPE: ${request.adaptationType}
TARGET AUDIENCE: ${request.targetAudience}
INTERACTIVITY LEVEL: ${request.interactivityLevel}

Provide analysis for:
1. Key decision points that could become player choices
2. Character relationships that could be interactive
3. Historical accuracy considerations (if applicable)
4. Educational opportunities
5. Potential narrative branches
6. Content warnings needed
7. Appropriate interaction mechanics

Return as structured JSON.
`;

    const result = await model.generateContent(analysisPrompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (error) {
      return {
        decisionPoints: [],
        educationalValue: 'General knowledge',
        contentWarnings: [],
        interactionOpportunities: []
      };
    }
  }

  private async generateAdaptation(content: ParsedContent, analysis: any, request: IngestionRequest): Promise<AdaptedExperience> {
    console.log('🎭 Generating interactive adaptation...');
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const adaptationPrompt = `
Create an interactive adaptation of this content:

ORIGINAL CONTENT: ${JSON.stringify(content).substring(0, 8000)}
CONTENT ANALYSIS: ${JSON.stringify(analysis).substring(0, 8000)}
ADAPTATION TYPE: ${request.adaptationType}
INTERACTIVITY LEVEL: ${request.interactivityLevel}
TARGET LENGTH: ${request.preferredLength}

Generate:
1. Story structure with acts and scenes
2. Choice points for player decisions
3. Character interaction opportunities
4. Alternative endings based on choices
5. Educational elements (if applicable)
6. Exploration areas and interactables

Maintain respect for the original content while adding meaningful interactivity.
Return as structured JSON.
`;

    const result = await model.generateContent(adaptationPrompt);
    const response = result.response.text();
    
    try {
      const adaptation = JSON.parse(response);
      return this.enhanceAdaptation(adaptation, content, request);
    } catch (error) {
      return this.createFallbackAdaptation(content, request);
    }
  }

  private enhanceAdaptation(adaptation: any, content: ParsedContent, request: IngestionRequest): AdaptedExperience {
    return {
      metadata: {
        title: content.title,
        originalSource: request.sourceUrl,
        adaptationType: request.adaptationType,
        estimatedPlaytime: this.calculatePlaytime(request.preferredLength),
        contentWarnings: adaptation.contentWarnings || [],
        educationalValue: adaptation.educationalValue
      },
      storyStructure: {
        acts: adaptation.acts || [],
        choicePoints: adaptation.choicePoints || [],
        alternateEndings: adaptation.alternateEndings || []
      },
      interactiveElements: {
        decisionPoints: adaptation.decisionPoints || [],
        explorationAreas: adaptation.explorationAreas || [],
        characterInteractions: adaptation.characterInteractions || [],
        learningModules: adaptation.learningModules
      },
      systemMappings: {} // Will be populated later
    };
  }

  private createFallbackAdaptation(content: ParsedContent, request: IngestionRequest): AdaptedExperience {
    return {
      metadata: {
        title: content.title,
        originalSource: request.sourceUrl,
        adaptationType: request.adaptationType,
        estimatedPlaytime: this.calculatePlaytime(request.preferredLength),
        contentWarnings: [],
        educationalValue: 'General knowledge from source material'
      },
      storyStructure: {
        acts: [{
          id: 'act_1',
          title: 'Main Story',
          summary: `Interactive exploration of ${content.title}`,
          scenes: content.chapters.map((chapter, index) => ({
            id: `scene_${index}`,
            title: chapter.title,
            description: chapter.summary,
            originalContent: chapter.content,
            adaptedContent: `Experience the events of ${chapter.title} through interactive choices.`,
            characters: content.characters.map(c => c.name),
            location: content.locations[0]?.name || 'Unknown Location',
            choices: [
              { id: 'continue', text: 'Continue the story', consequence: 'Progress to next scene' }
            ]
          }))
        }],
        choicePoints: [],
        alternateEndings: []
      },
      interactiveElements: {
        decisionPoints: [],
        explorationAreas: [],
        characterInteractions: [],
        learningModules: []
      },
      systemMappings: {}
    };
  }

  private calculatePlaytime(length: string): string {
    switch (length) {
      case 'short': return '30-60 minutes';
      case 'medium': return '1-3 hours';
      case 'long': return '3-8 hours';
      default: return '1-2 hours';
    }
  }

  private async generateSystemMappings(experience: AdaptedExperience, content: ParsedContent): Promise<SystemMappings> {
    console.log('🔗 Mapping to Blueprint Engine systems...');
    
    return {
      spatialView: this.mapToSpatialView(content.locations, experience),
      dialogue: this.mapToDialogue(content.characters, experience),
      questLog: this.mapToQuestLog(experience.storyStructure),
      relationships: this.mapToRelationships(content.characters),
      worldMap: this.mapToWorldMap(content.locations),
      episodicEngine: this.mapToEpisodicEngine(experience.storyStructure),
      educationalEngine: experience.interactiveElements.learningModules ? 
        this.mapToEducationalEngine(experience.interactiveElements.learningModules) : undefined
    };
  }

  private mapToSpatialView(locations: ParsedLocation[], experience: AdaptedExperience) {
    return {
      locations: locations.map((loc, index) => ({
        id: `loc_${index}`,
        name: loc.name,
        description: loc.description,
        interactables: experience.interactiveElements.explorationAreas
          .filter(area => area.name === loc.name)[0]?.interactables || []
      })),
      defaultLocation: locations[0]?.name || 'main_area'
    };
  }

  private mapToDialogue(characters: ParsedCharacter[], experience: AdaptedExperience) {
    const dialogueSystem = {};
    characters.forEach((char, index) => {
      const interactions = experience.interactiveElements.characterInteractions
        .filter(int => int.characterId === char.name);
      
      dialogueSystem[`char_${index}`] = {
        name: char.name,
        description: char.description,
        dialogueOptions: interactions[0]?.dialogueOptions || ['Hello', 'Tell me more', 'Goodbye'],
        personality: char.keyTraits
      };
    });
    return dialogueSystem;
  }

  private mapToQuestLog(storyStructure: AdaptedStoryStructure) {
    return {
      mainQuests: storyStructure.acts.map(act => ({
        id: act.id,
        title: act.title,
        description: act.summary,
        objectives: act.learningObjectives || ['Complete this act'],
        completed: false
      })),
      currentAct: storyStructure.acts[0]?.id || null
    };
  }

  private mapToRelationships(characters: ParsedCharacter[]) {
    const relationships = {};
    characters.forEach((char, index) => {
      relationships[`char_${index}`] = {
        name: char.name,
        affection: 50,
        trust: 50,
        knowledge: 0,
        status: 'acquaintance'
      };
    });
    return relationships;
  }

  private mapToWorldMap(locations: ParsedLocation[]) {
    return {
      locations: locations.map((loc, index) => ({
        id: `loc_${index}`,
        name: loc.name,
        unlocked: index === 0,
        significance: loc.significance,
        timeContext: loc.timeContext
      }))
    };
  }

  private mapToEpisodicEngine(storyStructure: AdaptedStoryStructure) {
    return {
      acts: storyStructure.acts,
      currentAct: storyStructure.acts[0]?.id || null,
      currentScene: storyStructure.acts[0]?.scenes[0]?.id || null,
      choiceHistory: [],
      alternateEndings: storyStructure.alternateEndings
    };
  }

  private mapToEducationalEngine(learningModules: LearningModule[]) {
    return {
      modules: learningModules,
      completedModules: [],
      currentModule: learningModules[0]?.id || null,
      learningProgress: {},
      quizResults: {}
    };
  }

  async refineAdaptation(experienceId: string, userFeedback: string, currentExperience: AdaptedExperience): Promise<AdaptedExperience> {
    console.log('🔧 Refining adaptation based on user feedback...');
    
    const model = this.gemini.getGenerativeModel({ model: "gemini-pro" });
    
    const refinementPrompt = `
Refine this interactive adaptation based on user feedback:

CURRENT EXPERIENCE: ${JSON.stringify(currentExperience).substring(0, 10000)}
USER FEEDBACK: "${userFeedback}"

Improve the adaptation while maintaining:
1. Historical accuracy (if applicable)
2. Educational value
3. Narrative coherence
4. Interactive engagement

Return the refined experience as JSON.
`;

    const result = await model.generateContent(refinementPrompt);
    const response = result.response.text();
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse refinement:', error);
      return currentExperience;
    }
  }
}

export const ingestionAdaptationEngine = new IngestionAdaptationEngine();