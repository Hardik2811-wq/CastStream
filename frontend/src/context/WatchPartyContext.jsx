import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { sounds } from '../utils/audio';

const WatchPartyContext = createContext();

const SOCKET_SERVER_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '/';

export function WatchPartyProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [socket, setSocket] = useState(null);
  const [viewMode, setViewMode] = useState('home'); // 'home' | 'theater'
  const [latency, setLatency] = useState(12);
  const [drift, setDrift] = useState(0.02);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState('cyberpunk-cinema');
  const [messages, setMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(94);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('caststream_token') || '');
  const [mediaPresets, setMediaPresets] = useState([]);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [newPollModalOpen, setNewPollModalOpen] = useState(false);
  const [infoModalMedia, setInfoModalMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'polls' | 'queue'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'

  // Video State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(734);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [reactionBurstTrigger, setReactionBurstTrigger] = useState(null);

  // Synchronize browser URL route with viewMode & activeRoomId
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/watch') || path.startsWith('/theater') || path.startsWith('/room')) {
      setViewMode('theater');
      const segments = path.split('/').filter(Boolean);
      if (segments.length >= 2 && segments[1]) {
        const urlRoomId = segments[1];
        if (urlRoomId !== activeRoomId) {
          setActiveRoomId(urlRoomId);
        }
      }
    } else {
      setViewMode('home');
    }
  }, [location.pathname]);

  // Synchronize dynamic browser tab title
  useEffect(() => {
    if (viewMode === 'theater') {
      document.title = currentRoom?.name
        ? `${currentRoom.name} — CastStream 4K Live`
        : 'CastStream — 4K Synchronized Watch-Party';
    } else {
      document.title = 'CastStream — Interactive Watch-Party Platform & Synchronized Media';
    }
  }, [viewMode, currentRoom?.name]);

  // 1. Initial User Authentication (Real User Token Check - No Auto Dummy Login)
  useEffect(() => {
    async function initAuth() {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        } else {
          // Token is expired or invalid
          setToken('');
          setUser(null);
          localStorage.removeItem('caststream_token');
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      }
    }
    initAuth();
  }, [token]);

  // 2. Fetch Rooms & Media Presets
  useEffect(() => {
    async function fetchCatalogue() {
      try {
        const [roomRes, presetRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/rooms/presets'),
        ]);
        const rList = await roomRes.json();
        const pList = await presetRes.json();
        setRooms(rList);
        setMediaPresets(pList);
      } catch (err) {
        console.error('Failed to load catalogue:', err);
      }
    }
    fetchCatalogue();
  }, []);

  // 3. Socket Connection & Event Stream
  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('connect', () => {
      console.log('[CastStream] Socket connected:', s.id);
      if (user) {
        s.emit('auth:identify', { user });
      }
    });

    // NTP RTT Ping Loop
    const pingInterval = setInterval(() => {
      const pingStart = Date.now();
      s.emit('telemetry:ping', pingStart, (ack) => {
        if (ack) {
          const rtt = Math.max(6, Date.now() - pingStart);
          setLatency(rtt);
        }
      });
    }, 4000);

    // Live Viewer Presence
    s.on('room:viewers', (data) => {
      setViewerCount(data.viewerCount);
    });

    // Chat Message Event
    s.on('chat:message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.type === 'CHAT') {
        sounds.playMessage();
      }
    });

    // Reaction Burst Event (Erupts Canvas Particles)
    s.on('reaction:burst', (burst) => {
      setReactionBurstTrigger(burst);
      sounds.playPop();
    });

    // Poll Started
    s.on('poll:started', (poll) => {
      setCurrentRoom((prev) => (prev ? { ...prev, activePoll: poll } : prev));
      sounds.playVote();
    });

    // Poll Updated
    s.on('poll:updated', (poll) => {
      setCurrentRoom((prev) => (prev ? { ...prev, activePoll: poll } : prev));
    });

    // Queue Updated
    s.on('queue:updated', (queue) => {
      setCurrentRoom((prev) => (prev ? { ...prev, queue } : prev));
    });

    // Media Swapped from Queue
    s.on('media:swapped', (data) => {
      setCurrentRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          playback: data.playback,
          queue: data.queue,
        };
      });
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      sounds.playSync();
    });

    return () => {
      clearInterval(pingInterval);
      s.disconnect();
    };
  }, [user]);

  // 4. Join Room Channel
  useEffect(() => {
    if (!socket || !activeRoomId) return;

    socket.emit('room:join', { roomId: activeRoomId, user }, (res) => {
      if (res?.success) {
        setCurrentRoom(res.room);
        const fallbackChat = [
          { username: res.room.hostUsername || 'Host', badge: 'HOST', text: `Welcome everyone to ${res.room.name}! Synchronized Dolby sound is online 🔥`, type: 'CHAT', createdAt: new Date() },
          { username: 'sarah_dj', badge: 'DJ', text: 'Visual rendering quality is unreal at 60fps! 🚀', type: 'CHAT', createdAt: new Date() },
          { username: 'neo_vip', badge: 'VIP', text: 'Audio sync locked in. Zero drift on my stream!', type: 'CHAT', createdAt: new Date() },
          { username: 'marcus_vfx', badge: 'MEMBER', text: 'Hitting the fire bursts for this sequence 🔥🔥🔥', type: 'CHAT', createdAt: new Date() },
        ];
        setMessages(res.messages && res.messages.length > 2 ? res.messages : fallbackChat);
        setViewerCount(res.room.viewerCount || 94);

        if (videoRef.current && res.room.playback) {
          const pb = res.room.playback;
          videoRef.current.currentTime = pb.currentTime || 0;
          if (pb.state === 'PLAYING') {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      }
    });

    return () => {
      socket.emit('room:leave', { roomId: activeRoomId });
    };
  }, [socket, activeRoomId]);

  // 5. Media Synchronizer & Drift Compensator Engine
  useEffect(() => {
    if (!socket) return;

    const handleMediaSync = (data) => {
      const video = videoRef.current;
      if (!video) return;

      const { action, currentTime: targetTime, playbackRate: targetRate } = data;

      if (action === 'PLAY') {
        video.currentTime = targetTime;
        video.playbackRate = targetRate || 1.0;
        video.play().catch(() => {});
        setIsPlaying(true);
      } else if (action === 'PAUSE') {
        video.currentTime = targetTime;
        video.pause();
        setIsPlaying(false);
      } else if (action === 'SEEK') {
        video.currentTime = targetTime;
      }
    };

    const handleSyncHeartbeat = (hb) => {
      const video = videoRef.current;
      if (!video) return;

      const localTime = video.currentTime;
      const targetTime = hb.currentTime;
      const currentDrift = Math.abs(localTime - targetTime);
      setDrift(Number(currentDrift.toFixed(3)));

      if (currentDrift > 1.2) {
        setIsSyncing(true);
        video.currentTime = targetTime;
        setTimeout(() => setIsSyncing(false), 500);
      } else if (currentDrift > 0.25) {
        video.playbackRate = localTime < targetTime ? 1.04 : 0.96;
      } else {
        video.playbackRate = 1.0;
      }

      if (hb.state === 'PLAYING' && video.paused) {
        video.play().catch(() => {});
        setIsPlaying(true);
      } else if (hb.state === 'PAUSED' && !video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    };

    socket.on('media:sync', handleMediaSync);
    socket.on('sync:heartbeat', handleSyncHeartbeat);

    return () => {
      socket.off('media:sync', handleMediaSync);
      socket.off('sync:heartbeat', handleSyncHeartbeat);
    };
  }, [socket]);

  // Actions
  function controlMedia(action, targetTime = null) {
    if (!socket || !currentRoom) return;

    const video = videoRef.current;
    const timeToBroadcast = targetTime !== null ? targetTime : video ? video.currentTime : 0;

    socket.emit('media:control', {
      roomId: currentRoom.roomId,
      action,
      currentTime: timeToBroadcast,
      playbackRate: video?.playbackRate || 1.0,
      username: user?.username || 'Host',
    });

    sounds.playClick();
  }

  function sendReaction(emoji, x = 0.5, y = 0.8, combo = 1) {
    if (!socket || !currentRoom) return;

    socket.emit('reaction:burst', {
      roomId: currentRoom.roomId,
      emoji,
      count: 1,
      x,
      y,
      combo,
    });

    setReactionBurstTrigger({
      emoji,
      count: 1,
      x,
      y,
      combo,
      burstId: Math.random().toString(),
      timestamp: Date.now(),
    });
    sounds.playPop();
  }

  function sendMessage(text, replyTo = null) {
    if (!socket || !currentRoom || !text?.trim()) return;

    socket.emit('chat:send', {
      roomId: currentRoom.roomId,
      text: text.trim(),
      replyTo,
    });
  }

  function createPoll(question, options, durationSeconds = 60) {
    if (!socket || !currentRoom) return;
    socket.emit('poll:create', {
      roomId: currentRoom.roomId,
      question,
      options,
      durationSeconds,
    });
    setNewPollModalOpen(false);
  }

  function votePoll(pollId, optionId) {
    if (!socket || !currentRoom) return;
    socket.emit('poll:vote', {
      roomId: currentRoom.roomId,
      pollId,
      optionId,
      username: user?.username,
    });
    sounds.playVote();
  }

  function addQueueItem(item) {
    if (!socket || !currentRoom) return;
    socket.emit('queue:add', {
      roomId: currentRoom.roomId,
      item,
    });
  }

  function voteQueueItem(itemId) {
    if (!socket || !currentRoom) return;
    socket.emit('queue:vote', {
      roomId: currentRoom.roomId,
      itemId,
    });
    sounds.playClick();
  }

  function playNextQueue() {
    if (!socket || !currentRoom) return;
    socket.emit('queue:play_next', {
      roomId: currentRoom.roomId,
    });
  }

  function switchRoom(roomId) {
    setActiveRoomId(roomId);
    setRoomModalOpen(false);
    sounds.playClick();
    navigate(`/watch/${roomId}`);
  }

  // Open Theater Mode directly with URL routing
  function openTheater(roomId) {
    const target = roomId || activeRoomId || 'cyberpunk-cinema';
    setActiveRoomId(target);
    setViewMode('theater');
    sounds.playClick();
    navigate(`/watch/${target}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goHome() {
    setViewMode('home');
    sounds.playClick();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSetViewMode(mode) {
    if (mode === 'home') {
      goHome();
    } else {
      openTheater(activeRoomId);
    }
  }

  // Authentication Helpers
  async function loginUser(username, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('caststream_token', data.token);
      if (socket) {
        socket.emit('auth:identify', { user: data.user });
        if (activeRoomId) {
          socket.emit('room:join', { roomId: activeRoomId, user: data.user });
        }
      }
      sounds.playClick();
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function registerUser({ username, email, password, badge }) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, badge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('caststream_token', data.token);
      if (socket) {
        socket.emit('auth:identify', { user: data.user });
        if (activeRoomId) {
          socket.emit('room:join', { roomId: activeRoomId, user: data.user });
        }
      }
      sounds.playClick();
      setAuthModalOpen(false);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    localStorage.removeItem('caststream_token');
    sounds.playTap();
    navigate('/login');
  }

  return (
    <WatchPartyContext.Provider
      value={{
        socket,
        viewMode,
        setViewMode: handleSetViewMode,
        goHome,
        openTheater,
        latency,
        drift,
        isSyncing,
        rooms,
        currentRoom,
        activeRoomId,
        switchRoom,
        messages,
        viewerCount,
        user,
        setUser,
        token,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        loginUser,
        registerUser,
        logout,
        mediaPresets,
        presetModalOpen,
        setPresetModalOpen,
        roomModalOpen,
        setRoomModalOpen,
        newPollModalOpen,
        setNewPollModalOpen,
        infoModalMedia,
        setInfoModalMedia,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        videoRef,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        setVolume,
        isMuted,
        setIsMuted,
        reactionBurstTrigger,
        controlMedia,
        sendReaction,
        sendMessage,
        createPoll,
        votePoll,
        addQueueItem,
        voteQueueItem,
        playNextQueue,
      }}
    >
      {children}
    </WatchPartyContext.Provider>
  );
}

export function useWatchParty() {
  return useContext(WatchPartyContext);
}
