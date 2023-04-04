// import user model
const User = require("../../models/User.model");
const BlockedUser = require("../../models/blockUser.model")
const UserFollow= require("../../models/UserFollow.model")
// const PostGift = require("../../models/PostGift.model");
const { ObjectId } = require("mongoose").Types;

const getUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const user = await User.findById({_id : req.params.id}).lean();

    console.log(req.params.id ,userId) 
    const following = await UserFollow.findOne({ to : ObjectId(req.params.id), from :ObjectId(userId) });
    const follower =await UserFollow.findOne({ from : ObjectId(req.params.id), to :ObjectId(userId) });
    const blocked= await BlockedUser.findOne({blockedBy : ObjectId(userId)})

    console.log(following ,follower)
   
if (following)user.isfollowing=true  //kya me samne vale ko follow karta hu
else user.isfollowing=false

if (follower)user.isfollower=true    //kya samne vala mujhe follow krta ha
else user.isfollower=false

if (blocked)user.isblocked=true   
else user.isblocked= false

  
    res.status(200).json({
      status: "success",
      data:user,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while fetching user",
      error: err,
    });
  }
};
module.exports = getUser;