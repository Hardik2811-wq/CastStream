import React, { useState, useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { Flame, Sparkles } from 'lucide-react';

const EMOJI_PRESETS = [
  { emoji: '🔥', label: 'Fire', color: '#f97316' },
  { emoji: '🚀', label: 'Rocket', color: '#8b5cf6' },
  { emoji: '❤️', label: 'Love', color: '#ec4899' },
  { emoji: '💀', label: 'Dead', color: '#94a3b8' },
  { emoji: '🤯', label: 'Mindblown', color: '#eab308' },
  { emoji: '🍿', label: 'Popcorn', color: '#f59e0b' },
  { emoji: '👏', label: 'Clap', color: '#10b981' },
  { emoji: '⚡', label: 'Hype', color: '#06b6d4' },
];

export default function ReactionDock() {
  const { sendReaction } = useWatchParty();
  const [comboState, setComboState] = useState({ count: 0, emoji: '🔥' });
  const comboTimerRef = useRef(null);

  function handleEmojiClick(emoji, e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.closest('#video-stage-container');
    let relX = 0.5;
    let relY = 0.85;

    if (container) {
      const cRect = container.getBoundingClientRect();
      relX = (rect.left + rect.width / 2 - cRect.left) / cRect.width;
      relY = 0.88;
    }

    // Combo system
    let nextCombo = 1;
    if (comboState.emoji === emoji && comboState.count > 0) {
      nextCombo = comboState.count + 1;
    }
    setComboState({ count: nextCombo, emoji });

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setComboState({ count: 0, emoji: '🔥' });
    }, 1800);

    sendReaction(emoji, relX, relY, nextCombo);
  }

  return (
    <div className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#0a0f1d]/90 backdrop-blur-xl border border-white/10 shadow-lg">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Flame className="w-4 h-4 animate-pulse" />
        </div>
        <div className="hidden sm:block">
          <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
            Live Reactions
          </div>
          <div className="font-mono text-xs text-slate-200">
            {comboState.count >= 3 ? (
              <span className="text-primary font-bold animate-bounce flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {comboState.count}x COMBO! {comboState.emoji}
              </span>
            ) : (
              'Mash to burst'
            )}
          </div>
        </div>
      </div>

      {/* Floating Emoji Mash Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {EMOJI_PRESETS.map((item) => (
          <button
            key={item.emoji}
            onClick={(e) => handleEmojiClick(item.emoji, e)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] active:scale-125 border border-white/10 hover:border-primary/40 flex items-center justify-center text-lg sm:text-xl transition-all duration-150 select-none cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            title={`Send ${item.label}`}
          >
            <span className="group-hover:scale-110 transition-transform">{item.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
