const createError = require("http-errors");
// import post model
const Bookmark = require("../../models/Bookmark.model");
const Post = require("../../models/Post.model");

const removeBookmark = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      throw createError.BadRequest();
    }
    await Bookmark.findOneAndDelete({ post: req.params.id, user: userId });
    res.json({ message: "success" });
  } catch (error) {
    next(error);
  }
};

module.exports = removeBookmark;
