import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EquipmentTestPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runEquipmentTest = async () => {
    setIsLoading(true);
    console.log('🔧 EQUIPMENT TEST - Starting equipment loading test...');
    
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        equipmentEndpoint: null,
        inventoryEndpoint: null,
        totalItems: 0,
        weapons: [],
        armor: [],
        accessories: []
      };

      // Test equipment endpoint
      console.log('🔧 EQUIPMENT TEST - Testing /api/player/equipment');
      try {
        const equipmentResponse = await fetch('/api/player/equipment');
        results.equipmentEndpoint = {
          status: equipmentResponse.status,
          ok: equipmentResponse.ok
        };
        
        if (equipmentResponse.ok) {
          const equipmentText = await equipmentResponse.text();
          console.log('🔧 EQUIPMENT TEST - Equipment raw response:', equipmentText);
          
          try {
            const equipmentData = JSON.parse(equipmentText);
            results.equipmentEndpoint.data = equipmentData;
            if (equipmentData.equipment) {
              results.totalItems += equipmentData.equipment.length;
            }
          } catch (parseError) {
            console.error('🔧 EQUIPMENT TEST - Equipment JSON parse error:', parseError);
            results.equipmentEndpoint.parseError = parseError.message;
          }
        }
      } catch (fetchError) {
        console.error('🔧 EQUIPMENT TEST - Equipment fetch error:', fetchError);
        results.equipmentEndpoint = { error: fetchError.message };
      }

      // Test inventory endpoint
      console.log('🔧 EQUIPMENT TEST - Testing /api/player/inventory');
      try {
        const inventoryResponse = await fetch('/api/player/inventory');
        results.inventoryEndpoint = {
          status: inventoryResponse.status,
          ok: inventoryResponse.ok
        };
        
        if (inventoryResponse.ok) {
          const inventoryText = await inventoryResponse.text();
          console.log('🔧 EQUIPMENT TEST - Inventory raw response:', inventoryText);
          
          try {
            const inventoryData = JSON.parse(inventoryText);
            results.inventoryEndpoint.data = inventoryData;
            if (inventoryData.items) {
              results.totalItems += inventoryData.items.length;
              
              // Categorize items
              inventoryData.items.forEach((item: any) => {
                if (item.category === 'weapons' || item.type === 'weapon') {
                  results.weapons.push(item);
                } else if (item.category === 'armor' || item.type === 'armor') {
                  results.armor.push(item);
                } else if (item.category === 'accessories' || item.type === 'accessory') {
                  results.accessories.push(item);
                }
              });
            }
          } catch (parseError) {
            console.error('🔧 EQUIPMENT TEST - Inventory JSON parse error:', parseError);
            results.inventoryEndpoint.parseError = parseError.message;
          }
        }
      } catch (fetchError) {
        console.error('🔧 EQUIPMENT TEST - Inventory fetch error:', fetchError);
        results.inventoryEndpoint = { error: fetchError.message };
      }

      console.log('🔧 EQUIPMENT TEST - Final results:', results);
      setTestResults(results);
      
    } catch (error) {
      console.error('🔧 EQUIPMENT TEST - Overall error:', error);
      setTestResults({ error: error.message });
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-slate-900/95 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          🔧 Equipment Loading Test Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runEquipmentTest}
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? 'Running Test...' : 'Test Equipment Loading'}
        </Button>

        {testResults && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-800 rounded">
                <div className="text-purple-400 font-semibold">Equipment Endpoint</div>
                <div className="text-white">
                  Status: {testResults.equipmentEndpoint?.status || 'N/A'}
                </div>
                {testResults.equipmentEndpoint?.parseError && (
                  <div className="text-red-400">Parse Error: {testResults.equipmentEndpoint.parseError}</div>
                )}
              </div>
              
              <div className="p-3 bg-slate-800 rounded">
                <div className="text-purple-400 font-semibold">Inventory Endpoint</div>
                <div className="text-white">
                  Status: {testResults.inventoryEndpoint?.status || 'N/A'}
                </div>
                {testResults.inventoryEndpoint?.parseError && (
                  <div className="text-red-400">Parse Error: {testResults.inventoryEndpoint.parseError}</div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded">
              <div className="text-purple-400 font-semibold mb-2">Equipment Summary</div>
              <div className="grid grid-cols-3 gap-4 text-white">
                <div>
                  <div className="text-green-400">Weapons: {testResults.weapons.length}</div>
                  {testResults.weapons.map((weapon: any, i: number) => (
                    <div key={i} className="text-xs text-gray-300 ml-2">
                      • {weapon.name} ({weapon.rarity})
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-blue-400">Armor: {testResults.armor.length}</div>
                  {testResults.armor.map((armor: any, i: number) => (
                    <div key={i} className="text-xs text-gray-300 ml-2">
                      • {armor.name} ({armor.rarity})
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-yellow-400">Accessories: {testResults.accessories.length}</div>
                  {testResults.accessories.map((acc: any, i: number) => (
                    <div key={i} className="text-xs text-gray-300 ml-2">
                      • {acc.name} ({acc.rarity})
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-800 rounded">
              <div className="text-purple-400 font-semibold mb-2">Raw Data (Check Console)</div>
              <div className="text-xs text-gray-400">
                Test completed at: {testResults.timestamp}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};