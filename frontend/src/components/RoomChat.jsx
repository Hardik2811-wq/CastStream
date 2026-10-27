import React, { useState, useEffect, useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import {
  Send,
  CornerDownRight,
  X,
  Sparkles,
  Film,
  CheckCircle2,
  Flame,
  Crown,
  Star,
  Disc,
  BarChart3,
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function RoomChat() {
  const { messages, sendMessage, sendReaction, user, currentRoom, votePoll } = useWatchParty();
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [pollCollapsed, setPollCollapsed] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(inputText, replyingTo);
    setInputText('');
    setReplyingTo(null);
  }

  // Deduplicate consecutive identical system messages for clean presentation
  const cleanedMessages = messages.filter((msg, idx, arr) => {
    if (idx === 0) return true;
    const prev = arr[idx - 1];
    if (msg.type !== 'CHAT' && prev.type !== 'CHAT' && msg.text === prev.text && msg.username === prev.username) {
      return false;
    }
    return true;
  });

  const formatMsgTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const activePoll = currentRoom?.activePoll;
  const pollTotalVotes =
    activePoll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;
  const userHasVoted = activePoll?.votedUsers?.includes(user?.username);

  return (
    <div className="h-full flex flex-col justify-between bg-[#070b16]">
      {/* Pinned Active Poll Mini-Card (Synchronized with Theater) */}
      {activePoll && activePoll.isActive && (
        <div className="p-3 border-b border-white/10 bg-[#060a14]/95 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#E50914] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-ping"></span>
              <span>LIVE POLL · {pollTotalVotes} VOTES</span>
            </div>
            <button
              onClick={() => setPollCollapsed(!pollCollapsed)}
              className="text-[10px] text-slate-400 hover:text-white font-mono cursor-pointer"
            >
              {pollCollapsed ? 'Expand ▾' : 'Collapse ▴'}
            </button>
          </div>

          <h4 className="font-display text-xs font-bold text-white mb-2 line-clamp-1">
            {activePoll.question}
          </h4>

          {!pollCollapsed && (
            <div className="flex flex-col gap-1.5">
              {activePoll.options.map((opt) => {
                const pct =
                  pollTotalVotes > 0 ? Math.round((opt.votes / pollTotalVotes) * 100) : 0;

                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      votePoll(activePoll.id, opt.id);
                      sounds.playChime();
                    }}
                    disabled={userHasVoted}
                    className={`relative p-2 rounded-lg border text-left overflow-hidden transition-all duration-200 group text-xs ${
                      userHasVoted
                        ? 'bg-white/[0.02] border-white/5 cursor-default'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-[#E50914]/40 cursor-pointer active:scale-[0.99]'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-[#E50914]/20 rounded-lg transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                    <div className="relative z-10 flex items-center justify-between font-semibold">
                      <span className="text-white text-[11px] truncate">{opt.text}</span>
                      <span className="font-mono text-[#E50914] text-[11px] font-bold ml-2">
                        {pct}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3 font-mono text-xs pr-2"
      >
        {cleanedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 gap-2">
            <Sparkles className="w-8 h-8 text-slate-600" />
            <p className="font-sans text-xs">Be the first to speak in this watch party!</p>
          </div>
        ) : (
          cleanedMessages.map((msg, i) => {
            const isSystem =
              msg.type === 'SYSTEM' ||
              msg.type === 'MEDIA_SYNC' ||
              msg.type === 'POLL_EVENT' ||
              msg.type === 'QUEUE_EVENT';
            const isSelf = user && msg.username === user.username;

            if (isSystem) {
              return (
                <div
                  key={msg._id || i}
                  className="py-1 px-3 rounded-full bg-white/[0.04] border border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5 self-center max-w-full truncate shadow-sm my-0.5"
                >
                  {msg.type === 'MEDIA_SYNC' ? (
                    <Film className="w-3 h-3 text-[#E50914] shrink-0" />
                  ) : msg.type === 'POLL_EVENT' ? (
                    <CheckCircle2 className="w-3 h-3 text-purple-400 shrink-0" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  )}
                  <span className="font-bold text-slate-200">@{msg.username}</span>
                  <span className="truncate">{msg.text}</span>
                </div>
              );
            }

            const avatarBg =
              msg.badge === 'HOST'
                ? 'bg-[#E50914]'
                : msg.badge === 'DJ'
                ? 'bg-purple-600'
                : msg.badge === 'VIP'
                ? 'bg-amber-600'
                : 'bg-slate-700';

            return (
              <div
                key={msg._id || i}
                className={`flex items-start gap-2 max-w-[92%] ${
                  isSelf ? 'self-end flex-row-reverse' : 'self-start flex-row'
                }`}
              >
                {/* User Avatar Circle */}
                <div
                  className={`w-7 h-7 rounded-full ${avatarBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0 uppercase shadow-sm`}
                >
                  {msg.username ? msg.username[0] : 'U'}
                </div>

                <div className={`flex flex-col gap-1 ${isSelf ? 'items-end' : 'items-start'}`}>
                  {/* Reply Quote Preview */}
                  {msg.replyTo && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-xs">
                      <CornerDownRight className="w-3 h-3 text-[#E50914] shrink-0" />
                      <span className="font-bold">@{msg.replyTo.username}:</span>
                      <span className="truncate">{msg.replyTo.text}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`p-3 rounded-2xl border text-left transition-all group ${
                      isSelf
                        ? 'bg-gradient-to-r from-red-600/25 to-purple-600/25 border-red-500/40 text-white rounded-tr-xs shadow-[0_4px_15px_rgba(229,9,20,0.2)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100 text-xs">
                          {msg.username}
                        </span>

                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold flex items-center gap-1 ${
                            msg.badge === 'HOST'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : msg.badge === 'DJ'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : msg.badge === 'VIP'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {msg.badge === 'HOST' && <Crown className="w-2.5 h-2.5 text-[#E50914]" />}
                          {msg.badge === 'DJ' && <Disc className="w-2.5 h-2.5 text-purple-300" />}
                          {msg.badge === 'VIP' && <Star className="w-2.5 h-2.5 text-amber-300" />}
                          {msg.badge || 'MEMBER'}
                        </span>

                        {msg.createdAt && (
                          <span className="text-[9px] text-slate-500">
                            {formatMsgTime(msg.createdAt)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setReplyingTo({
                            id: msg._id,
                            username: msg.username,
                            text: msg.text,
                          })
                        }
                        className="text-[10px] text-slate-500 hover:text-[#E50914] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>

                    <p className="font-sans text-xs text-slate-100 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Section */}
      <div className="p-3 border-t border-white/10 bg-[#060a16]">
        {replyingTo && (
          <div className="mb-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between font-mono text-[11px] text-slate-300">
            <span className="truncate">
              Replying to <strong className="text-[#E50914]">@{replyingTo.username}</strong>:{' '}
              "{replyingTo.text}"
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:text-white text-slate-400 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Reaction Pill Chips above input */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto no-scrollbar py-0.5">
          {['🔥', '🚀', '❤️', '💀', '🤯', '🍿', '👏'].map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                sendReaction(emoji, 0.7, 0.85);
                sounds.playPop();
              }}
              className="px-2 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.12] border border-white/10 text-xs transition-transform active:scale-125 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send message to theater..."
            className="flex-1 bg-[#040711] border border-white/10 focus:border-[#E50914] rounded-xl px-4 py-2.5 font-sans text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E50914] transition-all"
          />

          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-[#E50914] hover:bg-red-700 text-white flex items-center justify-center transition-all active:scale-95 shadow-[0_0_15px_rgba(229,9,20,0.4)] cursor-pointer shrink-0 font-bold"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
