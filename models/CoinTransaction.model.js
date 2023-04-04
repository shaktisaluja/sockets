const { Schema, model } = require("mongoose");

const coinTransactionSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    receiver: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
     type: {
        type: String,
        required: true,
        enum: ["gift", "chat"],
        default: "gift",
      },
      post: {
        type: Schema.Types.ObjectId,
      },
      conversation: {
        type: Schema.Types.ObjectId,
      },
      coins: { type: Number, default: 0 },
      commissionRate: 
      { 
        type: Number,
        required: true,
         default: 0 ,
        },  
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Token = model("CoinTransaction", coinTransactionSchema, "coinTransaction");

module.exports = Token;
