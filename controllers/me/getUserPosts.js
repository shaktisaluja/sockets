// const createError = require("http-errors");
const convertParams = require("../../helpers/convertParams");
const { ObjectId } = require("mongoose").Types;

// import user model
const Post = require("../../models/Post.model");

const getUserPosts = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { query } = req;
    const filters = await convertParams(Post, query);
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    const searchCriteria = filters.where;
    searchCriteria.user = ObjectId(userId);

    const allPosts = await Post.aggregate([
      {
        $match: searchCriteria,
      },
      { $sort: { created_at: -1 } },
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
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
          has_access: true,
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
    const count = await Post.countDocuments(searchCriteria);
    res.status(200).json({
      message: "success",
      posts: allPosts,
      count: allPosts.length,
      post_total: count,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getUserPosts;
