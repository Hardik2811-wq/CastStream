import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchParty } from '../context/WatchPartyContext';
import {
  Film,
  Lock,
  User as UserIcon,
  Mail,
  Crown,
  Disc,
  Star,
  Zap,
  CheckCircle2,
  AlertCircle,
  Activity,
  Tv,
  Radio,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { sounds } from '../utils/audio';

const BADGE_CONFIG = [
  {
    id: 'HOST',
    label: 'HOST',
    sub: 'Master Clock & Controls',
    icon: Crown,
    accent: 'border-[#E50914] text-[#E50914]',
    activeBg: 'bg-[#E50914]/15 border-[#E50914]',
  },
  {
    id: 'DJ',
    label: 'DJ',
    sub: 'Queue & Audio Curator',
    icon: Disc,
    accent: 'border-purple-500 text-purple-400',
    activeBg: 'bg-purple-500/15 border-purple-500',
  },
  {
    id: 'VIP',
    label: 'VIP',
    sub: 'Verified Cinema Patron',
    icon: Star,
    accent: 'border-amber-500 text-amber-400',
    activeBg: 'bg-amber-500/15 border-amber-500',
  },
  {
    id: 'MEMBER',
    label: 'MEMBER',
    sub: 'Interactive Reactor',
    icon: Zap,
    accent: 'border-cyan-500 text-cyan-400',
    activeBg: 'bg-cyan-500/15 border-cyan-500',
  },
];

export default function AuthPage({ initialMode = 'signup' }) {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useWatchParty();

  const [mode, setMode] = useState(initialMode); // 'signup' | 'login'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('HOST');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (mode === 'login') {
      const res = await loginUser(username, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication rejected. Verify credentials.');
        sounds.playTap();
      } else {
        setSuccessMsg(`Session verified for @${res.user.username}. Initializing theater...`);
        sounds.playClick();
        setTimeout(() => navigate('/'), 650);
      }
    } else {
      const res = await registerUser({
        username,
        email,
        password,
        badge: selectedBadge,
      });
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Account creation rejected.');
        sounds.playTap();
      } else {
        setSuccessMsg(`Streamer persona initialized for @${res.user.username}. Launching feed...`);
        sounds.playClick();
        setTimeout(() => navigate('/'), 650);
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#04060c] text-slate-100 flex flex-col lg:grid lg:grid-cols-12 overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      {/* Background Mesh Glow */}
      <div className="absolute top-0 left-0 w-[55vw] h-[55vh] bg-gradient-to-br from-[#E50914]/15 via-purple-900/10 to-transparent blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vh] bg-gradient-to-tl from-indigo-950/20 via-[#E50914]/10 to-transparent blur-[140px] pointer-events-none"></div>

      {/* LEFT COLUMN: Editorial Cinema Showcase & Telemetry (7 Columns) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 relative z-10 border-r border-white/[0.06] bg-gradient-to-b from-[#060914]/80 via-[#04060d]/90 to-[#03040a]">
        {/* Brand Bar */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E50914] to-red-800 flex items-center justify-center shadow-[0_0_25px_rgba(229,9,20,0.6)]">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight text-white uppercase">
              CastStream
            </span>
            <span className="font-mono text-[9px] tracking-widest text-[#E50914] uppercase font-bold -mt-0.5">
              ArenaLive Telemetry Platform
            </span>
          </div>
        </div>

        {/* Central Editorial Narrative */}
        <div className="my-auto py-10 flex flex-col gap-8 max-w-2xl">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md w-fit">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse"></span>
            <span className="font-mono text-[11px] text-slate-300 font-semibold tracking-wide uppercase">
              Ultra-Low Latency NTP Clock Synchronization
            </span>
          </div>

          {/* Headline following 2-line max rule */}
          <h1 className="font-display font-black text-4xl xl:text-5xl text-white tracking-tight leading-[1.12]">
            Synchronized cinema rooms with frame-accurate precision.
          </h1>

          <p className="font-sans text-sm xl:text-base text-slate-400 leading-relaxed max-w-xl">
            Host live 4K watch-parties with authoritative server clock drift compensation, physics particle reaction fountains, and democratically curated media queues.
          </p>

          {/* Live Vignette Monitor Card */}
          <div className="relative rounded-2xl overflow-hidden bg-[#070b16] border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.7)] group">
            {/* Ambient Background Video Poster */}
            <div
              className="h-52 w-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85')`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#070b16] via-[#070b16]/60 to-transparent"></div>
            </div>

            {/* Vignette Overlay Data */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
              {/* Top Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/60 border border-white/10 backdrop-blur-md">
                  <Radio className="w-3.5 h-3.5 text-[#E50914] animate-pulse" />
                  <span className="font-mono text-[10px] text-white font-bold tracking-wider">
                    BROADCASTING LIVE
                  </span>
                </div>

                {/* Animated Equalizer Waveform */}
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-black/60 border border-white/10 backdrop-blur-md">
                  <span className="font-mono text-[10px] text-slate-400 mr-1.5 font-bold">ATMOS</span>
                  <span className="w-1 bg-[#E50914] rounded-full animate-soundwave-1"></span>
                  <span className="w-1 bg-[#E50914] rounded-full animate-soundwave-2"></span>
                  <span className="w-1 bg-white rounded-full animate-soundwave-3"></span>
                  <span className="w-1 bg-[#E50914] rounded-full animate-soundwave-4"></span>
                  <span className="w-1 bg-white rounded-full animate-soundwave-5"></span>
                </div>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] font-mono text-[10px] font-bold">
                    4K ULTRA HD
                  </span>
                  <span className="font-sans font-bold text-sm text-white drop-shadow">
                    Cyberpunk 4K Film Club
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 font-mono text-[11px] text-slate-300">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Clock Drift</span>
                    <span className="text-white font-bold">&lt; 0.02s (Locked)</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Ping RTT</span>
                    <span className="text-white font-bold">11 ms</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase">Live Peers</span>
                    <span className="text-[#E50914] font-bold">94 in sync</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Proof Metric */}
        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between font-mono text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#E50914]" />
            <span>Cryptographic Session Tokens &bull; WebSocket Cluster</span>
          </div>
          <span>Build v2.4</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Razor-Sharp Studio Terminal (5 Columns) */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 relative z-20">
        {/* Mobile Header (Only visible on small devices) */}
        <div className="flex lg:hidden items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-black text-lg text-white tracking-tight uppercase">
              CastStream
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">4K Watch-Party</span>
        </div>

        <div className="w-full max-w-md mx-auto flex flex-col gap-7">
          {/* Studio Terminal Segment Switcher */}
          <div className="p-1 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-1 text-xs font-sans font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'bg-gradient-to-r from-[#E50914] to-red-700 text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Create Account</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-[#E50914] to-red-700 text-white shadow-[0_4px_20px_rgba(229,9,20,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Form Context Header */}
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              {mode === 'signup' ? 'Join the Watch-Party' : 'Welcome Back'}
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
              {mode === 'signup'
                ? 'Register your streamer persona with personalized room authority.'
                : 'Enter your credentials to re-join synchronized 4K enclaves.'}
            </p>
          </div>

          {/* Status Feedback Alerts */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-sans flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-sans flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Real Auth Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
            {/* Username / Handle Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">
                Streamer Username {mode === 'login' && 'or Email'}
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'signup' ? 'your_streamer_handle' : 'username or email'}
                  className="w-full bg-[#070b16] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="streamer@caststream.io"
                    className="w-full bg-[#070b16] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={mode === 'signup' ? 6 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#070b16] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Streamer Role Badge Selection Deck (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-2 pt-1 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">Streamer Persona Badge</span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">Role Privileges</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {BADGE_CONFIG.map((b) => {
                    const Icon = b.icon;
                    const isSelected = selectedBadge === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBadge(b.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? b.activeBg + ' shadow-[0_0_15px_rgba(229,9,20,0.25)]'
                            : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg bg-black/40 border border-white/10 ${b.accent}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate">
                          <span className="font-display font-bold text-xs text-white block leading-tight">
                            {b.label}
                          </span>
                          <span className="font-sans text-[10px] text-slate-400 block truncate">
                            {b.sub}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* High-Contrast Optical Glass CTA */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] via-[#F40612] to-[#B80710] hover:from-red-600 hover:to-red-800 text-white font-sans font-bold text-sm tracking-wide transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_30px_rgba(229,9,20,0.45)] cursor-pointer active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              <span>
                {loading
                  ? 'Authenticating...'
                  : mode === 'signup'
                  ? 'Create Persona & Enter'
                  : 'Sign In to Theater'}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Alternate Mode Text Link */}
          <div className="text-center font-sans text-xs text-slate-500 pt-2 border-t border-white/[0.06]">
            {mode === 'signup' ? (
              <p>
                Existing streamer?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-white hover:text-[#E50914] font-semibold transition-colors cursor-pointer underline ml-1"
                >
                  Sign in to your enclave.
                </button>
              </p>
            ) : (
              <p>
                First time on CastStream?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-white hover:text-[#E50914] font-semibold transition-colors cursor-pointer underline ml-1"
                >
                  Create an account now.
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
