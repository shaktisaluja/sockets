const { Schema, model } = require("mongoose");

const stripeTransactionSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    amount: {
      type: Number,
    },
    intent_id: {
      type: String,
    },
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    subscription_id: {
      type: String,
    },
    type: {
      type: String,
      required: true,
      enum: ["subscription", "purchase", "tip", "coin"],
      default: "tip",
    },
    endDate: { type: Date },
    purchaseCommission: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const StripeTransaction = model(
  "StripeTransaction",
  stripeTransactionSchema,
  "stripetransaction"
);

module.exports = StripeTransaction;
