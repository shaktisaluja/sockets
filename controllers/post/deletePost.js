const createError = require("http-errors");
// import post model
const Post = require("../../models/Post.model");
const { ObjectId } = require("mongoose").Types;
const User = require("../../models/User.model");
const PostComment = require("../../models/Post-comment.model");
const PostRating = require("../../models/Post-like.model");
const Notification = require("../../models/Notification.model");

const deletePost = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const postId = req.params.id
  try {
    //const post = await Post.deleteOne({ _id: req.params.id, user: userId });

    const post =await Post.findById({_id:postId })
    if (!post) {
      throw createError.InternalServerError();
    }
    await Post.findOneAndDelete({_id : ObjectId(postId)})
    const reposts= await Post.find({rePostedID : postId})
    if(reposts){
    await Post.deleteMany({rePostedID : ObjectId(postId)})
    }
    // await User.findOneAndUpdate(
    //   { _id: userId },
    //   { $pull: { posts: req.params.id } }
    // );

    // await PostRating.deleteMany({
    //   post_id: req.params.id,
    // });
    // await PostComment.deleteMany({
    //   post_id: req.params.id,
    // });
    // await Notification.deleteMany({
    //   subject: req.params.id,
    // });

    res.json({ message: "success" });
  } catch (error) {
    next(error);
  }
};

module.exports = deletePost;







