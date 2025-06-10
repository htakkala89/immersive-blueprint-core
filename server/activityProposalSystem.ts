import type { GameState, ScheduledActivity, ActivityProposal } from "@shared/schema";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

interface ActivityDetectionResult {
  isActivityProposal: boolean;
  activityType?: string;
  suggestedLocation?: string;
  suggestedTime?: string;
  confidence: number;
}

interface ActivityNegotiationResponse {
  response: string;
  status: 'negotiating' | 'agreed' | 'declined' | 'rescheduling';
  scheduledActivity?: ScheduledActivity;
  counterProposal?: {
    location?: string;
    time?: string;
    activityType?: string;
  };
}

export class ActivityProposalSystem {
  
  // Detect if user message is proposing an activity
  static detectActivityProposal(userMessage: string, gameState: GameState): ActivityDetectionResult {
    const message = userMessage.toLowerCase();
    
    // Activity keywords and patterns
    const dinnerKeywords = ['dinner', 'eat', 'restaurant', 'meal', 'food', 'dine'];
    const coffeeKeywords = ['coffee', 'cafe', 'drink', 'tea', 'latte'];
    const dateKeywords = ['date', 'go out', 'hang out', 'spend time'];
    const movieKeywords = ['movie', 'film', 'cinema', 'watch'];
    const walkKeywords = ['walk', 'stroll', 'park', 'outside'];
    const shoppingKeywords = ['shopping', 'mall', 'buy', 'store'];
    const intimateKeywords = ['together', 'alone', 'private', 'close'];
    
    // Time indicators
    const timePatterns = ['tonight', 'today', 'tomorrow', 'later', 'this evening', 'after work'];
    
    // Location indicators
    const locationPatterns = ['myeongdong', 'hongdae', 'cafe', 'restaurant', 'apartment', 'home'];
    
    let activityType = '';
    let confidence = 0;
    let suggestedTime = '';
    let suggestedLocation = '';
    
    // Check for activity types
    if (dinnerKeywords.some(keyword => message.includes(keyword))) {
      activityType = 'dinner';
      confidence += 30;
    } else if (coffeeKeywords.some(keyword => message.includes(keyword))) {
      activityType = 'coffee';
      confidence += 25;
    } else if (movieKeywords.some(keyword => message.includes(keyword))) {
      activityType = 'movie';
      confidence += 25;
    } else if (walkKeywords.some(keyword => message.includes(keyword))) {
      activityType = 'walk';
      confidence += 20;
    } else if (shoppingKeywords.some(keyword => message.includes(keyword))) {
      activityType = 'shopping';
      confidence += 20;
    }
    
    // Check for invitation phrases
    const invitationPhrases = [
      'do you want to', 'would you like to', 'want to go', 'let\'s go', 'how about',
      'are you free', 'interested in', 'feel like', 'up for'
    ];
    
    if (invitationPhrases.some(phrase => message.includes(phrase))) {
      confidence += 40;
    }
    
    // Check for time suggestions
    timePatterns.forEach(pattern => {
      if (message.includes(pattern)) {
        confidence += 15;
        suggestedTime = pattern;
      }
    });
    
    // Check for location suggestions
    locationPatterns.forEach(pattern => {
      if (message.includes(pattern)) {
        confidence += 10;
        suggestedLocation = pattern;
      }
    });
    
    // Question marks increase likelihood
    if (message.includes('?')) {
      confidence += 10;
    }
    
    return {
      isActivityProposal: confidence >= 50,
      activityType: activityType || 'date',
      suggestedLocation,
      suggestedTime,
      confidence
    };
  }
  
  // Generate Cha Hae-In's response to activity proposal
  static async generateActivityResponse(
    proposal: ActivityDetectionResult,
    userMessage: string,
    gameState: GameState
  ): Promise<ActivityNegotiationResponse> {
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });
    
    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : currentHour < 21 ? 'evening' : 'night';
    
    const contextPrompt = `
    You are Cha Hae-In from Solo Leveling, responding to ${userMessage}

    Current Context:
    - Affection Level: ${gameState.affectionLevel}/100
    - Current Location: ${gameState.currentScene || 'hunter_association'}
    - Time: ${timeOfDay}
    - Relationship Status: ${gameState.relationshipStatus}
    - Energy: ${gameState.energy}/${gameState.maxEnergy}
    
    Activity Proposal Details:
    - Type: ${proposal.activityType}
    - Suggested Time: ${proposal.suggestedTime || 'not specified'}
    - Suggested Location: ${proposal.suggestedLocation || 'not specified'}
    
    PERSONALITY GUIDELINES:
    - Professional S-rank hunter who takes her work seriously
    - Subtle, intelligent responses with dry wit
    - Not easily impressed but can be charmed
    - Values competence and directness
    - Becomes more open as affection increases
    
    RESPONSE RULES:
    1. React realistically based on current context and relationship level
    2. If affection < 30: Be polite but cautious, might suggest work obligations
    3. If affection 30-60: Show interest but with conditions or questions
    4. If affection 60+: Be more enthusiastic and playful
    5. Consider her current energy and schedule
    6. Include physical actions in parentheses (raises eyebrow, adjusts sword, etc.)
    7. Ask follow-up questions about specifics (time, place, what kind of establishment)
    8. Show her personality through teasing or professional concerns
    
    DECISION OUTCOMES:
    - If declining: Explain why (busy, tired, other commitments)
    - If interested: Ask for more details or suggest alternatives
    - If agreeing: Show enthusiasm appropriate to relationship level
    
    Respond as Cha Hae-In with a realistic reaction. Include whether you're agreeing, declining, or want to negotiate details.
    `;
    
    try {
      const result = await model.generateContent(contextPrompt);
      const response = result.response.text();
      
      // Analyze response to determine status
      const responseLower = response.toLowerCase();
      let status: 'negotiating' | 'agreed' | 'declined' | 'rescheduling' = 'negotiating';
      
      if (responseLower.includes('yes') || responseLower.includes('sure') || responseLower.includes('love to') || responseLower.includes('sounds good')) {
        status = 'agreed';
      } else if (responseLower.includes('no') || responseLower.includes('can\'t') || responseLower.includes('busy') || responseLower.includes('another time')) {
        status = 'declined';
      } else if (responseLower.includes('maybe') || responseLower.includes('perhaps') || responseLower.includes('how about') || responseLower.includes('what about')) {
        status = 'rescheduling';
      }
      
      // If she agreed, create scheduled activity
      let scheduledActivity: ScheduledActivity | undefined;
      
      if (status === 'agreed') {
        const activityType = proposal.activityType || 'dinner';
        const activityId = `${activityType}_${Date.now()}`;
        const now = new Date();
        
        // Default to evening if no time specified
        let scheduledTime = proposal.suggestedTime || 'this evening';
        if (scheduledTime === 'tonight' || scheduledTime === 'this evening') {
          now.setHours(19, 0, 0, 0); // 7 PM
        } else if (scheduledTime === 'tomorrow') {
          now.setDate(now.getDate() + 1);
          now.setHours(19, 0, 0, 0);
        }
        
        // Default location based on activity type
        let location = proposal.suggestedLocation || '';
        if (!location) {
          switch (activityType) {
            case 'dinner':
              location = 'myeongdong_restaurant';
              break;
            case 'coffee':
              location = 'hongdae_cafe';
              break;
            case 'movie':
              location = 'myeongdong_restaurant'; // Cinema area
              break;
            case 'walk':
              location = 'hongdae_cafe'; // Park area
              break;
            default:
              location = 'myeongdong_restaurant';
          }
        }
        
        scheduledActivity = {
          id: activityId,
          type: activityType as any,
          title: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} with Cha Hae-In`,
          description: `A ${activityType} date with Cha Hae-In at ${location}`,
          location,
          scheduledTime: now.toISOString(),
          status: 'confirmed',
          participants: ['player', 'cha_hae_in'],
          requirements: {
            affectionLevel: 20,
            energy: 15,
          },
          rewards: {
            affection: 10,
            experience: 50,
          },
          conversationContext: userMessage,
        };
      }
      
      return {
        response,
        status,
        scheduledActivity,
      };
      
    } catch (error) {
      console.error('Activity response generation error:', error);
      // Fallback response
      return {
        response: "(Cha Hae-In looks up from her paperwork, considering your proposal) That's... an interesting suggestion, Jin-Woo. Let me think about it.",
        status: 'negotiating',
      };
    }
  }
  
  // Check if user has enough resources for activity
  static validateActivityRequirements(activity: ScheduledActivity, gameState: GameState): {
    canParticipate: boolean;
    missingRequirements: string[];
  } {
    const missing: string[] = [];
    
    if (activity.requirements?.affectionLevel && gameState.affectionLevel < activity.requirements.affectionLevel) {
      missing.push(`Affection level ${activity.requirements.affectionLevel} required`);
    }
    
    if (activity.requirements?.energy && gameState.energy < activity.requirements.energy) {
      missing.push(`${activity.requirements.energy} energy required`);
    }
    
    if (activity.requirements?.gold && gameState.gold < activity.requirements.gold) {
      missing.push(`${activity.requirements.gold} gold required`);
    }
    
    return {
      canParticipate: missing.length === 0,
      missingRequirements: missing,
    };
  }
}