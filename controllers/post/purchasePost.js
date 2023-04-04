const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const Post = require("../../models/Post.model");
const StripeTransaction = require("../../models/StripeTransaction.model");
const Wallet = require("../../models/Wallet.model");

const purchasePost = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const post = await Post.findOne({ _id: req.params.id });
    if (!post) {
      throw createError.BadRequest();
    }
    const transactionRecord = await StripeTransaction.findOne({
      intent_id: req.body.clientId,
      from: ObjectId(userId),
      endDate: null,
    });
    if (!transactionRecord) {
      throw createError.PaymentRequired();
    }
    await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { premium_group: ObjectId(userId) } },
      { new: true }
    );
    //  update the wallet when post is purchased....
    const wallet = await Wallet.findOne({ user: post.user });

    let money = wallet.money + post.price;

    wallet.money = money;

    await wallet.save();
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = purchasePost;
