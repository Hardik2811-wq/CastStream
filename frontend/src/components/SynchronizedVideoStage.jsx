import React, { useState, useEffect, useRef } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import ReactionCanvas from './ReactionCanvas';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Sparkles,
  Shield,
  Zap,
  Activity,
  Flame,
  Users,
} from 'lucide-react';
import { sounds } from '../utils/audio';

const REACTION_EMOJIS = [
  { emoji: '🔥', label: 'Fire', key: '1' },
  { emoji: '💜', label: 'Love', key: '2' },
  { emoji: '⚡', label: 'Hype', key: '3' },
  { emoji: '🍿', label: 'Popcorn', key: '4' },
  { emoji: '💀', label: 'Dead', key: '5' },
  { emoji: '🤯', label: 'Mindblown', key: '6' },
  { emoji: '🚀', label: 'Rocket', key: '7' },
  { emoji: '👏', label: 'Clap', key: '8' },
];

export default function SynchronizedVideoStage() {
  const {
    currentRoom,
    videoRef,
    isPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    controlMedia,
    drift,
    isSyncing,
    latency,
    setPresetModalOpen,
    sendReaction,
    viewerCount,
  } = useWatchParty();

  const [controlsVisible, setControlsVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [combo, setCombo] = useState(0);
  const comboTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  const playback = currentRoom?.playback;
  const mediaUrl =
    playback?.mediaUrl ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
  const posterUrl =
    playback?.mediaThumbnail ||
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85';

  function handleLoadedMetadata() {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 734);
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }

  function handleTimeUpdate() {
    if (videoRef.current && !isScrubbing) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }

  function handleTogglePlay() {
    if (isPlaying) {
      controlMedia('PAUSE');
    } else {
      controlMedia('PLAY');
    }
  }

  function handleSeek(e) {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  }

  function handleSeekEnd(e) {
    setIsScrubbing(false);
    const val = Number(e.target.value);
    controlMedia('SEEK', val);
  }

  function handleToggleMute() {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (videoRef.current) {
      videoRef.current.muted = nextMute;
    }
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  }

  function handleFullscreen() {
    const container = document.getElementById('video-stage-container');
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function handleMouseMove() {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3200);
  }

  function triggerBurst(emoji, relX = 0.5, relY = 0.85) {
    const nextCombo = combo + 1;
    setCombo(nextCombo);

    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2200);

    sendReaction(emoji, relX, relY, nextCombo);
    sounds.playPop();
  }

  function handleEmojiBurst(emoji, e) {
    const container = document.getElementById('video-stage-container');
    let relX = 0.5;
    let relY = 0.85;

    if (e && e.currentTarget && container) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cRect = container.getBoundingClientRect();
      relX = (rect.left + rect.width / 2 - cRect.left) / cRect.width;
      relY = 0.85;
    }

    triggerBurst(emoji, relX, relY);
  }

  useEffect(() => {
    function handleKeyDown(e) {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key)) {
        const item = REACTION_EMOJIS.find((r) => r.key === e.key);
        if (item) {
          e.preventDefault();
          triggerBurst(item.emoji, 0.3 + Math.random() * 0.4, 0.8);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, combo]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative flex flex-col gap-3 select-none">
      {/* Crimson & Indigo Backlight Bloom */}
      <div className="absolute -inset-4 bg-gradient-to-r from-red-600/15 via-purple-600/15 to-rose-600/15 rounded-3xl blur-2xl pointer-events-none -z-10"></div>

      {/* Main Video Screen with Reaction Canvas */}
      <div
        id="video-stage-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setControlsVisible(false)}
        className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.9)] group"
      >
        {/* HTML5 Video Element with Rich Poster */}
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={posterUrl}
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onClick={handleTogglePlay}
          className="w-full h-full object-contain bg-black cursor-pointer"
        />

        {/* 60 FPS Particle Canvas Overlay */}
        <ReactionCanvas />

        {/* Floating Combo Mega Burst HUD */}
        {combo >= 3 && (
          <div className="absolute top-16 right-5 z-30 pointer-events-none animate-bounce">
            <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#E50914] via-rose-600 to-purple-600 text-white font-mono text-xs sm:text-sm font-black tracking-wide shadow-[0_0_35px_rgba(229,9,20,0.85)] border border-white/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>COMBO x{combo} MEGA BURST!</span>
            </div>
          </div>
        )}

        {/* Top Header Floating Telemetry HUD */}
        <div
          className={`absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Stream Title & Badge */}
          <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#050811]/90 backdrop-blur-md border border-white/10 text-white font-mono text-xs shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
            <span className="font-bold font-display truncate max-w-[220px]">
              {playback?.mediaTitle || 'Tears of Steel'}
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400 text-[10px]">4K ULTRA HD</span>
          </div>

          {/* Telemetry Drift Pill & Library Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] font-bold border backdrop-blur-md shadow-lg ${
                isSyncing
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse'
                  : 'bg-red-500/15 border-red-500/30 text-red-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#E50914]" />
              <span>{isSyncing ? 'SYNCING FRAME' : `SYNCED (${drift}s)`}</span>
              <span className="text-slate-500">·</span>
              <span>{latency}ms</span>
            </div>

            <button
              onClick={() => setPresetModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-mono text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
            >
              <Film className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Library</span>
            </button>
          </div>
        </div>

        {/* Big Center Crimson Play Indicator (when paused) */}
        {!isPlaying && (
          <div
            onClick={handleTogglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-[#E50914]/20 border-2 border-[#E50914]/90 flex items-center justify-center text-white shadow-[0_0_50px_rgba(229,9,20,0.6)] transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-9 h-9 ml-1 fill-[#E50914] text-[#E50914]" />
            </div>
          </div>
        )}

        {/* Bottom Custom Playback Control Bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col gap-2.5 transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Scrub Bar (Netflix Crimson Red) */}
          <div className="relative group/scrub flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onMouseDown={() => setIsScrubbing(true)}
              onChange={handleSeek}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1.5 group-hover/scrub:h-2.5 bg-white/20 accent-[#E50914] rounded-full appearance-none cursor-pointer transition-all"
              style={{
                background: `linear-gradient(to right, #E50914 ${progressPct}%, rgba(255,255,255,0.2) ${progressPct}%)`,
              }}
            />
          </div>

          {/* Bottom Bar Controls */}
          <div className="flex items-center justify-between text-white font-mono text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>

              <div className="flex items-center gap-1.5 group/vol">
                <button
                  onClick={handleToggleMute}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-16 transition-all duration-200 h-1 bg-white/30 accent-[#E50914] appearance-none rounded-full cursor-pointer opacity-0 group-hover/vol:opacity-100"
                />
              </div>

              <div className="text-[11px] text-slate-300 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-500 mx-1">/</span>
                <span className="text-slate-400">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden md:inline px-2 py-0.5 rounded bg-white/10 text-[9px] font-bold text-slate-300">
                4K UHD 60FPS
              </span>
              <span className="hidden md:inline px-2 py-0.5 rounded bg-purple-500/20 text-[9px] font-bold text-purple-300 border border-purple-500/30">
                DOLBY ATMOS
              </span>

              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono">
                {currentRoom?.isHostOnlyControl ? (
                  <>
                    <Shield className="w-3 h-3 text-purple-400" />
                    <span>Host Control</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-[#E50914]" />
                    <span>Collaborative Sync</span>
                  </>
                )}
              </div>

              <button
                onClick={handleFullscreen}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seamless Integrated Reaction Bar (Docked Directly Below) */}
      <div className="w-full flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#090e1c]/90 backdrop-blur-xl border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#E50914]">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Reaction Physics
            </div>
            <div className="font-mono text-xs text-slate-200">
              {combo >= 3 ? (
                <span className="text-[#E50914] font-bold animate-pulse flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {combo}x ULTRA COMBO!
                </span>
              ) : (
                'Mash emoji to burst'
              )}
            </div>
          </div>
        </div>

        {/* Reaction Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {REACTION_EMOJIS.map((item) => (
            <button
              key={item.emoji}
              onClick={(e) => handleEmojiBurst(item.emoji, e)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.12] active:scale-125 border border-white/10 hover:border-red-500/50 flex items-center justify-center text-lg sm:text-xl transition-all duration-150 select-none cursor-pointer group shadow-sm hover:shadow-[0_0_15px_rgba(229,9,20,0.4)]"
              title={`Burst ${item.label} (Press [${item.key}])`}
            >
              <span className="group-hover:scale-110 transition-transform">{item.emoji}</span>
              <span className="absolute -top-1.5 -right-1 font-mono text-[8px] px-1 rounded bg-[#050811] text-slate-400 border border-white/10 opacity-70 group-hover:opacity-100 group-hover:text-red-400 font-bold">
                {item.key}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
