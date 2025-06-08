// Test script for NovelAI integration
import fetch from 'node-fetch';

async function testNovelAI() {
  try {
    console.log('Testing NovelAI API connection...');
    
    const testPrompt = "masterpiece, best quality, anime style, Jin-Woo and Cha Hae-In romantic scene, Solo Leveling aesthetic";
    
    const response = await fetch('https://api.novelai.net/ai/generate-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: testPrompt,
        model: 'nai-diffusion-3',
        action: 'generate',
        parameters: {
          width: 1024,
          height: 1024,
          scale: 7,
          sampler: 'k_euler_ancestral',
          steps: 28,
          seed: Math.floor(Math.random() * 1000000),
          n_samples: 1,
          ucPreset: 0,
          qualityToggle: true,
          sm: false,
          sm_dyn: false,
          dynamic_thresholding: false,
          controlnet_strength: 1,
          legacy: false
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NovelAI API error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      return false;
    }

    const data = await response.text();
    console.log('Success! Generated image data length:', data.length);
    return true;
  } catch (error) {
    console.error('Error testing NovelAI:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testNovelAI().then(success => {
    console.log('Test result:', success ? 'SUCCESS' : 'FAILED');
    process.exit(success ? 0 : 1);
  });
}

export { testNovelAI };