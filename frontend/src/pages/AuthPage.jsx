import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { sounds } from '../utils/audio';

const BADGE_OPTIONS = [
  { id: 'HOST', label: 'HOST', desc: 'Room Host & Controls', icon: Crown, color: 'text-[#E50914]' },
  { id: 'DJ', label: 'DJ', desc: 'Queue & Audio Curator', icon: Disc, color: 'text-purple-400' },
  { id: 'VIP', label: 'VIP', desc: 'Verified Cinema Patron', icon: Star, color: 'text-amber-400' },
  { id: 'MEMBER', label: 'MEMBER', desc: 'Community Reactor', icon: Zap, color: 'text-cyan-400' },
];

export default function AuthPage({ initialMode = 'login' }) {
  const navigate = useNavigate();
  const { loginUser, registerUser } = useWatchParty();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('VIP');
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
        setErrorMsg(res.error);
        sounds.playTap();
      } else {
        setSuccessMsg(`Welcome back, @${res.user.username}! Redirecting...`);
        sounds.playClick();
        setTimeout(() => navigate('/'), 700);
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
        setErrorMsg(res.error);
        sounds.playTap();
      } else {
        setSuccessMsg(`Account created for @${res.user.username}! Entering...`);
        sounds.playClick();
        setTimeout(() => navigate('/'), 700);
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#050811] flex flex-col justify-between selection:bg-[#E50914] selection:text-white">
      {/* Cinematic Ambient Dark Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85')`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/85 to-[#050811]/90 pointer-events-none"></div>

      {/* Top Navbar Header */}
      <header className="relative z-20 px-6 sm:px-12 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#E50914] flex items-center justify-center shadow-[0_0_25px_rgba(229,9,20,0.6)] group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-2xl text-[#E50914] tracking-tight uppercase">
            CastStream
          </span>
        </Link>

        {mode === 'signup' ? (
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <span>Have an account? <strong className="text-white underline">Sign In</strong></span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <span>New user? <strong className="text-[#E50914] underline">Create Account</strong></span>
          </button>
        )}
      </header>

      {/* Center Auth Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px] rounded-3xl bg-black/80 backdrop-blur-2xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-8 sm:p-12 flex flex-col gap-6">
          {/* Card Title */}
          <div>
            <h1 className="font-display font-black text-3xl text-white tracking-tight">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="font-sans text-xs text-slate-400 mt-1">
              {mode === 'login'
                ? 'Enter your credentials to access synchronized 4K theaters.'
                : 'Create your CastStream streamer ID with custom role privileges.'}
            </p>
          </div>

          {/* Success Notification */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-sans flex items-center gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                Username {mode === 'login' && 'or Email'}
              </label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'login' ? 'Enter username or email' : 'Choose unique username'}
                  className="w-full bg-[#0a0e1c]/80 border border-white/10 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E50914] font-mono transition-all"
                />
              </div>
            </div>

            {/* Email Field (Sign Up only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5 animate-in fade-in">
                <label className="font-mono text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@caststream.io"
                    className="w-full bg-[#0a0e1c]/80 border border-white/10 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E50914] font-mono transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  minLength={mode === 'signup' ? 6 : 1}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0e1c]/80 border border-white/10 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#E50914] font-mono transition-all"
                />
              </div>
            </div>

            {/* Streamer Role Badge Selector (Sign Up only) */}
            {mode === 'signup' && (
              <div className="flex flex-col gap-2 mt-1 animate-in fade-in">
                <label className="font-mono text-[11px] text-slate-300 uppercase tracking-wider font-bold">
                  Select Streamer Role Badge:
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
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E50914] bg-[#E50914]/20 shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${b.color} shrink-0`} />
                        <div className="truncate">
                          <span className="font-bold text-white text-xs block">{b.label}</span>
                          <span className="text-[10px] text-slate-400 block truncate font-sans">
                            {b.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E50914] to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(229,9,20,0.5)] cursor-pointer active:scale-[0.99] disabled:opacity-50"
            >
              {loading
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Theater'
                : 'Create Account & Enter'}
            </button>
          </form>

          {/* Toggle between Sign In and Sign Up */}
          <div className="pt-2 border-t border-white/10 text-center font-sans text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                New to CastStream?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="text-white hover:text-[#E50914] font-bold underline transition-colors cursor-pointer ml-1"
                >
                  Sign up now.
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="text-white hover:text-[#E50914] font-bold underline transition-colors cursor-pointer ml-1"
                >
                  Sign in.
                </button>
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-6 text-center text-slate-600 font-mono text-xs">
        CastStream Interactive Synchronized Platform &bull; Real-Time Socket Architecture
      </footer>
    </div>
  );
}
