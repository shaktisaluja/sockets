// import user model
const User = require("../../models/User.model");
// const PostGift = require("../../models/PostGift.model");
const { ObjectId } = require("mongoose").Types;

const getUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const isUserExist = await User.findById({ _id: ObjectId(userId)});

    if(!isUserExist){
      res.status(404).send({status : false ,message : "User does not exist"})
    }

    const user = await User.aggregate([
      {
        $match: {
          _id: ObjectId(userId),
        },
      },
      {
        $project: {
            _id: 1,
            dob:1,
            gender:1,
            city:1,
            state:1,
            created_at: 1,
            updated_at: 1,
        },
    }
    ]);
  
    res.status(200).json({
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