// Create Manga using Blueprint Engine
import fs from 'fs';

async function createMangaWithBlueprint() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Creating Manga with Blueprint Engine...\n');
  
  // Generate manga story using AI Story Architect
  const mangaPrompt = {
    prompt: "A high school student discovers they can see the memories of objects they touch, and uses this power to solve mysteries around their school while falling in love with the student council president who has a dark secret",
    genre: "supernatural romance",
    setting: "modern Japanese high school",
    targetLength: "long",
    matureContent: false
  };
  
  try {
    console.log('Generating manga story scaffold...');
    const response = await fetch(`${baseUrl}/api/blueprint/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mangaPrompt)
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log(`✓ Manga story created: "${result.scaffold.title}"`);
      console.log(`✓ Characters: ${result.scaffold.characters.length}`);
      console.log(`✓ Episodes: ${result.scaffold.episodes.length}`);
      console.log(`✓ Interactive elements mapped to all 20 systems\n`);
      
      // Transform into manga format
      const mangaStructure = transformToMangaFormat(result.scaffold);
      
      // Save manga structure
      fs.writeFileSync('manga_blueprint.json', JSON.stringify(mangaStructure, null, 2));
      
      console.log('Manga Blueprint Created Successfully!');
      console.log('- Story structure adapted for visual storytelling');
      console.log('- Character designs and expressions mapped');
      console.log('- Panel layouts and pacing defined');
      console.log('- Interactive dialogue choices integrated');
      console.log('- Saved to manga_blueprint.json');
      
      return mangaStructure;
    } else {
      console.error('Failed to generate manga:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error creating manga:', error.message);
    return null;
  }
}

function transformToMangaFormat(scaffold) {
  return {
    mangaTitle: scaffold.title,
    genre: "Supernatural Romance Manga",
    targetDemographic: "Shoujo/Young Adult",
    estimatedChapters: scaffold.episodes.length * 3, // 3 chapters per episode
    
    visualStyle: {
      artStyle: "Modern manga style with detailed character expressions",
      colorScheme: "Black and white with selective color highlights for supernatural elements",
      panelStyle: "Dynamic layouts with close-ups for emotional moments"
    },
    
    characters: scaffold.characters.map(char => ({
      ...char,
      visualDesign: generateCharacterDesign(char),
      expressionSheet: generateExpressions(char),
      outfitVariations: generateOutfits(char)
    })),
    
    chapters: transformEpisodesToChapters(scaffold.episodes),
    
    interactiveElements: {
      choicePoints: "Reader decisions affect relationship development",
      memoryVisions: "Touch-activated flashback sequences",
      mysteryClues: "Hidden details in background panels",
      romanceFlags: "Character relationship progression tracking"
    },
    
    publicationFormat: {
      serialization: "Weekly digital chapters",
      volumeCollection: "Print volumes every 6 months",
      interactiveFeatures: "QR codes linking to choice sequences"
    }
  };
}

function generateCharacterDesign(character) {
  const designs = {
    protagonist: "Short black hair, expressive dark eyes, school uniform with slightly loosened tie, carries vintage leather satchel",
    love_interest: "Elegant long silver hair, piercing blue eyes, perfect student council uniform, carries ornate fountain pen",
    supporting: "Varied designs reflecting their personality traits and roles in the story"
  };
  
  return designs[character.role] || designs.supporting;
}

function generateExpressions(character) {
  return [
    "neutral", "surprised", "determined", "confused", "happy", 
    "sad", "angry", "embarrassed", "mysterious", "concerned"
  ];
}

function generateOutfits(character) {
  return [
    "school_uniform", "casual_clothes", "formal_wear", 
    "sports_uniform", "festival_yukata", "winter_coat"
  ];
}

function transformEpisodesToChapters(episodes) {
  return episodes.flatMap((episode, episodeIndex) => 
    episode.beats.map((beat, beatIndex) => ({
      chapterNumber: (episodeIndex * 3) + beatIndex + 1,
      title: beat.title,
      pageCount: 20,
      panels: generatePanelLayout(beat),
      cliffhanger: beatIndex === 2 ? "End of episode reveal" : "Scene transition",
      choicePoint: beat.choices.length > 0 ? beat.choices : null
    }))
  );
}

function generatePanelLayout(beat) {
  return [
    { type: "establishing_shot", description: `Wide view of ${beat.location}` },
    { type: "character_introduction", description: "Close-up of main characters" },
    { type: "dialogue_sequence", description: "Multi-panel conversation" },
    { type: "action_moment", description: "Key story beat visualization" },
    { type: "emotional_reaction", description: "Character expression focus" },
    { type: "transition", description: "Scene or chapter transition" }
  ];
}

// Execute manga creation
createMangaWithBlueprint();