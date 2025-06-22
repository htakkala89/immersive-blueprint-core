import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Sparkles, ArrowRight } from 'lucide-react';

interface FirstTimeProfileCreationProps {
  onCreateProfile: (profileName: string) => void;
  isCreating?: boolean;
}

export function FirstTimeProfileCreation({ onCreateProfile, isCreating = false }: FirstTimeProfileCreationProps) {
  const [profileName, setProfileName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (profileName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (profileName.trim().length > 50) {
      setError('Name must be less than 50 characters');
      return;
    }
    
    setError('');
    onCreateProfile(profileName.trim());
  };

  const suggestedNames = [
    'Jin-Woo',
    'Shadow Hunter',
    'Monarch',
    'Ace Hunter',
    'Rising Star'
  ];

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              
              <div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  Welcome to Solo Leveling
                </CardTitle>
                <p className="text-slate-300 text-sm">
                  Enter your name to begin your journey as a Hunter
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profileName" className="block text-sm font-medium text-slate-300 mb-2">
                    Hunter Name
                  </label>
                  <Input
                    id="profileName"
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Enter your hunter name..."
                    className="bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400"
                    disabled={isCreating}
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isCreating || !profileName.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {isCreating ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Join the World
                    </>
                  )}
                </Button>
              </form>
              
              <div className="space-y-3">
                <p className="text-xs text-slate-400 text-center">Suggested names:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestedNames.map((name) => (
                    <Button
                      key={name}
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileName(name)}
                      disabled={isCreating}
                      className="text-xs border-white/20 text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  Your progress will be automatically saved to this profile
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}