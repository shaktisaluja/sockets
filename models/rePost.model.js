const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const rePostSchema = new Schema(
  {
    post_id: { 
      type: Schema.Types.ObjectId, 
      ref: "Post", 
      required: true
    },
    user: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true
     },
    target:{
    type :String ,
    enum:["Repost","Telegram","Instagram","Pintrest","Tumbller","Twitter","Whatsapp","Facebook"],
    required:true}
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// we need to create a model using it
//rePostSchema.index({post_id: 1, user: 1}, {unique: true});
const 
Repost = mongoose.model("Repost", rePostSchema, "repost");

// make this available to our users in our Node applications
module.exports = Repost;