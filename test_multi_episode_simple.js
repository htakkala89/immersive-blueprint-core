// Simple test for hybrid multi-episode system
async function testMultiEpisodeSystem() {
  console.log('Testing Hybrid Multi-Episode System...');
  
  const baseUrl = 'http://localhost:5000';
  const profileId = 10;
  
  try {
    // Test setting multiple active episodes
    console.log('\n1. Setting multiple active episodes...');
    const response = await fetch(`${baseUrl}/api/episodes/active/${profileId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        episodes: [
          { episodeId: 'TEST_Episode', priority: 'primary' },
          { episodeId: 'GAMEPLAY_TEST', priority: 'secondary' }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Response not OK:', response.status, errorText);
      return;
    }
    
    const result = await response.json();
    console.log('Multi-Episode Result:', result);
    
    // Test getting active episodes
    console.log('\n2. Getting active episodes...');
    const getResponse = await fetch(`${baseUrl}/api/episodes/active/${profileId}`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.log('Get response not OK:', getResponse.status, errorText);
      return;
    }
    
    const activeResult = await getResponse.json();
    console.log('Active Episodes:', activeResult);
    
    console.log('\n✅ Basic multi-episode system working!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMultiEpisodeSystem();