import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';

interface WealthDisplayProps {
  currentGold: number;
  isVisible?: boolean;
  showTransactionHistory?: boolean;
  recentTransactions?: Array<{
    id: string;
    type: 'gain' | 'loss';
    amount: number;
    description: string;
    timestamp: string;
  }>;
}

export default function WealthDisplay({ 
  currentGold, 
  isVisible = true, 
  showTransactionHistory = false,
  recentTransactions = []
}: WealthDisplayProps) {
  
  const formatGold = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('₩', '₩ ');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 right-4 z-30"
      >
        {/* Main Wealth Display */}
        <div className="bg-black/80 backdrop-blur-md border border-amber-500/30 rounded-2xl px-6 py-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center"
            >
              <Coins className="w-5 h-5 text-amber-900" />
            </motion.div>
            
            <div className="flex flex-col">
              <span className="text-amber-200 text-xs font-medium">Hunter Wealth</span>
              <motion.span
                key={currentGold}
                initial={{ scale: 1.1, color: '#FCD34D' }}
                animate={{ scale: 1, color: '#F3F4F6' }}
                transition={{ duration: 0.3 }}
                className="text-white text-lg font-bold font-mono tracking-wide"
              >
                {formatGold(currentGold)}
              </motion.span>
            </div>
          </div>
        </div>

        {/* Transaction History Panel */}
        {showTransactionHistory && recentTransactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-black/90 backdrop-blur-md border border-purple-500/20 rounded-xl px-4 py-3 max-h-40 overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 text-xs font-medium">Recent Activity</span>
            </div>
            
            <div className="space-y-1">
              {recentTransactions.slice(0, 5).map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-gray-300 truncate max-w-32">
                    {transaction.description}
                  </span>
                  <span 
                    className={`font-mono font-medium ${
                      transaction.type === 'gain' 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}
                  >
                    {transaction.type === 'gain' ? '+' : '-'}{formatGold(Math.abs(transaction.amount))}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}