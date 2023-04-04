const createError = require("http-errors");

const getMessagesService = require("../../services/messages/getMessages");

const getMessagesByRoomId = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { query } = req;
  try {
    if (!query.conversationId) {
      throw createError.BadRequest("Conversation id is required.");
    }
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    const messages = await getMessagesService(
      query.conversationId,
      userId,
      startIndex,
      viewSize
    );
    res.status(200).json({
      message: "success",
      data: messages,
    });
  } catch (error) {
    console.log("get recent messages error: ", error);
    next(error);
  }
};

module.exports = getMessagesByRoomId;
