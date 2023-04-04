const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const GiftSchema = new Schema(
  {
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    media: { url: { type: String, required: true }, type: { type: String } },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// the schema is useless so far
// we need to create a model using it
const Gift = mongoose.model("Gift", GiftSchema, "gift");

// make this available to our users in our Node applications
module.exports = Gift;
