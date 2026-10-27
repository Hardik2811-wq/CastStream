import crypto from 'crypto';
import {
  getRoomState,
  getAuthoritativeTime,
  updatePlayback,
  advanceQueue,
} from './roomSyncEngine.js';
import { Room } from '../models/Room.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

export function setupSocketHandlers(io) {
  const roomUsers = new Map();

  // Periodic Authoritative Heartbeat Tick (every 2000ms per room)
  setInterval(() => {
    for (const [roomId, count] of roomUsers.entries()) {
      if (count > 0) {
        getRoomState(roomId).then((room) => {
          if (room) {
            const authoritativeTime = getAuthoritativeTime(room.playback);
            io.to(`room:${roomId}`).emit('sync:heartbeat', {
              currentTime: authoritativeTime,
              state: room.playback.state,
              playbackRate: room.playback.playbackRate,
              serverTimestamp: Date.now(),
            });
          }
        });
      }
    }
  }, 2000);

  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    // 1. Identify User Session
    socket.on('auth:identify', ({ user }) => {
      currentUser = user;
    });

    // 2. High-Precision NTP Ping for Drift Compensation
    socket.on('telemetry:ping', (clientTimestamp, callback) => {
      const serverTimestamp = Date.now();
      if (typeof callback === 'function') {
        callback({
          clientTimestamp,
          serverTimestamp,
        });
      }
    });

    // 3. Join Watch-Party Room
    socket.on('room:join', async ({ roomId, user }, callback) => {
      currentRoom = roomId;
      currentUser = user || currentUser || { username: 'Guest_' + socket.id.slice(-4) };

      socket.join(`room:${roomId}`);

      const count = (roomUsers.get(roomId) || 0) + 1;
      roomUsers.set(roomId, count);

      const room = await getRoomState(roomId);
      if (room) {
        const currentTime = getAuthoritativeTime(room.playback);

        // Fetch last 40 chat messages
        const recentMessages = await Message.find({ room: roomId })
          .sort({ createdAt: -1 })
          .limit(40);

        if (typeof callback === 'function') {
          callback({
            success: true,
            room: {
              ...room,
              playback: {
                ...room.playback,
                currentTime,
              },
              viewerCount: count + 28, // base active peers
            },
            messages: recentMessages.reverse(),
            serverTimestamp: Date.now(),
          });
        }

        // Notify room of arrival
        io.to(`room:${roomId}`).emit('room:viewers', {
          viewerCount: count + 28,
        });

        // Broadcast join system message
        const joinMsg = await Message.create({
          room: roomId,
          username: currentUser.username,
          avatar: currentUser.avatar || '',
          badge: currentUser.badge || 'MEMBER',
          text: `joined the watch party`,
          type: 'SYSTEM',
        });
        io.to(`room:${roomId}`).emit('chat:message', joinMsg);
      }
    });

    // 4. Leave Room
    socket.on('room:leave', ({ roomId }) => {
      socket.leave(`room:${roomId}`);
      const count = Math.max(0, (roomUsers.get(roomId) || 1) - 1);
      roomUsers.set(roomId, count);

      io.to(`room:${roomId}`).emit('room:viewers', {
        viewerCount: count + 28,
      });
    });

    // 5. Media Control Broadcast (Play / Pause / Seek / Rate)
    socket.on('media:control', async ({ roomId, action, currentTime, playbackRate, username }) => {
      try {
        const targetRoomId = roomId || currentRoom;
        if (!targetRoomId) return;

        const updatedPlayback = await updatePlayback(targetRoomId, {
          action,
          currentTime,
          playbackRate,
          username: username || currentUser?.username || 'Host',
        });

        if (updatedPlayback) {
          // Broadcast instant sync signal to all peers
          io.to(`room:${targetRoomId}`).emit('media:sync', {
            action,
            currentTime: updatedPlayback.currentTime,
            state: updatedPlayback.state,
            playbackRate: updatedPlayback.playbackRate,
            serverTimestamp: Date.now(),
            triggeredBy: username || currentUser?.username || 'Host',
          });

          // Log system activity event
          const formatTime = (s) => {
            const m = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${m}:${sec < 10 ? '0' : ''}${sec}`;
          };

          const actionText =
            action === 'PLAY'
              ? `resumed playback at ${formatTime(currentTime)}`
              : action === 'PAUSE'
              ? `paused playback at ${formatTime(currentTime)}`
              : `sought video to ${formatTime(currentTime)}`;

          const sysMsg = await Message.create({
            room: targetRoomId,
            username: username || currentUser?.username || 'Host',
            badge: 'DJ',
            text: actionText,
            type: 'MEDIA_SYNC',
          });
          io.to(`room:${targetRoomId}`).emit('chat:message', sysMsg);
        }
      } catch (err) {
        console.error('[Socket] Media control error:', err);
      }
    });

    // 6. Live Floating Emoji Reaction Burst (Canvas Physics)
    socket.on('reaction:burst', ({ roomId, emoji, count, x, y, combo }) => {
      const targetRoomId = roomId || currentRoom;
      if (!targetRoomId) return;

      const payload = {
        emoji: emoji || '🔥',
        count: count || 1,
        x: x ?? 0.5, // 0 to 1 relative width coordinate
        y: y ?? 0.8,
        username: currentUser?.username || 'Anon',
        combo: combo || 1,
        burstId: crypto.randomBytes(4).toString('hex'),
        timestamp: Date.now(),
      };

      // Broadcast reaction burst immediately to all viewers in room
      io.to(`room:${targetRoomId}`).emit('reaction:burst', payload);

      // Async increment user stats
      if (currentUser?.id || currentUser?._id) {
        User.findByIdAndUpdate(currentUser.id || currentUser._id, {
          $inc: { reactionsSent: count || 1 },
        }).catch(() => {});
      }
    });

    // 7. Chat Message Dispatch
    socket.on('chat:send', async ({ roomId, text, replyTo }, ack) => {
      try {
        const targetRoomId = roomId || currentRoom;
        if (!targetRoomId || !text?.trim()) return;

        const senderUsername = currentUser?.username || 'Spectator';
        const senderBadge = currentUser?.badge || (currentUser?.role === 'host' ? 'HOST' : 'VIP');

        const message = await Message.create({
          room: targetRoomId,
          user: currentUser?.id || currentUser?._id || null,
          username: senderUsername,
          avatar: currentUser?.avatar || '',
          badge: senderBadge,
          text: text.trim(),
          type: 'CHAT',
          replyTo: replyTo || null,
        });

        io.to(`room:${targetRoomId}`).emit('chat:message', message);

        if (typeof ack === 'function') {
          ack({ success: true, message });
        }
      } catch (err) {
        console.error('[Socket] Chat send error:', err);
        if (typeof ack === 'function') {
          ack({ success: false, error: err.message });
        }
      }
    });

    // 8. Live Interactive Poll: Create
    socket.on('poll:create', async ({ roomId, question, options, durationSeconds }) => {
      try {
        const targetRoomId = roomId || currentRoom;
        if (!targetRoomId || !question || !options?.length) return;

        const pollId = 'poll_' + crypto.randomBytes(4).toString('hex');
        const poll = {
          id: pollId,
          question,
          options: options.map((opt, i) => ({
            id: 'opt_' + i,
            text: opt,
            votes: 0,
          })),
          votedUsers: [],
          createdBy: currentUser?.username || 'Host',
          expiresAt: new Date(Date.now() + (durationSeconds || 60) * 1000),
          isActive: true,
        };

        const roomState = await getRoomState(targetRoomId);
        if (roomState) roomState.activePoll = poll;

        await Room.updateOne({ roomId: targetRoomId }, { $set: { activePoll: poll } });

        io.to(`room:${targetRoomId}`).emit('poll:started', poll);

        // System message
        const sysMsg = await Message.create({
          room: targetRoomId,
          username: currentUser?.username || 'Host',
          badge: 'POLL',
          text: `started a live poll: "${question}"`,
          type: 'POLL_EVENT',
        });
        io.to(`room:${targetRoomId}`).emit('chat:message', sysMsg);
      } catch (err) {
        console.error('[Socket] Poll create error:', err);
      }
    });

    // 9. Live Poll: Vote
    socket.on('poll:vote', async ({ roomId, pollId, optionId, username }, ack) => {
      try {
        const targetRoomId = roomId || currentRoom;
        const voter = username || currentUser?.username || socket.id;

        const roomState = await getRoomState(targetRoomId);
        if (!roomState?.activePoll || roomState.activePoll.id !== pollId) {
          return ack && ack({ success: false, error: 'Poll not active' });
        }

        if (roomState.activePoll.votedUsers.includes(voter)) {
          return ack && ack({ success: false, error: 'You have already voted' });
        }

        const option = roomState.activePoll.options.find((o) => o.id === optionId);
        if (option) {
          option.votes += 1;
          roomState.activePoll.votedUsers.push(voter);

          await Room.updateOne(
            { roomId: targetRoomId, 'activePoll.id': pollId },
            { $set: { activePoll: roomState.activePoll } }
          );

          io.to(`room:${targetRoomId}`).emit('poll:updated', roomState.activePoll);

          if (typeof ack === 'function') {
            ack({ success: true, poll: roomState.activePoll });
          }
        }
      } catch (err) {
        console.error('[Socket] Poll vote error:', err);
      }
    });

    // 10. Queue / Playlist: Add Video
    socket.on('queue:add', async ({ roomId, item }) => {
      try {
        const targetRoomId = roomId || currentRoom;
        if (!targetRoomId || !item?.url) return;

        const queueItem = {
          id: 'q_' + crypto.randomBytes(4).toString('hex'),
          title: item.title || 'Untitled Stream',
          url: item.url,
          thumbnail: item.thumbnail || '',
          duration: Number(item.duration) || 300,
          submittedBy: currentUser?.username || 'DJ Guest',
          votes: 1,
          voters: [currentUser?.username || 'DJ Guest'],
          createdAt: new Date(),
        };

        const roomState = await getRoomState(targetRoomId);
        if (roomState) {
          roomState.queue = [...(roomState.queue || []), queueItem];
          roomState.queue.sort((a, b) => b.votes - a.votes);

          await Room.updateOne(
            { roomId: targetRoomId },
            { $set: { queue: roomState.queue } }
          );

          io.to(`room:${targetRoomId}`).emit('queue:updated', roomState.queue);

          // System message
          const sysMsg = await Message.create({
            room: targetRoomId,
            username: currentUser?.username || 'DJ',
            badge: 'QUEUE',
            text: `queued "${queueItem.title}" to Up Next`,
            type: 'QUEUE_EVENT',
          });
          io.to(`room:${targetRoomId}`).emit('chat:message', sysMsg);
        }
      } catch (err) {
        console.error('[Socket] Queue add error:', err);
      }
    });

    // 11. Queue: Vote on Item
    socket.on('queue:vote', async ({ roomId, itemId }) => {
      try {
        const targetRoomId = roomId || currentRoom;
        const voter = currentUser?.username || 'Guest';

        const roomState = await getRoomState(targetRoomId);
        if (roomState && roomState.queue) {
          const item = roomState.queue.find((q) => q.id === itemId);
          if (item && !item.voters.includes(voter)) {
            item.votes += 1;
            item.voters.push(voter);
            roomState.queue.sort((a, b) => b.votes - a.votes);

            await Room.updateOne(
              { roomId: targetRoomId },
              { $set: { queue: roomState.queue } }
            );

            io.to(`room:${targetRoomId}`).emit('queue:updated', roomState.queue);
          }
        }
      } catch (err) {
        console.error('[Socket] Queue vote error:', err);
      }
    });

    // 12. Queue: Advance / Play Next
    socket.on('queue:play_next', async ({ roomId }) => {
      try {
        const targetRoomId = roomId || currentRoom;
        const result = await advanceQueue(targetRoomId);
        if (result) {
          io.to(`room:${targetRoomId}`).emit('media:swapped', {
            playback: result.playback,
            queue: result.queue,
            triggeredBy: currentUser?.username || 'Host',
          });

          const sysMsg = await Message.create({
            room: targetRoomId,
            username: currentUser?.username || 'Host',
            badge: 'DJ',
            text: `advanced queue: now playing "${result.playback.mediaTitle}"`,
            type: 'MEDIA_SYNC',
          });
          io.to(`room:${targetRoomId}`).emit('chat:message', sysMsg);
        }
      } catch (err) {
        console.error('[Socket] Queue advance error:', err);
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (currentRoom) {
        const count = Math.max(0, (roomUsers.get(currentRoom) || 1) - 1);
        roomUsers.set(currentRoom, count);
        io.to(`room:${currentRoom}`).emit('room:viewers', {
          viewerCount: count + 28,
        });
      }
    });
  });
}
