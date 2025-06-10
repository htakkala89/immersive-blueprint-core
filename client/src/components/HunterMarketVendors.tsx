import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Hammer, Beaker, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HunterMarket from './HunterMarket';
import type { InventoryItem } from '@shared/schema';

interface VendorNode {
  id: string;
  name: string;
  type: 'materials' | 'equipment' | 'alchemy';
  position: { x: number; y: number };
  icon: React.ReactNode;
  greeting: string;
  description: string;
  specializes: string[];
}

interface HunterMarketVendorsProps {
  isVisible: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  currentGold: number;
  onSellItem: (itemId: string, quantity: number, totalValue: number) => void;
  backgroundImage?: string;
  selectedVendor?: string | null;
}

const VENDOR_NODES: VendorNode[] = [
  {
    id: 'materials_trader',
    name: 'Materials Trader',
    type: 'materials',
    position: { x: 25, y: 60 },
    icon: <Package className="w-4 h-4" />,
    greeting: "Fresh from a Gate? Let's see what rare cores you've brought me today. I pay top price for high-quality mana stones.",
    description: "Specializes in monster materials and mana crystals",
    specializes: ['mana_crystal', 'monster_core', 'treasure']
  },
  {
    id: 'equipment_smith',
    name: 'Equipment Smith',
    type: 'equipment',
    position: { x: 50, y: 45 },
    icon: <Hammer className="w-4 h-4" />,
    greeting: "Hunter gear looking worn? I've got the finest weapons and armor. Also buying anything you've outgrown.",
    description: "Buys and sells hunter weapons and armor",
    specializes: ['weapon', 'armor']
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    type: 'alchemy',
    position: { x: 75, y: 55 },
    icon: <Beaker className="w-4 h-4" />,
    greeting: "Potions, elixirs, enhancement stones... I have everything to keep you alive in the dungeons.",
    description: "Sells consumables and enhancement items",
    specializes: ['consumable', 'misc']
  }
];

export default function HunterMarketVendors({
  isVisible,
  onClose,
  inventory,
  currentGold,
  onSellItem,
  backgroundImage
}: HunterMarketVendorsProps) {
  const [selectedVendor, setSelectedVendor] = useState<VendorNode | null>(null);
  const [showThoughtPrompt, setShowThoughtPrompt] = useState<VendorNode | null>(null);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showTradeInterface, setShowTradeInterface] = useState(false);

  const handleNodeClick = (vendor: VendorNode) => {
    setShowThoughtPrompt(vendor);
  };

  const handleApproachVendor = () => {
    if (!showThoughtPrompt) return;
    setSelectedVendor(showThoughtPrompt);
    setShowThoughtPrompt(null);
    setShowDialogue(true);
  };

  const handleOpenTrade = () => {
    setShowDialogue(false);
    setShowTradeInterface(true);
  };

  const handleCloseTrade = () => {
    setShowTradeInterface(false);
    setShowDialogue(true);
  };

  const handleLeaveVendor = () => {
    setShowDialogue(false);
    setSelectedVendor(null);
  };

  const getFilteredInventory = (vendor: VendorNode): InventoryItem[] => {
    return inventory.filter(item => vendor.specializes.includes(item.type));
  };

  if (!isVisible) return null;

  // Show trade interface if open
  if (showTradeInterface && selectedVendor) {
    return (
      <HunterMarket
        isVisible={true}
        onClose={handleCloseTrade}
        inventory={getFilteredInventory(selectedVendor)}
        currentGold={currentGold}
        onSellItem={onSellItem}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
      >
        {/* Market Background */}
        <div className="relative w-full h-full">
          {backgroundImage && (
            <img 
              src={backgroundImage} 
              alt="Hunter Market" 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Interactive Vendor Nodes */}
          {VENDOR_NODES.map(vendor => (
            <motion.div
              key={vendor.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 * VENDOR_NODES.indexOf(vendor) }}
              className="absolute cursor-pointer"
              style={{
                left: `${vendor.position.x}%`,
                top: `${vendor.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleNodeClick(vendor)}
            >
              {/* Pulsing glow effect */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-purple-500 rounded-full blur-lg"
              />
              
              {/* Vendor node */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full border-2 border-purple-300 shadow-lg flex items-center justify-center"
              >
                {vendor.icon}
              </motion.div>
              
              {/* Hover tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
              >
                {vendor.name}
              </motion.div>
            </motion.div>
          ))}

          {/* Close button */}
          <Button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 border border-gray-600"
            size="icon"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Thought Prompt */}
          <AnimatePresence>
            {showThoughtPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div className="bg-black/80 backdrop-blur-md border border-purple-500/30 rounded-2xl px-6 py-4 max-w-md">
                  <p className="text-white text-center mb-3">
                    Approach the {showThoughtPrompt.name}
                  </p>
                  <p className="text-gray-300 text-sm text-center mb-4">
                    {showThoughtPrompt.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApproachVendor}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                    >
                      Approach
                    </Button>
                    <Button
                      onClick={() => setShowThoughtPrompt(null)}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vendor Dialogue */}
          <AnimatePresence>
            {showDialogue && selectedVendor && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-md border-t border-gray-600"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
                      {selectedVendor.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {selectedVendor.name}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {selectedVendor.greeting}
                      </p>
                      
                      {/* Trade button */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleOpenTrade}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-amber-900 font-bold"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Trade
                        </Button>
                        <Button
                          onClick={handleLeaveVendor}
                          variant="outline"
                          className="border-gray-600"
                        >
                          Leave
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}