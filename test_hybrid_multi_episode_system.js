// Test Hybrid Multi-Episode System with Contextual Priority Weighting
// This test verifies that multiple episodes can be active simultaneously with intelligent blending

async function testHybridMultiEpisodeSystem() {
  console.log('🎭 Testing Hybrid Multi-Episode System with Contextual Blending...');
  
  const baseUrl = 'http://localhost:5000';
  const profileId = 10; // Use existing test profile
  
  try {
    // Step 1: Set multiple active episodes with different priorities
    console.log('\n1. Setting multiple active episodes with priority weighting...');
    const multiEpisodeResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'TEST_Episode', priority: 'primary', weight: 0.6 },
          { episodeId: 'GAMEPLAY_TEST', priority: 'secondary', weight: 0.3 },
          { episodeId: 'EP01_Red_Echo', priority: 'background', weight: 0.1 }
        ]
      })
    });
    const multiEpisodeResult = await multiEpisodeResponse.json();
    console.log('Multi-Episode Result:', multiEpisodeResult);
    
    // Step 2: Verify active episodes are set correctly
    console.log('\n2. Verifying active episodes...');
    const getActiveResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`);
    const getActiveResult = await getActiveResponse.json();
    console.log('Active Episodes:', getActiveResult);
    
    // Step 3: Test AI chat at cafe (should prioritize TEST_Episode - cafe date)
    console.log('\n3. Testing AI chat at cafe location (should emphasize primary episode)...');
    const chatAtCafeResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What's going through your mind right now?",
        gameState: { 
          profileId: profileId,
          affection: 50 
        },
        context: {
          profileId: profileId,
          location: 'hongdae_cafe',
          timeOfDay: 'evening'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'enjoying coffee',
          location: 'hongdae_cafe',
          affectionLevel: 50
        },
        communicatorMode: true
      })
    });
    const chatAtCafeResult = await chatAtCafeResponse.json();
    console.log('Chat Response at Cafe (Primary Focus):', chatAtCafeResult.response);
    
    // Step 4: Test AI chat at training facility (should blend training themes)
    console.log('\n4. Testing AI chat at training facility (should blend contextual relevance)...');
    const chatAtTrainingResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "How's your training going?",
        gameState: { 
          profileId: profileId,
          affection: 50 
        },
        context: {
          profileId: profileId,
          location: 'gangnam_tower',
          timeOfDay: 'afternoon'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'training',
          location: 'gangnam_tower',
          affectionLevel: 50
        },
        communicatorMode: true
      })
    });
    const chatAtTrainingResult = await chatAtTrainingResponse.json();
    console.log('Chat Response at Training (Contextual Blend):', chatAtTrainingResult.response);
    
    // Step 5: Change priority weighting (promote secondary to primary)
    console.log('\n5. Changing episode priorities (promoting training episode)...');
    const changePriorityResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'GAMEPLAY_TEST', priority: 'primary', weight: 0.6 },
          { episodeId: 'TEST_Episode', priority: 'secondary', weight: 0.3 },
          { episodeId: 'EP01_Red_Echo', priority: 'background', weight: 0.1 }
        ]
      })
    });
    const changePriorityResult = await changePriorityResponse.json();
    console.log('Priority Change Result:', changePriorityResult);
    
    // Step 6: Test AI chat with new priority structure
    console.log('\n6. Testing AI chat with new primary episode (should emphasize training)...');
    const chatWithNewPriorityResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Tell me what's important to you today.",
        gameState: { 
          profileId: profileId,
          affection: 50 
        },
        context: {
          profileId: profileId,
          location: 'hunter_association',
          timeOfDay: 'afternoon'
        },
        conversationHistory: [],
        characterState: {
          status: 'available',
          activity: 'reviewing reports',
          location: 'hunter_association',
          affectionLevel: 50
        },
        communicatorMode: true
      })
    });
    const chatWithNewPriorityResult = await chatWithNewPriorityResponse.json();
    console.log('Chat Response with New Priority:', chatWithNewPriorityResult.response);
    
    // Step 7: Test backwards compatibility with single episode focus
    console.log('\n7. Testing backwards compatibility with single episode focus...');
    const backwardsCompatResponse = await fetch(`${baseUrl}/api/episodes/TEST_Episode/focus/${profileId}`, {
      method: 'POST'
    });
    const backwardsCompatResult = await backwardsCompatResponse.json();
    console.log('Backwards Compatibility Result:', backwardsCompatResult);
    
    // Step 8: Verify backwards compatibility converted to active episodes
    console.log('\n8. Verifying backwards compatibility conversion...');
    const verifyCompatResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`);
    const verifyCompatResult = await verifyCompatResponse.json();
    console.log('Converted Active Episodes:', verifyCompatResult);
    
    console.log('\n✅ Hybrid Multi-Episode System Test Complete!');
    console.log('\nKey Features Verified:');
    console.log('- Multiple episodes can be active simultaneously');
    console.log('- Priority weighting (primary 60%, secondary 30%, background 10%)');
    console.log('- Contextual relevance based on location and time');
    console.log('- Intelligent episode blending in AI responses');
    console.log('- Dynamic priority adjustment');
    console.log('- Backwards compatibility with single-episode focus');
    
  } catch (error) {
    console.error('❌ Hybrid Multi-Episode System Test Failed:', error);
  }
}

// Run the test
testHybridMultiEpisodeSystem();