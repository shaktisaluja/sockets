const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const UserBountySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bountyProgramId: {
      type: Schema.Types.ObjectId,
      ref: "Bounty",
      required: true,
    },
    bountyQuestionId: {
      type: Schema.Types.ObjectId,
      ref: "BountyQuestions",
      required: true,
    },
    userAnswer: {
      type: String,
      required: true,
    },
    correctAnswer: { type: String},
    result: { type: String},
    meme_coins: { type: Number, required: true },
    rewardedCoins: { type: Number, required: true },
    description: { type: String },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// we need to create a model using it
const UserBountyModel = mongoose.model("userBounty", UserBountySchema);

// make this available to our users in our Node applications
module.exports = UserBountyModel;
