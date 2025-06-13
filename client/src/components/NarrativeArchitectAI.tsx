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
      // Construct the meta-prompt for AI generation
      const metaPrompt = `
        You are the Narrative Architect AI for a Solo Leveling romance game. Generate a complete episode JSON based on the creator's vision.

        CREATOR'S VISION:
        ${directorsBrief}

        SYSTEM API MANUAL:
        Available Commands:
        - DELIVER_MESSAGE(target_system, sender, message_content) - Send messages via communicator
        - ACTIVATE_QUEST(quest_id, quest_title, quest_description) - Create new quest
        - SET_CHA_MOOD(mood) - Set Cha Hae-In's emotional state (happy, anxious, focused_professional, romantic, excited, worried, confident)
        - FORCE_CHA_LOCATION(location_id, reason) - Move Cha Hae-In to specific location
        - START_DIALOGUE_SCENE(dialogue_id, scene_context) - Begin dialogue sequence
        - SET_QUEST_OBJECTIVE(quest_id, objective_text) - Add quest objective
        - LOAD_DUNGEON_ENVIRONMENT(dungeon_id, difficulty) - Load raid environment
        - START_BOSS_BATTLE(boss_id, environment) - Initiate boss fight
        - REWARD_PLAYER(rewards: {gold, experience, items, affection}) - Give rewards
        - CREATE_MEMORY_STAR(star_id, description, rank) - Create memory star (C, B, A, S, SS)
        - UNLOCK_ACTIVITY(activity_id, permanent) - Unlock new activities
        - SET_LOCATION(location_id, time_of_day, weather) - Change scene location
        - SHOW_NOTIFICATION(title, message, notification_type) - Display UI notification

        Completion Conditions:
        - player_accept - Player accepts quest
        - dialogue_complete - Dialogue scene finished
        - boss_defeated - Specific boss defeated
        - location_visited - Player visits location
        - item_obtained - Player gets specific item
        - activity_completed - Activity finished
        - end_episode - Episode complete

        EXAMPLE TEMPLATE:
        {
          "id": "EP01_Red_Echo",
          "title": "Echoes of the Red Gate",
          "description": "A mysterious A-Rank gate appears with strange energy readings.",
          "prerequisite": {
            "player_level": 25,
            "affection_level": 50
          },
          "beats": [
            {
              "beat_id": "1.0",
              "title": "Emergency Alert",
              "description": "The Hunter Association sends urgent alert",
              "trigger": { "type": "immediate" },
              "actions": [
                {
                  "type": "DELIVER_MESSAGE",
                  "target_system": "communicator",
                  "sender": "Hunter Association",
                  "message_content": "URGENT: Investigate A-Rank gate anomaly immediately."
                }
              ],
              "completion_condition": {
                "type": "player_accept",
                "target": "EP01_Red_Echo"
              }
            }
          ]
        }

        Generate a complete episode JSON following this structure, with 3-5 story beats that tell a compelling narrative based on the creator's vision.
      `;

      // For now, generate a sample response since we don't have AI API
      setTimeout(() => {
        const sampleEpisode = {
          "id": `EP_${Date.now()}`,
          "title": "Generated Episode",
          "description": directorsBrief.substring(0, 100) + "...",
          "prerequisite": {
            "player_level": 10,
            "affection_level": 30
          },
          "beats": [
            {
              "beat_id": "1.0", 
              "title": "Episode Beginning",
              "description": "The story begins based on your vision",
              "trigger": { "type": "immediate" },
              "actions": [
                {
                  "type": "DELIVER_MESSAGE",
                  "target_system": "communicator", 
                  "sender": "Cha Hae-In",
                  "message_content": "I have an idea for something special we could do together..."
                },
                {
                  "type": "SET_CHA_MOOD",
                  "mood": "excited"
                }
              ],
              "completion_condition": {
                "type": "player_accept",
                "target": `EP_${Date.now()}`
              }
            },
            {
              "beat_id": "2.0",
              "title": "Story Development", 
              "description": "The main story unfolds",
              "trigger": { "type": "previous_beat_complete" },
              "actions": [
                {
                  "type": "START_DIALOGUE_SCENE",
                  "dialogue_id": "custom_scene_01"
                }
              ],
              "completion_condition": {
                "type": "dialogue_complete",
                "target": "custom_scene_01"
              }
            },
            {
              "beat_id": "3.0",
              "title": "Episode Conclusion",
              "description": "The story reaches its satisfying conclusion", 
              "trigger": { "type": "previous_beat_complete" },
              "actions": [
                {
                  "type": "REWARD_PLAYER",
                  "rewards": {
                    "affection": 10,
                    "experience": 100
                  }
                },
                {
                  "type": "CREATE_MEMORY_STAR",
                  "star_id": `memory_${Date.now()}`,
                  "description": "A special moment created together",
                  "rank": "A"
                }
              ],
              "completion_condition": {
                "type": "end_episode"
              }
            }
          ]
        };

        setGeneratedBlueprint(JSON.stringify(sampleEpisode, null, 2));
        setIsGenerating(false);
      }, 2000);

    } catch (error) {
      console.error('Episode generation failed:', error);
      setIsGenerating(false);
    }
  };

  const saveEpisode = () => {
    if (!generatedBlueprint) return;
    
    try {
      const episode = JSON.parse(generatedBlueprint);
      const newEpisode = {
        id: episode.id,
        title: episode.title,
        description: episode.description,
        created: new Date(),
        json: generatedBlueprint
      };
      
      setSavedEpisodes(prev => [...prev, newEpisode]);
      
      // Show success notification
      alert('Episode saved successfully!');
    } catch (error) {
      alert('Error: Invalid JSON format');
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