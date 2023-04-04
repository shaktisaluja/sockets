const Notification = require("../../models/Notification.model");

/**
 *  Get count of unread notifications
 * @param {String} userId - user that is reading the notification
 */
const fetchUnreadNotificationsCount = async (userId) => {
  try {
    if (!userId) throw new Error("Bad request. Both user id is required");

    const unreadCount = await Notification.countDocuments({
      receiver: userId,
      isRead: false,
    });
    return unreadCount;
  } catch (err) {
    console.log("err in get unread notifications count  service: ", err);
    return err;
  }
};

module.exports = fetchUnreadNotificationsCount;
