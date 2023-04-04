const router = require("express").Router();
const passport = require("passport");
const session = require('express-session');
// require('./auth');

// bring in controllers
const registerUser = require("../../controllers/auth/register");
const loginUser = require("../../controllers/auth/login");
const logoutUser = require("../../controllers/auth/logout");
const updateOnBoarding= require("../../controllers/auth/userOnBoardingProcess")
const verifyEmail = require("../../controllers/auth/verify");
const { forgotpassword } = require("../../controllers/auth/forgotPassword");
const { verifyOtp } = require("../../controllers/auth/verifyOTP");
const { resetPassword } = require("../../controllers/auth/resetPassword");
const oAuthLogin = require("../../controllers/auth/oauth");
const oAuthVerify = require("../../controllers/auth/oauthverify");
// login user
router.post("/login", loginUser);

//onBoarding Page
router.put("/onBoarding",updateOnBoarding)

// logout user
router.delete("/logout", logoutUser);

// verify email
router.post("/verify", verifyEmail);

// register a user
router.post("/register", registerUser);

// router.post("/requestResetPassword", requestResetPassword);
// router.post("/resetPassword", resetForgotPassword);
router.post("/forgotPassword", forgotpassword);
router.post("/verifyOtp/:token", verifyOtp);
router.post("/resetPassword/:token", resetPassword);


//api/auth/google
router.get(
    "/google",
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email", "phone"],
    })
  );
  
  // /api/auth/google/callback
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: false,
    }),
    oAuthLogin
  );
  
  // /api/auth/verify-oauth
  router.post("/verify/oauth", oAuthVerify);


module.exports = router;


