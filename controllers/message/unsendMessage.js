// const createError = require("http-errors");

const unsendMessageService = require("../../services/messages/unsendMessage");

const unsendMessage = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { id: messageId } = req.params;
  const { id: conversationId } = req.body;
  try {
    const messages = await unsendMessageService({
      userId,
      conversationId,
      messageId,
    });
    res.status(200).json({
      message: "success",
      data: messages,
    });
  } catch (error) {
    console.log("unsend message error: ", error);
    next(error);
  }
};

module.exports = unsendMessage;
