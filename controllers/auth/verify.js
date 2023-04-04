const bcrypt = require("bcryptjs");
const createError = require("http-errors");

// import verify token model and user model
const User = require("../../models/User.model");
const VerifyTokenModel = require("../../models/VerifyToken.model");

const verifyEmail = async (req, res, next) => {
  try {
    const { userId, token } = req.query;
    if (!userId || !token) throw createError.BadRequest();
    const user = await User.findOne({ _id: userId });
    if (!user)
      throw createError.BadRequest(
        "We were unable to find a user for this verification. Please SignUp!"
      );
    if (user.is_verified) {
      res
        .status(402)
        .json({ error: "User has been already verified. Please Login" });
    }

    const tokenDetails = await VerifyTokenModel.findOne({
      user: userId,
      type: "verify-email",
    });
    if (!tokenDetails)
      throw createError.BadRequest(
        "Your verification link may have expired. Please send another verification email"
      );

    const isMatch = await bcrypt.compare(token, tokenDetails.token);
    if (!isMatch) throw createError();
    user.is_verified = true;
    const updatedUser = await user.save();
    if (!updatedUser)
      throw createError.InternalServerError(
        "User could not be verified. Please try again."
      );
    await VerifyTokenModel.findOneAndDelete({
      user: userId,
      token: tokenDetails.token,
      type: "verify-email",
    });
    res.status(200).json({
      success: true,
      message: "Your account has been successfully verified",
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = verifyEmail;
