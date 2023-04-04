const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import verify token model and user model
const UserFollow = require("../../models/UserFollow.model");

const getFollowings = async (req, res, next) => {
  try {
    const { query } = req;
     const { _id: userId } = req.user.data;
console.log(userId)

    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;

    const response = await UserFollow.aggregate([
      { $match: { from: ObjectId(userId) } },
      // {
      //   $lookup: {
      //     from: "user",
      //     localField: "to",
      //     foreignField: "_id",
      //     as: "to",
      //   },
      // },
      // { $unwind: { path: "$to" } },
      // { $replaceWith: "$to" },
      // {
      //   $addFields: {
      //     results: {
      //       $or: [
      //         {
      //           $regexMatch: {
      //             input: "$name",
      //             regex: `${query.keyword || ""}`,
      //             options: "i",
      //           },
      //         },
      //         {
      //           $regexMatch: {
      //             input: "$user_handle",
      //             regex: `${query.keyword || ""}`,
      //             options: "i",
      //           },
      //         },
      //       ],
      //     },
      //   },
      // },
      // {
      //   $match: {
      //     $expr: {
      //       $eq: ["$results", true],
      //     },
      //   },
      // },
      // {
      //   $project: {
      //     _id: 1,
      //     name: 1,
      //     is_private: 1,
      //     user_handle: 1,
      //     avatar_url: 1,
      //     follow_status: "accepted",
      //     is_following: true,
      //   },
      // },
      // { $skip: startIndex },
      // { $limit: parseInt(viewSize) },
    ]);
    // if (!response)
    //   throw createError.InternalServerError(
    //     "User followers can not be fetched"
    //   );

    // const count = await UserFollow.countDocuments({
    //   from: ObjectId(userId),
    //   status: "accepted",
    // });
    return res.status(200).json({
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

module.exports = getFollowings;
