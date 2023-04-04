const bcrypt = require("bcryptjs");
const createError = require("http-errors");

// import nodemailer function and verification template
// const sendEmail = require("../../services/sendEmail");
// const verifyEmailTemplate = require("../../config/emailTemplates/verifyEmail");

const User = require("../../models/User.model");
const UserLoginMech = require("../../models/UserLoginMech.model");
const VerifyToken = require("../../models/VerifyToken.model");
const Token = require("../../models/Token.model");

const resetPassword = async (req, res, next) => {
  try {
    const { userid, token, password } = req.body;
    if (!userid || !token || !password) throw createError.BadRequest();

    const user = await User.findOne({ _id: userid });
    if (!user)
      throw createError.BadRequest(
        "We were unable to find a user for this link. Please SignUp!"
      );
    let tokenDetails = [];
    await VerifyToken.find(
      {
        user: userid,
        type: "forget-password",
      },
      (err, data) => {
        if (err) {
          throw createError.BadRequest(
            "This link seems to have been expired. Please try again."
          );
        } else {
          tokenDetails = data.pop();
        }
      }
    );

    if (!tokenDetails)
      throw createError.BadRequest(
        "This link seems to have been expired. Please try again."
      );
    // compare token
    const isMatch = await bcrypt.compare(token, tokenDetails.token);
    if (!isMatch) throw createError();
    // this runs when the request is legit
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    if (!hashedPassword) {
      throw createError.BadRequest(
        "Your request could not be processed. Please try again after some time."
      );
    }
    const loginMerch = await UserLoginMech.updateMany(
      { user: tokenDetails.user },
      { password: hashedPassword },
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      }
    );
    if (!loginMerch)
      throw createError.BadRequest(
        "Your request could not be processed. Please try again after some time."
      );

    // remove all refresh tokens
    const deleted = await Token.deleteMany({ _userId: user._id });
    if (!deleted) throw createError.InternalServerError();

    await VerifyToken.deleteMany({ user: userid, type: "forget-password" });

    // send password change confirmation email to user
    // const message = {
    //   subject: "Password Successfully changed",
    //   body: emailTemplate(createdUser, "", "confirmPassword"),
    // };

    // await sendEmail(
    //     [email],
    //     "Verify your FansTime account",
    //     verifyEmailTemplate(
    //       { name: user?.name },
    //       `http://localhost:3000/forgotpassword?token=${requestPasswordToken}&user=${user?._id}`
    //     )
    //   );

    res.status(200).json({
      success: true,
      message: "Password Successfully changed",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = resetPassword;
