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
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; id: number }>>([]);
  const [userInput, setUserInput] = useState('');
  const [inputMode, setInputMode] = useState<'action' | 'speak'>('action');
  const [showInventory, setShowInventory] = useState(false);
  const [activeMiniGame, setActiveMiniGame] = useState<string | null>(null);
  const [showChatTutorial, setShowChatTutorial] = useState(false);

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

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const generateSceneImage = async (prompt: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-scene-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.imageUrl) {
        setCurrentBackground(`url(${data.imageUrl})`);
      } else {
        // Fallback to a themed background if generation fails
        const fallbackImages = [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1462332420958-a05d1e002413?w=400&h=300&fit=crop'
        ];
        const randomFallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        setCurrentBackground(`url(${randomFallback})`);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      // Use a default dark fantasy background
      setCurrentBackground('linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f0f 100%)');
    } finally {
      setIsLoading(false);
    }
  };

  const addChatMessage = (sender: string, text: string) => {
    const newMessage = {
      sender,
      text,
      id: Date.now() + Math.random()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

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
    addChatMessage('player', message);
    
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
        addChatMessage('Cha Hae-In', data.response);
        
        // Add affection based on positive conversation
        if (data.response.toLowerCase().includes('smile') || 
            data.response.toLowerCase().includes('happy') || 
            data.response.toLowerCase().includes('glad')) {
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
        <div className="w-full h-full bg-black rounded-[32px] overflow-hidden relative flex flex-col">
          
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
              <div className="absolute top-0 left-0 right-0 z-50 h-11 flex items-center justify-between px-5 text-white text-sm font-semibold bg-black/30 backdrop-blur-md">
                <span ref={timeRef}>9:41</span>
                <div className="flex gap-2">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Affection Meter */}
              <div className="absolute top-14 right-5 z-40 w-30 bg-black/50 p-2.5 rounded-lg border border-pink-500/30">
                <div className="text-xs text-pink-500 mb-1 text-center">Cha Hae-In</div>
                <div className="flex justify-center gap-1">
                  {renderAffectionHearts()}
                </div>
              </div>

              {/* Scene Container */}
              <div id="scene-container" className="relative w-full h-2/5 overflow-hidden bg-transparent">
                <div id="effects-container" className="absolute inset-0 z-20 pointer-events-none" />
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 transform scale-105"
                  style={{ backgroundImage: currentBackground }}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <div className="spinner" />
                  </div>
                )}
              </div>

              {/* Content Wrapper */}
              <div className="flex-1 flex flex-col bg-gray-900/75 backdrop-blur-sm">
                {/* Stats Display */}
                <div className="p-3 flex gap-4 text-sm font-bold items-center bg-black/30 border-b border-purple-500/30">
                  <div className="flex items-center gap-2 text-white">
                    <span className="text-lg">❤️</span>
                    <div className="w-20 h-2.5 bg-black/40 rounded-full border border-purple-500/30">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-blue-400">
                    <span className="text-lg">💎</span>
                    <span>{gameState.mana}</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <span className="text-lg">⭐</span>
                    <span>{gameState.level}</span>
                  </div>
                </div>

                {/* Chat Container */}
                <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`mb-5 p-4 rounded-2xl max-w-[95%] animate-in slide-in-from-bottom-5 duration-500 ${
                        msg.sender === 'player' 
                          ? 'bg-purple-900/60 border border-purple-500/40 ml-auto' 
                          : msg.sender === 'Cha Hae-In'
                          ? 'bg-pink-900/60 border border-pink-500/40'
                          : 'bg-gray-800/60 border border-purple-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-xs opacity-80 font-semibold">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          msg.sender === 'player' 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                            : msg.sender === 'Cha Hae-In'
                            ? 'bg-gradient-to-r from-pink-600 to-pink-700'
                            : 'bg-gradient-to-r from-yellow-600 to-yellow-700'
                        }`}>
                          {msg.sender === 'player' ? '👤' : msg.sender === 'Cha Hae-In' ? '👩' : '⚡'}
                        </div>
                        <span className="text-white">{msg.sender}</span>
                      </div>
                      <div className="text-gray-200 leading-relaxed">{msg.text}</div>
                    </div>
                  ))}

                  {/* Current Story Narration */}
                  {currentStory && (
                    <div className="mb-5 p-4 rounded-2xl bg-gray-800/60 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2 text-xs opacity-80 font-semibold">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-xs">
                          🎭
                        </div>
                        <span className="text-white">AI Game Master</span>
                      </div>
                      <div className="text-gray-200 leading-relaxed">{currentStory.narration}</div>
                    </div>
                  )}

                  {/* Choices */}
                  {currentStory?.choices && (
                    <div className="grid gap-3 mt-5">
                      {currentStory.choices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => handleChoice(choice)}
                          className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-4 flex items-center gap-3 hover:bg-purple-500/25 hover:border-purple-500/50 hover:-translate-y-0.5 transition-all duration-200 text-left"
                        >
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                            ⚔️
                          </div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-semibold">{choice.text}</div>
                            {choice.detail && (
                              <div className="text-white/70 text-xs mt-1">{choice.detail}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Bar */}
                <div className="p-3 bg-gray-900/80 backdrop-blur-md border-t border-purple-500/20 flex items-center gap-3">
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => setInputMode('action')}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          inputMode === 'action' ? 'bg-purple-600 shadow-lg shadow-purple-500/25' : 'bg-purple-500/10 hover:bg-purple-500/20'
                        }`}
                        title="Action Mode"
                      >
                        ⚔️
                      </button>
                      <button
                        onClick={() => setInputMode('speak')}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                          inputMode === 'speak' ? 'bg-pink-600 shadow-lg shadow-pink-500/25' : 'bg-pink-500/10 hover:bg-pink-500/20'
                        }`}
                        title="Chat with Cha Hae-In"
                      >
                        💬
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleUserInput}
                    className="w-11 h-11 bg-purple-500/15 rounded-full flex items-center justify-center text-white hover:bg-purple-500/30 transition-all"
                  >
                    ➤
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