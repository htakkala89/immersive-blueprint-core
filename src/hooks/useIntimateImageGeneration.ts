import { useState } from 'react';

interface IntimateImageRequest {
  activityId: string;
  relationshipStatus: string;
  intimacyLevel: number;
}

export function useIntimateImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async ({ activityId, relationshipStatus, intimacyLevel }: IntimateImageRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-intimate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activityId,
          relationshipStatus,
          intimacyLevel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      return data.imageUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Image generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => {
    setGeneratedImage(null);
    setError(null);
  };

  return {
    generateImage,
    clearImage,
    isGenerating,
    generatedImage,
    error
  };
}