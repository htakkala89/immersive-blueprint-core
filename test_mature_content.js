// Test script to generate and save mature content image
import fs from 'fs';

async function testMatureContentGeneration() {
  try {
    const response = await fetch('http://localhost:5000/api/generate-intimate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activityId: 'strip_poker',
        relationshipStatus: 'married',
        intimacyLevel: 9
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.imageUrl) {
      // Extract base64 data and save as image file
      const base64Data = data.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync('generated_mature_content.png', buffer);
      console.log('✅ Mature content image generated and saved as generated_mature_content.png');
      console.log('📊 Image size:', buffer.length, 'bytes');
      console.log('🔞 Activity: strip_poker');
      console.log('💑 Relationship: married (intimacy level 9)');
      
      return {
        success: true,
        imageSize: buffer.length,
        activity: 'strip_poker',
        intimacyLevel: 9,
        filePath: 'generated_mature_content.png'
      };
    } else {
      console.log('❌ No image URL returned');
      return { success: false, error: 'No image URL returned' };
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return { success: false, error: error.message };
  }
}

testMatureContentGeneration();