import { connectDB, disconnectDB } from '../db.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';

export async function runSeed() {
  console.log('[Seed] Seeding CastStream / ArenaLive Watch-Party Platform dataset...');

  // 1. Create Default Users (Hosts, DJs, Members)
  await User.deleteMany({});
  await Room.deleteMany({});
  await Message.deleteMany({});

  const hostAlex = await User.create({
    username: 'alex_host',
    email: 'alex@caststream.io',
    password: 'password123',
    role: 'host',
    badge: 'HOST',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    reactionsSent: 420,
  });

  const djSarah = await User.create({
    username: 'sarah_dj',
    email: 'sarah@caststream.io',
    password: 'password123',
    role: 'dj',
    badge: 'DJ',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    reactionsSent: 890,
  });

  const viewerVIP = await User.create({
    username: 'neo_spectator',
    email: 'neo@caststream.io',
    password: 'password123',
    role: 'user',
    badge: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    reactionsSent: 154,
  });

  const marcus = await User.create({
    username: 'marcus_vfx',
    email: 'marcus@caststream.io',
    password: 'password123',
    role: 'user',
    badge: 'VIP',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    reactionsSent: 77,
  });

  // 2. Create Rooms
  const primaryRoom = await Room.create({
    roomId: 'cyberpunk-cinema',
    name: 'Cyberpunk 4K Film Club',
    description: '4K open cinema stream with frame-synchronized audio and live physics reactions.',
    category: 'Sci-Fi & Cyberpunk',
    host: hostAlex._id,
    hostUsername: hostAlex.username,
    isHostOnlyControl: false,
    playback: {
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      mediaTitle: 'Tears of Steel (4K Sci-Fi Cyberpunk)',
      mediaThumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85',
      mediaDuration: 734,
      mediaType: 'video/mp4',
      state: 'PLAYING',
      currentTime: 18.0,
      lastSyncedAt: new Date(),
      playbackRate: 1.0,
    },
    queue: [
      {
        id: 'q_01',
        title: 'Sintel (Fantasy Open Cinematic)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        duration: 888,
        submittedBy: 'sarah_dj',
        votes: 14,
        voters: ['sarah_dj', 'alex_host'],
      },
      {
        id: 'q_02',
        title: 'Big Buck Bunny (Animation 4K)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
        duration: 596,
        submittedBy: 'neo_spectator',
        votes: 9,
        voters: ['neo_spectator'],
      },
      {
        id: 'q_03',
        title: 'Elephants Dream (Sci-Fi Machinery)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        duration: 653,
        submittedBy: 'marcus_vfx',
        votes: 5,
        voters: [],
      },
    ],
    activePoll: {
      id: 'poll_seed_1',
      question: 'Which cinematic masterwork should we play next?',
      options: [
        { id: 'opt_1', text: 'Sintel (Fantasy Adventure)', votes: 24 },
        { id: 'opt_2', text: 'Big Buck Bunny (Animation 4K)', votes: 11 },
        { id: 'opt_3', text: 'Elephants Dream (Surreal Cyberpunk)', votes: 8 },
      ],
      votedUsers: ['alex_host'],
      createdBy: 'alex_host',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      isActive: true,
    },
    viewerCount: 94,
    tags: ['4K', 'BLENDER_OPEN_MOVIE', 'AUDIO_SYNC', 'LIVE_CHAT'],
  });

  const animeRoom = await Room.create({
    roomId: 'anime-warriors',
    name: 'Anime & 3D Animation Showcase',
    description: 'High-octane animation screenings with synchronized audio & community reaction bursts.',
    category: 'Anime & 3D',
    host: djSarah._id,
    hostUsername: djSarah.username,
    isHostOnlyControl: false,
    playback: {
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      mediaTitle: 'Big Buck Bunny (Animation 4K)',
      mediaThumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=85',
      mediaDuration: 596,
      state: 'PLAYING',
      currentTime: 45.0,
      lastSyncedAt: new Date(),
    },
    queue: [
      {
        id: 'q_a1',
        title: 'Sintel (Fantasy Cinematic)',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        duration: 888,
        submittedBy: 'neo_spectator',
        votes: 18,
        voters: ['neo_spectator', 'sarah_dj'],
      },
    ],
    activePoll: {
      id: 'poll_seed_2',
      question: 'Rate this 4K animation sequence!',
      options: [
        { id: 'opt_2a', text: '10/10 Masterpiece 🔥', votes: 32 },
        { id: 'opt_2b', text: '8/10 Great visuals 👏', votes: 14 },
        { id: 'opt_2c', text: '5/10 Average', votes: 3 },
      ],
      votedUsers: [],
      createdBy: 'sarah_dj',
      expiresAt: new Date(Date.now() + 1000 * 60 * 45),
      isActive: true,
    },
    viewerCount: 68,
    tags: ['4K', 'ANIMATION', 'COMMUNITY'],
  });

  const lofiRoom = await Room.create({
    roomId: 'lofi-study-lounge',
    name: 'Lo-Fi Chill & Coding Watch-Lounge',
    description: '24/7 synchronized stream with ambient visual loops and collaborative music queue.',
    category: 'Music & Lo-Fi',
    host: hostAlex._id,
    hostUsername: hostAlex.username,
    isHostOnlyControl: false,
    playback: {
      mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      mediaTitle: 'Elephants Dream (Visual Stream)',
      mediaThumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=85',
      mediaDuration: 653,
      state: 'PLAYING',
      currentTime: 120.0,
      lastSyncedAt: new Date(),
    },
    queue: [],
    viewerCount: 42,
    tags: ['LOFI', 'CHILL', 'CODE'],
  });

  // 3. Seed Realistic Chat Messages in ALL rooms
  const primaryChat = [
    { username: 'alex_host', badge: 'HOST', text: 'Welcome to the watch party! 4K Dolby sound is live 🔥', type: 'CHAT', ago: 120 },
    { username: 'sarah_dj', badge: 'DJ', text: 'Look at the robotic arm tracking at 01:20... absolute perfection!', type: 'CHAT', ago: 95 },
    { username: 'neo_spectator', badge: 'VIP', text: 'Audio sync is crazy tight. Drift is under 0.02s on my screen! 🚀', type: 'CHAT', ago: 72 },
    { username: 'marcus_vfx', badge: 'MEMBER', text: 'Spamming the rockets for that CGI transition 🚀🚀🚀', type: 'CHAT', ago: 40 },
    { username: 'alex_host', badge: 'HOST', text: 'Vote in the live poll to choose what plays next!', type: 'CHAT', ago: 15 },
  ];

  for (const m of primaryChat) {
    await Message.create({
      room: primaryRoom.roomId,
      username: m.username,
      badge: m.badge,
      text: m.text,
      type: m.type,
      createdAt: new Date(Date.now() - m.ago * 1000),
    });
  }

  const animeChat = [
    { username: 'sarah_dj', badge: 'HOST', text: 'Anime & 3D Showcase is officially streaming! Grab your popcorn 🍿', type: 'CHAT', ago: 180 },
    { username: 'neo_spectator', badge: 'VIP', text: 'The fur render on Big Buck Bunny at 60fps is hilarious and amazing 😂', type: 'CHAT', ago: 130 },
    { username: 'marcus_vfx', badge: 'VIP', text: 'Audio mix is so crisp. Voted 10/10 on the live poll!', type: 'CHAT', ago: 90 },
    { username: 'alex_host', badge: 'MEMBER', text: 'Queued Sintel for right after this! Upvote it in the Queue tab! 🔥', type: 'CHAT', ago: 30 },
    { username: 'sarah_dj', badge: 'HOST', text: 'Hit the fire button when the butterfly shows up haha 🦋🔥', type: 'CHAT', ago: 10 },
  ];

  for (const m of animeChat) {
    await Message.create({
      room: animeRoom.roomId,
      username: m.username,
      badge: m.badge,
      text: m.text,
      type: m.type,
      createdAt: new Date(Date.now() - m.ago * 1000),
    });
  }

  const lofiChat = [
    { username: 'alex_host', badge: 'HOST', text: '24/7 Lo-Fi coding room is active. Late night study grind 💻☕', type: 'CHAT', ago: 240 },
    { username: 'neo_spectator', badge: 'VIP', text: 'Vibe is immaculate. Keeping this on in the background while debugging.', type: 'CHAT', ago: 150 },
    { username: 'sarah_dj', badge: 'DJ', text: 'Feel free to add tracks to the queue anytime!', type: 'CHAT', ago: 60 },
  ];

  for (const m of lofiChat) {
    await Message.create({
      room: lofiRoom.roomId,
      username: m.username,
      badge: m.badge,
      text: m.text,
      type: m.type,
      createdAt: new Date(Date.now() - m.ago * 1000),
    });
  }

  console.log('[Seed] CastStream watch-party platform seeded successfully.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  connectDB()
    .then(runSeed)
    .then(() => {
      console.log('Seed completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failure:', err);
      process.exit(1);
    });
}
