const ResetPassword = require("../../models/resetPassword");

const ContactMech = require("../../models/ContactMech.model");
const { sendEmail, generateOTP } = require("../../services/sendEmail");

exports.forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await ContactMech.findOne({
      contact_mech_value: email,
    }).exec();
    console.log(user);
    if (!user) {
      return res.status(400).send({ message: "This email is not registered" });
    }
    await ResetPassword.findOneAndDelete({ email: email }).exec();
    const otp = generateOTP();
    const resetotp = new ResetPassword({
      otp,
      email,
    });
    const html = `<div style="background-color: #f5fafe; padding: 20px; font-family: sans-serif">
    <img src="https://test.khushbir.info/_next/static/image/assets/logos/myfanstime2x.24edf08e7601d00140bfa87364fa2a7c.png?auto=format&fit=max&w=1920" alt="Unite Logo" />
    <div style="background-color: #ffffff; padding: 20px; padding-bottom: 1px; margin-top: 20px">
        <p>Dear ${email}</p>
        <p style="display: block;
                    overflow: hidden;
                    height: 28px;
                    line-height: 28px;
                    vertical-align: top;
                    font-size: 28px;
                    width: 100%;
                    font-family: poppins, sans-serif;"
        >
          <span style="color: #3246d3;">${otp}</span>
          <span style="font-size: 18px;display: inline-block; vertical-align: top;">is the security code for authentication.</span>
        </p>
        <p style="font-size: 16px;color: #888">We look forward to hearing from you.</p>
        <p style="font-size: 16px;">
          <strong>myfanstime</strong>
        </p>
      </div>
    </div>`;
    await resetotp.save();
    await sendEmail([email], "Reset Password", html);
    res.status(200).send({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(400).send({ message: "Error occurred" });
  }
};
