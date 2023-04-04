const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// create a schema
const addFolderSchema = new Schema(
  {
   folder_name:{type: String,required:true,trim:true ,unique :true},
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);
// we need to create a model using it
const FolderModel = mongoose.model("folder", addFolderSchema, "folder");

// make this available to our users in our Node applications
module.exports = FolderModel;