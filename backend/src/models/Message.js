import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: 'MEMBER',
    },
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['CHAT', 'SYSTEM', 'MEDIA_SYNC', 'POLL_EVENT', 'QUEUE_EVENT', 'REACTION_BURST'],
      default: 'CHAT',
    },
    replyTo: {
      id: String,
      username: String,
      text: String,
    },
    reactions: [
      {
        emoji: { type: String, required: true },
        count: { type: Number, default: 1 },
        users: [{ type: String }],
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
