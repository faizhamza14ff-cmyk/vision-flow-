import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Share2,
  Sparkles,
  Copy,
  Check,
  Heart,
  Calendar,
  Layers,
  Camera
} from 'lucide-react';
import { VideoItem } from '../types';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
  onRemix: (prompt: string, style: VideoItem['style'], camera: VideoItem['cameraControl']) => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  onClose,
  onRemix,
  showToast,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  if (!video) return null;

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleCopyPrompt = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(video.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('info', 'Prompt Copied', 'Prompt copied to your clipboard.');
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `visionflow-${video.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'Download Started', 'Your video file is downloading.');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Link Copied', 'Shareable link copied to clipboard.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="cinema-player-modal"
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#07090e] border border-slate-800 shadow-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/60 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-display font-bold text-white text-sm sm:text-base truncate max-w-md">
              {video.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Large Video Player + Metadata details */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Cinema Frame */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl mx-auto">
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />

            {/* Bottom Scrubber & Controls */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 flex flex-col gap-2 z-10">
              <input
                id="modal-timeline-scrubber"
                type="range"
                min="0"
                max={duration || 10}
                step="0.05"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 accent-cyan-400 bg-white/20 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button
                    id="modal-play-toggle"
                    onClick={togglePlay}
                    className="p-1.5 hover:text-cyan-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  <button
                    id="modal-sound-toggle"
                    onClick={toggleMute}
                    className="p-1.5 hover:text-cyan-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <span className="font-mono text-xs text-slate-300">
                    {currentTime.toFixed(1)}s / {(duration || 10).toFixed(1)}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 border border-white/10 text-cyan-300">
                    {video.quality.toUpperCase()}
                  </span>
                  <button
                    id="modal-fullscreen-btn"
                    onClick={handleFullscreen}
                    className="p-1.5 hover:text-cyan-400 transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prompt details (2 cols) */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Prompt Used</span>
                  </span>
                  <button
                    id="modal-copy-prompt-btn"
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed italic">
                  “{video.prompt}”
                </p>
              </div>

              {/* Creator & Community row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={video.authorAvatar}
                    alt={video.authorName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-500/40"
                  />
                  <div>
                    <p className="font-bold text-white">{video.authorName}</p>
                    <p className="text-slate-400 text-[11px]">Created {video.createdAt}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    id="modal-like-btn"
                    onClick={() => {
                      setIsLiked(!isLiked);
                      showToast('success', isLiked ? 'Unliked' : 'Liked', 'Updated community like.');
                    }}
                    className="flex items-center gap-1 text-slate-300 hover:text-rose-400"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{video.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Parameters & Actions (1 col) */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Style:</span>
                  <span className="font-bold text-white capitalize">{video.style}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Aspect Ratio:</span>
                  <span className="font-bold text-cyan-300 font-mono">{video.aspectRatio}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Camera:</span>
                  <span className="font-bold text-white capitalize">{video.cameraControl.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Duration:</span>
                  <span className="font-bold text-white font-mono">{video.duration}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Quality:</span>
                  <span className="font-bold text-cyan-400 font-mono">{video.quality.toUpperCase()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  id="modal-remix-btn"
                  onClick={() => {
                    onRemix(video.prompt, video.style, video.cameraControl);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Remix in Studio</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="modal-download-btn"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    id="modal-share-btn"
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
