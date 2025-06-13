// Episode Priority Management Demo
// Shows how to set up and manage episode priorities for different scenarios

async function demonstrateEpisodePriorities() {
  console.log('🎭 Episode Priority Management Demo');
  
  const baseUrl = 'http://localhost:5000';
  const profileId = 10;
  
  try {
    // Scenario 1: Romance-focused gameplay
    console.log('\n📅 Scenario 1: Evening Romance Focus');
    const romanceResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'romantic_evening', priority: 'primary' },      // 60% - Main romance
          { episodeId: 'daily_life_together', priority: 'secondary' }, // 30% - Relationship building
          { episodeId: 'hunter_duties', priority: 'background' }       // 10% - Career context
        ]
      })
    });
    const romanceResult = await romanceResponse.json();
    console.log('Romance Setup:', romanceResult);
    
    // Test AI response with romance focus
    const romanceChatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What would you like to do tonight?",
        gameState: { profileId: profileId, affection: 70 },
        context: {
          profileId: profileId,
          location: 'chahaein_apartment',
          timeOfDay: 'evening'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'relaxing',
          location: 'chahaein_apartment',
          affectionLevel: 70
        },
        communicatorMode: true
      })
    });
    const romanceChatResult = await romanceChatResponse.json();
    console.log('Romance-Focused Response:', romanceChatResult.response);
    
    // Scenario 2: Action/Training focused gameplay
    console.log('\n⚔️ Scenario 2: Training & Action Focus');
    const actionResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'elite_training', priority: 'primary' },        // 60% - Skill development
          { episodeId: 'dangerous_mission', priority: 'secondary' },   // 30% - Current threat
          { episodeId: 'romantic_tension', priority: 'background' }    // 10% - Subtle romance
        ]
      })
    });
    const actionResult = await actionResponse.json();
    console.log('Action Setup:', actionResult);
    
    // Test AI response with training focus
    const actionChatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "How should we prepare for the upcoming raid?",
        gameState: { profileId: profileId, affection: 50 },
        context: {
          profileId: profileId,
          location: 'hunter_association',
          timeOfDay: 'afternoon'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'strategizing',
          location: 'hunter_association',
          affectionLevel: 50
        },
        communicatorMode: true
      })
    });
    const actionChatResult = await actionChatResponse.json();
    console.log('Action-Focused Response:', actionChatResult.response);
    
    // Scenario 3: Balanced multi-episode approach
    console.log('\n⚖️ Scenario 3: Balanced Multi-Episode Approach');
    const balancedResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'relationship_growth', priority: 'primary' },   // 60% - Core relationship
          { episodeId: 'guild_responsibilities', priority: 'secondary' }, // 30% - Professional life
          { episodeId: 'mysterious_threat', priority: 'background' }   // 10% - Overarching plot
        ]
      })
    });
    const balancedResult = await balancedResponse.json();
    console.log('Balanced Setup:', balancedResult);
    
    // Test contextual blending at different locations
    console.log('\n🏠 Testing Contextual Blending - At Home');
    const homeChatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I'm glad we have this time together.",
        gameState: { profileId: profileId, affection: 60 },
        context: {
          profileId: profileId,
          location: 'chahaein_apartment',
          timeOfDay: 'evening'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'spending time together',
          location: 'chahaein_apartment',
          affectionLevel: 60
        },
        communicatorMode: true
      })
    });
    const homeChatResult = await homeChatResponse.json();
    console.log('Home Context Response:', homeChatResult.response);
    
    console.log('\n🏢 Testing Contextual Blending - At Work');
    const workChatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I'm glad we have this time together.",
        gameState: { profileId: profileId, affection: 60 },
        context: {
          profileId: profileId,
          location: 'hunter_association',
          timeOfDay: 'afternoon'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'working',
          location: 'hunter_association',
          affectionLevel: 60
        },
        communicatorMode: true
      })
    });
    const workChatResult = await workChatResponse.json();
    console.log('Work Context Response:', workChatResult.response);
    
    // Scenario 4: Dynamic priority shifting
    console.log('\n🔄 Scenario 4: Dynamic Priority Shifting');
    console.log('Simulating urgent mission interrupting romantic evening...');
    
    const urgentResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'emergency_gate_breach', priority: 'primary' },     // 60% - Urgent threat
          { episodeId: 'romantic_evening', priority: 'secondary' },        // 30% - Interrupted date
          { episodeId: 'hunter_reputation', priority: 'background' }       // 10% - Professional stakes
        ]
      })
    });
    const urgentResult = await urgentResponse.json();
    console.log('Emergency Setup:', urgentResult);
    
    const urgentChatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "An S-rank gate just opened nearby. What should we do?",
        gameState: { profileId: profileId, affection: 60 },
        context: {
          profileId: profileId,
          location: 'chahaein_apartment',
          timeOfDay: 'evening'
        },
        conversationHistory: [],
        characterState: {
          status: 'alert',
          activity: 'responding to emergency',
          location: 'chahaein_apartment',
          affectionLevel: 60
        },
        communicatorMode: true
      })
    });
    const urgentChatResult = await urgentChatResponse.json();
    console.log('Emergency Response:', urgentChatResult.response);
    
    console.log('\n✅ Episode Priority Demo Complete!');
    console.log('\n📊 Priority System Summary:');
    console.log('- Primary (60%): Main storyline driving current gameplay');
    console.log('- Secondary (30%): Supporting narrative providing context');
    console.log('- Background (10%): World-building and long-term arcs');
    console.log('- Location & time influence which episodes feel natural');
    console.log('- Priorities can shift dynamically based on events');
    
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

demonstrateEpisodePriorities();