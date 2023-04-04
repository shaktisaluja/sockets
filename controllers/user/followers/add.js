const createError = require("http-errors");

// import verify token model and user model
const UserFollow = require("../../../models/UserFollow.model");
const User = require("../../../models/User.model");
const newFollowNotification = require("../../../services/notifications/follow/newFollowNotification");
const Wallet = require("../../../models/Wallet.model")

const addAsFollowing = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id } = req.params;  ///!path params should be used to increase the following or from feild
  

    
      const user = await User.findOne({ _id: id });
      if (!user) throw createError.BadRequest("User does not exist!");
    
        const follow = await UserFollow.findOne({
          to: id,            //!follower
          from: userId,      //!following
        })
        if (follow) {
          throw createError.Conflict(
            "You are already following or have sent follow request to this user"
          );
        }
     
        const followerIncrement = await User.findOneAndUpdate({_id :id},{$inc:{followers_count : 1}},{new : true})
        console.log(followerIncrement)
        if(followerIncrement.followers_count == 25){
          await Wallet.findOneAndUpdate({user :userId},{$inc:{meme_coins : 3}} ,{new : true})
        }
        if(followerIncrement.followers_count == 100){
          await Wallet.findOneAndUpdate({user :userId},{$inc:{meme_coins : 5}} ,{new : true})
        }
        if(followerIncrement.followers_count == 500){
          await Wallet.findOneAndUpdate({user :userId},{$inc:{meme_coins : 10}} ,{new : true})
        }
       
        const folowingIncrement = await User.findOneAndUpdate({_id :userId},{$inc:{following_count : 1}} ,{new : true})



        const createFollowing= await UserFollow.create({
          to: id,
          from: userId,
        });

        if (userId != UsersPost)
        newFollowNotification(
          userId,
          id,
          req.io
        );
        
        res.status(200).json({
          message: "success",
          data: createFollowing,
        });
      
    
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = addAsFollowing;
