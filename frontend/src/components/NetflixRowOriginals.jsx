import React, { useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { Play, Plus, Info, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NetflixRowOriginals() {
  const { mediaPresets, openTheater, setInfoModalMedia } = useWatchParty();
  const scrollRef = useRef(null);

  function scroll(dir) {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  return (
    <div className="w-full flex flex-col gap-3 group/row relative select-none">
      <div className="flex items-center justify-between px-6 lg:px-12">
        <h2 className="font-display text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
          <span>CastStream Cinema Originals</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Open Source 4K
          </span>
        </h2>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-20 w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto no-scrollbar px-6 lg:px-12 py-2"
        >
          {mediaPresets.map((item, i) => (
            <div
              key={i}
              className="w-64 sm:w-72 shrink-0 rounded-xl overflow-hidden bg-[#0c1224] border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)] cursor-pointer group/card flex flex-col"
            >
              <div
                onClick={() => openTheater('cyberpunk-cinema')}
                className="relative aspect-video w-full overflow-hidden bg-black"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                />

                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-bold">
                  {Math.floor(item.duration / 60)}m
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                    <Play className="w-4 h-4 ml-0.5 fill-black" />
                  </div>
                </div>
              </div>

              {/* Hover Quick Card Details */}
              <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="text-red-400 font-bold">98% Match</span>
                    <span className="px-1 py-0.2 rounded border border-white/20 text-slate-300">16+</span>
                    <span className="text-slate-400">4K HDR</span>
                  </div>

                  <h3 className="font-display text-xs sm:text-sm font-bold text-white group-hover/card:text-primary transition-colors mt-1 truncate">
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-sans">{item.category}</span>
                </div>

                {/* Quick Icon Row */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openTheater('cyberpunk-cinema')}
                      className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center hover:bg-slate-200 transition-colors"
                      title="Play Live Watch Party"
                    >
                      <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                    </button>
                    <button
                      onClick={() => sounds.playVote()}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                      title="Add to My List"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => sounds.playPop()}
                      className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                      title="Like"
                    >
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setInfoModalMedia(item)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    title="More Info"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
