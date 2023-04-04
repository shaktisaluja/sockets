
const createError = require("http-errors");
// import post model
const addPostInFolderModel = require("../../models/AddPostInFolder.model");
// const Post = require("../../models/Post.model");

const addPostInFolder = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const {postId: post_id} =req.params;
  const {id : folder_id} =req.params;
  //const {folder_id} =req.body;
  
  try {
    const folder = await addPostInFolderModel.findOne({ folder_id:folder_id,post_id: post_id});
    if (folder) {
      throw createError.BadRequest("This post is already added to this folder");
    }

    const createMemeInFolder = new addPostInFolderModel({
    folder_id:folder_id,
    post_id: post_id,
      user: userId,
    });
    //console.log(createMemeInFolder)
     await createMemeInFolder.save()
    res.json({ message: "success", data: createMemeInFolder });

  } catch (error) {
    next(error);
  }
};

module.exports = addPostInFolder;