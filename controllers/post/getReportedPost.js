const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const ReportModel = require("../../models/Report.model");

const getReports = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  console.log(userId)
  try {
    const { query } = req;
    const currentPage = (query._Page && parseInt(query._Page)) || 1;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;

    //Skipping documents according to pages
    let skipDocuments = 0;
    if (currentPage != 1) skipDocuments = (currentPage - 1) * viewSize;

    //Getting all the Posts added in the Folder
    const reports = await ReportModel.aggregate([
      { $match: { reportedBy: ObjectId(userId) } },
      { $skip: skipDocuments },
      { $limit: parseInt(viewSize) },
      { $sort: { created_at: -1 } },
      {
        $lookup: {
          from: "post",
          let: { id: "$post_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$id"] }],
                },
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
          ],
          as: "postDetail",
        },
      },
       { $unwind: { path: "$postDetail" } },
       { $unset: ["updated_at", "__v"] },
    ]);

    res.json({
      message: "success",
      data: {
        RePosts: reports
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = getReports;
