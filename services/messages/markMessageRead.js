const Message = require("../../models/Message.model");
const Conversation = require("../../models/Conversation.model");

/**
 *  Get messages for a group with pagination
 * @param {String} userId - user that is reading a message
 * @param {Number} messageId - message id that is to be read
 * @param {String} conversationId - conversation id of which the message is being read
 * @param {String} referenceId - reference id of which the message is being read
 */
const markMessageRead = async (
  userId,
  messageId,
  conversationId,
  referenceId
) => {
  try {
    if (!messageId && !referenceId)
      throw new Error("Either messageId or referenceId is required");
    const query = [];
    if (messageId) query.push({ _id: messageId });
    if (referenceId) query.push({ reference_id: referenceId });
    const conversationExists = await Conversation.findOne({
      _id: conversationId,
    });
    const readMessage = await Message.findOneAndUpdate(
      {
        $and: [
          { $or: query },
          { "read_by.user": { $ne: userId } },
          { sender: { $ne: userId } },
        ],
      },
      {
        $addToSet: {
          read_by: { user: userId },
        },
      },
      { new: true }
    ).populate("sender");

    // TODO: Check this issue, readMessage comes out to null first
    if (readMessage) {
      const messageResponse = {
        message: readMessage?.message,
        type: readMessage?.type,
        created_at: readMessage?.created_at,
        read_by: readMessage?.read_by,
        _id: readMessage?._id,
        reference_id: readMessage?.reference_id,
        sender: {
          _id: readMessage?.sender._id,
          name: readMessage?.sender.name,
          user_handle: readMessage?.sender.user_handle,
          avatar_url: readMessage?.sender.avatar_url,
        },
      };
      return { message: messageResponse, conversation: conversationExists };
    }
  } catch (err) {
    console.log("err in mark message read service: ", err);
    return err;
  }
};

module.exports = markMessageRead;
