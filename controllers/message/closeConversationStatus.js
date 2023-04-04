const createError = require("http-errors");

const Conversation = require("../../models/Conversation.model");
const sendNotification = require("../../services/notifications/message/conversationNotification");

const updateConversationStatus = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user.data;
  try {
    const conversation = await Conversation.findOne({ _id: id });
    if (!conversation.members.includes(userId))
      throw createError.BadRequest("You are not a part of this conversation");

    const message = `__@__${req.user.data.userHandle} ${
      conversation?.status === "requested"
        ? " rejected the request to"
        : " closed the "
    }  chat `;

    conversation.status = "closed";
    conversation.owner = null;
    conversation.price = 0;
    await conversation.save();

    const otherUser = conversation.members.find(
      (member) => member?._id.toString() !== userId.toString()
    );
    // no need to wait for this
    sendNotification(
      req.user.data, // sender
      otherUser, // receiver
      conversation, //conversation
      req.io, //io
      "close-conversation-request", // verb
      message // message
    );

    return res.status(200).json({ message: "success" });
  } catch (error) {
    console.log("delete conversation error: ", error);
    next(error);
  }
};

module.exports = updateConversationStatus;
