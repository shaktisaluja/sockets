const ReportModel = require("../../models/Report.model");
const PostModel = require("../../models/Post.model");

const createReport = async (req, res, next) => {
    const { _id: userId } = req.user.data;
    try {
      const { id :postId}=req.params;
      const{ description }= req.body;

      if(!description){
        res.status(400).send({status: false ,message: "description is mandatory feild"})
      }

      const userIdObject = await PostModel.findById({_id : postId}).select({user:1, _id :0});
      const postUser= userIdObject.user
      //console.log(userId)

      let reportExist = await ReportModel.findOne({
        post_id:postId,
        reportedBy : userId,
        userId:postUser,
      });
      
      if(reportExist){
        return res.status(400).send({status : false , message : "You had already reported this post"})
      }
      
       const createRePort= await ReportModel.create({
        post_id:postId,
       // category:category,
        reportedBy : userId,
        userId:postUser,
        description:description
       });

  
      res.status(201).send({ message: "success" ,data:createRePort});
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = createReport;