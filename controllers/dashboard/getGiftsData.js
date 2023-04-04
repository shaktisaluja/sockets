// const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
// import verify token model and user model
const Post = require("../../models/Post.model");

const deleteCover = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const posts = await Post.aggregate([
      { $match: { to: ObjectId(userId),user: ObjectId(userId) } },
      {
        $project: {
          _id: 1,
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
              $unwind: "$gift",
            },
          ],
          as: "gifts",
        },
      },
      {
        $unwind: "$gifts",
      },
      {
        $replaceWith: "$gifts.gift",
      },
      {
        $group: {
          _id: null,
          totalCoinsEarned: { $sum: "$cost" },
        },
      },
    ]);
    res.status(200).json({
      message: "success",
      data: posts,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = deleteCover;
