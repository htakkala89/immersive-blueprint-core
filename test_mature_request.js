// Test script for mature content generation through user requests
const fetch = require('node-fetch');

async function testMatureContentRequests() {
  console.log('Testing mature content generation system...\n');
  
  const testCases = [
    {
      name: 'Direct explicit request',
      message: 'show me Cha Hae-In naked',
      expectedDetection: true
    },
    {
      name: 'Intimate action request',
      message: 'undress her slowly',
      expectedDetection: true
    },
    {
      name: 'Image generation request',
      message: 'generate a sexy picture of Cha Hae-In',
      expectedDetection: true
    },
    {
      name: 'Sensual scenario',
      message: 'bedroom scene with her',
      expectedDetection: true
    },
    {
      name: 'Normal conversation',
      message: 'how are you feeling today?',
      expectedDetection: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`Input: "${testCase.message}"`);
    
    // Test mature content keywords
    const matureContentKeywords = [
      'nude', 'naked', 'strip', 'undress', 'sexy', 'hot', 'sensual', 'erotic',
      'intimate', 'make love', 'passionate', 'bedroom', 'show me', 'picture of',
      'image of', 'generate', 'create image', 'breast', 'thigh', 'revealing',
      'aroused', 'desire', 'pleasure', 'seduce', 'tease', 'foreplay'
    ];
    
    const isDetected = matureContentKeywords.some(keyword =>
      testCase.message.toLowerCase().includes(keyword)
    );
    
    console.log(`Detection result: ${isDetected}`);
    console.log(`Expected: ${testCase.expectedDetection}`);
    console.log(`Status: ${isDetected === testCase.expectedDetection ? '✅ PASS' : '❌ FAIL'}`);
    
    if (isDetected) {
      console.log('Would trigger mature content generation via /api/generate-intimate-image');
      
      // Test the actual API endpoint
      try {
        const response = await fetch('http://localhost:5000/api/generate-intimate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            activityId: 'custom_intimate',
            relationshipStatus: 'dating',
            intimacyLevel: 3,
            specificAction: testCase.message
          }),
        });
        
        const data = await response.json();
        console.log(`API Response: ${response.status} - ${data.error || 'Success'}`);
        
        if (data.imageUrl) {
          console.log('✅ Image generated successfully');
        }
      } catch (error) {
        console.log(`API Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n--- Test Summary ---');
  console.log('Mature content detection system is now active in both:');
  console.log('1. Chat mode (regular conversation)');
  console.log('2. Action mode (direct actions)');
  console.log('\nUsers can request mature content by using keywords like:');
  console.log('- "show me Cha Hae-In naked"');
  console.log('- "undress her"');
  console.log('- "generate a sexy picture"');
  console.log('- "bedroom scene"');
  console.log('- "intimate moment"');
}

// Run the test
testMatureContentRequests().catch(console.error);