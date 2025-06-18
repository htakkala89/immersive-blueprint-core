import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Heart, 
  Star,
  Volume2,
  Settings,
  Maximize,
  ArrowLeft
} from 'lucide-react';

interface MangaChapter {
  id: string;
  title: string;
  pages: MangaPage[];
  choices?: Choice[];
}

interface MangaPage {
  id: string;
  imageUrl?: string;
  panels: Panel[];
  dialogue: DialogueBox[];
  backgroundMusic?: string;
}

interface Panel {
  id: string;
  imageUrl?: string;
  description: string;
  position: { x: number; y: number; width: number; height: number };
}

interface DialogueBox {
  id: string;
  character: string;
  text: string;
  position: { x: number; y: number };
  emotion: string;
}

interface Choice {
  id: string;
  text: string;
  consequence: string;
  nextChapter?: string;
}

interface MangaReaderProps {
  mangaData: any;
  onClose: () => void;
}

export function MangaReader({ mangaData, onClose }: MangaReaderProps) {
  const [currentChapter, setCurrentChapter] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingMode, setReadingMode] = useState<'page' | 'panel'>('page');
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const [affectionPoints, setAffectionPoints] = useState(0);

  // Generate interactive manga chapters from the scaffold data
  const chapters: MangaChapter[] = mangaData.episodes?.map((episode: any, index: number) => ({
    id: `chapter_${index + 1}`,
    title: episode.title || `Chapter ${index + 1}`,
    pages: episode.beats?.map((beat: any, pageIndex: number) => ({
      id: `page_${pageIndex + 1}`,
      panels: [
        {
          id: `panel_1`,
          description: beat.description || `Scene from ${beat.title}`,
          position: { x: 0, y: 0, width: 100, height: 60 }
        },
        {
          id: `panel_2`, 
          description: `Character interaction in ${beat.location}`,
          position: { x: 0, y: 60, width: 100, height: 40 }
        }
      ],
      dialogue: [
        {
          id: `dialogue_1`,
          character: mangaData.characters?.[0]?.name || 'Character 1',
          text: beat.dialogue || "This moment feels so natural...",
          position: { x: 20, y: 70 },
          emotion: 'thoughtful'
        }
      ]
    })) || [],
    choices: episode.choices || []
  })) || [];

  const currentChapterData = chapters[currentChapter];
  const currentPageData = currentChapterData?.pages[currentPage];
  const totalPages = currentChapterData?.pages.length || 0;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(chapters[currentChapter - 1]?.pages.length - 1 || 0);
    }
  };

  const handleChoice = (choice: Choice) => {
    console.log('handleChoice called with:', choice);
    setUserChoices({ ...userChoices, [choice.id]: choice.text });
    if (choice.consequence.includes('affection')) {
      setAffectionPoints(affectionPoints + 5);
    }
    nextPage();
  };



  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Reader Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Reader
            </Button>
            <div className="text-white">
              <h2 className="text-lg font-bold">{mangaData.title}</h2>
              <p className="text-sm opacity-75">
                Chapter {currentChapter + 1}: {currentChapterData?.title}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Heart className="w-4 h-4 text-pink-400" />
              <span className="text-sm">{affectionPoints}</span>
            </div>
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentChapter}-${currentPage}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl h-full max-h-screen p-8"
          >
            {/* Manga Page */}
            <Card className="w-full h-full bg-white border-4 border-gray-800 shadow-2xl overflow-hidden">
              <CardContent className="p-0 h-full relative">
                {/* Page Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
                
                {/* Panels */}
                {currentPageData?.panels.map((panel, index) => (
                  <motion.div
                    key={panel.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="absolute border-2 border-black bg-white rounded-lg overflow-hidden shadow-lg"
                    style={{
                      left: `${panel.position.x}%`,
                      top: `${panel.position.y}%`,
                      width: `${panel.position.width}%`,
                      height: `${panel.position.height}%`
                    }}
                  >
                    {/* Panel Content */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                      <div className="text-center p-4">
                        <div className="text-lg font-bold text-gray-800 mb-2">
                          Panel {index + 1}
                        </div>
                        <p className="text-sm text-gray-600">
                          {panel.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Dialogue Boxes */}
                {currentPageData?.dialogue.map((dialogue, index) => (
                  <motion.div
                    key={dialogue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.3 }}
                    className="absolute bg-white border-2 border-black rounded-xl p-3 shadow-lg max-w-xs"
                    style={{
                      left: `${dialogue.position.x}%`,
                      top: `${dialogue.position.y}%`
                    }}
                  >
                    <div className="text-xs font-bold text-purple-600 mb-1">
                      {dialogue.character}
                    </div>
                    <p className="text-sm text-gray-800">
                      {dialogue.text}
                    </p>
                    
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-l-2 border-b-2 border-black transform rotate-45" />
                  </motion.div>
                ))}

                {/* Choice Buttons */}
                {currentChapterData?.choices && currentPage === totalPages - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-4 left-4 right-4 z-50"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div className="bg-black/90 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                      <h4 className="text-white font-semibold mb-3">Choose your path:</h4>
                      <div className="space-y-2">
                        {currentChapterData.choices.map((choice) => (
                          <Button
                            key={choice.id}
                            onClick={() => handleChoice(choice)}
                            className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border border-white/30 cursor-pointer"
                            style={{ pointerEvents: 'auto' }}
                          >
                            {choice.text}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <Button
          onClick={prevPage}
          disabled={currentChapter === 0 && currentPage === 0}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white border-2 border-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          onClick={nextPage}
          disabled={currentChapter === chapters.length - 1 && currentPage === totalPages - 1}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white border-2 border-white/20"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4">
        <div className="flex items-center justify-between text-white text-sm mb-2">
          <span>Page {currentPage + 1} of {totalPages}</span>
          <span>Chapter {currentChapter + 1} of {chapters.length}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((currentChapter * 100 + (currentPage / totalPages) * 100) / chapters.length)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}