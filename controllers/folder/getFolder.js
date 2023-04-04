const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import post model
const folderModel = require("../../models/folder.model");
// const Post = require("../../models/Post.model");

const getFolder = async (req, res, next) => {
  const { _id: userId } = req.user.data;
 // const {folder_name } =req.body;
  
  try {
  
    const folderExist = await folderModel.find({user : ObjectId(userId)});

    res.status(200).send({ status:true , data : folderExist})
 
  } catch (error) {
    next(error);
  }
};

module.exports = getFolder;