import mongoose from 'mongoose';

const sessionSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    tokenId: { type: String, required: true, unique: true },
    userAgent: { type: String, default: 'Unknown device' },
    ipAddress: { type: String, default: 'Unknown IP' },
    rememberMe: { type: Boolean, default: false },
    revokedAt: Date,
    lastSeenAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ user: 1, revokedAt: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
