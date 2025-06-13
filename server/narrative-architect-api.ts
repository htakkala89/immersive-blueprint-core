import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface EpisodeGenerationRequest {
  directorsBrief: string;
  playerLevel?: number;
  affectionLevel?: number;
}

export class NarrativeArchitectAPI {
  private systemAPIManual: string = '';
  private exampleTemplate: string = '';

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // System API Manual - Comprehensive command reference
    this.systemAPIManual = `
GAME ENGINE COMMAND REFERENCE:

Core System Commands:
- DELIVER_MESSAGE(target_system, sender, message_content) - Send messages via communicator system
- ACTIVATE_QUEST(quest_id, quest_title, quest_description) - Create and activate new quest
- SET_CHA_MOOD(mood) - Set Cha Hae-In's emotional state (happy, anxious, focused_professional, romantic, excited, worried, confident, shy, loving)
- FORCE_CHA_LOCATION(location_id, reason) - Move Cha Hae-In to specific location with narrative reason
- START_DIALOGUE_SCENE(dialogue_id, scene_context) - Begin interactive dialogue sequence
- SET_QUEST_OBJECTIVE(quest_id, objective_text) - Add specific objective to active quest
- REWARD_PLAYER(rewards) - Give rewards: {gold: number, experience: number, items: string[], affection: number}
- CREATE_MEMORY_STAR(star_id, description, rank) - Create memory star (C, B, A, S, SS ranks)
- UNLOCK_ACTIVITY(activity_id, permanent) - Unlock new daily life activities
- SET_LOCATION(location_id, time_of_day, weather) - Change scene location and atmosphere
- SHOW_NOTIFICATION(title, message, notification_type) - Display UI notification (success, warning, info)

Advanced System Commands:
- LOAD_DUNGEON_ENVIRONMENT(dungeon_id, difficulty) - Load raid environment for combat
- START_BOSS_BATTLE(boss_id, environment) - Initiate boss fight sequence
- TRIGGER_INTIMATE_SCENE(scene_type, intimacy_level) - Start intimate activity (requires high affection)
- SET_STORY_FLAG(flag_name, value) - Set persistent story progression flag
- CHECK_STORY_FLAG(flag_name) - Check if story flag exists/value
- MODIFY_RELATIONSHIP_STATUS(status_change) - Update relationship progression
- UNLOCK_LOCATION(location_id, requirements) - Make new location accessible
- SET_WEATHER(weather_type, duration) - Control environmental conditions
- SCHEDULE_FUTURE_EVENT(event_id, delay_hours) - Schedule delayed story event

Available Locations:
- hunter_association - Professional hunter headquarters
- chahaein_apartment - Cha Hae-In's personal living space  
- hongdae_cafe - Casual romantic meeting spot
- myeongdong_restaurant - Upscale dining location
- hangang_river_park - Scenic outdoor location
- nseoultower - Premium romantic destination
- luxury_hotel_suite - Ultimate intimate location

Completion Condition Types:
- player_accept - Player accepts quest or invitation
- dialogue_complete - Dialogue scene finished successfully
- boss_defeated - Specific boss enemy defeated
- location_visited - Player visits specific location
- item_obtained - Player acquires specific item
- activity_completed - Daily life activity finished
- affection_threshold - Relationship reaches level
- timer_expired - Time-based progression
- end_episode - Episode completion marker
`;

    // Load example template from existing episode
    try {
      const examplePath = path.join(__dirname, 'episodes', 'EP01_Red_Echo.json');
      if (fs.existsSync(examplePath)) {
        this.exampleTemplate = fs.readFileSync(examplePath, 'utf8');
      } else {
        // Fallback example template
        this.exampleTemplate = JSON.stringify({
          "id": "EP01_Red_Echo",
          "title": "Echoes of the Red Gate",
          "description": "A mysterious A-Rank gate appears with strange energy readings that seem connected to Jin-Woo's past.",
          "prerequisite": {
            "player_level": 25,
            "affection_level": 50
          },
          "beats": [
            {
              "beat_id": "1.0",
              "title": "Emergency Alert",
              "description": "The Hunter Association sends an urgent alert about gate anomalies",
              "trigger": { "type": "immediate" },
              "actions": [
                {
                  "type": "DELIVER_MESSAGE",
                  "target_system": "communicator",
                  "sender": "Hunter Association",
                  "message_content": "URGENT: Investigate A-Rank gate anomaly. Energy readings unprecedented."
                },
                {
                  "type": "SET_CHA_MOOD",
                  "mood": "focused_professional"
                }
              ],
              "completion_condition": {
                "type": "player_accept",
                "target": "EP01_Red_Echo"
              }
            }
          ]
        }, null, 2);
      }
    } catch (error) {
      console.error('Failed to load example template:', error);
      this.exampleTemplate = '{}';
    }
  }

  async generateEpisode(request: EpisodeGenerationRequest): Promise<any> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured. Please provide ANTHROPIC_API_KEY.');
    }

    const metaPrompt = this.constructMetaPrompt(request);

    try {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: `You are the Narrative Architect AI for a Solo Leveling romance game. You transform natural language story visions into structured episode JSON. 

CRITICAL REQUIREMENTS:
1. Output ONLY valid JSON - no explanations, no markdown, no comments
2. Follow the exact structure shown in the example template
3. Create 3-5 meaningful story beats that build a complete narrative arc
4. Use only commands from the provided API manual
5. Ensure episode ID is unique using format: EP_${Date.now()}
6. Make completion conditions logical and achievable
7. Balance romance, action, and character development based on the creator's vision`,
        messages: [
          {
            role: 'user',
            content: metaPrompt
          }
        ]
      });

      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : JSON.stringify(response.content[0]);
      
      // Parse and validate the JSON response
      try {
        const episodeData = JSON.parse(responseText);
        return this.validateEpisodeStructure(episodeData);
      } catch (parseError) {
        console.error('AI response was not valid JSON:', responseText);
        throw new Error('AI generated invalid JSON response');
      }

    } catch (error) {
      console.error('Episode generation failed:', error);
      throw new Error(`Failed to generate episode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private constructMetaPrompt(request: EpisodeGenerationRequest): string {
    return `
CREATOR'S VISION:
${request.directorsBrief}

PLAYER CONTEXT:
- Current Level: ${request.playerLevel || 10}
- Affection Level: ${request.affectionLevel || 30}

${this.systemAPIManual}

EXAMPLE TEMPLATE STRUCTURE:
${this.exampleTemplate}

Generate a complete episode JSON that brings the creator's vision to life. Use the commands from the API manual and follow the exact structure of the example template. The episode should have a clear beginning, development, and satisfying conclusion.
`;
  }

  private validateEpisodeStructure(episode: any): any {
    // Basic validation
    if (!episode.id || !episode.title || !episode.beats) {
      throw new Error('Generated episode missing required fields');
    }

    if (!Array.isArray(episode.beats) || episode.beats.length === 0) {
      throw new Error('Episode must have at least one story beat');
    }

    // Validate each beat has required fields
    for (const beat of episode.beats) {
      if (!beat.beat_id || !beat.title || !beat.actions || !beat.completion_condition) {
        throw new Error(`Story beat ${beat.beat_id || 'unknown'} missing required fields`);
      }
    }

    return episode;
  }

  async saveEpisode(episodeData: any): Promise<string> {
    try {
      const episodesDir = path.join(__dirname, 'episodes');
      if (!fs.existsSync(episodesDir)) {
        fs.mkdirSync(episodesDir, { recursive: true });
      }

      const filename = `${episodeData.id}.json`;
      const filepath = path.join(episodesDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(episodeData, null, 2));
      
      console.log(`📖 Episode saved: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('Failed to save episode:', error);
      throw new Error(`Failed to save episode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const narrativeArchitect = new NarrativeArchitectAPI();