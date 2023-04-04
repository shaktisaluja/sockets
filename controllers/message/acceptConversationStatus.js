const createError = require("http-errors");

const Conversation = require("../../models/Conversation.model");
const sendNotification = require("../../services/notifications/message/conversationNotification");

const acceptConversationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user.data;
  try {
    const conversation = await Conversation.findOne({ _id: id });
    if (!conversation.members.includes(userId))
      throw createError.BadRequest("You are not a part of this conversation");

    if (conversation.owner.toString() !== userId.toString())
      throw createError.Forbidden(
        "You don't have the permission to perform this action"
      );
    conversation.status = "open";

    const userRequestingConversation = conversation.members.find(
      (member) => member._id.toString() !== userId.toString()
    );

    await conversation.save();

    // no need to wait for this
    sendNotification(
      req.user.data, // sender
      userRequestingConversation, // receiver
      conversation, //conversationId
      req.io, //io
      "accept-conversation-request", // verb
      `__@__${req.user.data.userHandle} accepted the request to chat ` // message
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("delete conversation error: ", error);
    next(error);
  }
};

module.exports = acceptConversationStatus;
