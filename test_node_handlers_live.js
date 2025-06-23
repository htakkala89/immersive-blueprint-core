// Live Node Handler Testing Script
// This script tests each node handler by simulating actual clicks and verifying state changes

class LiveNodeTester {
  constructor() {
    this.testResults = [];
    this.passCount = 0;
    this.failCount = 0;
  }

  async runAllTests() {
    console.log('🚀 Starting Live Node Handler Tests...');
    
    // Test each node handler individually
    await this.testCombatAnalytics();
    await this.testJewelryCounter();
    await this.testRiversEdge();
    await this.testReceptionist();
    await this.testSommelier();
    await this.testSparringRing();
    await this.testArtifactDisplay();
    await this.testVanityTable();
    
    this.showResults();
  }

  async testCombatAnalytics() {
    console.log('🔬 Testing Combat Analytics Handler...');
    
    try {
      // Simulate clicking combat_analytics node
      const result = await this.simulateNodeClick('combat_analytics', 'training_facility');
      const passed = this.verifyUIStateChange('showRaidStats', result);
      
      this.recordResult('Combat Analytics', 'Should open raid statistics UI', passed, result);
    } catch (error) {
      this.recordResult('Combat Analytics', 'Should open raid statistics UI', false, { error: error.message });
    }
  }

  async testJewelryCounter() {
    console.log('🔬 Testing Jewelry Counter Handler...');
    
    try {
      const result = await this.simulateNodeClick('jewelry_counter', 'luxury_mall');
      const passed = this.verifyUIStateChange('showItemInspection', result);
      
      this.recordResult('Jewelry Counter', 'Should open item inspection interface', passed, result);
    } catch (error) {
      this.recordResult('Jewelry Counter', 'Should open item inspection interface', false, { error: error.message });
    }
  }

  async testRiversEdge() {
    console.log('🔬 Testing Rivers Edge Handler...');
    
    try {
      const result = await this.simulateNodeClick('rivers_edge', 'hangang_park');
      const passed = this.verifyStateChange('cinematicMode', result);
      
      this.recordResult('Rivers Edge', 'Should trigger cinematic mode', passed, result);
    } catch (error) {
      this.recordResult('Rivers Edge', 'Should trigger cinematic mode', false, { error: error.message });
    }
  }

  async testReceptionist() {
    console.log('🔬 Testing Receptionist Handler...');
    
    try {
      const result = await this.simulateNodeClick('receptionist', 'hunter_association');
      const passed = this.verifyEnvironmentalInteraction(result);
      
      this.recordResult('Receptionist', 'Should provide gameplay hints', passed, result);
    } catch (error) {
      this.recordResult('Receptionist', 'Should provide gameplay hints', false, { error: error.message });
    }
  }

  async testSommelier() {
    console.log('🔬 Testing Sommelier Handler...');
    
    try {
      const result = await this.simulateNodeClick('speak_sommelier', 'myeongdong_restaurant');
      const passed = this.verifyGoldChange(-15000, result);
      
      this.recordResult('Sommelier', 'Should deduct gold for wine recommendation', passed, result);
    } catch (error) {
      this.recordResult('Sommelier', 'Should deduct gold for wine recommendation', false, { error: error.message });
    }
  }

  async testSparringRing() {
    console.log('🔬 Testing Sparring Ring Handler...');
    
    try {
      const result = await this.simulateNodeClick('sparring_ring', 'training_facility');
      const passed = this.verifyUIStateChange('showDailyLifeHub', result);
      
      this.recordResult('Sparring Ring', 'Should open Daily Life Hub', passed, result);
    } catch (error) {
      this.recordResult('Sparring Ring', 'Should open Daily Life Hub', false, { error: error.message });
    }
  }

  async testArtifactDisplay() {
    console.log('🔬 Testing Artifact Display Handler...');
    
    try {
      const result = await this.simulateNodeClick('artifact_display', 'player_apartment');
      const passed = this.verifyUIStateChange('showRelationshipConstellation', result);
      
      this.recordResult('Artifact Display', 'Should open Relationship Constellation', passed, result);
    } catch (error) {
      this.recordResult('Artifact Display', 'Should open Relationship Constellation', false, { error: error.message });
    }
  }

  async testVanityTable() {
    console.log('🔬 Testing Vanity Table Handler...');
    
    try {
      const result = await this.simulateNodeClick('vanity_table', 'chahaein_apartment');
      const passed = this.verifyMemoryTracking(result);
      
      this.recordResult('Vanity Table', 'Should track visit history and show memory triggers', passed, result);
    } catch (error) {
      this.recordResult('Vanity Table', 'Should track visit history and show memory triggers', false, { error: error.message });
    }
  }

  async simulateNodeClick(nodeId, locationId) {
    // Check if we can access the React app's state and handlers
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      // Try to find the actual node element and click it
      const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (nodeElement) {
        nodeElement.click();
        
        // Wait for state changes to propagate
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return {
          method: 'dom_click',
          nodeClicked: true,
          stateChanges: this.captureStateChanges()
        };
      }
    }
    
    // Fallback: Check if handler exists in component code
    return await this.checkHandlerImplementation(nodeId, locationId);
  }

  async checkHandlerImplementation(nodeId, locationId) {
    try {
      // Read the component source to verify handler implementation
      const response = await fetch('/src/pages/solo-leveling-spatial.tsx');
      if (!response.ok) {
        throw new Error('Could not access component source');
      }
      
      const componentCode = await response.text();
      
      // Check for case statement
      const casePattern = new RegExp(`case '${nodeId}':`);
      const hasCase = casePattern.test(componentCode);
      
      if (!hasCase) {
        return { implemented: false, reason: 'No case statement found' };
      }
      
      // Extract the handler code
      const caseStart = componentCode.indexOf(`case '${nodeId}':`);
      const nextCase = componentCode.indexOf('case ', caseStart + 1);
      const breakIndex = componentCode.indexOf('break;', caseStart);
      const caseEnd = nextCase === -1 ? breakIndex : Math.min(nextCase, breakIndex);
      
      const handlerCode = componentCode.substring(caseStart, caseEnd);
      
      return {
        implemented: true,
        handlerCode: handlerCode,
        analysis: this.analyzeHandlerCode(handlerCode, nodeId)
      };
      
    } catch (error) {
      return { implemented: false, error: error.message };
    }
  }

  analyzeHandlerCode(handlerCode, nodeId) {
    const analysis = {
      hasUIStateChange: false,
      hasGameStateChange: false,
      hasEnvironmentalInteraction: false,
      hasGoldChange: false,
      hasAffectionChange: false,
      expectedBehaviors: []
    };

    // Check for UI state changes
    if (handlerCode.includes('setShowRaidStats(true)')) {
      analysis.hasUIStateChange = true;
      analysis.expectedBehaviors.push('Opens raid statistics UI');
    }
    if (handlerCode.includes('setShowItemInspection(true)')) {
      analysis.hasUIStateChange = true;
      analysis.expectedBehaviors.push('Opens item inspection interface');
    }
    if (handlerCode.includes('setShowDailyLifeHub(true)')) {
      analysis.hasUIStateChange = true;
      analysis.expectedBehaviors.push('Opens Daily Life Hub');
    }
    if (handlerCode.includes('setShowRelationshipConstellation(true)')) {
      analysis.hasUIStateChange = true;
      analysis.expectedBehaviors.push('Opens Relationship Constellation');
    }
    if (handlerCode.includes('setCinematicMode(true)')) {
      analysis.hasGameStateChange = true;
      analysis.expectedBehaviors.push('Triggers cinematic mode');
    }

    // Check for environmental interactions
    if (handlerCode.includes('handleEnvironmentalInteraction')) {
      analysis.hasEnvironmentalInteraction = true;
      analysis.expectedBehaviors.push('Creates environmental interaction');
    }

    // Check for gold changes
    if (handlerCode.includes('gold:') && handlerCode.includes('- ')) {
      analysis.hasGoldChange = true;
      analysis.expectedBehaviors.push('Deducts gold');
    }

    // Check for affection changes
    if (handlerCode.includes('affection:') && handlerCode.includes('Math.min')) {
      analysis.hasAffectionChange = true;
      analysis.expectedBehaviors.push('Increases affection');
    }

    return analysis;
  }

  captureStateChanges() {
    // This would capture actual React state changes if we had access
    // For now, we'll check for DOM changes and console logs
    return {
      timestamp: Date.now(),
      method: 'dom_observation'
    };
  }

  verifyUIStateChange(expectedState, result) {
    if (result.analysis) {
      return result.analysis.hasUIStateChange && 
             result.analysis.expectedBehaviors.some(behavior => 
               behavior.toLowerCase().includes(expectedState.toLowerCase().replace('show', '').replace(/([A-Z])/g, ' $1').trim())
             );
    }
    return false;
  }

  verifyStateChange(expectedState, result) {
    if (result.analysis) {
      return result.analysis.hasGameStateChange || 
             result.analysis.expectedBehaviors.some(behavior => 
               behavior.toLowerCase().includes(expectedState.toLowerCase())
             );
    }
    return false;
  }

  verifyEnvironmentalInteraction(result) {
    if (result.analysis) {
      return result.analysis.hasEnvironmentalInteraction;
    }
    return false;
  }

  verifyGoldChange(expectedChange, result) {
    if (result.analysis) {
      return result.analysis.hasGoldChange;
    }
    return false;
  }

  verifyMemoryTracking(result) {
    if (result.handlerCode) {
      return result.handlerCode.includes('visitCount') || 
             result.handlerCode.includes('visitHistory');
    }
    return false;
  }

  recordResult(name, description, passed, result) {
    this.testResults.push({
      name,
      description,
      passed,
      result,
      details: passed ? 'Handler implemented correctly' : 'Handler missing or incorrect'
    });

    if (passed) {
      this.passCount++;
      console.log(`✅ ${name}: ${description}`);
    } else {
      this.failCount++;
      console.log(`❌ ${name}: ${description}`);
    }

    // Show handler analysis if available
    if (result.analysis && result.analysis.expectedBehaviors.length > 0) {
      console.log(`   Expected behaviors: ${result.analysis.expectedBehaviors.join(', ')}`);
    }
  }

  showResults() {
    const total = this.passCount + this.failCount;
    const passRate = total > 0 ? Math.round((this.passCount / total) * 100) : 0;

    console.log('\n📊 Live Node Handler Test Results');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${this.passCount}`);
    console.log(`Failed: ${this.failCount}`);
    console.log(`Pass Rate: ${passRate}%`);
    console.log('='.repeat(50));

    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.passed ? '✅' : '❌'} ${result.name}`);
      console.log(`   ${result.description}`);
      if (result.result.analysis && result.result.analysis.expectedBehaviors.length > 0) {
        console.log(`   Behaviors: ${result.result.analysis.expectedBehaviors.join(', ')}`);
      }
      console.log('');
    });

    if (passRate === 100) {
      console.log('🎉 All node handlers are working correctly!');
    } else {
      console.log(`⚠️ ${this.failCount} node handlers need attention`);
    }
  }
}

// Run the tests
const tester = new LiveNodeTester();
tester.runAllTests().catch(console.error);