import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
