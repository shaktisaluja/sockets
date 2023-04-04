const createError = require("http-errors");

// import user model
const User = require("../../models/User.model");
// const PostGift = require("../../models/PostGift.model");
const Post = require("../../models/Post.model");
// const { ObjectId } = require("mongoose").Types;

const getUserAwards = async (req, res, next) => {
  try {
    const user_handle = req.params.id;
    const response = await User.findOne({ user_handle });
    if (!response)
      throw createError.InternalServerError("User details can not be fetched");

    const giftTypes = await Post.aggregate([
      { $match: { user: response?._id } },
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
          ],
          as: "postgifts",
        },
      },
      {
        $unwind: {
          path: "$postgifts",
        },
      },
      {
        $group: {
          _id: "$postgifts.gift", // Group key
          count: {
            $count: {},
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $lookup: {
          from: "gift",
          localField: "_id",
          foreignField: "_id",
          as: "awardDetails",
        },
      },
      {
        $unwind: {
          path: "$awardDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: "$awardDetails.name",
          media: "$awardDetails.media",
        },
      },
    ]);

    res.status(200).json({
      message: "success",
      data: giftTypes,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getUserAwards;
