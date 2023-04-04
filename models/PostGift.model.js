const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const PostGiftSchema = new Schema(
  {
    gift: { type: Schema.Types.ObjectId, ref: "Gift", required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// the schema is useless so far
// we need to create a model using it
const PostGift = mongoose.model("PostGift", PostGiftSchema, "postgift");

// make this available to our users in our Node applications
module.exports = PostGift;
