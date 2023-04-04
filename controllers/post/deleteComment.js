const createError = require("http-errors");
// import post model
const PostComment = require("../../models/Post-comment.model");
const Notification = require("../../models/Notification.model");

const deleteComment = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const comment = await PostComment.deleteOne({
      // post_id: req.params.id,
      // user: userId,
      _id: req.params.commentId,
    });
    if (!comment) {
      throw createError.InternalServerError("This comment does not exist");
    }
    // Notification.findOneAndDelete({
    //   subject: req.params.id,
    //   actor: userId,
    //   verb: "comment",
    // });
    res.json({ message: "success" });
  } catch (error) {
    next(error);
  }
};

module.exports = deleteComment;
