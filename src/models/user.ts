// models/User.ts
import mongoose from "../database/db";
import { Document } from "mongoose";

const userSchema = new mongoose.Schema({
  sender_id: { type: Number, unique: true },
  name: String,
  is_bot: Boolean,
  first_name: String,
  last_name: String,
  language_code: String,
  city: String,
  country: String,
  blocked: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);
