const UserBountyModel = require("../../models/UserBountyModel");

const createUserBounty = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    const {
      bountyProgramId,bountyQuestionId,userAnswer,meme_coins,correctAnswer,result,rewardedCoins,description,
    } = req.body;

    const createdUserBounty = await UserBountyModel.create({
      userId,
      bountyProgramId,
      bountyQuestionId,
      userAnswer,
      meme_coins,
      correctAnswer,
      result,
      rewardedCoins,
      description,
    });
    res.status(201).send({ message: "success", data: createdUserBounty });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports = createUserBounty;
