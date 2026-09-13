import React from 'react';
import { Video, Sparkles, Github, Twitter, Disc as Discord, Shield, Cpu } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenPricing: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenPricing }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#05070b] text-slate-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1.5px]">
                <div className="w-full h-full bg-[#090b10] rounded-[6px] flex items-center justify-center">
                  <Video className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-display font-extrabold text-lg text-white">
                VisionFlow AI
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Next-generation generative AI text-to-video studio. Empowering creators, storytellers, and filmmakers to turn imagination into cinematic reality.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-lg w-fit">
              <Cpu className="w-3.5 h-3.5" />
              <span>GPU Clusters: Online • 99.98% Latent Uptime</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Studio
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('generator');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-300 transition-colors"
                >
                  AI Video Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('explore');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Explore Showcase
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentTab('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-300 transition-colors"
                >
                  My Generations
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onOpenPricing();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-300 transition-colors"
                >
                  Pricing & Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Video Capabilities */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Engine
            </h4>
            <ul className="space-y-2">
              <li className="text-slate-400">Cinematic 4K Rendering</li>
              <li className="text-slate-400">Multi-Angle Camera Paths</li>
              <li className="text-slate-400">Anamorphic Lenses</li>
              <li className="text-slate-400">Audio Sync & Spatial Sound</li>
              <li className="text-slate-400">Commercial Licensing</li>
            </ul>
          </div>

          {/* Community & Legal */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider mb-3 text-[11px]">
              Community
            </h4>
            <div className="flex items-center gap-3 mb-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Discord"
              >
                <Discord className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} VisionFlow AI Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
