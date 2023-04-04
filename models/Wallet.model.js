const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const WalletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    meme_coins: { type: Number, required: true ,default :1},
   
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// we need to create a model using it
const Wallet = mongoose.model("Wallet", WalletSchema, "wallet");

// make this available to our users in our Node applications
module.exports = Wallet;
