import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Battery, 
  Coffee, 
  Moon, 
  Sparkles, 
  Clock, 
  Zap, 
  Heart,
  Plus,
  Coins
} from 'lucide-react';

interface EnergyReplenishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: any;
  setGameState: (updater: (prev: any) => any) => void;
}

interface EnergyOption {
  id: string;
  name: string;
  description: string;
  energyRestore: number;
  cost: number;
  icon: JSX.Element;
  cooldown?: number;
}

export default function EnergyReplenishmentModal({ 
  isOpen, 
  onClose, 
  gameState, 
  setGameState 
}: EnergyReplenishmentModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isRestoring, setIsRestoring] = useState(false);

  const energyOptions: EnergyOption[] = [
    {
      id: 'rest',
      name: 'Full Rest',
      description: 'Completely restore all energy. Takes time but costs nothing.',
      energyRestore: gameState.maxEnergy || 100,
      cost: 0,
      icon: <Moon className="w-6 h-6" />,
      cooldown: 0
    },
    {
      id: 'energy_drink',
      name: 'Energy Drink',
      description: 'Quick energy boost. Restores 30 energy instantly.',
      energyRestore: 30,
      cost: 50,
      icon: <Coffee className="w-6 h-6" />
    },
    {
      id: 'energy_potion',
      name: 'Energy Potion',
      description: 'Magical potion that restores 50 energy.',
      energyRestore: 50,
      cost: 100,
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      id: 'meditation',
      name: 'Meditation',
      description: 'Peaceful meditation restores 25 energy and increases focus.',
      energyRestore: 25,
      cost: 0,
      icon: <Heart className="w-6 h-6" />
    },
    {
      id: 'premium_rest',
      name: 'Premium Recovery',
      description: 'Luxury rest that fully restores energy and provides bonus stats.',
      energyRestore: gameState.maxEnergy || 100,
      cost: 200,
      icon: <Battery className="w-6 h-6" />
    }
  ];

  const handleEnergyRestore = async (option: EnergyOption) => {
    if (gameState.gold < option.cost) {
      alert('Not enough gold!');
      return;
    }

    if ((gameState.energy || 0) >= (gameState.maxEnergy || 100)) {
      alert('Energy is already full!');
      return;
    }

    setIsRestoring(true);
    setSelectedOption(option.id);

    // Simulate restoration time
    const restoreTime = option.id === 'rest' ? 2000 : 1000;
    
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        energy: Math.min(
          prev.maxEnergy || 100, 
          (prev.energy || 0) + option.energyRestore
        ),
        gold: prev.gold - option.cost,
        // Add bonus effects for premium options
        ...(option.id === 'premium_rest' && {
          health: prev.maxHealth,
          mana: prev.maxMana
        }),
        ...(option.id === 'meditation' && {
          affection: Math.min(100, prev.affection + 2)
        })
      }));

      setIsRestoring(false);
      setSelectedOption('');
      
      // Close modal after successful restoration
      setTimeout(() => {
        onClose();
      }, 500);
    }, restoreTime);
  };

  const currentEnergy = gameState.energy || 0;
  const maxEnergy = gameState.maxEnergy || 100;
  const energyPercentage = (currentEnergy / maxEnergy) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Battery className="w-6 h-6 text-green-400" />
            Energy Replenishment
          </DialogTitle>
        </DialogHeader>

        {/* Current Energy Status */}
        <Card className="bg-slate-800 border-slate-700 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Energy</span>
              <span className="text-sm text-green-400">
                {currentEnergy}/{maxEnergy}
              </span>
            </div>
            <Progress 
              value={energyPercentage} 
              className="h-3 bg-slate-700"
            />
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>Available Gold: {gameState.gold || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Energy Restoration Options */}
        <div className="grid gap-3 max-h-80 overflow-y-auto">
          {energyOptions.map((option) => {
            const canAfford = gameState.gold >= option.cost;
            const isSelected = selectedOption === option.id;
            const willOverfill = currentEnergy + option.energyRestore > maxEnergy;
            const actualRestore = willOverfill ? maxEnergy - currentEnergy : option.energyRestore;

            return (
              <Card 
                key={option.id}
                className={`bg-slate-800 border-slate-600 hover:border-slate-500 transition-all cursor-pointer ${
                  !canAfford ? 'opacity-50' : ''
                } ${isSelected ? 'border-green-500 bg-slate-700' : ''}`}
                onClick={() => !isRestoring && canAfford && handleEnergyRestore(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      option.cost === 0 ? 'bg-blue-500/20' : 'bg-green-500/20'
                    }`}>
                      {option.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{option.name}</h3>
                        {option.cost === 0 ? (
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                            Free
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                            {option.cost} Gold
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-2">
                        {option.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-green-400">
                          <Plus className="w-3 h-3" />
                          <span>{actualRestore} Energy</span>
                        </div>
                        
                        {option.cooldown !== undefined && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Clock className="w-3 h-3" />
                            <span>{option.cooldown}s</span>
                          </div>
                        )}
                      </div>

                      {!canAfford && (
                        <div className="text-red-400 text-sm mt-1">
                          Insufficient gold
                        </div>
                      )}

                      {currentEnergy >= maxEnergy && (
                        <div className="text-yellow-400 text-sm mt-1">
                          Energy is already full
                        </div>
                      )}
                    </div>

                    {isSelected && isRestoring && (
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                        <span className="text-sm">Restoring...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips */}
        <Card className="bg-blue-500/10 border-blue-500/30 mt-4">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <strong>Energy Tips:</strong> Energy regenerates slowly over time. Use energy drinks for quick boosts, 
                meditation for peaceful restoration, or rest for complete recovery.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Close Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-600 hover:border-slate-500"
            disabled={isRestoring}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}