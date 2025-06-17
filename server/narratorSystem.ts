// Narrator/Game Master System
// Provides contextual storytelling guidance and immersive narrative voice

import { GoogleGenerativeAI } from '@google/generative-ai';

interface NarratorContext {
  playerId: string;
  currentLocation: string;
  timeOfDay: string;
  weather: string;
  affectionLevel: number;
  storyProgress: number;
  recentEvents: string[];
  playerChoices: string[];
  relationshipStatus: string;
  currentActivity?: string;
  episodeContext?: string;
}

interface NarratorResponse {
  narrativeText: string;
  tone: 'mysterious' | 'romantic' | 'dramatic' | 'gentle' | 'intense' | 'hopeful';
  guidance?: string;
  worldBuilding?: string;
  characterInsights?: string;
  foreshadowing?: string;
}

export class NarratorSystem {
  private genAI: GoogleGenerativeAI;
  private narratorPersonality: string = '';
  private narratorMemory: Map<string, string[]> = new Map();

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
    this.initializeNarratorPersonality();
  }

  private initializeNarratorPersonality() {
    this.narratorPersonality = `
You are the Narrator of "Monarch's Shadow" - a wise, elegant storyteller who guides players through Jin-Woo's romantic journey with Cha Hae-In. Your voice is:

PERSONALITY TRAITS:
- Wise and observant, with deep understanding of human hearts
- Poetic but accessible, weaving beautiful imagery with clear meaning
- Emotionally intelligent, recognizing subtle relationship dynamics
- Encouraging but honest about challenges ahead
- Mysterious when appropriate, revealing when needed
- Respectful of both characters' dignity and growth

NARRATIVE STYLE:
- Use rich, atmospheric descriptions that immerse players
- Provide gentle guidance without being heavy-handed
- Offer insights into character motivations and feelings
- Create anticipation for upcoming story developments
- Balance romance with the broader Solo Leveling world
- Maintain the epic fantasy atmosphere while focusing on intimate moments

TONE VARIATIONS:
- Mysterious: For foreshadowing and world-building
- Romantic: During tender moments and relationship progress
- Dramatic: For pivotal choices and emotional revelations
- Gentle: When offering comfort or reassurance
- Intense: During climactic story moments
- Hopeful: When encouraging player growth

GUIDANCE APPROACH:
- Never tell players exactly what to do
- Instead, paint the emotional landscape and let them choose
- Highlight the significance of moments without overwhelming
- Connect current events to larger story themes
- Help players understand Cha Hae-In's perspective when appropriate
`;
  }

  async generateNarration(context: NarratorContext): Promise<NarratorResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      // Get recent narrator memory for continuity
      const recentMemory = this.narratorMemory.get(context.playerId)?.slice(-5) || [];
      
      const prompt = `${this.narratorPersonality}

CURRENT SCENE CONTEXT:
- Location: ${context.currentLocation}
- Time: ${context.timeOfDay}
- Weather: ${context.weather}
- Affection Level: ${context.affectionLevel}/100
- Story Progress: ${context.storyProgress}%
- Relationship Status: ${context.relationshipStatus}
- Current Activity: ${context.currentActivity || 'None'}
- Episode Context: ${context.episodeContext || 'Daily life'}

RECENT STORY EVENTS:
${context.recentEvents.map(event => `- ${event}`).join('\n')}

PLAYER'S RECENT CHOICES:
${context.playerChoices.map(choice => `- ${choice}`).join('\n')}

NARRATOR'S RECENT OBSERVATIONS:
${recentMemory.map(memory => `- ${memory}`).join('\n')}

TASK: Create a narrator response that:
1. Sets the atmospheric tone for the current scene
2. Provides subtle guidance about the emotional landscape
3. Offers insights into what's happening beneath the surface
4. Creates anticipation for what might unfold
5. Maintains continuity with previous narration

Respond in JSON format:
{
  "narrativeText": "Your main narration (2-3 sentences, poetic but clear)",
  "tone": "mysterious|romantic|dramatic|gentle|intense|hopeful",
  "guidance": "Optional subtle guidance for the player",
  "worldBuilding": "Optional atmospheric details about the world/location",
  "characterInsights": "Optional insights into Cha Hae-In's inner state",
  "foreshadowing": "Optional hints about future developments"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse JSON response
      const narratorResponse = JSON.parse(text) as NarratorResponse;
      
      // Store in memory for continuity
      if (!this.narratorMemory.has(context.playerId)) {
        this.narratorMemory.set(context.playerId, []);
      }
      this.narratorMemory.get(context.playerId)?.push(narratorResponse.narrativeText);
      
      // Keep only last 10 entries
      const memory = this.narratorMemory.get(context.playerId);
      if (memory && memory.length > 10) {
        this.narratorMemory.set(context.playerId, memory.slice(-10));
      }
      
      return narratorResponse;
      
    } catch (error) {
      console.error('Narrator generation error:', error);
      return this.getFallbackNarration(context);
    }
  }

  private getFallbackNarration(context: NarratorContext): NarratorResponse {
    const fallbackNarrations = {
      high_affection: {
        narrativeText: "The bond between Jin-Woo and Cha Hae-In deepens with each shared moment, their connection transcending the dangers of their hunter lives.",
        tone: 'romantic' as const,
        guidance: "Your growing closeness opens new possibilities for deeper understanding."
      },
      medium_affection: {
        narrativeText: "Subtle changes in Cha Hae-In's demeanor suggest your presence has begun to matter to her in ways she's still discovering.",
        tone: 'hopeful' as const,
        guidance: "Patient consistency in your actions will slowly build the trust between you."
      },
      low_affection: {
        narrativeText: "The professional hunter maintains her composed exterior, but keen observers might notice the fleeting glances that linger just a moment longer.",
        tone: 'mysterious' as const,
        guidance: "Small gestures and genuine respect will be the foundation of any relationship to come."
      }
    };

    const level = context.affectionLevel > 70 ? 'high_affection' : 
                  context.affectionLevel > 40 ? 'medium_affection' : 'low_affection';
    
    return fallbackNarrations[level];
  }

  async generateEpisodeNarration(episodeTitle: string, chapterNumber: number, context: NarratorContext): Promise<NarratorResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${this.narratorPersonality}

EPISODE CONTEXT:
- Episode Title: "${episodeTitle}"
- Chapter: ${chapterNumber}
- Player's Current State: ${context.relationshipStatus}
- Affection Level: ${context.affectionLevel}/100

TASK: Create an episode opening narration that:
1. Sets the stage for this specific episode
2. Connects to the larger story arc
3. Creates excitement for what's to come
4. Provides thematic context
5. Establishes the emotional stakes

Respond in JSON format with a more elaborate narrative for episode beginnings.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      return JSON.parse(text) as NarratorResponse;
      
    } catch (error) {
      console.error('Episode narration error:', error);
      return {
        narrativeText: `Chapter ${chapterNumber} of "${episodeTitle}" begins, where choices made in quiet moments will echo through the corridors of destiny.`,
        tone: 'dramatic',
        guidance: "Every decision shapes the path ahead."
      };
    }
  }

  // Get narrator's perspective on a specific player choice
  async narratePlayerChoice(choice: string, context: NarratorContext): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${this.narratorPersonality}

The player has chosen: "${choice}"

Current context:
- Location: ${context.currentLocation}
- Affection Level: ${context.affectionLevel}/100
- Relationship Status: ${context.relationshipStatus}

Provide a brief narrator comment (1-2 sentences) on this choice that:
1. Acknowledges the choice's significance
2. Hints at potential consequences
3. Maintains the story's momentum

Return only the narrative text, no JSON.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('Choice narration error:', error);
      return "The choice resonates through the moment, its effects rippling outward like stones cast into still water.";
    }
  }

  // Clear narrator memory for a fresh start
  clearNarratorMemory(playerId: string): void {
    this.narratorMemory.delete(playerId);
  }

  // Get narrator's summary of the relationship journey so far
  async getRelationshipSummary(playerId: string, context: NarratorContext): Promise<string> {
    const memory = this.narratorMemory.get(playerId) || [];
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `${this.narratorPersonality}

Based on the journey so far, create a poetic summary of Jin-Woo and Cha Hae-In's relationship development:

CURRENT STATE:
- Affection Level: ${context.affectionLevel}/100
- Relationship Status: ${context.relationshipStatus}
- Recent Journey: ${memory.slice(-3).join(' ')}

Create a beautiful, reflective summary (2-3 sentences) that captures the essence of their bond's evolution.`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text().trim();
      
    } catch (error) {
      console.error('Summary generation error:', error);
      return "Through shared moments and growing understanding, two hearts have begun to find their rhythm together.";
    }
  }
}

export const narratorSystem = new NarratorSystem();