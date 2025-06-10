import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Crown, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ItemInspectionView from './ItemInspectionView';

interface PropertyListing {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  price: number;
  tier: 2 | 3;
  location: string;
  features: string[];
  squareMeters: number;
  position: { x: number; y: number };
  luxury: 'high-rise' | 'penthouse';
}

interface LuxuryRealtorProps {
  isVisible: boolean;
  onClose: () => void;
  currentGold: number;
  onPurchase: (property: PropertyListing) => void;
  backgroundImage?: string;
}

const PROPERTY_LISTINGS: PropertyListing[] = [
  {
    id: 'gangnam_high_rise',
    name: 'Gangnam District High-Rise',
    description: 'Tier 2 luxury apartment in the heart of Seoul\'s premier district',
    flavorText: 'Floor-to-ceiling windows overlook the glittering cityscape of Gangnam. This residence represents success in the modern world.',
    price: 1500000000, // 1.5 billion won
    tier: 2,
    location: 'Gangnam District, Seoul',
    features: ['City Views', 'Concierge Service', 'Gym Access', 'Rooftop Garden'],
    squareMeters: 120,
    position: { x: 30, y: 45 },
    luxury: 'high-rise'
  },
  {
    id: 'hannam_penthouse',
    name: 'Hannam-dong Penthouse',
    description: 'Tier 3 penthouse suite with panoramic city views',
    flavorText: 'Where Seoul\'s elite call home. Private elevator access opens to a world above the clouds, where privacy and luxury meet.',
    price: 5000000000, // 5 billion won
    tier: 3,
    location: 'Hannam-dong, Yongsan-gu',
    features: ['Panoramic Views', 'Private Elevator', 'Wine Cellar', 'Infinity Pool', 'Butler Service'],
    squareMeters: 300,
    position: { x: 70, y: 35 },
    luxury: 'penthouse'
  }
];

export default function LuxuryRealtor({ 
  isVisible, 
  onClose, 
  currentGold, 
  onPurchase,
  backgroundImage 
}: LuxuryRealtorProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  const handlePropertyClick = (property: PropertyListing) => {
    setSelectedProperty(property);
  };

  const handlePurchase = (property: PropertyListing) => {
    if (currentGold >= property.price) {
      onPurchase(property);
      setSelectedProperty(null);
    }
  };

  const getTierGradient = (tier: number) => {
    return tier === 3 
      ? 'from-purple-600 via-pink-600 to-purple-600'
      : 'from-blue-600 via-cyan-600 to-blue-600';
  };

  const getLuxuryIcon = (luxury: string) => {
    return luxury === 'penthouse' ? <Crown className="w-6 h-6" /> : <Building2 className="w-6 h-6" />;
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 rounded-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Realtor Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent z-20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Seoul Luxury Realty</h1>
                <p className="text-white/80">Exclusive properties for the discerning hunter</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-lg">
                  <span className="text-yellow-400 font-bold">₩{currentGold.toLocaleString()}</span>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Office Environment */}
          <div className="relative w-full h-full pt-24 pb-6 px-6">
            <div className="relative w-full h-full bg-gradient-to-b from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-xl backdrop-blur-sm border border-white/20">
              
              {/* Property Listings Display */}
              {PROPERTY_LISTINGS.map((property) => (
                <motion.div
                  key={property.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${property.position.x}%`,
                    top: `${property.position.y}%`
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePropertyClick(property)}
                  onHoverStart={() => setHoveredProperty(property.id)}
                  onHoverEnd={() => setHoveredProperty(null)}
                >
                  {/* Property Card */}
                  <div className={`relative w-48 h-32 bg-gradient-to-br ${getTierGradient(property.tier)} rounded-lg p-1 shadow-2xl`}>
                    <div className="w-full h-full bg-white/95 dark:bg-slate-800/95 rounded-md flex flex-col items-center justify-center backdrop-blur-sm p-3">
                      {getLuxuryIcon(property.luxury)}
                      <h4 className="text-sm font-bold text-center mt-2">{property.name}</h4>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">{property.squareMeters}m²</span>
                      </div>
                    </div>
                    
                    {/* Tier Badge */}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white text-xs font-bold">{property.tier}</span>
                    </div>

                    {/* Luxury Indicator */}
                    {property.luxury === 'penthouse' && (
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Detailed Hover Card */}
                  <AnimatePresence>
                    {hoveredProperty === property.id && (
                      <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 w-80 bg-black/95 backdrop-blur-md rounded-xl p-6 text-white text-sm z-30 border border-white/20"
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-lg">{property.name}</h4>
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-xs">
                            Tier {property.tier}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 mb-3 text-sm">{property.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300">{property.location}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {property.squareMeters}m² • {property.features.length} premium features
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-gray-300 mb-2">Features:</h5>
                          <div className="grid grid-cols-2 gap-1">
                            {property.features.map((feature, index) => (
                              <div key={index} className="text-xs text-gray-400 flex items-center">
                                <div className="w-1 h-1 bg-blue-400 rounded-full mr-2" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="border-t border-white/20 pt-3">
                          <div className="text-right">
                            <div className="text-yellow-400 font-bold text-xl">
                              ₩{property.price.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">Click to view details</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}

              {/* Office Ambiance */}
              <div className="absolute top-4 left-4 right-4 text-center">
                <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg inline-block">
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                    "Discover Seoul's most exclusive residential properties"
                  </p>
                </div>
              </div>

              {/* Professional Office Elements */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg">
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    Licensed Real Estate Professional
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Inspection Modal */}
          <ItemInspectionView
            item={selectedProperty as any}
            currentGold={currentGold}
            onPurchase={(item) => handlePurchase(item as PropertyListing)}
            onClose={() => setSelectedProperty(null)}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}