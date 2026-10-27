import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WatchPartyProvider, useWatchParty } from './context/WatchPartyContext';
import { Film } from 'lucide-react';
import NetflixNavbar from './components/NetflixNavbar';
import NetflixHomeView from './components/NetflixHomeView';
import TheaterView from './components/TheaterView';
import NetflixFooter from './components/NetflixFooter';
import NetflixInfoModal from './components/NetflixInfoModal';
import MediaPresetsModal from './components/MediaPresetsModal';
import NewPollModal from './components/NewPollModal';
import RoomSelectorModal from './components/RoomSelectorModal';
import AuthModal from './components/AuthModal';
import AuthPage from './pages/AuthPage';

function WatchPartyMain() {
  const location = useLocation();
  const { user, authLoading } = useWatchParty();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050811] flex flex-col items-center justify-center gap-4 select-none">
        <div className="w-14 h-14 rounded-2xl bg-[#E50914] flex items-center justify-center shadow-[0_0_40px_rgba(229,9,20,0.8)] animate-pulse">
          <Film className="w-8 h-8 text-white" />
        </div>
        <span className="font-display font-black text-xl text-[#E50914] tracking-widest uppercase animate-pulse">
          CastStream
        </span>
      </div>
    );
  }

  // Unauthenticated: gate entire app to /signup or /login
  if (!user) {
    return (
      <div className="bg-[#050811] text-slate-100 min-h-screen relative font-sans flex flex-col selection:bg-[#E50914] selection:text-white">
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/signup" element={<AuthPage initialMode="signup" />} />
            <Route path="/login" element={<AuthPage initialMode="login" />} />
            <Route path="*" element={<Navigate to="/signup" replace />} />
          </Routes>
        </main>
      </div>
    );
  }

  // Authenticated user experience
  return (
    <div className="bg-[#050811] text-slate-100 min-h-screen relative font-sans flex flex-col selection:bg-[#E50914] selection:text-white">
      {/* Netflix Top Navbar */}
      {!isAuthPage && <NetflixNavbar />}

      {/* URL-driven Route Views */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<NetflixHomeView />} />
          <Route path="/home" element={<NetflixHomeView />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="/watch/:roomId" element={<TheaterView />} />
          <Route path="/watch" element={<TheaterView />} />
          <Route path="/theater/:roomId" element={<TheaterView />} />
          <Route path="/theater" element={<TheaterView />} />
          <Route path="/room/:roomId" element={<TheaterView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Netflix Footer */}
      {!isAuthPage && <NetflixFooter />}

      {/* Modals */}
      <NetflixInfoModal />
      <MediaPresetsModal />
      <NewPollModal />
      <RoomSelectorModal />
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <WatchPartyProvider>
      <WatchPartyMain />
    </WatchPartyProvider>
  );
}
