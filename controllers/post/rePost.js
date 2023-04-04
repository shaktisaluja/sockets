const Repost = require("../../models/rePost.model");
const Post = require("../../models/Post.model");
const newReshareNotification = require("../../services/notifications/post/newShareNotification");

const RePost = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const { id }=req.params;
      const{ target }= req.body;

      if(!target){
        res.status(400).send({status: false ,message: "Target is mandatory feild"})
      }

       const createRePost= await Repost.create({
        post_id:id,
        target:target,
        user :userId
       });

       const postHolder = await Post.findById({_id : id}).select({_id : 0 , user :1})

       newReshareNotification(
        userId,
        postHolder.user,
        id,
        // comment.comment,
        req.io
      );

  
      res.status(201).send({ message: "success" ,data:createRePost});
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = RePost;
