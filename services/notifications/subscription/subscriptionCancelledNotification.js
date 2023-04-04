const _ = require("lodash");

const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

/**
 *  Saves new comment notification and emits a socket event
 * @param {Array} subscribers - Subscriber
 * @param {String} actor - user that is generating the action
 * @param {String} subsToId - user to whom subscription exists
 * @param {String} price - Subscription Price
 * @param {Boolean} payment_failed - socket instance
 * @param {Object} io - socket instance
 */
const subscriptionCancelledNotification = async (
  subscribers,
  actor,
  io,
  payment_failed
) => {
  try {
    const subsTo = await User.findOne({ _id: actor });

    const message = payment_failed
      ? `subscription for  ${subsTo.name} has ended due to payment failure `
      : ` ${subsTo.name} has ended his subscription plan `;

    const notificationList = _.map(subscribers, (_id) => {
      return {
        actor,
        verb: "cancel-subscription",
        message,
        subject: subscribers.subscription,
        avatar: subsTo.avatar_url,
        receiver: _id,
      };
    });

    await Notification.insertMany(notificationList);

    notificationList.map((notification) => {
      io.to(notification.receiver.toString()).emit("new-notification", {
        ...notification,
      });
    });
  } catch (err) {
    console.log("err in new cancel Subscription notification service: ", err);
    return err;
  }
};

module.exports = subscriptionCancelledNotification;
