const { Schema, model } = require("mongoose");

const blockUserSchema = new Schema(
  {
    blockedBy: { type: Schema.Types.ObjectId, ref: "User" },  
    blockedUser: { type: Schema.Types.ObjectId, ref: "User" },  
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const BlockedUser = model("blockUser", blockUserSchema, "blockUser");

// make this available to our users in our Node applications
module.exports = BlockedUser;
