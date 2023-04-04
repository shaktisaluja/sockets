// const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

const PostRating = require("../../../models/Post-like.model");
// import post model
const { getPostsStatsValidation } = require("../../../services/validation_schema");

const getStats = async (req, res, next) => {
    try {
        const { id: postId } = await getPostsStatsValidation.validateAsync(req.params);
        console.log({ postId });
        // get grouped counts of different ratings
        const ratings = await PostRating.aggregate([
            {
                $match: {
                    post_id: ObjectId(postId),
                },
            },
            // get counts of 1 star, 2 stars, 3 stars, 4 stars, 5 stars
            {
                $group: {
                    _id: null,
                    // value of rating is 1
                    oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
                    // value of rating is 2
                    twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                    // value of rating is 3
                    threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                    // value of rating is 4
                    fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                    // value of rating is 5
                    fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                },
            },
        ]);
        return res.status(200).json({
            message: "success",
            data: ratings?.[0],
        });

    } catch (error) {
        next(error);
    }
};

module.exports = getStats;


