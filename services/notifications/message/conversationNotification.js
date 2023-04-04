const Notification = require("../../../models/Notification.model");

// const { io } = require("../../../index");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} actor - user that is generating the action
 * @param {String} receiver - user that is receiving the notification
 * @param {String} conversation - conversation for which the notification is being sent
 * @param {String} comment - comment text for which the notification is being sent
 * * @param {Object} io - socket object
 */
const conversationNotification = async (
  sender,
  receiver,
  conversation,
  io,
  verb,
  message
) => {
  try {
    const notification = new Notification({
      actor: sender?._id,
      verb,
      message,
      subject: conversation?._id,
      avatar: sender.avatar_url,
      receiver,
    });
    await notification.save();

    io.to(receiver.toString()).emit("new-notification", {
      actor: sender?._id,
      verb,
      message,
      subject: conversation?._id,
      avatar: sender.avatar_url,
      receiver,
    });
    io.to(receiver.toString()).emit("update-conversation", conversation);
  } catch (err) {
    console.log("err in new comment notification service: ", err);
    return err;
  }
};

module.exports = conversationNotification;
