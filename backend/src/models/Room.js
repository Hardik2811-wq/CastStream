import mongoose from 'mongoose';

const queueItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  submittedBy: { type: String, required: true },
  votes: { type: Number, default: 1 },
  voters: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const pollOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const activePollSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  options: [pollOptionSchema],
  votedUsers: [{ type: String }],
  createdBy: { type: String, default: 'Host' },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'Sci-Fi & Cinema',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hostUsername: {
      type: String,
      required: true,
    },
    isHostOnlyControl: {
      type: Boolean,
      default: true,
    },
    playback: {
      mediaUrl: {
        type: String,
        default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      },
      mediaTitle: {
        type: String,
        default: 'Tears of Steel (4K Sci-Fi Cyberpunk)',
      },
      mediaThumbnail: {
        type: String,
        default: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
      },
      mediaDuration: {
        type: Number,
        default: 734,
      },
      mediaType: {
        type: String,
        default: 'video/mp4',
      },
      state: {
        type: String,
        enum: ['PLAYING', 'PAUSED', 'BUFFERING'],
        default: 'PLAYING',
      },
      currentTime: {
        type: Number,
        default: 12.5,
      },
      lastSyncedAt: {
        type: Date,
        default: Date.now,
      },
      playbackRate: {
        type: Number,
        default: 1.0,
      },
      resolution: {
        type: String,
        default: '4K ULTRA HD',
      },
      audioChannels: {
        type: String,
        default: 'DOLBY ATMOS',
      },
    },
    queue: [queueItemSchema],
    activePoll: activePollSchema,
    viewerCount: {
      type: Number,
      default: 42,
    },
    maxCapacity: {
      type: Number,
      default: 500,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Room = mongoose.model('Room', roomSchema);
