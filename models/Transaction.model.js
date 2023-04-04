const { Schema, model } = require("mongoose");

const transactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    token: {
      type: String,
      required: true,
    },
    resource: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Token = model("transaction", transactionSchema, "transaction");

module.exports = Token;
