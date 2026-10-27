import React from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { Play } from 'lucide-react';

const TOP_10_ITEMS = [
  {
    rank: 1,
    title: 'Tears of Steel',
    category: 'Sci-Fi · Cyberpunk',
    roomId: 'cyberpunk-cinema',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    match: '99% Match',
    quality: '4K HDR',
  },
  {
    rank: 2,
    title: 'Sintel',
    category: 'Fantasy · Animation',
    roomId: 'cyberpunk-cinema',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    match: '97% Match',
    quality: '4K',
  },
  {
    rank: 3,
    title: 'Big Buck Bunny',
    category: 'Animation · Comedy',
    roomId: 'anime-warriors',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    match: '96% Match',
    quality: '4K Ultra HD',
  },
  {
    rank: 4,
    title: 'Elephants Dream',
    category: 'Sci-Fi · Surreal',
    roomId: 'lofi-study-lounge',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    match: '93% Match',
    quality: 'HD',
  },
  {
    rank: 5,
    title: 'For Bigger Blazes',
    category: 'Action · Teaser',
    roomId: 'cyberpunk-cinema',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    match: '91% Match',
    quality: '4K',
  },
];

export default function NetflixRowTop10() {
  const { openTheater } = useWatchParty();

  return (
    <div className="w-full flex flex-col gap-3 px-6 lg:px-12 select-none">
      <h2 className="font-display text-lg sm:text-2xl font-bold text-white flex items-center gap-2">
        <span>Top 10 Live Streams Today</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-[#E50914] text-white font-bold">
          GLOBAL
        </span>
      </h2>

      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
        {TOP_10_ITEMS.map((item) => (
          <div
            key={item.rank}
            onClick={() => openTheater(item.roomId)}
            className="flex items-end shrink-0 group cursor-pointer"
          >
            {/* Big Stylized Netflix Rank Number */}
            <span className="text-8xl sm:text-9xl font-black leading-none -mr-5 sm:-mr-7 select-none netflix-number z-10 drop-shadow-2xl">
              {item.rank}
            </span>

            {/* Poster Card */}
            <div className="relative w-36 sm:w-44 h-52 sm:h-64 rounded-xl overflow-hidden bg-[#0c1224] border border-white/10 group-hover:border-primary/50 group-hover:scale-105 transition-all duration-300 shadow-xl group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.8)]">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[10px] text-red-400 font-mono font-bold">
                  {item.match}
                </span>
                <h3 className="font-display text-xs sm:text-sm font-bold text-white truncate">
                  {item.title}
                </h3>
                <span className="text-[9px] text-slate-400 font-mono">
                  {item.quality}
                </span>
              </div>

              {/* Hover Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-lg">
                  <Play className="w-4 h-4 ml-0.5 fill-black" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
