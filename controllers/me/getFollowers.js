const createError = require("http-errors");
const User = require("../../models/User.model");
const UserFollow = require("../../models/UserFollow.model");
const { ObjectId } = require("mongoose").Types;

// const getFollowers = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { query } = req;
//     const { _id: userId } = req.user.data;

//     //console.log(id, userId)

//     const currentPage = (query._Page && parseInt(query._Page)) || 1;
//     const viewSize = (query._limit && parseInt(query._limit)) || 10;

//     //Skipping documents according to pages 
//     let skipDocuments = 0
//     if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize
//     if (userId === id) {
//       const response = await UserFollow.aggregate([
//         { $match: { to: ObjectId(id) } },
//         { $skip: skipDocuments },
//         { $limit: parseInt(viewSize) },
//         {
//           $addFields: {
//             isUserItSelf: {
//               $cond: [
//                 { $eq: [userId, id] },
//                 true,
//                 false,
//               ]
//             },
//           }
//         },
//         {
//           $match: {
//             $expr: {
//               $eq: ["$isUserItSelf", true],
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: "user",
//             localField: "from",
//             foreignField: "_id",
//             as: "from",
//           },
//         },
//         { $unwind: { path: "$from" } },

//       ]);

//       res.status(200).json({
//         message: "success",
//         data: {
//           data: response,
//           //   count: response.length,
//           //   total: count,
//         },
//       });
//     } else {
//       const response = await UserFollow.aggregate([
//         { $match: { to: ObjectId(id) } },
//         { $skip: skipDocuments },
//         { $limit: parseInt(viewSize) },
//         {
//         $project:
//         {
//           to: 1,
//           from: 1,
//           isfollow: { $eq: [ "$from", ObjectId(userId) ] },
//           _id: 0
//         }
//    },
//         {
//           $lookup: {
//             from: "user",
//             localField: "from",
//             foreignField: "_id",
//             as: "follower",
//           },
//         },
//         {
//           $lookup: {
//             from: "user",
//             localField: "to",
//             foreignField: "_id",
//             as: "following",
//           },
//         },

//         // {
//         //   $lookup: {
//         //       from: " userfollows",
//         //       let: { from: "$from" },
//         //       pipeline: [
//         //           {
//         //               $match: {
//         //                   $expr: {
//         //                       $and: [{ $eq: [ userId,"$$from" ] }],
//         //                   },
//         //               },
//         //           }, 
//                   // {
//                   //     $lookup: {
//                   //         from: "user",
//                   //         localField: "user",
//                   //         foreignField: "_id",
//                   //         as: "user"
//                   //     }
//                   // },
                   
                 

//           //     ],
//           //     as: "isMyFollower",


//           // },
//       //  }
//         // {
//         //   $addFields: {
//         //     is_follower: {
//         //       $cond: [{ $eq: ["$from", ObjectId(userId)] }, true, false],
//         //     },
//         //   },
//         // },
        


//         // {
//         //   $match: {
//         //     $expr: {
//         //       $eq: ["$results", true],
//         //     },
//         //   },
//         // },
//         // {
//         //   $lookup: {
//         //     from: "user",
//         //     localField: "to",
//         //     foreignField: "_id",
//         //     as: "from.userFollow",
//         //   },
//         // },

//         // {
//         //   $addFields: {
//         //     isFollower: {
//         //       $cond: [
//         //         { $eq: [userId, "to"] },
//         //         true,
//         //         false,
//         //       ]
//         //     },
//         //   }
//         // },

//       ]);

//       res.status(200).json({
//         message: "success",
//         data: {
//           data: response,
//           //   count: response.length,
//           ///   total: count,
//         },
//       });

//     }

//     //   if (!response)
//     //     throw createError.InternalServerError(
//     //       "User followers can not be fetched"
//     //     );
//     // const count = await PostComment.countDocuments({
//     //     post_id: ObjectId(req.params.id),
//     //   });

//   } catch (error) {
//     console.log("error: ", error);
//     next(error);
//   }
// };

// module.exports = getFollowers;


const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { query } = req;
    const { _id: userId } = req.user.data;

    const searchCriteria = {};
    const startIndex = parseInt(req.query.startIndex) || 0;
    const viewSize = parseInt(req.query.viewSize) || 10;


    const isUserExist = await User.findById({ _id: ObjectId(req.params.id)});
    console.log(isUserExist,'&&')

    if(!isUserExist){
      // return res.status(404).send({status : false ,message : "User does not exist"})
      throw createError.BadRequest("Id not correct ,please try with valid id");
    }

    if (req.query.keyword) {
      // searchCriteria.name=req.query.keyword
      searchCriteria["$or"] = [
        {
          name: { $regex: `^${req.query.keyword}`, $options: "i" },
        },
      ];
    }

    const userResponse = await User.findOne({ _id: id });

    if (userResponse.is_private === true) {
      if (!userResponse.followers.includes(userId))
        throw createError.Forbidden(
          "This is a private user. You need to follow them first."
        );
    }
  
    const response = await UserFollow.aggregate([
      { $match: searchCriteria },
      {
        $match: {from: ObjectId(req.params.id) }
    },
      {
        $facet: {
          count: [
            {
              $count: "total",
            },
          ],

          data: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "from",
                foreignField: "_id",
                as: "user_details",
              },
            },
            { $unwind: { path: "$user_details" } },
            {
              $skip: startIndex,
            },
            {
              $limit: viewSize,
            },
          ],
        },
      },
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
    // if (!response)
    //   throw createError.InternalServerError(
    //     "User followers can not be fetched"
    //   );

    // const count = await UserFollow.countDocuments({
    //   to: ObjectId(id),
    //   status: "accepted",
    // });
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
 module.exports = getFollowers;
