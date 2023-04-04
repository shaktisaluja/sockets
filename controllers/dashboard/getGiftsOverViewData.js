const { ObjectId } = require("mongoose").Types;

const { commissionRate, redeemPrice } = require("../../config/keys").coins;
const CoinTransaction = require("../../models/CoinTransaction.model");

const getGiftsOverViewData = async (req, res, next) => {
  const { query } = req;

  try {
    const { _id: userId } = req.user.data;
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;

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

    const data = await CoinTransaction.aggregate([
      // Filter out transactions which is of type chat
      { $match: { receiver: ObjectId(userId), type: "gift" } },
      { $match: searchCriteria },
      {
        $group: {
          _id: "$conversation",
          revenue: { $sum: { $multiply: ["$coins", "$commissionRate"] } },
          count: { $sum: 1 },
          coins: { $sum: "$coins" },
          sender: { $first: "$sender" },
        },
      },
      // add pagination and calculate total
      {
        $facet: {
          totalCount: [{ $count: "total_count" }],
          count: [
            {
              $group: {
                _id: null,
                sum: { $sum: "$count" },
              },
            },
          ],
          totalEarnings: [
            {
              $group: {
                _id: null,
                sum: { $sum: "$revenue" },
              },
            },
          ],
          coins: [
            {
              $group: {
                _id: null,
                sum: { $sum: "$coins" },
              },
            },
          ],

          data: [
            { $sort: { created_at: -1 } },
            { $skip: startIndex },
            { $limit: parseInt(viewSize) },
            {
              $lookup: {
                from: "user",
                localField: "sender",
                foreignField: "_id",
                as: "sender",
              },
            },

            { $unwind: { path: "$sender" } },

            {
              $project: {
                _id: 1,

                amount: 1,
                coins: 1,
                commissionRate: 1,
                count: 1,
                created_at: 1,
                revenue: 1,
                sum: 1,
                sender: { _id: 1, name: 1, avatar_url: 1, user_handle: 1 },
                totalEarnings: 1,
                conversation: { members: 1, type: 1, group_name: 1 },
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      message: "success",
      data: data.length > 0 ? data[0].data : [],
      count: data[0]?.data?.length || 0,
      totalCount: data?.[0]?.totalCount[0]?.total_count || 0,
      totalRevenue: data[0]?.totalEarnings[0]?.sum * redeemPrice || 0,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getGiftsOverViewData;
