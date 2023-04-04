const { Schema, model } = require("mongoose");

const creatorSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    address: { type: Object, required: true },
    dob: { type: Object },
    external_accounts: { type: Object, required: true },
    stripe_account_id: { type: String, unique: true },
    verified: { type: Boolean, required: true, default: false },
    requirements: {
      type: Object
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Creator = model("Creator", creatorSchema, "creator");

// make this available to our users in our Node applications
module.exports = Creator;
