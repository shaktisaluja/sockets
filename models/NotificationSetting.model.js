const { Schema, model } = require("mongoose");
const NotificationSetting = new Schema(
    {
      userId: { type: String, required: true, unique: true },
      notifications: {
        post_like: { type: Boolean, default: true },
        post_comment: { type: Boolean, default: true },
        post_reshare: { type: Boolean, default: true },
        follower: { type: Boolean, default: true },
        crux_unlocked: { type: Boolean, default: true },
        coin_reedemed: { type: Boolean, default: true },
        bounty_coins: { type: Boolean, default: true },
        warning: { type: Boolean, default: true },
        spanke: { type: Boolean, default: true },
      },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
  );
  const NotificationSettings = model(
    "NotificationSetting",
    NotificationSetting,
    "notificationSetting"
  );
  module.exports = NotificationSettings;