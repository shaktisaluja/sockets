const BountyModel = require("../../models/Bounty.model");
const {bountyValidation} = require("../../services/validation_schema");


const createBounty = async (req, res, next) => {
    // const { _id: userId } = req.user.data;
    try {
    const {description,start_time,end_time,meme_coins,totalAttempts,totalQuestions,status} = req.body 
    
    const result = await bountyValidation.validateAsync(req.body);

    const BountyCreated = await BountyModel.create({
            description,
            start_time,
            end_time,
            meme_coins,
            totalAttempts,
            totalQuestions,
            status
        })
        res.status(201).send({ message: "success" ,data : BountyCreated});

     
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = createBounty;