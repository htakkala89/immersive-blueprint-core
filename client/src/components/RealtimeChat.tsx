import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Send, Image, Mic, Camera, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface ChatMessage {
  id: string;
  sender: 'user' | 'hae-in';
  text: string;
  timestamp: Date;
  imageUrl?: string;
  emotion?: string;
  affectionChange?: number;
}

interface RealtimeChatProps {
  gameState?: any;
  isVisible: boolean;
  onClose: () => void;
  onAffectionChange?: (change: number) => void;
}

export function RealtimeChat({ gameState, isVisible, onClose, onAffectionChange }: RealtimeChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'hae-in',
      text: "Jin-Woo... you wanted to talk? I'm glad you're here.",
      timestamp: new Date(),
      emotion: 'gentle'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { speak, speaking, stop } = useSpeechSynthesis();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Chat response mutation with AI and image generation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat-with-hae-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          gameState,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          sessionId: gameState?.sessionId || 'default'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'hae-in',
        text: data.response,
        timestamp: new Date(),
        imageUrl: data.imageUrl,
        emotion: data.emotion,
        affectionChange: data.affectionChange
      };

      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);

      // Handle affection changes
      if (data.affectionChange && onAffectionChange) {
        onAffectionChange(data.affectionChange);
      }

      // Text-to-speech for Hae-In's responses
      if (data.response) {
        speak(data.response, {
          rate: 0.9,
          pitch: 1.1,
          volume: 0.8
        });
      }
    },
    onError: () => {
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send to AI
    chatMutation.mutate(inputText);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'happy': return 'text-yellow-400';
      case 'shy': return 'text-pink-400';
      case 'loving': return 'text-red-400';
      case 'excited': return 'text-orange-400';
      case 'gentle': return 'text-blue-400';
      default: return 'text-purple-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
              <AvatarImage src="/placeholder-hae-in.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold">CH</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-white font-semibold text-lg drop-shadow-sm">Cha Hae-In</h3>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Heart 
                    key={i} 
                    className={`w-3 h-3 ${i < (gameState?.affection || 3) ? 'text-red-400 fill-current drop-shadow-sm' : 'text-white/30'}`} 
                  />
                ))}
                <span className="text-xs text-white/70 ml-1 drop-shadow-sm">
                  {gameState?.affection || 3}/5
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0 backdrop-blur-sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  
                  {/* Message bubble */}
                  <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-xl border transition-all duration-300 ${
                    message.sender === 'user' 
                      ? 'bg-blue-500/20 backdrop-blur-2xl text-white border-blue-400/30 ml-4' 
                      : 'bg-white/15 backdrop-blur-2xl text-white border-white/20 mr-4'
                  }`}>
                    
                    {/* Image if present */}
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated scene" 
                          className="rounded-lg max-w-full h-auto"
                        />
                      </div>
                    )}
                    
                    {/* Text */}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    
                    {/* Emotion and affection indicators */}
                    {message.sender === 'hae-in' && (message.emotion || message.affectionChange) && (
                      <div className="flex items-center space-x-2 mt-2">
                        {message.emotion && (
                          <Badge variant="secondary" className={`text-xs ${getEmotionColor(message.emotion)}`}>
                            {message.emotion}
                          </Badge>
                        )}
                        {message.affectionChange && (
                          <Badge variant="secondary" className="text-xs text-red-400">
                            +{message.affectionChange} ❤️
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <p className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/15 backdrop-blur-2xl text-white rounded-2xl p-4 border border-white/20 mr-4 shadow-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0 backdrop-blur-sm"
              title="Voice message"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-10 h-10 p-0 backdrop-blur-sm"
              title="Request image"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder-white/50 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-white/30 focus:border-transparent"
              disabled={chatMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || chatMutation.isPending}
              className="bg-blue-500/30 backdrop-blur-xl hover:bg-blue-500/40 text-white border border-blue-400/30 rounded-full w-12 h-12 p-0 shadow-lg transition-all duration-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick action buttons */}
          <div className="flex space-x-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputText("How was your day?")}
              className="text-xs bg-white/5 backdrop-blur-md border-white/20 text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4 py-2"
            >
              Daily Chat
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputText("I missed you")}
              className="text-xs bg-white/5 backdrop-blur-md border-white/20 text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4 py-2"
            >
              Romantic
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInputText("Want to go on a mission together?")}
              className="text-xs bg-white/5 backdrop-blur-md border-white/20 text-white/70 hover:text-white hover:bg-white/10 rounded-full px-4 py-2"
            >
              Mission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}