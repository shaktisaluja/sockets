const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import post model
const Bookmark = require("../../models/Bookmark.model");
const Post = require("../../models/Post.model");

const getBookMarkedPosts = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    if (!req.query._start) {
      throw createError.BadRequest();
    }
    const allPosts = await Bookmark.aggregate([
      {
        $match: {
          user: ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "post",
          localField: "post",
          foreignField: "_id",
          as: "post",
        },
      },
      { $unwind: { path: "$post" } },
      { $replaceWith: "$post" },
      {
        $facet: {
          count: [
            {
              $count: "total_count",
            },
          ],
          data: [
            {
              $lookup: {
                from: "subscription",
                let: { user_id: "$user" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$subscription_to", "$$user_id"] },
                          { $eq: ["$subscription_from", ObjectId(userId)] },
                        ],
                      },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                    },
                  },
                ],
                as: "is_subscribed",
              },
            },
            {
              $unwind: {
                path: "$is_subscribed",
                preserveNullAndEmptyArrays: true,
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
              $lookup: {
                from: "userfollows",
                let: { user_id: "$user._id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$to", "$$user_id"] },
                          { $eq: ["$from", ObjectId(userId)] },
                        ],
                      },
                    },
                  },
                ],
                as: "user_follow",
              },
            },
            {
              $unwind: {
                path: "$user_follow",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "postrating",
                let: { post_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$post_id", "$$post_id"] }],
                      },
                    },
                  },
                ],
                as: "rating_count",
              },
            },
            {
              $lookup: {
                from: "postcomment",
                let: { post_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$post_id", "$$post_id"] }],
                      },
                    },
                  },
                ],
                as: "comment_count",
              },
            },
            {
              $lookup: {
                from: "postgift",
                let: { post_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [{ $eq: ["$post", "$$post_id"] }],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "gift",
                      localField: "gift",
                      foreignField: "_id",
                      as: "gift",
                    },
                  },
                  {
                    $unwind: {
                      path: "$gift",
                    },
                  },
                  {
                    $replaceWith: "$gift",
                  },
                  {
                    $group: {
                      _id: "$_id",
                      name: { $first: "$name" },
                      cost: { $first: "$cost" },
                      media: { $first: "$media" },
                      count: { $sum: 1 },
                    },
                  },
                ],
                as: "postgift",
              },
            },
            {
              $set: {
                has_access: true,
              },
            },
            {
              $project: {
                name: 1,
                created_at: 1,
                updated_at: 1,
                average_rating: 1,
                type: 1,
                postgift: 1,
                media_type: 1,
                is_subscribed: 1,
                price: 1,
                has_access: 1,
                is_highlight: 1,
                rating_count: { $size: "$rating_count" },
                comment_count: { $size: "$comment_count" },
                user: {
                  _id: 1,
                  name: 1,
                  user_handle: 1,
                  avatar_url: 1,
                  follow_status: "$user_follow.status",
                },
                media: 1,
              },
            },
            {
              $lookup: {
                from: "postrating",
                let: { post_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user", ObjectId(userId)] },
                          { $eq: ["$post_id", "$$post_id"] },
                        ],
                      },
                    },
                  },
                ],
                as: "user_rating",
              },
            },
            {
              $unwind: {
                path: "$user_rating",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "bookmark",
                let: { post_id: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$user", ObjectId(userId)] },
                          { $eq: ["$post", "$$post_id"] },
                        ],
                      },
                    },
                  },
                ],
                as: "user_bookmark",
              },
            },
            {
              $unwind: {
                path: "$user_bookmark",
                preserveNullAndEmptyArrays: true,
              },
            },
            { $sort: { updated_at: -1 } },
            { $skip: parseInt(req.query?._start) },
            { $limit: parseInt(req.query?._limit) },
          ],
        },
      },
    ]);
    res.json({
      posts: allPosts[0]?.data,
      count: allPosts[0]?.data?.length,
      totalCount: allPosts[0]?.count[0]?.total_count,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getBookMarkedPosts;
