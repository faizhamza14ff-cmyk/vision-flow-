import React, { useState } from 'react';
import {
  Video,
  Clock,
  Bookmark,
  Heart,
  History,
  Download,
  Trash2,
  Play,
  Sparkles,
  Zap,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { VideoItem, UserProfile } from '../types';

interface UserDashboardProps {
  user: UserProfile;
  userVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onDeleteVideo: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onGoToGenerator: () => void;
  onOpenPricing: () => void;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  userVideos,
  onSelectVideo,
  onDeleteVideo,
  onToggleFavorite,
  onGoToGenerator,
  onOpenPricing,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'saved' | 'history' | 'favorites'>('recent');
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);

  const tabs = [
    { id: 'recent', label: 'Recent Generations', icon: Clock },
    { id: 'saved', label: 'Saved Videos', icon: Bookmark },
    { id: 'history', label: 'Generation History', icon: History },
    { id: 'favorites', label: 'Favorite Videos', icon: Heart },
  ] as const;

  const handleDownload = (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = video.videoUrl;
    a.download = `visionflow-${video.id}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('success', 'Download Started', 'Downloading video file.');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteVideo(id);
    showToast('info', 'Video Removed', 'Removed from your generations.');
  };

  const getFilteredVideos = () => {
    switch (activeTab) {
      case 'saved':
        return userVideos.filter((v) => v.isSaved);
      case 'favorites':
        return userVideos.filter((v) => v.isFavorite);
      case 'history':
        return userVideos;
      case 'recent':
      default:
        return userVideos.slice(0, 12);
    }
  };

  const filteredVideos = getFilteredVideos();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* User Dashboard Profile & Stats Card */}
      <div className="rounded-3xl p-6 sm:p-8 glass-panel border-slate-800 shadow-2xl mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/10 via-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-400/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 text-cyan-300 border border-cyan-400/30">
                  {user.plan} Member
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-300">
                <span>
                  <strong className="text-white font-mono">{userVideos.length}</strong> Videos Created
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white font-mono">
                    {userVideos.filter((v) => v.isFavorite).length}
                  </strong>{' '}
                  Favorites
                </span>
              </div>
            </div>
          </div>

          {/* Credits Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Zap className="w-6 h-6 fill-amber-400/20" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Remaining Credits
              </p>
              <p className="text-2xl font-display font-black text-white">
                {user.creditsRemaining}{' '}
                <span className="text-sm font-normal text-slate-400">/ {user.totalCredits}</span>
              </p>
            </div>
            <button
              id="dashboard-upgrade-plan-btn"
              onClick={onOpenPricing}
              className="ml-2 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
            >
              <span>Add Credits</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Filter Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`dashboard-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          id="dashboard-new-video-btn"
          onClick={onGoToGenerator}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Video Generation</span>
        </button>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="py-20 text-center glass-panel rounded-3xl border-slate-800 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No videos in this section</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {activeTab === 'favorites'
                ? "You haven't added any videos to your favorites yet. Click the heart icon on any video to bookmark it."
                : 'Start generating cinematic AI videos from text prompts now.'}
            </p>
          </div>
          <button
            id="dashboard-empty-cta-btn"
            onClick={onGoToGenerator}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg transition-transform hover:scale-105"
          >
            Create Your First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isHovered = hoveredVideoId === video.id;
            return (
              <div
                key={video.id}
                id={`my-video-card-${video.id}`}
                onMouseEnter={() => setHoveredVideoId(video.id)}
                onMouseLeave={() => setHoveredVideoId(null)}
                onClick={() => onSelectVideo(video)}
                className="group relative rounded-2xl overflow-hidden glass-panel-interactive border-slate-800 flex flex-col cursor-pointer"
              >
                {/* Media frame */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  {isHovered ? (
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/30 backdrop-blur-md border border-cyan-400/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold uppercase text-cyan-300 border border-white/10">
                      {video.style}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                      {video.quality} • {video.duration}
                    </span>
                  </div>
                </div>

                {/* Info & Quick Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>{video.createdAt}</span>
                      <span className="font-mono text-cyan-400 capitalize">
                        {video.cameraControl.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 italic">
                      “{video.prompt}”
                    </p>
                  </div>

                  {/* Action Bar */}
                  <div
                    className="pt-2 border-t border-slate-800 flex items-center justify-between"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      id={`card-favorite-btn-${video.id}`}
                      onClick={() => onToggleFavorite(video.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Toggle favorite"
                    >
                      <Heart
                        className={`w-4 h-4 ${video.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                      />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`card-download-btn-${video.id}`}
                        onClick={(e) => handleDownload(video, e)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </button>

                      <button
                        id={`card-delete-btn-${video.id}`}
                        onClick={(e) => handleDelete(video.id, e)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
