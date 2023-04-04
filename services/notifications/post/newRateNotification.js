const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} actor - user that is generating the action
 * @param {String} receiver - user that is receiving the notification
 * @param {String} post - post id for which the notification is being sent
 * @param {String} rate - rating for which the notification is being sent
 * @param {Object} io - socket object
 */
const newRateNotification = async (actor, receiver, post, rate, io) => {
  try {
    const sender = await User.findOne(
      { _id: actor },
      { name: 1, _id: 1, user_handle: 1, avatar_url: 1 }
    );

    const message = `__@__${sender.user_handle} gave your post a rating`;
    const notification = new Notification({
      actor,
      verb: "rate",
      message,
      subject: post,
      avatar: sender.avatar_url,
      receiver,
    });
    await notification.save();
    io.to(receiver.toString()).emit("new-notification", {
      actor,
      verb: "rate",
      message,
      subject: post,
      avatar: sender.avatar_url,
      receiver,
    });
  } catch (err) {
    console.log("err in new rate notification service: ", err);
    return err;
  }
};

module.exports = newRateNotification;
