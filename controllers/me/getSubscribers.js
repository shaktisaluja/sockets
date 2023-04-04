const { ObjectId } = require("mongoose").Types;
// import verify token model and user model
const UserFollow = require("../../models/UserFollow.model");
const User = require("../../models/User.model");

const getSubscribers = async (req, res, next) => {
  try {
    const { query } = req;
    const { _id: userId } = req.user.data;
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;

    const response = await User.aggregate([
      {
        $match: {
          _id: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "subscribers",
          foreignField: "_id",
          as: "subscribers",
        },
      },
      { $unwind: { path: "$subscribers" } },
      {
        $replaceWith: "$subscribers",
      },
      // check if user is following this subscriber
      {
        $lookup: {
          from: "userfollows",
          let: { sub_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$from", ObjectId(userId)] },
                    { $eq: ["$to", "$$sub_id"] },
                  ],
                },
              },
            },
          ],
          as: "current_follow",
        },
      },
      {
        $unwind: { path: "$current_follow", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          follow_status: "$current_follow.status",
          is_following: {
            $cond: [
              { $eq: ["accepted", "$current_follow.status"] },
              true,
              false,
            ],
          },
        },
      },
      // check if user is also subscribing this subscriber
      {
        $lookup: {
          from: "subscription",
          let: { sub_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$subscription_from", ObjectId(userId)] },
                    { $eq: ["$subscription_to", "$$sub_id"] },
                    { $eq: ["$active", true] },
                  ],
                },
              },
            },
          ],
          as: "current_sub",
        },
      },
      {
        $unwind: { path: "$current_sub", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          is_subscribing: {
            $cond: [{ $eq: [true, "$current_sub.active"] }, true, false],
          },
        },
      },
      {
        $addFields: {
          results: {
            $or: [
              {
                $regexMatch: {
                  input: "$name",
                  regex: `${query.keyword || ""}`,
                  options: "i",
                },
              },
              {
                $regexMatch: {
                  input: "$user_handle",
                  regex: `${query.keyword || ""}`,
                  options: "i",
                },
              },
            ],
          },
        },
      },
      {
        $match: {
          $expr: {
            $eq: ["$results", true],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          is_private: 1,
          user_handle: 1,
          avatar_url: 1,
          follow_status: 1,
          is_following: 1,
          is_subscribing: 1,
          subscription_active: 1,
          subscription_price: 1,
        },
      },
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
    ]);

    const user = await User.findOne({
      _id: userId,
    });
    return res.status(200).json({
      message: "success",
      data: {
        data: response,
        count: response.length,
        total: user?.subscribers.length,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getSubscribers;
