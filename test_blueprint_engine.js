// Test Blueprint Engine - AI Story Architect and Ingestion & Adaptation Engine
import fs from 'fs';

async function testBlueprintEngine() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('🏗️ Testing Blueprint Engine Capabilities...\n');
  
  // Test 1: Check Blueprint Engine Status
  try {
    const response = await fetch(`${baseUrl}/api/blueprint/capabilities`);
    const data = await response.json();
    
    console.log(`Blueprint Engine Version: ${data.blueprintEngine.version}`);
    console.log(`Active Systems: ${data.blueprintEngine.systems.length}/20`);
    console.log(`AI Story Architect: ${data.blueprintEngine.creationPathways.aiStoryArchitect.available ? 'Available' : 'Unavailable'}`);
    console.log(`Ingestion & Adaptation: ${data.blueprintEngine.creationPathways.ingestionAdaptation.available ? 'Available' : 'Unavailable'}\n`);
  } catch (error) {
    console.error('❌ Blueprint Engine status check failed:', error.message);
    return;
  }
  
  // Test 2: AI Story Architect - Generate Interactive Experience
  console.log('🎨 Testing AI Story Architect...');
  try {
    const storyPrompt = {
      prompt: "A romantic coffee shop encounter between a shy bookstore owner and a mysterious regular customer who always orders the same drink but never speaks",
      genre: "contemporary romance",
      setting: "cozy urban coffee shop",
      targetLength: "short",
      matureContent: false
    };
    
    const response = await fetch(`${baseUrl}/api/blueprint/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyPrompt)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Story generated successfully');
      console.log(`Title: ${result.scaffold.title}`);
      console.log(`Characters: ${result.scaffold.characters.length}`);
      console.log(`Locations: ${result.scaffold.locations.length}`);
      console.log(`Episodes: ${result.scaffold.episodes.length}`);
      console.log(`Estimated Sessions: ${result.metadata.estimatedSessions}`);
      
      // Save generated story for review
      fs.writeFileSync('generated_story_demo.json', JSON.stringify(result, null, 2));
      console.log('📄 Full story saved to generated_story_demo.json\n');
    } else {
      console.error('❌ Story generation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ AI Story Architect test failed:', error.message);
  }
  
  // Test 3: Ingestion & Adaptation Engine - Transform Content
  console.log('🔄 Testing Ingestion & Adaptation Engine...');
  try {
    const ingestionRequest = {
      sourceUrl: "https://example.com/fairy-tale-content",
      adaptationType: "narrative",
      targetAudience: "general",
      interactivityLevel: "medium",
      preferredLength: "short"
    };
    
    const response = await fetch(`${baseUrl}/api/blueprint/ingest-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ingestionRequest)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Content adaptation successful');
      console.log(`Title: ${result.experience.metadata.title}`);
      console.log(`Type: ${result.experience.metadata.adaptationType}`);
      console.log(`Estimated Playtime: ${result.experience.metadata.estimatedPlaytime}`);
      console.log(`Systems Populated: ${result.metadata.systemsPopulated}`);
      
      // Save adapted experience for review
      fs.writeFileSync('adapted_experience_demo.json', JSON.stringify(result, null, 2));
      console.log('📄 Adapted experience saved to adapted_experience_demo.json\n');
    } else {
      console.error('❌ Content adaptation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Ingestion & Adaptation test failed:', error.message);
  }
  
  console.log('🎯 Blueprint Engine testing complete!');
}

// Run the test
testBlueprintEngine().catch(console.error);