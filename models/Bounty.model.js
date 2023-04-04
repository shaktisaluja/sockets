const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const BountySchema = new Schema(
  {
    description: { type: String, required: true, trim: true },
    start_time: {type : Date ,required: true},
    end_time: {type : Date ,required: true},
    meme_coins:  { type: Number, required: true },
    totalAttempts: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    status :{
        type: String,
        enum: ["open", "close"],
      }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// we need to create a model using it
const  BountyModel = mongoose.model("bounty", BountySchema, "bounty");

// make this available to our users in our Node applications
module.exports = BountyModel;
