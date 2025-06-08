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
        activityId: 'wake_up_together',
        relationshipStatus: 'married',
        intimacyLevel: 6
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
      
      fs.writeFileSync('wake_up_together_test.png', buffer);
      console.log('✅ Wake up together image generated and saved');
      console.log('📊 Image size:', buffer.length, 'bytes');
      console.log('🔞 Activity: wake_up_together');
      console.log('💑 Relationship: married (intimacy level 6)');
      console.log('👱‍♀️ Character: Short blonde hair, purple eyes');
      
      return {
        success: true,
        imageSize: buffer.length,
        activity: 'intimate_evening',
        intimacyLevel: 8,
        filePath: 'corrected_cha_haein_image.png'
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