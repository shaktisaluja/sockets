const createError = require("http-errors");
const ContactMech = require("../../models/ContactMech.model");
const StripeCustomer = require("../../models/StripeCustomer.model");
const User = require("../../models/User.model");
const UserLoginMech = require("../../models/UserLoginMech.model");
const Wallet = require("../../models/Wallet.model");
const stripe = require("../../utils/stripe");
const createUserHandle = require("../createUserHandle");


const oAuthRegisterUser = async (userDetails) => {
  try {
    console.log(userDetails,"hiiiiii")
    const {
      name,
      email,
    //  phone,
      email_verified,
      sub,
    } = userDetails;
    // const name = `${userDetails?.first_name} ${userDetails?.last_name}`;

    const userHandle = await createUserHandle(name.replace(" ", ""));

    const createdUser =  await User.create({
      name,
      OAuth:sub,
      // avatar_url: picture || null,
      user_handle: userHandle,
      email:email,
      role: "user",
    });

    // Save user to DB
    //const createdUser = await user.save();
    if (!createdUser)
      throw createError.InternalServerError(
        "Your request could not be processed. Please contact support or try again after some time."
      );

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

    //await createdUser.save();

    // generate user wallet
    // const userWallet = new Wallet({
    //   user: createdUser._id,
    //   coins: 0,
    //   money: 0,
    // });
    // await userWallet.save();

    // const userHandleLoginMech = new UserLoginMech({
    //   user: createdUser._id,
    //   login_mech_type: "google_auth",
    //   login_mech_value: sub,
    // });
    // await userHandleLoginMech.save();

    return createdUser;
  } catch (error) {
    console.log("error register: ", error);
    if (error.isJoi === true) error.status = 422;
    return error;
  }
};

module.exports = oAuthRegisterUser;
