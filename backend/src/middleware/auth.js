import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'caststream_secret_jwt_2026';

/**
 * Enforce valid JWT Bearer token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token' });
  }
}

/**
 * Optional authentication: attaches user if token exists, otherwise assigns guest identity
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = {
      isGuest: true,
      username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
      badge: 'MEMBER',
      role: 'user',
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    } else {
      req.user = {
        isGuest: true,
        username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
        badge: 'MEMBER',
        role: 'user',
      };
    }
    next();
  } catch (err) {
    req.user = {
      isGuest: true,
      username: 'Guest_' + Math.floor(1000 + Math.random() * 9000),
      badge: 'MEMBER',
      role: 'user',
    };
    next();
  }
}

/**
 * Enforce Host or Admin privileges
 */
export function requireHost(req, res, next) {
  if (!req.user || (req.user.role !== 'host' && req.user.role !== 'admin' && req.user.badge !== 'HOST')) {
    return res.status(403).json({ error: 'Host privileges required for this action' });
  }
  next();
}

/**
 * In-memory sliding rate limiter for real-time actions (chat, reactions)
 */
const rateMap = new Map();
export function rateLimiter(limit = 60, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip || req.user?.username || 'global';
    const now = Date.now();

    const record = rateMap.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count += 1;
    }

    rateMap.set(key, record);

    if (record.count > limit) {
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment before sending more messages.',
        retryAfterMs: record.resetAt - now,
      });
    }

    next();
  };
}
