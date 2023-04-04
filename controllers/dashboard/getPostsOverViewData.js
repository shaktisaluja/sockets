const { ObjectId } = require("mongoose").Types;

const StripeTransaction = require("../../models/StripeTransaction.model");

const getPostsOverViewData = async (req, res, next) => {
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

    const data = await StripeTransaction.aggregate([
      { $match: { to: ObjectId(userId), type: "purchase" } },
      { $match: searchCriteria },
      {
        $lookup: {
          from: "user",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      {
        $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
      },

      {
        $lookup: {
          from: "post",
          localField: "post_id",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $unwind: { path: "$post", preserveNullAndEmptyArrays: true },
      },
      {
        $facet: {
          count: [{ $count: "total_count" }],
          totalEarnings: [
            {
              $group: {
                _id: null,
                sum: {
                  $sum: { $multiply: ["$amount", "$purchaseCommission"] },
                },
              },
            },
          ],

          data: [
            { $sort: { created_at: -1 } },
            { $skip: startIndex },
            { $limit: parseInt(viewSize) },

            {
              $project: {
                _id: 1,
                from: { _id: 1, name: 1, avatar_url: 1, user_handle: 1 },
                amount: 1,
                post: {
                  _id: 1,
                  name: 1,
                  media: 1,
                  media_type: 1,
                  price: 1,
                  created_at: 1,
                },
                created_at: 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      message: "success",
      data: data[0]?.data,
      totalEarnings: data?.[0]?.totalEarnings[0]?.sum /100|| 0,
      count: data[0]?.data?.length || 0,
      totalCount: data[0]?.count[0]?.total_count || 0,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getPostsOverViewData;
