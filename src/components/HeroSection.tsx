import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Play, Pause, Volume2, VolumeX, Wand2, Film, Layers, CheckCircle } from 'lucide-react';
import { EXAMPLE_HERO_PROMPTS } from '../data/mockVideos';

interface HeroSectionProps {
  onStartGenerate: (initialPrompt: string) => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartGenerate, onExplore }) => {
  const [promptInput, setPromptInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const heroSampleVideo = 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-traffic-at-night-42898-large.mp4';
  const heroPoster = 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop';

  const handleGenerateClick = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const promptToSend = promptInput.trim() || EXAMPLE_HERO_PROMPTS[0];
    onStartGenerate(promptToSend);
  };

  const handleSelectExample = (example: string) => {
    setPromptInput(example);
    onStartGenerate(example);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-10 w-[350px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-fuchsia-600/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-panel border-cyan-500/30 text-xs text-slate-300 shadow-lg shadow-cyan-950/40">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-cyan-300">VisionFlow v2.5 Cinematic Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Next-Gen Generative Latent Diffusion</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Turn Your Words Into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Stunning Videos
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-slate-300/90 font-light max-w-2xl mx-auto leading-relaxed">
            Create cinematic AI videos from simple text prompts in seconds.
          </p>
        </div>

        {/* Large Prompt Input Form */}
        <div className="max-w-3xl mx-auto mb-10">
          <form
            onSubmit={handleGenerateClick}
            className="relative rounded-2xl p-2 sm:p-2.5 glass-panel border-slate-700/70 shadow-2xl shadow-cyan-950/30 glow-cyan transition-all focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 flex items-center pl-3">
                <Wand2 className="w-5 h-5 text-cyan-400 shrink-0 mr-3" />
                <input
                  id="hero-prompt-input"
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe the video you want to create…"
                  className="w-full bg-transparent text-white placeholder:text-slate-400/80 text-base sm:text-lg focus:outline-none py-3"
                />
              </div>
              <button
                id="hero-generate-button"
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/45 transition-all transform active:scale-95 text-base select-none shrink-0"
              >
                <Sparkles className="w-5 h-5" />
                <span>Generate Video</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </form>

          {/* Example Prompts List */}
          <div className="mt-5">
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Try these example prompts:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_HERO_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  id={`example-prompt-chip-${idx}`}
                  type="button"
                  onClick={() => handleSelectExample(promptText)}
                  className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 group-hover:bg-cyan-400" />
                  <span className="line-clamp-1">“{promptText}”</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Cinematic Video Preview Player */}
        <div className="max-w-5xl mx-auto mt-14">
          <div className="relative rounded-3xl p-1.5 bg-gradient-to-b from-cyan-500/30 via-slate-800/40 to-indigo-500/20 shadow-2xl shadow-cyan-950/50">
            <div className="relative aspect-video rounded-[22px] overflow-hidden bg-slate-950 border border-slate-800/80">
              <video
                ref={videoRef}
                src={heroSampleVideo}
                poster={heroPoster}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Gradient overlays for cinematic contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40 pointer-events-none" />

              {/* Video Header HUD */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold text-emerald-300 font-mono">LIVE PREVIEW</span>
                  </div>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-cyan-950/60 backdrop-blur-md border border-cyan-500/30 text-xs text-cyan-300 font-mono">
                    4K • 60 FPS
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 text-xs text-indigo-300 font-mono">
                    Drone Shot
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="hero-toggle-sound-btn"
                    onClick={toggleMute}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white hover:text-cyan-400 transition-colors"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    id="hero-toggle-play-btn"
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-white hover:text-cyan-400 transition-colors"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Video Bottom HUD / Prompt Box */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 bg-black/70 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1 font-mono uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Prompt Rendered in 8.4 seconds</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-white line-clamp-2">
                    “A futuristic city at night with flying cars, neon skyscrapers in purple and cyan, reflective wet asphalt, cinematic 4K depth of field”
                  </p>
                </div>

                <button
                  id="hero-remix-btn"
                  onClick={() => onStartGenerate('A futuristic city at night with flying cars, neon skyscrapers in purple and cyan, reflective wet asphalt, cinematic 4K depth of field')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shrink-0 transition-all hover:scale-105"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Use This Prompt</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Bento Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-16">
          <div className="p-4 rounded-2xl glass-panel border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
              <Film className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white font-display">4K Ultra HD</p>
            <p className="text-xs text-slate-400 mt-1">Ultra-sharp photorealistic resolution up to 60 FPS</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white font-display">7 Custom Styles</p>
            <p className="text-xs text-slate-400 mt-1">From Cinematic and Anime to 3D and Fantasy</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
              <Wand2 className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white font-display">Camera Motion</p>
            <p className="text-xs text-slate-400 mt-1">Drone swoops, tracking shots, close-ups & wide pans</p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <CheckCircle className="w-4 h-4" />
            </div>
            <p className="text-xl font-bold text-white font-display">Commercial Use</p>
            <p className="text-xs text-slate-400 mt-1">Full commercial rights for creators, studios, and agencies</p>
          </div>
        </div>
      </div>
    </section>
  );
};
