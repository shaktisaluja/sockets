const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verifyTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["verify-email", "forget-password", "oAuthRequest", "localToOAuth"],
  },
  createdAt: {
    type: Date,
    expires: "7d",
    default: Date.now,
  },
});

module.exports = mongoose.model(
  "verifyToken",
  verifyTokenSchema,
  "verifyTokens"
);
