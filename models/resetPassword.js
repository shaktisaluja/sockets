var mongoose = require("mongoose");
var Schema = mongoose.Schema;
// create a schema
var resetPasswordSchema = new Schema(
  {
    otp: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, expires: "5m", default: Date.now },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// the schema is useless so far
// we need to create a model using it
var ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);
// make this available to our users in our Node applications
module.exports = ResetPassword;
