import { useEffect, useRef } from "react";
import type { SceneData } from "@shared/schema";

interface GameCanvasProps {
  sceneData: SceneData | null;
}

export function GameCanvas({ sceneData }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load AI-generated image when sceneData changes
  useEffect(() => {
    if (sceneData?.imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
      };
      img.onerror = () => {
        console.log('Failed to load AI-generated image');
        imageRef.current = null;
      };
      img.src = sceneData.imageUrl;
    } else {
      imageRef.current = null;
    }
  }, [sceneData?.imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Default scene data if none provided
    const defaultRunes = [
      { x: 0.5, y: 0.4, isRed: false, phase: 0 },
      { x: 0.4, y: 0.3, isRed: true, phase: 0.5 },
      { x: 0.6, y: 0.3, isRed: true, phase: 0.8 },
      { x: 0.45, y: 0.6, isRed: false, phase: 0.3 },
      { x: 0.55, y: 0.6, isRed: false, phase: 0.6 }
    ];

    const defaultParticles = [
      { x: 0.2, y: 0.8, phase: 0 },
      { x: 0.5, y: 0.9, phase: 2.0 },
      { x: 0.8, y: 0.7, phase: 4.0 }
    ];

    const runes = sceneData?.runes || defaultRunes;
    const particles = sceneData?.particles || defaultParticles;

    function drawScene(timestamp: number) {
      const time = timestamp * 0.001;
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw AI-generated background image if available
      if (imageRef.current && imageRef.current.complete) {
        // Draw the AI image as background, covering the full canvas
        ctx.drawImage(imageRef.current, 0, 0, width, height);
        
        // Add dark overlay to make animated elements visible
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, width, height);
      } else {
        // Fallback gradient background
        const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
        backgroundGradient.addColorStop(0, 'rgba(25, 25, 46, 1)');
        backgroundGradient.addColorStop(1, 'rgba(15, 15, 30, 1)');
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, width, height);
      }

      // Ancient door
      const doorWidth = width * 0.4;
      const doorHeight = height * 0.8;
      const doorX = (width - doorWidth) / 2;
      const doorY = height * 0.1;

      ctx.fillStyle = 'rgba(10, 10, 15, 1)';
      ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

      // Door border
      ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

      // Draw animated runes
      runes.forEach(rune => {
        drawRune(ctx, rune.x * width, rune.y * height, time + rune.phase, rune.isRed);
      });

      // Draw floating particles
      particles.forEach(particle => {
        drawParticle(ctx, particle.x * width, particle.y * height, time + particle.phase, width, height);
      });

      animationRef.current = requestAnimationFrame(drawScene);
    }

    function drawRune(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, isRed: boolean) {
      const baseRadius = 8;
      const color = isRed ? '#FF6B6B' : '#667EEA';

      // Animate radius and opacity
      const animationCycle = Math.sin(time * 1.5);
      const animatedRadius = baseRadius + (animationCycle * 2);
      const animatedOpacity = 0.5 + (Math.abs(animationCycle) * 0.5);

      // Outer glow
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, animatedRadius * 2);
      glowGradient.addColorStop(0, color + Math.round(animatedOpacity * 255 * 0.8).toString(16).padStart(2, '0'));
      glowGradient.addColorStop(1, color + '00');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, animatedRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = `rgba(255, 255, 255, ${animatedOpacity})`;
      ctx.beginPath();
      ctx.arc(x, y, baseRadius / 2, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawParticle(ctx: CanvasRenderingContext2D, x: number, y: number, time: number, width: number, height: number) {
      const animationDuration = 8.0;
      const timeTapped = time % animationDuration;
      const progress = timeTapped / animationDuration;

      // Calculate position and opacity
      const yOffset = -progress * 150;
      const xOffset = Math.sin(progress * Math.PI * 2) * 20;
      const currentX = x + xOffset;
      const currentY = y + yOffset;

      const opacity = Math.sin(progress * Math.PI);

      if (opacity > 0) {
        ctx.fillStyle = `rgba(102, 126, 234, ${opacity})`;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Start animation
    animationRef.current = requestAnimationFrame(drawScene);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [sceneData]);

  return (
    <canvas 
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
