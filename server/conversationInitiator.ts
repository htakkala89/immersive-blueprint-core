// Cha Hae-In conversation initiator system for proactive engagement

export interface InitiatorContext {
  affectionLevel: number;
  timeSinceLastInteraction: number; // in minutes
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  currentLocation?: string;
  recentActivity?: string;
}

export const shouldInitiateConversation = (context: InitiatorContext): boolean => {
  const { affectionLevel, timeSinceLastInteraction, timeOfDay } = context;
  
  // Base probability increases with affection level
  let baseProbability = affectionLevel * 0.15; // 15% per affection level
  
  // Time-based modifiers
  const timeModifiers = {
    morning: 1.2,    // More likely to greet in morning
    afternoon: 0.8,  // Less likely during busy afternoon
    evening: 1.3,    // Most likely during relaxed evening
    night: 0.6       // Less likely late at night
  };
  
  baseProbability *= timeModifiers[timeOfDay];
  
  // Increase probability based on time since last interaction
  if (timeSinceLastInteraction > 30) baseProbability *= 1.5;
  if (timeSinceLastInteraction > 60) baseProbability *= 2.0;
  
  // Cap at 80% maximum
  baseProbability = Math.min(baseProbability, 0.8);
  
  return Math.random() < baseProbability;
};

export const getConversationStarter = (context: InitiatorContext): string => {
  const { affectionLevel, timeOfDay, recentActivity } = context;
  
  const starters = {
    morning: [
      "*stretches gracefully* Good morning, Jin-Woo. I was just planning today's training. Want to join me?",
      "*checking her equipment* Morning! I noticed you're up early too. Big plans today?",
      "*warm smile* Perfect timing. I was about to grab some coffee before reviewing mission reports. Care to join?",
      "*adjusts her sword belt* You're an early riser like me. I respect that. Sleep well?"
    ],
    afternoon: [
      "*pauses from sword maintenance* Jin-Woo! How's your day treating you so far?",
      "*looks up from mission documents* Good to see you. I was just thinking we haven't talked much today.",
      "*confident expression* Busy afternoon? Mine's been full of interesting developments.",
      "*slight smile* I was hoping we'd cross paths. Got a minute to chat?"
    ],
    evening: [
      "*more relaxed posture* Finally, some downtime. How was your day, Jin-Woo?",
      "*gentle expression* Perfect evening for a conversation. What's been on your mind lately?",
      "*settles comfortably* I've been looking forward to unwinding. Want to talk about something?",
      "*softer tone* These quiet moments are precious after intense days. How are you feeling?"
    ],
    night: [
      "*appears thoughtful* Can't sleep either? I find these late hours perfect for deeper conversations.",
      "*gentle smile* I was just reflecting on recent events. Sometimes I wonder what you're thinking about.",
      "*soft expression* The night is so peaceful. It makes me appreciate having someone to share it with.",
      "*warm look* I'm glad you're here. These late talks have become important to me."
    ]
  };
  
  // Affection-based variations
  const affectionStarters = {
    low: [
      "*professional but friendly* Jin-Woo, I wanted to discuss something with you.",
      "*respectful nod* I've been observing your growth as a hunter. Impressive progress.",
      "*analytical look* Your recent performance in gates has caught my attention."
    ],
    medium: [
      "*genuine interest* I've been curious about your perspective on something.",
      "*comfortable smile* You know, I find our conversations quite engaging.",
      "*thoughtful expression* I was wondering how you view our partnership developing."
    ],
    high: [
      "*warm affection* I was thinking about you and wanted to see how you're doing.",
      "*loving look* Being around you has become the highlight of my days.",
      "*intimate tone* I love these moments we share together, Jin-Woo."
    ]
  };
  
  const timeBasedStarters = starters[timeOfDay];
  const affectionCategory = affectionLevel <= 2 ? 'low' : affectionLevel <= 4 ? 'medium' : 'high';
  const affectionBasedStarters = affectionStarters[affectionCategory];
  
  // Combine both types with 70/30 split
  const allStarters = Math.random() < 0.7 ? timeBasedStarters : affectionBasedStarters;
  
  return allStarters[Math.floor(Math.random() * allStarters.length)];
};

export const getFollowUpQuestion = (affectionLevel: number): string => {
  const questions = {
    low: [
      "What's your assessment of today's gate activities?",
      "Any interesting encounters in your recent missions?",
      "How do you feel about our current mission parameters?"
    ],
    medium: [
      "What's been the most challenging part of your recent adventures?",
      "I'm curious about your thoughts on our teamwork lately.",
      "Is there anything you've been wanting to discuss?"
    ],
    high: [
      "What makes you happiest these days?",
      "I love hearing about what excites you. What's on your mind?",
      "You seem thoughtful today. Want to share what you're thinking about?"
    ]
  };
  
  const category = affectionLevel <= 2 ? 'low' : affectionLevel <= 4 ? 'medium' : 'high';
  const questionList = questions[category];
  
  return questionList[Math.floor(Math.random() * questionList.length)];
};