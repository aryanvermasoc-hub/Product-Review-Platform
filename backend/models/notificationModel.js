import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, enum: ['all', 'customers', 'admins'], default: 'all' },
    severity: { type: String, enum: ['info', 'success', 'warning', 'critical'], default: 'info' },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
