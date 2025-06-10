import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageCircle,
  Bell,
  Send,
  ArrowLeft,
  Check,
  X as XIcon,
  User,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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
    reward: number;
    location: string;
    description: string;
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
  onQuestAccept: (questId: string) => void;
  onNewMessage: (conversationId: string, message: string) => void;
  onActivityProposed?: (activity: any) => void;
  playerLocation?: string;
  timeOfDay?: string;
  chaHaeInState?: CharacterState;
}

export function HunterCommunicatorSystem15({
  isVisible,
  onClose,
  onQuestAccept,
  onNewMessage,
  onActivityProposed,
  playerLocation,
  timeOfDay,
  chaHaeInState
}: HunterCommunicatorSystem15Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<'messages' | 'alerts'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [canSendMessages, setCanSendMessages] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'no_signal'>('connected');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Default character state if not provided
  const defaultChaState: CharacterState = {
    status: 'available',
    activity: 'reviewing reports at the Association',
    location: 'hunter_association',
    affectionLevel: 25,
    lastActiveTime: new Date()
  };

  const chaState = chaHaeInState || defaultChaState;

  // Message urgency detection
  const detectMessageUrgency = (content: string): boolean => {
    const urgentKeywords = ['help', 'emergency', 'are you okay', 'urgent', 'danger', 'hurt', 'trapped'];
    return urgentKeywords.some(keyword => content.toLowerCase().includes(keyword));
  };

  // Activity proposal detection
  const detectActivityProposal = (content: string): any => {
    const locationKeywords = {
      'hangang park': 'hangang_park',
      'hongdae': 'hongdae_cafe',
      'dinner': 'restaurant',
      'shopping': 'department_store'
    };
    
    const timeKeywords = ['tonight', 'evening', 'morning', 'afternoon', 'later'];
    
    for (const [phrase, location] of Object.entries(locationKeywords)) {
      if (content.toLowerCase().includes(phrase)) {
        const hasTime = timeKeywords.some(time => content.toLowerCase().includes(time));
        return {
          type: 'casual_outing',
          location,
          time: hasTime ? 'evening' : 'flexible'
        };
      }
    }
    return null;
  };

  // AI response timing based on character state
  const calculateResponseDelay = (isUrgent: boolean): number => {
    if (isUrgent) return 30000; // 30 seconds for urgent messages
    
    switch (chaState.status) {
      case 'available':
        return 60000 + Math.random() * 120000; // 1-3 minutes
      case 'busy':
      case 'in_meeting':
        return 1800000 + Math.random() * 3600000; // 30-90 minutes
      case 'in_raid':
        return 3600000 + Math.random() * 7200000; // 1-3 hours
      case 'sleeping':
        return 28800000; // 8 hours until morning
      case 'no_signal':
        return -1; // No response until signal returns
      default:
        return 300000; // 5 minutes default
    }
  };

  // Generate AI response based on context
  const generateAIResponse = (playerMessage: string, isUrgent: boolean, proposedActivity: any): string => {
    if (isUrgent) {
      return "I'm in the middle of something important, but I saw your message. Are you alright? I can step away if you need me.";
    }

    if (proposedActivity) {
      if (chaState.status === 'available') {
        return `That sounds perfect. Let's do it. I could use some time away from work. See you at ${proposedActivity.location} around ${proposedActivity.time}?`;
      } else {
        return `I'd love to, but I'm tied up with ${chaState.activity} right now. Can we reschedule for later?`;
      }
    }

    // Context-aware casual responses
    const casualResponses: Record<string, string[]> = {
      available: [
        "Just finished up here. How's your day going?",
        "I was just thinking about you. Perfect timing.",
        "Finally have a moment to breathe. What's on your mind?"
      ],
      busy: [
        "Quick break between meetings. Miss you.",
        "Swamped with work but wanted to respond. Talk soon?",
        "Busy day, but your message made me smile."
      ],
      in_raid: [
        "Just cleared another floor. Thinking of you keeps me focused.",
        "This dungeon is tougher than expected, but I'm managing.",
        "Almost done here. Can't wait to see you later."
      ],
      sleeping: [
        "Good morning! Just saw your message from last night.",
        "Sorry I was asleep. What did you need?"
      ],
      in_meeting: [
        "Quick break between meetings. Miss you.",
        "Swamped with work but wanted to respond. Talk soon?"
      ],
      no_signal: [
        "Just got signal back. Everything okay?"
      ]
    };

    const responses = casualResponses[chaState.status] || casualResponses.available;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Message state progression
  const updateMessageState = (messageId: string, newState: 'sent' | 'delivered' | 'read') => {
    setConversations(prev => prev.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => 
        msg.id === messageId ? { ...msg, state: newState } : msg
      )
    })));
  };

  // Send message with state tracking
  const sendMessage = async (content: string) => {
    if (!canSendMessages || connectionStatus === 'no_signal') return;

    const isUrgent = detectMessageUrgency(content);
    const proposedActivity = detectActivityProposal(content);
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'player',
      senderName: 'Jin-Woo',
      content,
      timestamp: new Date(),
      read: true,
      state: 'sent',
      isUrgent,
      proposedActivity
    };

    // Add message to conversation
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? {
            ...conv,
            messages: [...conv.messages, newMessage],
            lastMessage: newMessage
          }
        : conv
    ));

    // Progress message states
    setTimeout(() => updateMessageState(newMessage.id, 'delivered'), 1000);
    setTimeout(() => updateMessageState(newMessage.id, 'read'), 5000);

    // Schedule AI response
    const responseDelay = calculateResponseDelay(isUrgent);
    if (responseDelay > 0) {
      setTimeout(() => {
        const aiResponse = generateAIResponse(content, isUrgent, proposedActivity);
        const responseMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          senderId: 'cha_hae_in',
          senderName: 'Cha Hae-In',
          content: aiResponse,
          timestamp: new Date(),
          read: false,
          state: 'delivered'
        };

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

        // Trigger activity proposal if detected
        if (proposedActivity && onActivityProposed) {
          onActivityProposed(proposedActivity);
        }
      }, responseDelay);
    }

    setCurrentInput('');
  };

  // Check connection status based on player location
  useEffect(() => {
    const noSignalLocations = ['deep_dungeon', 'shadow_realm', 'void_space'];
    const hasSignal = !noSignalLocations.includes(playerLocation || '');
    setConnectionStatus(hasSignal ? 'connected' : 'no_signal');
    setCanSendMessages(hasSignal && selectedConversation !== null);
  }, [playerLocation, selectedConversation]);

  // Sample conversations data
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'cha_hae_in',
      participantId: 'cha_hae_in',
      participantName: 'Cha Hae-In',
      participantAvatar: '👩‍⚔️',
      unreadCount: 1,
      lastMessage: {
        id: 'msg_1',
        senderId: 'cha_hae_in',
        senderName: 'Cha Hae-In',
        content: 'Just thinking of you. Be safe in there.',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false
      },
      messages: [
        {
          id: 'msg_0',
          senderId: 'player',
          senderName: 'Jin-Woo',
          content: 'Heading into the dungeon now. See you tonight?',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          read: true,
          state: 'read'
        },
        {
          id: 'msg_1',
          senderId: 'cha_hae_in',
          senderName: 'Cha Hae-In',
          content: 'Just thinking of you. Be safe in there.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false
        }
      ]
    }
  ]);

  // Sample system alerts
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: 'quest_001',
      title: 'Quest Offer: Clear Red Gate in Hongdae District',
      sender: 'Hunter Association',
      content: 'A dangerous B-Rank gate has appeared in the Hongdae entertainment district. Immediate clearance required to prevent civilian casualties.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'quest',
      read: false,
      questData: {
        rank: 'B-Rank',
        reward: 35000000,
        location: 'Hongdae District, Seoul',
        description: 'A red gate has materialized near Hongik University. Initial reconnaissance suggests Orc-type monsters with a possible elite variant. Estimated clearance time: 2-3 hours. Guild support available upon request.'
      }
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedConversation, conversations]);

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !selectedConversation) return;
    await sendMessage(currentInput);
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Render message state icons
  const renderMessageStateIcon = (message: Message) => {
    if (message.senderId !== 'player') return null;
    
    const iconClass = "w-3 h-3 ml-1";
    switch (message.state) {
      case 'sent':
        return <Check className={`${iconClass} text-gray-400`} />;
      case 'delivered':
        return (
          <div className="flex ml-1">
            <Check className="w-3 h-3 text-gray-400" />
            <Check className="w-3 h-3 text-gray-400 -ml-1" />
          </div>
        );
      case 'read':
        return (
          <div className="flex ml-1">
            <Check className="w-3 h-3 text-purple-400" />
            <Check className="w-3 h-3 text-purple-400 -ml-1" />
          </div>
        );
      default:
        return null;
    }
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          unreadCount: 0,
          messages: conv.messages.map(msg => ({ ...msg, read: true }))
        };
      }
      return conv;
    }));
  };

  const markAlertAsRead = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => {
      if (alert.id === alertId) {
        return { ...alert, read: true };
      }
      return alert;
    }));
  };

  const acceptQuest = (questId: string) => {
    onQuestAccept(questId);
    setSelectedAlert(null);
  };

  if (!isVisible) return <></>;

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const selectedAlertData = systemAlerts.find(a => a.id === selectedAlert);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-slate-900 rounded-xl w-full max-w-4xl h-[600px] flex flex-col overflow-hidden shadow-2xl border border-slate-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Hunter's Communicator</h2>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                {connectionStatus === 'connected' ? 'Connected' : 'No Signal'}
                {playerLocation && (
                  <>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{playerLocation}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 bg-slate-800">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'messages' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Messages
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'alerts' 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            System Alerts
            {systemAlerts.filter(a => !a.read).length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {systemAlerts.filter(a => !a.read).length}
              </span>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'messages' ? (
            <>
              {/* Conversation List */}
              <div className="w-1/3 border-r border-slate-700 bg-slate-800">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Conversations</h3>
                  <div className="space-y-2">
                    {conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedConversation(conversation.id);
                          markConversationAsRead(conversation.id);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.id 
                            ? 'bg-blue-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{conversation.participantAvatar}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-white">{conversation.participantName}</span>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-300 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <span className="text-xs text-slate-400">
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedConversationData ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-slate-700 bg-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{selectedConversationData.participantAvatar}</span>
                        <div>
                          <h4 className="font-semibold text-white">{selectedConversationData.participantName}</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <div className={`w-2 h-2 rounded-full ${
                              chaState.status === 'available' ? 'bg-green-400' : 
                              chaState.status === 'busy' || chaState.status === 'in_meeting' ? 'bg-yellow-400' :
                              chaState.status === 'in_raid' ? 'bg-red-400' :
                              chaState.status === 'sleeping' ? 'bg-gray-400' : 'bg-gray-600'
                            }`} />
                            <span className="capitalize">{chaState.status.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{chaState.activity}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                      {selectedConversationData.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === 'player' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === 'player'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-700 text-white rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {renderMessageStateIcon(message)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-slate-700 px-4 py-2 rounded-lg rounded-bl-none">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-slate-700 bg-slate-800">
                      {connectionStatus === 'no_signal' ? (
                        <div className="text-center text-slate-400 py-2">
                          <div className="flex items-center justify-center gap-2">
                            <XIcon className="w-4 h-4" />
                            No signal - Cannot send messages
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Textarea
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder={canSendMessages ? "Type your message..." : "Select a conversation to start messaging"}
                            className="flex-1 min-h-[40px] max-h-32 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                            disabled={!canSendMessages}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          <Button
                            onClick={handleSendMessage}
                            disabled={!currentInput.trim() || !canSendMessages}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center bg-slate-900">
                    <div className="text-center text-slate-400">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* System Alerts Tab */
            <div className="flex-1 flex">
              {/* Alerts List */}
              <div className="w-1/2 border-r border-slate-700 bg-slate-800">
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
                  <div className="space-y-2">
                    {systemAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAlert(alert.id);
                          markAlertAsRead(alert.id);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedAlert === alert.id 
                            ? 'bg-blue-600' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        } ${!alert.read ? 'border-l-4 border-blue-400' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {alert.type === 'quest' && <Shield className="w-4 h-4 text-yellow-400" />}
                              {alert.type === 'announcement' && <Bell className="w-4 h-4 text-blue-400" />}
                              {alert.type === 'system' && <User className="w-4 h-4 text-green-400" />}
                              <span className="font-medium text-white text-sm">{alert.title}</span>
                            </div>
                            <p className="text-xs text-slate-400 mb-1">{alert.sender}</p>
                            <p className="text-sm text-slate-300 line-clamp-2">{alert.content}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-400">
                                {formatTimestamp(alert.timestamp)}
                              </span>
                            </div>
                          </div>
                          {!alert.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alert Detail */}
              <div className="flex-1 bg-slate-900">
                {selectedAlertData ? (
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {selectedAlertData.type === 'quest' && <Shield className="w-6 h-6 text-yellow-400" />}
                      {selectedAlertData.type === 'announcement' && <Bell className="w-6 h-6 text-blue-400" />}
                      {selectedAlertData.type === 'system' && <User className="w-6 h-6 text-green-400" />}
                      <div>
                        <h4 className="text-xl font-bold text-white">{selectedAlertData.title}</h4>
                        <p className="text-sm text-slate-400">From: {selectedAlertData.sender}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800 rounded-lg p-4 mb-6">
                      <p className="text-slate-300 leading-relaxed">{selectedAlertData.content}</p>
                    </div>

                    {selectedAlertData.questData && (
                      <div className="bg-slate-800 rounded-lg p-4 mb-6">
                        <h5 className="text-lg font-semibold text-white mb-3">Quest Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-slate-400">Rank:</span>
                            <p className="text-white font-medium">{selectedAlertData.questData.rank}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-400">Reward:</span>
                            <p className="text-white font-medium">₩{selectedAlertData.questData.reward.toLocaleString()}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-slate-400">Location:</span>
                            <p className="text-white font-medium">{selectedAlertData.questData.location}</p>
                          </div>
                          <div className="md:col-span-2">
                            <span className="text-sm text-slate-400">Description:</span>
                            <p className="text-slate-300 mt-1">{selectedAlertData.questData.description}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedAlertData.type === 'quest' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => acceptQuest(selectedAlertData.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Accept Quest
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedAlert(null)}
                          className="border-slate-600 text-slate-300 hover:bg-slate-800"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select an alert to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}