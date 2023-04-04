const { ObjectId } = require("mongoose").Types;
const NotificationSetting = require("../../models/NotificationSetting.model");

const Notification = require("../../models/Notification.model");

const getNotificationSeting = async (req, res, next) => {
  const { _id: userId } = req.user.data;

  try {
    const UserNotificationSetting = await NotificationSetting.findOne({userId:userId})

    if(!UserNotificationSetting) throw createError.BadRequest("Notification prefernce for this user does not exist")

    res.status(200).json({
      message: "success",
      data: UserNotificationSetting,
    });
  } catch (error) {
    console.log("get notifications list error: ", error);
    next(error);
  }
};

module.exports = getNotificationSeting;