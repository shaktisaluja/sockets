const Notification = require("../../models/Notification.model");

const markNotificationsRead = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  try {
    await Notification.updateMany({ receiver: userId }, { isRead: true });
    res.status(200).json({
      message: "success",
    });
  } catch (error) {
    console.log("get notifications list error: ", error);
    next(error);
  }
};

module.exports = markNotificationsRead;
