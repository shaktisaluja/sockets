const createError = require("http-errors");
const crypto = require("crypto");
const User = require("../../models/User.model");
const assert = require("assert");
const { baseUrl } = require("../../config/keys");

const { accessTokenLife, refreshTokenLife } = require("../../config/keys").jwt;
const {
  // generateCryptoKey,
  generateAccessToken,
  generateRefreshToken,
} = require("../../services/generate_token");

const { clientURL } = require("../../config/keys").app;

// import models
const VerifyToken = require("../../models/VerifyToken.model");
// const Token = require("../../models/Token.model");

const oAuthLogin = async (req, res, next) => {
  try {
    //! generation of token and saving in cookies
    // const payload = {
    //   data: {
    //     _id: req.user.id.toString()
    //   }
    // };

    // //Generate new access and refresh tokens
    // const accessToken = generateAccessToken(payload, accessTokenLife);
    // const refreshToken = generateRefreshToken(payload, refreshTokenLife);

    // if (accessToken && refreshToken) {

    //   res.cookie("accessToken", `Bearer ${accessToken}`, { httpOnly: true });

    //! Encryption of userId and sending it through through query params

    let algorithm = "aes256"; // or any other algorithm supported by OpenSSL
    let key = "ExchangePasswordPasswordExchange"; // or any key from .env
    let text = req.user.id.toString();
    let iv = "75ee244a7c9857f8";

    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");

    console.log(encrypted, text);

    let decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted =
      decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");

    const checkOnBoarding = await User.findOne({
      _id: text,
      onBoarding: false,
    });
    console.log(checkOnBoarding);

    if (checkOnBoarding) {
      //!redirecting to onBoarding page
      res.redirect(
        `${baseUrl.base_client_url}/user/registration?token=${encrypted}`
      );
    } else {
      //! generation of token and saving in cookies
      const payload = {
        data: {
          _id: req.user.id.toString(),
        },
      };
      //Generate new access and refresh tokens
      const accessToken = generateAccessToken(payload, accessTokenLife);
      const refreshToken = generateRefreshToken(payload, refreshTokenLife);

      if (accessToken && refreshToken)
        res.cookie("accessToken", `Bearer ${accessToken}`, { httpOnly: true });

      //!redirecting to home page
      res.redirect(
        `${baseUrl.base_client_url}/${baseUrl.frontend_redirect_url}?token=${accessToken}`
      );
    }
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

module.exports = oAuthLogin;
