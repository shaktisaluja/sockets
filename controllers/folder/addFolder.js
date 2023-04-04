const createError = require("http-errors");
// import post model
const folderModel = require("../../models/folder.model");
// const Post = require("../../models/Post.model");

const addFolder = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const {folder_name } =req.body;
  const correctedFolderName=folder_name.toLowerCase()
  console.log(correctedFolderName)
  
  try {
    const folder = await folderModel.findOne({ folder_name:correctedFolderName , user : userId});
    if (folder) {
      throw createError.BadRequest("This folder name already exist");
    }

    const createFolder = new folderModel({
     folder_name:correctedFolderName,
      user: userId,
    });
     await createFolder.save()
    res.json({ message: "success", data: createFolder });
  } catch (error) {
    next(error);
  }
};

module.exports = addFolder;