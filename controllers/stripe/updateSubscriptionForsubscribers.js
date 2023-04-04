const { secretKey } = require("../../config/keys").stripe;
const stripe = require("stripe")(secretKey);
const StripeTransaction = require("../../models/StripeTransaction.model");

const updateSubscriptionForSubscribers = async (
  subscriberArray,
  priceId,
  price
) => {
  //update subscription for each subscriber
  subscriberArray.forEach(async function (subscriber) {
    //update subscription
    const subscription = await stripe.subscriptions.retrieve(
      subscriber.subscription_id
    );
    stripe.subscriptions.update(subscriber.subscription_id, {
      cancel_at_period_end: false,
      proration_behavior: "create_prorations",
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
    });

    //update stripe transaction end date
    const subsc = await StripeTransaction.findOne({
      _id: subscriber._id,
      type: "subscription",
      endDate: null,
    });
    subsc.endDate = Date.now();
    subsc.save();

    // create new stripe transarion with new price.
    const resp = await StripeTransaction.create({
      from: subscriber.from,
      to: subscriber.to,
      amount: price * 100,
      subscription_id: subscriber.subscription_id,
      type: "subscription",
    });
  });
};
module.exports = updateSubscriptionForSubscribers;
