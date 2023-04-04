const createError = require("http-errors");
const sendCommentNotification = require("../../services/notifications/post/newLikeNotification");
// import post model
const PostLike = require("../../models/Post-like.model");
const Post = require("../../models/Post.model");
// const User = require("../../models/User.model");
const postLike = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const postId = req.params.id; //!paramId == postId
    if (!postId) {
      throw createError.BadRequest("Post id is required");
    }
    const post = await PostLike.findOne({
      post_id: postId,
      user: userId,
    });
    // not recomended way.. returning error if post is already liked.
    if (post) {
      throw createError.BadRequest("You cannot like multiple times");
    }
    let postUser = await Post.findOne({ _id: req.params.id }).select({
      _id: 0,
      user: 1,
    });
    console.log(postUser);
    //Increment of like count in Post
    let result = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      { $inc: { like_count: 1 } }
    );
    let record = await PostLike.create({
      post_id: postId,
      postUser: postUser.user, //!User which had posted the post so that we can fetch the likes analystics when are fetching the likes count over user post.
      user: userId,
    });
    if (userId != postUser)
      sendCommentNotification(
        userId,
        postUser.user,
        req.params.id,
        // comment.comment,
        req.io
      );
    res.json({
      message: "success",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = postLike;
//{ $inc: { like_count : 1}},{new : true }
