const _ = require("lodash");

const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

// const { io } = require("../../../index");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} actor - user that is generating the action
 * @param {Array} mentioned - array of object ids of users which are mentioned
 * @param {String} post - post id for which the notification is being sent
 * @param {Object} io - socket instance
 */
const postMentionNotification = async (actor, mentioned, post, io) => {
  try {
    const sender = await User.findOne({ _id: actor });

    const message = `__@__${sender.name} mentioned you in a post`;
    const notificationList = _.map(mentioned, (id) => {
      return {
        actor,
        verb: "post-mention",
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
    console.log("err in new mention post notification service: ", err);
    return err;
  }
};

module.exports = postMentionNotification;
