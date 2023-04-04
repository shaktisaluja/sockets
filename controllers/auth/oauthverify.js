const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// import verify token model and user model
const VerifyToken = require("../../models/VerifyToken.model");
const User = require("../../models/User.model");
const Token = require("../../models/Token.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../services/generate_token");
const { accessTokenLife, refreshTokenLife, accessSecret } = require("../../config/keys").jwt;

const oAuthVerify = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw createError.BadRequest();
    const tokenDetails = await VerifyToken.findOne({
      token,
      type: "oAuthRequest",
    });
    if (!tokenDetails)
      throw createError.BadRequest(
        "Failed to login from provider. Please try again or login using email."
      );
    const decodedData = jwt.verify(token, accessSecret);
    const user = await User.findOne({ _id: decodedData._id });
    if (!user)
      throw createError.BadRequest(
        "We were unable to find a user for this verification. Please SignUp!"
      );

    await VerifyToken.findOneAndDelete({
      user: user._id,
      token,
      type: "oAuthRequest",
    });

    const payload = {
      data: {
        _id: user._id,
        name: user.name,
        userHandle: user.user_handle,
        email: user.primary_email?.contact_mech_value,
        phone: user.primary_phone?.contact_mech_value,
        website: user.website,
        bio: user.bio,
        gender: user.gender,
        verified: user.verified,
        stripe_customer_id: user.stripe_customer_id,
      },
      type: "user",
    };

    //Generate new access and refresh tokens
    const accessToken = generateAccessToken(payload, accessTokenLife);
    const refreshToken = generateRefreshToken(payload, refreshTokenLife);

    if (accessToken && refreshToken) {
      const token = new Token({
        _userId: user._id,
        token: refreshToken,
      });
      token.save();

      res.cookie("auth", refreshToken, { httpOnly: true });

      res.status(200).json({
        success: true,
        accessToken,
        refreshToken,
        user: payload.data,
      });
    }
  } catch (error) {
    console.log("from oauthverify", error);
    next(error);
  }
};

module.exports = oAuthVerify;
