const createError = require("http-errors");
// import verify token model and user model
const User = require("../../models/User.model");

const deleteAvatar = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const avatar = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      { avatar_url: "" },
      { new: true }
    );
    res.status(200).json({
      message: "success",
      data: avatar,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = deleteAvatar;
