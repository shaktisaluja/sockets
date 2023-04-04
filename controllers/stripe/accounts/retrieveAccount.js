const createError = require("http-errors");
const stripe = require("../../../utils/stripe");

const User = require("../../../models/User.model.js");
const Creator = require("../../../models/Creator.model.js");

const retrieveAccount = async (req, res, next) => {
  try {
    // check if accountId exists in StripeCustomer schema for userId
    const { _id: userId } = req.user.data;

    const userDetails = await User.findOne({
      _id: userId
    })

    if(!userDetails.is_creator) throw createError.BadRequest("Please register as a creator first")

    const creatorDetails = await Creator.findOne({
      _id: userDetails.creator_id,
    });

    if (!creatorDetails) {
      throw createError.BadRequest("Internal server error. Please contact administrator!");
    }

    // retrieve account from stripe
    const account = await stripe.accounts.retrieve(
      creatorDetails.stripe_account_id
    );

    creatorDetails.requirements = account?.requirements;
    await creatorDetails.save()

    res.json({ message: "success", accountId: account });
  } catch (error) {
    console.log("error in creating new stripe account: ", error);
    next(error);
  }
};

module.exports = retrieveAccount;
