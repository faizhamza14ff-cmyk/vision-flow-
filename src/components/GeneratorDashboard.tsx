import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Sliders,
  Camera,
  Layers,
  Clock,
  Monitor,
  Maximize2,
  Volume2,
  VolumeX,
  Wand2,
  Shuffle,
  Check,
  Heart,
  Edit3,
  Copy,
  Zap,
  Film
} from 'lucide-react';
import {
  VideoStyle,
  AspectRatio,
  VideoDuration,
  VideoQuality,
  CameraControl,
  GenerationParams,
  VideoItem,
  GenerationJob,
  UserProfile
} from '../types';
import { enhancePrompt, SUGGESTED_INSPIRATION_PROMPTS } from '../utils/promptEnhancer';
import { renderProceduralVideoBlob, parseDurationSeconds } from '../utils/videoGenerator';

interface GeneratorDashboardProps {
  initialPrompt?: string;
  user: UserProfile;
  onDeductCredits: (amount: number) => boolean;
  onVideoCreated: (video: VideoItem) => void;
  onOpenPricing: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const GeneratorDashboard: React.FC<GeneratorDashboardProps> = ({
  initialPrompt = '',
  user,
  onDeductCredits,
  onVideoCreated,
  onOpenPricing,
  showToast,
}) => {
  // Generation Parameters
  const [prompt, setPrompt] = useState(initialPrompt || 'A futuristic city at night with flying cars, neon skyscrapers in purple and cyan');
  const [negativePrompt, setNegativePrompt] = useState('blurry, distorted, low resolution, artifacts, oversaturated, static jitter');
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('10s');
  const [quality, setQuality] = useState<VideoQuality>('1080p');
  const [cameraControl, setCameraControl] = useState<CameraControl>('drone-shot');
  const [motionIntensity, setMotionIntensity] = useState<number>(7);
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 999999));
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation State
  const [job, setJob] = useState<GenerationJob | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  // Video Player Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isSavedFavorite, setIsSavedFavorite] = useState(false);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync initialPrompt if changed from outside
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const stylesList: { id: VideoStyle; name: string; desc: string; icon: string }[] = [
    { id: 'cinematic', name: 'Cinematic', desc: 'Anamorphic film aesthetic', icon: '🎬' },
    { id: 'realistic', name: 'Realistic', desc: 'Photorealistic real world', icon: '📷' },
    { id: 'anime', name: 'Anime', desc: 'Makoto Shinkai aesthetic', icon: '✨' },
    { id: '3d-animation', name: '3D Animation', desc: 'Pixar / Octane render', icon: '🧸' },
    { id: 'cartoon', name: 'Cartoon', desc: 'Hand-drawn illustrative', icon: '🎨' },
    { id: 'fantasy', name: 'Fantasy', desc: 'Ethereal magic & runes', icon: '🔮' },
    { id: 'documentary', name: 'Documentary', desc: 'Raw 35mm handheld look', icon: '📽️' },
  ];

  const aspectRatios: { id: AspectRatio; name: string; ratio: string; iconDesc: string }[] = [
    { id: '16:9', name: 'Landscape', ratio: '16:9', iconDesc: 'YouTube / Desktop' },
    { id: '9:16', name: 'Portrait', ratio: '9:16', iconDesc: 'Reels / TikTok' },
    { id: '1:1', name: 'Square', ratio: '1:1', iconDesc: 'Instagram / Feed' },
  ];

  const durations: VideoDuration[] = ['5s', '10s', '15s', '30s'];
  const qualities: { id: VideoQuality; name: string; tag?: string }[] = [
    { id: '720p', name: '720p HD' },
    { id: '1080p', name: '1080p Full HD', tag: 'Recommended' },
    { id: '4k', name: '4K Ultra HD', tag: 'Pro' },
  ];

  const cameraControls: { id: CameraControl; name: string; desc: string }[] = [
    { id: 'close-up', name: 'Close-up', desc: 'Intimate focal focus' },
    { id: 'wide-shot', name: 'Wide shot', desc: 'Panoramic grand scale' },
    { id: 'tracking-shot', name: 'Tracking shot', desc: 'Smooth lateral motion' },
    { id: 'drone-shot', name: 'Drone shot', desc: 'Elevated aerial sweep' },
    { id: 'static', name: 'Static', desc: 'Locked tripod stillness' },
  ];

  // Credit calculation
  const getRequiredCredits = () => {
    let cost = 2;
    if (quality === '4k') cost += 2;
    if (duration === '15s') cost += 1;
    if (duration === '30s') cost += 2;
    return cost;
  };

  const handleEnhancePrompt = () => {
    if (!prompt.trim()) {
      showToast('warning', 'Empty Prompt', 'Please enter a prompt before enhancing.');
      return;
    }
    const enhanced = enhancePrompt(prompt, style, cameraControl);
    setPrompt(enhanced);
    showToast('success', 'Prompt Enhanced', 'Added cinematic lighting, lens physics, and artistic fidelity tags.');
  };

  const handleSurpriseMe = () => {
    const randomInspo = SUGGESTED_INSPIRATION_PROMPTS[Math.floor(Math.random() * SUGGESTED_INSPIRATION_PROMPTS.length)];
    setPrompt(randomInspo.prompt);
    setStyle(randomInspo.style);
    setCameraControl(randomInspo.camera);
    showToast('info', 'Inspiration Loaded', `Loaded: ${randomInspo.title}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Prompt Required', 'Please enter a description for the video you want to generate.');
      promptInputRef.current?.focus();
      return;
    }

    const creditCost = getRequiredCredits();
    if (user.creditsRemaining < creditCost) {
      showToast('warning', 'Insufficient Credits', `This generation requires ${creditCost} credits. You have ${user.creditsRemaining}.`);
      onOpenPricing();
      return;
    }

    const currentParams: GenerationParams = {
      prompt,
      negativePrompt,
      style,
      aspectRatio,
      duration,
      quality,
      cameraControl,
      motionIntensity,
      seed,
    };

    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      params: currentParams,
      stage: 'analyzing',
      progress: 5,
      stageMessage: 'Analyzing prompt semantic tokens and camera vectors...',
      estimatedSecondsLeft: 8,
    };

    setJob(newJob);

    // Scroll to preview smoothly on smaller screens
    const targetElement = document.getElementById('generation-viewport-container');
    if (targetElement && window.innerWidth < 1024) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }

    // Step 1: Synthesizing latents
    setTimeout(() => {
      setJob((prev) => prev ? {
        ...prev,
        stage: 'synthesizing_latents',
        progress: 28,
        stageMessage: 'Sampling diffusion latents across spatio-temporal layers...',
        estimatedSecondsLeft: 6,
      } : null);
    }, 1200);

    // Step 2: Rendering frames
    setTimeout(() => {
      setJob((prev) => prev ? {
        ...prev,
        stage: 'rendering_frames',
        progress: 55,
        stageMessage: `Rendering motion frames with ${cameraControl.replace('-', ' ')} camera dynamics...`,
        estimatedSecondsLeft: 4,
      } : null);
    }, 2600);

    // Step 3: Neural upscaling
    setTimeout(() => {
      setJob((prev) => prev ? {
        ...prev,
        stage: 'upscaling',
        progress: 78,
        stageMessage: `Applying neural super-resolution to ${quality.toUpperCase()}...`,
        estimatedSecondsLeft: 2,
      } : null);
    }, 4000);

    // Step 4: Finalizing & procedural video generation
    setTimeout(async () => {
      setJob((prev) => prev ? {
        ...prev,
        stage: 'finalizing',
        progress: 92,
        stageMessage: 'Finalizing temporal color grading and audio synchronization...',
        estimatedSecondsLeft: 1,
      } : null);

      try {
        const durationSec = parseDurationSeconds(duration);
        const { blobUrl, thumbnailUrl } = await renderProceduralVideoBlob(currentParams, durationSec);

        const newVideoItem: VideoItem = {
          id: `vid-${Date.now()}`,
          title: prompt.slice(0, 45).trim() + (prompt.length > 45 ? '...' : ''),
          prompt: currentParams.prompt,
          negativePrompt: currentParams.negativePrompt,
          videoUrl: blobUrl,
          thumbnailUrl,
          style: currentParams.style,
          aspectRatio: currentParams.aspectRatio,
          duration: currentParams.duration,
          quality: currentParams.quality,
          cameraControl: currentParams.cameraControl,
          createdAt: 'Just now',
          authorName: user.name,
          authorAvatar: user.avatar,
          likes: 1,
          views: 1,
          category: style === 'anime' ? 'Animation' : style === 'fantasy' ? 'Fantasy' : 'Cinematic',
          isFavorite: false,
          isSaved: true,
          tags: [style, cameraControl, quality],
        };

        // Deduct user credits
        onDeductCredits(creditCost);

        // Store video in global state
        onVideoCreated(newVideoItem);
        setActiveVideo(newVideoItem);
        setIsSavedFavorite(false);

        setJob((prev) => prev ? {
          ...prev,
          stage: 'completed',
          progress: 100,
          stageMessage: 'Generation complete!',
          resultVideo: newVideoItem,
        } : null);

        showToast('success', 'Video Generated!', `Successfully rendered in ${quality.toUpperCase()} (${duration}).`);
      } catch (err) {
        console.error('Video rendering error:', err);
        setJob((prev) => prev ? {
          ...prev,
          stage: 'error',
          stageMessage: 'An error occurred while generating the video.',
          error: 'Generation timeout or rendering pipeline glitch',
        } : null);
        showToast('error', 'Generation Failed', 'Could not complete video rendering. Please try again.');
      }
    }, 5400);
  };

  // Video Action Handlers
  const handleDownload = () => {
    if (!activeVideo) return;
    const a = document.createElement('a');
    a.href = activeVideo.videoUrl;
    a.download = `visionflow-${activeVideo.style}-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'Download Started', 'Your high-definition AI video is downloading.');
  };

  const handleShare = () => {
    if (!activeVideo) return;
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('success', 'Link Copied', 'Shareable video link copied to clipboard.');
    }
  };

  const handleRegenerate = () => {
    setSeed(Math.floor(Math.random() * 999999));
    handleGenerate();
  };

  const handleEdit = () => {
    promptInputRef.current?.focus();
    showToast('info', 'Edit Prompt', 'Modify your prompt or settings, then click Generate.');
  };

  const handleCreateVariation = () => {
    // Select an alternate camera shot for variation
    const cameraCycle: CameraControl[] = ['drone-shot', 'tracking-shot', 'close-up', 'wide-shot'];
    const nextCam = cameraCycle[(cameraCycle.indexOf(cameraControl) + 1) % cameraCycle.length];
    setCameraControl(nextCam);
    setSeed(Math.floor(Math.random() * 999999));
    showToast('info', 'Creating Variation', `Switched camera to ${nextCam.replace('-', ' ')} with fresh seed.`);
    setTimeout(() => {
      handleGenerate();
    }, 300);
  };

  const handleToggleFavorite = () => {
    setIsSavedFavorite(!isSavedFavorite);
    if (!isSavedFavorite) {
      showToast('success', 'Saved to Favorites', 'Added to your favorites collection.');
    }
  };

  // Player controls
  const togglePlay = () => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        videoPlayerRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoPlayerRef.current) {
      setCurrentTime(videoPlayerRef.current.currentTime);
      setTotalDuration(videoPlayerRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (videoPlayerRef.current) {
      if (videoPlayerRef.current.requestFullscreen) {
        videoPlayerRef.current.requestFullscreen();
      }
    }
  };

  // Determine aspect ratio class for the video container
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-w-[360px] mx-auto';
      case '1:1':
        return 'aspect-square max-w-[480px] mx-auto';
      case '16:9':
      default:
        return 'aspect-video w-full';
    }
  };

  const isGenerating = job && job.stage !== 'completed' && job.stage !== 'error';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Film className="w-4 h-4" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
              AI Video Generator
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Synthesize high-fidelity cinematic video scenes with full director camera control.
          </p>
        </div>

        {/* User Credit Status Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border-slate-800 text-xs">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-slate-300">Balance:</span>
            <span className="font-bold text-white text-sm">{user.creditsRemaining}</span>
            <span className="text-slate-500">/ {user.totalCredits}</span>
          </div>
          <button
            id="generator-topup-btn"
            onClick={onOpenPricing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition-colors"
          >
            Get More
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Configuration Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Prompt Card */}
          <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="generator-prompt-textarea" className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Text Prompt</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  id="generator-surprise-btn"
                  type="button"
                  onClick={handleSurpriseMe}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                  title="Random prompt inspiration"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Surprise Me</span>
                </button>
                <button
                  id="generator-enhance-btn"
                  type="button"
                  onClick={handleEnhancePrompt}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-xs text-cyan-300 border border-cyan-500/30 transition-colors"
                  title="Enhance prompt with cinematic lighting & camera details"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Enhance with AI</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="generator-prompt-textarea"
                ref={promptInputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={600}
                placeholder="Describe the scene, motion, lighting, characters, and atmosphere in detail..."
                className="w-full p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all resize-none leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500 px-1">
                <span>Supports natural language, descriptive verbs, and artistic styles</span>
                <span>{prompt.length}/600 chars</span>
              </div>
            </div>

            {/* Advanced Settings Accordion */}
            <div>
              <button
                id="generator-advanced-toggle"
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings (Negative Prompt, Motion, Seed)'}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-4 animate-in fade-in">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">
                      Negative Prompt (What to exclude):
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="e.g. blurry, text, low quality, artifacts..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Motion Intensity:</span>
                        <span className="font-mono text-cyan-400 font-bold">{motionIntensity} / 10</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={motionIntensity}
                        onChange={(e) => setMotionIntensity(parseInt(e.target.value))}
                        className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Seed:</span>
                        <button
                          type="button"
                          onClick={() => setSeed(Math.floor(Math.random() * 999999))}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          Randomize
                        </button>
                      </div>
                      <input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 1. Video Style Selector */}
          <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Video Style</span>
              </label>
              <span className="text-xs text-slate-400 capitalize font-medium">Selected: {style.replace('-', ' ')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {stylesList.map((item) => {
                const isSelected = style === item.id;
                return (
                  <button
                    key={item.id}
                    id={`style-btn-${item.id}`}
                    type="button"
                    onClick={() => setStyle(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400/60 shadow-lg shadow-cyan-500/15'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1.5">{item.icon}</div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Aspect Ratio & 3. Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Aspect Ratio */}
            <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Aspect Ratio</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ar) => {
                  const isSelected = aspectRatio === ar.id;
                  return (
                    <button
                      key={ar.id}
                      id={`ratio-btn-${ar.id.replace(':', '-')}`}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`py-2.5 px-2 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{ar.ratio}</p>
                      <p className="text-[10px] opacity-75 truncate mt-0.5">{ar.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Video Duration */}
            <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Video Duration</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((d) => {
                  const isSelected = duration === d;
                  return (
                    <button
                      key={d}
                      id={`duration-btn-${d}`}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2.5 rounded-xl text-center border transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <p className="text-xs font-bold">{d}</p>
                      <p className="text-[10px] opacity-75">{d === '5s' ? 'Fast' : d === '30s' ? 'Long' : 'Standard'}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Quality & 5. Camera Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quality */}
            <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Render Quality</span>
                </label>
              </div>
              <div className="space-y-2">
                {qualities.map((q) => {
                  const isSelected = quality === q.id;
                  return (
                    <button
                      key={q.id}
                      id={`quality-btn-${q.id}`}
                      type="button"
                      onClick={() => setQuality(q.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">{q.name}</span>
                      {q.tag && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          q.id === '4k'
                            ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                            : 'bg-cyan-500/20 text-cyan-300'
                        }`}>
                          {q.tag}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Camera Controls */}
            <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-xl space-y-3">
              <label className="text-sm font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Camera Motion</span>
              </label>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {cameraControls.map((c) => {
                  const isSelected = cameraControl === c.id;
                  return (
                    <button
                      key={c.id}
                      id={`camera-btn-${c.id}`}
                      type="button"
                      onClick={() => setCameraControl(c.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              id="generator-submit-btn"
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-base shadow-2xl transition-all select-none ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Video</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-xs font-mono font-medium border border-white/10">
                    Cost: {getRequiredCredits()} Credits
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Generation Progress & Video Player (5 cols) */}
        <div id="generation-viewport-container" className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl p-5 glass-panel border-slate-800 shadow-2xl sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <span className="text-sm font-semibold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span>Video Studio Viewport</span>
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
                  {aspectRatio}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono">
                  {quality}
                </span>
              </div>
            </div>

            {/* Viewport Content: Generating State vs Active Video vs Empty State */}
            {isGenerating ? (
              /* Live Generation Progress View */
              <div id="generation-progress-card" className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-6 bg-slate-950/80 rounded-2xl border border-cyan-500/20">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"
                    style={{ animationDuration: '1.2s' }}
                  />
                  <div className="flex flex-col items-center justify-center z-10">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {job?.progress}%
                    </span>
                    <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider">
                      Processing
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <p className="text-sm font-bold text-white tracking-wide">
                    {job?.stageMessage}
                  </p>
                  <p className="text-xs text-slate-400">
                    Estimated time remaining: ~{job?.estimatedSecondsLeft}s
                  </p>
                </div>

                {/* Multi-step pipeline pill bar */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 transition-all duration-500 rounded-full"
                    style={{ width: `${job?.progress || 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-4 gap-1 w-full text-[10px] font-mono text-slate-500">
                  <span className={job && job.progress >= 20 ? 'text-cyan-400 font-bold' : ''}>Prompt</span>
                  <span className={job && job.progress >= 50 ? 'text-cyan-400 font-bold' : ''}>Latents</span>
                  <span className={job && job.progress >= 75 ? 'text-cyan-400 font-bold' : ''}>Motion</span>
                  <span className={job && job.progress >= 95 ? 'text-cyan-400 font-bold' : ''}>4K Upscale</span>
                </div>
              </div>
            ) : activeVideo ? (
              /* Generated Video Player View */
              <div className="space-y-4">
                <div className={`relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl ${getAspectRatioClass()}`}>
                  <video
                    id="active-generated-video"
                    ref={videoPlayerRef}
                    src={activeVideo.videoUrl}
                    poster={activeVideo.thumbnailUrl}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-cover"
                  />

                  {/* Top Bar HUD */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-cyan-300 border border-white/10 font-mono">
                      {activeVideo.quality.toUpperCase()} • {activeVideo.duration}
                    </span>
                    <button
                      id="video-favorite-toggle"
                      onClick={handleToggleFavorite}
                      className="pointer-events-auto p-2 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white border border-white/10 transition-colors"
                      aria-label="Save to favorites"
                    >
                      <Heart className={`w-4 h-4 ${isSavedFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Bottom Video Controls Overlay */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2 z-10">
                    {/* Scrubber Slider */}
                    <input
                      id="video-timeline-scrubber"
                      type="range"
                      min="0"
                      max={totalDuration || 10}
                      step="0.05"
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 accent-cyan-400 bg-white/20 rounded-lg cursor-pointer"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <button
                          id="video-play-toggle-btn"
                          onClick={togglePlay}
                          className="p-1 hover:text-cyan-400 transition-colors"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          id="video-sound-toggle-btn"
                          onClick={toggleMute}
                          className="p-1 hover:text-cyan-400 transition-colors"
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <span className="font-mono text-[11px] text-slate-400">
                          {currentTime.toFixed(1)}s / {(totalDuration || 10).toFixed(1)}s
                        </span>
                      </div>

                      <button
                        id="video-fullscreen-btn"
                        onClick={handleFullscreen}
                        className="p-1 hover:text-cyan-400 transition-colors"
                        aria-label="Fullscreen"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Prompt Detail Snippet */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="font-semibold text-slate-300">Generation Parameters</span>
                    <span className="capitalize text-cyan-400 font-mono">
                      {activeVideo.style} • {activeVideo.cameraControl.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-300 line-clamp-2 italic">“{activeVideo.prompt}”</p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="video-action-download"
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Video</span>
                  </button>

                  <button
                    id="video-action-share"
                    type="button"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-all hover:scale-[1.02]"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                    <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
                  </button>

                  <button
                    id="video-action-regenerate"
                    type="button"
                    onClick={handleRegenerate}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-indigo-400" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    id="video-action-variation"
                    type="button"
                    onClick={handleCreateVariation}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors"
                  >
                    <Wand2 className="w-4 h-4 text-sky-400" />
                    <span>Create Variation</span>
                  </button>
                </div>

                <div className="flex justify-end">
                  <button
                    id="video-action-edit"
                    type="button"
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Prompt in Editor</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Empty Standby State */
              <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Film className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Ready for Generation</h3>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    Enter your scene description on the left and select your camera and style options to synthesize your video.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    ⚡ Sub-10s Rendering
                  </span>
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                    🎥 Pro Camera Trajectories
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
