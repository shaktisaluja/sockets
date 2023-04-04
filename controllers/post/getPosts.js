const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongoose").Types;
const PostModel = require("../../models/Post.model");
const { accessSecret, refreshSecret, accessTokenLife, refreshTokenLife } =
  require("../../config/keys").jwt;

const getPosts = async (req, res, next) => {
  //const { _id: userId } = req.query.id;

  try {
    let bearerToken, token, userId;

    if (req.headers["authorization"]) {
      bearerToken = req.headers["authorization"];
      token =
        bearerToken.split(" ")[0] === "Bearer"
          ? bearerToken.split(" ")[1]
          : bearerToken;
      payload = jwt.verify(token, accessSecret);
      userId = payload.data._id;
    }

    if (req.query.postId) particularPost = req.query.postId;

    const { query } = req;

    const startIndex = parseInt(req.query.startIndex) || 0;
    const viewSize = parseInt(req.query.viewSize) || 10;

    //!FILTRATION through published and shared posts
    let searchCriteria = {};
    if (req.query.tags) {
      searchCriteria.tags = req.query.tags;
    }

    if (req.query.user_handle) {
      searchCriteria["user.user_handle"] = req.query.user_handle;
    }
    if (query.user) {
      searchCriteria.user = ObjectId(query.user);
    }
    if (query.postId) {
      searchCriteria._id = ObjectId(query.postId);
    }

    let allPost;

    // console.log(searchCriteria);
    //todo   MONGODB AGGREGATION
    if (userId) {
      allPost = await PostModel.aggregate([
        {
          $facet: {
            data: [
              { $sort: { created_at: -1 } },
              { $match: searchCriteria }, //!isPublished addition or isShared addition
              {
                $skip: startIndex,
              },
              {
                $limit: viewSize,
              },
              {
                $lookup: {
                  from: "post",
                  let: { id: "$rePostedID" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ["$_id", "$$id"] }],
                        },
                      },
                    },
                    {
                      $lookup: {
                        from: "user",
                        localField: "user",
                        foreignField: "_id",
                        as: "user",
                      },
                    },
                    {
                      $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $unwind: {
                        path: "$media",
                        preserveNullAndEmptyArrays: true,
                      },
                    },
                    {
                      $lookup: {
                        from: "postlike",
                        localField: "_id",
                        foreignField: "post_id",
                        as: "postLike",
                      },
                    },
                    {
                      $project: {
                        _id: 1,
                        like_count: 1,
                        comment_count: 1,
                        media: 1,
                        isLiked: { $in: [ObjectId(userId), "$postLike.user"] },
                        user: {
                          _id: 1,
                          name: 1,
                          user_handle: 1,
                          avatar_url: 1,
                          created_at: 1,
                          updated_at: 1,
                        },
                        created_at: 1,
                        updated_at: 1,
                      },
                    },
                  ],
                  as: "post",
                },
              },

              { $unwind: { path: "$post", preserveNullAndEmptyArrays: true } },
              {
                $unwind: {
                  path: "$post.user",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $unwind: {
                  path: "$post.media",
                  preserveNullAndEmptyArrays: true,
                },
              },
              { $unwind: { path: "$media", preserveNullAndEmptyArrays: true } },
              { $unset: ["rePostedID"] },
              {
                $lookup: {
                  from: "user",
                  localField: "user",
                  foreignField: "_id",
                  as: "user",
                },
              },
              { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
              {
                $lookup: {
                  from: "postlike",
                  localField: "_id",
                  foreignField: "post_id",
                  as: "postLike",
                },
              },
              {
                $addFields: {
                  isLiked: {
                    $in: [ObjectId(userId), "$postLike.user"],
                  },
                },
              },
              {
                $addFields: { follower_id: "$user._id" },
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
                $unwind: {
                  path: "$current_follow",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $addFields: {
                  "user.is_following": {
                    $cond: [
                      { $eq: [ObjectId(userId), "$current_follow.from"] },
                      true,
                      false,
                    ],
                  },
                },
              },
              {
                $lookup: {
                  from: "blockUser",
                  let: { user_block: "$chacha" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $eq: ["$blockedBy", ObjectId(userId)] },
                            { $eq: ["$blockedUser", "$$user_block"] },
                          ],
                        },
                      },
                    },
                  ],
                  as: "user_blocked",
                },
              },
              {
                $unwind: {
                  path: "$user_blocked",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $addFields: {
                  "user.is_blocked": {
                    $cond: [
                      { $eq: [ObjectId(userId), "$user_blocked.blockedBy"] },
                      true,
                      false,
                    ],
                  },
                },
              },
              {
                $unset: [
                  "user.created_at",
                  "user.updated_at",
                  "user.followers_count",
                  "user.following_count",
                  "user.onBoarding",
                  "user.city",
                  "user.gender",
                  "user.__v",
                  "user.state",
                  "user.bio",
                  "user.dob",
                  "postLike",
                ],
              },
            ],
            count: [
              {
                $match: searchCriteria,
              },
              {
                $count: "total",
              },
            ],
          },
        },
      ]);

      res.json({
        message: "success",
        data: {
          Posts: allPost[0].data,
          count: allPost[0].data.length,
          total_count: allPost[0].count[0].total,
        },
      });

    } else {
      allPost = await PostModel.aggregate([
        { $sort: { created_at: -1 } },
        {
          $skip: startIndex,
        },
        {
          $limit: viewSize,
        },
        {
          $lookup: {
            from: "user",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$media", preserveNullAndEmptyArrays: true } },
        {
          $unset: [
            "user.created_at",
            "user.updated_at",
            "user.followers_count",
            "user.following_count",
            "user.onBoarding",
            "user.city",
            "user.gender",
            "user.__v",
            "user.state",
            "user.bio",
            "user.dob",
            "postLike",
            //  "chacha"
          ],
        },
      ]);

      const count = await PostModel.find({}).count();
      res.json({
        message: "success",
        data: {
          Posts: allPost,
           count: allPost.length,
         total_count: count ,
        },
      });
    }

    //fetching single post
    // if (allPost.length == 1 && req.query.postId) {
    //   return res.status(200).send({
    //     Posts: allPost[0],
    //   });
    // }

  } catch (error) {
    next(error);
  }
};

module.exports = getPosts;
