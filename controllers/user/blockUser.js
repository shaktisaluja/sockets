const User = require("../../models/User.model");
const UserFollow = require("../../models/UserFollow.model");
const BlockUser = require("../../models/blockUser.model");
const { ObjectId } = require("mongoose").Types;

const blockUser = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const { id }=req.params;

      console.log(userId)
      const blockedUser = await BlockUser.create({
        blockedBy : userId,
        blockedUser: id
      });

     let follow = await UserFollow.find({from:ObjectId(userId), to : ObjectId(id)})
     if(follow) await UserFollow.findOneAndDelete({from:ObjectId(userId), to : ObjectId(id)})

     let follower = await UserFollow.find({from : ObjectId(id), to : ObjectId(userId)})   
     if(follower) await UserFollow.findOneAndDelete({from : ObjectId(id) , to : ObjectId(userId)})    

 
      res.status(201).send({ message: "success" });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = blockUser;