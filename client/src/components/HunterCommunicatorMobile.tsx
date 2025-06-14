import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  X, 
  MessageCircle, 
  Bell, 
  Send, 
  User, 
  MapPin,
  XIcon
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
  photoUrl?: string;
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

interface HunterCommunicatorMobileProps {
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
  chaHaeInAvatar?: string;
  pendingPhotoDelivery?: {
    type: 'intimate';
    context: string;
    imageUrl?: string;
  };
}

export function HunterCommunicatorMobile({
  isVisible,
  onClose,
  onQuestAccept,
  onNewMessage,
  onActivityProposed,
  onQuestDecline,
  playerLocation = "entrance",
  timeOfDay = "afternoon",
  chaHaeInState,
  activeQuests = [],
  episodeAlerts = [],
  chaHaeInAvatar,
  pendingPhotoDelivery
}: HunterCommunicatorMobileProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'messages' | 'alerts'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'no_signal'>('connected');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const defaultChaState: CharacterState = {
    status: 'available',
    activity: 'Training at association',
    location: 'Hunter Association',
    affectionLevel: 75,
    lastActiveTime: new Date()
  };

  const chaState = chaHaeInState || defaultChaState;

  // Initialize conversations and alerts
  useEffect(() => {
    const initConversations: Conversation[] = [
      {
        id: 'cha-haein',
        participantId: 'cha-haein',
        participantName: 'Cha Hae-In',
        participantAvatar: chaHaeInAvatar || '👩‍⚔️',
        lastMessage: {
          id: 'msg-1',
          senderId: 'cha-haein',
          senderName: 'Cha Hae-In',
          content: 'Just thinking of you. Be safe in there.',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: false,
          state: 'delivered'
        },
        unreadCount: 1,
        messages: []
      }
    ];

    setConversations(initConversations);
    setSystemAlerts(episodeAlerts);
  }, [chaHaeInAvatar, episodeAlerts]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!currentInput.trim() || !selectedConversation) return;
    
    onNewMessage(selectedConversation, currentInput);
    setCurrentInput('');
    
    // Simulate typing response
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const canSendMessages = selectedConversation && connectionStatus === 'connected';

  if (!isVisible) return <></>;

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl flex flex-col z-50"
      style={{
        backdropFilter: 'blur(40px) saturate(180%)',
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(15,23,42,0.95))'
      }}
    >
      {/* Mobile Header */}
      <div 
        className="flex items-center justify-between p-6 relative z-20 border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
          backdropFilter: 'blur(32px)',
        }}
      >
        <div className="flex items-center gap-4">
          <Shield 
            className="w-8 h-8" 
            style={{
              color: '#60a5fa',
              filter: 'drop-shadow(0 0 12px rgba(96,165,250,0.6))'
            }}
          />
          <div>
            <h2 
              className="text-2xl font-bold text-white"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
              }}
            >
              Hunter's Communicator
            </h2>
            <div className="flex items-center gap-3 text-base text-slate-300">
              <div 
                className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}
                style={{
                  boxShadow: connectionStatus === 'connected' 
                    ? '0 0 12px rgba(34,197,94,0.8)'
                    : '0 0 12px rgba(239,68,68,0.8)'
                }}
              />
              <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                {connectionStatus === 'connected' ? 'Connected' : 'No Signal'}
              </span>
              {playerLocation && (
                <>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{playerLocation}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={onClose}
          className="text-white hover:bg-white/10 p-3"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Mobile Tab Navigation */}
      <div 
        className="flex border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 px-6 py-6 flex items-center justify-center gap-3 transition-all duration-300 ${
            activeTab === 'messages'
              ? 'text-blue-300 border-b-2 border-blue-400'
              : 'text-slate-400'
          }`}
          style={{
            textShadow: activeTab === 'messages' 
              ? '0 0 15px rgba(147,197,253,0.6)'
              : '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-lg font-medium">Messages</span>
          {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
            <span 
              className="bg-purple-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center"
              style={{
                boxShadow: '0 0 15px rgba(147,51,234,0.8)'
              }}
            >
              {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 px-6 py-6 flex items-center justify-center gap-3 transition-all duration-300 ${
            activeTab === 'alerts'
              ? 'text-blue-300 border-b-2 border-blue-400'
              : 'text-slate-400'
          }`}
          style={{
            textShadow: activeTab === 'alerts' 
              ? '0 0 15px rgba(147,197,253,0.6)'
              : '0 1px 2px rgba(0,0,0,0.8)'
          }}
        >
          <Bell className="w-6 h-6" />
          <span className="text-lg font-medium">System Alerts</span>
          {systemAlerts.filter(a => !a.read).length > 0 && (
            <span 
              className="bg-red-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center"
              style={{
                boxShadow: '0 0 15px rgba(239,68,68,0.8)'
              }}
            >
              {systemAlerts.filter(a => !a.read).length}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'messages' ? (
          selectedConversation ? (
            /* Chat View */
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div 
                className="p-6 border-b border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                      backdropFilter: 'blur(15px)',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {selectedConversationData?.participantAvatar ? (
                      <img 
                        src={selectedConversationData.participantAvatar} 
                        alt={selectedConversationData.participantName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 
                      className="text-2xl font-semibold text-white"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                    >
                      {selectedConversationData?.participantName}
                    </h3>
                    <div className="flex items-center gap-2 text-base text-slate-300">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          chaState.status === 'available' ? 'bg-green-400' : 
                          chaState.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}
                        style={{
                          boxShadow: chaState.status === 'available' 
                            ? '0 0 8px rgba(34,197,94,0.8)'
                            : '0 0 8px rgba(234,179,8,0.8)'
                        }}
                      />
                      <span>{chaState.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-8"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  backdropFilter: 'blur(30px)',
                }}
              >
                {selectedConversationData?.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-5 ${message.senderId === 'player' ? 'flex-row-reverse' : ''}`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {message.senderId === 'player' ? '🛡️' : selectedConversationData.participantAvatar}
                    </div>
                    <div className={`flex-1 ${message.senderId === 'player' ? 'items-end' : ''}`}>
                      <div 
                        className={`px-6 py-4 rounded-3xl max-w-[85%] ${
                          message.senderId === 'player' 
                            ? 'ml-auto bg-blue-600/80' 
                            : 'bg-white/10'
                        }`}
                        style={{
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                        }}
                      >
                        <p 
                          className="text-lg text-white leading-relaxed"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {message.content}
                        </p>
                      </div>
                      <div className={`mt-2 px-2 ${message.senderId === 'player' ? 'text-right' : ''}`}>
                        <span 
                          className="text-sm text-slate-400"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-5"
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.08))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      {selectedConversationData?.participantAvatar}
                    </div>
                    <div 
                      className="px-6 py-4 rounded-3xl bg-white/10"
                      style={{
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div 
                            key={i}
                            className="w-3 h-3 rounded-full bg-blue-400 animate-bounce"
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              boxShadow: '0 0 8px rgba(96,165,250,0.6)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Message Input */}
              <div 
                className="p-6 border-t border-white/10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {connectionStatus === 'no_signal' ? (
                  <div 
                    className="text-center py-6 rounded-3xl border border-red-500/30"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))',
                      backdropFilter: 'blur(15px)',
                    }}
                  >
                    <div className="flex items-center justify-center gap-3 text-red-300">
                      <XIcon className="w-6 h-6" />
                      <span className="text-lg">No signal - Cannot send messages</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Textarea
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[60px] max-h-32 text-lg text-white placeholder-slate-400 border-0 resize-none"
                      disabled={!canSendMessages}
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                        backdropFilter: 'blur(15px)',
                        border: '2px solid rgba(255,255,255,0.15)',
                        borderRadius: '24px',
                        padding: '20px',
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                      }}
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
                      className="text-white transition-all duration-200 w-16 h-16 rounded-full p-0"
                      style={{
                        background: currentInput.trim() && canSendMessages
                          ? 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(37,99,235,1))'
                          : 'linear-gradient(135deg, rgba(100,116,139,0.5), rgba(71,85,105,0.6))',
                        backdropFilter: 'blur(15px)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: currentInput.trim() && canSendMessages
                          ? '0 0 20px rgba(59,130,246,0.5)'
                          : 'none'
                      }}
                    >
                      <Send className="w-6 h-6" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Conversation List */
            <div className="flex-1 overflow-y-auto p-6">
              <h3 
                className="text-2xl font-semibold text-white mb-8"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                Conversations
              </h3>
              <div className="space-y-6">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className="cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255,255,255,0.15)',
                      borderRadius: '32px',
                      padding: '32px',
                      minHeight: '140px',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div className="flex items-center gap-6">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                          backdropFilter: 'blur(15px)',
                          border: '2px solid rgba(255,255,255,0.2)',
                        }}
                      >
                        {conversation.participantAvatar ? (
                          <img 
                            src={conversation.participantAvatar} 
                            alt={conversation.participantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span 
                            className="font-semibold text-white text-2xl truncate"
                            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                          >
                            {conversation.participantName}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span 
                              className="bg-purple-600 text-white text-base rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0"
                              style={{
                                boxShadow: '0 0 15px rgba(147,51,234,0.8)'
                              }}
                            >
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p 
                          className="text-xl text-slate-300 mb-3 leading-relaxed line-clamp-2"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {conversation.lastMessage.content}
                        </p>
                        <span 
                          className="text-lg text-slate-400"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        ) : (
          /* System Alerts */
          <div className="flex-1 overflow-y-auto p-6">
            <h3 
              className="text-2xl font-semibold text-white mb-8"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
            >
              System Alerts
            </h3>
            <div className="space-y-6">
              {systemAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255,255,255,0.15)',
                    borderRadius: '32px',
                    padding: '32px',
                    minHeight: '120px',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  <div className="flex items-start gap-6">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                        alert.type === 'quest' ? 'bg-purple-600/80' : 
                        alert.type === 'announcement' ? 'bg-blue-600/80' : 'bg-gray-600/80'
                      }`}
                      style={{
                        backdropFilter: 'blur(15px)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        boxShadow: `0 0 15px ${
                          alert.type === 'quest' ? 'rgba(147,51,234,0.6)' : 
                          alert.type === 'announcement' ? 'rgba(59,130,246,0.6)' : 'rgba(107,114,128,0.6)'
                        }`
                      }}
                    >
                      <Bell className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 
                        className="font-semibold text-white text-xl mb-2"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                      >
                        {alert.title}
                      </h4>
                      <p 
                        className="text-lg text-slate-300 mb-3 leading-relaxed"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {alert.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-base text-slate-400"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {formatTimestamp(alert.timestamp)}
                        </span>
                        {!alert.read && (
                          <span 
                            className="bg-red-600 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center"
                            style={{ boxShadow: '0 0 10px rgba(239,68,68,0.6)' }}
                          >
                            !
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}