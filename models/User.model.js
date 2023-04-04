const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    //name: { type: String, required: true },
    OAuth: {
      type: String, unique: true, required: true
    },
    description: { type: String },
    name: { type: String, trim: true },
    email: {
      type: String, unique: true
    },
    user_handle: { type: String, required: true, unique: true, trim: true },
    avatar_url: { type: String },
    cover_url: { type: String },
    gender: { type: String, trim: true },
    bio: { type: String, trim: true },
    state: { type: String, trim: true },
    city: { type: String, trim: true },
    role: { type: String, default: "user", enum: ["user", "admin"] },
    dob: { type: String, trim: true },
    onBoarding: { type: Boolean, default: false },

    followers_count: { type: Number, default: 0 },
    following_count: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const User = model("User", userSchema, "user");

// make this available to our users in our Node applications
module.exports = User;



