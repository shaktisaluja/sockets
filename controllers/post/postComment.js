const createError = require("http-errors");
// import post model
const PostComment = require("../../models/Post-comment.model");
const Post = require("../../models/Post.model");
const sendCommentNotification = require("../../services/notifications/post/newCommentNotification");

const postComment = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    if (!req.body.comment) {
      throw createError.BadRequest("Comment data is required");
    }
    if (!req.params.id) {
      throw createError.BadRequest("Post id is required");
    }
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      throw createError.BadRequest("Post does not exist");
    }
    const comment = await PostComment.create( {
      post_id: req.params.id,
      user_id: userId,
      comment: req.body.comment
    })

    await Post.findByIdAndUpdate( req.params.id ,{$inc:{  comment_count: 1}});
  
    if (userId != post.user)
      sendCommentNotification(
        userId,
        post.user,
        req.params.id,
        comment.comment,
        req.io
      );
    res.json({ message: "success", data: comment });
  } catch (error) {
    next(error);
  }
};

module.exports = postComment;
