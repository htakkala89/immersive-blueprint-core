import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Battery, 
  Zap, 
  Heart, 
  Coffee, 
  Bed, 
  Utensils, 
  Coins,
  Clock,
  Star,
  Gift
} from 'lucide-react';

interface EnergyReplenishmentModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentEnergy: number;
  maxEnergy: number;
  playerGold: number;
  onEnergyRestore: (amount: number, cost: number) => void;
}

interface EnergyOption {
  id: string;
  name: string;
  description: string;
  energyRestore: number;
  cost: number;
  icon: any;
  type: 'free' | 'premium' | 'special';
  cooldown?: number; // in minutes
  requirement?: string;
}

export default function EnergyReplenishmentModal({ 
  isVisible, 
  onClose, 
  currentEnergy, 
  maxEnergy, 
  playerGold, 
  onEnergyRestore 
}: EnergyReplenishmentModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<Record<string, number>>({});

  const energyOptions: EnergyOption[] = [
    {
      id: 'coffee',
      name: 'Coffee Break',
      description: 'A quick coffee to boost your energy',
      energyRestore: 20,
      cost: 0,
      icon: Coffee,
      type: 'free',
      cooldown: 30,
    },
    {
      id: 'meal',
      name: 'Hearty Meal',
      description: 'A nutritious meal to restore energy',
      energyRestore: 40,
      cost: 50,
      icon: Utensils,
      type: 'premium',
    },
    {
      id: 'short_rest',
      name: 'Short Rest',
      description: 'Take a quick nap to recover',
      energyRestore: 30,
      cost: 0,
      icon: Bed,
      type: 'free',
      cooldown: 60,
    },
    {
      id: 'energy_potion',
      name: 'Energy Potion',
      description: 'Magical potion that fully restores energy',
      energyRestore: maxEnergy - currentEnergy,
      cost: 100,
      icon: Zap,
      type: 'premium',
    },
    {
      id: 'meditation',
      name: 'Shadow Meditation',
      description: 'Channel your shadow powers to restore energy',
      energyRestore: 50,
      cost: 0,
      icon: Star,
      type: 'special',
      cooldown: 120,
      requirement: 'Shadow Monarch abilities unlocked',
    },
    {
      id: 'premium_rest',
      name: 'Luxury Suite Rest',
      description: 'Rest in a premium suite for maximum recovery',
      energyRestore: maxEnergy - currentEnergy,
      cost: 200,
      icon: Gift,
      type: 'premium',
    },
  ];

  const canUse = (option: EnergyOption) => {
    if (option.cost > playerGold) return false;
    if (currentEnergy >= maxEnergy) return false;
    
    if (option.cooldown && lastUsed[option.id]) {
      const timeSinceUse = Date.now() - lastUsed[option.id];
      const cooldownMs = option.cooldown * 60 * 1000;
      return timeSinceUse >= cooldownMs;
    }
    
    return true;
  };

  const getCooldownTime = (option: EnergyOption) => {
    if (!option.cooldown || !lastUsed[option.id]) return null;
    
    const timeSinceUse = Date.now() - lastUsed[option.id];
    const cooldownMs = option.cooldown * 60 * 1000;
    const remaining = Math.max(0, cooldownMs - timeSinceUse);
    
    if (remaining === 0) return null;
    
    const minutes = Math.ceil(remaining / (60 * 1000));
    return `${minutes}m`;
  };

  const handleUseOption = (option: EnergyOption) => {
    if (!canUse(option)) return;
    
    const actualRestore = Math.min(option.energyRestore, maxEnergy - currentEnergy);
    onEnergyRestore(actualRestore, option.cost);
    
    if (option.cooldown) {
      setLastUsed(prev => ({ ...prev, [option.id]: Date.now() }));
    }
    
    onClose();
  };

  const energyPercentage = (currentEnergy / maxEnergy) * 100;

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border-purple-500/30 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Energy Replenishment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Energy Status */}
          <Card className="bg-gray-900/50 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-green-400" />
                  <span className="font-semibold">Current Energy</span>
                </div>
                <span className="text-lg font-bold">{currentEnergy}/{maxEnergy}</span>
              </div>
              <Progress value={energyPercentage} className="h-3" />
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>Gold: {playerGold}</span>
              </div>
            </CardContent>
          </Card>

          {/* Energy Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {energyOptions.map((option) => {
              const Icon = option.icon;
              const isUsable = canUse(option);
              const cooldownTime = getCooldownTime(option);

              return (
                <Card 
                  key={option.id}
                  className={`bg-gray-900/50 border transition-all duration-200 cursor-pointer ${
                    isUsable 
                      ? 'border-green-500/30 hover:border-green-400/50 hover:bg-gray-800/70' 
                      : 'border-gray-600/30 opacity-60'
                  } ${selectedOption === option.id ? 'ring-2 ring-green-400' : ''}`}
                  onClick={() => isUsable && setSelectedOption(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          option.type === 'free' ? 'bg-green-500/20' :
                          option.type === 'premium' ? 'bg-purple-500/20' :
                          'bg-yellow-500/20'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{option.name}</h3>
                          <Badge variant="outline" className={
                            option.type === 'free' ? 'border-green-500/50 text-green-400' :
                            option.type === 'premium' ? 'border-purple-500/50 text-purple-400' :
                            'border-yellow-500/50 text-yellow-400'
                          }>
                            {option.type}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 mb-3">{option.description}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">+{option.energyRestore} Energy</span>
                        {option.cost > 0 ? (
                          <span className="text-yellow-400">{option.cost} Gold</span>
                        ) : (
                          <span className="text-green-400">Free</span>
                        )}
                      </div>

                      {cooldownTime && (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <Clock className="w-3 h-3" />
                          <span>Cooldown: {cooldownTime}</span>
                        </div>
                      )}

                      {option.requirement && (
                        <div className="text-xs text-gray-400">
                          Requires: {option.requirement}
                        </div>
                      )}
                    </div>

                    {selectedOption === option.id && (
                      <Button 
                        onClick={() => handleUseOption(option)}
                        disabled={!isUsable}
                        className="w-full mt-3 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Use {option.name}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Emergency Full Restore */}
          {currentEnergy < maxEnergy * 0.2 && (
            <Card className="bg-red-900/30 border-red-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-red-400" />
                  <span className="font-semibold text-red-400">Emergency Restore</span>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Your energy is critically low! Use this emergency option to fully restore your energy.
                </p>
                <Button 
                  onClick={() => handleUseOption({
                    id: 'emergency',
                    name: 'Emergency Restore',
                    description: 'Emergency full energy restore',
                    energyRestore: maxEnergy - currentEnergy,
                    cost: 300,
                    icon: Heart,
                    type: 'premium'
                  })}
                  disabled={playerGold < 300}
                  className="w-full bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Emergency Restore (300 Gold)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}