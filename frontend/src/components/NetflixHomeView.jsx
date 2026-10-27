import React from 'react';
import NetflixBillboard from './NetflixBillboard';
import NetflixRowTrending from './NetflixRowTrending';
import NetflixRowTop10 from './NetflixRowTop10';
import NetflixRowOriginals from './NetflixRowOriginals';
import { useWatchParty } from '../context/WatchPartyContext';
import { Activity, ShieldCheck, Zap, Film } from 'lucide-react';

export default function NetflixHomeView() {
  const { searchQuery } = useWatchParty();

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 1. Cinematic Hero Billboard */}
      {!searchQuery && <NetflixBillboard />}

      {/* 2. Content Rows Stack */}
      <div className={`w-full flex flex-col gap-10 sm:gap-14 relative z-20 ${searchQuery ? 'pt-28' : '-mt-16 sm:-mt-24'}`}>
        {/* Trending Live Watch Parties Row */}
        <section id="trending-row">
          <NetflixRowTrending />
        </section>

        {/* Top 10 Streams Today Row */}
        <section id="top10-row">
          <NetflixRowTop10 />
        </section>

        {/* Originals & Shorts Row */}
        <section id="originals-row">
          <NetflixRowOriginals />
        </section>

        {/* Real-Time Sync Architecture Badge Card */}
        <section className="px-6 lg:px-12 py-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0c1224] via-[#090e1c] to-[#050811] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex flex-col gap-1.5">
              <span className="text-[#E50914] font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Zero-Latency Drift Compensation Engine
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Synchronized 4K Watch Parties Across Every Screen
              </h3>
              <p className="font-sans text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mt-1">
                Every frame, reaction particle, live poll, and chat quote is synchronized across all peers using NTP clock telemetry and a high-speed WebSocket matching engine.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">DRIFT TOLERANCE</span>
                <span className="text-[#E50914] font-bold text-base">&lt;0.05 SEC</span>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-slate-400 text-[10px] block">REACTION ENGINE</span>
                <span className="text-primary font-bold text-base">60 FPS GPU</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
