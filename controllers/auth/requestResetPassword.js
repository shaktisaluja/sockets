const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const { baseUrl } = require("../../config/keys");
const { generateCryptoKey } = require("../../services/generate_token");

// import nodemailer function and email template
const { sendEmail } = require("../../services/sendEmail");
const verifyEmailTemplate = require("../../config/emailTemplates/verifyEmail");

// import models
const User = require("../../models/User.model");
const ContactMech = require("../../models/ContactMech.model");
const VerifyToken = require("../../models/VerifyToken.model");
const { emailValidation } = require("../../services/validation_schema");

const requestResetPassword = async (req, res, next) => {
  try {
    console.log(req.body);
    // validate input email
    const { email } = await emailValidation.validateAsync(req.body);
    console.log(email);
    const primary_email = await ContactMech.findOne({
      contact_mech_value: email,
    });
    console.log(primary_email);

    // find email in db
    const user = await User.findOne({ primary_email });
    if (!user)
      throw createError.BadRequest(
        "This email is not associated to any account. Please register."
      );

    if (user.primary_email) {
      // generate request reset password token and save to db

      const requestPasswordToken = generateCryptoKey();
      const hashedToken = await bcrypt.hash(requestPasswordToken, 10);
      const passwordRequest = new VerifyToken({
        user: user?._id,
        token: hashedToken,
        type: "forget-password",
      });
      const savedPasswordToken = await passwordRequest.save();
      if (!savedPasswordToken) throw createError.InternalServerError();

      // send confirmation email to saved user
      await sendEmail(
        [email],
        "Verify your FansTime account",
        verifyEmailTemplate(
          { name: user?.name },
          `${baseUrl.base_client_url}/forgotpassword?token=${requestPasswordToken}&user=${user?._id}`
        )
      );
      res.status(200).json({
        success: true,
        message: "Email sent to reset password",
      });
    }
  } catch (err) {
    if (err.isJoi === true) err.status = 422;
    next(err);
  }
};

module.exports = requestResetPassword;
