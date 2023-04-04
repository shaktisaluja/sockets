const createError = require("http-errors");
const uploadFiles = require("../../services/upload-files");
const formidable = require("formidable");
const BountyProgram = require("../../models/Bounty.model")
const BountyQuestions = require("../../models/BountyQuestion.model")
const { ObjectId } = require("mongoose").Types;



const createBountyQuestion = async (req, res, next) => {
const {id} = req.params
  const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }



    try {

      const {
        
        text,
        type,
        meme_coins,
        correctAnswer,
        option
        
       
      } = fields;

      const filesArray = Object.values(files);
      const allFileUploadedArray = await Promise.all(
        filesArray?.map(async (item) => {
          let location = item.path;
          const originalFileName = item.name;
          const fileType = item.type;
          // uploads file.
          const data = await uploadFiles.upload(
            location,
            originalFileName,
            `users/${id}/posts`,
            null
          );
          return {
            url: data.Location,
            type: fileType,
          };
        })
      );

      const bountyDetails = await BountyProgram.findOne({ _id:ObjectId(id) });

      if (!bountyDetails) {
        throw createError.BadRequest({messege:"This bounty program not exist"});
      }
      const saveBountyQuestion= await BountyQuestions.create({
        media: allFileUploadedArray,
        bountyProgramId:id,
        text,
        type,
        meme_coins,
        correctAnswer,
        option
      });

     
      res.json({
        success: true,
        status: 200,
        message: "Question created successfully",
        saveBountyQuestion,
      });
    } catch (error) {
      next(error);
    }
  });
};


module.exports = createBountyQuestion;
