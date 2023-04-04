const Conversation = require("../../models/Conversation.model");
const { ObjectId } = require("mongoose").Types;

/**
 *  Get count of unread conversations
 * @param {String} userId - user that is receiving the conversations
 */
const fetchUnreadConversationsCount = async (userId) => {
  try {
    if (!userId) throw new Error("Bad request. User id is required");

    const unreadCount = await Conversation.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $in: [ObjectId(userId), "$members"] },
              { $not: { $in: [ObjectId(userId), "$hidden_by"] } },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "message",
          localField: "last_message",
          foreignField: "_id",
          as: "last_message",
        },
      },
      { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },
      { $match: { last_message: { $exists: true } } },
      {
        $replaceWith: "$last_message",
      },
      {
        $match: {
          read_by: { $not: { $elemMatch: { user: ObjectId(userId) } } },
        },
      },
      {
        $count: "total_count",
      },
    ]);
    return unreadCount.length > 0 ? unreadCount[0].total_count : 0;
  } catch (err) {
    console.log("err in get unread conversations count  service: ", err);
    return err;
  }
};

module.exports = fetchUnreadConversationsCount;
