import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

interface WorldMapProps {
  gameState: any;
  playerLocation: string;
  onLocationSelect: (locationId: string) => void;
  timeOfDay: string;
  gameTime: Date;
}

const LOCATIONS = [
  {
    id: 'hunter_association',
    name: 'Hunter Association',
    description: 'The headquarters of all hunter activities',
    x: 30,
    y: 40
  },
  {
    id: 'hongdae_cafe',
    name: 'Hongdae Cafe',
    description: 'A cozy coffee shop in the trendy Hongdae district',
    x: 60,
    y: 30
  },
  {
    id: 'training_facility',
    name: 'Training Facility',
    description: 'State-of-the-art hunter training center',
    x: 20,
    y: 60
  },
  {
    id: 'hunter_market',
    name: 'Hunter Market',
    description: 'Equipment and supplies for hunters',
    x: 70,
    y: 50
  },
  {
    id: 'hangang_park',
    name: 'Hangang Park',
    description: 'Beautiful riverside park for relaxation',
    x: 50,
    y: 70
  },
  {
    id: 'player_apartment',
    name: 'Your Apartment',
    description: 'Your personal living space',
    x: 40,
    y: 20
  }
];

export default function WorldMap({ 
  gameState, 
  playerLocation, 
  onLocationSelect, 
  timeOfDay, 
  gameTime 
}: WorldMapProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Map Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Seoul World Map</h2>
        <div className="text-purple-200 text-sm">
          Current Time: {timeOfDay} • Current Location: {playerLocation}
        </div>
      </div>
      
      {/* Map Container */}
      <Card className="relative bg-gradient-to-br from-slate-800/50 to-purple-900/30 border-purple-500/20 p-6">
        <div className="relative w-full h-96 overflow-hidden rounded-lg">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-purple-900 opacity-50" />
          
          {/* Location Nodes */}
          {LOCATIONS.map((location) => (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
              }}
              onClick={() => onLocationSelect(location.id)}
            >
              {/* Node */}
              <div className={`
                w-4 h-4 rounded-full border-2 transition-all duration-300
                ${playerLocation === location.id 
                  ? 'bg-yellow-400 border-yellow-300 shadow-lg shadow-yellow-400/50 scale-125' 
                  : 'bg-purple-500 border-purple-300 shadow-lg shadow-purple-400/30 hover:scale-110'
                }
              `}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="w-2 h-2 text-white" />
                </div>
              </div>
              
              {/* Label */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {location.name}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Location List */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOCATIONS.map((location) => (
            <Button
              key={location.id}
              variant={playerLocation === location.id ? "default" : "outline"}
              size="sm"
              onClick={() => onLocationSelect(location.id)}
              className="text-left justify-start"
            >
              <MapPin className="w-3 h-3 mr-2" />
              {location.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}