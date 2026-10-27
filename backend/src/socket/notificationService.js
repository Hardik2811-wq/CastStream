import crypto from 'crypto';
import { User } from '../models/User.js';

let ioInstance = null;

export function initNotificationService(io) {
  ioInstance = io;
}

/**
 * Dispatch notification to a user (in DB + real-time WebSocket)
 */
export async function sendUserNotification(userId, { title, message, type, actionLink }) {
  try {
    const notif = {
      id: 'notif_' + crypto.randomBytes(6).toString('hex'),
      title,
      message,
      type: type || 'INFO',
      read: false,
      actionLink: actionLink || '',
      createdAt: new Date(),
    };

    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          $each: [notif],
          $slice: -30, // Keep last 30 notifications
        },
      },
    });

    if (ioInstance) {
      // Emit to user's private socket room
      ioInstance.to(`user:${userId}`).emit('notification:new', notif);
    }

    return notif;
  } catch (err) {
    console.error('[NotificationService] Error sending notification:', err);
  }
}
