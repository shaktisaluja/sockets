// const createError = require("http-errors");
const Conversation = require("../../models/Conversation.model");

const {
  getMessageGroupValidation,
} = require("../../services/validation_schema");

/**
 * Get a conversation group
 * @param {ObjectId} sender - sender _id
 * @param {ObjectId} receiver - receiver _id
 */
const checkIfConversationExists = async (req, res, next) => {
  try {
    const { sender, receiver } = await getMessageGroupValidation.validateAsync(
      req.query
    );
    const conversationExists = await Conversation.findOne({
      $or: [{ members: [sender, receiver] }, { members: [receiver, sender] }],
    });
    if (conversationExists) {
      return res.status(200).json({
        message: "success",
        data: { exists: true, conversation_id: conversationExists._id },
      });
    }
    res.status(200).json({
      message: "success",
      data: { exists: false },
    });
  } catch (error) {
    console.log("get group error: ", error);
    next(error);
  }
};

module.exports = checkIfConversationExists;
