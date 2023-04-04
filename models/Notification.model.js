const { Schema, model } = require("mongoose");

const notificationSchema = new Schema(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    verb: {
      type: String,
      enum: [
        "message",
        "post",
        "rate",
        "comment",
        "Reshare",
        "Like",
        "follow-request",
        "new-follow",
        "follow-accept",
        "post-mention",
        "accept-conversation-request",
        "close-conversation-request",
        "update-conversation-price",
        "update-subscription-price",
        "cancel-subscription",
        "start-subscription",
        "new-conversation-request",
      ],
      required: true,
    },
    subject: { type: String },
    message: { type: String, required: true },
    avatar: { type: String },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Notification = model("Notification", notificationSchema, "notification");

// make this available to our users in our Node applications
module.exports = Notification;
