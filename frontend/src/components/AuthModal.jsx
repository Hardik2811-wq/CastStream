import React, { useState } from 'react';
import { useWatchParty } from '../context/WatchPartyContext';
import {
  X,
  Film,
  Crown,
  Disc,
  Star,
  Zap,
  Lock,
  User as UserIcon,
  Mail,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sounds } from '../utils/audio';

const BADGE_OPTIONS = [
  { id: 'HOST', label: 'HOST', desc: 'Master Clock & Controls', icon: Crown, color: 'text-[#E50914]' },
  { id: 'DJ', label: 'DJ', desc: 'Queue & Audio Curator', icon: Disc, color: 'text-purple-400' },
  { id: 'VIP', label: 'VIP', desc: 'Verified Cinema Patron', icon: Star, color: 'text-amber-400' },
  { id: 'MEMBER', label: 'MEMBER', desc: 'Interactive Reactor', icon: Zap, color: 'text-cyan-400' },
];

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    user,
    loginUser,
    registerUser,
    logout,
  } = useWatchParty();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('VIP');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  if (!authModalOpen) return null;

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await loginUser(username, password);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error);
    } else {
      setSuccessNotice(`Signed in as @${res.user.username}`);
      setTimeout(() => {
        setSuccessNotice('');
        setAuthModalOpen(false);
      }, 700);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await registerUser({
      username,
      email,
      password,
      badge: selectedBadge,
    });
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error);
    } else {
      setSuccessNotice(`Account created for @${res.user.username}`);
      setTimeout(() => {
        setSuccessNotice('');
        setAuthModalOpen(false);
      }, 700);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#070b16] border border-white/10 shadow-[0_25px_70px_rgba(229,9,20,0.25)] p-6 sm:p-8 flex flex-col gap-5 text-white font-mono text-xs select-none">
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E50914] flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)]">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-xl text-white tracking-tight uppercase">
                CastStream
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-[9px] font-bold">
                ACCOUNT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              Interactive Watch-Party & Live Telemetry Access
            </p>
          </div>
        </div>

        {/* Success / Status Banner */}
        {successNotice && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 flex items-center gap-2 font-bold text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#E50914]" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/60 text-red-300 font-sans text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* If User Already Logged In: Show Account Profile Card */}
        {user ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E50914] flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-white">
                      @{user.username}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[9px] font-bold">
                      {user.badge || 'MEMBER'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                    {user.email}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setAuthModalOpen(false);
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          /* User Not Logged In: Real Login / Sign Up Tabs & Form */
          <>
            {/* Mode Tab Switcher */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-[#040711] border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Login Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-3 font-sans">
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-slate-300 font-medium text-xs">Username or Email</label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username or email"
                      className="w-full bg-[#030610] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-slate-300 font-medium text-xs">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#030610] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] via-[#F40612] to-[#B80710] hover:from-red-600 hover:to-red-800 text-white font-bold font-sans text-xs tracking-wide transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_25px_rgba(229,9,20,0.4)] cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Theater'}
                </button>
              </form>
            ) : (
              /* Sign Up Form */
              <form onSubmit={handleRegister} className="flex flex-col gap-3 font-sans">
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-slate-300 font-medium text-xs">Streamer Username</label>
                  <div className="relative flex items-center">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_streamer_handle"
                      className="w-full bg-[#030610] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-slate-300 font-medium text-xs">Email Address</label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="streamer@caststream.io"
                      className="w-full bg-[#030610] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-slate-300 font-medium text-xs">Password (min 6 chars)</label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#030610] border border-white/10 hover:border-white/20 focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Streamer Role Badge Picker */}
                <div className="flex flex-col gap-1.5 mt-1">
                  <label className="text-slate-300 font-medium text-xs">
                    Streamer Persona Badge
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BADGE_OPTIONS.map((b) => {
                      const Icon = b.icon;
                      const isSelected = selectedBadge === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setSelectedBadge(b.id)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#E50914] bg-[#E50914]/20 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                              : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${b.color}`} />
                          <div className="truncate">
                            <span className="font-bold text-white text-[11px] block">{b.label}</span>
                            <span className="text-[9px] text-slate-400 block truncate">{b.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#E50914] via-[#F40612] to-[#B80710] hover:from-red-600 hover:to-red-800 text-white font-bold font-sans text-xs tracking-wide transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_25px_rgba(229,9,20,0.4)] cursor-pointer active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Creating Persona...' : 'Create Persona & Enter'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
