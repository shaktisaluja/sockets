const _ = require("lodash");

const Message = require("../../models/Message.model");
const Conversation = require("../../models/Conversation.model");

/**
 *  Get messages for a group with pagination
 * @param {String} userId - user that is reading the messages
 * @param {String} conversationId - conversation id of which the message is being read
 */
const markConversationRead = async ({ userId, conversationId }) => {
  try {
    const conversationExists = await Conversation.findOne({
      _id: conversationId,
    });
    if (!conversationExists) throw new Error("Conversation Id is bad");

    const messagesToUpdate = await Message.find({
      conversation: conversationId,
      "read_by.user": { $ne: userId },
    });

    const messagesToUpdateIds = _.map(messagesToUpdate, "_id");

    const updatedMessages = await Message.updateMany(
      { _id: { $in: messagesToUpdateIds } },
      {
        $addToSet: {
          read_by: { user: userId },
        },
      },
      {
        multi: true,
      }
    );
    if (!updatedMessages)
      throw new Error("Update read status of conversation failed");
    return { messages: messagesToUpdateIds, conversation: conversationExists };
  } catch (err) {
    console.log("err in mark conversation read service: ", err);
    return err;
  }
};

module.exports = markConversationRead;
