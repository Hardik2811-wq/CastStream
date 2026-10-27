import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { X, Film, Play, ListPlus, Link, Sparkles } from 'lucide-react';

export default function MediaPresetsModal() {
  const { presetModalOpen, setPresetModalOpen, mediaPresets, controlMedia, addQueueItem } = useWatchParty();
  const [customUrl, setCustomUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  if (!presetModalOpen) return null;

  function handlePlayImmediate(item) {
    // To change playback media, we can add to queue and advance or broadcast
    addQueueItem(item);
    setPresetModalOpen(false);
  }

  function handleAddQueue(item) {
    addQueueItem(item);
    setPresetModalOpen(false);
  }

  function handleCustomSubmit(e) {
    e.preventDefault();
    if (!customUrl) return;
    addQueueItem({
      title: customTitle || 'Custom Media Stream',
      url: customUrl,
      duration: 600,
      thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
    });
    setPresetModalOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#080d1a] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 flex flex-col gap-5 text-white font-mono text-xs">
        <button
          onClick={() => setPresetModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              OPEN CINEMA LIBRARY
            </span>
            <h2 className="font-display text-lg font-bold text-white">Select Synchronized Stream</h2>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {mediaPresets.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 flex flex-col justify-between gap-3 group transition-all"
            >
              <div className="flex gap-3">
                <img
                  src={item.thumbnail}
                  alt=""
                  className="w-20 h-14 rounded-lg object-cover border border-white/10 shrink-0"
                />
                <div className="overflow-hidden">
                  <span className="text-[9px] text-primary uppercase font-bold tracking-wider">
                    {item.category}
                  </span>
                  <h4 className="font-display text-xs font-bold text-white group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {Math.floor(item.duration / 60)} min · 4K Open Stream
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => handleAddQueue(item)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary font-bold text-[11px] flex items-center justify-center gap-1 transition-all"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  + Add to Queue
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Stream URL Form */}
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2.5">
          <span className="text-[11px] text-slate-300 font-bold flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-primary" />
            Paste Custom MP4 / HLS Stream Link:
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Stream Title (e.g. Cyberpunk Trailer)"
              className="flex-1 bg-[#040711] border border-white/10 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-primary focus:outline-none"
            />
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://.../video.mp4"
              className="flex-2 bg-[#040711] border border-white/10 rounded-lg px-3 py-2 text-white font-sans text-xs focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shrink-0 transition-colors"
            >
              Add Custom
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
