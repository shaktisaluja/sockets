const createError = require("http-errors");

const User = require("../../models/User.model")
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../services/generate_token");
const { accessTokenLife, refreshTokenLife } = require("../../config/keys").jwt;

const loginUser = async (req, res, next) => {
  try {
    // validation check of credentials
    // const result = await loginValidation.validateAsync(req.body);
    const { user_handle } = req.body;

    const userExist = await User.findOne({
      user_handle
    })

    //if (!userExist) throw createError.BadRequest("user does not exist")

    const payload = {
      data: {
        _id: userExist._id,
        //name: userExist.name,
        userHandle: userExist.user_handle,
      },
      type: "user",
    };

    //Generate new access and refresh tokens
    const accessToken = generateAccessToken(payload, accessTokenLife);
    const refreshToken = generateRefreshToken(payload, refreshTokenLife);

    if (accessToken && refreshToken) {

      res.cookie("auth", refreshToken, { httpOnly: true });

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user: payload.data,
      });
    }
  } catch (error) {
    console.log("error: ", error);
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};





module.exports = loginUser;
