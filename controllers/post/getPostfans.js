const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

// import post model
const Post = require("../../models/Post.model");
const User = require("../../models/User.model");

const getPost = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const postRes = await Post.findOne({ _id: ObjectId(req.params.id) });
    if (!postRes) throw createError.BadRequest("This post does not exist");

    // commented these lines as we are not having private users posts
    // TODO: in future if this functionality will be added un comment these lines 
    // let is_visible = false;
    // if (postRes.premium_group.includes(userId)) {
    //   is_visible = true;
    // } else {
      const resp = await User.aggregate([
        {
          $match: { _id: postRes.user },
        },
        {
          $project: {
            has_access: {
              $cond: [
                {
                  $or: [
                    { $eq: [ObjectId(userId), "$_id"] },
                    { $eq: [false, "$is_private"] },
                    { $eq: ["$admin_post", true] },
                  ],
                },
                true,
                {
                  $cond: [
                    { $in: [ObjectId(userId), "$followers"] },
                    true,
                    false,
                  ],
                },
              ],
            },
          },
        },
      ]);
      // is_visible = resp[0].has_access;
    // }
    // if (!is_visible)
    //   throw createError.Forbidden(
    //     "This account is private, you need to follow them"
    //   );
    const post = await Post.aggregate([
      {
        $match: { _id: ObjectId(req.params.id) },
      },
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
                    // { $eq: ["$active", true] },
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
      // {
      //   $unwind: {
      //     path: "$rating_count",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },
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
        $unwind: {
          path: "$media",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          created_at: 1,
          updated_at: 1,
          average_rating: 1,
          type: 1,
          text: 1,
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
      ///////////
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
    if (post.length !== 1)
      throw createError.InternalServerError(
        "Get post error, please try again or contact support"
      );

    ///////////////////////////////////////////////
    // TODO: Remove this sanitization everywhere //
    ///////////////////////////////////////////////

    if (!post[0].has_access) {
      post[0].media = post[0].media.map((media) => ({
        thumbnail: media.thumbnail,
        type: media.type,
        preview: media.preview,
      }));
      if (post[0].media_type === "text") {
        post[0].name =
          post[0]?.text || post[0]?.name.slice(0, 255).concat("...");
      }
    }
    res.json({
      message: "success",
      data: post[0],
    });
  } catch (error) {
    console.log("error get post: ", error);
    next(error);
  }
};

module.exports = getPost;
