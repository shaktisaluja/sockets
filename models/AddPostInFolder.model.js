const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const addPostInFolderSchema = new Schema(
  {
   folder_id:{type: String,required:true,trim:true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post_id: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// we need to create a model using it
const addPostInFolderModel = mongoose.model("addPostInFolder", addPostInFolderSchema, "addPostInFolder");

// make this available to our users in our Node applications
module.exports = addPostInFolderModel;