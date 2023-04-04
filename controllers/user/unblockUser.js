const User = require("../../models/User.model");
const UserFollow = require("../../models/UserFollow.model");
const BlockUser = require("../../models/blockUser.model");
const { ObjectId } = require("mongoose").Types;

const unblockUser = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const { id }=req.params;

      console.log(userId)
      const blockedUser = await BlockUser.findOneAndDelete({
        blockedBy : userId,
        blockedUser: id
      });

      res.status(201).send({ message: "success" });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = unblockUser;