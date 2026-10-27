import React, { useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { ChevronLeft, ChevronRight, Play, Users, Sparkles, Activity } from 'lucide-react';

export default function NetflixRowTrending() {
  const { rooms, openTheater } = useWatchParty();
  const scrollRef = useRef(null);

  function scroll(dir) {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -420 : 420;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  return (
    <div className="w-full flex flex-col gap-3 group/row relative select-none">
      <div className="flex items-center justify-between px-6 lg:px-12">
        <h2 className="font-display text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>Trending Live Watch Parties</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Synchronized
          </span>
        </h2>
        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
          Click any room to jump into live synchronized theater
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Scrolling Cards */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6 lg:px-12 py-2"
        >
          {rooms.map((room) => {
            const pb = room.playback || {};
            const thumb =
              pb.mediaThumbnail ||
              'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80';

            return (
              <div
                key={room.roomId}
                onClick={() => openTheater(room.roomId)}
                className="w-72 sm:w-84 shrink-0 rounded-xl overflow-hidden bg-[#0c1224] border border-white/10 hover:border-red-500/50 transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer group/card flex flex-col"
              >
                {/* Media Image with Live Badges */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={thumb}
                    alt={room.name}
                    className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                  />

                  {/* Top Live Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#E50914] text-white font-mono text-[10px] font-black uppercase tracking-wider shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    <span>LIVE</span>
                  </div>

                  {/* Viewer Count Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 font-mono text-[10px] text-white font-semibold">
                    <Users className="w-3 h-3 text-purple-400" />
                    <span>{room.viewerCount || 42}</span>
                  </div>

                  {/* Center Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black shadow-lg transform group-hover/card:scale-110 transition-transform">
                      <Play className="w-5 h-5 ml-0.5 fill-black" />
                    </div>
                  </div>

                  {/* Playhead Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div className="h-full bg-[#E50914] w-2/5"></div>
                  </div>
                </div>

                {/* Card Meta Content */}
                <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span className="text-[#E50914] font-bold uppercase tracking-wider">
                        {room.category}
                      </span>
                      <span>Host: @{room.hostUsername}</span>
                    </div>

                    <h3 className="font-display text-sm font-bold text-white group-hover/card:text-[#E50914] transition-colors mt-0.5 truncate">
                      {room.name}
                    </h3>

                    <p className="font-sans text-xs text-slate-400 truncate mt-0.5">
                      Now Playing: {pb.mediaTitle || '4K Cinematic'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 font-mono text-[11px]">
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#E50914]" />
                      &lt;0.05s Drift
                    </span>
                    <span className="text-white font-bold group-hover/card:underline">
                      Join Party →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-20 w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
