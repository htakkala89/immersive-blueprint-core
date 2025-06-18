import AdmZip from 'adm-zip';
import fs from 'fs';

async function testNovelAI() {
  const endpoint = 'https://image.novelai.net/ai/generate-image';
  
  const requestBody = {
    input: 'masterpiece, best quality, Solo Leveling manhwa art style, Cha Hae-In beautiful Korean female with golden blonde hair and violet eyes, Jin-Woo handsome Korean male with black hair, romantic scene, intimate moment, detailed artwork',
    model: 'nai-diffusion-3',
    action: 'generate',
    parameters: {
      width: 832,
      height: 1216,
      scale: 5.5,
      sampler: 'k_dpmpp_2s_ancestral',
      steps: 28,
      seed: Math.floor(Math.random() * 4294967295),
      n_samples: 1,
      uc: 'low quality, worst quality, blurry, bad anatomy'
    }
  };

  try {
    console.log('Testing NovelAI API...');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOVELAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': '*/*'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      console.log('Response size:', buffer.byteLength, 'bytes');
      
      // Extract ZIP
      const zip = new AdmZip(Buffer.from(buffer));
      const zipEntries = zip.getEntries();
      
      if (zipEntries.length > 0) {
        const imageBuffer = zipEntries[0].getData();
        fs.writeFileSync('./direct_novelai_test.png', imageBuffer);
        console.log('Success! Image saved as direct_novelai_test.png');
        console.log('Image size:', imageBuffer.length, 'bytes');
        
        // Return base64 for testing
        const base64Image = imageBuffer.toString('base64');
        return `data:image/png;base64,${base64Image}`;
      }
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('Request failed:', error.message);
  }
  
  return null;
}

testNovelAI().then(result => {
  if (result) {
    console.log('NovelAI test successful');
  } else {
    console.log('NovelAI test failed');
  }
});