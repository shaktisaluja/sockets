const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const addPostInFolderModel = require("../../models/AddPostInFolder.model");


const getPostsFromFolder = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
        const { query } = req;
        const currentPage = (query._Page && parseInt(query._Page)) || 1;
        const viewSize = (query._limit && parseInt(query._limit)) || 10;

        //Skipping documents according to pages 
        let skipDocuments = 0
        if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize


        //folder_id: ObjectId(req.params.id)
        console.log(req.params.id)

        //Getting all the Posts added in the Folder
        const allAddedPostInFolder = await addPostInFolderModel.aggregate([
            { $match: { folder_id: req.params.id, user: ObjectId(userId) } },
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
                                from: "user",
                                localField: "user",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        // {
                        //     $addFields: {
                        //         isLiked: {
                        //             $in: [ObjectId(userId), "$postLike.user"]
                        //         },
                        //     },
                        // },

                        {
                            $lookup: {
                                from: "postlike",
                                localField: "_id",
                                foreignField: "post_id",
                                as: "postLike"
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                like_count: 1,
                                comment_count: 1,
                                media: 1,
                                created_at:1,
                                isLiked: {
                                    $in: [ObjectId(userId), "$postLike.user"]
                                },
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

            {
                $lookup: {
                    from: "postlike",
                    localField: "_id",
                    foreignField: "post_id",
                    as: "postLike"
                }
            },
            { $unwind: { path: "$postDetail.media" } },
            { $unwind: { path: "$postDetail.user" } },
                  {
                    $replaceRoot: { newRoot: "$postDetail" }
                  },
        ]);



        const count = await addPostInFolderModel.countDocuments({
            folder_id: ObjectId(req.params.id),
        });
        res.json({
            message: "success",
            data: {
                Posts: allAddedPostInFolder,
                count: allAddedPostInFolder.length,
                total_count: count,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = getPostsFromFolder;
