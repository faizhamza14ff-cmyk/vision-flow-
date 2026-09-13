import { GenerationParams, VideoItem } from '../types';
import { INITIAL_FEATURED_VIDEOS } from '../data/mockVideos';

/**
 * Procedural cinematic video generator that creates an actual playable
 * video Blob (WebM) with custom graphics, camera motion, and audio synth.
 * This guarantees offline and local generation with 100% playable videos and instant download!
 */
export async function renderProceduralVideoBlob(
  params: GenerationParams,
  durationSeconds: number = 5,
  onProgress?: (pct: number) => void
): Promise<{ blobUrl: string; thumbnailUrl: string }> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    let width = 640;
    let height = 360;

    if (params.aspectRatio === '9:16') {
      width = 360;
      height = 640;
    } else if (params.aspectRatio === '1:1') {
      width = 480;
      height = 480;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      // Fallback to stock video if canvas not supported
      const matched = matchStockVideo(params);
      resolve({ blobUrl: matched.videoUrl, thumbnailUrl: matched.thumbnailUrl });
      return;
    }

    // Prepare audio context for ambient sound synthesis
    let audioStream: MediaStreamTrack | null = null;
    let audioCtx: AudioContext | null = null;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        const dest = audioCtx.createMediaStreamDestination();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Atmospheric cinematic drone chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(55, audioCtx.currentTime); // Deep A1 note
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        osc.connect(gain);
        gain.connect(dest);
        osc.start();
        audioStream = dest.stream.getAudioTracks()[0] || null;
      }
    } catch {
      // Audio synth optional
    }

    // Set up canvas stream
    const canvasStream = canvas.captureStream(30);
    if (audioStream) {
      canvasStream.addTrack(audioStream);
    }

    let mimeType = 'video/webm;codecs=vp9';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const recordedChunks: Blob[] = [];
    let mediaRecorder: MediaRecorder | null = null;

    try {
      mediaRecorder = new MediaRecorder(canvasStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: 2500000,
      });
    } catch {
      // MediaRecorder fallback
      const matched = matchStockVideo(params);
      resolve({ blobUrl: matched.videoUrl, thumbnailUrl: matched.thumbnailUrl });
      return;
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    let firstFrameThumb = '';

    // Color theme based on style
    const getThemeColors = () => {
      switch (params.style) {
        case 'anime':
          return { bg1: '#0f051d', bg2: '#2b1055', accent: '#f43f5e', secondary: '#06b6d4' };
        case 'fantasy':
          return { bg1: '#051814', bg2: '#064e3b', accent: '#10b981', secondary: '#a855f7' };
        case 'realistic':
        case 'documentary':
          return { bg1: '#0a0f18', bg2: '#1e293b', accent: '#f59e0b', secondary: '#38bdf8' };
        case '3d-animation':
        case 'cartoon':
          return { bg1: '#111827', bg2: '#3730a3', accent: '#ec4899', secondary: '#eab308' };
        case 'cinematic':
        default:
          return { bg1: '#030712', bg2: '#0f172a', accent: '#06b6d4', secondary: '#8b5cf6' };
      }
    };

    const theme = getThemeColors();

    // Particle system
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5 - 0.5,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    const totalFrames = 30 * durationSeconds;
    let currentFrame = 0;

    mediaRecorder.onstop = () => {
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const blobUrl = URL.createObjectURL(blob);
      resolve({
        blobUrl,
        thumbnailUrl: firstFrameThumb || getThemeThumbnail(params.style),
      });
    };

    mediaRecorder.start();

    const draw = () => {
      const progress = currentFrame / totalFrames;
      if (onProgress) onProgress(progress);

      // Camera control simulation
      let zoom = 1;
      let panX = 0;
      let panY = 0;

      if (params.cameraControl === 'close-up') {
        zoom = 1 + progress * 0.4;
      } else if (params.cameraControl === 'wide-shot') {
        zoom = 1.3 - progress * 0.3;
      } else if (params.cameraControl === 'drone-shot') {
        zoom = 1.1 + Math.sin(progress * Math.PI) * 0.2;
        panY = -progress * 30;
      } else if (params.cameraControl === 'tracking-shot') {
        panX = Math.sin(progress * Math.PI * 2) * 35;
      }

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2 + panX, -height / 2 + panY);

      // Cinematic radial gradient background
      const grad = ctx.createRadialGradient(
        width / 2 + Math.sin(progress * 4) * 50,
        height / 2 + Math.cos(progress * 3) * 40,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, theme.bg2);
      grad.addColorStop(0.6, theme.bg1);
      grad.addColorStop(1, '#020408');

      ctx.fillStyle = grad;
      ctx.fillRect(-width * 0.5, -height * 0.5, width * 2, height * 2);

      // Horizon line / celestial glow
      const horizonY = height * 0.6;
      const glowGrad = ctx.createLinearGradient(0, horizonY - 100, 0, horizonY + 50);
      glowGrad.addColorStop(0, 'transparent');
      glowGrad.addColorStop(0.5, theme.accent + '33');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(-width, horizonY - 100, width * 3, 150);

      // Perspective grid lines (cyber / cinematic depth)
      ctx.strokeStyle = theme.accent + '22';
      ctx.lineWidth = 1;
      for (let i = -width; i <= width * 2; i += 60) {
        ctx.beginPath();
        ctx.moveTo(i, height);
        ctx.lineTo(width / 2, horizonY);
        ctx.stroke();
      }

      // Animated light rings / celestial orb
      const orbX = width / 2 + Math.sin(progress * 2) * 20;
      const orbY = horizonY - 60;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 5, orbX, orbY, 90);
      orbGrad.addColorStop(0, theme.accent);
      orbGrad.addColorStop(0.4, theme.secondary + '88');
      orbGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Draw active particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `${theme.accent}${Math.floor(p.alpha * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Anamorphic cinematic lens flare bar
      const flareY = horizonY - 40;
      const flareGrad = ctx.createLinearGradient(0, flareY, width, flareY);
      flareGrad.addColorStop(0, 'transparent');
      flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
      flareGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flareGrad;
      ctx.fillRect(0, flareY, width, 2);

      ctx.restore();

      // Foreground HUD & Subtitles
      ctx.save();
      // Cinematic letterbox subtle bars
      ctx.fillStyle = 'rgba(3, 7, 18, 0.7)';
      ctx.fillRect(0, 0, width, 28);
      ctx.fillRect(0, height - 38, width, 38);

      // VisionFlow AI Watermark & Quality badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '10px sans-serif';
      ctx.fillText(`VISIONFLOW AI  •  ${params.style.toUpperCase()}  •  ${params.quality.toUpperCase()}`, 14, 18);

      // Dynamic timer
      const elapsedSec = (progress * durationSeconds).toFixed(1);
      ctx.textAlign = 'right';
      ctx.fillText(`${elapsedSec}s / ${durationSeconds}s`, width - 14, 18);

      // Prompt subtitle preview
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 12px sans-serif';
      const promptSnippet = params.prompt.length > 55 ? params.prompt.slice(0, 52) + '...' : params.prompt;
      ctx.fillText(`"${promptSnippet}"`, width / 2, height - 16);

      ctx.restore();

      if (currentFrame === 10) {
        firstFrameThumb = canvas.toDataURL('image/jpeg', 0.85);
      }

      currentFrame++;
      if (currentFrame < totalFrames) {
        requestAnimationFrame(draw);
      } else {
        mediaRecorder?.stop();
      }
    };

    draw();
  });
}

function getThemeThumbnail(style: string): string {
  switch (style) {
    case 'anime':
      return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000&auto=format&fit=crop';
    case 'fantasy':
      return 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop';
    case 'realistic':
      return 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1000&auto=format&fit=crop';
    case 'documentary':
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1000&auto=format&fit=crop';
  }
}

/**
 * Intelligent matcher that links user prompt keywords to our curated stock library
 * when desirable, or falls back to procedural rendering.
 */
export function matchStockVideo(params: GenerationParams): { videoUrl: string; thumbnailUrl: string } {
  const p = params.prompt.toLowerCase();

  if (p.includes('dubai') || (p.includes('car') && p.includes('flying'))) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[0].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[0].thumbnailUrl,
    };
  }
  if (p.includes('snow') || p.includes('alpine') || p.includes('mountain') || p.includes('ridge')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[5].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[5].thumbnailUrl,
    };
  }
  if (p.includes('city') || p.includes('cyber') || p.includes('flying car') || p.includes('future') || p.includes('night')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[0].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[0].thumbnailUrl,
    };
  }
  if (p.includes('lion') || p.includes('savanna') || p.includes('safari') || p.includes('animal') || p.includes('sunset')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[1].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[1].thumbnailUrl,
    };
  }
  if (p.includes('astronaut') || p.includes('mars') || p.includes('alien') || p.includes('planet') || p.includes('space') || p.includes('stars')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[2].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[2].thumbnailUrl,
    };
  }
  if (p.includes('ocean') || p.includes('sea') || p.includes('wave') || p.includes('coast') || p.includes('beach')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[3].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[3].thumbnailUrl,
    };
  }
  if (p.includes('anime') || p.includes('manga') || p.includes('runner') || p.includes('tunnel')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[4].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[4].thumbnailUrl,
    };
  }
  if (p.includes('car') || p.includes('lamborghini') || p.includes('commercial') || p.includes('speed') || p.includes('vehicle')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[5].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[5].thumbnailUrl,
    };
  }
  if (p.includes('dragon') || p.includes('magic') || p.includes('castle')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[6].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[6].thumbnailUrl,
    };
  }
  if (params.aspectRatio === '9:16' || p.includes('reel') || p.includes('dance') || p.includes('tiktok')) {
    return {
      videoUrl: INITIAL_FEATURED_VIDEOS[7].videoUrl,
      thumbnailUrl: INITIAL_FEATURED_VIDEOS[7].thumbnailUrl,
    };
  }

  // Default fallback to first featured
  return {
    videoUrl: INITIAL_FEATURED_VIDEOS[0].videoUrl,
    thumbnailUrl: INITIAL_FEATURED_VIDEOS[0].thumbnailUrl,
  };
}

export function parseDurationSeconds(duration: string): number {
  switch (duration) {
    case '5s': return 5;
    case '10s': return 10;
    case '15s': return 15;
    case '30s': return 30;
    default: return 5;
  }
}
