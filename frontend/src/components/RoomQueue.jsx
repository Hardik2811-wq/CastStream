import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { ListPlus, ThumbsUp, SkipForward, Play, Clock, Sparkles } from 'lucide-react';

export default function RoomQueue() {
  const { currentRoom, voteQueueItem, playNextQueue, user, setPresetModalOpen } = useWatchParty();
  const queue = currentRoom?.queue || [];

  return (
    <div className="h-full p-4 flex flex-col justify-between overflow-y-auto font-mono text-xs">
      <div className="flex flex-col gap-4">
        {/* Header & Controls */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ListPlus className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm text-white">Up Next Playlist</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-slate-400">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPresetModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              + Queue
            </button>

            <button
              onClick={playNextQueue}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
              title="Skip to next queued stream"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="flex flex-col gap-2.5">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-2">
              <ListPlus className="w-8 h-8 stroke-1 text-slate-600" />
              <p>Queue is empty. Add a cinematic stream to Up Next!</p>
              <button
                onClick={() => setPresetModalOpen(true)}
                className="mt-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold"
              >
                Browse Media Library
              </button>
            </div>
          ) : (
            queue.map((item, index) => {
              const hasVoted = user && item.voters?.includes(user.username);

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="text-[11px] font-bold text-slate-500 w-4">
                      #{index + 1}
                    </span>

                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-12 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-primary" />
                      </div>
                    )}

                    <div className="truncate">
                      <h4 className="font-display text-xs font-bold text-white group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">
                        Queued by @{item.submittedBy}
                      </p>
                    </div>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => voteQueueItem(item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-[11px] font-bold transition-all active:scale-95 ${
                      hasVoted
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{item.votes || 0}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 bg-[#070b16] rounded-xl text-[10px] text-slate-400 flex items-center justify-between">
        <span>Dynamic Crowd Queue</span>
        <span className="text-secondary font-bold">Auto-Sorts by Votes</span>
      </div>
    </div>
  );
}
