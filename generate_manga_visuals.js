// Generate Manga Visual Assets
import fs from 'fs';

async function generateMangaVisuals() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Generating manga visual assets...\n');
  
  // Character reference sheets
  const characterPrompts = [
    {
      name: "Alex - Character Design",
      prompt: "manga character reference sheet, shy bookstore owner, short black hair, expressive dark eyes, gentle smile, casual clothing with vintage leather satchel, multiple expressions and poses, clean line art style"
    },
    {
      name: "Jordan - Character Design", 
      prompt: "manga character reference sheet, mysterious artistic person, elegant long silver hair, piercing blue eyes, vintage style clothing, ornate fountain pen accessory, multiple expressions and poses, clean line art style"
    }
  ];
  
  // Scene illustrations
  const scenePrompts = [
    {
      name: "Coffee Shop - Establishing Shot",
      prompt: "cozy neighborhood coffee shop interior, warm lighting, wooden furniture, bookshelves, large windows, manga style background art, detailed environment design"
    },
    {
      name: "Morning Routine - Key Scene",
      prompt: "manga panel sequence, two characters meeting in coffee shop, morning light streaming through windows, emotional moment, detailed facial expressions, shoujo manga style"
    }
  ];
  
  console.log('Generating character reference sheets...');
  for (const char of characterPrompts) {
    await generateImage(char.name, char.prompt);
  }
  
  console.log('\nGenerating scene illustrations...');
  for (const scene of scenePrompts) {
    await generateImage(scene.name, scene.prompt);
  }
  
  console.log('\nManga visual assets generation complete!');
  console.log('Ready for manga production and publication.');
}

async function generateImage(name, prompt) {
  try {
    const response = await fetch('http://localhost:5000/api/generate-novelai-intimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activityId: 'manga_illustration',
        relationshipStatus: 'character_design',
        intimacyLevel: 1,
        customPrompt: prompt
      })
    });
    
    const result = await response.json();
    
    if (result.imageUrl) {
      console.log(`Generated: ${name}`);
      console.log(`Image URL: ${result.imageUrl}`);
    } else {
      console.log(`Failed to generate: ${name}`);
    }
  } catch (error) {
    console.log(`Error generating ${name}: ${error.message}`);
  }
}

// Execute visual generation
generateMangaVisuals();