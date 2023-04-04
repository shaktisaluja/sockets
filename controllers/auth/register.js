const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const formidable = require("formidable");

// import nodemailer function and verification template
// const sendEmail = require("../../config/nodemailer");
// const emailTemplate = require("../../config/emailTemplates/emailTemplate");

// import models and helpers
const User = require("../../models/User.model");
const ContactMech = require("../../models/ContactMech.model");
const UserLoginMech = require("../../models/UserLoginMech.model");
const Token = require("../../models/Token.model");
const Wallet = require("../../models/Wallet.model");
// const VerifyToken = require("../../models/VerifyToken.model");
const {
  generateAccessToken,
  generateRefreshToken,
  generateCryptoKey,
} = require("../../services/generate_token");
const { registerValidation } = require("../../services/validation_schema");
const { accessTokenLife, refreshTokenLife } = require("../../config/keys").jwt;
const { sendEmail } = require("../../services/sendEmail");
const verifyEmailTemplate = require("../../config/emailTemplates/verifyEmail");
const VerifyTokenModel = require("../../models/VerifyToken.model");
const stripe = require("../../utils/stripe");
const StripeCustomer = require("../../models/StripeCustomer.model");
const createUserHandle = require("../../services/createUserHandle");

const registerUser = async (req, res, next) => {
  try {
   // validation code here
    // if (!req.body?.email && !req.body?.phone)
    //   throw createError.BadRequest(
    //     "Email or phone number is required for registration."
    //   );
    //const result = await registerValidation.validateAsync(req.body);

    //eslint-disable-next-line no-unused-vars
    const { email ,user_handle,OAuth} = req.body;
    console.log(req.body)

    // check for already registration of email
    if (email) {
      // check if google login exist
      const userLogin = await UserLoginMech.findOne({
        login_mech_value: email,
      });
      if (userLogin) {
        if (userLogin.login_mech_type === "google_auth")
          throw createError.BadRequest(
            `This email is already registered with google. Please login in using google.`
          );
      }
      const existingEmail = await ContactMech.findOne({
        contact_mech_type: "email",
        contact_mech_value: email,
      });
      if (existingEmail) {
        throw createError.Conflict(
          `${email} is already registered. Please login.`
        );
      }
    }




    
    // check for already registration of phone
    // if (phone) {
    //   const existingPhone = await ContactMech.findOne({
    //     contact_mech_type: "phone",
    //     contact_mech_value: phone,
    //   });
    //   if (existingPhone) {
    //     throw createError.Conflict(
    //       `${phone} is already registered. Please login.`
    //     );
    //   }
    // }

    //const userHandle = await createUserHandle(name);

    const user = new User({
     OAuth:OAuth,
     email:email,
      user_handle: user_handle,
      is_verified: false,
      is_private: false,
      type: "user",
    });

    // const stripeCustomer = await stripe.customers.create({
    //   name: name || null,
    //   email: email || null,
    //   phone: phone || null,
    //   metadata: {
    //     id: user._id?.toString(),
    //   },
    // });

    // if (!stripeCustomer.id) {
    //   throw createError.InternalServerError("Stripe customer creation failed.");
    // }
    // user.stripe_customer_id = stripeCustomer.id;

    // await StripeCustomer.create({
    //   user_id: user._id,
    //   stripe_customer_id: stripeCustomer.id,
    // });

    // Save user to DB
    const createdUser = await user.save();
    if (!createdUser)
      throw createError.InternalServerError(
        "Your request could not be processed. Please contact support or try again after some time."
      );

      res.send({status :true , data:createdUser})

    // if (email) {
    //   const emailContactMech = new ContactMech({
    //     user: createdUser._id,
    //     contact_mech_type: "email",
    //     contact_mech_value: email,
    //   });

    //   const savedEmailContactMech = await emailContactMech.save();
    //   createdUser.primary_email = savedEmailContactMech._id;
    // }

    // if (phone) {
    //   const phoneContactMech = new ContactMech({
    //     user: createdUser._id,
    //     contact_mech_type: "phone",
    //     contact_mech_value: phone,
    //   });

    //   const savedPhoneContactMech = await phoneContactMech.save();
    //   createdUser.primary_phone = savedPhoneContactMech._id;
    // }

    // createdUser.save();

    // generate user wallet
    // const userWallet = new Wallet({
    //   user: createdUser._id,
    //   coins: 0,
    //   money: 0,
    // });
    // userWallet.save();

    // this runs when the user is new
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // if (email) {
    //   const userEmailLoginMech = new UserLoginMech({
    //     user: createdUser._id,
    //     login_mech_type: "email",
    //     login_mech_value: email,
    //     password: hashedPassword,
    //   });
    //   userEmailLoginMech.save();
    // }

    // if (phone) {
    //   const userPhoneLoginMech = new UserLoginMech({
    //     user: createdUser._id,
    //     login_mech_type: "phone",
    //     login_mech_value: phone,
    //     password: hashedPassword,
    //   });
    //   userPhoneLoginMech.save();
    // }

    // const userHandleLoginMech = new UserLoginMech({
    //   user: createdUser._id,
    //   login_mech_type: "user_handle",
    //   login_mech_value: userHandle,
    //   password: hashedPassword,
    // });
    // userHandleLoginMech.save();

    // generate verify email token and save to db
    // if (email) {
    //   const verificationToken = generateCryptoKey();
    //   const hashedToken = await bcrypt.hash(verificationToken, 10);
    //   const verification = new VerifyTokenModel({
    //     user: createdUser._id,
    //     token: hashedToken,
    //     type: "verify-email",
    //   });
    //   await verification.save();

      // send verification email to saved user
    //   await sendEmail(
    //     [email],
    //     "Verify your FansTime account",
    //     verifyEmailTemplate(
    //       { name: createdUser.name },
    //       `http://localhost:3000/verifyemail?token=${verificationToken}&user=${createdUser._id}`
    //     )
    //   );
    // }

    // generate access and refresh token

    // const jwtPayload = {
    //   data: {
    //     _id: createdUser._id,
    //     name: createdUser.name,
    //     phone: createdUser.primary_phone,
    //     email: createdUser.primary_email,
    //     website: createdUser.website,
    //     bio: createdUser.bio,
    //     gender: createdUser.gender,
    //     verified: createdUser.verified,
    //     stripe_customer_id: createdUser.stripe_customer_id,
    //     userHandle: userHandle,
    //   },
    //   type: "user",
    // };

    // const accessToken = generateAccessToken(jwtPayload, accessTokenLife);
    // const refreshToken = generateRefreshToken(jwtPayload, refreshTokenLife);
    // if (accessToken && refreshToken) {
    //   const newToken = new Token({
    //     _userId: user._id,
    //     token: refreshToken,
    //   });
    //   // save refresh token to db
    //   const savedToken = await newToken.save();
    //   if (!savedToken)
    //     throw createError.InternalServerError(
    //       "Your request could not be processed. Please try again."
    //     );
    //   // send response
    //   res.cookie("auth", refreshToken, { httpOnly: true });
    //   res.status(200).json({
    //     success: true,
    //     accessToken,
    //     refreshToken,
    //     user: jwtPayload.data,
    //   });
    //}
  } catch (error) {
    console.log("error register: ", error);
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

module.exports = registerUser;
