import crypto from 'crypto';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

// In-memory active room playback cache for sub-millisecond sync
const activeRooms = new Map();

/**
 * Get or load room playback state
 */
export async function getRoomState(roomId) {
  if (activeRooms.has(roomId)) {
    return activeRooms.get(roomId);
  }

  const room = await Room.findOne({ roomId });
  if (!room) return null;

  const state = {
    roomId: room.roomId,
    name: room.name,
    hostUsername: room.hostUsername,
    isHostOnlyControl: room.isHostOnlyControl,
    playback: {
      mediaUrl: room.playback.mediaUrl,
      mediaTitle: room.playback.mediaTitle,
      mediaDuration: room.playback.mediaDuration,
      mediaThumbnail: room.playback.mediaThumbnail,
      state: room.playback.state,
      currentTime: room.playback.currentTime,
      lastSyncedAt: Date.now(),
      playbackRate: room.playback.playbackRate || 1.0,
    },
    queue: room.queue || [],
    activePoll: room.activePoll || null,
    viewersCount: room.viewerCount || 1,
  };

  activeRooms.set(roomId, state);
  return state;
}

/**
 * Compute authoritative current playback time
 */
export function getAuthoritativeTime(playback) {
  if (playback.state !== 'PLAYING') {
    return playback.currentTime;
  }
  const elapsedSec = (Date.now() - playback.lastSyncedAt) / 1000;
  return Math.min(playback.mediaDuration || 99999, playback.currentTime + elapsedSec * (playback.playbackRate || 1.0));
}

/**
 * Update media playback control
 */
export async function updatePlayback(roomId, { action, currentTime, playbackRate, username }) {
  const room = await getRoomState(roomId);
  if (!room) return null;

  const now = Date.now();
  const validCurrentTime = Math.max(0, Number(currentTime) || 0);

  if (action === 'PLAY') {
    room.playback.state = 'PLAYING';
    room.playback.currentTime = validCurrentTime;
    room.playback.lastSyncedAt = now;
  } else if (action === 'PAUSE') {
    room.playback.state = 'PAUSED';
    room.playback.currentTime = validCurrentTime;
    room.playback.lastSyncedAt = now;
  } else if (action === 'SEEK') {
    room.playback.currentTime = validCurrentTime;
    room.playback.lastSyncedAt = now;
  }

  if (playbackRate) {
    room.playback.playbackRate = Number(playbackRate);
  }

  // Asynchronously persist to MongoDB
  Room.updateOne(
    { roomId },
    {
      $set: {
        'playback.state': room.playback.state,
        'playback.currentTime': room.playback.currentTime,
        'playback.lastSyncedAt': new Date(now),
        'playback.playbackRate': room.playback.playbackRate,
      },
    }
  ).catch((err) => console.error('[RoomSync] DB update failed:', err));

  return room.playback;
}

/**
 * Advance to next queue item
 */
export async function advanceQueue(roomId) {
  const room = await getRoomState(roomId);
  if (!room || !room.queue || room.queue.length === 0) return null;

  // Sort queue by votes desc
  room.queue.sort((a, b) => b.votes - a.votes);
  const nextItem = room.queue.shift();

  const now = Date.now();
  room.playback = {
    mediaUrl: nextItem.url,
    mediaTitle: nextItem.title,
    mediaDuration: nextItem.duration || 600,
    mediaThumbnail: nextItem.thumbnail || '',
    state: 'PLAYING',
    currentTime: 0,
    lastSyncedAt: now,
    playbackRate: 1.0,
  };

  // Persist
  Room.updateOne(
    { roomId },
    {
      $set: {
        playback: room.playback,
        queue: room.queue,
      },
    }
  ).catch((err) => console.error('[RoomSync] Queue advance persist failed:', err));

  return { nextItem, playback: room.playback, queue: room.queue };
}
