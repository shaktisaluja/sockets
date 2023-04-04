const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

const Gift = require("../../models/Gift.model");
const Post = require("../../models/Post.model");
const PostGift = require("../../models/PostGift.model");
const Wallet = require("../../models/Wallet.model");
const { commissionRate } = require("../../config/keys").coins;
const CoinTransaction = require("../../models/CoinTransaction.model");

const postGift = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { postId } = req.params;
    const { giftId } = req.body;

    const gift = await Gift.findOne({ _id: ObjectId(giftId) });
    if (!gift) throw createError.BadRequest("Gift does not exists");

    const giftedPost = await Post.findOne({ _id: postId });
    if (!giftedPost) throw createError.BadRequest("Post does not exists");
    const payingWallet = await Wallet.findOne({ user: userId });
    if (!payingWallet)
      throw createError.InternalServerError(
        "This user's wallet does not exists"
      );
    if (payingWallet && payingWallet.coins - gift.cost < 0)
      throw createError.BadRequest("Insufficient balance");

    payingWallet.coins = payingWallet.coins - gift.cost;
    await payingWallet.save();

    const newGift = new PostGift({
      user: userId,
      post: postId,
      gift: giftId,
      receiver: giftedPost?.user,
    });
    await newGift.save();
    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: giftedPost.user },
      { $inc: { coins: gift.cost * commissionRate } },
      { new: true }
    );
    const coinTransaction = new CoinTransaction({
      sender: userId,
      post: postId,
      receiver: giftedPost.user,
      coins: gift.cost,
      type: "gift",
      commissionRate: commissionRate,
    });
    await coinTransaction.save();
    return res.json({
      message: "success",
      coins: updatedWallet?.coins,
    });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

module.exports = postGift;
