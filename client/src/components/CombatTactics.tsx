import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Zap, Target, Users, Eye } from 'lucide-react';

interface TacticAction {
  id: string;
  name: string;
  description: string;
  tacticalDescription: string;
  chaHaeInResponse: string;
  energyCost: number;
  cooldown: number;
  effects: {
    damage?: number;
    buff?: string;
    debuff?: string;
    healing?: number;
    shadowBoost?: number;
  };
  requirements?: {
    minLevel?: number;
    shadowCount?: number;
  };
}

interface CombatTacticsProps {
  isVisible: boolean;
  onTacticSelect: (tactic: TacticAction) => void;
  playerLevel: number;
  shadowCount: number;
  playerEnergy: number;
  inPartnership: boolean;
}

const TACTICAL_ACTIONS: TacticAction[] = [
  {
    id: 'shadow_overwhelm',
    name: 'Shadow Army Overwhelm',
    description: 'Deploy all shadows in coordinated assault',
    tacticalDescription: 'Jin-Woo commands his shadow army to execute a devastating pincer movement, with Igris leading the charge while archer shadows provide covering fire from elevated positions.',
    chaHaeInResponse: 'Cha Hae-In sees the tactical brilliance and moves to cut off enemy escape routes, her sword work creating a deadly perimeter.',
    energyCost: 30,
    cooldown: 3,
    effects: { damage: 120, shadowBoost: 50 }
  },
  {
    id: 'synchronized_strike',
    name: 'Synchronized Strike',
    description: 'Perfect coordination with Cha Hae-In',
    tacticalDescription: 'Jin-Woo and Cha Hae-In move in perfect synchronization, their attacks flowing like a deadly dance. Jin-Woo creates openings while Cha Hae-In exploits them with surgical precision.',
    chaHaeInResponse: 'Our timing is perfect! I can read your movements like they\'re my own. Let\'s show them what true partnership looks like!',
    energyCost: 25,
    cooldown: 2,
    effects: { damage: 100, buff: 'perfect_sync' },
    requirements: { minLevel: 15 }
  },
  {
    id: 'shadow_fortress',
    name: 'Shadow Fortress Defense',
    description: 'Create impenetrable shadow barrier',
    tacticalDescription: 'Jin-Woo\'s knight-class shadows form an unbreakable shield wall while mage shadows weave protective barriers. The formation creates a fortress of living darkness.',
    chaHaeInResponse: 'Amazing defensive positioning! I\'ll use this protection to charge up my most powerful techniques.',
    energyCost: 20,
    cooldown: 4,
    effects: { buff: 'fortress_defense', healing: 50 }
  },
  {
    id: 'hunters_gambit',
    name: 'Hunter\'s Gambit',
    description: 'Risk everything for massive damage',
    tacticalDescription: 'Jin-Woo deliberately exposes himself to bait enemies into a trap while Cha Hae-In prepares her ultimate sword technique from the shadows.',
    chaHaeInResponse: 'I trust you completely, Jin-Woo. I\'ll make sure this gambit pays off with everything I have!',
    energyCost: 35,
    cooldown: 5,
    effects: { damage: 200, debuff: 'vulnerability' },
    requirements: { minLevel: 20 }
  },
  {
    id: 'shadow_extraction_setup',
    name: 'Shadow Extraction Setup',
    description: 'Weaken enemies for extraction',
    tacticalDescription: 'Jin-Woo systematically weakens enemies to optimal extraction threshold while his shadows hold them in place. Each strike is calculated to preserve the shadow\'s essence.',
    chaHaeInResponse: 'I\'ll support your extraction technique by keeping other enemies at bay. Your shadow army is incredible to watch in action.',
    energyCost: 15,
    cooldown: 1,
    effects: { debuff: 'extraction_ready', shadowBoost: 25 }
  },
  {
    id: 'monarchs_authority',
    name: 'Monarch\'s Authority',
    description: 'Unleash true power as Shadow Monarch',
    tacticalDescription: 'Jin-Woo\'s eyes blaze with purple fire as he unleashes his full authority as the Shadow Monarch. Reality itself bends to his will as shadows rise from every corner.',
    chaHaeInResponse: 'The power radiating from you... it\'s like standing next to a force of nature. I\'ve never seen anything so magnificent and terrifying.',
    energyCost: 50,
    cooldown: 8,
    effects: { damage: 300, buff: 'monarch_mode', shadowBoost: 100 },
    requirements: { minLevel: 30, shadowCount: 10 }
  }
];

export function CombatTactics({ isVisible, onTacticSelect, playerLevel, shadowCount, playerEnergy, inPartnership }: CombatTacticsProps) {
  const [selectedTactic, setSelectedTactic] = useState<TacticAction | null>(null);

  if (!isVisible) return null;

  const canUseTactic = (tactic: TacticAction): boolean => {
    if (playerEnergy < tactic.energyCost) return false;
    if (tactic.requirements?.minLevel && playerLevel < tactic.requirements.minLevel) return false;
    if (tactic.requirements?.shadowCount && shadowCount < tactic.requirements.shadowCount) return false;
    return true;
  };

  const getRequirementText = (tactic: TacticAction): string => {
    const reqs = [];
    if (tactic.requirements?.minLevel) reqs.push(`Level ${tactic.requirements.minLevel}+`);
    if (tactic.requirements?.shadowCount) reqs.push(`${tactic.requirements.shadowCount} Shadows`);
    return reqs.join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-purple-500 rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-hidden mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Target className="text-purple-400" />
            Combat Tactics
            {inPartnership && <Badge variant="outline" className="text-green-400 border-green-400">Partnership Mode</Badge>}
          </h2>
          <div className="text-yellow-400 font-semibold">
            Energy: {playerEnergy}/100
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh]">
          {/* Tactics List */}
          <div className="space-y-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Available Tactics</h3>
            {TACTICAL_ACTIONS.map((tactic) => (
              <Card 
                key={tactic.id}
                className={`bg-gray-800 border-gray-700 cursor-pointer transition-all ${
                  selectedTactic?.id === tactic.id ? 'ring-2 ring-purple-500' : ''
                } ${!canUseTactic(tactic) ? 'opacity-50' : 'hover:bg-gray-750'}`}
                onClick={() => setSelectedTactic(tactic)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sword className="w-4 h-4 text-red-400" />
                      {tactic.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-400">
                        {tactic.energyCost} Energy
                      </Badge>
                      {tactic.cooldown > 0 && (
                        <Badge variant="outline" className="text-yellow-400">
                          {tactic.cooldown}T CD
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm mb-2">{tactic.description}</p>
                  
                  {tactic.requirements && (
                    <div className="text-orange-400 text-xs mb-2">
                      Requirements: {getRequirementText(tactic)}
                    </div>
                  )}

                  {/* Effects */}
                  <div className="flex flex-wrap gap-2">
                    {tactic.effects.damage && (
                      <Badge variant="outline" className="text-red-400">
                        {tactic.effects.damage} DMG
                      </Badge>
                    )}
                    {tactic.effects.healing && (
                      <Badge variant="outline" className="text-green-400">
                        +{tactic.effects.healing} HP
                      </Badge>
                    )}
                    {tactic.effects.shadowBoost && (
                      <Badge variant="outline" className="text-purple-400">
                        +{tactic.effects.shadowBoost}% Shadow
                      </Badge>
                    )}
                    {tactic.effects.buff && (
                      <Badge variant="outline" className="text-yellow-400">
                        {tactic.effects.buff.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tactic Details */}
          <div className="space-y-4">
            {selectedTactic ? (
              <>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-purple-300 flex items-center gap-2">
                      <Eye className="text-purple-400" />
                      Tactical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {selectedTactic.tacticalDescription}
                    </p>
                  </CardContent>
                </Card>

                {inPartnership && (
                  <Card className="bg-gray-800 border-pink-700">
                    <CardHeader>
                      <CardTitle className="text-pink-300 flex items-center gap-2">
                        <Users className="text-pink-400" />
                        Cha Hae-In's Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-pink-200 leading-relaxed italic">
                        "{selectedTactic.chaHaeInResponse}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={() => onTacticSelect(selectedTactic)}
                    disabled={!canUseTactic(selectedTactic)}
                    className="flex-1"
                    variant={canUseTactic(selectedTactic) ? 'default' : 'outline'}
                  >
                    {canUseTactic(selectedTactic) ? 'Execute Tactic' : 'Cannot Use'}
                  </Button>
                </div>
              </>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <p className="text-gray-400">Select a tactic to see detailed analysis</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}