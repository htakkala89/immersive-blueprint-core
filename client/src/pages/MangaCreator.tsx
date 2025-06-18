import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, Palette, Users, Zap, Eye, Package, Wand2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { MangaReader } from '@/components/MangaReader';

interface MangaResult {
  success: boolean;
  scaffold?: any;
  error?: string;
}

export default function MangaCreator() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('');
  const [setting, setSetting] = useState('');
  const [targetLength, setTargetLength] = useState('medium');
  const [matureContent, setMatureContent] = useState(false);
  const [result, setResult] = useState<MangaResult | null>(null);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
  const [generatedAssets, setGeneratedAssets] = useState<string[]>([]);
  const [showReader, setShowReader] = useState(false);

  const createManga = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/blueprint/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data);
    }
  });

  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    createManga.mutate({
      prompt,
      genre: genre || 'adventure',
      setting: setting || 'modern',
      targetLength,
      matureContent
    });
  };

  const generateVisualAssets = async () => {
    if (!result?.scaffold) return;
    
    setIsGeneratingAssets(true);
    const assets = [];
    
    try {
      // Generate character reference sheets
      for (const character of result.scaffold.characters) {
        const response = await fetch('/api/generate-novelai-intimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activityId: 'manga_character_sheet',
            relationshipStatus: 'character_design',
            intimacyLevel: 1,
            customPrompt: `manga character reference sheet, ${character.background}, ${character.appearance}, multiple expressions and poses, clean line art style`
          })
        });
        
        const data = await response.json();
        if (data.imageUrl) {
          assets.push(data.imageUrl);
        }
      }
      
      // Generate key scene illustrations
      const scenePrompt = `manga panel layout, ${result.scaffold.title} key scene, ${result.scaffold.characters[0]?.name} and ${result.scaffold.characters[1]?.name}, detailed manga art style`;
      const sceneResponse = await fetch('/api/generate-novelai-intimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: 'manga_scene',
          relationshipStatus: 'story_illustration',
          intimacyLevel: 1,
          customPrompt: scenePrompt
        })
      });
      
      const sceneData = await sceneResponse.json();
      if (sceneData.imageUrl) {
        assets.push(sceneData.imageUrl);
      }
      
      setGeneratedAssets(assets);
    } catch (error) {
      console.error('Error generating assets:', error);
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const downloadManga = () => {
    if (!result?.scaffold) return;
    
    const mangaData = {
      title: result.scaffold.title,
      characters: result.scaffold.characters,
      episodes: result.scaffold.episodes,
      visualAssets: generatedAssets,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(mangaData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.scaffold.title.replace(/\s+/g, '_')}_manga.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (showReader && result?.scaffold) {
    return (
      <MangaReader 
        mangaData={result.scaffold}
        onClose={() => setShowReader(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Manga Creator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Transform your ideas into interactive manga using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Creation Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Create Your Manga
              </CardTitle>
              <CardDescription>
                Describe your story idea and we'll create a complete manga structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Story Concept</label>
                <Textarea
                  placeholder="A mysterious transfer student arrives at a magic academy and discovers they have unique powers that could save or destroy the world..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Genre</label>
                  <Input
                    placeholder="e.g., fantasy, romance, action"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Setting</label>
                  <Input
                    placeholder="e.g., modern Japan, medieval"
                    value={setting}
                    onChange={(e) => setSetting(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Length</label>
                <Select value={targetLength} onValueChange={setTargetLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (1-3 chapters)</SelectItem>
                    <SelectItem value="medium">Medium (4-8 chapters)</SelectItem>
                    <SelectItem value="long">Long (9+ chapters)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!prompt.trim() || createManga.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {createManga.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Manga...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Create Manga
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Your Manga
              </CardTitle>
              <CardDescription>
                Generated manga structure and characters
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createManga.isPending && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-600" />
                    <p className="text-gray-600 dark:text-gray-300">
                      Creating your manga with AI...
                    </p>
                  </div>
                </div>
              )}

              {result?.success && result.scaffold && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {result.scaffold.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {result.scaffold.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Characters ({result.scaffold.characters.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {result.scaffold.characters.map((char: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{char.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {char.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {char.background}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Episodes: {result.scaffold.episodes.length}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Each episode contains multiple story beats with interactive choices
                    </div>
                  </div>

                  {/* Visual Assets Section */}
                  {generatedAssets.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Generated Visual Assets</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {generatedAssets.map((asset, index) => (
                          <img
                            key={index}
                            src={asset}
                            alt={`Generated asset ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={generateVisualAssets}
                        disabled={isGeneratingAssets}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {isGeneratingAssets ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Palette className="w-4 h-4 mr-2" />
                            Generate Art
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowReader(true)}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview Reader
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={downloadManga}
                        variant="outline"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Download Files
                      </Button>
                      <Button
                        onClick={() => setResult(null)}
                        variant="outline"
                      >
                        Create Another
                      </Button>
                    </div>
                    
                    <Button
                      className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      onClick={() => {
                        alert(`${result.scaffold.title} is ready for publication! You can now:\n\n• Share with readers\n• Submit to manga platforms\n• Continue developing chapters\n• Export for print production`);
                      }}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Publish Manga
                    </Button>
                  </div>
                </div>
              )}

              {result?.error && (
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400">
                    Error creating manga: {result.error}
                  </p>
                </div>
              )}

              {!result && !createManga.isPending && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Enter your story idea above to create a manga
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <h3 className="font-semibold mb-2">Story Generation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                AI creates complete story structures with characters and plot
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Palette className="w-12 h-12 mx-auto mb-4 text-pink-600" />
              <h3 className="font-semibold mb-2">Visual Design</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Character designs and scene layouts ready for illustration
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold mb-2">Interactive Elements</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Choice systems and relationship tracking built in
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}