// const createError = require("http-errors");

const markMessageReadService = require("../../services/messages/markMessageRead");

const markMessageRead = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { id: messageId } = req.params;
  const { conversationId } = req.body;
  try {
    const messages = await markMessageReadService(
      userId,
      messageId,
      conversationId
    );
    res.status(200).json({
      message: "success",
      data: messages,
    });
  } catch (error) {
    console.log("mark message read error: ", error);
    next(error);
  }
};

module.exports = markMessageRead;
