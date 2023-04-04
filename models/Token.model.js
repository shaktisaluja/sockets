const { Schema, model } = require("mongoose");

const { refreshTokenLife } = require("../config/keys").jwt;

const tokenSchema = new Schema({
  _userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "users",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: refreshTokenLife,
    default: Date.now,
  },
});

const Token = model("token", tokenSchema, "token");

module.exports = Token;
