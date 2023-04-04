const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

// import post model
const PostComment = require("../../models/Post-comment.model");
// const Post = require("../../models/Post.model");
const convertParams = require("../../helpers/convertParams");

const getComments = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const { query } = req;
    const currentPage= (query._Page && parseInt(query._Page)) || 1;
    const viewSize = (query.viewSize && parseInt(query.viewSize)) || 10;

   //Skipping documents according to pages 
   let skipDocuments=0
   if(currentPage!=1)skipDocuments=(currentPage-1)*viewSize
   
   //Getting all the comments along with user who commented
    const allComments = await PostComment.aggregate([
      { $match: { post_id: ObjectId(req.params.id) } },
      { $skip: skipDocuments },
      { $limit: parseInt(viewSize) },
       { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: "user",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
        { $unwind: { path: "$user" } },
      {
        $project: {
          _id: 1,
          post_id: 1,
          comment: 1,
          created_at: 1,
          updated_at: 1,
          user: {
            _id: 1,
            name: 1,
            user_handle: 1,
            avatar_url: 1,
          },
        },
      },
    ]);
    const count = await PostComment.countDocuments({
      post_id: ObjectId(req.params.id),
    });
    res.json({
      message: "success",
      data: {
        comments: allComments,
        count: allComments?.length,
        total_count: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getComments;



