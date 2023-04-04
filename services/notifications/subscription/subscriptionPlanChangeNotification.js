const _ = require("lodash");

const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

/**
 *  Saves new comment notification and emits a socket event
 * @param {Array} subscribers - Subscriber
 * @param {String} actor - user that is generating the action
 * @param {String} subsToId - user to whom subscription exists
 * @param {String} price - Subscription Price
 * @param {Object} io - socket instance
 */
const subscriptionPlanChangeNotification = async (
  subscribers,
  actor,
  price,
  io
) => {
  try {
    const subsTo = await User.findOne({ _id: actor });
    const message = `  ${subsTo.name} has changed his subscription price to ${price}`;

    const notificationList = _.map(subscribers, (from, subscription) => {
      return {
        actor,
        verb: "update-subscription-price",
        message,
        subject: subscription,
        avatar: subsTo.avatar_url,
        price: price,
        receiver: from,
      };
    });

    await Notification.insertMany(notificationList);

    notificationList.map((notification) => {
      io.to(notification.receiver.toString()).emit("new-notification", {
        ...notification,
      });
    });
  } catch (err) {
    console.log("err in new update Subscription notification service: ", err);
    return err;
  }
};

module.exports = subscriptionPlanChangeNotification;
