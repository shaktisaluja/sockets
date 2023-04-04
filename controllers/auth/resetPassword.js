const ResetPassword = require("../../models/resetPassword");
const { sendEmail } = require("../../services/sendEmail");
const UserLoginMech = require("../../models/UserLoginMech.model");
const bcrypt = require("bcryptjs");

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    // decode base64 token
    let buff = Buffer.from(token, "base64");
    let text = buff.toString("ascii");
    const [email, password] = text.split("-");
    const otp = await ResetPassword.findOne({
      email: email,
      isVerified: true,
    }).exec();
    if (!otp) {
      return res
        .status(400)
        .send({ message: "OTP is invalid or it may be expired!" });
    }

    const emailData = await UserLoginMech.findOne({
      login_mech_value: email,
    }).exec();
    console.log(emailData);
    if (!emailData) {
      return res.status(400).send({ message: "Email not found!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await UserLoginMech.findOneAndUpdate(
      { user: emailData.user },
      { password: hashedPassword },
      { new: true }
    ).exec();

    await ResetPassword.findOneAndDelete({ email: email }).exec();
    const html = `<h1>Your password has been reset successfully</h1>`;
    await sendEmail([email], "Reset Password", html);
    res.status(200).send({ message: "Password reset successfully" });
  } catch (err) {
    res.status(400).send({ message: "Error occured" });
  }
};
