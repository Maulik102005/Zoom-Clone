import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema({
  user_id: { type: String },
  meetingCode: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now, required: true },
});

const meeting = mongoose.model("Meeting", meetingSchema);
export { meeting };
