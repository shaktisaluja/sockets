const { secretKey } = require("../../config/keys").stripe;
const stripe = require("stripe")(secretKey);
const StripeTransaction = require("../../models/StripeTransaction.model");
const Subscription = require("../../models/Subscription.model");

const cancelSubscriptionForSubscribers = async (subscriberArray) => {
  //update subscription for each subscriber
  subscriberArray.forEach(async function (subscriber) {
    //cancel  subscription
    stripe.subscriptions.update(subscriber.subscription_id, {
      cancel_at_period_end: true,
    });
    //update stripe transaction

    const subsc = await StripeTransaction.findOne({
      _id: subscriber._id,
      type: "subscription",
      endDate: null,
    });
    subsc.endDate = Date.now();
    subsc.save();

    //update subscription collection
    const subscription = await Subscription.findOne({
      subscription_from: subscriber.from,
      subscription_to: subscriber.to,
    });
    subscription.active = false;
    subscription.save();
  });
};
module.exports = cancelSubscriptionForSubscribers;
