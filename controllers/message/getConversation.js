const { ObjectId } = require("mongoose").Types;

const Conversation = require("../../models/Conversation.model");

// to get conversation information by _id

const getConversation = async (req, res, next) => {
  try {
    const {
      params: { id },
    } = req;
    const { _id: userId } = req.user.data;
    const conversation = await Conversation.aggregate([
      {
        $match: {
          _id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          // status: 1,
          // owner: 1,
          // price: 1,
          members: {
            _id: 1,
            name: 1,
            avatar_url: 1,
            user_handle: 1,
            // conversation_price: 1,
          },
        },
      },
    ]);
    // checking if the part of the conversation if not then bad request
    const isPartOfConversation =
      conversation?.[0].members.findIndex(
        (member) => member._id.toString() === userId.toString()
      ) !== -1;
    if (isPartOfConversation) {
      return res.status(200).json({
        message: "success",
        data: { conversation },
      });
    }
    throw "This user is not a member of this conversation";
  } catch (error) {
    console.log("get group error: ", error);
    next(error);
  }
};
module.exports = getConversation;
