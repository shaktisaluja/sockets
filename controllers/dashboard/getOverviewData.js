// const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import verify token model and user model

const User = require("../../models/User.model");
const StripeTransaction = require("../../models/StripeTransaction.model");
const { commissionRate, redeemPrice } = require("../../config/keys").coins;
const CoinTransaction = require("../../models/CoinTransaction.model");

const deleteCover = async (req, res, next) => {
  try {
    const { query } = req;
    const { _id: userId } = req.user.data;

    let searchCriteria = {};

    if (query.startDate && query.endDate) {
      searchCriteria = {
        created_at: {
          $gte: new Date(query.startDate),
          $lt: new Date(query.endDate),
        },
      };
    } else if (query.startDate) {
      searchCriteria = {
        created_at: { $gte: new Date(query.startDate) },
      };
    } else if (query.endDate) {
      searchCriteria = {
        created_at: { $lt: new Date(query.endDate) },
      };
    }

    const moneyFromPurchase = await StripeTransaction.aggregate([
      { $match: { to: ObjectId(userId), type: "purchase" } },
      { $match: searchCriteria },
      {
        $project: {
          _id: 1,
          amount: 1,
        },
      },
      {
        $group: {
          _id: null,
          sum: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const moneyFromTips = await StripeTransaction.aggregate([
      { $match: { to: ObjectId(userId), type: "tip" } },
      { $match: searchCriteria },
      {
        $facet: {
          count: [
            {
              $count: "count",
            },
          ],
          data: [
            {
              $project: {
                _id: 1,
                amount: 1,
              },
            },
          ],
          revenue: [
            {
              $group: {
                _id: null,
                sum: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);
    const subscriptionsData = await User.aggregate([
      { $match: { _id: ObjectId(userId) } },
      { $match: searchCriteria },
      {
        $project: {
          _id: 1,
          subscriber_count: { $size: "$subscribers" },
          subscription_price: 1,
        },
      },
    ]);
    console.log(subscriptionsData[0], "subscriptionsData");
    console.log(
      "money: ",
      typeof subscriptionsData[0]?.subscriber_count,
      typeof subscriptionsData[0]?.subscription_price
    );

    const coinFromPost = await CoinTransaction.aggregate([
      { $match: { receiver: ObjectId(userId), type: "gift" } },
      { $match: searchCriteria },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ["$coins", "$commissionRate"] } },
          coins: { $sum: "$coins" },
          count: { $sum: 1 },
        },
      },
    ]);
    console.log({ userId });
    const coinFromchat = await CoinTransaction.aggregate([
      { $match: { receiver: ObjectId(userId), type: "chat" } },
      { $match: searchCriteria },

      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                revenue: { $sum: { $multiply: ["$coins", "$commissionRate"] } },
                coins: { $sum: "$coins" },
                count: { $sum: 1 },
              },
            },
          ],
          // for count of unique sonversation apply group by sender
          overAllSender: [
            {
              $group: {
                _id: "$sender",
                revenue: { $sum: { $multiply: ["$coins", "$commissionRate"] } },
                coins: { $sum: "$coins" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    let subscriptionTotal =
      subscriptionsData.length > 0
        ? (subscriptionsData[0].subscriber_count *
            subscriptionsData[0].subscription_price) /
          100
        : 0;
    const purchaseTotal =
      moneyFromPurchase.length > 0 ? moneyFromPurchase[0].sum / 100 : 0;
    let postTotal =
      coinFromPost.length > 0 ? coinFromPost[0].revenue * redeemPrice : 0;
    let tipsTotal =
      moneyFromTips.length > 0 &&
      moneyFromTips[0].revenue.length > 0 &&
      moneyFromTips[0].revenue.length > 0 &&
      moneyFromTips[0].revenue.length > 0
        ? (moneyFromTips[0].revenue[0].sum / 100) * commissionRate
        : 0;
    let chatTotal =
      coinFromchat.length > 0 ? coinFromchat[0]?.revenue * redeemPrice : 0;
    return res.status(200).json({
      message: "success",
      data: {
        subscriptions: {
          count:
            subscriptionsData.length > 0
              ? subscriptionsData[0].subscriber_count
              : 0,
          price:
            subscriptionsData.length > 0
              ? subscriptionsData[0].subscription_price / 100
              : 0,
          revenue:
            subscriptionsData.length > 0
              ? (subscriptionsData[0].subscriber_count *
                  subscriptionsData[0].subscription_price) /
                100
              : 0,
        },
        posts: {
          count: moneyFromPurchase.length > 0 ? moneyFromPurchase[0].count : 0,
          revenue:
            moneyFromPurchase.length > 0 ? moneyFromPurchase[0].sum / 100 : 0,
        },
        tips: {
          count:
            moneyFromTips.length > 0 && moneyFromTips[0]?.count?.length > 0
              ? moneyFromTips[0].count[0]?.count
              : 0,
          revenue:
            moneyFromTips.length > 0 &&
            moneyFromTips[0].revenue.length > 0 &&
            moneyFromTips[0].revenue.length > 0 &&
            moneyFromTips[0].revenue.length > 0
              ? (moneyFromTips[0].revenue[0].sum / 100) * commissionRate
              : 0,
        },
        gifts: {
          count: coinFromPost.length > 0 ? coinFromPost[0].count : 0,
          coins: coinFromPost.length > 0 ? coinFromPost[0].coins : 0,
          revenue:
            coinFromPost.length > 0 ? coinFromPost[0].revenue * redeemPrice : 0,
        },
        chats: {
          count:
            coinFromchat.length > 0 ? coinFromchat[0]?.overAllSender.length : 0,
          coins:
            coinFromchat.length > 0 ? coinFromchat[0]?.overall[0]?.coins : 0,
          revenue:
            coinFromchat.length > 0
              ? coinFromchat[0]?.overall[0]?.revenue * redeemPrice || 0
              : 0,
        },
        totalRevenue:
          subscriptionTotal +
            purchaseTotal +
            postTotal +
            tipsTotal +
            chatTotal || 0,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = deleteCover;
