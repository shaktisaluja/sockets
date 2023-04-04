const ReportModel = require("../../models/Report.model");
const PostModel = require("../../models/Post.model");
const { ObjectId } = require("mongoose").Types;



const getReportedPost = async (req, res, next) => {
    try {
    const{ userId , reportedBy }=req.query

    const searchCriteria = {}
    if(userId) { searchCriteria.userId = ObjectId(userId)}
    if(reportedBy) { searchCriteria.reportedBy = ObjectId(reportedBy)}

    const currentPage = (req.query._Page && parseInt(req.query._Page)) || 1;
    const viewSize = (req.query.viewSize && parseInt(req.query.viewSize)) || 10;

      //Skipping documents according to pages 
      let skipDocuments = 0
      if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize

    const reportedPosts = await ReportModel.aggregate([
        { $sort: { created_at: -1 } },
        { $skip: skipDocuments },
        { $limit: parseInt(viewSize) },
        { $match: searchCriteria }, 
    ]);

    const count = await ReportModel.find({}).count();
  
      res.status(201).send({ message: "success" ,
      data: {
        reportedPosts: reportedPosts,
        count: reportedPosts.length,
        total_count: count,
    }
    });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = getReportedPost;