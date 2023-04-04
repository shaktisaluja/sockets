const { ObjectId } = require("mongoose").Types;

const Notification = require("../../models/Notification.model");

const getUserNotifications = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { query } = req;
  try {
    const startIndex = (query._start && parseInt(query._start)) || 0;
    const viewSize = (query._limit && parseInt(query._limit)) || 10;
    const notifications = await Notification.aggregate([
      { $match: { receiver: ObjectId(userId) } },
      { $sort: { created_at: -1 } },
      // apply pagination
      { $skip: startIndex },
      { $limit: parseInt(viewSize) },
      {
        $lookup: {
          from: "user",
          localField: "actor",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
        },
      },
      {
        $set: { avatar: "$user.avatar_url" },
      },
      {
        $project: {
          actor: 1,
          verb: 1,
          subject: 1,
          avatar: 1,
          message: 1,
          receiver: 1,
          isRead: 1,
          created_at: 1,
        },
      },
    ]);
    const count = await Notification.countDocuments({ receiver: userId });
    res.status(200).json({
      message: "success",
      data: { notifications, total_count: count },
    });
  } catch (error) {
    console.log("get notifications list error: ", error);
    next(error);
  }
};

module.exports = getUserNotifications;
