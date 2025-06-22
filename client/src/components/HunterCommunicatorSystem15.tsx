import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, X, Users, Zap } from 'lucide-react';

// Enhanced Message Types
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  state?: 'sent' | 'delivered' | 'read';
  isUrgent?: boolean;
  proposedActivity?: {
    type: string;
    location: string;
    time: string;
  };
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

interface SystemAlert {
  id: string;
  title: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'quest' | 'announcement' | 'system';
  read: boolean;
  questData?: {
    rank: string;
    type: string;
    reward: number;
    location: string;
    description: string;
    longDescription: string;
    objectives: Array<{
      id: string;
      description: string;
      completed: boolean;
    }>;
    timeLimit?: number;
    difficulty: number;
    estimatedDuration: number;
    isUrgent: boolean;
    guildSupport: boolean;
  };
}

interface CharacterState {
  status: 'available' | 'busy' | 'sleeping' | 'in_raid' | 'in_meeting' | 'no_signal';
  activity: string;
  location: string;
  affectionLevel: number;
  lastActiveTime: Date;
}

interface HunterCommunicatorSystem15Props {
  isVisible: boolean;
  onClose: () => void;
  onQuestAccept: (questData: any) => void;
  onNewMessage: (conversationId: string, message: string) => void;
  onActivityProposed?: (activity: any) => void;
  onQuestDecline?: (questId: string) => void;
  playerLocation?: string;
  timeOfDay?: string;
  chaHaeInState?: CharacterState;
  activeQuests?: any[];
  episodeAlerts?: SystemAlert[];
}

// Enhanced cinematic message parsing function for premium script formatting
const parseCinematicMessage = (content: string) => {
  const parts = [];
  
  // Split content by double line breaks to maintain server-side formatting
  const segments = content.split('\n\n').filter(segment => segment.trim());
  
  for (const segment of segments) {
    const trimmed = segment.trim();
    
    // Check for dialogue (quoted text)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      parts.push({
        type: 'dialogue',
        text: trimmed.slice(1, -1) // Remove quotes
      });
    }
    // Check for actions (asterisk text)
    else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      parts.push({
        type: 'action',
        text: trimmed.slice(1, -1) // Remove asterisks
      });
    }
    // Check for thoughts (parentheses text)
    else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
      parts.push({
        type: 'thought',
        text: trimmed.slice(1, -1) // Remove parentheses
      });
    }
    // Default to narrative for other content
    else if (trimmed.length > 0) {
      parts.push({
        type: 'narrative',
        text: trimmed
      });
    }
  }
  
  return parts;
};

export function HunterCommunicatorSystem15({
  isVisible,
  onClose,
  onQuestAccept,
  onNewMessage,
  onActivityProposed,
  onQuestDecline,
  playerLocation = "Hunter Association",
  timeOfDay = "afternoon",
  chaHaeInState,
  activeQuests = [],
  episodeAlerts = []
}: HunterCommunicatorSystem15Props): JSX.Element {
  
  // State Management
  const [selectedConversation, setSelectedConversation] = useState<string>('cha-hae-in');
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Alert system moved to notification bell
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  
  // Enhanced mobile viewport handling
  const [viewportHeight, setViewportHeight] = useState('100vh');
  
  // References
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Default character state
  const defaultChaState: CharacterState = {
    status: 'available',
    activity: 'Training at Hunter Association',
    location: 'Hunter Association - Training Grounds',
    affectionLevel: 75,
    lastActiveTime: new Date()
  };

  const chaState = chaHaeInState || defaultChaState;

  // Sample conversations with enhanced data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'cha-hae-in',
      participantId: 'cha-hae-in',
      participantName: 'Cha Hae-In',
      participantAvatar: '⚔️',
      unreadCount: 0,
      lastMessage: {
        id: 'msg-1',
        senderId: 'cha-hae-in',
        senderName: 'Cha Hae-In',
        content: '"Good afternoon. Are you ready for today\'s training session?" *adjusts her sword stance with practiced precision* (I hope he\'s been keeping up with his conditioning...)',
        timestamp: new Date(Date.now() - 300000),
        read: true
      },
      messages: [
        {
          id: 'msg-1',
          senderId: 'cha-hae-in',
          senderName: 'Cha Hae-In',
          content: '"Good afternoon. Are you ready for today\'s training session?" *adjusts her sword stance with practiced precision* (I hope he\'s been keeping up with his conditioning...)',
          timestamp: new Date(Date.now() - 300000),
          read: true
        }
      ]
    }
  ]);

  // Episode alerts are now handled by the main game system to prevent duplicates

  // Quick response suggestions
  const quickResponses = [
    "How are you doing?",
    "Want to train together?",
    "Any interesting raids lately?",
    "Free for coffee later?"
  ];

  // Mobile viewport handling
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      setViewportHeight(`${window.innerHeight}px`);
    };

    const handleVisualViewport = () => {
      if (window.visualViewport) {
        const vh = window.visualViewport.height * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        setViewportHeight(`${window.visualViewport.height}px`);
      }
    };

    window.addEventListener('resize', handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewport);
    }

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewport);
      }
    };
  }, []);

  // Enhanced auto-scroll with mobile keyboard handling
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      const scrollOptions: ScrollToOptions = {
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      };
      container.scrollTo(scrollOptions);
    }
  }, []);

  // Auto-scroll when messages change or typing status changes
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 100);
    return () => clearTimeout(timer);
  }, [conversations, isTyping, scrollToBottom]);

  // Enhanced message sending with cinematic formatting
  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim()) return;

    const messageText = currentInput.trim();
    setCurrentInput('');

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      senderId: 'player',
      senderName: 'Player',
      content: messageText,
      timestamp: new Date(),
      read: true,
      state: 'sent'
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, messages: [...conv.messages, userMessage], lastMessage: userMessage }
        : conv
    ));

    // Trigger callback
    onNewMessage(selectedConversation, messageText);

    // Simulate typing and AI response
    setIsTyping(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation,
          message: messageText,
          context: {
            playerLocation,
            timeOfDay,
            characterState: chaState,
            activeQuests
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setTimeout(() => {
          setIsTyping(false);
          
          // Create AI response message
          const responseMessage: Message = {
            id: `ai-${Date.now()}`,
            senderId: selectedConversation,
            senderName: 'Cha Hae-In',
            content: data.response || 'I\'m sorry, I didn\'t catch that. Could you repeat?',
            timestamp: new Date(),
            read: false,
            state: 'delivered'
          };

          // Update conversation with AI response
          setConversations(prev => prev.map(conv => 
            conv.id === selectedConversation 
              ? { 
                  ...conv, 
                  messages: [...conv.messages, responseMessage], 
                  lastMessage: responseMessage,
                  unreadCount: conv.unreadCount + 1
                }
              : conv
          ));
        }, 1500 + Math.random() * 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTyping(false);
    }
  }, [currentInput, selectedConversation, onNewMessage, playerLocation, timeOfDay, chaState, activeQuests]);

  // Message parsing for cinematic formatting
  const parseCinematicMessage = (content: string) => {
    const parts: Array<{
      type: 'dialogue' | 'action' | 'thought' | 'narrative';
      text: string;
    }> = [];

    let currentIndex = 0;
    const contentLength = content.length;

    while (currentIndex < contentLength) {
      let nextQuote = content.indexOf('"', currentIndex);
      let nextAsterisk = content.indexOf('*', currentIndex);
      let nextParen = content.indexOf('(', currentIndex);

      // Find the earliest marker
      let earliest = contentLength;
      let earliestType = 'narrative';

      if (nextQuote !== -1 && nextQuote < earliest) {
        earliest = nextQuote;
        earliestType = 'dialogue';
      }
      if (nextAsterisk !== -1 && nextAsterisk < earliest) {
        earliest = nextAsterisk;
        earliestType = 'action';
      }
      if (nextParen !== -1 && nextParen < earliest) {
        earliest = nextParen;
        earliestType = 'thought';
      }

      // Add any narrative text before the marker
      if (earliest > currentIndex) {
        const narrativeText = content.slice(currentIndex, earliest).trim();
        if (narrativeText) {
          parts.push({ type: 'narrative', text: narrativeText });
        }
      }

      if (earliest === contentLength) break;

      // Parse the marked section
      if (earliestType === 'dialogue') {
        const endQuote = content.indexOf('"', earliest + 1);
        if (endQuote !== -1) {
          const dialogueText = content.slice(earliest + 1, endQuote);
          parts.push({ type: 'dialogue', text: dialogueText });
          currentIndex = endQuote + 1;
        } else {
          currentIndex = earliest + 1;
        }
      } else if (earliestType === 'action') {
        const endAsterisk = content.indexOf('*', earliest + 1);
        if (endAsterisk !== -1) {
          const actionText = content.slice(earliest + 1, endAsterisk);
          parts.push({ type: 'action', text: actionText });
          currentIndex = endAsterisk + 1;
        } else {
          currentIndex = earliest + 1;
        }
      } else if (earliestType === 'thought') {
        const endParen = content.indexOf(')', earliest + 1);
        if (endParen !== -1) {
          const thoughtText = content.slice(earliest + 1, endParen);
          parts.push({ type: 'thought', text: thoughtText });
          currentIndex = endParen + 1;
        } else {
          currentIndex = earliest + 1;
        }
      }
    }

    return parts;
  };

  // Get current conversation data
  const selectedConversationData = conversations.find(conv => conv.id === selectedConversation);
  const canSendMessages = connectionStatus === 'connected' && selectedConversationData;

  // Utility functions
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const renderMessageStateIcon = (message: Message) => {
    switch (message.state) {
      case 'sent':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'delivered':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      case 'read':
        return <div className="w-2 h-2 bg-green-400 rounded-full" />;
      default:
        return null;
    }
  };

  // Alert handling moved to notification bell system

  if (!isVisible) return <></>;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Main Chat Interface */}
      <motion.div
        initial={{ x: -400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -400, opacity: 0 }}
        className="flex-1 flex flex-col"
        style={{
          background: 'linear-gradient(135deg, rgba(15,15,30,0.95) 0%, rgba(25,25,50,0.95) 50%, rgba(15,15,30,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          height: viewportHeight,
          maxHeight: viewportHeight
        }}
      >
        {/* Enhanced Header - Optimized for mobile */}
        <div 
          className="shrink-0 p-3 sm:p-6 border-b border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {selectedConversationData?.participantAvatar || '💬'}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {selectedConversationData?.participantName || 'Hunter Communications'}
                </h2>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      chaState.status === 'available' ? 'bg-green-400' :
                      chaState.status === 'busy' ? 'bg-yellow-400' :
                      chaState.status === 'in_raid' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}
                  />
                  <span className="text-slate-300">
                    {chaState.status === 'available' ? 'Available' :
                     chaState.status === 'busy' ? 'Busy' :
                     chaState.status === 'in_raid' ? 'In Raid' :
                     chaState.status === 'sleeping' ? 'Sleeping' :
                     'Offline'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{chaState.location}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={onClose}
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 flex flex-col">
            <AnimatePresence>
              {selectedConversationData && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Messages List - Optimized mobile padding */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-2 sm:p-6 space-y-3 sm:space-y-4"
                    style={{ 
                      scrollBehavior: 'smooth',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {selectedConversationData.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 sm:gap-4 ${message.senderId === 'player' ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar - Smaller on mobile */}
                        <div 
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-xl shrink-0"
                          style={{
                            background: message.senderId === 'player' 
                              ? 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(22,163,74,0.1))'
                              : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                          }}
                        >
                          {message.senderId === 'player' ? '👤' : selectedConversationData.participantAvatar}
                        </div>

                        {/* Message Content - Optimized for mobile */}
                        <div className={`flex-1 max-w-[90%] sm:max-w-[70%] ${message.senderId === 'player' ? 'text-right' : ''}`}>
                          <div 
                            className={`inline-block px-3 py-2 sm:px-4 sm:py-3 rounded-2xl ${
                              message.senderId === 'player' 
                                ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                                : 'bg-black/30 text-white border border-white/10'
                            }`}
                            style={{
                              backdropFilter: 'blur(15px)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                              wordBreak: 'break-word'
                            }}
                          >
                            {message.senderId === 'player' ? (
                              <div 
                                className="text-sm sm:text-base leading-relaxed"
                                style={{
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                  lineHeight: '1.5'
                                }}
                              >
                                {message.content}
                              </div>
                            ) : (
                              // Premium cinematic script formatting per design spec
                              <div className="space-y-4">
                                {parseCinematicMessage(message.content).map((part, index) => (
                                  <div key={index}>
                                    {part.type === 'action' && (
                                      <div 
                                        className="text-slate-300 italic font-light text-sm opacity-75 leading-relaxed mb-4"
                                        style={{
                                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          lineHeight: '1.5',
                                          letterSpacing: '0.005em',
                                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                          padding: '0.75rem 0',
                                          fontWeight: '300'
                                        }}
                                      >
                                        <em>*{part.text}</em>
                                      </div>
                                    )}
                                    {part.type === 'dialogue' && (
                                      <div 
                                        className="text-white font-medium text-base mb-4"
                                        style={{
                                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          lineHeight: '1.5',
                                          letterSpacing: '0.01em',
                                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                          fontSize: '16px',
                                          fontWeight: '400',
                                          color: '#ffffff',
                                          padding: '0.5rem 0'
                                        }}
                                      >
                                        "{part.text}"
                                      </div>
                                    )}
                                    {part.type === 'thought' && (
                                      <div 
                                        className="text-slate-400 italic font-light text-sm opacity-70 leading-relaxed mb-4"
                                        style={{
                                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          lineHeight: '1.5',
                                          letterSpacing: '0.005em',
                                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                                          padding: '0.5rem 0',
                                          fontWeight: '300'
                                        }}
                                      >
                                        <em>(*{part.text}*)</em>
                                      </div>
                                    )}
                                    {part.type === 'narrative' && (
                                      <div 
                                        className="text-slate-300 font-light text-sm leading-relaxed opacity-80 mb-3"
                                        style={{
                                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                          lineHeight: '1.5',
                                          letterSpacing: '0.005em',
                                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                                          padding: '0.25rem 0',
                                          fontWeight: '300'
                                        }}
                                      >
                                        {part.text}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2 px-2">
                            <span 
                              className="text-xs text-slate-400"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              {formatTimestamp(message.timestamp)}
                            </span>
                            {message.senderId === 'player' && renderMessageStateIcon(message)}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Enhanced Typing Indicator - Mobile Optimized */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2 sm:gap-4"
                      >
                        <div 
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                          }}
                        >
                          {selectedConversationData.participantAvatar}
                        </div>
                        <div 
                          className="px-4 py-3 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                            backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                          }}
                        >
                          <div className="flex space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full animate-bounce"
                              style={{ 
                                background: 'rgba(147,197,253,0.6)',
                                boxShadow: '0 0 4px rgba(147,197,253,0.4)'
                              }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full animate-bounce"
                              style={{ 
                                background: 'rgba(147,197,253,0.6)',
                                boxShadow: '0 0 4px rgba(147,197,253,0.4)',
                                animationDelay: '0.1s'
                              }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full animate-bounce"
                              style={{ 
                                background: 'rgba(147,197,253,0.6)',
                                boxShadow: '0 0 4px rgba(147,197,253,0.4)',
                                animationDelay: '0.2s'
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Enhanced Input Area - Optimized for mobile */}
                  <motion.div
                    layout
                    className="shrink-0 border-t border-white/10 p-2 sm:p-6"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    {/* Message Input - Optimized mobile layout */}
                    <div className="relative flex items-end gap-2 sm:gap-3">
                      <Textarea
                        ref={inputRef}
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder={canSendMessages ? "Type your message..." : "Connection lost..."}
                        disabled={!canSendMessages}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 min-h-[44px] max-h-32 resize-none rounded-xl px-4 py-3 text-white placeholder:text-slate-400 text-sm sm:text-base
                                   bg-black/30 border border-white/20 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200
                                   backdrop-blur-sm focus:bg-black/40"
                        style={{
                          lineHeight: '1.4',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                      />
                      
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentInput.trim() || !canSendMessages}
                        size="sm"
                        className="h-11 w-11 rounded-xl p-0 disabled:opacity-30 
                                   bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
                                   border-0 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    {/* Connection Status Indicator */}
                    {!canSendMessages && (
                      <div className="mt-3 flex items-center justify-center gap-2 text-slate-400 text-sm">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span>Reconnecting...</span>
                      </div>
                    )}
                    
                    {/* Quick Response Buttons */}
                    {currentInput.length === 0 && canSendMessages && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 mt-3"
                      >
                        {quickResponses.map((response, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentInput(response)}
                            className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white text-xs px-3 py-1 h-auto"
                          >
                            {response}
                          </Button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  );
}