import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  passsword: { type: String, required: true },
  token: { type: String }, //in local storage
});

const User = mongoose.model("User", userSchema);
export { User };
