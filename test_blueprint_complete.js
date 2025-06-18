// Complete Blueprint Engine Test - Both Creation Pathways
import fs from 'fs';

async function testBlueprintEngineComplete() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Blueprint Engine - Complete Platform Test\n');
  
  // Test Blueprint Engine Capabilities
  try {
    const response = await fetch(`${baseUrl}/api/blueprint/capabilities`);
    const data = await response.json();
    
    console.log(`Platform Version: ${data.blueprintEngine.version}`);
    console.log(`Active Systems: ${data.blueprintEngine.systems.length}/20`);
    console.log(`Creation Pathways Available: 2`);
    console.log(`- AI Story Architect: ${data.blueprintEngine.creationPathways.aiStoryArchitect.available ? 'Ready' : 'Offline'}`);
    console.log(`- Ingestion & Adaptation: ${data.blueprintEngine.creationPathways.ingestionAdaptation.available ? 'Ready' : 'Offline'}\n`);
    
    // List all active systems
    console.log('Active Blueprint Engine Systems:');
    data.blueprintEngine.systems.forEach((system, index) => {
      console.log(`${index + 1}. ${system.name}`);
    });
    console.log();
    
  } catch (error) {
    console.error('Platform status check failed:', error.message);
    return;
  }
  
  // Test AI Story Architect - Generate from Prompt
  console.log('AI Story Architect - Creating Interactive Experience from Prompt...');
  try {
    const storyRequest = {
      prompt: "A time-traveling historian discovers they can change pivotal moments in history, but each change creates unexpected consequences in their present-day romance",
      genre: "sci-fi romance",
      setting: "time travel between Victorian era and modern day",
      targetLength: "medium",
      matureContent: false
    };
    
    const response = await fetch(`${baseUrl}/api/blueprint/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyRequest)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Story Generation: SUCCESS');
      console.log(`Generated Title: "${result.scaffold.title}"`);
      console.log(`Characters Created: ${result.scaffold.characters.length}`);
      console.log(`Locations Designed: ${result.scaffold.locations.length}`);
      console.log(`Episodes Structured: ${result.scaffold.episodes.length}`);
      console.log(`Estimated Play Sessions: ${result.metadata.estimatedSessions}`);
      
      // Save the complete generated experience
      fs.writeFileSync('ai_generated_story.json', JSON.stringify(result, null, 2));
      console.log('Complete story scaffold saved to ai_generated_story.json\n');
    } else {
      console.log('Story Generation: FAILED -', result.error);
    }
  } catch (error) {
    console.log('Story Generation: ERROR -', error.message);
  }
  
  // Test Ingestion & Adaptation Engine - Transform Content
  console.log('Ingestion & Adaptation Engine - Transforming Existing Content...');
  try {
    const adaptationRequest = {
      sourceUrl: "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm", // Pride and Prejudice
      adaptationType: "narrative",
      targetAudience: "general",
      interactivityLevel: "high", 
      preferredLength: "long"
    };
    
    const response = await fetch(`${baseUrl}/api/blueprint/ingest-content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adaptationRequest)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Content Adaptation: SUCCESS');
      console.log(`Adapted Title: "${result.experience.metadata.title}"`);
      console.log(`Source Material: ${result.experience.metadata.originalSource}`);
      console.log(`Adaptation Type: ${result.experience.metadata.adaptationType}`);
      console.log(`Estimated Playtime: ${result.experience.metadata.estimatedPlaytime}`);
      console.log(`Interactive Elements: ${Object.keys(result.experience.interactiveElements).length} types`);
      console.log(`Systems Populated: ${result.metadata.systemsPopulated}`);
      
      // Save the adapted experience
      fs.writeFileSync('adapted_experience.json', JSON.stringify(result, null, 2));
      console.log('Complete adapted experience saved to adapted_experience.json\n');
    } else {
      console.log('Content Adaptation: FAILED -', result.error);
    }
  } catch (error) {
    console.log('Content Adaptation: ERROR -', error.message);
  }
  
  console.log('Blueprint Engine Platform Test Complete');
  console.log('Ready for content creation and adaptation workflows');
}

// Execute the complete test
testBlueprintEngineComplete().catch(console.error);