import React from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import { X, Tv, Users, Play, ArrowRight } from 'lucide-react';

export default function RoomSelectorModal() {
  const { roomModalOpen, setRoomModalOpen, rooms, activeRoomId, switchRoom } = useWatchParty();

  if (!roomModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#080d1a] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 flex flex-col gap-5 text-white font-mono text-xs">
        <button
          onClick={() => setRoomModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              ACTIVE ENCLAVES
            </span>
            <h2 className="font-display text-lg font-bold text-white">Select Watch Party Room</h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
          {rooms.map((room) => {
            const isSelected = room.roomId === activeRoomId;

            return (
              <button
                key={room.roomId}
                onClick={() => switchRoom(room.roomId)}
                className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all group ${
                  isSelected
                    ? 'bg-primary/15 border-primary/40 ring-1 ring-primary/30 shadow-[0_0_20px_rgba(229,9,20,0.3)]'
                    : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      {room.category}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Users className="w-3 h-3 text-secondary" />
                      {room.viewerCount || 42} viewers
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-white group-hover:text-primary transition-colors mt-0.5">
                    {room.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                    {room.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-primary font-bold">
                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-[#050814] text-[10px]">
                      CURRENT
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
