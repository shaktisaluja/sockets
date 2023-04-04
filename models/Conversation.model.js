const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const ConversationSchema = new Schema(
  {
    members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    hidden_by: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    // type 'single' represents one-to-one chat between users, 'group' represents group chat
    type: { type: String, required: true, default: "single" },
    last_message: { type: Schema.Types.ObjectId, ref: "Message" },
    // group_name: { type: String },
    // group_description: { type: String },
    // group_url: { type: String },
    // owner: { type: Schema.Types.ObjectId, ref: "User" },
    // status: {
    //   type: String,
    //   default: "closed",
    //   enum: ["open", "closed", "requested"],
    // },
    // price: { type: Number, default: 0 },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// the schema is useless so far
// we need to create a model using it
const Conversation = mongoose.model(
  "Conversation",
  ConversationSchema,
  "conversation"
);

// make this available to our users in our Node applications
module.exports = Conversation;
