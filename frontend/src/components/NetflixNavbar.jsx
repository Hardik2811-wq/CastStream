import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWatchParty } from '../context/WatchPartyContext';
import {
  Film,
  Search,
  Bell,
  Volume2,
  VolumeX,
  Tv,
  Users,
  ChevronDown,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/audio';

export default function NetflixNavbar() {
  const {
    viewMode,
    setViewMode,
    currentRoom,
    viewerCount,
    latency,
    drift,
    isSyncing,
    user,
    setRoomModalOpen,
    searchQuery,
    setSearchQuery,
    setAuthModalOpen,
    setAuthMode,
  } = useWatchParty();

  const [isScrolled, setIsScrolled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleToggleSound() {
    const state = sounds.toggleSound();
    setSoundEnabled(state);
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 lg:px-12 flex items-center justify-between ${
        isScrolled || viewMode === 'theater'
          ? 'h-16 bg-[#050811]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'h-20 bg-gradient-to-b from-[#050811]/95 via-[#050811]/60 to-transparent'
      }`}
    >
      {viewMode === 'theater' ? (
        /* Unified Cinematic Theater Top Bar */
        <div className="w-full flex items-center justify-between gap-4 font-mono text-xs">
          {/* Left: Brand + Exit to Home + Room Title */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button
              onClick={() => {
                setViewMode('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.6)]">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-xl text-[#E50914] tracking-tighter uppercase hidden sm:inline">
                CastStream
              </span>
            </button>

            <button
              onClick={() => {
                setViewMode('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white font-bold transition-all cursor-pointer shadow-sm text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Browse Home</span>
            </button>

            <span className="text-slate-600 hidden md:inline">/</span>

            <div className="hidden sm:flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white truncate max-w-[160px] md:max-w-xs">
                {currentRoom?.name || 'Cyberpunk 4K Film Club'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-bold">
                4K DOLBY
              </span>
            </div>
          </div>

          {/* Center: Live NTP Telemetry Pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-slate-300 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
            <span className="font-bold text-white">4K DOLBY SYNC</span>
            <span className="text-slate-600">·</span>
            <span className="text-red-400 font-bold">{latency}ms ping</span>
            <span className="text-slate-600">·</span>
            <span>{viewerCount} Watching</span>
          </div>

          {/* Right: Switch Enclave + SFX + Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={() => setRoomModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E50914]/15 hover:bg-[#E50914]/25 border border-[#E50914]/40 text-white font-bold transition-all cursor-pointer text-[11px] shadow-[0_0_15px_rgba(229,9,20,0.25)]"
            >
              <Tv className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Switch Enclave</span>
            </button>

            <button
              onClick={handleToggleSound}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer border border-white/10"
              title={soundEnabled ? 'Mute Web Audio SFX' : 'Enable Web Audio SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E50914]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-85 transition-opacity cursor-pointer group"
                title="Account Settings & Profile"
              >
                <div className="w-7 h-7 rounded-md bg-[#E50914] flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-semibold text-slate-200 font-sans group-hover:text-white">
                  @{user.username}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-red-700 text-white font-bold font-sans text-xs transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Standard Netflix Homepage Navbar */
        <>
          {/* Left: Brand + Nav Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={() => {
                setViewMode('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 group cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)]">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-black text-xl sm:text-2xl text-[#E50914] tracking-tighter uppercase drop-shadow-md">
                CastStream
              </span>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 font-sans text-xs sm:text-sm text-slate-300 font-medium">
              <button
                onClick={() => {
                  setViewMode('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`hover:text-white transition-colors cursor-pointer ${
                  viewMode === 'home' ? 'text-white font-bold' : ''
                }`}
              >
                Home
              </button>

              <button
                onClick={() => setRoomModalOpen(true)}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5 text-primary" />
                Watch Parties
              </button>

              <button
                onClick={() => {
                  setViewMode('home');
                  const el = document.getElementById('top10-row');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Top 10
              </button>

              <button
                onClick={() => {
                  setViewMode('home');
                  const el = document.getElementById('originals-row');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Movies & Shorts
              </button>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs">
            {/* Live Search Input */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <div className="flex items-center bg-black/60 border border-white/20 rounded-full px-3 py-1 animate-in fade-in duration-200">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Titles, parties, hosts..."
                    className="bg-transparent text-white placeholder-slate-500 text-xs focus:outline-none w-32 sm:w-48 font-sans"
                    onBlur={() => !searchQuery && setSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Viewer Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
              <span>{viewerCount} Live Peers</span>
            </div>

            {/* SFX Audio Toggle */}
            <button
              onClick={handleToggleSound}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute Web Audio SFX' : 'Enable Web Audio SFX'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E50914]" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* User Avatar Badge & Sign In Trigger */}
            {user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 border-l border-white/10 hover:opacity-85 transition-opacity cursor-pointer group"
                title="Account Settings & Profile"
              >
                <div className="w-7 h-7 rounded-md bg-[#E50914] flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 font-sans group-hover:text-white">
                    @{user.username}
                  </span>
                  <span className="text-[9px] font-mono text-red-400 font-bold -mt-0.5">
                    [{user.badge || 'MEMBER'}]
                  </span>
                </div>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-lg bg-[#E50914] hover:bg-red-700 text-white font-bold font-sans text-xs transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)] cursor-pointer"
              >
                Sign In
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}
