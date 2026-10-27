import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { Plus, CheckCircle2, Clock, BarChart3, Sparkles } from 'lucide-react';

export default function RoomPolls() {
  const { currentRoom, votePoll, user, setNewPollModalOpen } = useWatchParty();
  const poll = currentRoom?.activePoll;

  const totalVotes = poll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const hasVoted = poll?.votedUsers?.includes(user?.username);

  return (
    <div className="h-full p-4 flex flex-col justify-between overflow-y-auto font-mono text-xs">
      <div className="flex flex-col gap-4">
        {/* Header & Launch Poll Button */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="font-display font-bold text-sm text-white">Live Audience Polls</span>
          </div>
          <button
            onClick={() => setNewPollModalOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-bold text-[11px] flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Poll
          </button>
        </div>

        {/* Active Poll Card */}
        {poll && poll.isActive ? (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] text-primary uppercase tracking-widest font-bold">
                  ACTIVE POLL · {totalVotes} VOTES
                </span>
                <h3 className="font-display text-sm font-bold text-white mt-0.5 leading-snug">
                  {poll.question}
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-secondary" />
                Live
              </span>
            </div>

            {/* Options List */}
            <div className="flex flex-col gap-2.5 mt-1">
              {poll.options.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                return (
                  <button
                    key={opt.id}
                    onClick={() => votePoll(poll.id, opt.id)}
                    disabled={hasVoted}
                    className={`relative p-3 rounded-xl border text-left flex flex-col justify-between overflow-hidden transition-all duration-200 group ${
                      hasVoted
                        ? 'bg-white/[0.02] border-white/5 cursor-default'
                        : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 hover:border-primary/40 cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    {/* Progress Bar Background Fill */}
                    <div
                      className="absolute inset-0 bg-primary/15 transition-all duration-500 rounded-xl"
                      style={{ width: `${pct}%` }}
                    ></div>

                    <div className="relative z-10 flex items-center justify-between text-xs font-semibold">
                      <span className="text-white group-hover:text-primary transition-colors">
                        {opt.text}
                      </span>
                      <span className="font-mono text-primary font-bold">{pct}%</span>
                    </div>

                    <div className="relative z-10 text-[10px] text-slate-400 mt-1">
                      {opt.votes} vote{opt.votes === 1 ? '' : 's'}
                    </div>
                  </button>
                );
              })}
            </div>

            {hasVoted && (
              <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-center text-[11px] font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914]" />
                Vote Recorded on Enclave State Machine
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-2">
            <BarChart3 className="w-8 h-8 stroke-1 text-slate-600" />
            <p>No active poll in this watch party</p>
            <button
              onClick={() => setNewPollModalOpen(true)}
              className="mt-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold"
            >
              Start First Poll
            </button>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-white/10 bg-[#070b16] rounded-xl text-[10px] text-slate-400 flex items-center justify-between">
        <span>Audience Consensus Protocol</span>
        <span className="text-primary font-bold">1-Click Socket Tally</span>
      </div>
    </div>
  );
}
