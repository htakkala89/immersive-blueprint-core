import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InspectableItem {
  id: string;
  name: string;
  description: string;
  flavorText: string;
  price: number;
  category?: string;
  affectionBonus?: number;
  rarity?: string;
  effect?: string;
  tier?: number;
  location?: string;
  features?: string[];
  squareMeters?: number;
  livingSpaceTier?: number;
  luxury?: string;
}

interface ItemInspectionViewProps {
  item: InspectableItem | null;
  currentGold: number;
  onPurchase: (item: InspectableItem) => void;
  onClose: () => void;
}

export default function ItemInspectionView({ 
  item, 
  currentGold, 
  onPurchase, 
  onClose 
}: ItemInspectionViewProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x + deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePurchase = async () => {
    if (!item || currentGold < item.price) return;
    
    setIsLoading(true);
    
    // Purchase animation sequence
    setTimeout(() => {
      onPurchase(item);
      setIsLoading(false);
      
      // Success feedback
      playPurchaseChime();
    }, 800);
  };

  const playPurchaseChime = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Pleasant purchase chime
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.1); // G5
      oscillator.frequency.setValueAtTime(987.77, audioContext.currentTime + 0.2); // B5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const getRarityGradient = (rarity?: string) => {
    switch (rarity) {
      case 'exclusive': return 'from-purple-600 via-pink-600 to-purple-600';
      case 'luxury': return 'from-blue-600 via-purple-600 to-blue-600';
      case 'premium': return 'from-green-600 via-blue-600 to-green-600';
      default: return 'from-gray-600 via-gray-500 to-gray-600';
    }
  };

  if (!item) return null;

  const canAfford = currentGold >= item.price;
  
  // Debug logging for purchase validation
  console.log('ItemInspectionView purchase validation:', {
    itemName: item.name,
    itemPrice: item.price,
    itemPriceType: typeof item.price,
    currentGold: currentGold,
    currentGoldType: typeof currentGold,
    canAfford: canAfford
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="relative w-full max-w-5xl h-full max-h-[85vh] bg-gradient-to-br from-slate-50/95 via-white/90 to-slate-100/95 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-slate-900/95 rounded-2xl backdrop-blur-xl border border-white/30 overflow-hidden"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/20 to-transparent z-20">
            <div className="flex justify-between items-start">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">Item Inspection</span>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="flex h-full pt-20 pb-6 px-6 gap-6">
            
            {/* Left Column - 3D Showcase */}
            <div className="flex-1 flex flex-col">
              <div 
                className="flex-1 relative bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-xl border border-white/30 overflow-hidden cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* 3D Model Container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className={`relative w-64 h-64 bg-gradient-to-br ${getRarityGradient(item.rarity)} rounded-full shadow-2xl`}
                    style={{
                      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                    }}
                    animate={{
                      boxShadow: [
                        '0 20px 40px rgba(0,0,0,0.3)',
                        '0 25px 50px rgba(0,0,0,0.4)',
                        '0 20px 40px rgba(0,0,0,0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Inner glow effect */}
                    <div className="absolute inset-4 bg-white/20 rounded-full backdrop-blur-sm" />
                    
                    {/* Item representation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="text-6xl"
                        animate={{ rotateZ: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        {item.category === 'jewelry' && '💎'}
                        {item.category === 'clothing' && '👗'}
                        {item.category === 'chocolates' && '🍫'}
                        {item.category === 'accessories' && '👜'}
                        {!item.category && '✨'}
                      </motion.div>
                    </div>

                    {/* Rarity particles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `rotate(${i * 45}deg) translateY(-140px)`
                        }}
                        animate={{
                          scale: [0.5, 1, 0.5],
                          opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.25,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Interaction Hint */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg inline-flex items-center gap-2 text-white text-sm">
                    <RotateCw className="w-4 h-4" />
                    Drag to rotate
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Item Details */}
            <div className="w-96 flex flex-col bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-6 border border-white/30">
              
              {/* Item Name */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  {item.name}
                </h2>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityGradient(item.rarity)} text-white`}>
                  {item.rarity || 'Standard'}
                </div>
              </div>

              {/* Flavor Text */}
              <div className="mb-6">
                <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">
                  {item.flavorText}
                </p>
              </div>

              {/* Effect */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Effect</h4>
                <p className="text-slate-600 dark:text-slate-400">
                  {item.effect || item.description}
                </p>
                
                {item.affectionBonus && (
                  <div className="mt-3 flex items-center gap-2 bg-pink-100/50 dark:bg-pink-900/30 px-3 py-2 rounded-lg">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-pink-700 dark:text-pink-300 font-medium">
                      +{item.affectionBonus} Affection
                    </span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Price</h4>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  ₩{item.price.toLocaleString()}
                </div>
                
                {!canAfford && (
                  <p className="text-red-500 text-sm mt-1">Insufficient funds</p>
                )}
              </div>

              {/* Purchase Button */}
              <div className="mt-auto">
                <Button
                  onClick={handlePurchase}
                  disabled={!canAfford || isLoading}
                  className={`w-full h-12 text-lg font-bold ${
                    canAfford 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Purchase
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Purchase Success Animation Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute inset-0 bg-green-600/20 backdrop-blur-sm flex items-center justify-center z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-2xl"
                  initial={{ scale: 0.5, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.5, y: 50 }}
                >
                  <motion.div
                    className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: 1 }}
                  >
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Transaction Complete!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {item.name} added to inventory
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}