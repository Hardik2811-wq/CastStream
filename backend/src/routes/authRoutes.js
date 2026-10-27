import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

function buildUserPayload(user) {
  return {
    id: user._id,
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    badge: user.badge || 'MEMBER',
    avatar: user.avatar || '',
    reactionsSent: user.reactionsSent || 0,
    watchTimeMinutes: user.watchTimeMinutes || 0,
    favoriteGenres: user.favoriteGenres || ['Sci-Fi', 'Anime', 'Cinema'],
    statusMessage: user.statusMessage || 'Synchronized in 4K Dolby',
    createdAt: user.createdAt,
  };
}

// 1. Register new CastStream user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, badge, avatar, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.trim() }],
    });

    if (existing) {
      return res.status(409).json({ error: 'Username or email already registered' });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      badge: badge || 'MEMBER',
      role: role || (badge === 'HOST' ? 'host' : 'user'),
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, badge: user.badge },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({
      $or: [{ username: username.trim() }, { email: username.toLowerCase().trim() }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, badge: user.badge },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      token,
      user: buildUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Logout (Clear Cookie)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// 4. Get Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Profile (Avatar, Badge, Status, Genres)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { avatar, statusMessage, favoriteGenres, badge } = req.body;
    const updates = {};
    if (avatar) updates.avatar = avatar;
    if (statusMessage) updates.statusMessage = statusMessage;
    if (favoriteGenres && Array.isArray(favoriteGenres)) updates.favoriteGenres = favoriteGenres;
    if (badge && ['HOST', 'DJ', 'VIP', 'MEMBER'].includes(badge)) updates.badge = badge;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
