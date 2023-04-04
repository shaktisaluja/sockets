const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

// const { io } = require("../../../index");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} actor - user that is generating the action
 * @param {String} receiver - user that is receiving the notification
 * @param {String} post - post id for which the notification is being sent
 * @param {String} comment - comment text for which the notification is being sent
 * @param {Object} io - socket object
 */
const newReshareNotification = async (actor, receiver, post, io) => {
  try {
    const sender = await User.findOne(
      { _id: actor },
      { name: 1, _id: 1, user_handle: 1, avatar_url: 1 }
    );

    const message = `__@__${sender.user_handle} reshare your post`;
     // comment.length < 15 ? comment : `${comment.slice(0, 13)}...`

    const notification = new Notification({
      actor,
      verb: "Reshare",
      message,
      subject: post,
      avatar: sender.avatar_url,
      receiver,
    });
    await notification.save();
    io.to(receiver.toString()).emit("new-notification", {
      actor,
      verb: "Reshare",
      message,
      subject: post,
      avatar: sender.avatar_url,
      receiver,
    });
  } catch (err) {
    console.log("err in new Reshare notification service: ", err);
    return err;
  }
};

module.exports = newReshareNotification;