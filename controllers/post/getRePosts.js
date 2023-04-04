const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const RePostModel = require("../../models/rePost.model");
var mongoose = require('mongoose');



const getRePosts = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
        const { query } = req;
        const currentPage = (query._Page && parseInt(query._Page)) || 1;
        const viewSize = (query._limit && parseInt(query._limit)) || 10;

        //Skipping documents according to pages 
        let skipDocuments = 0
        if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize

        //Getting all the Posts added in the Folder
        const rePosts = await RePostModel.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            { $skip: skipDocuments },
            { $limit: parseInt(viewSize) },
            { $sort: { created_at: -1 } },
             {
                $lookup: {
                    from: "post",
                    //   localField: "post_id",
                    //   foreignField: "_id",
                    let: { id: "$post_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$id"] }],
                                },
                            },
                        }, {
                            $lookup: {
                                from:"user",

                                   localField: "user",
                                  foreignField: "_id",
                                  as:"user"
                            }
                        },
                        { $project: {
                                  _id: 1,
                                  like_count:1,
                                  comment_count:1,
                                  media:1,
                                  user: {
                                    _id: 1,
                                    name: 1,
                                    user_handle: 1,
                                    avatar_url: 1,
                                  },
                                },
                              },

                    ],
                    as: "postDetail",
                    

                },
            },
            { $unwind: { path: "$postDetail" } },
            { $unset: [ "created_at", "updated_at","__v","post_id"] }
       
        ]);
        const count = await RePostModel.find({}).count();
        res.json({
            message: "success",
            data: {
                RePosts: rePosts,
                 count: rePosts.length,
                 total_count: count,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = getRePosts;