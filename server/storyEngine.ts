import type { Choice } from "@shared/schema";

export interface StoryNode {
  id: string;
  narration: string;
  choices: Choice[];
  conditions?: (storyFlags: Record<string, boolean>, choiceHistory: string[]) => boolean;
  effects?: (storyFlags: Record<string, boolean>) => Record<string, boolean>;
  isEnding?: boolean;
  endingType?: 'victory' | 'defeat' | 'neutral' | 'secret';
}

export const STORY_NODES: Record<string, StoryNode> = {
  START: {
    id: "START",
    narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing. Your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
    choices: [
      { id: "accept_quest", icon: "💝", text: "Accept the quest", detail: "Time to level up in romance!" },
      { id: "check_stats", icon: "📊", text: "Check your stats first", detail: "What are my current abilities?" },
      { id: "explore_home", icon: "🏠", text: "Go home", detail: "Return to your daily life with Cha Hae-In" }
    ]
  },

  FIRST_MEETING: {
    id: "FIRST_MEETING",
    narration: "You find Cha Hae-In at the Hunter Association, reviewing mission reports. Her short blonde hair catches the light as she looks up with those striking purple eyes. She's surprised to see you approaching her directly.",
    choices: [
      { id: "play_cool", icon: "😎", text: "Play it cool", detail: "'Just another day's work.'" },
      { id: "be_humble", icon: "🙏", text: "Be humble", detail: "'I could learn from you.'" },
      { id: "ask_about_her", icon: "💬", text: "Ask about her missions", detail: "Show genuine interest" }
    ]
  },

  COOL_RESPONSE: {
    id: "COOL_RESPONSE", 
    narration: "Cha Hae-In raises an eyebrow at your casual demeanor. 'Just another day's work? That's quite confident coming from someone who just cleared an S-rank gate solo.' There's a hint of amusement in her voice.",
    choices: [
      { id: "actions_speak", icon: "⚔️", text: "Actions speak louder", detail: "Philosophy on strength" },
      { id: "ask_missions", icon: "🗺️", text: "Ask about her missions", detail: "Show interest in her" },
      { id: "suggest_partnership", icon: "🤝", text: "Suggest working together", detail: "Partnership proposal" }
    ]
  },

  PHILOSOPHY_MOMENT: {
    id: "PHILOSOPHY_MOMENT",
    narration: "Your words resonate with Cha Hae-In. 'You're right,' she says thoughtfully. 'I've always believed that actions define us more than words. Your recent achievements certainly speak volumes about who you are.'",
    choices: [
      { id: "share_burden", icon: "💭", text: "Share the burden of strength", detail: "Open up about the weight of power" },
      { id: "ask_her_philosophy", icon: "❓", text: "Ask about her philosophy", detail: "Learn more about her beliefs" },
      { id: "suggest_coffee", icon: "☕", text: "Suggest discussing over coffee", detail: "Move to a more personal setting" }
    ]
  },

  MISSION_DISCUSSION: {
    id: "MISSION_DISCUSSION",
    narration: "Cha Hae-In's eyes light up as she describes her recent missions. 'I've been focusing on A-rank gates with complex magical patterns. The challenge keeps me sharp.' She seems pleased by your genuine interest.",
    choices: [
      { id: "offer_help", icon: "🤝", text: "Offer to help", detail: "Volunteer for joint missions" },
      { id: "share_experience", icon: "📖", text: "Share your experience", detail: "Exchange tactical knowledge" },
      { id: "compliment_skill", icon: "⭐", text: "Compliment her skills", detail: "Acknowledge her abilities" }
    ]
  },

  PARTNERSHIP_INTEREST: {
    id: "PARTNERSHIP_INTEREST",
    narration: "Cha Hae-In considers your proposal carefully. 'A partnership? That's... unexpected. Most hunters prefer to work alone, especially at our level. But there's something about your approach that intrigues me.'",
    choices: [
      { id: "explain_benefits", icon: "💡", text: "Explain mutual benefits", detail: "Strategic partnership reasoning" },
      { id: "personal_interest", icon: "💝", text: "Admit personal interest", detail: "Be honest about attraction" },
      { id: "trial_mission", icon: "🎯", text: "Suggest a trial mission", detail: "Prove compatibility" }
    ]
  },

  FIRST_DATE: {
    id: "FIRST_DATE",
    narration: "You and Cha Hae-In sit across from each other in a quiet café. The afternoon sunlight highlights her blonde hair as she sips her coffee. 'This is nice,' she admits. 'I rarely take time for moments like this.'",
    choices: [
      { id: "ask_about_past", icon: "📜", text: "Ask about her past", detail: "Learn her background" },
      { id: "share_your_story", icon: "📝", text: "Share your story", detail: "Open up about your journey" },
      { id: "focus_on_present", icon: "🌅", text: "Focus on the present", detail: "Enjoy the moment together" }
    ]
  },

  ROMANTIC_DEVELOPMENT: {
    id: "ROMANTIC_DEVELOPMENT",
    narration: "The connection between you deepens. Cha Hae-In looks into your eyes with a soft expression you've never seen before. 'Jin-Woo, I need to tell you something. Being with you feels different than anything I've experienced.'",
    choices: [
      { id: "confess_feelings", icon: "💖", text: "Confess your feelings", detail: "Tell her how you feel" },
      { id: "ask_her_feelings", icon: "❤️", text: "Ask about her feelings", detail: "Let her express herself first" },
      { id: "take_her_hand", icon: "🤝", text: "Take her hand", detail: "Physical gesture of affection" }
    ]
  },

  CONFESSION_ACCEPTED: {
    id: "CONFESSION_ACCEPTED",
    narration: "Cha Hae-In's eyes shimmer with emotion. 'I feel the same way, Jin-Woo. Your strength isn't just physical - it's in how you make me feel safe and valued. I want to be more than just partners in hunting.'",
    choices: [
      { id: "first_kiss", icon: "💋", text: "Kiss her gently", detail: "Seal the moment with a kiss" },
      { id: "promise_relationship", icon: "💍", text: "Promise to cherish her", detail: "Make a commitment" },
      { id: "plan_future", icon: "🌟", text: "Talk about the future", detail: "Discuss your relationship goals" }
    ]
  },

  RELATIONSHIP_ESTABLISHED: {
    id: "RELATIONSHIP_ESTABLISHED",
    narration: "You and Cha Hae-In are now officially together. The world's strongest hunters have found love in each other. As you walk hand in hand, you realize that this conquest of the heart was more challenging and rewarding than any dungeon.",
    choices: [
      { id: "new_adventure", icon: "🚀", text: "Start a new adventure together", detail: "Begin your romantic journey" },
      { id: "return_to_daily_life", icon: "🏠", text: "Return to daily life hub", detail: "Continue your relationship" }
    ],
    isEnding: true,
    endingType: 'victory'
  },
  
  mystical_path: {
    id: "mystical_path",
    narration: "Your understanding of the runes reveals a hidden mystical pathway. Ancient magic responds to your knowledge, opening doorways between realms. Maya's eyes widen with amazement as reality shifts around you, revealing secrets long forgotten by mortals.",
    choices: [
      { id: "enhanced-vision", icon: "✨", text: "Activate enhanced vision", detail: "Channel magical sight to see beyond the veil" },
      { id: "commune-spirits", icon: "👻", text: "Commune with ancient spirits", detail: "Speak with the guardians of this place" },
      { id: "study-artifacts", icon: "📜", text: "Study the mystical artifacts", detail: "Learn from ancient magical items" }
    ],
    conditions: (flags, history) => history.includes("examine") || history.includes("ask-maya")
  },

  combat_path: {
    id: "combat_path",
    narration: "Your bold approach triggers the ancient defenses! A massive dragon materializes from the shadows, its eyes burning with millennia of fury. Alex draws his sword as the beast roars a challenge that shakes the very foundations of the chamber.",
    choices: [
      { id: "face-dragon", icon: "🐉", text: "Face the dragon in combat", detail: "Engage in epic battle" },
      { id: "negotiate", icon: "🗣️", text: "Attempt to negotiate", detail: "Try to reason with the ancient guardian" },
      { id: "tactical-retreat", icon: "🛡️", text: "Make a tactical retreat", detail: "Withdraw to plan a better strategy" }
    ],
    conditions: (flags, history) => history.includes("pick-lock") || history.includes("prepare")
  },

  inner_sanctum: {
    id: "inner_sanctum",
    narration: "You emerge into the heart of the ancient temple - a vast crystalline chamber where time itself seems to bend. Floating islands of pure energy drift through the air, each containing fragments of ultimate knowledge and power. The choice you make here will echo through eternity.",
    choices: [
      { id: "claim-power", icon: "⚡", text: "Claim the ultimate power", detail: "Seize control of the ancient energies" },
      { id: "preserve-balance", icon: "⚖️", text: "Preserve the cosmic balance", detail: "Maintain the natural order" },
      { id: "share-knowledge", icon: "🤝", text: "Share knowledge with the world", detail: "Democratize the ancient wisdom" },
      { id: "destroy-source", icon: "💥", text: "Destroy the power source", detail: "Prevent anyone from misusing this power" }
    ],
    conditions: (flags, history) => flags.dragonDefeated || flags.spiritsAppeased || flags.artifactsStudied
  },

  // Multiple Endings
  power_ending: {
    id: "power_ending",
    narration: "You claim the ultimate power for yourself! Ancient energies course through your being, transforming you into a demigod of immense capability. You ascend beyond mortal limitations, but at the cost of your humanity. Maya and Alex can only watch in awe and fear as you become something greater and more terrible than they ever imagined.",
    choices: [],
    isEnding: true,
    endingType: 'victory',
    conditions: (flags, history) => history.includes("claim-power")
  },

  balance_ending: {
    id: "balance_ending",
    narration: "You choose wisdom over power, preserving the cosmic balance that has maintained peace for millennia. The ancient energies settle into harmony, and you gain not ultimate power, but ultimate understanding. You return to the world as a guardian of balance, respected by both Maya and Alex for your selfless choice.",
    choices: [],
    isEnding: true,
    endingType: 'victory',
    conditions: (flags, history) => history.includes("preserve-balance")
  },

  knowledge_ending: {
    id: "knowledge_ending",
    narration: "You decide that such power should belong to all humanity. Using ancient magical networks, you broadcast the temple's knowledge across the world. Civilization advances rapidly as magic becomes commonplace, though this brings both wonders and new dangers. You become known as the Great Liberator of Knowledge.",
    choices: [],
    isEnding: true,
    endingType: 'neutral',
    conditions: (flags, history) => history.includes("share-knowledge")
  },

  sacrifice_ending: {
    id: "sacrifice_ending",
    narration: "You make the ultimate sacrifice, destroying the power source to prevent its misuse. The explosion of released energy tears through dimensions, sealing the temple forever. You give your life to save the world from potential catastrophe. Maya and Alex escape to tell your tale of heroic sacrifice.",
    choices: [],
    isEnding: true,
    endingType: 'defeat',
    conditions: (flags, history) => history.includes("destroy-source")
  },

  dragon_ally_ending: {
    id: "dragon_ally_ending",
    narration: "Through patience and wisdom, you earn the ancient dragon's respect and friendship. The great beast becomes your ally, sharing millennia of accumulated knowledge and power. Together, you establish a new age where dragons and humans work in harmony to protect the world's magical balance.",
    choices: [],
    isEnding: true,
    endingType: 'secret',
    conditions: (flags, history) => flags.dragonFriend && history.includes("negotiate")
  },

  spiritual_ascension_ending: {
    id: "spiritual_ascension_ending",
    narration: "Your communion with ancient spirits transcends the physical realm entirely. You become one with the eternal guardians of this sacred place, achieving a form of immortality through spiritual fusion. Your consciousness expands beyond mortal comprehension, watching over future generations of seekers.",
    choices: [],
    isEnding: true,
    endingType: 'secret',
    conditions: (flags, history) => flags.spiritsAppeased && flags.artifactsStudied && history.includes("commune-spirits")
  },

  // Daily Life Hub Nodes
  'explore_home': {
    id: 'explore_home',
    narration: "You find yourself in the comfortable home you share with Cha Hae-In. The evening light filters through the windows, creating a warm atmosphere. What would you like to do?",
    choices: [
      {
        id: 'find_hae_in',
        text: 'Look for Cha Hae-In',
        icon: '💕',
        detail: 'Find your beloved and spend time together'
      },
      {
        id: 'rest_and_recover',
        text: 'Rest and Restore',
        icon: '🛌',
        detail: 'Sleep to restore health and mana'
      },
      {
        id: 'train_skills',
        text: 'Training Session',
        icon: '⚔️',
        detail: 'Practice your Shadow Monarch abilities'
      },
      {
        id: 'continue_story',
        text: 'Continue Adventure',
        icon: '🚪',
        detail: 'Return to the main storyline'
      }
    ]
  },

  'find_hae_in': {
    id: 'find_hae_in',
    narration: "You find Cha Hae-In in the living room, reading a book about sword techniques. She looks up with a gentle smile as you approach. 'Jin-Woo, perfect timing. I was just thinking about you.'",
    choices: [
      {
        id: 'casual_conversation',
        text: 'Start a Conversation',
        icon: '💬',
        detail: 'Talk about your day and interests'
      },
      {
        id: 'romantic_moment',
        text: 'Share an Intimate Moment',
        icon: '💝',
        detail: 'Spend quality romantic time together'
      },
      {
        id: 'suggest_date',
        text: 'Suggest Going Out',
        icon: '🌃',
        detail: 'Plan a date in the city'
      },
      {
        id: 'explore_home',
        text: 'Return to Daily Life',
        icon: '🏠',
        detail: 'Go back to home activities'
      }
    ]
  },

  'rest_and_recover': {
    id: 'rest_and_recover',
    narration: "You decide to rest and let your body recover. As the Shadow Monarch, even you need time to restore your energy. You feel your health and mana returning to full strength.",
    choices: [
      {
        id: 'wake_up_refreshed',
        text: 'Wake Up Refreshed',
        icon: '🌅',
        detail: 'Start a new day with full energy'
      }
    ],
    effects: (flags) => ({ ...flags, rested: true })
  },

  'wake_up_refreshed': {
    id: 'wake_up_refreshed',
    narration: "You wake up feeling completely refreshed. Your health and mana are fully restored, and you're ready for whatever challenges await.",
    choices: [
      {
        id: 'explore_home',
        text: 'Start Your Day',
        icon: '🏠',
        detail: 'Begin daily activities'
      }
    ]
  }
};

export function getNextStoryNode(
  currentPath: string, 
  choiceId: string, 
  storyFlags: Record<string, boolean>, 
  choiceHistory: string[]
): { node: StoryNode; newFlags: Record<string, boolean> } {
  const newHistory = [...choiceHistory, choiceId];
  let newFlags = { ...storyFlags };

  // Solo Leveling romance story progression
  let nextNodeId = currentPath;

  // Define story progression mapping
  const storyProgression: Record<string, Record<string, string>> = {
    'START': {
      'accept_quest': 'FIRST_MEETING',
      'check_stats': 'FIRST_MEETING',
      'explore_home': 'explore_home'
    },
    'explore_home': {
      'find_hae_in': 'find_hae_in',
      'rest_and_recover': 'rest_and_recover',
      'train_skills': 'explore_home',
      'continue_story': 'START'
    },
    'find_hae_in': {
      'casual_conversation': 'find_hae_in',
      'romantic_moment': 'find_hae_in',
      'suggest_date': 'find_hae_in',
      'explore_home': 'explore_home'
    },
    'rest_and_recover': {
      'wake_up_refreshed': 'wake_up_refreshed'
    },
    'wake_up_refreshed': {
      'explore_home': 'explore_home'
    },
    'FIRST_MEETING': {
      'play_cool': 'COOL_RESPONSE',
      'be_humble': 'COOL_RESPONSE', 
      'ask_about_her': 'MISSION_DISCUSSION'
    },
    'COOL_RESPONSE': {
      'actions_speak': 'PHILOSOPHY_MOMENT',
      'ask_missions': 'MISSION_DISCUSSION',
      'suggest_partnership': 'PARTNERSHIP_INTEREST'
    },
    'PHILOSOPHY_MOMENT': {
      'share_burden': 'ROMANTIC_DEVELOPMENT',
      'ask_her_philosophy': 'MISSION_DISCUSSION',
      'suggest_coffee': 'FIRST_DATE'
    },
    'MISSION_DISCUSSION': {
      'offer_help': 'PARTNERSHIP_INTEREST',
      'share_experience': 'PHILOSOPHY_MOMENT',
      'compliment_skill': 'ROMANTIC_DEVELOPMENT'
    },
    'PARTNERSHIP_INTEREST': {
      'explain_benefits': 'MISSION_DISCUSSION',
      'personal_interest': 'ROMANTIC_DEVELOPMENT',
      'trial_mission': 'FIRST_DATE'
    },
    'FIRST_DATE': {
      'ask_about_past': 'ROMANTIC_DEVELOPMENT',
      'share_your_story': 'ROMANTIC_DEVELOPMENT',
      'focus_on_present': 'CONFESSION_ACCEPTED'
    },
    'ROMANTIC_DEVELOPMENT': {
      'confess_feelings': 'CONFESSION_ACCEPTED',
      'ask_her_feelings': 'CONFESSION_ACCEPTED',
      'take_her_hand': 'CONFESSION_ACCEPTED'
    },
    'CONFESSION_ACCEPTED': {
      'first_kiss': 'RELATIONSHIP_ESTABLISHED',
      'promise_relationship': 'RELATIONSHIP_ESTABLISHED',
      'plan_future': 'RELATIONSHIP_ESTABLISHED'
    },
    'RELATIONSHIP_ESTABLISHED': {
      'new_adventure': 'START',
      'return_to_daily_life': 'START'
    }
  };

  // Progress the story based on choice
  if (storyProgression[currentPath] && storyProgression[currentPath][choiceId]) {
    nextNodeId = storyProgression[currentPath][choiceId];
  }

  // Apply relationship flags
  if (choiceId === 'personal_interest' || choiceId === 'confess_feelings') {
    newFlags.romanticInterest = true;
  }
  if (choiceId === 'first_kiss' || choiceId === 'promise_relationship') {
    newFlags.relationshipEstablished = true;
  }

  // Handle special Solo Leveling progression
  if (choiceId === 'return_to_daily_life') {
    // Reset to daily life hub instead of story restart
    newFlags.dailyLifeUnlocked = true;
  }

  const node = STORY_NODES[nextNodeId] || STORY_NODES[currentPath] || STORY_NODES['START'];
  
  return { node, newFlags };
}

export function getAvailableChoices(
  node: StoryNode, 
  storyFlags: Record<string, boolean>, 
  choiceHistory: string[]
): Choice[] {
  if (!node || node.isEnding) {
    return [];
  }

  return node.choices.filter(choice => {
    // Filter choices based on conditions
    if (node.conditions) {
      return node.conditions(storyFlags, choiceHistory);
    }
    return true;
  });
}