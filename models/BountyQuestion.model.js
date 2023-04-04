const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const BountyQuestionSchema = new Schema(
  {
    bountyProgramId: {
      type: Schema.Types.ObjectId,
      ref: "bounty",
      required: false,
    },
    text: { type: String },
    type: { type: String },
    meme_coins: { type: Number },
    correctAnswer: { type: String },
    option: [{ type: String }],
    media: [
        {
          url: { type: String },
          type: { type: String, default: "image" }
        },
      ],
},
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

const Conversation = mongoose.model(
  "BountyQuestions",
  BountyQuestionSchema,
  "bountyQuestions"
);

// make this available to our users in our Node applications
module.exports = Conversation;
