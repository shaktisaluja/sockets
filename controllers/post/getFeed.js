// const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

// import post model
const Post = require("../../models/Post.model");
const User = require("../../models/User.model");

const getFeed = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { query } = req;
  try {
    const currentUser = await User.findOne({ _id: userId });
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    const allPosts = await Post.aggregate([
      {
        $match: {
          $expr: {
            $or: [
              { $in: ["$user", currentUser.following] },
              { $in: ["$user", currentUser.subscribers] },
              { $eq: ["$admin_post", true] },
              { $eq: ["$user", ObjectId(userId)] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "subscription",
          let: { user_id: "$user", active: true },
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
        $set: {
          has_access: {
            $cond: [
              { $eq: [ObjectId(userId), "$user._id"] },
              true,
              {
                $switch: {
                  branches: [
                    {
                      case: { $eq: ["$type", "open"] },
                      then: true,
                    },
                    {
                      case: { $eq: ["$type", "subscription"] },
                      then: {
                        $cond: [
                          {
                            $eq: [{ $type: "$is_subscribed._id" }, "objectId"],
                          },
                          true,
                          false,
                        ],
                      },
                    },
                    {
                      case: { $eq: ["$type", "premium"] },
                      then: {
                        $cond: [
                          {
                            $in: [ObjectId(userId), "$premium_group"],
                          },
                          true,
                          false,
                        ],
                      },
                    },
                  ],
                  default: false,
                },
              },
            ],
          },
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
          name: {
            $cond: [{ $eq: ["text", "$media_type"] }, "$text", "$name"],
          },
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
          is_highlight: 1,
          rating_count: { $size: "$rating_count" },
          comment_count: { $size: "$comment_count" },
          user: {
            _id: 1,
            name: 1,
            user_handle: 1,
            avatar_url: 1,
          },
          has_access: 1,
          media: 1,
          user_follow: "$user_follow.status",
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
      { $sort: { created_at: -1 } },
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
    ]);

    ///////////////////////////////////////////////
    // TODO: Remove this sanitization everywhere //
    ///////////////////////////////////////////////
    const sanitizedData = allPosts.map((item) => {
      if (item?.has_access) {
        return item;
      }
      item.media = item.media.map((media) => ({
        thumbnail: media.thumbnail,
        type: media.type,
        preview: media.preview,
      }));
      return item;
    });
    const count = await Post.countDocuments({
      $expr: {
        $or: [
          { $in: ["$user", currentUser.following] },
          { $in: ["$user", currentUser.subscribers] },
          { $eq: ["$admin_post", true] },
          { $eq: ["$user", ObjectId(userId)] },
        ],
      },
    });

    res.status(200).send({
      posts: sanitizedData,
      count: allPosts.length,
      post_total: count,
      // test,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = getFeed;
