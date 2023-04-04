const createError = require("http-errors");

// import post model
const PostLike = require("../../models/Post-like.model");
const Post = require("../../models/Post.model");


const postDisLike = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const postId = req.params.id;
      if (!postId) {
        throw createError.BadRequest("Post id is required");
      }
  
      const post = await PostLike.findOne({
        post_id: postId,
        user: userId
      });
      if (!post) {
        throw createError.BadRequest("You cannot disLike multiple times");
      }
  
  
  
     //Decrement of like count in Post
      await Post.findByIdAndUpdate( req.params.id ,{$inc:{like_count : -1}});

      await PostLike.deleteOne({post_id:postId})
  
        res.json({
        message: "success"
      })
  
   
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = postDisLike;