const { ObjectId } = require("mongoose").Types;

const Message = require("../../models/Message.model");

/**
 *  Get messages for a group with pagination
 * @param {String} conversationId - chat room id
 * @param {String} userId - _id of the user fetching messages
 * @param {Number} startIndex - index from where to start search
 * @param {Number} viewSize - limit size of query
 */
const getMessages = async (conversationId, userId, startIndex, viewSize) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$conversation", ObjectId(conversationId)] },
              { $not: { $in: [ObjectId(userId), "$deleted_by"] } },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "post",
          localField: "postMessage",
          foreignField: "_id",
          as: "postData",
        },
      },
      {
        $unwind: {
          path: "$postData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "user",
          localField: "postData.user",
          foreignField: "_id",
          as: "postData.userDetail",
        },
      },
      {
        $unwind: {
          path: "$postData.userDetail",
          preserveNullAndEmptyArrays: true,
        },
      },
      // { $sort: { createdAt: -1 } },
      // apply pagination
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
      // do a join on another table called users, and
      // get me a user whose _id = sender
      {
        $lookup: {
          from: "user",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
        },
      },
      { $unwind: "$sender" },
      {
        $project: {
          _id: 1,
          type: 1,
          message: 1,
          // TODO: Change this field to show only for current user messages only
          read_by: 1,
          sender: {
            _id: 1,
            name: 1,
            user_handle: 1,
            avatar_url: 1,
          },
          postData: {
            media: 1,
            description: 1,
            created_at: 1,
            userDetail: {
              _id: 1,
              name: 1,
              user_handle: 1,
              email: 1,
              avatar_url: 1,
            },
          },
          created_at: 1,
        },
      },
    ]);

    // TODO: implement this total count in above aggregate itself
    const count = await Message.aggregate([
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$conversation", ObjectId(conversationId)] },
              { $not: { $in: [ObjectId(userId), "$deleted_by"] } },
            ],
          },
        },
      },
      { $count: "totalCount" },
      {
        $unwind: {
          path: "$totalCount",
        },
      },
    ]);

    return { messages, total_count: count[0]?.totalCount || 0 };
  } catch (err) {
    console.log("err: ", err);
    return err;
  }
};

module.exports = getMessages;
