import express from 'express';
import crypto from 'crypto';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { authenticateToken, optionalAuth, requireHost, rateLimiter } from '../middleware/auth.js';
import { getRoomState, getAuthoritativeTime, updatePlayback } from '../socket/roomSyncEngine.js';

const router = express.Router();

// 4K & HD Royalty-Free Media Presets Catalog
export const MEDIA_PRESETS = [
  {
    title: 'Tears of Steel (4K Sci-Fi Cyberpunk)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=85',
    duration: 734,
    category: 'Sci-Fi & Cyberpunk',
    description: 'Dystopian Amsterdam overrun by military mechs. 4K open VFX master.',
  },
  {
    title: 'Big Buck Bunny (Animation 4K)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&auto=format&fit=crop&q=85',
    duration: 596,
    category: 'Anime & 3D Animation',
    description: 'Award-winning open source comedy animation by the Blender Foundation.',
  },
  {
    title: 'Sintel (Fantasy Open Cinematic)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=85',
    duration: 888,
    category: 'Fantasy & Narrative',
    description: 'An epic tale of a lonely girl searching for a baby dragon.',
  },
  {
    title: 'Elephants Dream (Sci-Fi Machinery)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=85',
    duration: 653,
    category: 'Sci-Fi & Machinery',
    description: 'Surreal journey into an infinite biological supercomputer.',
  },
  {
    title: 'For Bigger Blazes (Action Trailer)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=85',
    duration: 15,
    category: 'Trailers & Teasers',
    description: 'High-octane explosive action trailer showcasing rapid camera sweeps.',
  },
];

// 1. List all active watch-party rooms (filterable by category or query)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'playback.mediaTitle': new RegExp(search, 'i') },
      ];
    }

    const rooms = await Room.find(filter).sort({ viewerCount: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Media Presets Library
router.get('/presets', (req, res) => {
  res.json(MEDIA_PRESETS);
});

// 3. Get single room with live authoritative playback & recent messages
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomState = await getRoomState(roomId);
    if (!roomState) {
      return res.status(404).json({ error: 'Watch party room not found' });
    }

    const currentTime = getAuthoritativeTime(roomState.playback);
    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      room: {
        ...roomState,
        playback: {
          ...roomState.playback,
          currentTime,
        },
      },
      messages: messages.reverse(),
      serverTimestamp: Date.now(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create new watch party room
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, mediaUrl, mediaTitle, mediaThumbnail, description, isHostOnlyControl } = req.body;
    if (!name) return res.status(400).json({ error: 'Room name is required' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 24);
    const roomId = `${slug}-${Math.floor(100 + Math.random() * 900)}`;

    const defaultMedia = MEDIA_PRESETS[0];

    const newRoom = await Room.create({
      roomId,
      name,
      description: description || 'Interactive synchronized watch-party room',
      category: category || 'Sci-Fi & Cyberpunk',
      host: req.user._id,
      hostUsername: req.user.username,
      isHostOnlyControl: isHostOnlyControl ?? true,
      playback: {
        mediaUrl: mediaUrl || defaultMedia.url,
        mediaTitle: mediaTitle || defaultMedia.title,
        mediaThumbnail: mediaThumbnail || defaultMedia.thumbnail,
        mediaDuration: defaultMedia.duration,
        mediaType: 'video/mp4',
        state: 'PLAYING',
        currentTime: 0,
        lastSyncedAt: new Date(),
        resolution: '4K ULTRA HD',
        audioChannels: 'DOLBY ATMOS',
      },
      queue: [],
      viewerCount: 1,
      tags: ['4K', 'SYNCHRONIZED', 'LIVE_REACTIONS'],
    });

    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Playback State via REST
router.put('/:roomId/playback', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { action, currentTime, mediaUrl, mediaTitle, mediaThumbnail } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    if (mediaUrl) room.playback.mediaUrl = mediaUrl;
    if (mediaTitle) room.playback.mediaTitle = mediaTitle;
    if (mediaThumbnail) room.playback.mediaThumbnail = mediaThumbnail;
    if (action) room.playback.state = action === 'PAUSE' ? 'PAUSED' : 'PLAYING';
    if (typeof currentTime === 'number') room.playback.currentTime = currentTime;
    room.playback.lastSyncedAt = new Date();

    await room.save();
    res.json(room.playback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Queue: Add Track / Video
router.post('/:roomId/queue', optionalAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { title, url, thumbnail, duration } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const queueItem = {
      id: 'q_' + crypto.randomBytes(4).toString('hex'),
      title,
      url,
      thumbnail: thumbnail || '',
      duration: duration || 300,
      submittedBy: req.user.username,
      votes: 1,
      voters: [req.user.username],
      createdAt: new Date(),
    };

    room.queue.push(queueItem);
    room.queue.sort((a, b) => b.votes - a.votes);
    await room.save();

    res.status(201).json(room.queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Queue: Vote on item
router.post('/:roomId/queue/:itemId/vote', optionalAuth, async (req, res) => {
  try {
    const { roomId, itemId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const item = room.queue.find((q) => q.id === itemId);
    if (!item) return res.status(404).json({ error: 'Queue item not found' });

    const voter = req.user.username;
    if (!item.voters.includes(voter)) {
      item.votes += 1;
      item.voters.push(voter);
      room.queue.sort((a, b) => b.votes - a.votes);
      await room.save();
    }

    res.json(room.queue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Polls: Create Poll
router.post('/:roomId/polls', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { question, options, durationSeconds } = req.body;

    if (!question || !options || options.length < 2) {
      return res.status(400).json({ error: 'Question and at least 2 options required' });
    }

    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const poll = {
      id: 'poll_' + crypto.randomBytes(4).toString('hex'),
      question,
      options: options.map((text, i) => ({
        id: 'opt_' + i,
        text,
        votes: 0,
      })),
      votedUsers: [],
      createdBy: req.user.username,
      expiresAt: new Date(Date.now() + (durationSeconds || 120) * 1000),
      isActive: true,
    };

    room.activePoll = poll;
    await room.save();

    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Polls: Vote
router.post('/:roomId/polls/vote', optionalAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { pollId, optionId } = req.body;

    const room = await Room.findOne({ roomId });
    if (!room || !room.activePoll || room.activePoll.id !== pollId) {
      return res.status(404).json({ error: 'Active poll not found' });
    }

    const voter = req.user.username;
    if (room.activePoll.votedUsers.includes(voter)) {
      return res.status(400).json({ error: 'You have already voted' });
    }

    const opt = room.activePoll.options.find((o) => o.id === optionId);
    if (!opt) return res.status(404).json({ error: 'Option not found' });

    opt.votes += 1;
    room.activePoll.votedUsers.push(voter);
    await room.save();

    res.json(room.activePoll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Messages: Fetch paginated history
router.get('/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const messages = await Message.find({ room: roomId })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Messages: Post chat message via REST
router.post('/:roomId/messages', optionalAuth, rateLimiter(30, 60000), async (req, res) => {
  try {
    const { roomId } = req.params;
    const { text, replyTo } = req.body;

    if (!text?.trim()) return res.status(400).json({ error: 'Message text required' });

    const message = await Message.create({
      room: roomId,
      user: req.user._id || null,
      username: req.user.username,
      avatar: req.user.avatar || '',
      badge: req.user.badge || 'MEMBER',
      text: text.trim(),
      type: 'CHAT',
      replyTo: replyTo || null,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
