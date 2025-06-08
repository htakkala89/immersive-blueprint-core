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
  entrance: {
    id: "entrance",
    narration: "You stand before an ancient door, its surface covered in mysterious runes that pulse with ethereal light. Maya studies the magical inscriptions while Alex checks his equipment. The air hums with ancient power, and you sense that your choices here will determine your destiny.",
    choices: [
      { id: "examine", icon: "🔍", text: "Examine the runes carefully", detail: "Study the magical inscriptions" },
      { id: "pick-lock", icon: "🔓", text: "Attempt to pick the lock", detail: "Use your skills to bypass the mechanism" },
      { id: "ask-maya", icon: "🧙‍♀️", text: "Ask Maya about the magic", detail: "Consult your magical companion" },
      { id: "prepare", icon: "⚔️", text: "Prepare for danger", detail: "Ready weapons and defenses" }
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

  shadow_realm: {
    id: "shadow_realm",
    narration: "You discover a hidden passage leading to the Shadow Realm, where Jin-Woo's true power awaits. Dark energy swirls around you as shadow soldiers emerge from the void, ready to be extracted and added to your army. The realm pulses with supernatural power.",
    choices: [
      { id: "extract-shadows", icon: "👤", text: "Extract shadow soldiers", detail: "Capture shadows to build your army" },
      { id: "commune-darkness", icon: "🌑", text: "Commune with darkness", detail: "Connect with the shadow realm's essence" },
      { id: "shadow-training", icon: "⚔️", text: "Train in shadow arts", detail: "Master the art of shadow manipulation" }
    ],
    conditions: (flags, history) => history.includes("enhanced-vision-success") || flags.shadowPowerUnlocked
  },

  dungeon_depths: {
    id: "dungeon_depths",
    narration: "You descend into the labyrinthine depths of an S-rank dungeon. Ancient traps and magical barriers block your path at every turn. The maze shifts and changes, testing not just your combat skills but your ability to navigate through impossible geometry.",
    choices: [
      { id: "navigate-dungeon", icon: "🗺️", text: "Navigate the maze", detail: "Use strategy to find the correct path" },
      { id: "brute-force", icon: "💥", text: "Break through walls", detail: "Use raw power to forge a new path" },
      { id: "map-layout", icon: "📍", text: "Map the dungeon", detail: "Carefully chart the maze structure" }
    ],
    conditions: (flags, history) => history.includes("face-dragon-success") || history.includes("tactical-retreat")
  },

  trials_chamber: {
    id: "trials_chamber",
    narration: "You enter the Trials Chamber, where hunters are tested to their absolute limits. Lightning-fast reflexes, precise timing, and split-second decisions determine survival. The chamber awakens, preparing to challenge every aspect of your hunter abilities.",
    choices: [
      { id: "test-reflexes", icon: "⚡", text: "Accept the reflex trial", detail: "Test your reaction speed and agility" },
      { id: "endurance-test", icon: "💪", text: "Take the endurance test", detail: "Prove your stamina and determination" },
      { id: "skip-trials", icon: "🚪", text: "Seek another path", detail: "Look for an alternative route" }
    ],
    conditions: (flags, history) => history.includes("pick-lock-success") || flags.trialsUnlocked
  },

  arcane_sanctuary: {
    id: "arcane_sanctuary",
    narration: "Ancient magic circles glow with mystical power as you enter the Arcane Sanctuary. Each circle must be activated in the correct sequence to unlock the chamber's secrets. The air crackles with raw magical energy, waiting for the right touch to awaken.",
    choices: [
      { id: "magic-ritual", icon: "🔮", text: "Perform the ritual", detail: "Activate the magic circles in sequence" },
      { id: "absorb-mana", icon: "✨", text: "Absorb magical energy", detail: "Draw power from the sanctuary" },
      { id: "study-patterns", icon: "📚", text: "Study the patterns", detail: "Learn the magical formations" }
    ],
    conditions: (flags, history) => history.includes("commune-spirits") || flags.magicUnlocked
  },

  boss_arena: {
    id: "boss_arena",
    narration: "You stand before the ultimate challenge - an Ancient Guardian awakened from eons of slumber. This legendary boss commands devastating attacks across multiple phases of combat. Victory here will establish you as one of the world's most powerful hunters.",
    choices: [
      { id: "boss-raid", icon: "⚔️", text: "Challenge the Guardian", detail: "Engage in the ultimate boss battle" },
      { id: "study-weakness", icon: "🔍", text: "Study its weaknesses", detail: "Analyze the boss before attacking" },
      { id: "rally-allies", icon: "👥", text: "Call for reinforcements", detail: "Summon help for the battle" }
    ],
    conditions: (flags, history) => history.includes("navigate-dungeon-success") || history.includes("magic-ritual-success")
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