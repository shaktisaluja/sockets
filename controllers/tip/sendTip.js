const createError = require("http-errors");
const Post = require("../../models/Post.model");
const User = require("../../models/User.model");
const confirmPayment = require("../../services/confirmPayment");
const Wallet = require("../../models/Wallet.model");

const sendTip = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { postId, to, price } = req.body;
  try {
    const postExists = await Post.findOne({ _id: postId });
    const userExist = await User.findOne({ _id: to });
    if (postExists && userExist) {
      const success = await confirmPayment({ ...req.body, userId });
      if (success && success.paymentIntent.amount === price * 100) {
        //  update the wallet for receiver tip is sent...
        const wallet = await Wallet.findOne({ user: to });
        let money = wallet.money + price;
        wallet.money = money;
        await wallet.save();
        // update users wallet..
        const userWallet = await Wallet.findOne({ user: to });
        let userMoney = userWallet.money + price;
        userWallet.money = userMoney;
        await userWallet.save();
        res.json({
          success: true,
        });
      } else {
        throw createError.InternalServerError();
      }
    } else {
      throw createError.Conflict("Post or user does not exist");
    }
  } catch (error) {
    console.log("Error:Sending Tip", error);
    next(error);
  }
};

module.exports = sendTip;
