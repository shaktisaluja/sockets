const { Schema, model } = require("mongoose");

const subscriptionSchema = new Schema(
  {
    subscription_to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscription_from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    active: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Subscription = model("Subscription", subscriptionSchema, "subscription");

// make this available to our Subscriptions in our Node applications
module.exports = Subscription;
