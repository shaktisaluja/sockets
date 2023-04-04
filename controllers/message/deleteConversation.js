const { ObjectId } = require("mongoose").Types;

const Conversation = require("../../models/Conversation.model");
const Message = require("../../models/Message.model");
const sendNotification = require("../../services/notifications/message/conversationNotification");

const deleteConversation = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user.data;
  try {
    const conversation = await await Conversation.findOneAndUpdate(
      { _id: id },
      { hidden_by: userId, status: "closed", owner: null }
    );
    await Message.updateMany(
      { conversation: id },
      { $addToSet: { deleted_by: ObjectId(userId) } }
    );

    // no need to wait for this
    sendNotification(
      req.user.data, // sender
      conversation?.members?.find(
        (member) => member.toString() !== userId.toString()
      ), // receiver
      conversation, //conversation
      req.io, //io
      "close-conversation-request", // verb
      `__@__${req.user.data.user_handle} closed the chat ` // message
    );

    return await res.status(200).json({
      message: "success",
    });
  } catch (error) {
    console.log("delete conversation error: ", error);
    next(error);
  }
};

module.exports = deleteConversation;
