import React from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { X, Play, Plus, Heart, Share2, ShieldCheck, Activity, Users } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NetflixInfoModal() {
  const { infoModalMedia, setInfoModalMedia, openTheater, viewerCount } = useWatchParty();

  if (!infoModalMedia) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#090e1c] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setInfoModalMedia(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Visual Top */}
        <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-black shrink-0">
          <img
            src={infoModalMedia.thumbnail}
            alt={infoModalMedia.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090e1c] via-[#090e1c]/40 to-transparent"></div>

          {/* Action Row Inside Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-lg">
                {infoModalMedia.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 font-mono text-xs text-slate-300">
                <span className="text-red-400 font-bold">98% Match</span>
                <span>2026</span>
                <span className="px-1.5 py-0.2 rounded border border-white/20 text-[10px]">16+</span>
                <span>{Math.floor((infoModalMedia.duration || 600) / 60)}m</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-primary font-bold">4K ULTRA HD</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setInfoModalMedia(null);
                  openTheater('cyberpunk-cinema');
                }}
                className="px-6 py-2.5 rounded-lg bg-white hover:bg-slate-200 text-black font-display font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Join Party</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5 font-sans text-xs sm:text-sm text-slate-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2 flex flex-col gap-3">
              <p className="leading-relaxed">
                Tears of Steel was created in Amsterdam with high-end crowd-funded open source VFX pipelines. A crew of scientists and roboticists attempt to stage a crucial memory recreation from the past in order to settle an emotional rift that triggered an armed artificial intelligence apocalypse.
              </p>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 font-mono text-xs flex flex-col gap-2">
                <span className="text-primary font-bold text-[11px] uppercase tracking-wider">
                  Live Watch Party Telemetry
                </span>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Connected Viewers:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-secondary" />
                    {viewerCount} Live Peers
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Frame Drift Tolerance:</span>
                  <span className="text-red-400 font-bold">&lt;0.05s Auto-Compensated</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span>Reaction Physics Engine:</span>
                  <span className="text-white font-bold">60 FPS Particle Canvas Active</span>
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="flex flex-col gap-3 font-mono text-xs border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 text-slate-400">
              <div>
                <span className="text-slate-500 block text-[10px]">CATEGORY:</span>
                <span className="text-white font-semibold">{infoModalMedia.category || 'Sci-Fi & Cyberpunk'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">DIRECTOR:</span>
                <span className="text-white">Ian Hubert</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">AUDIO:</span>
                <span className="text-white">Spatial Dolby Atmos 5.1</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SYNC PROTOCOL:</span>
                <span className="text-purple-400">WebSocket NTP Heartbeat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
