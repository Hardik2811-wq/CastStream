import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'host', 'dj', 'admin'],
      default: 'user',
    },
    badge: {
      type: String,
      enum: ['HOST', 'DJ', 'VIP', 'MEMBER'],
      default: 'MEMBER',
    },
    reactionsSent: {
      type: Number,
      default: 0,
    },
    watchTimeMinutes: {
      type: Number,
      default: 0,
    },
    favoriteGenres: {
      type: [String],
      default: ['Sci-Fi', 'Anime', 'Cinema'],
    },
    statusMessage: {
      type: String,
      default: 'Synchronized in 4K Dolby',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return candidatePassword === this.password;
};

export const User = mongoose.model('User', userSchema);
