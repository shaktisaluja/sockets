const _ = require("lodash");

const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

// const { io } = require("../../../index");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} actor - user that is generating the action
 * @param {String} post - post id for which the notification is being sent
 * @param {Object} io - socket instance
 */
const newPostNotification = async (actor, post, io) => {
  try {
    const sender = await User.findOne({ _id: actor });

    const message = `__@__${sender.user_handle} added a new shout`;
    const receivers = _.uniq([...sender?.followers, ...sender?.subscribers]);
    const notificationList = _.map(receivers, (id) => {
      return {
        actor,
        verb: "post",
        message,
        subject: post,
        avatar: sender.avatar_url,
        receiver: id,
      };
    });
    await Notification.insertMany(notificationList);
    notificationList.map((notification) => {
      io.to(notification.receiver.toString()).emit("new-notification", {
        ...notification,
      });
    });
  } catch (err) {
    console.log("err in new post notification service: ", err);
    return err;
  }
};

module.exports = newPostNotification;
