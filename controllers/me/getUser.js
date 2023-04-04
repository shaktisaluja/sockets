// import user model
const User = require("../../models/User.model");
// const PostGift = require("../../models/PostGift.model");
const { ObjectId } = require("mongoose").Types;

const getUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const isUserExist = await User.findById({ _id: ObjectId(userId)});

    if(!isUserExist){
      return res.status(404).send({status : false ,message : "User does not exist"})
    }
    const user = await User.aggregate([
      {
        $match: {
          _id: ObjectId(userId),
        },
      },
    ]);
  
    return res.status(200).json({
      status: "success",
      data: user[0],
    });
  } catch (err) {
    res.status(500).json({
      message: "Error while fetching user",
      error: err,
    });
  }
};
module.exports = getUser;