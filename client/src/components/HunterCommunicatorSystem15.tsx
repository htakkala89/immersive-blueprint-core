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

  // Generate AI response with conversation continuity
  const generateAIResponse = async (playerMessage: string, isUrgent: boolean, proposedActivity: any): Promise<string> => {
    try {
      // Get current conversation history
      const currentConversation = conversations.find(conv => conv.id === selectedConversation);
      const chatHistory = currentConversation?.messages || [];
      
      // Build context for AI
      const contextualPrompt = buildConversationContext(playerMessage, chatHistory, isUrgent, proposedActivity);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextualPrompt,
          characterName: 'Cha Hae-In',
          conversationHistory: chatHistory.slice(-10), // Last 10 messages for context
          characterState: chaState,
          isUrgent,
          proposedActivity,
          communicatorMode: true
        })
      });

      const data = await response.json();
      return data.response || generateFallbackResponse(playerMessage, isUrgent, proposedActivity);
    } catch (error) {
      console.error('Error generating AI response:', error);
      return generateFallbackResponse(playerMessage, isUrgent, proposedActivity);
    }
  };

  // Build conversation context for AI
  const buildConversationContext = (playerMessage: string, chatHistory: Message[], isUrgent: boolean, proposedActivity: any): string => {
    let context = `You are Cha Hae-In from Solo Leveling. You're having an ongoing conversation with Sung Jin-Woo through the Hunter's Communicator. 

Current Status: ${chaState.status}
Current Activity: ${chaState.activity}
Location: ${chaState.location}
Affection Level: ${chaState.affectionLevel}/100
Time: ${timeOfDay}

IMPORTANT: This is a CONTINUING conversation. Maintain natural flow and reference previous messages when appropriate. Don't repeat the same responses.

Recent conversation history:
${chatHistory.slice(-6).map(msg => `${msg.senderName}: ${msg.content}`).join('\n')}

Jin-Woo just said: "${playerMessage}"

${isUrgent ? 'This message seems urgent - respond accordingly.' : ''}
${proposedActivity ? `Jin-Woo proposed an activity: ${JSON.stringify(proposedActivity)}` : ''}

Respond as Cha Hae-In would naturally continue this conversation. Keep it authentic to her character - professional but warm, strong but caring. Vary your responses and build on the conversation history.`;

    return context;
  };

  // Fallback response system
  const generateFallbackResponse = (playerMessage: string, isUrgent: boolean, proposedActivity: any): string => {
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

    // Context-aware casual responses as fallback
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
      setTimeout(async () => {
        try {
          setIsTyping(true);
          const aiResponse = await generateAIResponse(content, isUrgent, proposedActivity);
          
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
        } catch (error) {
          console.error('Error generating AI response:', error);
        } finally {
          setIsTyping(false);
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
          content: 'I saw the weather forecast... looks like rain tonight. Makes me think of that time we got caught in the downpour after the Busan raid. 😊',
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
        rank: 'B',
        type: 'gate_clearance',
        reward: 35000000,
        location: 'hongdae_cafe',
        description: 'Clear B-Rank Red Gate in Hongdae District',
        longDescription: 'A red gate has materialized near Hongik University. Initial reconnaissance suggests Orc-type monsters with a possible elite variant. Estimated clearance time: 2-3 hours. Guild support available upon request.',
        objectives: [
          {
            id: 'obj_1',
            description: 'Enter the Red Gate',
            completed: false
          },
          {
            id: 'obj_2', 
            description: 'Eliminate all monsters (0/15)',
            completed: false
          },
          {
            id: 'obj_3',
            description: 'Defeat the Gate Boss',
            completed: false
          }
        ],
        timeLimit: 6,
        difficulty: 7,
        estimatedDuration: 3,
        isUrgent: true,
        guildSupport: true
      }
    },
    {
      id: 'quest_002',
      title: 'Investigation: Missing Hunter Reports',
      sender: 'Hunter Association',
      content: 'Three C-Rank hunters have gone missing during routine dungeon runs. Investigate their last known locations.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'quest',
      read: false,
      questData: {
        rank: 'C',
        type: 'investigation',
        reward: 8500000,
        location: 'myeongdong_restaurant',
        description: 'Investigate missing hunter reports',
        longDescription: 'Three C-Rank hunters - Kim Min-jun, Park So-young, and Lee Hyun-woo - have failed to report back from their assigned dungeons. Their last known locations were in the Myeongdong area. Investigate their disappearance and determine if foul play is involved.',
        objectives: [
          {
            id: 'obj_1',
            description: 'Interview witnesses at last known locations',
            completed: false
          },
          {
            id: 'obj_2',
            description: 'Examine the dungeons they entered',
            completed: false
          },
          {
            id: 'obj_3',
            description: 'File comprehensive report',
            completed: false
          }
        ],
        timeLimit: 24,
        difficulty: 5,
        estimatedDuration: 8,
        isUrgent: false,
        guildSupport: false
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
    const alert = systemAlerts.find(a => a.id === questId);
    if (alert && alert.questData) {
      // Create full quest object for System 3 Quest Log
      const questData = {
        id: questId,
        title: alert.title,
        description: alert.questData.description,
        longDescription: alert.questData.longDescription,
        rank: alert.questData.rank,
        type: alert.questData.type,
        sender: alert.sender,
        targetLocation: alert.questData.location,
        objectives: alert.questData.objectives,
        rewards: {
          gold: alert.questData.reward,
          experience: Math.floor(alert.questData.reward * 0.1),
          items: [],
          affection: alert.questData.type === 'escort' ? 5 : 0
        },
        timeLimit: alert.questData.timeLimit,
        difficulty: alert.questData.difficulty,
        status: 'accepted' as const,
        acceptedAt: new Date().toISOString(),
        receivedAt: alert.timestamp.toISOString(),
        estimatedDuration: alert.questData.estimatedDuration,
        prerequisites: [],
        isUrgent: alert.questData.isUrgent,
        guildSupport: alert.questData.guildSupport
      };

      // Pass complete quest data to parent component for integration with System 3 & 8
      onQuestAccept(questData);
      
      // Remove from alerts and mark as accepted
      setSystemAlerts(prev => prev.filter(a => a.id !== questId));
      setSelectedAlert(null);
    }
  };

  const declineQuest = (questId: string) => {
    setSystemAlerts(prev => prev.filter(a => a.id !== questId));
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
      className="fixed inset-0 bg-black/60 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
      style={{
        backdropFilter: 'blur(60px) saturate(180%)',
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4), rgba(0,0,0,0.7))'
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="w-full max-w-4xl h-[600px] flex flex-col overflow-hidden shadow-2xl liquid-glass-enhanced relative"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.75))',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 25px 50px -12px rgba(0,0,0,0.8)'
        }}
      >
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px'
          }}
        />
        
        {/* Inner glow border */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(147,51,234,0.1), rgba(59,130,246,0.08))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            boxShadow: 'inset 0 0 20px rgba(147,51,234,0.1)'
          }}
        />
        {/* Enhanced Header */}
        <div 
          className="flex items-center justify-between p-6 relative z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
          }}
        >
          <div className="flex items-center gap-3">
            <Shield 
              className="w-6 h-6" 
              style={{
                color: '#60a5fa',
                filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
              }}
            />
            <div>
              <h2 
                className="text-xl font-bold text-white"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.1)',
                  filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                }}
              >
                Hunter's Communicator
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <div 
                  className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}
                  style={{
                    boxShadow: connectionStatus === 'connected' 
                      ? '0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(34,197,94,0.3)'
                      : '0 0 8px rgba(239,68,68,0.6), 0 0 16px rgba(239,68,68,0.3)'
                  }}
                />
                <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  {connectionStatus === 'connected' ? 'Connected' : 'No Signal'}
                </span>
                {playerLocation && (
                  <>
                    <span>•</span>
                    <MapPin 
                      className="w-3 h-3" 
                      style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}
                    />
                    <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                      {playerLocation}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Enhanced Tab Navigation */}
        <div 
          className="flex relative z-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            backdropFilter: 'blur(15px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 relative ${
              activeTab === 'messages'
                ? 'text-blue-300'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              textShadow: activeTab === 'messages' 
                ? '0 0 10px rgba(147,197,253,0.5), 0 1px 2px rgba(0,0,0,0.8)'
                : '0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            <MessageCircle 
              className="w-4 h-4" 
              style={{
                filter: activeTab === 'messages'
                  ? 'drop-shadow(0 0 6px rgba(147,197,253,0.4))'
                  : 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
              }}
            />
            Messages
            {conversations.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
              <span 
                className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.9), rgba(139,69,198,0.9))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 0 12px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            )}
            {/* Glowing underline for active tab */}
            {activeTab === 'messages' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, rgba(147,197,253,0.6), rgba(59,130,246,0.8), rgba(147,197,253,0.6))',
                  boxShadow: '0 0 8px rgba(59,130,246,0.6)'
                }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all duration-300 relative ${
              activeTab === 'alerts'
                ? 'text-blue-300'
                : 'text-slate-400 hover:text-white'
            }`}
            style={{
              textShadow: activeTab === 'alerts' 
                ? '0 0 10px rgba(147,197,253,0.5), 0 1px 2px rgba(0,0,0,0.8)'
                : '0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            <Bell 
              className="w-4 h-4" 
              style={{
                filter: activeTab === 'alerts'
                  ? 'drop-shadow(0 0 6px rgba(147,197,253,0.4))'
                  : 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
              }}
            />
            System Alerts
            {systemAlerts.filter(a => !a.read).length > 0 && (
              <span 
                className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.9), rgba(139,69,198,0.9))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 0 12px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                }}
              >
                {systemAlerts.filter(a => !a.read).length}
              </span>
            )}
            {/* Glowing underline for active tab */}
            {activeTab === 'alerts' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{
                  background: 'linear-gradient(90deg, rgba(147,197,253,0.6), rgba(59,130,246,0.8), rgba(147,197,253,0.6))',
                  boxShadow: '0 0 8px rgba(59,130,246,0.6)'
                }}
              />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'messages' ? (
            <>
              {/* Enhanced Conversation List with Floating Pills */}
              <div 
                className="w-1/3 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-6">
                  <h3 
                    className="text-lg font-semibold text-white mb-6"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                    }}
                  >
                    Conversations
                  </h3>
                  <div className="space-y-3">
                    {conversations.map((conversation) => (
                      <motion.div
                        key={conversation.id}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedConversation(conversation.id);
                          markConversationAsRead(conversation.id);
                        }}
                        className="cursor-pointer transition-all duration-300"
                        style={{
                          background: selectedConversation === conversation.id 
                            ? 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(59,130,246,0.1))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                          backdropFilter: 'blur(15px)',
                          border: selectedConversation === conversation.id
                            ? '1px solid rgba(147,51,234,0.3)'
                            : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '20px',
                          padding: '16px',
                          boxShadow: selectedConversation === conversation.id
                            ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 25px rgba(147,51,234,0.15), 0 0 20px rgba(147,51,234,0.1)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                          >
                            {conversation.participantAvatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span 
                                className="font-medium text-white"
                                style={{
                                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                  filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                                }}
                              >
                                {conversation.participantName}
                              </span>
                              {conversation.unreadCount > 0 && (
                                <span 
                                  className="text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(147,51,234,0.9), rgba(139,69,198,0.9))',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    boxShadow: '0 0 12px rgba(147,51,234,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                                  }}
                                >
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p 
                              className="text-sm text-slate-300 mb-1 leading-relaxed"
                              style={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                wordBreak: 'break-word'
                              }}
                            >
                              {conversation.lastMessage.content}
                            </p>
                            <span 
                              className="text-xs text-slate-400"
                              style={{
                                textShadow: '0 1px 1px rgba(0,0,0,0.8)'
                              }}
                            >
                              {formatTimestamp(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Glowing Divider */}
                <div 
                  className="absolute top-0 right-0 bottom-0 w-px"
                  style={{
                    background: 'linear-gradient(180deg, rgba(147,51,234,0.6), rgba(59,130,246,0.4), rgba(147,51,234,0.6))',
                    boxShadow: '0 0 8px rgba(147,51,234,0.4), 0 0 16px rgba(59,130,246,0.2)'
                  }}
                />
              </div>

              {/* Enhanced Chat Area */}
              <div 
                className="flex-1 flex flex-col relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.005))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {selectedConversationData ? (
                  <>
                    {/* Enhanced Chat Header */}
                    <div 
                      className="p-6"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(15px)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                          }}
                        >
                          {selectedConversationData.participantAvatar}
                        </div>
                        <div>
                          <h4 
                            className="font-semibold text-white text-lg"
                            style={{
                              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                              filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                            }}
                          >
                            {selectedConversationData.participantName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div 
                              className={`w-2 h-2 rounded-full ${
                                chaState.status === 'available' ? 'bg-green-400' : 
                                chaState.status === 'busy' || chaState.status === 'in_meeting' ? 'bg-yellow-400' :
                                chaState.status === 'in_raid' ? 'bg-red-400' :
                                chaState.status === 'sleeping' ? 'bg-gray-400' : 'bg-gray-600'
                              }`}
                              style={{
                                boxShadow: chaState.status === 'available' 
                                  ? '0 0 8px rgba(34,197,94,0.6), 0 0 16px rgba(34,197,94,0.3)'
                                  : chaState.status === 'busy' || chaState.status === 'in_meeting'
                                  ? '0 0 8px rgba(234,179,8,0.6), 0 0 16px rgba(234,179,8,0.3)'
                                  : '0 0 8px rgba(239,68,68,0.6), 0 0 16px rgba(239,68,68,0.3)'
                              }}
                            />
                            <span 
                              className="capitalize"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              {chaState.status.replace('_', ' ')}
                            </span>
                            <span>•</span>
                            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                              {chaState.activity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Messages with Liquid Glassmorphism */}
                    <div 
                      ref={chatContainerRef} 
                      className="flex-1 overflow-y-auto p-6 space-y-6 relative"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(50px) saturate(180%) contrast(120%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255,255,255,0.12),
                          inset 0 -1px 0 rgba(255,255,255,0.04),
                          inset 1px 0 0 rgba(255,255,255,0.06),
                          inset -1px 0 0 rgba(255,255,255,0.03),
                          0 8px 32px rgba(0,0,0,0.15),
                          0 4px 16px rgba(0,0,0,0.1)
                        `,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Liquid glassmorphism shimmering inner border */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `
                            linear-gradient(135deg, 
                              rgba(255,255,255,0.15) 0%, 
                              transparent 20%, 
                              transparent 40%,
                              rgba(255,255,255,0.08) 50%,
                              transparent 60%,
                              transparent 80%, 
                              rgba(255,255,255,0.12) 100%
                            )
                          `,
                          borderRadius: 'inherit',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          padding: '1px'
                        }}
                      />
                      
                      {/* Watery distortion overlays for liquid effect */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-40"
                        style={{
                          background: `
                            radial-gradient(ellipse 300px 200px at top left, rgba(147,197,253,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse 400px 150px at bottom right, rgba(168,85,247,0.10) 0%, transparent 65%),
                            radial-gradient(ellipse 250px 180px at center, rgba(236,72,153,0.08) 0%, transparent 70%),
                            radial-gradient(ellipse 200px 300px at 80% 20%, rgba(34,197,94,0.06) 0%, transparent 50%)
                          `,
                          filter: 'blur(2px)',
                          mixBlendMode: 'soft-light'
                        }}
                      />
                      
                      {/* Additional subtle watery ripple effect */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          background: `
                            conic-gradient(from 0deg at 30% 30%, 
                              rgba(255,255,255,0.1) 0deg, 
                              transparent 120deg, 
                              rgba(255,255,255,0.05) 240deg, 
                              transparent 360deg
                            )
                          `,
                          filter: 'blur(1px)',
                          mixBlendMode: 'overlay'
                        }}
                      />
                      {selectedConversationData.messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`w-full ${message.senderId === 'player' ? 'text-right' : 'text-left'}`}
                        >
                          {message.senderId === 'player' ? (
                            // Player messages: Right-aligned, italicized, dimmer
                            <div className="flex justify-end">
                              <div className="max-w-2xl">
                                <p 
                                  className="text-slate-300 italic text-base leading-relaxed"
                                  style={{
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                    filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.03))'
                                  }}
                                >
                                  {message.content}
                                </p>
                                <div className="flex items-center justify-end gap-2 mt-2">
                                  <span 
                                    className="text-xs text-slate-500"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                                  >
                                    {formatTimestamp(message.timestamp)}
                                  </span>
                                  {renderMessageStateIcon(message)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            // NPC messages: Left-aligned with portrait, scene script style
                            <div className="flex gap-4">
                              <div 
                                className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                                  backdropFilter: 'blur(10px)',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                                }}
                              >
                                {selectedConversationData.participantAvatar}
                              </div>
                              <div className="flex-1 max-w-2xl">
                                <div className="mb-1">
                                  <span 
                                    className="text-sm font-medium text-blue-300"
                                    style={{
                                      textShadow: '0 0 8px rgba(147,197,253,0.4), 0 1px 2px rgba(0,0,0,0.8)',
                                      filter: 'drop-shadow(0 1px 1px rgba(147,197,253,0.1))'
                                    }}
                                  >
                                    {selectedConversationData.participantName}
                                  </span>
                                </div>
                                <p 
                                  className="text-white text-base leading-relaxed"
                                  style={{
                                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                                    filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                                  }}
                                >
                                  {message.content}
                                </p>
                                <span 
                                  className="text-xs text-slate-400 mt-2 block"
                                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                                >
                                  {formatTimestamp(message.timestamp)}
                                </span>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {/* Enhanced Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-4"
                        >
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
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

                    {/* Enhanced Message Input */}
                    <div 
                      className="p-6 relative z-20"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                        backdropFilter: 'blur(15px)',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                      }}
                    >
                      {connectionStatus === 'no_signal' ? (
                        <div 
                          className="text-center py-4 rounded-2xl"
                          style={{
                            background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.05))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                          }}
                        >
                          <div className="flex items-center justify-center gap-2 text-red-300">
                            <XIcon 
                              className="w-4 h-4" 
                              style={{ filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.4))' }}
                            />
                            <span style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                              No signal - Cannot send messages
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Textarea
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            placeholder={canSendMessages ? "Type your message..." : "Select a conversation to start messaging"}
                            className="flex-1 min-h-[50px] max-h-32 text-white placeholder-slate-400 border-0 resize-none"
                            disabled={!canSendMessages}
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                              backdropFilter: 'blur(15px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '16px',
                              padding: '16px',
                              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.1)',
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
                            className="px-4 py-3 text-white transition-all duration-200"
                            style={{
                              background: currentInput.trim() && canSendMessages
                                ? 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(37,99,235,0.9))'
                                : 'linear-gradient(135deg, rgba(100,116,139,0.4), rgba(71,85,105,0.5))',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              boxShadow: currentInput.trim() && canSendMessages
                                ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 16px rgba(59,130,246,0.3)'
                                : 'inset 0 1px 0 rgba(255,255,255,0.05)'
                            }}
                          >
                            <Send 
                              className="w-4 h-4" 
                              style={{
                                filter: currentInput.trim() && canSendMessages
                                  ? 'drop-shadow(0 0 4px rgba(59,130,246,0.4))'
                                  : 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'
                              }}
                            />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div 
                    className="flex-1 flex items-center justify-center relative z-10"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15,23,42,0.2), rgba(30,41,59,0.1))',
                      backdropFilter: 'blur(30px)'
                    }}
                  >
                    <div className="text-center">
                      <div 
                        className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                        }}
                      >
                        <MessageCircle 
                          className="w-8 h-8 text-slate-400" 
                          style={{
                            filter: 'drop-shadow(0 0 6px rgba(148,163,184,0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.5))'
                          }}
                        />
                      </div>
                      <p 
                        className="text-slate-300 text-lg"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                          filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.05))'
                        }}
                      >
                        Select a conversation to start messaging
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Enhanced System Alerts Tab */
            <div className="flex-1 flex">
              {/* Enhanced Alerts List */}
              <div 
                className="w-1/2 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="p-6">
                  <h3 
                    className="text-lg font-semibold text-white mb-6"
                    style={{
                      textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                    }}
                  >
                    System Alerts
                  </h3>
                  <div className="space-y-3">
                    {systemAlerts.map((alert) => (
                      <motion.div
                        key={alert.id}
                        whileHover={{ 
                          scale: 1.02,
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedAlert(alert.id);
                          markAlertAsRead(alert.id);
                        }}
                        className="cursor-pointer transition-all duration-300"
                        style={{
                          background: selectedAlert === alert.id 
                            ? 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(59,130,246,0.1))'
                            : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                          backdropFilter: 'blur(15px)',
                          border: selectedAlert === alert.id
                            ? '1px solid rgba(147,51,234,0.3)'
                            : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '16px',
                          padding: '16px',
                          boxShadow: selectedAlert === alert.id
                            ? 'inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 25px rgba(147,51,234,0.15), 0 0 20px rgba(147,51,234,0.1)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)',
                          borderLeft: !alert.read ? '3px solid rgba(59,130,246,0.8)' : 'none',
                          borderLeftColor: !alert.read ? 'rgba(59,130,246,0.8)' : 'transparent'
                        }}
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
                
                {/* Glowing Divider */}
                <div 
                  className="absolute top-0 right-0 bottom-0 w-px"
                  style={{
                    background: 'linear-gradient(180deg, rgba(147,51,234,0.6), rgba(59,130,246,0.4), rgba(147,51,234,0.6))',
                    boxShadow: '0 0 8px rgba(147,51,234,0.4), 0 0 16px rgba(59,130,246,0.2)'
                  }}
                />
              </div>

              {/* Enhanced Alert Detail */}
              <div 
                className="flex-1 relative z-10 overflow-y-auto custom-scrollbar"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.2), rgba(30,41,59,0.1))',
                  backdropFilter: 'blur(30px)'
                }}
              >
                {selectedAlertData ? (
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                        }}
                      >
                        {selectedAlertData.type === 'quest' && <Shield className="w-6 h-6 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.4))' }} />}
                        {selectedAlertData.type === 'announcement' && <Bell className="w-6 h-6 text-blue-400" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.4))' }} />}
                        {selectedAlertData.type === 'system' && <User className="w-6 h-6 text-green-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.4))' }} />}
                      </div>
                      <div>
                        <h4 
                          className="text-xl font-bold text-white mb-1"
                          style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(255,255,255,0.1)',
                            filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                          }}
                        >
                          {selectedAlertData.title}
                        </h4>
                        <p 
                          className="text-sm text-slate-400"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          From: {selectedAlertData.sender}
                        </p>
                      </div>
                    </div>
                    
                    <div 
                      className="rounded-xl p-6 mb-6"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)'
                      }}
                    >
                      <p 
                        className="text-slate-300 leading-relaxed text-base"
                        style={{
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                          filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                        }}
                      >
                        {selectedAlertData.content}
                      </p>
                    </div>

                    {selectedAlertData.questData && (
                      <div 
                        className="rounded-xl p-6 mb-6"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.2)'
                        }}
                      >
                        <h5 
                          className="text-lg font-semibold text-white mb-6"
                          style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                            filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                          }}
                        >
                          Quest Details
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <span 
                              className="text-sm text-slate-400 block mb-2"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              Rank:
                            </span>
                            <p 
                              className="text-white font-bold text-2xl"
                              style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                                filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                              }}
                            >
                              {selectedAlertData.questData.rank}
                            </p>
                          </div>
                          <div>
                            <span 
                              className="text-sm text-slate-400 block mb-2"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              Reward:
                            </span>
                            <p 
                              className="text-white font-bold text-2xl"
                              style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                                filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                              }}
                            >
                              ₩{selectedAlertData.questData.reward.toLocaleString()}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <span 
                              className="text-sm text-slate-400 block mb-2"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              Location:
                            </span>
                            <p 
                              className="text-white font-bold text-lg"
                              style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.1)',
                                filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.1))'
                              }}
                            >
                              {selectedAlertData.questData.location}
                            </p>
                          </div>
                          <div className="md:col-span-2 mt-4">
                            <span 
                              className="text-sm text-slate-400 block mb-2"
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                            >
                              Description:
                            </span>
                            <p 
                              className="text-slate-300 leading-relaxed"
                              style={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.05))'
                              }}
                            >
                              {selectedAlertData.questData.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedAlertData.type === 'quest' && (
                      <div className="flex gap-4 mt-6">
                        <Button
                          onClick={() => acceptQuest(selectedAlertData.id)}
                          className="px-6 py-3 text-white font-medium transition-all duration-200 flex-1"
                          style={{
                            background: 'linear-gradient(135deg, rgba(34,197,94,0.8), rgba(22,163,74,0.9))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 0 16px rgba(34,197,94,0.3)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          }}
                        >
                          Accept Quest
                        </Button>
                        <Button
                          onClick={() => setSelectedAlert(null)}
                          className="px-6 py-3 text-slate-300 font-medium transition-all duration-200"
                          style={{
                            background: 'linear-gradient(135deg, rgba(100,116,139,0.4), rgba(71,85,105,0.5))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                          }}
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