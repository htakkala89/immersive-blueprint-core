import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Star, 
  Heart, 
  Search, 
  Filter,
  ArrowLeft,
  Play,
  Users,
  Clock
} from 'lucide-react';
import { MangaReader } from '@/components/MangaReader';

interface PublishedManga {
  id: string;
  title: string;
  description: string;
  author: string;
  genre: string[];
  rating: number;
  chapters: number;
  views: number;
  likes: number;
  thumbnail: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  lastUpdated: string;
  scaffoldData: any;
}

interface MangaLibraryProps {
  onBack?: () => void;
}

export default function MangaLibrary({ onBack }: MangaLibraryProps) {
  const [selectedManga, setSelectedManga] = useState<PublishedManga | null>(null);
  const [showReader, setShowReader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Sample published manga data (in real app, this would come from API)
  const [publishedManga] = useState<PublishedManga[]>([
    {
      id: 'coffee_shop_romance',
      title: 'Coffee Shop Romance',
      description: 'A heartwarming story about unexpected connections and the magic of everyday moments',
      author: 'Blueprint Creator',
      genre: ['Romance', 'Slice of Life'],
      rating: 4.8,
      chapters: 3,
      views: 12847,
      likes: 2394,
      thumbnail: '/api/scenes/coffee_shop.jpg',
      status: 'completed',
      lastUpdated: '2025-01-18',
      scaffoldData: {
        title: 'Coffee Shop Romance',
        description: 'A heartwarming story about unexpected connections',
        characters: [
          {
            id: 'char_1',
            name: 'Alex',
            role: 'protagonist',
            personality: ['shy', 'observant', 'kind'],
            background: 'Quiet bookstore owner who finds solace in routine',
            appearance: 'Gentle eyes, warm smile, casual clothing'
          },
          {
            id: 'char_2', 
            name: 'Jordan',
            role: 'love_interest',
            personality: ['mysterious', 'artistic', 'patient'],
            background: 'Regular customer with hidden depths',
            appearance: 'Intriguing presence, expressive hands, vintage style'
          }
        ],
        episodes: [
          {
            id: 'ep1',
            title: 'First Meeting',
            beats: [
              {
                id: 'beat1',
                title: 'Morning Routine',
                description: 'Alex opens the coffee shop for another ordinary day',
                location: 'Coffee Shop',
                dialogue: 'Another quiet morning... I wonder if that regular customer will come in today.'
              },
              {
                id: 'beat2',
                title: 'Unexpected Conversation',
                description: 'Jordan strikes up a conversation about the book Alex is reading',
                location: 'Coffee Shop',
                dialogue: 'I noticed you reading that book yesterday. What do you think of the author\'s perspective on solitude?'
              }
            ],
            choices: [
              {
                id: 'choice1',
                text: 'Share your thoughts openly',
                consequence: 'Jordan seems genuinely interested in your perspective'
              },
              {
                id: 'choice2', 
                text: 'Ask about their favorite books instead',
                consequence: 'Jordan smiles and begins sharing their literary passions'
              }
            ]
          }
        ]
      }
    },
    {
      id: 'shadow_hunters',
      title: 'Shadow Hunters Academy',
      description: 'Students with supernatural abilities train to protect the world from ancient threats',
      author: 'Mystery Creator',
      genre: ['Action', 'Supernatural', 'School'],
      rating: 4.6,
      chapters: 8,
      views: 28756,
      likes: 5672,
      thumbnail: '/api/scenes/academy.jpg',
      status: 'ongoing',
      lastUpdated: '2025-01-16',
      scaffoldData: {
        title: 'Shadow Hunters Academy',
        description: 'A supernatural academy where students learn to fight ancient threats',
        characters: [
          {
            id: 'char_1',
            name: 'Kai',
            role: 'protagonist',
            personality: ['determined', 'loyal', 'impulsive'],
            background: 'New student with mysterious shadow powers',
            appearance: 'Dark hair, intense eyes, academy uniform'
          }
        ],
        episodes: [
          {
            id: 'ep1',
            title: 'Entrance Exam',
            beats: [
              {
                id: 'beat1',
                title: 'Academy Gates',
                description: 'Kai arrives at the imposing academy gates',
                location: 'Academy Entrance',
                dialogue: 'This place is enormous... I hope I\'m ready for what\'s inside.'
              }
            ]
          }
        ]
      }
    },
    {
      id: 'digital_dreams',
      title: 'Digital Dreams',
      description: 'In a world where consciousness can be uploaded, what defines humanity?',
      author: 'Tech Visionary',
      genre: ['Sci-Fi', 'Drama', 'Philosophical'],
      rating: 4.9,
      chapters: 12,
      views: 45623,
      likes: 8934,
      thumbnail: '/api/scenes/cyberpunk_city.jpg',
      status: 'completed',
      lastUpdated: '2025-01-10',
      scaffoldData: {
        title: 'Digital Dreams',
        description: 'Exploring consciousness in a digital age',
        characters: [
          {
            id: 'char_1',
            name: 'Zara',
            role: 'protagonist',
            personality: ['analytical', 'questioning', 'empathetic'],
            background: 'Neural interface designer questioning the nature of consciousness',
            appearance: 'Cybernetic augmentations, thoughtful expression'
          }
        ],
        episodes: [
          {
            id: 'ep1',
            title: 'Upload Protocol',
            beats: [
              {
                id: 'beat1',
                title: 'The Lab',
                description: 'Zara prepares for the first consciousness transfer test',
                location: 'Research Laboratory',
                dialogue: 'Once we cross this threshold, there\'s no going back. Are we ready to redefine what it means to be human?'
              }
            ]
          }
        ]
      }
    }
  ]);

  const genres = ['all', 'Romance', 'Action', 'Sci-Fi', 'Supernatural', 'Slice of Life', 'Drama', 'School', 'Philosophical'];

  const filteredManga = publishedManga.filter(manga => {
    const matchesSearch = manga.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         manga.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         manga.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || manga.genre.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const handleReadManga = (manga: PublishedManga) => {
    setSelectedManga(manga);
    setShowReader(true);
  };

  if (showReader && selectedManga) {
    return (
      <MangaReader 
        mangaData={selectedManga.scaffoldData}
        onClose={() => {
          setShowReader(false);
          setSelectedManga(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-indigo-950 dark:to-purple-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manga Library</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover and read interactive manga created by the community
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search manga..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre}>
                    {genre === 'all' ? 'All Genres' : genre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Manga Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredManga.map((manga, index) => (
            <motion.div
              key={manga.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                <CardHeader className="p-0">
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-t-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-purple-600 dark:text-purple-400 opacity-50" />
                    </div>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute top-2 right-2">
                      <Badge variant={manga.status === 'completed' ? 'default' : manga.status === 'ongoing' ? 'secondary' : 'destructive'}>
                        {manga.status}
                      </Badge>
                    </div>
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {manga.genre.slice(0, 2).map(genre => (
                        <Badge key={genre} variant="outline" className="text-xs bg-white/80 dark:bg-black/80">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">
                        {manga.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        by {manga.author}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {manga.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {manga.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {manga.chapters}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {manga.likes.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {manga.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {manga.lastUpdated}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleReadManga(manga)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 group-hover:scale-105 transition-transform"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Reading
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {filteredManga.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No manga found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or browse different genres
            </p>
          </div>
        )}
      </div>
    </div>
  );
}