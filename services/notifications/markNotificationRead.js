const Notification = require("../../models/Notification.model");

/**
 *  Get messages for a group with pagination
 * @param {String} notificationId - notification id that is to be read
 * @param {String} userId - user that is reading the notification
 */
const markNotificationRead = async (userId, notificationId) => {
  try {
    if (!notificationId && !userId)
      throw new Error(
        "Bad request. Both user and notification id are required"
      );

    const notificationRead = await Notification.findOneAndUpdate(
      {
        $and: [{ receiver: userId }, { isRead: false }],
      },
      {
        isRead: true,
      },
      { new: true }
    );
    return notificationRead;
  } catch (err) {
    console.log("err in mark message read service: ", err);
    return err;
  }
};

module.exports = markNotificationRead;
