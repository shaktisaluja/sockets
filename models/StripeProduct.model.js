const { Schema, model } = require("mongoose");

const stripeProductSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    product_id: { type: String, required: true, unique: true },
    price_id: { type: String },
    is_dormant: { type: Boolean },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const StripeProduct = model(
  "StripeProduct",
  stripeProductSchema,
  "stripeproduct"
);

// make this available to our users in our Node applications
module.exports = StripeProduct;
