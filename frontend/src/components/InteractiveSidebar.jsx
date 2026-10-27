import React from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import RoomChat from './RoomChat';
import RoomPolls from './RoomPolls';
import RoomQueue from './RoomQueue';
import { MessageSquare, BarChart3, ListPlus, Users, Sparkles } from 'lucide-react';

export default function InteractiveSidebar() {
  const { activeTab, setActiveTab, currentRoom, viewerCount, user } = useWatchParty();

  const queueCount = currentRoom?.queue?.length || 0;
  const pollActive = currentRoom?.activePoll?.isActive;

  // Active Peer Avatars Stack dynamically generated from session
  const peerList = user
    ? [
        {
          name: user.username,
          role: user.badge || 'MEMBER',
          color: user.badge === 'HOST' ? 'bg-[#E50914]' : user.badge === 'DJ' ? 'bg-purple-600' : 'bg-amber-600',
        },
        { name: 'LivePeer_1', role: 'VIP', color: 'bg-indigo-600' },
        { name: 'LivePeer_2', role: 'MEMBER', color: 'bg-slate-700' },
      ]
    : [
        { name: 'Viewer_1', role: 'VIP', color: 'bg-indigo-600' },
        { name: 'Viewer_2', role: 'MEMBER', color: 'bg-slate-700' },
      ];

  return (
    <div className="w-full h-full min-h-[540px] lg:h-[calc(100vh-140px)] max-h-[780px] rounded-2xl bg-[#090e1c]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden">
      {/* Top Header: Watching Now Avatars + Tab Switcher */}
      <div className="p-3.5 border-b border-white/10 bg-[#060a16] flex flex-col gap-3">
        {/* Watching Now Avatars Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {peerList.map((p, i) => (
                <div
                  key={i}
                  className={`inline-block h-6 w-6 rounded-full ${p.color} ring-2 ring-[#060a16] text-[10px] font-bold text-white flex items-center justify-center uppercase shadow-sm`}
                  title={`${p.name} (${p.role})`}
                >
                  {p.name[0]}
                </div>
              ))}
            </div>
            <span className="font-mono text-[11px] text-slate-300 font-semibold">
              {viewerCount} Watching
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] text-red-400 font-bold bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-ping"></span>
            <span>Room Live</span>
          </div>
        </div>

        {/* Tab Switcher (Non-Green Crimson & Violet) */}
        <div className="grid grid-cols-3 gap-1 bg-[#040711] p-1 rounded-xl border border-white/5 font-mono text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-[#E50914]/20 text-white border border-[#E50914]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('polls')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all relative cursor-pointer ${
              activeTab === 'polls'
                ? 'bg-[#E50914]/20 text-white border border-[#E50914]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Polls</span>
            {pollActive && (
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#E50914]/20 text-white border border-[#E50914]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Queue</span>
            {queueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[9px] text-slate-300">
                {queueCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-hidden bg-[#070b16]">
        {activeTab === 'chat' && <RoomChat />}
        {activeTab === 'polls' && <RoomPolls />}
        {activeTab === 'queue' && <RoomQueue />}
      </div>
    </div>
  );
}
