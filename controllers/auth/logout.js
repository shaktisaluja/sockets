const jwt = require("jsonwebtoken");

const { refreshSecret } = require("../../config/keys").jwt;

const Token = require("../../models/Token.model");

const logoutUser = async (req, res, next) => {
  try {
    if (req.cookies?.auth) {
      const { accessToken } = req.cookies;

      if (accessToken) {
        const { data } = jwt.verify(accessToken, refreshSecret);
        Token.findOneAndDelete({
          _userId: data._id,
          token: auth,
        });
      }
      res.cookie("accessToken", "deleted", {
        expires: new Date(Date.now() + 10000),
        httpOnly: true,
      });
      res.status(200).json({
        success: true,
        message: "User logged out successfully",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = logoutUser;
