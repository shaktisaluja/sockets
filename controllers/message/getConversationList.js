// const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

const Conversation = require("../../models/Conversation.model");

const getConversationList = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  // const { query } = req;

  const countDocQuery = {
    $expr: {
      $and: [
        { $in: [ObjectId(userId), "$members"] },
        { $not: { $in: [ObjectId(userId), "$hidden_by"] } },
      ],
    },
  };

  try {
    const conversationList = await Conversation.aggregate([
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
          let: { conversation_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$conversation", "$$conversation_id"] },
                    { $not: { $in: [ObjectId(userId), "$deleted_by"] } },
                  ],
                },
              },
            },
            {
              $match: {
                read_by: { $not: { $elemMatch: { user: ObjectId(userId) } } },
              },
            },
            {
              $count: "total_count",
            },
          ],
          as: "unread_count",
        },
      },
      { $unwind: { path: "$unread_count", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user",
          localField: "members",
          foreignField: "_id",
          as: "members",
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
      {
        $project: {
          _id: 1,
          type: 1,
          created_at: 1,
          updated_at: 1,
          last_message: 1,
          unread_count: "$unread_count.total_count",
          // unread_count: 1,
          // recentMessages: 1,
          // owner: 1,
          members: {
            _id: 1,
            name: 1,
            avatar_url: 1,
          },
        },
      },
      { $sort: { updated_at: -1 } },
    ]);
    const count = await Conversation.countDocuments(countDocQuery);

    res.status(200).json({
      message: "success",
      data: { conversationList, total_count: count },
    });
  } catch (error) {
    console.log("get conversation list error: ", error);
    next(error);
  }
};

module.exports = getConversationList;
