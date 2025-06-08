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
      { id: "check_stats", icon: "📊", text: "Check your stats first", detail: "What are my current abilities?" }
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

  // Apply choice effects and determine next node
  if (choiceId === 'examine' || choiceId === 'ask-maya') {
    newFlags.magicalKnowledge = true;
  } else if (choiceId === 'pick-lock' || choiceId === 'prepare') {
    newFlags.combatReady = true;
  }

  if (choiceId === 'face-dragon-success') {
    newFlags.dragonDefeated = true;
  } else if (choiceId === 'negotiate') {
    newFlags.dragonFriend = true;
  } else if (choiceId === 'commune-spirits') {
    newFlags.spiritsAppeased = true;
  } else if (choiceId === 'study-artifacts') {
    newFlags.artifactsStudied = true;
  }

  // Determine next story path
  let nextNodeId = currentPath;

  if (currentPath === 'entrance') {
    if (newFlags.magicalKnowledge) {
      nextNodeId = 'mystical_path';
    } else if (newFlags.combatReady) {
      nextNodeId = 'combat_path';
    }
  } else if (currentPath === 'mystical_path' || currentPath === 'combat_path') {
    if (newFlags.dragonDefeated || newFlags.spiritsAppeased || newFlags.artifactsStudied) {
      nextNodeId = 'inner_sanctum';
    }
  } else if (currentPath === 'inner_sanctum') {
    // Check for ending conditions
    if (choiceId === 'claim-power') {
      nextNodeId = 'power_ending';
    } else if (choiceId === 'preserve-balance') {
      nextNodeId = 'balance_ending';
    } else if (choiceId === 'share-knowledge') {
      nextNodeId = 'knowledge_ending';
    } else if (choiceId === 'destroy-source') {
      nextNodeId = 'sacrifice_ending';
    }
  }

  // Check for secret endings
  if (newFlags.dragonFriend && choiceId === 'negotiate') {
    nextNodeId = 'dragon_ally_ending';
  } else if (newFlags.spiritsAppeased && newFlags.artifactsStudied && choiceId === 'commune-spirits') {
    nextNodeId = 'spiritual_ascension_ending';
  }

  const node = STORY_NODES[nextNodeId] || STORY_NODES[currentPath];
  
  return { node, newFlags };
}

export function getAvailableChoices(
  node: StoryNode, 
  storyFlags: Record<string, boolean>, 
  choiceHistory: string[]
): Choice[] {
  if (node.isEnding) {
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