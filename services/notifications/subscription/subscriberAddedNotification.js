const User = require("../../../models/User.model");
const Notification = require("../../../models/Notification.model");

/**
 *  Saves new comment notification and emits a socket event
 * @param {String} subscription - subscription id for which the notification is being sent
 * @param {String} actor - user that is generating the action
 * @param {String} subscriberId - Subscriber
 * @param {String} subsToId - user to whom subscription exists
 * @param {Object} io - socket instance
 */
const subscriberAddedNotification = async (
  subscriberId,
  actor,
  subscription,
  io
) => {
  try {
    const subscriber = await User.findOne({ _id: actor });
    const message = ` new subscriber ${subscriber.name} is added`;

    const notification = new Notification({
      actor,
      verb: "start-subscription",
      message,
      subject: subscription,
      subscriberId,
    });

    await notification.save();

    io.to(subscriber.toString()).emit("new-notification", {
      actor,
      verb: "start-subscription",
      message,
      subject: subscription,
      avatar: subscriber.avatar_url,
      subscriberId,
    });
  } catch (err) {
    console.log("err in new Add Subscription notification service: ", err);
    return err;
  }
};

module.exports = subscriberAddedNotification;
