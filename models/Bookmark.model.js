const { Schema, model } = require("mongoose");

const bookmarkSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Bookmark = model("Bookmark", bookmarkSchema, "bookmark");

// make this available to our users in our Node applications
module.exports = Bookmark;
