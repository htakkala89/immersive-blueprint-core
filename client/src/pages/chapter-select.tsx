import { useState } from 'react';
import { useLocation } from 'wouter';

interface Chapter {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  startScene: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'arise',
    title: 'Arise',
    description: 'Begin your journey as the Shadow Monarch and meet Cha Hae-In.',
    icon: '👤',
    unlocked: true,
    startScene: 'MEETING_CHA_HAE_IN'
  },
  {
    id: 'date_night',
    title: 'Date Night',
    description: 'Skip to a romantic evening with Cha Hae-In.',
    icon: '🌙',
    unlocked: true,
    startScene: 'COFFEE_DATE'
  },
  {
    id: 'gate_raids',
    title: 'Gate Raids',
    description: 'Team up with Cha Hae-In for dangerous gate clearing missions.',
    icon: '🚪',
    unlocked: true,
    startScene: 'GATE_ENTRANCE'
  },
  {
    id: 'daily_life',
    title: 'Daily Life Hub',
    description: 'Your apartment - the center of your ongoing life with Hae-In.',
    icon: '🏠',
    unlocked: true,
    startScene: 'DAILY_LIFE_HUB'
  },
  {
    id: 'marketplace',
    title: 'Hunter Marketplace',
    description: 'Visit the marketplace to buy gifts and equipment.',
    icon: '🛒',
    unlocked: true,
    startScene: 'HUNTER_MARKETPLACE'
  }
];

export default function ChapterSelect() {
  const [, setLocation] = useLocation();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const handleChapterSelect = (chapter: Chapter) => {
    if (!chapter.unlocked) return;
    
    // Store the selected starting scene in localStorage
    localStorage.setItem('gameStartScene', chapter.startScene);
    localStorage.setItem('gameMode', chapter.id);
    
    // Navigate to the game
    setLocation('/solo-leveling');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Solo Leveling
          </h1>
          <h2 className="text-2xl text-gray-300 mb-2">Romance with Cha Hae-In</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose your starting point in this epic romance adventure. Experience the world of Solo Leveling 
            through intimate moments with the legendary Sword Saint.
          </p>
        </div>

        {/* Chapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {CHAPTERS.map((chapter) => (
            <div
              key={chapter.id}
              className={`relative p-6 rounded-xl backdrop-blur-md transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                chapter.unlocked
                  ? 'bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30'
                  : 'bg-gray-800/50 border border-gray-600/30 cursor-not-allowed opacity-50'
              } ${selectedChapter?.id === chapter.id ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => chapter.unlocked && setSelectedChapter(chapter)}
              onDoubleClick={() => chapter.unlocked && handleChapterSelect(chapter)}
            >
              {/* Chapter Icon */}
              <div className="text-4xl mb-4 text-center">
                {chapter.icon}
              </div>

              {/* Chapter Title */}
              <h3 className={`text-xl font-semibold mb-3 text-center ${
                chapter.unlocked ? 'text-white' : 'text-gray-500'
              }`}>
                {chapter.title}
              </h3>

              {/* Chapter Description */}
              <p className={`text-sm leading-relaxed text-center ${
                chapter.unlocked ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {chapter.description}
              </p>

              {/* Lock indicator */}
              {!chapter.unlocked && (
                <div className="absolute top-4 right-4 text-gray-500">
                  🔒
                </div>
              )}

              {/* Selected indicator */}
              {selectedChapter?.id === chapter.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {selectedChapter && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex gap-4 p-4 bg-black/50 backdrop-blur-md rounded-xl border border-white/20">
              <button
                onClick={() => setSelectedChapter(null)}
                className="px-6 py-3 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleChapterSelect(selectedChapter)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
              >
                Start Chapter
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Click to select a chapter, then click "Start Chapter" or double-click to begin immediately</p>
        </div>
      </div>
    </div>
  );
}