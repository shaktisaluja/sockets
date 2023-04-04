const User = require("../../models/User.model");
const BlockUser = require("../../models/blockUser.model");
const { ObjectId } = require("mongoose").Types;

const unBlockUser = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const { id : blockedUser }=req.params;
      const blockUserExist = await BlockUser.findOne({
        blockedBy: ObjectId(userId),
        blockedUser: ObjectId(blockedUser)
      });

      if(!blockUserExist){
        res.status(400).send({ status : false , message : "blocked user does not exist"})
      }

      const unblockUser = await BlockUser.deleteOne({
        blockedBy: ObjectId(userId),
        blockedUser: ObjectId(blockedUser)
      });
      res.status(200).send({ message: "success" });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = unBlockUser;