import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GeneratorDashboard } from './components/GeneratorDashboard';
import { ExploreGallery } from './components/ExploreGallery';
import { UserDashboard } from './components/UserDashboard';
import { PricingSection } from './components/PricingSection';
import { AuthModal } from './components/AuthModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { INITIAL_FEATURED_VIDEOS } from './data/mockVideos';
import { VideoItem, UserProfile, ToastMessage, PricingPlanId } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'generator' | 'explore' | 'dashboard' | 'pricing'>('home');
  const [generatorInitialPrompt, setGeneratorInitialPrompt] = useState<string>('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeCinemaVideo, setActiveCinemaVideo] = useState<VideoItem | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // User Profile state (persistent in localStorage if available)
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('visionflow_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'user-demo-alex',
      name: 'Alex Rivers',
      email: 'alex.rivers@visionflow.ai',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      plan: 'pro',
      creditsRemaining: 85,
      totalCredits: 150,
      isLoggedIn: true,
    };
  });

  // User's own videos
  const [userVideos, setUserVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('visionflow_my_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed initial user creations
    return INITIAL_FEATURED_VIDEOS.slice(0, 4);
  });

  // Global videos list for Explore
  const [allVideos, setAllVideos] = useState<VideoItem[]>(INITIAL_FEATURED_VIDEOS);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('visionflow_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('visionflow_my_videos', JSON.stringify(userVideos));
    } catch {}
  }, [userVideos]);

  // Toast Dispatcher
  const showToast = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Navigations & Quick Actions
  const handleStartGenerate = (promptText: string) => {
    setGeneratorInitialPrompt(promptText);
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemix = (promptText: string) => {
    setGeneratorInitialPrompt(promptText);
    setCurrentTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('info', 'Remix Loaded', 'Prompt and settings loaded into the studio.');
  };

  const handleDeductCredits = (amount: number): boolean => {
    if (user.creditsRemaining >= amount) {
      setUser((prev) => ({
        ...prev,
        creditsRemaining: prev.creditsRemaining - amount,
      }));
      return true;
    }
    return false;
  };

  const handleUpgradePlan = (planId: PricingPlanId, creditsToAdd: number) => {
    setUser((prev) => ({
      ...prev,
      plan: planId,
      creditsRemaining: prev.creditsRemaining + creditsToAdd,
      totalCredits: Math.max(prev.totalCredits, creditsToAdd),
    }));
  };

  const handleVideoCreated = (video: VideoItem) => {
    setUserVideos((prev) => [video, ...prev]);
    setAllVideos((prev) => [video, ...prev]);
  };

  const handleDeleteVideo = (id: string) => {
    setUserVideos((prev) => prev.filter((v) => v.id !== id));
    setAllVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleFavorite = (id: string) => {
    setUserVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  };

  const handleLogout = () => {
    setUser({
      id: 'guest',
      name: 'Guest Creator',
      email: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      plan: 'free',
      creditsRemaining: 5,
      totalCredits: 5,
      isLoggedIn: false,
    });
    showToast('info', 'Signed Out', 'You have been signed out.');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Main Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as typeof currentTab)}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenPricing={() => setCurrentTab('pricing')}
      />

      {/* Main Viewport Content based on active tab */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <>
            <HeroSection
              onStartGenerate={handleStartGenerate}
              onExplore={() => {
                setCurrentTab('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            {/* Embedded Explore Preview section on Homepage */}
            <div className="border-t border-slate-800/80 bg-slate-950/40 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-mono text-cyan-400">
                      Showcase & Inspiration
                    </span>
                    <h2 className="text-3xl font-display font-extrabold text-white mt-1">
                      Trending AI Creations
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('explore');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                  >
                    <span>View all community videos</span>
                    <span>→</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allVideos.slice(0, 3).map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setActiveCinemaVideo(v)}
                      className="group relative rounded-2xl overflow-hidden glass-panel-interactive border-slate-800 flex flex-col cursor-pointer"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-slate-950 relative">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase text-cyan-300">
                          {v.style}
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-slate-300">
                          {v.quality}
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {v.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 italic">“{v.prompt}”</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {currentTab === 'generator' && (
          <GeneratorDashboard
            initialPrompt={generatorInitialPrompt}
            user={user}
            onDeductCredits={handleDeductCredits}
            onVideoCreated={handleVideoCreated}
            onOpenPricing={() => setCurrentTab('pricing')}
            showToast={showToast}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreGallery
            videos={allVideos}
            onSelectVideo={(video) => setActiveCinemaVideo(video)}
            onUsePrompt={handleRemix}
            showToast={showToast}
          />
        )}

        {currentTab === 'dashboard' && (
          <UserDashboard
            user={user}
            userVideos={userVideos}
            onSelectVideo={(video) => setActiveCinemaVideo(video)}
            onDeleteVideo={handleDeleteVideo}
            onToggleFavorite={handleToggleFavorite}
            onGoToGenerator={() => {
              setCurrentTab('generator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPricing={() => setCurrentTab('pricing')}
            showToast={showToast}
          />
        )}

        {currentTab === 'pricing' && (
          <PricingSection
            user={user}
            onUpgradePlan={handleUpgradePlan}
            showToast={showToast}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
        showToast={showToast}
      />

      <VideoPlayerModal
        video={activeCinemaVideo}
        onClose={() => setActiveCinemaVideo(null)}
        onRemix={handleRemix}
        showToast={showToast}
      />

      {/* Footer */}
      <Footer
        setCurrentTab={(tab) => setCurrentTab(tab as typeof currentTab)}
        onOpenPricing={() => setCurrentTab('pricing')}
      />
    </div>
  );
}
