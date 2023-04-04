const Message = require("../../models/Message.model");
const Conversation = require("../../models/Conversation.model");

/**
 *  Get messages for a group with pagination
 * @param {String} userId - user that is unsending a message
 * @param {Number} messageId - message id that is to be unsent
 * @param {String} conversationId - conversation id of which the message is being deleted
 */
const unsendMessage = async ({ userId, messageId, conversationId }) => {
  try {
    const conversationExists = await Conversation.findOne({
      _id: conversationId,
    });
    if (!conversationExists)
      throw new Error("This conversation does not exists");
    const unsentMessage = await Message.findOneAndUpdate(
      {
        $and: [
          { $or: [{ _id: messageId }, { reference_id: messageId }] },
          { sender: userId },
        ],
      },
      { deleted_by: conversationExists.members },
      { new: true }
    );
    return { message: unsentMessage, conversation: conversationExists };
  } catch (err) {
    console.log("err in unsend message service: ", err);
    return err;
  }
};

module.exports = unsendMessage;
