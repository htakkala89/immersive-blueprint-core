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

  return (
    <AnimatePresence>
      {isVisible && (
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
            <div className="relative w-full h-full pt-24 pb-6 px-6 overflow-hidden">
              <div className="relative w-full h-full bg-gradient-to-b from-slate-50/90 to-slate-100/90 dark:from-slate-800/90 dark:to-slate-900/90 rounded-xl backdrop-blur-sm border border-white/20 p-8">
                
                {/* Property Listings Grid Layout */}
                <div className="flex flex-col h-full">
                  {/* Office Ambiance Header */}
                  <div className="text-center mb-6">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg inline-block">
                      <p className="text-slate-600 dark:text-slate-300 text-sm italic">
                        "Discover Seoul's most exclusive residential properties"
                      </p>
                    </div>
                  </div>

                  {/* Property Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 max-w-4xl mx-auto">
                    {PROPERTY_LISTINGS.map((property) => (
                      <motion.div
                        key={property.id}
                        className="relative bg-white/80 dark:bg-slate-800/80 rounded-2xl p-6 cursor-pointer backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePropertyClick(property)}
                        onHoverStart={() => setHoveredProperty(property.id)}
                        onHoverEnd={() => setHoveredProperty(null)}
                      >
                        {/* Property Visual Card */}
                        <div className={`relative w-full h-40 bg-gradient-to-br ${getTierGradient(property.tier)} rounded-lg p-1 shadow-2xl mb-4`}>
                          <div className="w-full h-full bg-white/95 dark:bg-slate-800/95 rounded-md flex flex-col items-center justify-center backdrop-blur-sm p-4">
                            {getLuxuryIcon(property.luxury)}
                            <h4 className="text-lg font-bold text-center mt-3 text-slate-800 dark:text-slate-200">{property.name}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{property.squareMeters}m²</span>
                            </div>
                          </div>
                          
                          {/* Tier Badge */}
                          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            <span className="text-white text-sm font-bold">{property.tier}</span>
                          </div>

                          {/* Luxury Indicator */}
                          {property.luxury === 'penthouse' && (
                            <div className="absolute -top-2 -left-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="space-y-3">
                          <p className="text-slate-600 dark:text-slate-300 text-sm">{property.description}</p>
                          
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-600 dark:text-blue-300 text-sm">{property.location}</span>
                          </div>

                          <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                            <div className="text-right">
                              <div className="text-yellow-600 dark:text-yellow-400 font-bold text-xl">
                                ₩{property.price.toLocaleString()}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 text-xs">Click to view details</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Professional Footer */}
                  <div className="mt-6 text-center">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg inline-block">
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        Licensed Real Estate Professional
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Inspection Modal */}
            {selectedProperty && (
              <ItemInspectionView
                item={selectedProperty as any}
                currentGold={currentGold}
                onPurchase={(item) => handlePurchase(item as PropertyListing)}
                onClose={() => setSelectedProperty(null)}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}