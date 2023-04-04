const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import verify token model and user model
const UserFollow = require("../../../models/UserFollow.model");
const User = require("../../../models/User.model");
const Post = require("../../../models/Post.model");

const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    // const { query } = req;
    const { _id: userId } = req.user.data;
    console.log(userId);
    //   const startIndex = (query._start && parseInt(query._start)) || 0;
    //   const viewSize = (query._limit && parseInt(query._limit)) || 10;

    const startIndex = parseInt(req.query.startIndex) || 0;
    const viewSize = parseInt(req.query.viewSize) || 10;

    const response = await UserFollow.aggregate([
      { $match: { from: ObjectId(id) } },
      {
        $skip: startIndex,
      },
      {
        $limit: viewSize,
      },
      {
        $lookup: {
          from: "user",
          localField: "to",
          foreignField: "_id",
          as: "to",
        },
      },
      { $unwind: { path: "$from" } },
      {
        $addFields: { follower_id: "$to._id" },
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
                    { $eq: ["$to", ObjectId(userId)] },
                    { $eq: ["$from", "$$user_followed"] },
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
          "to.is_following": {
            $cond: [
              { $eq: [ObjectId(userId), "$current_follow.to"] },
              true,
              false,
            ],
          },
        },
      },
      {
        $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
      },
      { $replaceWith: "$to" },

      //  { $skip: startIndex },
      //  { $limit: parseInt(viewSize) },
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

module.exports = getFollowing;
