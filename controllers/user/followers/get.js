const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import verify token model and user model
const UserFollow = require("../../../models/UserFollow.model");
const User = require("../../../models/User.model");
const Post = require("../../../models/Post.model");

const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const { query } = req;
    const { _id: userId } = req.user.data;
    console.log(userId);
    const startIndex = parseInt(req.query.startIndex) || 0;
    const viewSize = parseInt(req.query.viewSize) || 10;

    const response = await UserFollow.aggregate([
      { $match: { to: ObjectId(id) } },
      // {
      //   $skip: startIndex,
      // },
      // {
      //   $limit: viewSize,
      // },
      {
        $lookup: {
          from: "user",
          localField: "from",
          foreignField: "_id",
          as: "from",
        },
      },
      { $unwind: { path: "$from" } },
      {
        $addFields: { follower_id: "$from._id" },
      },
      {
        $lookup: {
          from: "userfollows",
          let: { user_followed: "$follower_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$from", ObjectId(userId)] },
                    { $eq: ["$to", "$$user_followed"] },
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
          "from.is_following": {
            $cond: [
              { $eq: [ObjectId(userId), "$current_follow.from"] },
              true,
              false,
            ],
          },
        },
      },

      { $replaceWith: "$from" },

      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
    ]);
    if (!response)
      throw createError.InternalServerError(
        "User followers can not be fetched"
      );

    res.status(200).json({
      message: "success",
      data: {
        data: response,
        // count: response.length,
        // total: count,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

const getMyPendingFollowRequestersList = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    if (userId) {
      const user = await User.findOne({ _id: userId });
      if (!user.is_private)
        throw createError.BadRequest(
          "No pending follow request for public account!"
        );
      else {
        const query = {
          to: userId,
          status: "pending",
        };
        const count = await UserFollow.countDocuments(query);

        const followList = await UserFollow.aggregate([
          {
            $match: { to: ObjectId(userId), status: "pending" },
          },
          {
            $lookup: {
              from: "user",
              localField: "from",
              foreignField: "_id",
              as: "followRequestBy",
            },
          },
          {
            $project: {
              _id: 1,
              from: 1,
              to: 1,
              status: 1,
              created_at: 1,
              updated_at: 1,
              followRequestBy: {
                _id: 1,
                name: 1,
                avatar_url: 1,
                user_handle: 1,
                bio: 1,
              },
            },
          },
        ]);

        return res.status(200).json({
          message: "success",
          data: followList,
          count,
        });
      }
    } else {
      throw createError.BadRequest("User id not found!");
    }
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};
const getMyPendingFollowRequestsList = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const query = {
      from: userId,
      status: "pending",
    };
    const count = await UserFollow.countDocuments(query);

    const followList = await UserFollow.find(query)
      .populate({
        path: "to",
      })
      .limit(10);

    return res.status(200).json({
      message: "success",
      data: followList,
      count,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

const getUserStats = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const ratings = await Post.aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      // lookup post rating
      {
        $lookup: {
          from: "postrating",
          localField: "_id",
          foreignField: "post_id",
          as: "post_rating",
        },
      },
      {
        $unwind: {
          path: "$post_rating",
        },
      },
      {
        $replaceWith: "$post_rating",
      },
      {
        $group: {
          _id: null,
          // value of rating is 1
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
          // value of rating is 2
          twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          // value of rating is 3
          threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          // value of rating is 4
          fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          // value of rating is 5
          fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        },
      },
    ]);

    return res.status(200).json({
      message: "success",
      data: ratings?.[0] || {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFollowers,
  getMyPendingFollowRequestersList,
  getMyPendingFollowRequestsList,
  getUserStats,
};
