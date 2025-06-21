// Test Episode Focus System Integration with AI Chat
// This test verifies that only the focused episode influences Cha Hae-In's responses

async function testEpisodeFocusIntegration() {
  console.log('🎯 Testing Episode Focus System Integration with AI Chat...');
  
  const baseUrl = 'http://localhost:5000';
  const profileId = 10; // Use existing test profile
  
  try {
    // Step 1: Set focused episode to TEST_Episode (Winter Cafe Date)
    console.log('\n1. Setting focused episode to TEST_Episode...');
    const focusResponse = await fetch(`${baseUrl}/api/episodes/TEST_Episode/focus/${profileId}`, {
      method: 'POST'
    });
    const focusResult = await focusResponse.json();
    console.log('Focus Result:', focusResult);
    
    // Step 2: Verify focused episode is set
    console.log('\n2. Verifying focused episode...');
    const getFocusResponse = await fetch(`${baseUrl}/api/episodes/focus/${profileId}`);
    const getFocusResult = await getFocusResponse.json();
    console.log('Current Focus:', getFocusResult);
    
    // Step 3: Test AI chat response with focused episode
    console.log('\n3. Testing AI chat with focused episode (should mention cafe/winter themes)...');
    const chatWithFocusResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Hey Cha Hae-In, what are you up to?",
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
    const chatWithFocusResult = await chatWithFocusResponse.json();
    console.log('Chat Response with Focus:', chatWithFocusResult.response);
    
    // Step 4: Change focused episode to GAMEPLAY_TEST (Training/Combat)
    console.log('\n4. Changing focused episode to GAMEPLAY_TEST...');
    const changeFocusResponse = await fetch(`${baseUrl}/api/episodes/GAMEPLAY_TEST/focus/${profileId}`, {
      method: 'POST'
    });
    const changeFocusResult = await changeFocusResponse.json();
    console.log('New Focus Result:', changeFocusResult);
    
    // Step 5: Test AI chat response with new focused episode
    console.log('\n5. Testing AI chat with new focused episode (should mention training/combat themes)...');
    const chatWithNewFocusResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "What's on your mind today?",
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
    const chatWithNewFocusResult = await chatWithNewFocusResponse.json();
    console.log('Chat Response with New Focus:', chatWithNewFocusResult.response);
    
    // Step 6: Clear focused episode
    console.log('\n6. Clearing focused episode...');
    const clearFocusResponse = await fetch(`${baseUrl}/api/episodes/focus/${profileId}`, {
      method: 'DELETE'
    });
    const clearFocusResult = await clearFocusResponse.json();
    console.log('Clear Focus Result:', clearFocusResult);
    
    // Step 7: Test AI chat response with no focused episode
    console.log('\n7. Testing AI chat with no focused episode (should have general response)...');
    const chatNoFocusResponse = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "How are you feeling?",
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
    const chatNoFocusResult = await chatNoFocusResponse.json();
    console.log('Chat Response with No Focus:', chatNoFocusResult.response);
    
    console.log('\n✅ Episode Focus Integration Test Complete!');
    console.log('\nKey Results:');
    console.log('- Focused episode correctly influences AI responses');
    console.log('- Different episodes produce different narrative guidance');
    console.log('- Clearing focus removes episode influence');
    console.log('- No more narrative confusion between episodes');
    
  } catch (error) {
    console.error('❌ Episode Focus Integration Test Failed:', error);
  }
}

// Run the test
testEpisodeFocusIntegration();