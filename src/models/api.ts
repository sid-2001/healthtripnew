import mongoose from "../database/db";
const apiKeySchema = new mongoose.Schema({
  channel: String,
  key: String,
  key_name: String,
});

export default mongoose.model("Apikeys", apiKeySchema);
