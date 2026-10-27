import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { Play, Info, Volume2, VolumeX, Sparkles, Users, Award } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NetflixBillboard() {
  const { openTheater, setInfoModalMedia, mediaPresets, viewerCount } = useWatchParty();
  const [isHeroMuted, setIsHeroMuted] = useState(true);

  const featured = mediaPresets[0] || {
    title: 'Tears of Steel',
    category: 'Sci-Fi Cyberpunk · 4K',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85',
  };

  return (
    <div className="relative w-full h-[78vh] min-h-[520px] max-h-[780px] overflow-hidden select-none">
      {/* Background Cinematic Visual / Video */}
      <div className="absolute inset-0">
        <img
          src={featured.thumbnail}
          alt={featured.title}
          className="w-full h-full object-cover object-center filter brightness-[0.72] transform scale-105 transition-transform duration-1000"
        />

        {/* Multi-directional Netflix Vignette & Gradient Shadows */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050811]/90 via-[#050811]/30 to-transparent"></div>
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#050811]/90 to-transparent"></div>
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto h-full px-6 lg:px-12 flex flex-col justify-end pb-20 sm:pb-28">
        <div className="max-w-2xl flex flex-col gap-4">
          {/* Top Pill Tags */}
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-sm bg-[#E50914] text-white font-mono text-[11px] font-black tracking-wider uppercase shadow-md">
              ORIGINAL WATCH PARTY
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 font-mono text-[11px] text-purple-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
              <span>{viewerCount} Viewers Watching Live</span>
            </div>
            <span className="text-slate-300 font-mono text-[11px]">98% Match</span>
          </div>

          {/* Hero Giant Title */}
          <div>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] uppercase">
              {featured.title}
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-300 font-medium tracking-wide mt-2">
              4K ULTRA HD · DOLBY ATMOS 5.1 · AUDIO SYNC TELEMETRY · ZURICH ENCLAVE
            </p>
          </div>

          {/* Narrative Synopsis */}
          <p className="font-sans text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed max-w-xl drop-shadow-md">
            In a dystopian cyberpunk future, a group of scientists and robotics engineers conduct a high-stakes memory recalibration to prevent catastrophic global annihilation. Live frame-synchronized watch party with community reaction physics.
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => openTheater('cyberpunk-cinema')}
              className="px-6 sm:px-8 py-3 rounded-md bg-white hover:bg-slate-200 text-black font-display font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-[0_4px_25px_rgba(255,255,255,0.3)] transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Watch Live Party</span>
            </button>

            <button
              onClick={() => setInfoModalMedia(featured)}
              className="px-5 sm:px-6 py-3 rounded-md bg-slate-500/35 hover:bg-slate-500/50 backdrop-blur-md border border-white/20 text-white font-display font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Edge Rating & Sound Pill */}
      <div className="absolute right-0 bottom-24 sm:bottom-32 z-20 flex items-center gap-3">
        <button
          onClick={() => {
            setIsHeroMuted(!isHeroMuted);
            sounds.playClick();
          }}
          className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          {isHeroMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="bg-[#050811]/80 backdrop-blur-md border-l-2 border-white/40 pl-3 pr-6 py-1 font-mono text-xs text-slate-200 font-bold">
          16+ · Violence, Sci-Fi
        </div>
      </div>
    </div>
  );
}
