import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Heart, MessageCircle, User, Coffee, 
  Gift, Eye, Sparkles, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DialogueMessage {
  id: string;
  speaker: 'player' | 'cha_hae_in';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'shy' | 'surprised' | 'content' | 'flirty';
}

interface ChaHaeInDialogueProps {
  isVisible: boolean;
  onClose: () => void;
  chaState: {
    location: string;
    activity: string;
    expression: string;
    affectionLevel: number;
    status: string;
    currentMood: string;
  };
  timeOfDay: string;
  onAffectionChange: (change: number) => void;
}

export function ChaHaeInDialogue({ 
  isVisible, 
  onClose, 
  chaState, 
  timeOfDay,
  onAffectionChange 
}: ChaHaeInDialogueProps) {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thoughtPrompts, setThoughtPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate contextual thought prompts based on situation
  useEffect(() => {
    if (isVisible) {
      generateThoughtPrompts();
      if (messages.length === 0) {
        initiateConversation();
      }
    }
  }, [isVisible, chaState.location, chaState.activity]);

  const generateThoughtPrompts = () => {
    const prompts = [];
    
    // Location-based prompts
    if (chaState.location === 'hongdae_cafe') {
      prompts.push("Ask about her coffee preference");
      prompts.push("Comment on the cozy atmosphere");
      prompts.push("Suggest trying the dessert menu");
    }
    
    // Activity-based prompts
    if (chaState.activity === 'reading_menu') {
      prompts.push("Offer to help her decide");
      prompts.push("Ask what she's in the mood for");
    }
    
    // Mood-based prompts
    if (chaState.currentMood === 'content') {
      prompts.push("Ask about her day");
      prompts.push("Share something interesting");
    }
    
    // Time-based prompts
    if (timeOfDay === 'evening') {
      prompts.push("Ask about her evening plans");
      prompts.push("Suggest spending time together");
    }
    
    setThoughtPrompts(prompts.slice(0, 3));
  };

  const initiateConversation = () => {
    const greeting = generateContextualGreeting();
    const welcomeMessage: DialogueMessage = {
      id: Date.now().toString(),
      speaker: 'cha_hae_in',
      content: greeting,
      timestamp: new Date(),
      emotion: 'content'
    };
    setMessages([welcomeMessage]);
  };

  const generateContextualGreeting = (): string => {
    const greetings = {
      hongdae_cafe: {
        reading_menu: "Oh, Jin-Woo! Perfect timing. I was just trying to decide what to order. Any recommendations?",
        waiting: "I was wondering when you'd show up. Come, sit with me.",
        default: "Jin-Woo! What brings you here? This place has such a nice atmosphere, doesn't it?"
      },
      default: "Hey there, Jin-Woo. Good to see you."
    };

    const locationGreetings = greetings[chaState.location as keyof typeof greetings] || greetings.default;
    if (typeof locationGreetings === 'string') return locationGreetings;
    
    return locationGreetings[chaState.activity as keyof typeof locationGreetings] || locationGreetings.default;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add player message
    const playerMessage: DialogueMessage = {
      id: Date.now().toString(),
      speaker: 'player',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, playerMessage]);
    setCurrentInput('');
    setIsTyping(true);

    try {
      // Build conversation context
      const conversationHistory = messages.slice(-6).map(msg => 
        `${msg.speaker === 'player' ? 'Jin-Woo' : 'Cha Hae-In'}: ${msg.content}`
      ).join('\n');

      const context = `You are Cha Hae-In from Solo Leveling. You're having a conversation with Sung Jin-Woo.

Current situation:
- Location: ${chaState.location.replace('_', ' ')}
- Activity: ${chaState.activity.replace('_', ' ')}
- Your mood: ${chaState.currentMood}
- Time: ${timeOfDay}
- Affection level: ${chaState.affectionLevel}/100

Recent conversation:
${conversationHistory}

Jin-Woo just said: "${content}"

Respond as Cha Hae-In would - professional but warm, strong but caring. Keep responses natural and conversational, around 1-2 sentences. Show your personality based on the current situation and mood.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          context: context,
          character: 'cha_hae_in'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add AI response
        const aiMessage: DialogueMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'cha_hae_in',
          content: data.response,
          timestamp: new Date(),
          emotion: determineEmotion(data.response)
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Update affection based on conversation quality
        const affectionChange = calculateAffectionChange(content, data.response);
        if (affectionChange !== 0) {
          onAffectionChange(affectionChange);
        }
      }
    } catch (error) {
      console.error('Failed to get AI response:', error);
      // Fallback response
      const fallbackMessage: DialogueMessage = {
        id: (Date.now() + 1).toString(),
        speaker: 'cha_hae_in',
        content: "I'm having trouble finding the right words right now. Could you say that again?",
        timestamp: new Date(),
        emotion: 'content'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      generateThoughtPrompts();
    }
  };

  const determineEmotion = (response: string): 'happy' | 'shy' | 'surprised' | 'content' | 'flirty' => {
    if (response.includes('laugh') || response.includes('smile') || response.includes('!')) return 'happy';
    if (response.includes('blush') || response.includes('...')) return 'shy';
    if (response.includes('really?') || response.includes('wow')) return 'surprised';
    if (response.includes('tease') || response.includes('wink')) return 'flirty';
    return 'content';
  };

  const calculateAffectionChange = (playerMessage: string, aiResponse: string): number => {
    // Simple affection calculation based on conversation quality
    if (playerMessage.toLowerCase().includes('beautiful') || 
        playerMessage.toLowerCase().includes('amazing')) return 2;
    if (playerMessage.toLowerCase().includes('like') || 
        playerMessage.toLowerCase().includes('enjoy')) return 1;
    if (aiResponse.includes('thank you') || aiResponse.includes('sweet')) return 1;
    return 0;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.1), rgba(0,0,0,0.8))',
        backdropFilter: 'blur(20px) saturate(180%)'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">차</span>
              </div>
              <div>
                <h3 className="text-white text-lg font-bold">Cha Hae-In</h3>
                <p className="text-slate-300 text-sm">{chaState.activity.replace('_', ' ')} • {chaState.currentMood}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-pink-400">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{chaState.affectionLevel}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.speaker === 'player' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                message.speaker === 'player'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                <p className="text-sm">{message.content}</p>
                {message.speaker === 'cha_hae_in' && message.emotion && (
                  <div className="mt-2 text-xs opacity-60">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {message.emotion}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 border border-white/20 p-4 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Thought Prompts */}
        {thoughtPrompts.length > 0 && (
          <div className="px-6 py-3 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {thoughtPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 rounded-full border border-purple-500/30 transition-colors"
                  disabled={isTyping}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-white/10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(currentInput);
            }}
            className="flex gap-3"
          >
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!currentInput.trim() || isTyping}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}