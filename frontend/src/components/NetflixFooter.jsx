import React from 'react';
import { Film, Shield } from 'lucide-react';

export default function NetflixFooter() {
  return (
    <footer className="w-full mt-20 pt-12 pb-16 border-t border-white/5 bg-[#03050b] text-slate-500 font-sans text-xs">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex flex-col gap-8">
        {/* Social Icons & Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#E50914] flex items-center justify-center text-white font-bold text-xs">
              <Film className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-black text-white text-base tracking-tight uppercase">
              CastStream
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="font-mono text-[11px] text-[#E50914] flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse"></span>
              WebSocket NTP Active
            </span>
          </div>
        </div>

        {/* 4 Columns of Netflix Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-[11px] text-slate-400">
          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold mb-1">NAVIGATION</span>
            <span className="hover:text-white cursor-pointer transition-colors">Trending Watch Parties</span>
            <span className="hover:text-white cursor-pointer transition-colors">Open Cinema 4K</span>
            <span className="hover:text-white cursor-pointer transition-colors">Live Up Next Queue</span>
            <span className="hover:text-white cursor-pointer transition-colors">Audience Polls</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold mb-1">TELEMETRY & SYNC</span>
            <span className="hover:text-white cursor-pointer transition-colors">NTP Clock Calibration</span>
            <span className="hover:text-white cursor-pointer transition-colors">Drift Compensation</span>
            <span className="hover:text-white cursor-pointer transition-colors">Reaction Particle Canvas</span>
            <span className="hover:text-white cursor-pointer transition-colors">Multi-Node Enclave</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold mb-1">OPEN CONTENT</span>
            <span className="hover:text-white cursor-pointer transition-colors">Tears of Steel (Blender)</span>
            <span className="hover:text-white cursor-pointer transition-colors">Sintel (Open Movie)</span>
            <span className="hover:text-white cursor-pointer transition-colors">Big Buck Bunny</span>
            <span className="hover:text-white cursor-pointer transition-colors">Elephants Dream</span>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-white font-bold mb-1">PLATFORM</span>
            <span className="hover:text-white cursor-pointer transition-colors">MERN + WebSocket Engine</span>
            <span className="hover:text-white cursor-pointer transition-colors">Creative Commons 3.0</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600 font-mono text-[11px]">
          <span>© 2026 CastStream Inc. Synchronized Media Entertainment & Reaction Engine.</span>
          <span>Scalable MERN Architecture · Scaler End-Term Project</span>
        </div>
      </div>
    </footer>
  );
}
