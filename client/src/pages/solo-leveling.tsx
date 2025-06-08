import { useState, useEffect, useRef } from "react";

interface GameState {
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  affection: number;
  currentScene: string;
  inventory: any[];
  inCombat: boolean;
}

interface StoryScene {
  prompt: string;
  narration: string;
  chat: Array<{ sender: string; text: string }>;
  choices: Array<{ text: string; detail?: string; type: string }>;
  leadsTo?: Record<string, string>;
}

export default function SoloLeveling() {
  const [gameState, setGameState] = useState<GameState>({
    level: 146,
    health: 15420,
    maxHealth: 15420,
    mana: 8750,
    maxMana: 8750,
    affection: 0,
    currentScene: 'START',
    inventory: [],
    inCombat: false
  });

  const [gameStarted, setGameStarted] = useState(false);
  const [currentBackground, setCurrentBackground] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; id: number; timestamp: number }>>([]);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState<'action' | 'speak'>('action');
  const [showInventory, setShowInventory] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [showChatTutorial, setShowChatTutorial] = useState(false);
  const [currentChoiceIndex, setCurrentChoiceIndex] = useState(0);

  const timeRef = useRef<HTMLSpanElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Complete story data from your original code
  const story: Record<string, StoryScene> = {
    'START': {
      prompt: "Sung Jin-Woo standing in a dark dungeon entrance, purple aura emanating from his body, shadows swirling around him. Anime style, dramatic lighting, Solo Leveling manhwa art style.",
      narration: "You are Sung Jin-Woo, the Shadow Monarch. After countless battles and becoming the world's strongest hunter, you've realized something is missing. Your heart races whenever you see S-Rank Hunter Cha Hae-In. Today, you've decided to pursue something more challenging than any dungeon boss - her heart.",
      chat: [{ sender: 'system', text: "The System has granted you a new quest: Win Cha Hae-In's heart!" }],
      choices: [
        { text: "Accept the quest", detail: "Time to level up in romance!", type: 'accept_quest' },
        { text: "Check your stats first", detail: "What are my current abilities?", type: 'check_stats' },
      ],
      leadsTo: { accept_quest: 'FIRST_MEETING', check_stats: 'STATS_CHECK' }
    },
    'STATS_CHECK': {
      prompt: "A glowing blue system window floating in the air showing character stats, RPG interface, Solo Leveling style.",
      narration: "Your System Window appears before you, displaying your incredible power.",
      chat: [{ sender: 'system', text: "Player: Sung Jin-Woo | Level: 146 | Class: Shadow Monarch | Strength: 492 | Intelligence: 385 | Sense: 420 | Special Skill: Shadow Extraction | Title: The Strongest Hunter" }],
      choices: [{ text: "Close window and continue", type: 'continue' }],
      leadsTo: { continue: 'FIRST_MEETING' }
    },
    'FIRST_MEETING': {
      prompt: "Cha Hae-In in her red armor, blonde hair flowing, standing in the Korean Hunters Association building. Beautiful anime girl, Solo Leveling art style.",
      narration: "You arrive at the Korean Hunters Association. There she is - Cha Hae-In, the graceful S-Rank hunter known for her swordsmanship. She notices you approaching, and for the first time in a while, you feel nervous.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo? I heard you cleared another S-Rank gate solo yesterday. That's... impressive." }],
      choices: [
        { text: "Play it cool", detail: "'Just another day's work.'", type: 'play_cool' },
        { text: "Be humble", detail: "'I got lucky, that's all.'", type: 'be_humble' },
        { text: "Ask about her day", detail: "'How was your mission?'", type: 'ask_about_her' },
      ],
      leadsTo: { play_cool: 'COOL_RESPONSE', be_humble: 'HUMBLE_RESPONSE', ask_about_her: 'CARING_RESPONSE' }
    },
    'CARING_RESPONSE': {
      prompt: "Cha Hae-In smiling warmly, her cheeks slightly pink. Cherry blossoms falling in background, romantic anime scene.",
      narration: "Hae-In's expression softens. She seems touched that you asked about her day rather than talking about yourself.",
      chat: [{ sender: 'Cha Hae-In', text: "That's... sweet of you to ask. Most hunters only want to talk about their own achievements. My mission went well, but I'm more interested in hearing about yours." }],
      choices: [
        { text: "Share your adventure", detail: "Tell her about the dungeon", type: 'share_story' },
        { text: "Deflect with humor", detail: "'Mine was boring compared to yours'", type: 'humble_deflect' },
        { text: "Suggest working together", detail: "'Want to team up sometime?'", type: 'team_up' },
      ],
      leadsTo: { share_story: 'STORY_SHARING', humble_deflect: 'HUMBLE_MOMENT', team_up: 'TEAM_PROPOSAL' }
    },
    'TEAM_PROPOSAL': {
      prompt: "Jin-Woo and Cha Hae-In standing together, a gate portal glowing in the background. Adventure partnership scene, anime style.",
      narration: "Hae-In's eyes light up at your suggestion. The idea of working together clearly appeals to her.",
      chat: [{ sender: 'Cha Hae-In', text: "I'd like that. Actually, there's a B-rank gate that appeared this morning. The association wants it cleared, but it's nothing too dangerous. Want to check it out together?" }],
      choices: [
        { text: "Accept eagerly", detail: "'I'd love to.'", type: 'accept_eager' },
        { text: "Act protective", detail: "'Are you sure it's safe?'", type: 'protective' },
        { text: "Show trust in her", detail: "'With your skills? Let's go.'", type: 'trust' },
        { text: "Summon shadow soldiers", detail: "Call your army first", type: 'summon' },
      ],
      leadsTo: { accept_eager: 'EAGER_ACCEPTANCE', protective: 'PROTECTIVE_ROUTE', trust: 'TRUST_ROUTE', summon: 'SHADOW_SUMMON' }
    },
    'SHADOW_SUMMON': {
      prompt: "Jin-Woo summoning his shadow army, Beru, Igris, and Bellion emerging from dark portals. Epic anime scene with purple aura.",
      narration: "You raise your hand, and shadows pour forth from the ground. Your three commanders materialize: Bellion the Grand Marshal, Beru the Ant King, and Igris the Blood-Red Knight.",
      chat: [{ sender: 'system', text: "Shadow soldiers summoned! Your army awaits your command, My Liege." }],
      choices: [
        { text: "Enter the gate", detail: "Time to see what awaits inside", type: 'enter_gate' }
      ],
      leadsTo: { enter_gate: 'DUNGEON_START' }
    },
    'DUNGEON_START': {
      prompt: "Inside a crystalline ice dungeon with frozen monsters and treacherous paths. Fantasy RPG dungeon, anime style.",
      narration: "The gate leads to an ice realm. Frozen monsters lurk in the crystalline corridors. Hae-In draws her sword, its blade glowing with mana.",
      chat: [{ sender: 'Cha Hae-In', text: "This place gives me chills... but not from the cold. Something powerful is here." }],
      choices: [
        { text: "Lead the way", detail: "Take point with shadows", type: 'lead' },
        { text: "Stay close to Hae-In", detail: "Protect her", type: 'protect' },
        { text: "Split up to cover ground", detail: "Tactical approach", type: 'split' },
      ],
      leadsTo: { lead: 'DUNGEON_PROGRESS', protect: 'PROTECTIVE_DUNGEON', split: 'SPLIT_DUNGEON' }
    },
    'DUNGEON_PROGRESS': {
      prompt: "Jin-Woo and Cha Hae-In fighting ice monsters in perfect synchronization. Epic battle scene, anime style.",
      narration: "You and Hae-In move through the dungeon with deadly efficiency. Your shadows and her swordplay create a perfect dance of destruction.",
      chat: [{ sender: 'Cha Hae-In', text: "We work well together, Jin-Woo. I've never felt so in sync with another hunter." }],
      choices: [
        { text: "Compliment her skills", detail: "'You're incredible.'", type: 'compliment' },
        { text: "Focus on the boss ahead", detail: "Stay tactical", type: 'focus_boss' },
      ],
      leadsTo: { compliment: 'COMPLIMENT_RESPONSE', focus_boss: 'BOSS_APPROACH' }
    },
    'BOSS_APPROACH': {
      prompt: "A massive ice dragon boss emerging from crystalline throne room. Epic boss encounter, anime style.",
      narration: "You reach the boss chamber. A colossal ice dragon sits on a throne of frozen crystal, its eyes glowing with ancient malice.",
      chat: [{ sender: 'system', text: "Boss Encounter: Ancient Ice Dragon - Level 89" }],
      choices: [
        { text: "Attack together", detail: "Coordinate assault", type: 'attack_together' },
        { text: "Use shadow army", detail: "Overwhelm with numbers", type: 'shadow_attack' },
        { text: "Let Hae-In take lead", detail: "Show trust in her", type: 'hae_in_lead' },
      ],
      leadsTo: { attack_together: 'BOSS_BATTLE', shadow_attack: 'SHADOW_VICTORY', hae_in_lead: 'HAE_IN_MOMENT' }
    },
    'BOSS_BATTLE': {
      prompt: "Epic battle against the ice dragon with Jin-Woo and Cha Hae-In fighting together. Action scene, anime style.",
      narration: "The battle is intense. You and Hae-In fight as one, dodging ice shards and landing devastating attacks in perfect coordination.",
      chat: [{ sender: 'Cha Hae-In', text: "Now! Together!" }],
      choices: [
        { text: "Final combined attack", detail: "Shadow + Sword technique", type: 'combined_finisher' }
      ],
      leadsTo: { combined_finisher: 'VICTORY_TOGETHER' }
    },
    'VICTORY_TOGETHER': {
      prompt: "Jin-Woo and Cha Hae-In standing victorious over the defeated ice dragon. Victory celebration, anime style.",
      narration: "The ice dragon falls with a thunderous crash. As the dungeon begins to stabilize, you and Hae-In share a moment of triumph.",
      chat: [{ sender: 'Cha Hae-In', text: "That was incredible! We really do make a perfect team." }],
      choices: [
        { text: "Extract the dragon's shadow", detail: "Add to your army", type: 'extract_shadow' },
        { text: "Focus on Hae-In", detail: "'You were amazing.'", type: 'focus_hae_in' },
      ],
      leadsTo: { extract_shadow: 'SHADOW_EXTRACTION', focus_hae_in: 'ROMANTIC_MOMENT' }
    },
    'ROMANTIC_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In alone in a beautiful crystal cavern, soft light reflecting off ice formations. Romantic anime scene.",
      narration: "As the dungeon settles, you find yourselves in a breathtaking crystal cavern. The light creates a magical atmosphere around you both.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo... why did you really invite me today? It wasn't just about clearing the gate, was it?" }],
      choices: [
        { text: "Confess your feelings", detail: "'I wanted to be with you.'", type: 'confess' },
        { text: "Tease her gently", detail: "'Maybe you're imagining things.'", type: 'tease' },
        { text: "Take her hand", detail: "Show don't tell", type: 'take_hand' },
      ],
      leadsTo: { confess: 'CONFESSION', tease: 'TEASE_RESPONSE', take_hand: 'HAND_HOLDING' }
    },
    'CONFESSION': {
      prompt: "Jin-Woo and Cha Hae-In facing each other, magical atmosphere with floating light particles. Romantic confession scene, anime style.",
      narration: "You take a deep breath. Even facing the Monarchs wasn't this nerve-wracking.",
      chat: [{ sender: 'player', text: "Hae-In, I've faced countless monsters and even death itself. But nothing scares me more than the thought of not telling you how I feel. I... I've fallen for you." }],
      choices: [
        { text: "Wait for her response", detail: "Give her time to process", type: 'wait' }
      ],
      leadsTo: { wait: 'CONFESSION_RESPONSE' }
    },
    'CONFESSION_RESPONSE': {
      prompt: "Cha Hae-In with tears of joy in her eyes, reaching out to Jin-Woo. Beautiful romantic anime scene with sparkles.",
      narration: "Hae-In's eyes widen, then fill with tears. But she's smiling - the most beautiful smile you've ever seen.",
      chat: [{ sender: 'Cha Hae-In', text: "Jin-Woo... I've been waiting to hear those words. I've loved you since the day you saved everyone from the Ant King. Your mana doesn't just smell nice to me - it feels like home." }],
      choices: [
        { text: "Kiss her", detail: "Actions speak louder than words", type: 'kiss' },
        { text: "Hold her close", detail: "Embrace this moment", type: 'embrace' },
      ],
      leadsTo: { kiss: 'FIRST_KISS', embrace: 'TENDER_EMBRACE' }
    },
    'FIRST_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing their first kiss in the crystal cavern, magical light surrounding them. Ultimate romantic scene, anime style.",
      narration: "Time seems to stop as you lean in and kiss her. The world melts away, leaving only this perfect moment. For once, the Shadow Monarch has found his light.",
      chat: [{ sender: 'system', text: "Quest Complete: Win Cha Hae-In's heart! Maximum affection achieved!" }],
      choices: [
        { text: "Plan your future together", detail: "Talk about what comes next", type: 'future_plans' },
        { text: "Enjoy this moment", detail: "Stay in the present", type: 'savor_moment' },
      ],
      leadsTo: { future_plans: 'HAPPY_ENDING', savor_moment: 'PERFECT_MOMENT' }
    },
    'HAPPY_ENDING': {
      prompt: "Jin-Woo and Cha Hae-In walking hand in hand toward the gate exit, shadow soldiers respectfully following behind. Happy ending scene, anime style.",
      narration: "You've conquered the most difficult challenge of all - love. With Hae-In by your side and your shadow army as witnesses, you're ready for whatever adventures await.",
      chat: [{ sender: 'Cha Hae-In', text: "So, Shadow Monarch... ready for our next quest together?" }],
      choices: [
        { text: "Start a new adventure", detail: "Begin again", type: 'restart' }
      ],
      leadsTo: { restart: 'START' }
    },
    'EAGER_ACCEPTANCE': {
      prompt: "Jin-Woo and Cha Hae-In walking side by side toward a glowing dungeon portal. Excited partnership energy, anime style.",
      narration: "Your enthusiasm brings a genuine smile to Hae-In's face. She seems pleased by your immediate acceptance.",
      chat: [
        { sender: 'player', text: "I'd love to. Let's head out right away!" },
        { sender: 'Cha Hae-In', text: "Perfect! Your eagerness is... refreshing. Most hunters are more cautious with me." },
        { sender: 'Cha Hae-In', text: "Shall we grab some coffee first? The gate won't disappear for a few hours." }
      ],
      choices: [
        { text: "Suggest a café", detail: "'I know a perfect place.'", type: 'cafe_suggestion' },
        { text: "Head straight to gate", detail: "'Let's get this done first.'", type: 'gate_priority' },
        { text: "Ask about her preferences", detail: "'What do you prefer?'", type: 'ask_preference' }
      ],
      leadsTo: { cafe_suggestion: 'COFFEE_DATE', gate_priority: 'GATE_ENTRANCE', ask_preference: 'PREFERENCE_RESPONSE' }
    },
    'COFFEE_DATE': {
      prompt: "Jin-Woo and Cha Hae-In sitting together at a cozy café, sharing coffee and conversation. Intimate dating scene, anime style.",
      narration: "The café is quiet and warm. Hae-In relaxes visibly, her usual hunter alertness softening into something more personal.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is nice. It's been a while since I could just... talk with someone who understands this life." },
        { sender: 'Cha Hae-In', text: "Your mana feels so calm here. It's comforting." }
      ],
      choices: [
        { text: "Ask about her past", detail: "'Tell me about your journey.'", type: 'ask_past' },
        { text: "Share your own story", detail: "Open up about your experiences", type: 'share_past' },
        { text: "Focus on the present", detail: "'I'm just glad we're here now.'", type: 'present_focus' }
      ],
      leadsTo: { ask_past: 'PAST_SHARING', share_past: 'MUTUAL_OPENING', present_focus: 'PRESENT_MOMENT' }
    },
    'PRESENT_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In enjoying a peaceful moment together, hands almost touching across the café table. Tender anime scene.",
      narration: "The moment feels perfect. No monsters, no danger - just two people finding connection in an extraordinary world.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right. This moment is all that matters." },
        { sender: 'Cha Hae-In', text: "Should we head to that gate now? I'm ready for anything with you by my side." }
      ],
      choices: [
        { text: "Take her hand", detail: "Show your feelings", type: 'take_hand' },
        { text: "Head to the gate", detail: "Continue the mission", type: 'mission_continue' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', mission_continue: 'GATE_ENTRANCE' }
    },
    'HAND_HOLDING': {
      prompt: "Jin-Woo and Cha Hae-In holding hands across the café table, both blushing softly. Sweet romantic moment, anime style.",
      narration: "Your hand finds hers naturally. She doesn't pull away - instead, her fingers intertwine with yours.",
      chat: [
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping you'd do that." },
        { sender: 'player', text: "I've wanted to for a long time." }
      ],
      choices: [
        { text: "Confess your feelings", detail: "'I care about you deeply.'", type: 'confess' },
        { text: "Let the moment speak", detail: "Enjoy the connection", type: 'silent_moment' }
      ],
      leadsTo: { confess: 'CAFE_CONFESSION', silent_moment: 'UNDERSTANDING_MOMENT' }
    },
    'GATE_ENTRANCE': {
      prompt: "Jin-Woo and Cha Hae-In standing before a B-rank dungeon portal, ready for adventure. Epic gate entrance scene, anime style.",
      narration: "The gate pulses with magical energy. You and Hae-In stand ready, your partnership already feeling natural.",
      chat: [
        { sender: 'Cha Hae-In', text: "Ready, partner? Let's show this dungeon what we can do together." }
      ],
      choices: [
        { text: "Enter together", detail: "Step through as a team", type: 'enter_gate' }
      ],
      leadsTo: { enter_gate: 'DUNGEON_START' }
    },
    'PROTECTIVE_ROUTE': {
      prompt: "Jin-Woo showing concern for Cha Hae-In's safety. Protective gesture, anime style.",
      narration: "Your protective instinct shows, and Hae-In's expression softens at your concern.",
      chat: [
        { sender: 'player', text: "Are you sure it's safe? I don't want anything to happen to you." },
        { sender: 'Cha Hae-In', text: "That's... sweet of you to worry. But I'm an S-rank hunter, Jin-Woo. I can handle myself." },
        { sender: 'Cha Hae-In', text: "Though having the Shadow Monarch watching my back wouldn't hurt." }
      ],
      choices: [
        { text: "Apologize for overprotecting", detail: "'You're right, I'm sorry.'", type: 'apologize' },
        { text: "Stand by your concern", detail: "'I still want to keep you safe.'", type: 'stay_protective' },
        { text: "Compliment her strength", detail: "'You're incredible, but I still worry.'", type: 'compliment_strength' }
      ],
      leadsTo: { apologize: 'APOLOGY_RESPONSE', stay_protective: 'PROTECTIVE_ACCEPTED', compliment_strength: 'STRENGTH_ACKNOWLEDGMENT' }
    },
    'TRUST_ROUTE': {
      prompt: "Jin-Woo showing complete confidence in Cha Hae-In's abilities. Trust and respect, anime style.",
      narration: "Your complete faith in her abilities makes Hae-In's eyes sparkle with appreciation.",
      chat: [
        { sender: 'player', text: "With your skills? Let's go. I have complete faith in you." },
        { sender: 'Cha Hae-In', text: "Your trust means everything to me, Jin-Woo. More than you know." },
        { sender: 'Cha Hae-In', text: "Having a partner who believes in me... it's been a while since I felt this confident." }
      ],
      choices: [
        { text: "Express mutual trust", detail: "'We make a great team.'", type: 'mutual_trust' },
        { text: "Focus on her confidence", detail: "'You should always feel this way.'", type: 'confidence_boost' },
        { text: "Suggest regular partnerships", detail: "'We should do this more often.'", type: 'partnership_suggestion' }
      ],
      leadsTo: { mutual_trust: 'MUTUAL_TRUST_MOMENT', confidence_boost: 'CONFIDENCE_BUILDING', partnership_suggestion: 'PARTNERSHIP_DISCUSSION' }
    },
    'APOLOGY_RESPONSE': {
      prompt: "Jin-Woo apologizing with sincere expression while Cha Hae-In smiles warmly. Understanding moment, anime style.",
      narration: "Your sincere apology earns you a warm smile from Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "You don't need to apologize. It's actually... nice to have someone care that much." },
        { sender: 'Cha Hae-In', text: "Most people either fear my strength or try to use it. You just want to protect me." }
      ],
      choices: [
        { text: "Express your feelings", detail: "'Because you matter to me.'", type: 'express_feelings' },
        { text: "Head to the gate", detail: "Continue the mission", type: 'mission_continue' }
      ],
      leadsTo: { express_feelings: 'FEELINGS_REVEALED', mission_continue: 'GATE_ENTRANCE' }
    },
    'PROTECTIVE_ACCEPTED': {
      prompt: "Cha Hae-In accepting Jin-Woo's protective nature with a gentle smile. Acceptance scene, anime style.",
      narration: "Hae-In steps closer, her expression softening even more.",
      chat: [
        { sender: 'Cha Hae-In', text: "You know what? I like that you want to protect me. Even if I don't need it." },
        { sender: 'Cha Hae-In', text: "It makes me feel... special. Like I'm more than just a weapon to you." }
      ],
      choices: [
        { text: "You are special", detail: "Tell her how you see her", type: 'you_are_special' },
        { text: "You're everything to me", detail: "Deep confession", type: 'everything_to_me' }
      ],
      leadsTo: { you_are_special: 'SPECIAL_MOMENT', everything_to_me: 'DEEP_CONFESSION' }
    },
    'STRENGTH_ACKNOWLEDGMENT': {
      prompt: "Jin-Woo admiring Cha Hae-In's strength while showing care. Balanced respect and protection, anime style.",
      narration: "Your words strike the perfect balance between respect and care.",
      chat: [
        { sender: 'Cha Hae-In', text: "That's... exactly what I needed to hear. You see my strength but still care about my safety." },
        { sender: 'Cha Hae-In', text: "Most people do one or the other, never both." }
      ],
      choices: [
        { text: "That's what partners do", detail: "Emphasize teamwork", type: 'partners_care' },
        { text: "That's what love is", detail: "Hint at deeper feelings", type: 'love_hint' }
      ],
      leadsTo: { partners_care: 'PARTNERSHIP_BOND', love_hint: 'LOVE_REALIZATION' }
    },
    'MUTUAL_TRUST_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing a moment of complete understanding and trust. Perfect partnership, anime style.",
      narration: "The connection between you feels electric. This is what true partnership should be.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really do make an incredible team. I've never felt this in sync with anyone." },
        { sender: 'player', text: "It's like we were meant to fight together." }
      ],
      choices: [
        { text: "Maybe more than fight", detail: "Hint at romance", type: 'more_than_fight' },
        { text: "Let's prove it in that gate", detail: "Focus on mission", type: 'prove_partnership' }
      ],
      leadsTo: { more_than_fight: 'ROMANTIC_HINT', prove_partnership: 'GATE_ENTRANCE' }
    },
    'CONFIDENCE_BUILDING': {
      prompt: "Cha Hae-In glowing with confidence from Jin-Woo's encouragement. Empowering moment, anime style.",
      narration: "Your words ignite something powerful in Hae-In's eyes.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right. I should feel this confident all the time." },
        { sender: 'Cha Hae-In', text: "With you believing in me like this... I feel like I could take on anything." }
      ],
      choices: [
        { text: "You can take on anything", detail: "Pure encouragement", type: 'pure_encouragement' },
        { text: "We can take on anything", detail: "Together emphasis", type: 'together_strength' }
      ],
      leadsTo: { pure_encouragement: 'EMPOWERED_HAE_IN', together_strength: 'UNIFIED_STRENGTH' }
    },
    'PARTNERSHIP_DISCUSSION': {
      prompt: "Jin-Woo and Cha Hae-In discussing future adventures together. Planning scene, anime style.",
      narration: "The idea of regular partnerships clearly excites Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "I'd love that! We could be an official team. The Shadow Monarch and the Sword Saint." },
        { sender: 'Cha Hae-In', text: "Though... would this be just professional, or...?" }
      ],
      choices: [
        { text: "Professional partnership", detail: "Keep it business", type: 'professional_only' },
        { text: "Something more personal", detail: "Open to romance", type: 'personal_partnership' },
        { text: "Whatever feels right", detail: "Let it develop naturally", type: 'natural_development' }
      ],
      leadsTo: { professional_only: 'PROFESSIONAL_BOND', personal_partnership: 'PERSONAL_BOND', natural_development: 'NATURAL_BOND' }
    },
    'PREFERENCE_RESPONSE': {
      prompt: "Cha Hae-In considering Jin-Woo's thoughtful question. Appreciation for his consideration, anime style.",
      narration: "Your consideration for her preferences clearly touches Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're asking what I prefer? That's... refreshing. Most people just assume." },
        { sender: 'Cha Hae-In', text: "I'd like the coffee first. A quiet moment before the chaos of battle." }
      ],
      choices: [
        { text: "Lead to a café", detail: "Take her somewhere nice", type: 'cafe_suggestion' },
        { text: "Find a quiet spot nearby", detail: "Simple and close", type: 'quiet_spot' }
      ],
      leadsTo: { cafe_suggestion: 'COFFEE_DATE', quiet_spot: 'QUIET_MOMENT' }
    },
    'PROTECTIVE_DUNGEON': {
      prompt: "Jin-Woo staying protectively close to Cha Hae-In in the icy dungeon. Protective formation, anime style.",
      narration: "You position yourself to shield Hae-In from potential threats, though she seems amused by your protectiveness.",
      chat: [
        { sender: 'Cha Hae-In', text: "You know I can handle myself, right? But... I don't mind having you close." }
      ],
      choices: [
        { text: "Stay protective", detail: "Continue guarding her", type: 'continue_protecting' },
        { text: "Give her space", detail: "Trust her abilities", type: 'trust_abilities' }
      ],
      leadsTo: { continue_protecting: 'PROTECTION_APPRECIATED', trust_abilities: 'TRUST_DEMONSTRATED' }
    },
    'SPLIT_DUNGEON': {
      prompt: "Jin-Woo and Cha Hae-In splitting up to cover more ground tactically. Strategic separation, anime style.",
      narration: "You and Hae-In split up to clear the dungeon more efficiently, maintaining contact through hand signals.",
      chat: [
        { sender: 'Cha Hae-In', text: "Good strategy. I'll take the left corridor, you take the right. Signal if you need backup." }
      ],
      choices: [
        { text: "Reunite after clearing", detail: "Meet at the center", type: 'reunite_center' },
        { text: "Check on her frequently", detail: "Stay in communication", type: 'frequent_contact' }
      ],
      leadsTo: { reunite_center: 'TACTICAL_SUCCESS', frequent_contact: 'CARING_TACTICS' }
    },
    'COMPLIMENT_RESPONSE': {
      prompt: "Cha Hae-In blushing from Jin-Woo's compliment. Sweet reaction, anime style.",
      narration: "Your compliment brings a beautiful blush to Hae-In's cheeks.",
      chat: [
        { sender: 'Cha Hae-In', text: "You think I'm incredible? Coming from the Shadow Monarch, that means everything." },
        { sender: 'Cha Hae-In', text: "I've always admired your strength, but hearing you say that..." }
      ],
      choices: [
        { text: "You inspire me too", detail: "Mutual admiration", type: 'mutual_inspiration' },
        { text: "Focus on the boss", detail: "Stay mission-focused", type: 'focus_boss' }
      ],
      leadsTo: { mutual_inspiration: 'INSPIRATION_MOMENT', focus_boss: 'BOSS_APPROACH' }
    },
    'PAST_SHARING': {
      prompt: "Cha Hae-In opening up about her past over coffee. Intimate conversation, anime style.",
      narration: "Hae-In's walls come down as she shares her journey.",
      chat: [
        { sender: 'Cha Hae-In', text: "I became a hunter to protect people, but somewhere along the way, I lost myself in the strength." },
        { sender: 'Cha Hae-In', text: "Until I met you. Your mana... it reminds me why I started this path." }
      ],
      choices: [
        { text: "Share your own struggles", detail: "Open up about your journey", type: 'share_struggles' },
        { text: "You found yourself again", detail: "Encourage her growth", type: 'found_yourself' }
      ],
      leadsTo: { share_struggles: 'MUTUAL_VULNERABILITY', found_yourself: 'GROWTH_RECOGNITION' }
    },
    'MUTUAL_OPENING': {
      prompt: "Jin-Woo sharing his own story while Cha Hae-In listens intently. Deep connection, anime style.",
      narration: "As you open up about your journey from E-rank to Shadow Monarch, Hae-In listens with complete attention.",
      chat: [
        { sender: 'player', text: "I was weak once. So weak that I nearly died in an E-rank dungeon. But that weakness taught me something important." },
        { sender: 'Cha Hae-In', text: "What did it teach you?" },
        { sender: 'player', text: "That strength without someone to protect is meaningless." }
      ],
      choices: [
        { text: "Look into her eyes", detail: "Create intimate moment", type: 'eye_contact' },
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' }
      ],
      leadsTo: { eye_contact: 'INTIMATE_MOMENT', take_hand: 'HAND_HOLDING' }
    },
    'CAFE_CONFESSION': {
      prompt: "Jin-Woo confessing his feelings in the café while holding Cha Hae-In's hand. Romantic confession, anime style.",
      narration: "With her hand in yours, the words come naturally.",
      chat: [
        { sender: 'player', text: "Hae-In, I care about you deeply. More than just as a fellow hunter." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping you'd say that. I feel the same way." }
      ],
      choices: [
        { text: "Kiss her gently", detail: "Seal the moment", type: 'gentle_kiss' },
        { text: "Plan a real date", detail: "Ask her out properly", type: 'real_date' }
      ],
      leadsTo: { gentle_kiss: 'CAFE_KISS', real_date: 'DATE_PLANNING' }
    },
    'UNDERSTANDING_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing a moment of silent understanding. Perfect connection, anime style.",
      narration: "Sometimes words aren't needed. The connection between you speaks volumes.",
      chat: [
        { sender: 'Cha Hae-In', text: "I understand. This feels... right, doesn't it?" },
        { sender: 'player', text: "More right than anything I've ever felt." }
      ],
      choices: [
        { text: "Stay in this moment", detail: "Savor the connection", type: 'savor_connection' },
        { text: "Head to the gate together", detail: "Face adventure as one", type: 'mission_continue' }
      ],
      leadsTo: { savor_connection: 'CONNECTION_DEEPENS', mission_continue: 'GATE_ENTRANCE' }
    },
    'FEELINGS_REVEALED': {
      prompt: "Jin-Woo expressing his deep feelings for Cha Hae-In. Heartfelt moment, anime style.",
      narration: "Your honest words hang in the air between you.",
      chat: [
        { sender: 'player', text: "Because you matter to me, Hae-In. More than I ever thought possible." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I've been hoping to hear something like that from you." }
      ],
      choices: [
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' },
        { text: "Move closer", detail: "Close the distance", type: 'move_closer' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', move_closer: 'INTIMATE_CLOSENESS' }
    },
    'SPECIAL_MOMENT': {
      prompt: "Cha Hae-In feeling truly special and valued. Emotional recognition, anime style.",
      narration: "Your words touch something deep in Hae-In's heart.",
      chat: [
        { sender: 'Cha Hae-In', text: "No one has ever made me feel this special before. Like I'm more than just my abilities." },
        { sender: 'player', text: "You are so much more than that. You're everything." }
      ],
      choices: [
        { text: "Hold her close", detail: "Embrace the moment", type: 'embrace' },
        { text: "Look into her eyes", detail: "Deep connection", type: 'eye_contact' }
      ],
      leadsTo: { embrace: 'TENDER_EMBRACE', eye_contact: 'SOUL_CONNECTION' }
    },
    'DEEP_CONFESSION': {
      prompt: "Jin-Woo making a deep emotional confession. Ultimate romantic moment, anime style.",
      narration: "The depth of your feelings pours out.",
      chat: [
        { sender: 'player', text: "You're everything to me, Hae-In. My light in the darkness, my reason to be more than just the Shadow Monarch." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... you're going to make me cry. Happy tears." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal your confession", type: 'passionate_kiss' },
        { text: "Wipe her tears", detail: "Tender gesture", type: 'wipe_tears' }
      ],
      leadsTo: { passionate_kiss: 'PASSIONATE_MOMENT', wipe_tears: 'TENDER_CARE' }
    },
    'PARTNERSHIP_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming a perfect partnership bond. Team unity, anime style.",
      narration: "The understanding between you grows stronger.",
      chat: [
        { sender: 'Cha Hae-In', text: "That's exactly right. Partners watch out for each other, no matter how strong they are." },
        { sender: 'player', text: "Always. That's what makes us stronger together." }
      ],
      choices: [
        { text: "Suggest making it official", detail: "Formal partnership", type: 'official_partnership' },
        { text: "Head to the gate", detail: "Test the partnership", type: 'mission_continue' }
      ],
      leadsTo: { official_partnership: 'OFFICIAL_TEAM', mission_continue: 'GATE_ENTRANCE' }
    },
    'LOVE_REALIZATION': {
      prompt: "Both realizing their feelings run deeper than partnership. Love dawning, anime style.",
      narration: "The word 'love' changes everything between you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Love? Is that what this is?" },
        { sender: 'player', text: "I think it might be. What I feel for you... it's more than partnership." }
      ],
      choices: [
        { text: "Confess your love", detail: "Full confession", type: 'love_confession' },
        { text: "Ask about her feelings", detail: "Seek reciprocation", type: 'ask_feelings' }
      ],
      leadsTo: { love_confession: 'LOVE_DECLARATION', ask_feelings: 'MUTUAL_FEELINGS' }
    },
    'ROMANTIC_HINT': {
      prompt: "Jin-Woo hinting at romantic possibilities beyond fighting. Romance emerging, anime style.",
      narration: "Your suggestion opens new possibilities.",
      chat: [
        { sender: 'Cha Hae-In', text: "More than fight? What did you have in mind?" },
        { sender: 'player', text: "Maybe... spend time together outside of dungeons? Just us." }
      ],
      choices: [
        { text: "Ask her on a date", detail: "Direct romantic approach", type: 'date_request' },
        { text: "Suggest casual hanging out", detail: "Gentle approach", type: 'casual_time' }
      ],
      leadsTo: { date_request: 'DATE_ACCEPTED', casual_time: 'CASUAL_AGREEMENT' }
    },
    'EMPOWERED_HAE_IN': {
      prompt: "Cha Hae-In radiating confidence and power. Empowerment moment, anime style.",
      narration: "Your belief in her transforms Hae-In completely.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're right! I can take on anything! With this confidence... I feel unstoppable!" },
        { sender: 'player', text: "That's the Cha Hae-In I know. Fierce and beautiful." }
      ],
      choices: [
        { text: "Channel that energy", detail: "Direct it to the mission", type: 'channel_energy' },
        { text: "Admire her strength", detail: "Appreciate her power", type: 'admire_strength' }
      ],
      leadsTo: { channel_energy: 'ENERGIZED_MISSION', admire_strength: 'STRENGTH_APPRECIATION' }
    },
    'UNIFIED_STRENGTH': {
      prompt: "Jin-Woo and Cha Hae-In as a unified force. Perfect team synergy, anime style.",
      narration: "Together, you feel invincible.",
      chat: [
        { sender: 'Cha Hae-In', text: "We can take on anything together! This feeling... it's incredible!" },
        { sender: 'player', text: "Nothing can stand against us when we're united like this." }
      ],
      choices: [
        { text: "Prove it in battle", detail: "Test your unity", type: 'unity_test' },
        { text: "Seal it with a promise", detail: "Commit to each other", type: 'unity_promise' }
      ],
      leadsTo: { unity_test: 'GATE_ENTRANCE', unity_promise: 'PARTNERSHIP_VOW' }
    },
    'PROFESSIONAL_BOND': {
      prompt: "Establishing a professional hunting partnership. Business relationship, anime style.",
      narration: "You decide to keep things professional, for now.",
      chat: [
        { sender: 'Cha Hae-In', text: "Professional it is. Though... I hope we can still be friends outside of hunting." },
        { sender: 'player', text: "Of course. The best partnerships are built on friendship." }
      ],
      choices: [
        { text: "Suggest coffee meetings", detail: "Regular friendly meetings", type: 'friend_meetings' },
        { text: "Focus on the mission", detail: "Stay work-focused", type: 'mission_focus' }
      ],
      leadsTo: { friend_meetings: 'FRIENDSHIP_BUILDING', mission_focus: 'GATE_ENTRANCE' }
    },
    'PERSONAL_BOND': {
      prompt: "Opening up to a more personal relationship. Romance beginning, anime style.",
      narration: "The personal nature of your partnership feels right.",
      chat: [
        { sender: 'Cha Hae-In', text: "Personal... I'd like that very much. You mean a lot to me, Jin-Woo." },
        { sender: 'player', text: "You mean everything to me, Hae-In." }
      ],
      choices: [
        { text: "Take her hand", detail: "Show affection", type: 'take_hand' },
        { text: "Plan a real date", detail: "Romance properly", type: 'plan_date' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', plan_date: 'DATE_PLANNING' }
    },
    'NATURAL_BOND': {
      prompt: "Letting the relationship develop naturally. Organic growth, anime style.",
      narration: "Sometimes the best things happen naturally.",
      chat: [
        { sender: 'Cha Hae-In', text: "I like that approach. Let's see where this takes us." },
        { sender: 'player', text: "Whatever feels right between us." }
      ],
      choices: [
        { text: "Start with this mission", detail: "Begin the journey", type: 'begin_journey' },
        { text: "Share a moment", detail: "Connect now", type: 'share_moment' }
      ],
      leadsTo: { begin_journey: 'GATE_ENTRANCE', share_moment: 'NATURAL_MOMENT' }
    },
    'QUIET_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In finding a peaceful spot together. Intimate quiet time, anime style.",
      narration: "You find a quiet park bench with a view of the city.",
      chat: [
        { sender: 'Cha Hae-In', text: "This is perfect. Just peaceful silence with someone who understands." },
        { sender: 'player', text: "Sometimes words aren't necessary." }
      ],
      choices: [
        { text: "Enjoy the silence", detail: "Comfortable quiet", type: 'comfortable_silence' },
        { text: "Talk about dreams", detail: "Share aspirations", type: 'share_dreams' }
      ],
      leadsTo: { comfortable_silence: 'PEACEFUL_CONNECTION', share_dreams: 'DREAM_SHARING' }
    },
    'PROTECTION_APPRECIATED': {
      prompt: "Cha Hae-In appreciating Jin-Woo's protective nature in the dungeon. Warmth in danger, anime style.",
      narration: "Your continued protection earns you a warm smile from Hae-In.",
      chat: [
        { sender: 'Cha Hae-In', text: "I appreciate this, Jin-Woo. Even if I don't need it, knowing you care this much..." },
        { sender: 'player', text: "I'll always watch over you, no matter how strong you are." }
      ],
      choices: [
        { text: "Continue deeper", detail: "Advance through dungeon", type: 'advance_dungeon' },
        { text: "Stay close together", detail: "Maintain formation", type: 'stay_together' }
      ],
      leadsTo: { advance_dungeon: 'DUNGEON_PROGRESS', stay_together: 'CLOSE_FORMATION' }
    },
    'TRUST_DEMONSTRATED': {
      prompt: "Jin-Woo showing trust in Cha Hae-In's abilities during combat. Mutual respect, anime style.",
      narration: "You step back, giving Hae-In the space to show her true skills.",
      chat: [
        { sender: 'Cha Hae-In', text: "Thank you for trusting me. Watch this!" },
        { sender: 'system', text: "Cha Hae-In unleashes her full sword technique!" }
      ],
      choices: [
        { text: "Support from shadows", detail: "Complement her attacks", type: 'shadow_support' },
        { text: "Admire her technique", detail: "Appreciate her skill", type: 'admire_technique' }
      ],
      leadsTo: { shadow_support: 'PERFECT_COORDINATION', admire_technique: 'SKILL_APPRECIATION' }
    },
    'TACTICAL_SUCCESS': {
      prompt: "Jin-Woo and Cha Hae-In reuniting after successful tactical separation. Strategic victory, anime style.",
      narration: "You meet in the center of the dungeon, both having cleared your sections perfectly.",
      chat: [
        { sender: 'Cha Hae-In', text: "Perfect execution! Our tactical coordination is flawless." },
        { sender: 'player', text: "We make an incredible team." }
      ],
      choices: [
        { text: "Prepare for boss fight", detail: "Ready for final challenge", type: 'boss_preparation' },
        { text: "Celebrate the teamwork", detail: "Acknowledge the success", type: 'celebrate_teamwork' }
      ],
      leadsTo: { boss_preparation: 'BOSS_APPROACH', celebrate_teamwork: 'TEAMWORK_MOMENT' }
    },
    'CARING_TACTICS': {
      prompt: "Jin-Woo frequently checking on Cha Hae-In during tactical separation. Caring strategy, anime style.",
      narration: "Your frequent check-ins show how much you care about her safety.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're still worried about me, aren't you? It's sweet." },
        { sender: 'player', text: "I can't help it. You matter too much to me." }
      ],
      choices: [
        { text: "Admit your feelings", detail: "Open up emotionally", type: 'admit_feelings' },
        { text: "Rejoin her side", detail: "Stay together", type: 'rejoin_formation' }
      ],
      leadsTo: { admit_feelings: 'DUNGEON_CONFESSION', rejoin_formation: 'PROTECTIVE_DUNGEON' }
    },
    'INSPIRATION_MOMENT': {
      prompt: "Mutual inspiration between Jin-Woo and Cha Hae-In. Shared admiration, anime style.",
      narration: "The mutual respect and admiration between you creates a powerful moment.",
      chat: [
        { sender: 'Cha Hae-In', text: "We inspire each other to be better. That's... beautiful." },
        { sender: 'player', text: "Together, we're unstoppable." }
      ],
      choices: [
        { text: "Face the boss together", detail: "United front", type: 'united_boss_fight' },
        { text: "Share a meaningful look", detail: "Silent connection", type: 'meaningful_connection' }
      ],
      leadsTo: { united_boss_fight: 'BOSS_APPROACH', meaningful_connection: 'SILENT_BOND' }
    },
    'MUTUAL_VULNERABILITY': {
      prompt: "Jin-Woo and Cha Hae-In sharing their deepest struggles. Emotional intimacy, anime style.",
      narration: "Opening up to each other creates a profound bond.",
      chat: [
        { sender: 'player', text: "I understand that feeling. Sometimes the power isolates us from everyone." },
        { sender: 'Cha Hae-In', text: "But not from each other. We understand this burden." }
      ],
      choices: [
        { text: "Promise to support each other", detail: "Mutual commitment", type: 'mutual_support' },
        { text: "Take her hand", detail: "Physical comfort", type: 'take_hand' }
      ],
      leadsTo: { mutual_support: 'SUPPORT_PROMISE', take_hand: 'HAND_HOLDING' }
    },
    'GROWTH_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's personal growth. Encouragement and support, anime style.",
      narration: "Your recognition of her growth touches Hae-In deeply.",
      chat: [
        { sender: 'Cha Hae-In', text: "You really think I've found myself again?" },
        { sender: 'player', text: "I see the real you. Strong, compassionate, and absolutely incredible." }
      ],
      choices: [
        { text: "Tell her she's perfect", detail: "Complete acceptance", type: 'perfect_acceptance' },
        { text: "Share what you see in her", detail: "Detailed appreciation", type: 'detailed_appreciation' }
      ],
      leadsTo: { perfect_acceptance: 'PERFECT_MOMENT', detailed_appreciation: 'DEEP_APPRECIATION' }
    },
    'INTIMATE_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In sharing intense eye contact. Deep emotional connection, anime style.",
      narration: "Looking into her eyes, you see everything you've been searching for.",
      chat: [
        { sender: 'Cha Hae-In', text: "When you look at me like that... I feel like I could face anything." },
        { sender: 'player', text: "You're my strength, Hae-In." }
      ],
      choices: [
        { text: "Move closer", detail: "Close the distance", type: 'move_closer' },
        { text: "Confess your love", detail: "Express your feelings", type: 'love_confession' }
      ],
      leadsTo: { move_closer: 'INTIMATE_CLOSENESS', love_confession: 'LOVE_DECLARATION' }
    },
    'CAFE_KISS': {
      prompt: "Jin-Woo and Cha Hae-In sharing their first kiss in the café. Sweet romantic moment, anime style.",
      narration: "The kiss is gentle, perfect, and full of promise.",
      chat: [
        { sender: 'Cha Hae-In', text: "That was... perfect. I've been dreaming of this." },
        { sender: 'player', text: "Worth every moment of waiting." }
      ],
      choices: [
        { text: "Plan more dates", detail: "Build the relationship", type: 'plan_more_dates' },
        { text: "Head to the gate", detail: "Continue the mission together", type: 'mission_as_couple' }
      ],
      leadsTo: { plan_more_dates: 'RELATIONSHIP_BUILDING', mission_as_couple: 'COUPLE_MISSION' }
    },
    'DATE_PLANNING': {
      prompt: "Jin-Woo and Cha Hae-In planning their first official date. Romantic anticipation, anime style.",
      narration: "Planning your first real date fills both of you with excitement.",
      chat: [
        { sender: 'Cha Hae-In', text: "A real date? I'd love that. Somewhere we can just be ourselves." },
        { sender: 'player', text: "I know the perfect place. Just you and me." }
      ],
      choices: [
        { text: "Promise something special", detail: "Commit to romance", type: 'special_promise' },
        { text: "Start with this mission", detail: "Make this the first date", type: 'mission_date' }
      ],
      leadsTo: { special_promise: 'ROMANTIC_PROMISE', mission_date: 'GATE_ENTRANCE' }
    },
    'CONNECTION_DEEPENS': {
      prompt: "The connection between Jin-Woo and Cha Hae-In deepening profoundly. Soul bond, anime style.",
      narration: "The understanding between you transcends words.",
      chat: [
        { sender: 'Cha Hae-In', text: "This connection... it's like nothing I've ever felt." },
        { sender: 'player', text: "We're meant to be together, aren't we?" }
      ],
      choices: [
        { text: "Confirm your bond", detail: "Acknowledge the connection", type: 'confirm_bond' },
        { text: "Seal it with love", detail: "Express your love", type: 'seal_with_love' }
      ],
      leadsTo: { confirm_bond: 'SOUL_BOND', seal_with_love: 'LOVE_SEALED' }
    },
    'DATE_ACCEPTED': {
      prompt: "Cha Hae-In blushing and smiling after being asked on a date. Happy romantic acceptance, anime style.",
      narration: "Your direct approach catches Hae-In off guard, but her smile tells you everything you need to know.",
      chat: [
        { sender: 'Cha Hae-In', text: "A... a real date? Just the two of us?" },
        { sender: 'player', text: "If you'd like that. Somewhere special, away from gates and monsters." },
        { sender: 'Cha Hae-In', text: "I'd love that, Jin-Woo. I've been hoping you'd ask." }
      ],
      choices: [
        { text: "Plan the perfect date", detail: "Make it memorable", type: 'plan_perfect_date' },
        { text: "Start with dinner tonight", detail: "Begin immediately", type: 'dinner_tonight' },
        { text: "Ask what she'd enjoy", detail: "Let her choose", type: 'ask_preferences' }
      ],
      leadsTo: { plan_perfect_date: 'PERFECT_DATE_PLANNING', dinner_tonight: 'DINNER_DATE', ask_preferences: 'HER_PREFERENCES' }
    },
    'CASUAL_AGREEMENT': {
      prompt: "Cha Hae-In agreeing to casual time together. Friendly but warm response, anime style.",
      narration: "Your gentle approach puts Hae-In at ease.",
      chat: [
        { sender: 'Cha Hae-In', text: "Casual hanging out sounds nice. It's been a while since I could just... relax with someone." },
        { sender: 'player', text: "No pressure, just spending time together." },
        { sender: 'Cha Hae-In', text: "I'd really like that. Maybe we could start with coffee sometime?" }
      ],
      choices: [
        { text: "Coffee sounds perfect", detail: "Accept her suggestion", type: 'coffee_perfect' },
        { text: "Or maybe a walk?", detail: "Suggest alternatives", type: 'suggest_walk' },
        { text: "Whatever makes you happy", detail: "Be considerate", type: 'your_happiness' }
      ],
      leadsTo: { coffee_perfect: 'COFFEE_AGREEMENT', suggest_walk: 'WALK_SUGGESTION', your_happiness: 'CONSIDERATE_RESPONSE' }
    },
    'PERFECT_DATE_PLANNING': {
      prompt: "Jin-Woo planning an elaborate romantic date for Cha Hae-In. Romantic planning scene, anime style.",
      narration: "You want this to be perfect for her.",
      chat: [
        { sender: 'player', text: "I want to plan something really special for you. You deserve the best." },
        { sender: 'Cha Hae-In', text: "You don't have to go overboard... though I admit I'm curious what the Shadow Monarch considers romantic." },
        { sender: 'Cha Hae-In', text: "Just being with you would be perfect enough." }
      ],
      choices: [
        { text: "Rooftop dinner under stars", detail: "Romantic and private", type: 'rooftop_dinner' },
        { text: "Private beach at sunset", detail: "Beautiful and serene", type: 'beach_sunset' },
        { text: "Cozy bookstore café", detail: "Intimate and personal", type: 'bookstore_cafe' }
      ],
      leadsTo: { rooftop_dinner: 'ROOFTOP_DATE', beach_sunset: 'BEACH_DATE', bookstore_cafe: 'BOOKSTORE_DATE' }
    },
    'DINNER_DATE': {
      prompt: "Jin-Woo and Cha Hae-In having dinner together tonight. Immediate romantic evening, anime style.",
      narration: "Sometimes the best moments happen spontaneously.",
      chat: [
        { sender: 'Cha Hae-In', text: "Tonight? That's... wonderfully impulsive of you." },
        { sender: 'player', text: "Why wait? Life's too short, and I want to spend time with you." },
        { sender: 'Cha Hae-In', text: "You're right. Let's do it. I know a quiet place that's perfect." }
      ],
      choices: [
        { text: "Follow her lead", detail: "Trust her choice", type: 'follow_lead' },
        { text: "Suggest somewhere special", detail: "Take initiative", type: 'suggest_special' },
        { text: "Anywhere with you is perfect", detail: "Focus on her company", type: 'anywhere_perfect' }
      ],
      leadsTo: { follow_lead: 'HER_CHOICE_RESTAURANT', suggest_special: 'SPECIAL_RESTAURANT', anywhere_perfect: 'ROMANTIC_DECLARATION' }
    },
    'STRENGTH_APPRECIATION': {
      prompt: "Jin-Woo admiring Cha Hae-In's incredible power and grace. Appreciation and awe, anime style.",
      narration: "Watching her strength fills you with admiration and something deeper.",
      chat: [
        { sender: 'player', text: "Your strength is incredible, Hae-In. The way you fight... it's like art." },
        { sender: 'Cha Hae-In', text: "You really think so? Coming from someone as strong as you, that means everything." },
        { sender: 'Cha Hae-In', text: "But it's not just physical strength that matters, is it?" }
      ],
      choices: [
        { text: "Your heart is strongest", detail: "Focus on her character", type: 'heart_strongest' },
        { text: "We complement each other", detail: "Partnership focus", type: 'complement_each_other' },
        { text: "You inspire me", detail: "Personal impact", type: 'you_inspire_me' }
      ],
      leadsTo: { heart_strongest: 'HEART_RECOGNITION', complement_each_other: 'PERFECT_MATCH', you_inspire_me: 'MUTUAL_INSPIRATION' }
    },
    'ENERGIZED_MISSION': {
      prompt: "Cha Hae-In channeling her confidence toward the mission. Focused energy, anime style.",
      narration: "Her renewed confidence transforms the entire atmosphere.",
      chat: [
        { sender: 'Cha Hae-In', text: "Alright! Let's tackle this mission with everything we've got!" },
        { sender: 'player', text: "That's the spirit. Nothing can stop us now." },
        { sender: 'Cha Hae-In', text: "Ready to show this dungeon what real teamwork looks like?" }
      ],
      choices: [
        { text: "Lead the charge together", detail: "United assault", type: 'lead_together' },
        { text: "Follow her lead", detail: "Let her shine", type: 'follow_her_lead' },
        { text: "Create a strategy", detail: "Tactical approach", type: 'create_strategy' }
      ],
      leadsTo: { lead_together: 'UNITED_CHARGE', follow_her_lead: 'HER_LEADERSHIP', create_strategy: 'TACTICAL_PLANNING' }
    },
    'COOL_RESPONSE': {
      prompt: "Jin-Woo playing it cool during first meeting. Composed confidence, anime style.",
      narration: "Your calm demeanor catches her attention.",
      chat: [
        { sender: 'player', text: "Just another day for the Shadow Monarch." },
        { sender: 'Cha Hae-In', text: "Confidence suits you. I like that you don't feel the need to show off." },
        { sender: 'Cha Hae-In', text: "Most hunters would be bragging about clearing an S-rank gate solo." }
      ],
      choices: [
        { text: "Actions speak louder", detail: "Philosophy on strength", type: 'actions_speak' },
        { text: "Ask about her missions", detail: "Show interest in her", type: 'ask_missions' },
        { text: "Suggest working together", detail: "Partnership proposal", type: 'suggest_partnership' }
      ],
      leadsTo: { actions_speak: 'PHILOSOPHY_MOMENT', ask_missions: 'MISSION_DISCUSSION', suggest_partnership: 'PARTNERSHIP_INTEREST' }
    },
    'HUMBLE_RESPONSE': {
      prompt: "Jin-Woo showing humility despite his power. Modest strength, anime style.",
      narration: "Your humility impresses her more than arrogance ever could.",
      chat: [
        { sender: 'player', text: "I just did what needed to be done. Anyone would have." },
        { sender: 'Cha Hae-In', text: "Not anyone could have done that, Jin-Woo. Your humility is... refreshing." },
        { sender: 'Cha Hae-In', text: "Most S-rank hunters have egos the size of skyscrapers." }
      ],
      choices: [
        { text: "Strength without wisdom is dangerous", detail: "Share philosophy", type: 'wisdom_matters' },
        { text: "What about you?", detail: "Turn focus to her", type: 'about_you' },
        { text: "We all have our roles", detail: "Humble perspective", type: 'our_roles' }
      ],
      leadsTo: { wisdom_matters: 'WISDOM_DISCUSSION', about_you: 'ABOUT_HER', our_roles: 'ROLE_PHILOSOPHY' }
    },
    'HUMBLE_MOMENT': {
      prompt: "Jin-Woo deflecting praise with humility. Self-deprecating charm, anime style.",
      narration: "Your modest response draws a genuine smile from her.",
      chat: [
        { sender: 'player', text: "Mine was boring compared to yours. I just hit things until they stopped moving." },
        { sender: 'Cha Hae-In', text: "Don't sell yourself short. There's an art to what you do too." },
        { sender: 'Cha Hae-In', text: "Besides, I'd love to hear about it anyway." }
      ],
      choices: [
        { text: "Share your story", detail: "Open up about adventures", type: 'share_adventure' },
        { text: "Focus on her instead", detail: "Redirect attention", type: 'focus_on_her' },
        { text: "Suggest coffee and stories", detail: "Extend the conversation", type: 'coffee_stories' }
      ],
      leadsTo: { share_adventure: 'ADVENTURE_SHARING', focus_on_her: 'HER_FOCUS', coffee_stories: 'COFFEE_INVITATION' }
    },
    'STORY_SHARING': {
      prompt: "Jin-Woo sharing his adventures with Cha Hae-In. Storytelling moment, anime style.",
      narration: "As you recount your experiences, she listens with genuine interest.",
      chat: [
        { sender: 'player', text: "The dungeon was unlike anything I'd seen. Ancient magic, puzzles that tested more than just strength..." },
        { sender: 'Cha Hae-In', text: "That sounds incredible. I love dungeons that challenge the mind too." },
        { sender: 'Cha Hae-In', text: "Most hunters just want to rush in and fight, but there's beauty in the complexity." }
      ],
      choices: [
        { text: "You understand perfectly", detail: "Acknowledge her insight", type: 'perfect_understanding' },
        { text: "Want to explore one together?", detail: "Partnership invitation", type: 'explore_together' },
        { text: "Tell me about your favorites", detail: "Learn about her preferences", type: 'her_favorites' }
      ],
      leadsTo: { perfect_understanding: 'UNDERSTANDING_BOND', explore_together: 'EXPLORATION_PARTNERSHIP', her_favorites: 'FAVORITE_DUNGEONS' }
    },
    'SHADOW_VICTORY': {
      prompt: "Jin-Woo's shadow army overwhelming the ice dragon. Epic shadow dominance, anime style.",
      narration: "Your shadows surge forward like a dark tide, overwhelming the ancient beast.",
      chat: [
        { sender: 'system', text: "Shadow Army deployed! The ice dragon is completely overwhelmed!" },
        { sender: 'Cha Hae-In', text: "Incredible... the power of the Shadow Monarch in full display." },
        { sender: 'Cha Hae-In', text: "You could have handled this alone, couldn't you?" }
      ],
      choices: [
        { text: "But it's better with you", detail: "Value her presence", type: 'better_with_you' },
        { text: "Extract the dragon's shadow", detail: "Add to your army", type: 'extract_shadow' },
        { text: "Power means nothing alone", detail: "Philosophical response", type: 'power_meaningless_alone' }
      ],
      leadsTo: { better_with_you: 'VALUED_PARTNERSHIP', extract_shadow: 'SHADOW_EXTRACTION', power_meaningless_alone: 'POWER_PHILOSOPHY' }
    },
    'HAE_IN_MOMENT': {
      prompt: "Cha Hae-In taking the lead against the ice dragon. Her moment to shine, anime style.",
      narration: "You step back, allowing Hae-In to show her true strength.",
      chat: [
        { sender: 'Cha Hae-In', text: "Thank you for trusting me with this." },
        { sender: 'system', text: "Cha Hae-In unleashes her ultimate sword technique!" },
        { sender: 'Cha Hae-In', text: "That felt amazing! Having your support gave me confidence I've never felt before." }
      ],
      choices: [
        { text: "You were magnificent", detail: "Praise her performance", type: 'you_magnificent' },
        { text: "We make a perfect team", detail: "Emphasize partnership", type: 'perfect_team' },
        { text: "I believed in you completely", detail: "Show faith in her", type: 'believed_in_you' }
      ],
      leadsTo: { you_magnificent: 'MAGNIFICENT_PRAISE', perfect_team: 'PERFECT_TEAMWORK', believed_in_you: 'COMPLETE_FAITH' }
    },
    'SHADOW_EXTRACTION': {
      prompt: "Jin-Woo extracting the ice dragon's shadow. Dark power absorption, anime style.",
      narration: "The dragon's essence flows into your shadow realm, adding to your army.",
      chat: [
        { sender: 'system', text: "Shadow successfully extracted! Ice Dragon added to your army!" },
        { sender: 'Cha Hae-In', text: "Every time I see you do that, it amazes me. The power to command even death itself." },
        { sender: 'Cha Hae-In', text: "But you use that power to protect people. That's what makes you special." }
      ],
      choices: [
        { text: "You make me want to be better", detail: "Her positive influence", type: 'make_me_better' },
        { text: "Power is meaningless without purpose", detail: "Share your philosophy", type: 'power_purpose' },
        { text: "Shall we head back?", detail: "Mission complete", type: 'head_back' }
      ],
      leadsTo: { make_me_better: 'POSITIVE_INFLUENCE', power_purpose: 'PURPOSE_DISCUSSION', head_back: 'MISSION_COMPLETE' }
    },
    'TEASE_RESPONSE': {
      prompt: "Cha Hae-In's reaction to Jin-Woo's teasing. Playful romantic tension, anime style.",
      narration: "Your teasing brings out a playful side of her you've never seen.",
      chat: [
        { sender: 'Cha Hae-In', text: "Maybe I'm imagining things? You're terrible!" },
        { sender: 'player', text: "Am I though? Your face is pretty red for someone who's imagining things." },
        { sender: 'Cha Hae-In', text: "That's... that's just from the dungeon heat! You're impossible, Jin-Woo." }
      ],
      choices: [
        { text: "I love seeing you flustered", detail: "Continue the teasing", type: 'love_flustered' },
        { text: "You're cute when you're embarrassed", detail: "Sweet compliment", type: 'cute_embarrassed' },
        { text: "Okay, I'll be serious", detail: "Switch to sincerity", type: 'be_serious' }
      ],
      leadsTo: { love_flustered: 'FLUSTERED_RESPONSE', cute_embarrassed: 'CUTE_REACTION', be_serious: 'SERIOUS_MOMENT' }
    },
    'TENDER_EMBRACE': {
      prompt: "Jin-Woo and Cha Hae-In sharing a tender embrace. Emotional intimacy, anime style.",
      narration: "She melts into your arms, and for a moment, the world feels perfect.",
      chat: [
        { sender: 'Cha Hae-In', text: "I never thought I could feel this safe with someone." },
        { sender: 'player', text: "You are safe with me. Always." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I think I'm falling in love with you." }
      ],
      choices: [
        { text: "I love you too", detail: "Mutual confession", type: 'love_you_too' },
        { text: "I've loved you for a while", detail: "Admit longer feelings", type: 'loved_you_while' },
        { text: "Kiss her gently", detail: "Actions over words", type: 'gentle_kiss' }
      ],
      leadsTo: { love_you_too: 'MUTUAL_LOVE', loved_you_while: 'LONG_LOVE', gentle_kiss: 'GENTLE_KISS' }
    },
    'PERFECT_MOMENT': {
      prompt: "Jin-Woo and Cha Hae-In savoring a perfect moment together. Pure happiness, anime style.",
      narration: "Time seems to stop as you both realize this is where you belong.",
      chat: [
        { sender: 'Cha Hae-In', text: "I want to remember this moment forever." },
        { sender: 'player', text: "So do I. This feeling... I never want it to end." },
        { sender: 'Cha Hae-In', text: "With you, every moment feels like it could last forever." }
      ],
      choices: [
        { text: "Promise me more moments like this", detail: "Future commitment", type: 'promise_more_moments' },
        { text: "You're my everything", detail: "Deep declaration", type: 'my_everything' },
        { text: "Let's make this official", detail: "Relationship milestone", type: 'make_official' }
      ],
      leadsTo: { promise_more_moments: 'FUTURE_PROMISE', my_everything: 'EVERYTHING_DECLARATION', make_official: 'OFFICIAL_RELATIONSHIP' }
    },
    'HEART_RECOGNITION': {
      prompt: "Jin-Woo recognizing Cha Hae-In's inner strength. Heart connection, anime style.",
      narration: "Your words touch the core of who she is.",
      chat: [
        { sender: 'Cha Hae-In', text: "My heart? I... thank you for seeing that in me." },
        { sender: 'player', text: "Your compassion, your determination to protect others - that's your real strength." }
      ],
      choices: [
        { text: "That's what I fell for", detail: "Romantic admission", type: 'fell_for_heart' },
        { text: "Continue the mission", detail: "Focus ahead", type: 'mission_continue' }
      ],
      leadsTo: { fell_for_heart: 'HEART_CONFESSION', mission_continue: 'GATE_ENTRANCE' }
    },
    'PERFECT_MATCH': {
      prompt: "Jin-Woo and Cha Hae-In as perfect complements. Harmony, anime style.",
      narration: "The balance between you feels natural and right.",
      chat: [
        { sender: 'Cha Hae-In', text: "We really do complement each other perfectly." },
        { sender: 'player', text: "Your light balances my shadows." }
      ],
      choices: [
        { text: "We were meant to meet", detail: "Destiny theme", type: 'meant_to_meet' },
        { text: "Let's prove it together", detail: "Action focus", type: 'prove_together' }
      ],
      leadsTo: { meant_to_meet: 'DESTINY_MOMENT', prove_together: 'GATE_ENTRANCE' }
    },
    'MUTUAL_INSPIRATION': {
      prompt: "Both inspiring each other to greater heights. Shared motivation, anime style.",
      narration: "The synergy between you creates something greater than the sum of its parts.",
      chat: [
        { sender: 'Cha Hae-In', text: "And you inspire me to be braver than I ever thought possible." },
        { sender: 'player', text: "Together, we can face anything." }
      ],
      choices: [
        { text: "Promise to always support each other", detail: "Mutual commitment", type: 'mutual_support' },
        { text: "Face the future together", detail: "Forward focus", type: 'future_together' }
      ],
      leadsTo: { mutual_support: 'SUPPORT_PROMISE', future_together: 'SHARED_FUTURE' }
    },
    'SKILL_APPRECIATION': {
      prompt: "Jin-Woo deeply appreciating Cha Hae-In's combat mastery. Technical admiration, anime style.",
      narration: "Her technique is flawless, a perfect blend of power and grace.",
      chat: [
        { sender: 'player', text: "Your swordsmanship is art in motion. Every strike has purpose and beauty." },
        { sender: 'Cha Hae-In', text: "Coming from you, that means everything. I've always admired your tactical mind." }
      ],
      choices: [
        { text: "Spar with me sometime?", detail: "Training invitation", type: 'spar_invitation' },
        { text: "Teach me your techniques", detail: "Learning request", type: 'teach_techniques' }
      ],
      leadsTo: { spar_invitation: 'SPARRING_AGREEMENT', teach_techniques: 'TEACHING_MOMENT' }
    },
    'CLOSE_FORMATION': {
      prompt: "Jin-Woo and Cha Hae-In in close protective formation. Intimate teamwork, anime style.",
      narration: "Moving as one unit, you clear the dungeon with unprecedented coordination.",
      chat: [
        { sender: 'Cha Hae-In', text: "This formation feels so natural with you." },
        { sender: 'player', text: "Like we've been fighting together for years." }
      ],
      choices: [
        { text: "We should make this permanent", detail: "Partnership proposal", type: 'permanent_team' },
        { text: "Focus on the boss ahead", detail: "Mission priority", type: 'focus_boss' }
      ],
      leadsTo: { permanent_team: 'PERMANENT_PARTNERSHIP', focus_boss: 'BOSS_APPROACH' }
    },
    'PERFECT_COORDINATION': {
      prompt: "Flawless combat coordination between Jin-Woo and Cha Hae-In. Synchronized fighting, anime style.",
      narration: "Your movements flow together like a deadly dance.",
      chat: [
        { sender: 'Cha Hae-In', text: "Our timing is perfect! It's like you can read my mind." },
        { sender: 'player', text: "Maybe I can. Or maybe we're just meant to fight together." }
      ],
      choices: [
        { text: "This is how it should always be", detail: "Permanent partnership", type: 'always_together' },
        { text: "Press the advantage", detail: "Tactical focus", type: 'press_advantage' }
      ],
      leadsTo: { always_together: 'ETERNAL_PARTNERSHIP', press_advantage: 'BOSS_APPROACH' }
    },
    'TEAMWORK_MOMENT': {
      prompt: "Celebrating successful teamwork. Victory through collaboration, anime style.",
      narration: "Your combined efforts have created something beautiful.",
      chat: [
        { sender: 'Cha Hae-In', text: "Look what we accomplished together! I've never felt this powerful." },
        { sender: 'player', text: "Teamwork makes us both stronger." }
      ],
      choices: [
        { text: "Let's keep working together", detail: "Future partnership", type: 'keep_working' },
        { text: "You make me stronger too", detail: "Mutual empowerment", type: 'make_stronger' }
      ],
      leadsTo: { keep_working: 'CONTINUED_PARTNERSHIP', make_stronger: 'MUTUAL_STRENGTH' }
    },
    'DUNGEON_CONFESSION': {
      prompt: "Jin-Woo confessing feelings in the middle of a dungeon. Romantic vulnerability, anime style.",
      narration: "Sometimes the heart chooses its moment, regardless of circumstance.",
      chat: [
        { sender: 'player', text: "Hae-In, I need to tell you something. I care about you more than just as a partner." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... in the middle of a dungeon? You really know how to surprise a girl." },
        { sender: 'Cha Hae-In', text: "But I'm glad you said it. I feel the same way." }
      ],
      choices: [
        { text: "When we get out, I want to take you somewhere special", detail: "Date promise", type: 'date_promise' },
        { text: "Can we finish this mission first?", detail: "Mission focus", type: 'mission_first' }
      ],
      leadsTo: { date_promise: 'DATE_PROMISE', mission_first: 'MISSION_PRIORITY' }
    },
    'SILENT_BOND': {
      prompt: "A moment of silent understanding between Jin-Woo and Cha Hae-In. Wordless connection, anime style.",
      narration: "Sometimes the deepest connections need no words.",
      chat: [
        { sender: 'Cha Hae-In', text: "..." },
        { sender: 'player', text: "..." },
        { sender: 'Cha Hae-In', text: "I understand completely." }
      ],
      choices: [
        { text: "Take her hand", detail: "Physical connection", type: 'take_hand' },
        { text: "Nod and continue", detail: "Respectful acknowledgment", type: 'nod_continue' }
      ],
      leadsTo: { take_hand: 'HAND_HOLDING', nod_continue: 'RESPECTFUL_BOND' }
    },
    'LOVE_DECLARATION': {
      prompt: "Jin-Woo declaring his love for Cha Hae-In. Ultimate confession, anime style.",
      narration: "The words come from the deepest part of your heart.",
      chat: [
        { sender: 'player', text: "I love you, Cha Hae-In. Completely and utterly." },
        { sender: 'Cha Hae-In', text: "Jin-Woo... I love you too. More than I ever thought possible." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal the declaration", type: 'sealing_kiss' },
        { text: "Hold her close", detail: "Tender embrace", type: 'tender_hold' }
      ],
      leadsTo: { sealing_kiss: 'LOVE_KISS', tender_hold: 'LOVE_EMBRACE' }
    },
    'LOVE_SEALED': {
      prompt: "Their love officially sealed. Complete romantic union, anime style.",
      narration: "Nothing can separate you now.",
      chat: [
        { sender: 'Cha Hae-In', text: "This feels like a dream come true." },
        { sender: 'player', text: "The best kind of dream - one we're living together." }
      ],
      choices: [
        { text: "Plan our future", detail: "Look ahead together", type: 'plan_future' },
        { text: "Savor this moment", detail: "Stay in the present", type: 'savor_now' }
      ],
      leadsTo: { plan_future: 'FUTURE_PLANNING', savor_now: 'PRESENT_BLISS' }
    },
    'SOUL_BOND': {
      prompt: "Jin-Woo and Cha Hae-In forming a soul bond. Spiritual connection, anime style.",
      narration: "Your souls resonate at the same frequency, creating an unbreakable bond.",
      chat: [
        { sender: 'Cha Hae-In', text: "I can feel it... our connection goes deeper than anything physical." },
        { sender: 'player', text: "We're bound now, in every way that matters." }
      ],
      choices: [
        { text: "Promise to protect this bond", detail: "Sacred vow", type: 'protect_bond' },
        { text: "Embrace the eternal connection", detail: "Accept destiny", type: 'embrace_eternal' }
      ],
      leadsTo: { protect_bond: 'BOND_PROTECTION', embrace_eternal: 'ETERNAL_LOVE' }
    },
    'NATURAL_MOMENT': {
      prompt: "A perfectly natural moment between Jin-Woo and Cha Hae-In. Organic connection, anime style.",
      narration: "Everything feels effortless when you're together.",
      chat: [
        { sender: 'Cha Hae-In', text: "This feels so natural, like we've always been together." },
        { sender: 'player', text: "Some things are just meant to be." }
      ],
      choices: [
        { text: "Stay in this moment", detail: "Savor the feeling", type: 'stay_moment' },
        { text: "Make it permanent", detail: "Commitment", type: 'make_permanent' }
      ],
      leadsTo: { stay_moment: 'SAVORED_MOMENT', make_permanent: 'PERMANENT_BOND' }
    },
    'RELATIONSHIP_BUILDING': {
      prompt: "Jin-Woo and Cha Hae-In building their relationship. Growing connection, anime style.",
      narration: "Each conversation deepens what you have together.",
      chat: [
        { sender: 'Cha Hae-In', text: "I love how we can talk about anything." },
        { sender: 'player', text: "With you, conversation flows like breathing." }
      ],
      choices: [
        { text: "Share your deepest thoughts", detail: "Vulnerability", type: 'deepest_thoughts' },
        { text: "Ask about her dreams", detail: "Learn about her", type: 'her_dreams' }
      ],
      leadsTo: { deepest_thoughts: 'DEEP_SHARING', her_dreams: 'DREAM_SHARING' }
    },
    'FRIENDSHIP_BUILDING': {
      prompt: "Building a strong friendship foundation. Platonic but meaningful connection, anime style.",
      narration: "The foundation of trust you're building is solid and real.",
      chat: [
        { sender: 'Cha Hae-In', text: "I'm so glad we're friends, Jin-Woo. I feel like I can trust you completely." },
        { sender: 'player', text: "That trust means everything to me. I'll never betray it." }
      ],
      choices: [
        { text: "Friends who can become more", detail: "Hint at romance", type: 'friends_to_more' },
        { text: "Loyal friendship forever", detail: "Platonic commitment", type: 'loyal_friendship' }
      ],
      leadsTo: { friends_to_more: 'ROMANTIC_POTENTIAL', loyal_friendship: 'ETERNAL_FRIENDSHIP' }
    },
    'MUTUAL_FEELINGS': {
      prompt: "Both expressing mutual romantic feelings. Love confession, anime style.",
      narration: "The truth is finally out in the open.",
      chat: [
        { sender: 'Cha Hae-In', text: "I've been feeling the same way for so long." },
        { sender: 'player', text: "Then why did we wait so long to say it?" },
        { sender: 'Cha Hae-In', text: "Because now feels perfect." }
      ],
      choices: [
        { text: "Kiss her", detail: "Seal the moment", type: 'kiss_seal' },
        { text: "Hold her hands", detail: "Gentle connection", type: 'hold_hands' }
      ],
      leadsTo: { kiss_seal: 'SEALING_KISS', hold_hands: 'HAND_CONNECTION' }
    },
    'PASSIONATE_MOMENT': {
      prompt: "A passionate romantic moment between Jin-Woo and Cha Hae-In. Intense connection, anime style.",
      narration: "The intensity of your feelings overwhelms both of you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Jin-Woo... I never knew I could feel this way." },
        { sender: 'player', text: "You've awakened something in me I didn't know existed." }
      ],
      choices: [
        { text: "Express your love completely", detail: "Total vulnerability", type: 'complete_love' },
        { text: "Promise to cherish her always", detail: "Eternal commitment", type: 'cherish_always' }
      ],
      leadsTo: { complete_love: 'COMPLETE_LOVE', cherish_always: 'ETERNAL_PROMISE' }
    },
    'ROMANTIC_PROMISE': {
      prompt: "Jin-Woo making a romantic promise to Cha Hae-In. Commitment, anime style.",
      narration: "Your words carry the weight of your entire heart.",
      chat: [
        { sender: 'player', text: "I promise to love you, protect you, and stand by you always." },
        { sender: 'Cha Hae-In', text: "And I promise the same to you. We're in this together, forever." }
      ],
      choices: [
        { text: "Seal it with a kiss", detail: "Physical confirmation", type: 'seal_kiss' },
        { text: "Plan your future together", detail: "Look ahead", type: 'plan_together' }
      ],
      leadsTo: { seal_kiss: 'PROMISE_KISS', plan_together: 'FUTURE_TOGETHER' }
    },
    'INTIMATE_CLOSENESS': {
      prompt: "Jin-Woo and Cha Hae-In sharing intimate closeness. Emotional intimacy, anime style.",
      narration: "Physical and emotional barriers dissolve between you.",
      chat: [
        { sender: 'Cha Hae-In', text: "Being this close to you feels like coming home." },
        { sender: 'player', text: "You are my home, Hae-In." }
      ],
      choices: [
        { text: "Stay like this forever", detail: "Wish for permanence", type: 'stay_forever' },
        { text: "Tell her you love her", detail: "Verbal confirmation", type: 'say_love' }
      ],
      leadsTo: { stay_forever: 'ETERNAL_MOMENT', say_love: 'LOVE_WORDS' }
    },
    'SOUL_CONNECTION': {
      prompt: "A deep soul connection forming. Spiritual bond, anime style.",
      narration: "Something fundamental shifts between you, deeper than words.",
      chat: [
        { sender: 'Cha Hae-In', text: "It's like our souls recognize each other." },
        { sender: 'player', text: "Maybe they've been searching for each other all along." }
      ],
      choices: [
        { text: "Embrace the connection", detail: "Accept the bond", type: 'embrace_connection' },
        { text: "Promise never to let go", detail: "Commitment", type: 'never_let_go' }
      ],
      leadsTo: { embrace_connection: 'EMBRACED_SOULS', never_let_go: 'ETERNAL_HOLD' }
    },
    'DEEP_APPRECIATION': {
      prompt: "Jin-Woo expressing deep appreciation for Cha Hae-In. Heartfelt gratitude, anime style.",
      narration: "Your appreciation goes beyond words.",
      chat: [
        { sender: 'player', text: "You've changed my life in ways I never imagined possible." },
        { sender: 'Cha Hae-In', text: "You've done the same for me. I'm a better person because of you." }
      ],
      choices: [
        { text: "We make each other better", detail: "Mutual growth", type: 'mutual_better' },
        { text: "Thank you for being you", detail: "Pure appreciation", type: 'thank_you' }
      ],
      leadsTo: { mutual_better: 'MUTUAL_IMPROVEMENT', thank_you: 'GRATITUDE_MOMENT' }
    },
    'TENDER_CARE': {
      prompt: "Jin-Woo showing tender care for Cha Hae-In. Gentle affection, anime style.",
      narration: "Your gentleness touches her heart.",
      chat: [
        { sender: 'Cha Hae-In', text: "You're so gentle with me. It makes me feel precious." },
        { sender: 'player', text: "Because you are precious. The most precious thing in my world." }
      ],
      choices: [
        { text: "Promise to always be gentle", detail: "Tender vow", type: 'gentle_promise' },
        { text: "Show her how much she means to you", detail: "Demonstration", type: 'show_meaning' }
      ],
      leadsTo: { gentle_promise: 'GENTLE_VOW', show_meaning: 'MEANINGFUL_GESTURE' }
    },
    'PARTNERSHIP_VOW': {
      prompt: "Making a partnership vow. Professional and personal commitment, anime style.",
      narration: "Your vow encompasses both mission and heart.",
      chat: [
        { sender: 'player', text: "I vow to stand by you in battle and in life." },
        { sender: 'Cha Hae-In', text: "And I vow the same. Partners in everything." }
      ],
      choices: [
        { text: "Seal the vow", detail: "Make it official", type: 'seal_vow' },
        { text: "Begin your partnership", detail: "Start immediately", type: 'begin_partnership' }
      ],
      leadsTo: { seal_vow: 'SEALED_VOW', begin_partnership: 'PARTNERSHIP_BEGINS' }
    },
    'OFFICIAL_TEAM': {
      prompt: "Officially becoming a team. Professional partnership, anime style.",
      narration: "Your partnership is now official and recognized.",
      chat: [
        { sender: 'Cha Hae-In', text: "The Shadow Monarch and the Sword Saint, official partners." },
        { sender: 'player', text: "The perfect combination of power and grace." }
      ],
      choices: [
        { text: "Take on our first mission", detail: "Begin working together", type: 'first_mission' },
        { text: "Celebrate our partnership", detail: "Mark the occasion", type: 'celebrate_partnership' }
      ],
      leadsTo: { first_mission: 'FIRST_TEAM_MISSION', celebrate_partnership: 'PARTNERSHIP_CELEBRATION' }
    }
  };

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      if (timeRef.current) {
        const now = new Date();
        timeRef.current.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: false
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [chatMessages]);

  // Update fade effects every 5 seconds for immersion
  useEffect(() => {
    const interval = setInterval(() => {
      setChatMessages(prev => [...prev]); // Force re-render to update fade effects
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle scrollbar fade effects and message visibility
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      chatContainer.classList.add('scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        chatContainer.classList.remove('scrolling');
      }, 1500); // Hide after 1.5 seconds of no scrolling

      // Check message visibility during scroll
      const messageElements = chatContainer.querySelectorAll('[data-message-id]');
      const containerRect = chatContainer.getBoundingClientRect();
      const newVisibility: Record<number, boolean> = {};

      messageElements.forEach((element) => {
        const messageId = parseInt(element.getAttribute('data-message-id') || '0');
        const messageRect = element.getBoundingClientRect();
        
        // Check if message is in viewport
        const isInViewport = messageRect.bottom >= containerRect.top && 
                            messageRect.top <= containerRect.bottom;
        
        if (isInViewport) {
          newVisibility[messageId] = true;
        }
      });

      setScrollBasedVisibility(prev => ({ ...prev, ...newVisibility }));
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => {
      chatContainer.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [chatMessages]);

  // Smooth scroll to bottom for better UX
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const element = chatContainerRef.current;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const generateSceneImage = async (prompt: string) => {
    // Use themed backgrounds instead of API generation for now
    const themeBackgrounds = [
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)',
      'linear-gradient(135deg, #2d1b69 0%, #11998e 50%, #0f0f0f 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #0f0f0f 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #0f0f0f 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #0f0f0f 100%)'
    ];
    
    const randomBackground = themeBackgrounds[Math.floor(Math.random() * themeBackgrounds.length)];
    setCurrentBackground(randomBackground);
  };

  const addChatMessage = (sender: string, text: string) => {
    const newMessage = {
      sender,
      text,
      id: Date.now() + Math.random(),
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
    scrollToBottom();
  };

  // State for tracking scroll-based message visibility
  const [scrollBasedVisibility, setScrollBasedVisibility] = useState<Record<number, boolean>>({});

  // Calculate message opacity for fade effect with scroll visibility
  const getMessageOpacity = (timestamp: number | undefined, messageId: number) => {
    if (!timestamp) return 1; // Show full opacity for messages without timestamp
    
    // Check if message is currently visible due to scrolling
    if (scrollBasedVisibility[messageId]) return 1;
    
    const age = Date.now() - timestamp;
    const fadeStart = 15000; // Start fading after 15 seconds
    const fadeComplete = 30000; // Completely faded after 30 seconds
    
    if (age < fadeStart) return 1;
    if (age > fadeComplete) return 0.1;
    
    const fadeProgress = (age - fadeStart) / (fadeComplete - fadeStart);
    return Math.max(0.1, 1 - (fadeProgress * 0.9));
  };

  // Get all messages for display (not just recent)
  const getDisplayMessages = () => {
    return chatMessages;
  };

  // Navigation functions for choice carousel
  const nextChoice = () => {
    if (currentStory?.choices) {
      setCurrentChoiceIndex((prev) => 
        prev < currentStory.choices.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevChoice = () => {
    if (currentStory?.choices) {
      setCurrentChoiceIndex((prev) => 
        prev > 0 ? prev - 1 : currentStory.choices.length - 1
      );
    }
  };

  // Reset choice index when story changes
  useEffect(() => {
    setCurrentChoiceIndex(0);
  }, [gameState.currentScene]);

  const createShadowSlashEffect = () => {
    const effectsContainer = document.querySelector('#effects-container');
    if (!effectsContainer) return;

    const slash = document.createElement('div');
    slash.className = 'shadow-slash';
    slash.style.left = Math.random() * 80 + 10 + '%';
    slash.style.top = Math.random() * 60 + 20 + '%';
    effectsContainer.appendChild(slash);

    setTimeout(() => {
      if (slash.parentNode) {
        slash.parentNode.removeChild(slash);
      }
    }, 300);
  };

  const createHeartEffect = () => {
    const hearts = document.querySelectorAll('.heart');
    const targetHeart = hearts[gameState.affection] as HTMLElement;
    if (targetHeart) {
      targetHeart.classList.add('filled');
      // Heart beat animation
      targetHeart.style.animation = 'heartBeat 0.5s ease';
      setTimeout(() => {
        targetHeart.style.animation = '';
      }, 500);
    }
  };

  const addScreenShake = () => {
    const screen = document.querySelector('.screen') as HTMLElement;
    if (screen) {
      screen.classList.add('shake');
      setTimeout(() => {
        screen.classList.remove('shake');
      }, 400);
    }
  };

  const handleChoice = (choice: any) => {
    const currentStory = story[gameState.currentScene];
    if (currentStory?.leadsTo?.[choice.type]) {
      const nextScene = currentStory.leadsTo[choice.type];
      const nextStory = story[nextScene];
      
      if (nextStory) {
        setGameState(prev => ({ ...prev, currentScene: nextScene }));
        addChatMessage('player', choice.text);
        
        // Add story messages
        nextStory.chat.forEach(msg => {
          addChatMessage(msg.sender, msg.text);
        });
        
        generateSceneImage(nextStory.prompt);

        // Special effects for certain actions
        if (choice.type === 'summon' || choice.type === 'shadow_attack' || choice.type === 'extract_shadow') {
          createShadowSlashEffect();
          addScreenShake();
        }

        if (choice.type === 'confess' || choice.type === 'kiss') {
          // Create romantic particle effects
          setTimeout(() => {
            const container = document.querySelector('#scene-container');
            if (container) {
              for (let i = 0; i < 10; i++) {
                const particle = document.createElement('div');
                particle.style.cssText = `
                  position: absolute;
                  width: 4px;
                  height: 4px;
                  background: #ff69b4;
                  border-radius: 50%;
                  left: ${Math.random() * 100}%;
                  top: ${Math.random() * 100}%;
                  animation: float-up 2s ease-out forwards;
                  pointer-events: none;
                  box-shadow: 0 0 6px #ff69b4;
                `;
                container.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
              }
            }
          }, 500);
        }
      }
    }

    // Handle affection changes with visual feedback
    const affectionGain = getAffectionGain(choice.type);
    if (affectionGain > 0) {
      setGameState(prev => {
        const newAffection = Math.min(5, prev.affection + affectionGain);
        setTimeout(() => createHeartEffect(), 300);
        return { ...prev, affection: newAffection };
      });
    }
  };

  const getAffectionGain = (choiceType: string): number => {
    const affectionMap: Record<string, number> = {
      'ask_about_her': 1,
      'be_humble': 1,
      'team_up': 1,
      'trust': 1,
      'confess': 2,
      'kiss': 1,
      'compliment': 1,
      'focus_hae_in': 1,
      'take_hand': 1
    };
    return affectionMap[choiceType] || 0;
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    const message = userInput;
    setUserInput('');
    
    // Add user message immediately and scroll to show it
    addChatMessage('player', message);
    setTimeout(() => scrollToBottom(), 100);
    
    if (inputMode === 'speak') {
      // Use Gemini for dynamic conversation with Cha Hae-In
      try {
        setIsLoading(true);
        const response = await fetch('/api/chat-with-hae-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            gameState,
            conversationHistory: chatMessages.slice(-5) // Last 5 messages for context
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Add AI response and ensure it's visible
        addChatMessage('Cha Hae-In', data.response);
        
        // Scroll to show the new AI response
        setTimeout(() => scrollToBottom(), 200);
        
        // Clear any temporary visibility states for older messages
        setTimeout(() => {
          setScrollBasedVisibility({});
        }, 1000);
        
        // Dynamic affection tracking based on conversation depth
        const affectionKeywords = [
          'blush', 'smile', 'happy', 'glad', 'warm', 'comfort', 'drawn', 
          'heart', 'feel', 'love', 'care', 'special', 'close', 'trust'
        ];
        
        const responseText = data.response.toLowerCase();
        const hasAffectionTrigger = affectionKeywords.some(keyword => 
          responseText.includes(keyword)
        );
        
        if (hasAffectionTrigger && gameState.affection < 5) {
          setGameState(prev => ({ 
            ...prev, 
            affection: Math.min(5, prev.affection + 1) 
          }));
          setTimeout(() => createHeartEffect(), 500);
        }
      } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('system', "Cha Hae-In seems distracted and doesn't respond...");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Action mode - general gameplay response
      setTimeout(() => {
        addChatMessage('system', "Your action resonates through the world...");
        
        // Random shadow effects for actions
        if (Math.random() > 0.7) {
          createShadowSlashEffect();
        }
      }, 1000);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    const startStory = story[gameState.currentScene];
    startStory.chat.forEach(msg => {
      addChatMessage(msg.sender, msg.text);
    });
    generateSceneImage(startStory.prompt);
  };

  const renderAffectionHearts = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span 
        key={i} 
        className={`heart ${i < gameState.affection ? 'filled' : ''}`}
      >
        ❤️
      </span>
    ));
  };

  const currentStory = story[gameState.currentScene];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Fullscreen background */}
      <div 
        className="fixed inset-0 bg-cover bg-center transition-all duration-700 transform scale-110"
        style={{ 
          backgroundImage: currentBackground,
          filter: 'blur(15px) brightness(0.4)'
        }}
      />
      
      {/* iOS Device Frame */}
      <div className="relative w-[390px] h-[844px] bg-gray-800 bg-opacity-20 rounded-[40px] p-3 shadow-2xl border border-white border-opacity-10">
        <div className="w-full h-full bg-black rounded-[32px] overflow-hidden relative flex flex-col max-h-full">
          
          {/* Start Overlay */}
          {!gameStarted && (
            <div 
              className="absolute inset-0 z-50 flex flex-col justify-end transition-opacity duration-1000"
              style={{
                backgroundImage: "url('https://picsum.photos/400/600?random=1')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/80 to-transparent" />
              <div className="relative z-10 p-6 text-center text-white">
                <h1 className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                  Solo Leveling
                </h1>
                <p className="text-white/70 mb-6">Shadow & Heart</p>
                <button 
                  onClick={startGame}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Enter the Gate
                </button>
              </div>
            </div>
          )}

          {/* Game Content */}
          {gameStarted && (
            <>
              {/* Status Bar */}
              <div className="h-11 flex items-center justify-between px-5 text-white text-sm font-semibold bg-black/30 backdrop-blur-md flex-shrink-0">
                <span ref={timeRef}>9:41</span>
                <div className="flex gap-2">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Full Screen Game Container with Overlaid UI */}
              <div className="flex-1 relative overflow-hidden">
                {/* Background Image - Full Screen */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 filter brightness-110 contrast-110"
                  style={{ 
                    backgroundImage: currentBackground,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center'
                  }}
                />
                
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
                
                {/* Effects Layer */}
                <div id="effects-container" className="absolute inset-0 z-20 pointer-events-none" />
                
                {/* Loading Overlay */}
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                    <div className="spinner" />
                  </div>
                )}

                {/* Minimal Stats Overlay */}
                <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-start">
                  {/* Compact Stats */}
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-white/10">
                    <div className="flex items-center gap-3">
                      {/* Health */}
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px]">❤️</div>
                        <div className="w-12 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500 transition-all duration-500"
                            style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Mana */}
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">💎</div>
                        <div className="w-12 h-1 bg-black/50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (gameState.mana / 100) * 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      {/* Level */}
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center text-[10px]">⭐</div>
                        <span className="text-white text-xs">{gameState.level}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compact Affection */}
                  <div className="bg-black/40 backdrop-blur-md rounded-xl p-2 border border-pink-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-pink-400 text-xs">💕</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              i < gameState.affection ? 'bg-pink-500' : 'bg-white/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat and Story Overlay - Lower Half */}
                <div className="absolute bottom-20 left-0 right-0 z-30 flex flex-col" style={{ height: '50%' }}>
                  {/* Chat Container - Takes available space */}
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div ref={chatContainerRef} className="h-full p-3 overflow-y-auto chat-container">
                      {/* Story Narration */}
                      {currentStory && (
                        <div className="mb-3 p-3 rounded-xl bg-black/80 border border-purple-500/40 backdrop-blur-md">
                          <div className="flex items-center gap-2 mb-2 text-xs opacity-90 font-semibold">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs">
                              🎭
                            </div>
                            <span className="text-white">Game Master</span>
                          </div>
                          <div className="text-gray-100 text-sm leading-relaxed">{currentStory.narration}</div>
                        </div>
                      )}

                      {/* Chat Messages - iMessage style layout */}
                      {getDisplayMessages().map((msg: any) => {
                        const opacity = getMessageOpacity(msg.timestamp, msg.id);
                        const isPlayer = msg.sender === 'player';
                        const isHaeIn = msg.sender === 'Cha Hae-In';
                        
                        return (
                          <div 
                            key={msg.id}
                            data-message-id={msg.id}
                            className={`mb-4 flex items-end gap-2 transition-opacity duration-1000 ${
                              isPlayer ? 'flex-row-reverse' : 'flex-row'
                            }`}
                            style={{ opacity }}
                          >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                              isPlayer 
                                ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                                : isHaeIn
                                ? 'bg-gradient-to-r from-pink-600 to-pink-700'
                                : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                            }`}>
                              {isPlayer ? '👤' : isHaeIn ? '👩' : '⚡'}
                            </div>
                            
                            {/* Message bubble */}
                            <div className={`max-w-[75%] p-3 rounded-2xl backdrop-blur-md ${
                              isPlayer 
                                ? 'bg-purple-900/80 border border-purple-400/60 rounded-br-md' 
                                : isHaeIn
                                ? 'bg-pink-900/80 border border-pink-400/60 rounded-bl-md'
                                : 'bg-gray-800/80 border border-purple-400/40 rounded-bl-md'
                            }`}>
                              {/* Sender name only for non-player messages */}
                              {!isPlayer && (
                                <div className="text-xs font-semibold mb-1 opacity-90">
                                  <span className="text-white">{msg.sender}</span>
                                </div>
                              )}
                              <div className="text-gray-100 text-sm leading-relaxed">{msg.text}</div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Chat History Access Hint */}
                      {chatMessages.length > 3 && (
                        <div className="text-center py-2">
                          <div className="text-xs text-white/40">Scroll up to see chat history</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Choices Section - Apple-style Carousel */}
                  {currentStory?.choices && currentStory.choices.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-xl border-t border-white/20 p-4" style={{ height: '160px' }}>
                      <div className="text-sm text-white font-medium mb-4 flex items-center justify-between">
                        <span>Choose your action</span>
                        <div className="bg-black/20 px-3 py-1 rounded-full text-xs font-mono text-white/80">
                          {currentChoiceIndex + 1} of {currentStory.choices.length}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4" style={{ height: '96px' }}>
                        {/* Previous Button */}
                        {currentStory.choices.length > 1 && (
                          <button
                            onClick={prevChoice}
                            className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 active:bg-white/20 transition-all duration-200 flex-shrink-0 text-lg shadow-lg border border-white/10"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}

                        {/* Current Choice Display */}
                        <div className="flex-1 h-full">
                          <button
                            onClick={() => handleChoice(currentStory.choices[currentChoiceIndex])}
                            className="w-full h-full bg-white/10 backdrop-blur-xl rounded-2xl p-4 hover:bg-white/15 active:bg-white/8 transition-all duration-200 text-left border border-white/20 shadow-xl group"
                          >
                            <div className="flex items-center gap-4 h-full">
                              <div className="w-11 h-11 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-lg border border-white/20">
                                ⚔️
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="text-white text-base font-semibold mb-1 leading-tight">
                                  {currentStory.choices[currentChoiceIndex].text}
                                </div>
                                {currentStory.choices[currentChoiceIndex].detail && (
                                  <div className="text-white/80 text-sm leading-relaxed font-light">
                                    {currentStory.choices[currentChoiceIndex].detail}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* Next Button */}
                        {currentStory.choices.length > 1 && (
                          <button
                            onClick={nextChoice}
                            className="w-10 h-10 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/25 active:bg-white/20 transition-all duration-200 flex-shrink-0 text-lg shadow-lg border border-white/10"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bar - Overlaid */}
                <div className="absolute bottom-0 left-0 right-0 z-40 p-3 bg-black/90 backdrop-blur-md border-t border-purple-500/40 flex items-center gap-3">
                  <button 
                    onClick={() => setShowInventory(true)}
                    className="w-11 h-11 bg-purple-500/15 rounded-full flex items-center justify-center text-white hover:bg-purple-500/30 transition-all"
                  >
                    🎒
                  </button>
                  <button 
                    onClick={() => setShowChatTutorial(true)}
                    className="w-11 h-11 bg-blue-500/15 rounded-full flex items-center justify-center text-white hover:bg-blue-500/30 transition-all"
                    title="Chat Help"
                  >
                    💡
                  </button>
                  <div className="flex-1 bg-black/20 border border-purple-500/20 rounded-full h-11 flex items-center px-1">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                      placeholder={inputMode === 'speak' ? "Talk to Cha Hae-In..." : "What do you do?"}
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none text-white text-sm outline-none px-4 disabled:opacity-50"
                    />
                    {isLoading && inputMode === 'speak' && (
                      <div className="px-2">
                        <div className="w-4 h-4 border-2 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
                      </div>
                    )}
                    <button
                      onClick={() => setInputMode(inputMode === 'speak' ? 'action' : 'speak')}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        inputMode === 'speak' 
                          ? 'bg-pink-600 shadow-lg shadow-pink-500/25' 
                          : 'bg-purple-600 shadow-lg shadow-purple-500/25'
                      }`}
                      title={inputMode === 'speak' ? 'Switch to Action Mode' : 'Switch to Chat Mode'}
                    >
                      {inputMode === 'speak' ? '💬' : '⚔️'}
                    </button>
                  </div>
                  <button 
                    onClick={handleUserInput}
                    disabled={!userInput.trim() || isLoading}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all text-white ${
                      userInput.trim() && !isLoading
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg'
                        : 'bg-gray-600/30 cursor-not-allowed opacity-50'
                    }`}
                    title="Send Message"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="m22 2-7 20-4-9-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="m22 2-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Inventory Modal */}
      {showInventory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-80 max-w-[90%] border border-purple-500/30">
            <div className="text-lg font-semibold mb-5 text-white">🎒 Inventory</div>
            <div className="grid grid-cols-4 gap-3">
              {/* Empty inventory slots */}
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Empty</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setShowInventory(false)}
              className="w-full mt-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Tutorial Modal */}
      {showChatTutorial && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl w-96 max-w-[90%] border border-blue-500/30">
            <div className="text-lg font-semibold mb-5 text-white">💡 Enhanced Chat System</div>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <h3 className="text-blue-400 font-semibold mb-2">🔮 AI-Powered Conversations</h3>
                <p>Your Gemini API key enables dynamic conversations with Cha Hae-In. She responds intelligently based on your affection level and story context.</p>
              </div>
              
              <div className="bg-pink-500/10 p-4 rounded-lg border border-pink-500/20">
                <h3 className="text-pink-400 font-semibold mb-2">💬 Chat Mode</h3>
                <p>Click the pink chat button to enter conversation mode. Ask Cha Hae-In anything - about missions, her feelings, or just casual talk.</p>
              </div>
              
              <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-400 font-semibold mb-2">⚔️ Action Mode</h3>
                <p>Use the purple action button for gameplay actions like using shadow skills or exploring the environment.</p>
              </div>
              
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                <h3 className="text-red-400 font-semibold mb-2">❤️ Affection System</h3>
                <p>Positive conversations increase Cha Hae-In's affection. Her responses become warmer as your relationship develops.</p>
              </div>
            </div>
            
            <button 
              onClick={() => setShowChatTutorial(false)}
              className="w-full mt-6 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}