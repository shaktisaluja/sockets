const stripe = require("../../../utils/stripe");
const User = require("../../../models/User.model.js");
const Creator = require("../../../models/Creator.model.js");

const createAccount = async (req, res, next) => {
  try {
    // check if accountId exists in StripeCustomer schema for userId
    const { _id: userId } = req.user.data;
    const { body } = req;

    const user = await User.findOne({ _id: userId });

    if (user?.creator_id) {
      return res.status(200).json({
        message: "Account already exists",
        accountId: user.creator_id,
      });
    }
    // fetch email from user schema
    const {
      primary_email: { contact_mech_value: email },
      name,
    } = await User.findOne({ _id: userId })
      .populate("primary_email")
      .populate("primary_phone");

    const account = await stripe.accounts.create({
      type: "custom",
      country: body.country,
      email,
      capabilities: {
        transfers: {
          requested: true,
        },
      },
      business_type: "individual",
      business_profile: {
        url: body.business_profile,
      },
      individual: {
        first_name: name.split(" ")[0],
        last_name: name.split(" ")[1],
        email,
        // phone,
        address: {
          line1: body.line1,
          city: body.city,
          postal_code: body.postal_code,
          country: body.country,
          state: body.state,
        },
        dob: {
          day: body.dob.split("-")[2],
          month: body.dob.split("-")[1],
          year: body.dob.split("-")[0],
        },
        ssn_last_4: body.ssn,
        verification: {
          document: {
            front: "",
            back: "",
          },
        },
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.connection.remoteAddress,
      },
      external_account: {
        object: "bank_account",
        account_number: body.account_number,
        country: body.bank_country,
        currency: body.currency,
        routing_number: body.routing_number,
        account_holder_name: body.account_holder_name,
        account_holder_type: "individual",
      },
      default_currency: "aud",
      // documents
    });

    const newCreator = new Creator({
      address: account?.company?.address,
      dob: account?.individual?.dob,
      external_accounts: account?.external_accounts,
      stripe_account_id: account?.id,
      requirements: account?.requirements
    });
    await newCreator.save();

    await User.findByIdAndUpdate(userId, {
      is_creator: true,
      creator_id: newCreator?._id,
    });
    // Update account id of User

    res.json({ message: "success", accountId: account.id });
  } catch (error) {
    console.log("error in creating new stripe account: ", error);
    next(error);
  }
};

module.exports = createAccount;
