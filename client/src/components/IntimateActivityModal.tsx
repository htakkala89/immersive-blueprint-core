import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Send, ArrowLeft } from 'lucide-react';

interface IntimateActivityModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReturnToHub: () => void;
  activityType: 'shower_together' | 'cuddle_together' | 'bedroom_intimacy' | 'make_love' | null;
  onAction: (action: string, isCustom?: boolean) => void;
  onImageGenerate: (prompt: string) => void;
  currentResponse?: string;
  intimacyLevel: number;
  affectionLevel: number;
}

const getActivityData = (activityType: string) => {
  const activities = {
    shower_together: {
      title: 'Shower Together',
      setting: 'Luxurious bathroom with glass shower, steam rising, intimate lighting',
      initialNarration: 'The warm water cascades down as you both step into the spacious shower together. Cha Hae-In looks beautiful with water droplets glistening on her skin.',
      contextActions: [
        { id: 'wash_her_back', text: 'Wash her back gently', description: 'Tenderly soap and massage her back' },
        { id: 'rinse_her_hair', text: 'Rinse her hair', description: 'Carefully rinse shampoo from her silky hair' },
        { id: 'embrace_under_water', text: 'Embrace under the water', description: 'Hold her close under the warm cascade' },
        { id: 'massage_shoulders', text: 'Massage her shoulders', description: 'Relieve tension with gentle touches' }
      ]
    },
    cuddle_together: {
      title: 'Cuddle Time',
      setting: 'Cozy bedroom with soft lighting, comfortable bed with silky sheets',
      initialNarration: 'You settle into bed together, the soft sheets and dim lighting creating a perfect atmosphere for intimate closeness. Cha Hae-In nestles against you.',
      contextActions: [
        { id: 'stroke_her_hair', text: 'Stroke her hair', description: 'Gently run fingers through her golden hair' },
        { id: 'whisper_sweet_words', text: 'Whisper sweet words', description: 'Share tender words of affection' },
        { id: 'gentle_kisses', text: 'Give gentle kisses', description: 'Soft kisses on her forehead and cheeks' },
        { id: 'hold_her_close', text: 'Hold her closer', description: 'Pull her into a warm, protective embrace' }
      ]
    },
    bedroom_intimacy: {
      title: 'Bedroom Time',
      setting: 'Romantic bedroom with candles, rose petals, and intimate ambiance',
      initialNarration: 'The bedroom is lit by soft candlelight, rose petals scattered across the silk sheets. Cha Hae-In looks at you with trust and desire in her eyes.',
      contextActions: [
        { id: 'light_touches', text: 'Gentle caresses', description: 'Tender, loving touches and exploration' },
        { id: 'passionate_kisses', text: 'Passionate kisses', description: 'Deep, meaningful kisses' },
        { id: 'whisper_desires', text: 'Whisper desires', description: 'Share intimate thoughts and feelings' },
        { id: 'slow_exploration', text: 'Slow exploration', description: 'Take time to appreciate every moment together' }
      ]
    },
    make_love: {
      title: 'Make Love',
      setting: 'Private sanctuary of love, ultimate intimacy between devoted partners',
      initialNarration: 'In your most private moments together, you and Cha Hae-In share the deepest expression of your love and connection.',
      contextActions: [
        { id: 'tender_passion', text: 'Tender passion', description: 'Express love through gentle intimacy' },
        { id: 'deep_connection', text: 'Deep connection', description: 'Soul-deep bonding and unity' },
        { id: 'loving_words', text: 'Express your love', description: 'Tell her how much she means to you' },
        { id: 'cherish_moment', text: 'Cherish the moment', description: 'Savor this perfect time together' }
      ]
    }
  };

  return activities[activityType as keyof typeof activities];
};

export function IntimateActivityModal({
  isVisible,
  onClose,
  onReturnToHub,
  activityType,
  onAction,
  onImageGenerate,
  currentResponse,
  intimacyLevel,
  affectionLevel
}: IntimateActivityModalProps) {
  const [customAction, setCustomAction] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isVisible || !activityType) return null;

  const activity = getActivityData(activityType);

  const handleCustomAction = async () => {
    if (!customAction.trim()) return;
    
    setIsGenerating(true);
    await onAction(customAction, true);
    setCustomAction('');
    setIsGenerating(false);
  };

  const handlePredefinedAction = async (actionId: string) => {
    setIsGenerating(true);
    await onAction(actionId);
    setIsGenerating(false);
  };

  const generateSceneImage = () => {
    const imagePrompt = `${activity.setting}. Jin-Woo and Cha Hae-In in intimate moment. Tasteful, romantic, anime art style, Solo Leveling aesthetic. Soft lighting, emotional connection, beautiful details.`;
    onImageGenerate(imagePrompt);
  };

  const handleExit = async () => {
    // Reset mature image protection when exiting intimate activities
    try {
      await fetch('/api/reset-mature-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.log('Note: Could not reset image protection');
    }
    onClose();
  };

  const handleReturnToHub = async () => {
    // Reset mature image protection when returning to hub
    try {
      await fetch('/api/reset-mature-protection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.log('Note: Could not reset image protection');
    }
    onReturnToHub();
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-pink-900/95 to-purple-900/95 border border-pink-500/30 rounded-xl w-full max-w-4xl h-5/6 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-pink-500/30">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            💕 {activity.title}
          </h2>
          <div className="flex gap-2">
            <Button
              onClick={handleReturnToHub}
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Life Hub
            </Button>
            <Button
              onClick={handleExit}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-pink-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Current Scene Narration */}
            <Card className="mb-6 bg-black/30 border-pink-500/30">
              <CardContent className="p-4">
                <p className="text-pink-100 leading-relaxed">
                  {currentResponse || activity.initialNarration}
                </p>
              </CardContent>
            </Card>

            {/* Relationship Status Display */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-pink-900/50 to-red-900/50 border-pink-500/30">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-pink-300 text-sm">Affection Level</div>
                    <div className="text-white text-xl font-bold">{affectionLevel}/100</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-purple-300 text-sm">Intimacy Level</div>
                    <div className="text-white text-xl font-bold">{intimacyLevel}/100</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Custom Action Input */}
            <Card className="mb-6 bg-black/30 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Your Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <textarea
                  ref={textareaRef}
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder="Describe what you want to do... Be creative and express your feelings and actions."
                  className="w-full h-24 bg-black/50 border border-purple-500/30 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:border-purple-400 focus:outline-none"
                />
                <Button
                  onClick={handleCustomAction}
                  disabled={!customAction.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isGenerating ? 'Processing...' : 'Take Action'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Suggestions Panel */}
          <div className="w-1/3 p-6 border-l border-pink-500/30 bg-black/20">
            <h3 className="text-lg font-semibold text-white mb-4">Suggested Actions</h3>
            
            <div className="space-y-3 mb-6">
              {activity.contextActions.map((action) => (
                <Button
                  key={action.id}
                  onClick={() => handlePredefinedAction(action.id)}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3 border-pink-500/30 hover:bg-pink-500/10 text-white"
                >
                  <div>
                    <div className="font-medium">{action.text}</div>
                    <div className="text-xs text-pink-300 mt-1">{action.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Generate Scene Image */}
            <Button
              onClick={generateSceneImage}
              variant="outline"
              className="w-full border-purple-500/30 hover:bg-purple-500/10 text-white"
            >
              🎨 Generate Scene Image
            </Button>

            {/* Tips */}
            <Card className="mt-6 bg-pink-900/30 border-pink-500/30">
              <CardContent className="p-3">
                <div className="text-pink-200 text-xs">
                  <div className="font-medium mb-2">💡 Tips:</div>
                  <ul className="space-y-1">
                    <li>• Be descriptive and romantic</li>
                    <li>• Express emotions and feelings</li>
                    <li>• Focus on connection and intimacy</li>
                    <li>• Take your time and be gentle</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}