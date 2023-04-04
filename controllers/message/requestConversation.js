const createError = require("http-errors");

const Conversation = require("../../models/Conversation.model");
const User = require("../../models/User.model");
const sendNotification = require("../../services/notifications/message/conversationNotification");

const ConversationRequest = async (req, res, next) => {
  const { id } = req.params;
  const { _id: userId } = req.user.data;
  try {
    const conversation = await Conversation.findOne({ _id: id });
    if (!conversation.members.includes(userId))
      throw createError.BadRequest("You are not a part of this conversation");

    if (conversation.status === "open")
      throw createError.BadRequest("This conversation is already open");
    const conversationOwner = conversation.members.filter(
      (item) => item.toString() !== userId.toString()
    );
    const ownerDetails = await User.findOne({
      _id: conversationOwner[0].toString(),
    });

    conversation.status = "requested";
    conversation.owner = ownerDetails._id;
    conversation.price = ownerDetails.conversation_price;
    conversation.hidden_by = [];
    await conversation.save();
    // no need to wait for this
    sendNotification(
      req.user.data,
      ownerDetails?._id,
      conversation,
      req.io,
      "new-conversation-request", // verb
      `__@__${req.user.data.userHandle} requested to chat ` // message,
    );
    req.io.to(ownerDetails?._id.toString()).emit("new-request", conversation);
    req.io
      .to(ownerDetails?._id.toString())
      .emit("update-conversation", conversation);
    return res.status(200).json({
      message: "success",
      data: conversation,
    });
  } catch (error) {
    console.log("start conversation error: ", error);
    next(error);
  }
};

module.exports = ConversationRequest;
