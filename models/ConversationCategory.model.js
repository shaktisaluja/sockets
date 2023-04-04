const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConversationCategory = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: false,
    },
    type: ["archive", "unknown", "primary"],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "conversation",
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Conversation = mongoose.model(
  "ConversationCategory",
  ConversationCategory,
  "conversationCategory"
);

// make this available to our users in our Node applications
module.exports = Conversation;
