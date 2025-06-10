import { motion, AnimatePresence } from 'framer-motion';

interface WealthDisplayProps {
  currentGold: number;
  isVisible?: boolean;
  context?: 'vendor' | 'inventory' | 'market' | 'hidden';
}

export default function WealthDisplay({ 
  currentGold, 
  isVisible = true,
  context = 'hidden'
}: WealthDisplayProps) {
  
  const formatGold = (amount: number) => {
    return `₩ ${amount.toLocaleString('ko-KR')}`;
  };

  // Only show when in money-relevant contexts as per UI/UX specs
  const shouldShow = isVisible && ['vendor', 'inventory', 'market'].includes(context);

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="fixed top-4 right-4 z-30"
      >
        <div className="bg-black/60 backdrop-blur-sm border border-amber-500/20 rounded-xl px-4 py-2 shadow-lg">
          <span className="text-lg font-medium text-amber-200">
            {formatGold(currentGold)}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}