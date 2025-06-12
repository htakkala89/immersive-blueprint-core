import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Eye,
  Send,
  Sparkles,
  Heart,
  Moon,
  Camera,
  Edit3,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SparkleEffect } from '@/components/SparkleEffect';
import { MysticalEye } from '@/components/MysticalEye';

interface IntimateActivitySystem5Props {
  isVisible: boolean;
  onClose: () => void;
  activityId: string;
  activityTitle: string;
  backgroundImage?: string;
  onSceneComplete: (memory: any) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'character';
  content: string;
  timestamp: Date;
  intimacyLevel?: number;
}

interface NarrativeLensState {
  isVisible: boolean;
  isActive: boolean;
  generatedPrompt: string;
  userPrompt: string;
  isGenerating: boolean;
  generatedImage?: string;
  showFullscreen: boolean;
}

export function IntimateActivitySystem5({
  isVisible,
  onClose,
  activityId,
  activityTitle,
  backgroundImage,
  onSceneComplete
}: IntimateActivitySystem5Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [narrativeLens, setNarrativeLens] = useState<NarrativeLensState>({
    isVisible: false,
    isActive: false,
    generatedPrompt: '',
    userPrompt: '',
    isGenerating: false,
    showFullscreen: false
  });
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize the scene
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      initializeIntimateScene();
    }
  }, [isVisible]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Check for narrative lens visibility
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'character') {
      checkForIntimateContent(lastMessage.content);
    }
  }, [messages]);

  const initializeIntimateScene = () => {
    const welcomeMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'character',
      content: getInitialSceneText(activityId),
      timestamp: new Date(),
      intimacyLevel: 1
    };
    setMessages([welcomeMessage]);
  };

  const getInitialSceneText = (activityId: string): string => {
    const sceneTexts: Record<string, string> = {
      // Shower-specific scenes
      'shower_together': '*Steam fills the luxurious bathroom as warm water cascades down. Cha Hae-In stands before you, water droplets glistening on her skin, her blonde hair darkened and flowing. She reaches for your hand with a shy yet trusting smile.* "The water feels perfect... and being here with you feels even more perfect." *Her cheeks are flushed, whether from the heat or intimacy, you cannot tell.*',
      
      // Bedroom-specific scenes  
      'bedroom_intimacy': '*The bedroom is bathed in soft moonlight filtering through sheer curtains. Cha Hae-In sits on the edge of the bed, her violet eyes meeting yours with a mixture of desire and vulnerability.* "I\'ve been thinking about this moment... about us." *She pats the space beside her gently, her voice filled with tender invitation.*',
      'bedroom_passionate': '*Candles flicker throughout the bedroom, casting warm golden light across the silk sheets. Cha Hae-In moves gracefully toward you, her nightgown flowing like liquid silk.* "Tonight, I want to show you how much you mean to me..." *Her voice carries deep emotion and unmistakable desire.*',
      
      // Kitchen-specific scenes
      'kitchen_intimacy': '*The kitchen counter is cool against your back as Cha Hae-In steps closer, trapping you between her arms. The scent of her perfume mingles with the lingering aroma of dinner.* "Cooking together was nice... but I had something else in mind for dessert." *Her eyes sparkle with mischief and growing passion.*',
      
      // Living room/cuddle scenes
      'cuddle_together': '*The living room is cozy and intimate, lit only by the city lights streaming through the windows. Cha Hae-In curls up against you on the sofa, her head resting on your shoulder.* "This is my favorite place... right here in your arms." *She tilts her head up to look at you, love shining in her violet eyes.*',
      
      // Generic intimate scenes (fallbacks)
      'intimate_evening': '*The apartment is softly lit by candles, creating dancing shadows on the walls. Cha Hae-In moves closer to you on the couch, her eyes reflecting the warm light as she gently places her hand on yours.* "Jin-Woo... tonight feels different. Special." *Her voice is barely above a whisper, filled with anticipation and trust.*',
      'morning_together': '*Sunlight filters through the curtains as you wake up next to Cha Hae-In. She stirs softly, her hair catching the golden morning light. Her eyes flutter open and find yours, a gentle smile spreading across her face.* "Good morning, my love. I could wake up like this every day..." *She moves closer, her warmth radiating against you.*',
      'private_moment': '*The world outside seems to fade away as you find yourselves alone in the quiet intimacy of your shared space. Cha Hae-In looks at you with eyes full of love and desire, her fingers tracing gentle patterns on your skin.* "I want to be close to you... completely close."'
    };
    
    return sceneTexts[activityId] || sceneTexts.intimate_evening;
  };

  const checkForIntimateContent = (content: string) => {
    // AI-powered intimacy detection (simplified for demo)
    const intimateKeywords = [
      'close', 'touch', 'kiss', 'embrace', 'desire', 'passion', 'intimate', 
      'together', 'feel', 'warmth', 'skin', 'body', 'love', 'tender'
    ];
    
    const hasIntimateContent = intimateKeywords.some(keyword => 
      content && content.toLowerCase().includes(keyword)
    );
    
    if (hasIntimateContent && !narrativeLens.isVisible) {
      setNarrativeLens(prev => ({ ...prev, isVisible: true }));
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      content: currentInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      // Call the unrestricted chat API for intimate scenes
      const response = await fetch('/api/chat-intimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          chatHistory: messages.slice(-10), // Last 10 messages for context
          activityId,
          intimacyMode: true
        })
      });

      const data = await response.json();
      
      const characterMessage: ChatMessage = {
        id: `msg-${Date.now()}-character`,
        type: 'character',
        content: data.response,
        timestamp: new Date(),
        intimacyLevel: data.intimacyLevel || 1
      };

      setMessages(prev => [...prev, characterMessage]);
    } catch (error) {
      console.error('Error sending intimate message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const activateNarrativeLens = async () => {
    setNarrativeLens(prev => ({ ...prev, isActive: true }));
    
    // Generate initial prompt from scene context
    try {
      const response = await fetch('/api/generate-narrative-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: messages.slice(-5),
          activityId,
          userPrompt: "A beautiful romantic moment between Sung Jin-Woo and Cha Hae-In"
        })
      });

      const data = await response.json();
      setNarrativeLens(prev => ({
        ...prev,
        generatedPrompt: data.prompt,
        userPrompt: data.prompt
      }));
    } catch (error) {
      console.error('Error generating narrative prompt:', error);
    }
  };

  const generateIntimateImage = async () => {
    if (!narrativeLens.userPrompt.trim()) return;

    setNarrativeLens(prev => ({ ...prev, isGenerating: true }));

    try {
      // First generate an artistic prompt using the new engine
      const promptResponse = await fetch('/api/generate-narrative-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: messages.slice(-5),
          activityId,
          userPrompt: narrativeLens.userPrompt
        })
      });

      const promptData = await promptResponse.json();
      
      const response = await fetch('/api/generate-novelai-intimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptData.prompt || narrativeLens.userPrompt,
          activityId,
          stylePreset: 'manhwa_intimate'
        })
      });

      const data = await response.json();
      console.log('NovelAI response received:', { hasImageUrl: !!data.imageUrl, hasFallback: !!data.fallbackText });
      
      if (data.imageUrl) {
        console.log('✅ NovelAI image received:', data.imageUrl);
        
        // Handle both file URLs and base64 data URLs
        if (data.imageUrl.startsWith('data:image/')) {
          // Base64 data URL - convert to blob for better browser handling
          try {
            const base64Data = data.imageUrl.replace('data:image/png;base64,', '');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            const blobUrl = URL.createObjectURL(blob);
            
            setNarrativeLens(prev => ({
              ...prev,
              generatedImage: blobUrl,
              showFullscreen: true,
              isGenerating: false
            }));
          } catch (blobError) {
            console.error('❌ Blob conversion failed:', blobError);
            setNarrativeLens(prev => ({
              ...prev,
              generatedImage: data.imageUrl,
              showFullscreen: true,
              isGenerating: false
            }));
          }
        } else {
          // File URL - use directly
          setNarrativeLens(prev => ({
            ...prev,
            generatedImage: data.imageUrl,
            showFullscreen: true,
            isGenerating: false
          }));
        }
      } else if (data.fallbackText) {
        // Handle fallback text when image generation fails
        const fallbackMessage = {
          id: Date.now().toString(),
          type: 'character' as const,
          content: data.fallbackText,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
        setNarrativeLens(prev => ({
          ...prev,
          isActive: false,
          isGenerating: false,
          userPrompt: ''
        }));
      } else {
        throw new Error('No image or fallback text received');
      }
    } catch (error) {
      console.error('Error generating intimate image:', error);
      
      // Provide fallback message in case of complete failure
      const fallbackMessage = {
        id: Date.now().toString(),
        type: 'character' as const,
        content: "The intimate moment unfolds beautifully between us, filled with tender passion and deep connection.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
      setNarrativeLens(prev => ({ 
        ...prev, 
        isGenerating: false,
        isActive: false,
        userPrompt: ''
      }));
    }
  };

  const appendSuggestion = (suggestion: string) => {
    setNarrativeLens(prev => ({
      ...prev,
      userPrompt: prev.userPrompt + ' ' + suggestion
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSuggestionPrompts = () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type === 'user') return [];

    // Generate contextual prompts based on conversation flow
    const response = lastMessage.content.toLowerCase();
    
    if (response.includes('blush') || response.includes('shy')) {
      return [
        "*I gently touch your cheek*",
        "You look beautiful when you blush",
        "*I move closer to you*"
      ];
    }
    
    if (response.includes('kiss') || response.includes('lips')) {
      return [
        "*I deepen the kiss*",
        "*My hands find your waist*",
        "I've wanted this for so long"
      ];
    }
    
    if (response.includes('close') || response.includes('together')) {
      return [
        "*I pull you against me*",
        "I love feeling you so close",
        "*I whisper in your ear*"
      ];
    }
    
    if (response.includes('want') || response.includes('need')) {
      return [
        "I want you too",
        "*I show you how much I care*",
        "Tell me what you desire"
      ];
    }

    // Default intimate prompts
    return [
      "*I caress your face gently*",
      "You mean everything to me",
      "*I hold you close*"
    ];
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9999]"
      >
        {/* Intimate Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>

        {/* Close Button */}
        <div className="absolute top-6 left-6 z-10">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="bg-black/40 backdrop-blur-xl text-white/80 hover:bg-white/10 border border-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Activity Title */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-black/40 backdrop-blur-xl rounded-xl px-6 py-3 border border-white/20">
            <h2 className="text-white text-lg font-medium">{activityTitle}</h2>
          </div>
        </div>

        {/* Chat Interface - Identical to System 2 */}
        <div className="absolute inset-x-6 bottom-6 top-24 flex flex-col">
          {/* Messages Container - Same as System 2 Scene Script Format */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar mb-6 space-y-4"
          >
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start items-start gap-4'}`}
              >
                {message.type === 'character' && (
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
                
                <div
                  className={`max-w-3xl ${
                    message.type === 'user'
                      ? 'text-right text-white/90 italic' // Scene Script format for user
                      : 'text-white bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/10' // Standard dialogue for character
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start items-start gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="bg-black/20 backdrop-blur-sm text-white border border-white/10 rounded-2xl p-4">
                  <div className="text-white/60 text-sm">Responding...</div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Dynamic Thought Prompts - Same as System 2 */}
          {messages.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {getSuggestionPrompts().map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => setCurrentInput(suggestion)}
                    variant="ghost"
                    className="bg-black/30 backdrop-blur-sm text-white/80 hover:bg-white/10 border border-white/20 text-sm px-4 py-2"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area - Unified Text Input identical to System 2 */}
          <div className="relative">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4">
              <div className="flex gap-3 items-end">
                <Textarea
                  ref={textareaRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your actions, dialogue, or thoughts..."
                  className="flex-1 bg-transparent border-none resize-none text-white placeholder-white/60 focus:ring-0 min-h-[60px] max-h-[120px]"
                  rows={3}
                />
                
                <div className="flex gap-2">
                  {/* Narrative Lens Button - Static effects only */}
                  <button
                    onClick={activateNarrativeLens}
                    className="text-pink-400 hover:bg-pink-500/30 border border-pink-400/50 relative overflow-hidden backdrop-blur-sm p-2 rounded-lg bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 shadow-lg shadow-pink-500/30"
                    title="Visualize Scene"
                  >
                    <Eye className="w-5 h-5 relative z-10" />
                  </button>
                  
                  <Button
                    onClick={sendMessage}
                    disabled={!currentInput.trim() || isTyping}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Lens Modal */}
        <AnimatePresence>
          {narrativeLens.isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              onClick={() => setNarrativeLens(prev => ({ ...prev, isActive: false }))}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-2xl mx-4 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white text-xl font-bold flex items-center gap-2">
                    <SparkleEffect intensity="medium" color="pink" className="w-8 h-8">
                      <Eye className="w-6 h-6 text-pink-400" />
                    </SparkleEffect>
                    Narrative Lens
                  </h3>
                  <Button
                    onClick={() => setNarrativeLens(prev => ({ ...prev, isActive: false }))}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Main Prompt Editor */}
                <div className="mb-6">
                  <label className="text-white/80 text-sm mb-2 block">Scene Description</label>
                  <Textarea
                    value={narrativeLens.userPrompt || ''}
                    onChange={(e) => setNarrativeLens(prev => ({ ...prev, userPrompt: e.target.value }))}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/60 rounded-xl p-4 min-h-[120px]"
                    placeholder="Describe the intimate scene you'd like to visualize..."
                  />
                </div>

                {/* Dynamic Suggestion Prompts */}
                <div className="mb-6">
                  <label className="text-white/80 text-sm mb-3 block">Enhancement Suggestions</label>
                  <div className="grid grid-cols-1 gap-2">
                    {getSuggestionPrompts().map((suggestion, index) => (
                      <Button
                        key={index}
                        onClick={() => appendSuggestion(suggestion)}
                        variant="ghost"
                        className="justify-start text-left bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 w-full"
                      >
                        <Sparkles className="w-4 h-4 mr-2 text-pink-400" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <SparkleEffect intensity="medium" color="purple" className="w-full">
                  <Button
                    onClick={generateIntimateImage}
                    disabled={!narrativeLens.userPrompt?.trim() || narrativeLens.isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {narrativeLens.isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Visualize Scene
                      </>
                    )}
                  </Button>
                </SparkleEffect>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fullscreen Image Display */}
        {narrativeLens.showFullscreen && narrativeLens.generatedImage && (
          <div 
            className="fixed inset-0 bg-black flex items-center justify-center z-[9999] p-4"
            onClick={() => {
              console.log('Closing fullscreen image');
              setNarrativeLens(prev => ({ ...prev, showFullscreen: false }));
            }}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={narrativeLens.generatedImage}
                alt="Generated intimate scene"
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: '95vw',
                  maxHeight: '95vh'
                }}
                onLoad={(e) => {
                  console.log('✅ Image loaded successfully');
                  const img = e.target as HTMLImageElement;
                  console.log('✅ Image dimensions:', img.naturalWidth, 'x', img.naturalHeight);
                }}
                onError={(e) => {
                  console.error('❌ Image failed to load:', e);
                  console.error('❌ Error details:', (e.target as HTMLImageElement).src?.substring(0, 100));
                }}
              />
              
              {/* Close button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setNarrativeLens(prev => ({ ...prev, showFullscreen: false }));
                }}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white border-white/30"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}