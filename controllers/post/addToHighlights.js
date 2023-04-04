const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import post model
const Post = require("../../models/Post.model");

const addToHighlights = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    if (!req.params.id) {
      throw createError.BadRequest("Post id is required");
    }
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: ObjectId(userId) },
      { is_highlight: true },
      { new: true }
    );
    if (!post) {
      throw createError.BadRequest();
    }
    res.json({ message: "success", data: post });
  } catch (error) {
    next(error);
  }
};

module.exports = addToHighlights;
