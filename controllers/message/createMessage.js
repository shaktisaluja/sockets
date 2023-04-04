// const createError = require("http-errors");
const { v4: uuidv4 } = require("uuid");

const saveMessage = require("../../services/messages/saveMessage");
const { newMessageValidation } = require("../../services/validation_schema");

const createMessage = async (req, res, next) => {
  // const { _id: userId } = req.user.data;
  try {
    const { conversationId, type, message, sender ,postMessage} =
      await newMessageValidation.validateAsync(req.body);

    const referenceId = uuidv4();
    const messages = saveMessage({
      conversationId,
      type,
      message,
      sender,
      referenceId,
      postMessage
    });
    res.status(200).json({
      message: "success",
      data: messages,
    });
  } catch (error) {
    console.log("save message error: ", error);
    next(error);
  }
};

module.exports = createMessage;
