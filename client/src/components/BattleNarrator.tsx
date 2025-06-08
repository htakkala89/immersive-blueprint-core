import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface BattleEvent {
  id: string;
  type: 'shadow_summon' | 'shadow_attack' | 'monster_attack' | 'player_action' | 'special_ability' | 'extraction' | 'victory' | 'defeat';
  actor: string;
  target?: string;
  damage?: number;
  description: string;
  timestamp: number;
}

interface BattleNarratorProps {
  isVisible: boolean;
  events: BattleEvent[];
  onEventAdd: (event: BattleEvent) => void;
}

const SHADOW_ACTIONS = {
  knight: [
    "charges forward with shield raised, delivering a devastating bash",
    "slams his massive sword into the ground, creating shockwaves",
    "forms a protective barrier around allies with his shield",
    "executes a perfect counter-attack with precise timing"
  ],
  archer: [
    "draws her ethereal bow, arrows manifesting from pure shadow energy",
    "fires a volley of shadow arrows that pierce through multiple enemies",
    "leaps to higher ground for a perfect vantage point",
    "channels dark energy into explosive arrow tips"
  ],
  mage: [
    "weaves intricate shadow magic, dark energy crackling between his fingers",
    "summons a barrage of shadow projectiles that home in on enemies",
    "creates a void portal that drains enemy life force",
    "casts protective wards that shimmer with purple energy"
  ],
  assassin: [
    "vanishes into the shadows, becoming one with the darkness",
    "strikes from behind with twin daggers wreathed in shadow",
    "moves like liquid darkness, untouchable and deadly",
    "appears behind the enemy in a flash of purple smoke"
  ],
  beast: [
    "pounces with supernatural speed, claws extended",
    "lets out a bone-chilling howl that paralyzes enemies with fear",
    "tears through enemy ranks with primal fury",
    "bounds between enemies like a shadow-wreathed predator"
  ]
};

const MONSTER_DESCRIPTIONS = {
  orc: [
    "The massive orc chieftain bellows with rage, his crude axe gleaming with malice",
    "Tusks dripping with saliva, the orc charges with thunderous footsteps",
    "The beast's red eyes burn with primitive fury as it swings wildly",
    "Muscles bulging beneath scarred green skin, the orc prepares its devastating attack"
  ],
  goblin: [
    "A pack of goblins screeches as they swarm forward with rusted blades",
    "The goblin shaman raises his gnarled staff, dark magic swirling around it",
    "Sharp claws and yellowed fangs flash as the goblins attack in coordination",
    "The goblin leader's evil cackle echoes through the dungeon as it commands its minions"
  ],
  golem: [
    "The stone golem's eyes blaze with arcane fire as it raises its massive fists",
    "Ancient runes glow along the golem's body as it channels earth magic",
    "The ground trembles under the golem's weight as it advances relentlessly",
    "Chunks of rock fall from the golem's form as it prepares a crushing blow"
  ],
  dragon: [
    "The dragon's scales shimmer like molten metal as it rears back to breathe fire",
    "Wings spread wide, the ancient beast lets out a roar that shakes the very foundations",
    "Claws like sword blades rake through the air as the dragon swoops down",
    "The dragon's serpentine neck coils as it prepares to unleash devastating magic"
  ]
};

export function BattleNarrator({ isVisible, events, onEventAdd }: BattleNarratorProps) {
  const [currentEvents, setCurrentEvents] = useState<BattleEvent[]>([]);

  useEffect(() => {
    setCurrentEvents(events);
  }, [events]);

  const generateShadowSummonNarration = (shadowType: string, shadowName: string): string => {
    const baseDescriptions = [
      `Dark purple energy swirls as ${shadowName} emerges from Jin-Woo's shadow`,
      `The ground beneath Jin-Woo ripples with darkness as ${shadowName} rises`,
      `Purple flames dance as ${shadowName} materializes with glowing eyes`,
      `Shadow tendrils coalesce into the form of ${shadowName}, ready for battle`
    ];
    
    const typeSpecific = {
      knight: `${shadowName} appears in full armor, sword and shield gleaming with shadow energy`,
      archer: `${shadowName} manifests with a spectral bow, quiver full of shadow arrows`,
      mage: `${shadowName} emerges with robes billowing, staff crackling with dark magic`,
      assassin: `${shadowName} steps from the shadows, twin daggers wreathed in purple mist`,
      beast: `${shadowName} materializes with a predatory growl, eyes burning like violet flames`
    };

    return typeSpecific[shadowType as keyof typeof typeSpecific] || baseDescriptions[Math.floor(Math.random() * baseDescriptions.length)];
  };

  const generateShadowActionNarration = (shadowType: string, shadowName: string, action: string): string => {
    const actions = SHADOW_ACTIONS[shadowType as keyof typeof SHADOW_ACTIONS] || SHADOW_ACTIONS.knight;
    const selectedAction = actions[Math.floor(Math.random() * actions.length)];
    return `${shadowName} ${selectedAction}`;
  };

  const generateMonsterActionNarration = (monsterType: string, monsterName: string): string => {
    const descriptions = MONSTER_DESCRIPTIONS[monsterType as keyof typeof MONSTER_DESCRIPTIONS] || MONSTER_DESCRIPTIONS.orc;
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  };

  const addBattleEvent = (type: BattleEvent['type'], actor: string, description: string, target?: string, damage?: number) => {
    const event: BattleEvent = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      actor,
      target,
      damage,
      description,
      timestamp: Date.now()
    };
    
    onEventAdd(event);
  };

  const formatEventText = (event: BattleEvent): string => {
    switch (event.type) {
      case 'shadow_summon':
        return `🌟 ${event.description}`;
      case 'shadow_attack':
        return `⚔️ ${event.description}${event.damage ? ` (${event.damage} damage)` : ''}`;
      case 'monster_attack':
        return `👹 ${event.description}${event.damage ? ` (${event.damage} damage)` : ''}`;
      case 'player_action':
        return `🗡️ ${event.description}`;
      case 'special_ability':
        return `✨ ${event.description}`;
      case 'extraction':
        return `🔮 ${event.description}`;
      case 'victory':
        return `🏆 ${event.description}`;
      case 'defeat':
        return `💀 ${event.description}`;
      default:
        return event.description;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-4 h-64">
      <h3 className="text-lg font-bold text-purple-300 mb-3 text-center">
        ⚔️ Battle Chronicle ⚔️
      </h3>
      
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {currentEvents.map((event) => (
            <div
              key={event.id}
              className="bg-black/50 border border-purple-600 rounded p-2 text-sm"
            >
              <p className="text-gray-200 leading-relaxed">
                {formatEventText(event)}
              </p>
              <div className="text-xs text-purple-400 mt-1">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          
          {currentEvents.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>The battle awaits...</p>
              <p className="text-xs mt-2">Combat events will appear here with detailed descriptions</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Export helper functions for generating battle narration
export const BattleNarrationHelpers = {
  generateShadowSummonNarration: (shadowType: string, shadowName: string): string => {
    const typeSpecific = {
      knight: `${shadowName} emerges from the shadows in gleaming dark armor, massive sword and shield materializing as purple energy swirls around his imposing form`,
      archer: `${shadowName} rises gracefully from Jin-Woo's shadow, her spectral bow already drawn with an arrow of pure darkness nocked and ready`,
      mage: `Dark robes billowing with otherworldly power, ${shadowName} steps forth with staff crackling with purple lightning, ancient knowledge burning in his ethereal eyes`,
      assassin: `Like smoke given form, ${shadowName} appears silently behind the enemies, twin daggers wreathed in shadow mist, movements fluid as liquid darkness`,
      beast: `${shadowName} bounds from the shadow realm with a bone-chilling howl, claws gleaming like obsidian blades, predatory instincts fully awakened`
    };
    
    return typeSpecific[shadowType as keyof typeof typeSpecific] || `${shadowName} materializes from the shadows, ready for battle`;
  },

  generateShadowActionNarration: (shadowType: string, shadowName: string, actionType: string): string => {
    const actions = {
      knight: {
        attack: `${shadowName} charges forward with thunderous footsteps, his massive blade cleaving through the air with devastating force`,
        defend: `${shadowName} raises his imposing shield, creating a barrier of dark energy that deflects incoming attacks`,
        special: `${shadowName} slams his sword into the ground, sending shockwaves of shadow energy rippling through the battlefield`
      },
      archer: {
        attack: `${shadowName} draws her ethereal bow, multiple shadow arrows manifesting simultaneously before loosing a deadly volley`,
        defend: `${shadowName} leaps backward with supernatural agility, creating distance while maintaining perfect aim`,
        special: `${shadowName} channels pure darkness into her arrow, firing a shot that pierces through multiple enemies`
      },
      mage: {
        attack: `${shadowName} weaves complex patterns in the air, unleashing a barrage of dark magic projectiles that home in on targets`,
        defend: `${shadowName} creates a swirling vortex of protective shadows that absorb and redirect enemy attacks`,
        special: `${shadowName} opens a rift to the shadow realm, tendrils of darkness reaching out to drain enemy life force`
      },
      assassin: {
        attack: `${shadowName} vanishes into shadows before reappearing behind the enemy, twin daggers finding vital points with surgical precision`,
        defend: `${shadowName} becomes one with the darkness, phasing through attacks like living shadow`,
        special: `${shadowName} creates shadow clones that confuse enemies while delivering coordinated strikes`
      },
      beast: {
        attack: `${shadowName} pounces with primal fury, claws and fangs tearing through enemy defenses with savage efficiency`,
        defend: `${shadowName} circles the battlefield with predatory grace, using speed to avoid incoming attacks`,
        special: `${shadowName} lets out a haunting howl that paralyzes enemies with supernatural fear`
      }
    };

    const shadowActions = actions[shadowType as keyof typeof actions] || actions.knight;
    return shadowActions[actionType as keyof typeof shadowActions] || `${shadowName} attacks with shadow-enhanced abilities`;
  },

  generateMonsterEncounterNarration: (monsterType: string, monsterName: string): string => {
    const encounters = {
      orc: `${monsterName} emerges with a deafening roar, massive frame towering over the battlefield. Scarred green skin glistens with sweat as the beast hefts its crude but deadly axe, tusks gleaming with malevolent intent.`,
      goblin: `A pack of goblins led by ${monsterName} screeches into view, their yellowed fangs and razor-sharp claws glinting in the dungeon's dim light. Their beady red eyes burn with cunning malice.`,
      golem: `${monsterName} awakens with the grinding of ancient stone, arcane runes blazing along its massive form. Each thunderous step shakes the very foundations as the construct prepares for battle.`,
      dragon: `${monsterName} unfurls massive wings that block out the light, scales shimmering like liquid metal. The ancient beast's serpentine neck coils as flames begin to gather in its throat.`,
      spider: `${monsterName} descends from the shadows on silken threads, its eight legs moving with unnatural coordination. Venom drips from massive fangs as multiple eyes focus on its prey.`,
      wraith: `${monsterName} materializes from the ethereal plane, its form shifting between solid and spectral. Icy tendrils of death energy spiral around the undead horror.`
    };

    return encounters[monsterType as keyof typeof encounters] || `${monsterName} appears, ready to do battle with terrifying presence.`;
  },

  generateCombatResultNarration: (attacker: string, target: string, damage: number, isCritical: boolean): string => {
    const criticalHits = [
      `delivers a devastating critical strike that sends shockwaves through the battlefield`,
      `finds a perfect opening, landing a blow that resonates with explosive force`,
      `channels all their power into a single, overwhelming attack`,
      `strikes with such precision that reality itself seems to bend around the impact`
    ];

    const normalHits = [
      `lands a solid hit that echoes through the dungeon`,
      `connects with a powerful blow that staggers the target`,
      `strikes true, dealing significant damage`,
      `attacks with practiced skill, finding their mark`
    ];

    const hitDescriptions = isCritical ? criticalHits : normalHits;
    const selectedDescription = hitDescriptions[Math.floor(Math.random() * hitDescriptions.length)];

    return `${attacker} ${selectedDescription} against ${target} for ${damage} damage${isCritical ? ' (CRITICAL!)' : ''}`;
  }
};