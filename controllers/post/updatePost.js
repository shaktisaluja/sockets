const createError = require("http-errors");

// import post model
const Post = require("../../models/Post.model");
const convertParams = require("../../helpers/convertParams");

const updatePost = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { tags ,description} = req.body
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      throw createError.InternalServerError();
    }
    const updatePosts = await Post.findOneAndUpdate(
      { _id: req.params.id },{tags:tags, description : description},
      { new: true }
    );
    await updatePosts.save();
    res.json({ message: "success", data: updatePosts });
  } catch (error) {
    next(error);
  }
};

module.exports = updatePost;
