const User = require("../../../models/User.model");
const UserFollow = require("../../../models/UserFollow.model");
const { ObjectId } = require("mongoose").Types;

const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { query } = req;
    const { _id: userId } = req.user.data;

    console.log(id, userId);

    const searchCriteria = {};
    const startIndex = parseInt(req.query.startIndex) || 0;
    const viewSize = parseInt(req.query.viewSize) || 10;

    if (req.query.keyword) {
      // searchCriteria.name=req.query.keyword
      searchCriteria["$or"] = [
        {
          name: { $regex: `^${req.query.keyword}`, $options: "i" },
        },
      ];
    }

    const response = await UserFollow.aggregate([
     // { $match: searchCriteria },
    //  {
       // $facet: {
          // count: [
          //   {
          //     $count: "total",
          //   },
          // ],

          //data: [
            // {
            //   $sort: {
            //     createdAt: -1,
            //   },
            // },
            // {
            //   $lookup: {
            //     from: "user",
            //     localField: "from",
            //     foreignField: "_id",
            //     as: "user_details",
            //   },                                             
            // },
            // { $unwind: { path: "$user_details" } },
            // {
            //   $skip: startIndex,
            // },
            // {
            //   $limit: viewSize,
            // },
        //  ],
       // },
    //  },
      // ]);

      //  {
      //     to:
      //   //{ $eq: ["accepted", "$current_follow.status"] }
      //     {
      //       $cond:   [ { $eq: id },true ,false ]
      //     }
      // },
      // {
      //   $addFields: { chacha: "$from._id" },
      // },
      // {
      //   $lookup: {
      //     from: "userfollows",
      //     let: { user_followed: "$chacha" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ["$from", ObjectId(userId)] },
      //               { $eq: ["$to", "$$user_followed"] },
      //             ],
      //           },
      //         },
      //       },
      //     ],
      //     as: "current_follow",
      //   },
      // },
      // {
      //   $unwind: { path: "$current_follow", preserveNullAndEmptyArrays: true },
      // },
      // {
      //   $addFields: {
      //     "from.follow_status": "$current_follow.status",
      //     "from.is_following": {
      //       $cond: [
      //         { $eq: ["accepted", "$current_follow.status"] },
      //         true,
      //         false,
      //       ],
      //     },
      //   },
      // },
      // { $replaceWith: "$from" },
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
      //     follow_status: 1,
      //     is_following: 1,
      //   },
      // },
      // { $skip: startIndex },
      // { $limit: parseInt(viewSize) },
    ]);
    //   if (!response)
    //     throw createError.InternalServerError(
    //       "User followers can not be fetched"
    //     );
    // const count = await PostComment.countDocuments({
    //     post_id: ObjectId(req.params.id),
    //   });

    res.status(200).json({
      message: "success",
      data: {
        data: response,
        //   count: response.length,
        //   total: count,
      },
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getFollowers;