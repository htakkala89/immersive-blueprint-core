import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Wand2, 
  Download, 
  Copy, 
  Save, 
  X, 
  Sparkles,
  Eye,
  Code,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NarrativeArchitectAIProps {
  isVisible: boolean;
  onClose: () => void;
}

export function NarrativeArchitectAI({ isVisible, onClose }: NarrativeArchitectAIProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'library'>('create');
  const [directorsBrief, setDirectorsBrief] = useState('');
  const [generatedBlueprint, setGeneratedBlueprint] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedEpisodes, setSavedEpisodes] = useState<Array<{
    id: string;
    title: string;
    description: string;
    created: Date;
    json: string;
  }>>([]);

  const examplePrompts = [
    "Create a romantic first date episode where the player and Cha Hae-In visit N Seoul Tower. The player needs to buy a love padlock beforehand, and the episode should end with their first kiss overlooking the city.",
    "Design a mystery episode where a strange A-Rank gate appears with unusual energy readings. The player and Cha Hae-In must investigate together, leading to a boss battle against an Echo Phantom that tests their relationship.",
    "Build a cozy home life episode where the player and Cha Hae-In spend a quiet evening cooking dinner together, watching a movie, and having deep conversations about their future.",
    "Create an action-packed training episode where the player and Cha Hae-In practice new combat techniques together, unlocking a powerful synergy attack through trust and coordination."
  ];

  const generateEpisodeBlueprint = async () => {
    if (!directorsBrief.trim()) return;
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-episode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          directorsBrief,
          playerLevel: 10,
          affectionLevel: 50
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          alert('AI service requires GOOGLE_API_KEY to generate episodes. Please provide the Google API key to enable episode generation.');
          setIsGenerating(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to generate episode');
      }

      const data = await response.json();
      setGeneratedBlueprint(JSON.stringify(data.episode, null, 2));
      setIsGenerating(false);

    } catch (error) {
      console.error('Episode generation failed:', error);
      alert('Failed to generate episode. Please try again.');
      setIsGenerating(false);
    }
  };

  const saveEpisode = async () => {
    if (!generatedBlueprint) return;
    
    try {
      const episode = JSON.parse(generatedBlueprint);
      
      const response = await fetch('/api/save-episode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          episodeData: episode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save episode');
      }

      const data = await response.json();
      
      const newEpisode = {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        created: new Date(),
        json: generatedBlueprint
      };
      
      setSavedEpisodes(prev => [...prev, newEpisode]);
      alert(`Episode saved successfully! ${data.message}`);
      
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save episode. Please check your JSON format.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedBlueprint);
    alert('Episode JSON copied to clipboard!');
  };

  const downloadEpisode = () => {
    if (!generatedBlueprint) return;
    
    try {
      const episode = JSON.parse(generatedBlueprint);
      const blob = new Blob([generatedBlueprint], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${episode.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error: Invalid JSON format');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-7xl h-full bg-gradient-to-b from-gray-900 to-black p-6 overflow-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-400 flex items-center">
            <Wand2 className="w-8 h-8 mr-3" />
            Narrative Architect AI
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <X />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'create', label: 'Episode Builder', icon: Wand2 },
            { id: 'preview', label: 'Preview & Edit', icon: Eye },
            { id: 'library', label: 'Episode Library', icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            {/* Left Pane: Director's Briefing */}
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Director's Briefing
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Describe the story you want to create in natural language. The AI will transform your vision into a complete episode blueprint.
                </p>
                
                <textarea
                  value={directorsBrief}
                  onChange={(e) => setDirectorsBrief(e.target.value)}
                  placeholder="Example: Create a romantic evening where the player and Cha Hae-In have dinner at a rooftop restaurant, share their first dance under the stars, and exchange meaningful gifts..."
                  className="w-full h-64 bg-gray-700 text-white p-4 rounded-lg border border-gray-600 focus:border-purple-500 outline-none resize-none"
                />
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-gray-500 text-xs">
                    {directorsBrief.length}/1000 characters
                  </span>
                  <Button
                    onClick={generateEpisodeBlueprint}
                    disabled={!directorsBrief.trim() || isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Episode Blueprint
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Example Prompts */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Example Story Ideas</h4>
                <div className="space-y-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setDirectorsBrief(prompt)}
                      className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 text-sm transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane: Episode Blueprint */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Episode Blueprint
                </h3>
                {generatedBlueprint && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      variant="outline"
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={downloadEpisode}
                      size="sm"
                      variant="outline" 
                      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={saveEpisode}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                )}
              </div>
              
              {generatedBlueprint ? (
                <textarea
                  value={generatedBlueprint}
                  onChange={(e) => setGeneratedBlueprint(e.target.value)}
                  className="w-full h-[calc(100vh-320px)] bg-gray-900 text-green-400 p-4 rounded-lg border border-gray-600 font-mono text-sm resize-none"
                  style={{ fontFamily: 'Monaco, Consolas, monospace' }}
                />
              ) : (
                <div className="h-[calc(100vh-320px)] bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Generated episode JSON will appear here</p>
                    <p className="text-sm mt-2">Enter your story vision and click Generate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="bg-gray-800 rounded-lg p-6 h-[calc(100vh-200px)]">
            <h3 className="text-xl font-bold text-white mb-4">Episode Preview</h3>
            {generatedBlueprint ? (
              <div className="space-y-4">
                <div className="text-gray-300">
                  <p>Interactive preview of your generated episode will be displayed here.</p>
                  <p className="text-sm mt-2">This would show a visual representation of the story beats, character interactions, and player choices.</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Generate an episode first to see the preview</p>
              </div>
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="bg-gray-800 rounded-lg p-6 h-[calc(100vh-200px)]">
            <h3 className="text-xl font-bold text-white mb-4">Episode Library</h3>
            {savedEpisodes.length > 0 ? (
              <div className="space-y-4">
                {savedEpisodes.map((episode) => (
                  <div key={episode.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white">{episode.title}</h4>
                        <p className="text-gray-400 text-sm">{episode.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Created: {episode.created.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setGeneratedBlueprint(episode.json)}
                          size="sm"
                          variant="outline"
                          className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No saved episodes yet</p>
                <p className="text-sm mt-2">Generated episodes will appear here when saved</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}