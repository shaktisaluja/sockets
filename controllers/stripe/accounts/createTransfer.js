const createError = require("http-errors");
const stripe = require("../../../utils/stripe");

const User = require("../../../models/User.model.js");

const Wallet = require("../../../models/Wallet.model");
const { commissionRate } = require("../../../config/keys").coins;
const createTransfer = async (req, res, next) => {
  try {
    // check if accountId exists in StripeCustomer schema for userId
    const { _id: userId } = req.user.data;
    const user = await User.findOne({ _id: userId }).populate("creator_id");
    const { amount } = req.body;
    if (!user.creator_id) {
      throw createError.BadRequest("Account does not exist");
    }
    const walletBalance = await Wallet.findOne({ user: userId });
    if (amount >= (walletBalance.money / 100) * commissionRate) {
      throw createError.BadRequest("not enough Balance");
    }
    // transfer stripe balance

    const {
      creator_id: { stripe_account_id: accountId },
    } = user;
    const transfer = await stripe.transfers.create({
      amount,
      currency: "aud",
      destination: accountId,
    });

    // update wallet..
    walletBalance.money = walletBalance.money - amount;
    walletBalance.save();

    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });

    // create stripe payout
    const payout = await stripe.payouts.create({
      amount,
      currency: "aud",
      destination: accountId
    });

    return res.json({
      message: "success",
      amount: amount,
      availableBalance: walletBalance.money,
    });
  } catch (error) {
    console.log("error while creating transfer: ", error);
    next(error);
  }
};

module.exports = createTransfer;
