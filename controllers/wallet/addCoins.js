const createError = require("http-errors");
const Wallet = require("../../models/Wallet.model");
const confirmPayment = require("../../services/confirmPayment");

const purchaseCoins = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const wallet = await Wallet.findOne({ user: userId });
    if (wallet) {
      const success = await confirmPayment({ ...req.body, userId });
      if (success && success.paymentIntent.amount === req.body.price * 100) {
        //respond with the client secret and intent id of the new payment intent
        const updatedWallet = await Wallet.findOneAndUpdate(
          { user: userId },
          { $inc: { coins: req.body.amount } },
          { new: true }
        );
        res.json({
          success: true,
          wallet: updatedWallet,
        });
      } else {
        throw createError.InternalServerError();
      }
    } else {
      throw createError.Conflict("Wallet does not exist");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = purchaseCoins;
