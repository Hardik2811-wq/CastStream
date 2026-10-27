import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WatchPartyProvider } from './context/WatchPartyContext';
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="bg-[#050811] text-slate-100 min-h-screen relative font-sans flex flex-col selection:bg-[#E50914] selection:text-white">
      {/* Netflix Top Navbar (hidden on dedicated auth pages) */}
      {!isAuthPage && <NetflixNavbar />}

      {/* URL-driven Route Views */}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<NetflixHomeView />} />
          <Route path="/home" element={<NetflixHomeView />} />
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/signup" element={<AuthPage initialMode="signup" />} />
          <Route path="/watch/:roomId" element={<TheaterView />} />
          <Route path="/watch" element={<TheaterView />} />
          <Route path="/theater/:roomId" element={<TheaterView />} />
          <Route path="/theater" element={<TheaterView />} />
          <Route path="/room/:roomId" element={<TheaterView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Netflix Footer (hidden on dedicated auth pages) */}
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
