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

interface HunterCommunicatorSystem15Props {
  isVisible: boolean;
  onClose: () => void;
  onQuestAccept: (questId: string) => void;
  onNewMessage: (conversationId: string, message: string) => void;
}

export function HunterCommunicatorSystem15({
  isVisible,
  onClose,
  onQuestAccept,
  onNewMessage
}: HunterCommunicatorSystem15Props) {
  const [activeTab, setActiveTab] = useState<'messages' | 'alerts'>('messages');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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
          read: true
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
    },
    {
      id: 'woo_jin_chul',
      participantId: 'woo_jin_chul',
      participantName: 'Woo Jin-Chul',
      participantAvatar: '👨‍💼',
      unreadCount: 0,
      lastMessage: {
        id: 'msg_2',
        senderId: 'player',
        senderName: 'Jin-Woo',
        content: 'Thanks for the briefing. I\'ll handle it.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true
      },
      messages: [
        {
          id: 'msg_2',
          senderId: 'player',
          senderName: 'Jin-Woo',
          content: 'Thanks for the briefing. I\'ll handle it.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true
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
    },
    {
      id: 'announcement_001',
      title: 'System Maintenance Scheduled',
      sender: 'System Admin',
      content: 'Hunter ranking system will undergo maintenance tonight from 2:00 AM to 4:00 AM KST.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      type: 'announcement',
      read: true
    },
    {
      id: 'system_001',
      title: 'New S-Rank Hunter Registered',
      sender: 'Hunter Association',
      content: 'A new S-Rank hunter has been officially registered. Current S-Rank count: 12 worldwide.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: 'system',
      read: true
    }
  ]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [selectedConversation, conversations]);

  const sendMessage = async () => {
    if (!currentInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: 'player',
      senderName: 'Jin-Woo',
      content: currentInput,
      timestamp: new Date(),
      read: true
    };

    // Add message to conversation
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: newMessage
        };
      }
      return conv;
    }));

    onNewMessage(selectedConversation, currentInput);
    setCurrentInput('');
    setIsTyping(true);

    // Simulate asynchronous response delay
    setTimeout(() => {
      setIsTyping(false);
      // In real implementation, this would be handled by the backend
    }, Math.random() * 3000 + 2000); // 2-5 second delay
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
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const acceptQuest = (alertId: string) => {
    onQuestAccept(alertId);
    markAlertAsRead(alertId);
    setSelectedAlert(null);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentAlert = systemAlerts.find(a => a.id === selectedAlert);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl h-full max-h-[90vh] bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              {(selectedConversation || selectedAlert) && (
                <Button
                  onClick={() => {
                    setSelectedConversation(null);
                    setSelectedAlert(null);
                  }}
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <MessageCircle className="w-6 h-6 text-purple-400" />
              <h2 className="text-white text-xl font-bold">
                {selectedConversation ? currentConversation?.participantName :
                 selectedAlert ? 'System Alert' : 'Hunter\'s Communicator'}
              </h2>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-white/60 hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {!selectedConversation && !selectedAlert && (
              <>
                {/* Tab Navigation */}
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex-1 px-6 py-4 text-center transition-all ${
                      activeTab === 'messages'
                        ? 'text-white bg-white/5 border-b-2 border-purple-400'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Messages
                      {conversations.some(c => c.unreadCount > 0) && (
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      )}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('alerts')}
                    className={`flex-1 px-6 py-4 text-center transition-all ${
                      activeTab === 'alerts'
                        ? 'text-white bg-white/5 border-b-2 border-purple-400'
                        : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Bell className="w-5 h-5" />
                      System Alerts
                      {systemAlerts.some(a => !a.read) && (
                        <div className="w-2 h-2 bg-red-400 rounded-full" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {activeTab === 'messages' && (
                    <div className="p-4 space-y-2">
                      {conversations.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedConversation(conversation.id);
                            markConversationAsRead(conversation.id);
                          }}
                          className="bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                              {conversation.participantAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-white font-medium">
                                  {conversation.participantName}
                                </h3>
                                <span className="text-white/40 text-sm">
                                  {formatTimestamp(conversation.lastMessage.timestamp)}
                                </span>
                              </div>
                              <p className="text-white/60 text-sm truncate">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'alerts' && (
                    <div className="p-4 space-y-2">
                      {systemAlerts.map((alert) => (
                        <motion.div
                          key={alert.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedAlert(alert.id);
                            markAlertAsRead(alert.id);
                          }}
                          className={`bg-white/5 hover:bg-white/10 rounded-xl p-4 cursor-pointer transition-all border ${
                            alert.read ? 'border-white/10' : 'border-purple-400/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              alert.type === 'quest' ? 'bg-yellow-500/20 text-yellow-400' :
                              alert.type === 'announcement' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {alert.type === 'quest' ? <Shield className="w-5 h-5" /> :
                               alert.type === 'announcement' ? <Bell className="w-5 h-5" /> :
                               <User className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-medium ${alert.read ? 'text-white/80' : 'text-white'}`}>
                                  {alert.title}
                                </h3>
                                <span className="text-white/40 text-sm">
                                  {formatTimestamp(alert.timestamp)}
                                </span>
                              </div>
                              <p className="text-white/50 text-sm mb-1">{alert.sender}</p>
                              <p className="text-white/60 text-sm line-clamp-2">
                                {alert.content}
                              </p>
                            </div>
                            {!alert.read && (
                              <div className="w-3 h-3 bg-red-400 rounded-full" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Chat View */}
            {selectedConversation && currentConversation && (
              <div className="flex-1 flex flex-col">
                {/* Messages */}
                <div 
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
                >
                  {currentConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'player' ? 'justify-end' : 'justify-start items-start gap-4'}`}
                    >
                      {message.senderId !== 'player' && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                          {currentConversation.participantAvatar}
                        </div>
                      )}
                      
                      <div
                        className={`max-w-2xl ${
                          message.senderId === 'player'
                            ? 'text-right text-white/90 italic'
                            : 'text-white bg-black/20 backdrop-blur-sm p-3 rounded-2xl border border-white/10'
                        }`}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                        <div className="text-white/40 text-xs mt-1">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">
                        {currentConversation.participantAvatar}
                      </div>
                      <div className="bg-black/20 backdrop-blur-sm text-white border border-white/10 rounded-2xl p-3">
                        <div className="text-white/60 text-sm">Responding...</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-3">
                    <div className="flex gap-3 items-end">
                      <Textarea
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-none resize-none text-white placeholder-white/60 focus:ring-0 min-h-[40px] max-h-[120px]"
                        rows={2}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!currentInput.trim() || isTyping}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Detail View */}
            {selectedAlert && currentAlert && (
              <div className="flex-1 flex flex-col p-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-white text-xl font-bold mb-4">{currentAlert.title}</h3>
                  
                  <div className="flex items-center gap-4 mb-4 text-white/60">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {currentAlert.sender}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatTimestamp(currentAlert.timestamp)}
                    </div>
                  </div>

                  <p className="text-white/80 mb-6 leading-relaxed">{currentAlert.content}</p>

                  {currentAlert.questData && (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                      <h4 className="text-white font-semibold mb-3">Quest Details</h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-white/60">Rank:</span>
                          <span className="text-white ml-2 font-medium">{currentAlert.questData.rank}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Reward:</span>
                          <span className="text-yellow-400 ml-2 font-medium">
                            ₩{currentAlert.questData.reward.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex items-center gap-2 text-white/60 mb-1">
                          <MapPin className="w-4 h-4" />
                          Location
                        </div>
                        <span className="text-white">{currentAlert.questData.location}</span>
                      </div>
                      <div>
                        <div className="text-white/60 mb-1">Description</div>
                        <p className="text-white/80 text-sm leading-relaxed">
                          {currentAlert.questData.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentAlert.type === 'quest' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => acceptQuest(currentAlert.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept Quest
                      </Button>
                      <Button
                        onClick={() => setSelectedAlert(null)}
                        variant="ghost"
                        className="flex-1 text-white/60 hover:bg-white/10"
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}