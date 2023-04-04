const createError = require("http-errors");
const Message = require("../../models/Message.model");

const deleteMessage = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id: messageId } = req.params;
    const { conversation } = req.body;
    const conversationExists = await Message.findOneAndUpdate(
      {
        $or: [{ _id: messageId }, { reference_id: messageId }],
        conversation: conversation,
      },
      { $addToSet: { deleted_by: userId } },
      { new: true }
    );
    if (!conversationExists) {
      throw createError.InternalServerError(
        "Your request could not be processed. Please try again or contact support"
      );
    }
    res.status(200).json({
      message: "success",
    });
  } catch (error) {
    console.log("delete message error: ", error);
    next(error);
  }
};

module.exports = deleteMessage;
