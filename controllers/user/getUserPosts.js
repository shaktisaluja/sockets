const createError = require("http-errors");

// import post model
const Post = require("../../models/Post.model");
const User = require("../../models/User.model");
const { ObjectId } = require("mongoose").Types;
const convertParams = require("../../helpers/convertParams");

const getUserPosts = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { query } = req;
  try {
    const { id: user_id } = req.params;
    if (!user_id) throw createError.BadRequest("User id is required!");
    const user = await User.findOne({ user_handle: user_id });
    if (!user) throw createError.BadRequest("This user does not exist");
    const resp = await User.aggregate([
      {
        $match: { _id: ObjectId(user._id) },
      },
      {
        $project: {
          has_access: {
            $cond: [
              {
                $or: [
                  { $eq: [ObjectId(userId), "$_id"] },
                  { $eq: [false, "$is_private"] },
                ],
              },
              true,
              {
                $cond: [{ $in: [ObjectId(userId), "$followers"] }, true, false],
              },
            ],
          },
        },
      },
    ]);
    if (!resp[0]?.has_access) throw createError.Forbidden("");
    const filters = await convertParams(Post, query);
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    let searchCriteria = {};
    if (query.type === "premium") {
      searchCriteria = {
        $expr: {
          $or: [
            { $eq: ["$type", "premium"] },
            { $eq: ["$type", "subscription"] },
          ],
        },
      };
    } else {
      searchCriteria = filters.where;
    }
    const allPosts = await Post.aggregate([
      {
        $match: { user: ObjectId(user._id) },
      },
      {
        $match: searchCriteria,
      },
      { $sort: { created_at: -1 } },
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
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
                    { $eq: ["$active", true] },
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
      /////////////////////////

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
    ]);
    const count = await Post.countDocuments({...searchCriteria, user: user._id});

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

module.exports = getUserPosts;
