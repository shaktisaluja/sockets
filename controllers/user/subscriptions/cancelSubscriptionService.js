const createError = require("http-errors");
const stripe = require("../../../utils/stripe");
const User = require("../../../models/User.model");
const StripeTransaction = require("../../../models/StripeTransaction.model");
const Subscription = require("../../../models/Subscription.model");

const removeSubscriber = async (userId, subscribingId) => {
  try {
    const id = subscribingId;

    const user = await User.findOne({ _id: id });
    if (!user)
      throw createError.BadRequest(
        "We were unable to find a user in order to unsubscribe. Please try again later!"
      );
    const transactionExists = await StripeTransaction.findOne({
      from: userId,
      to: id,
      type: "subscription",
      endDate: null,
    });

    const subscriptionExists = await Subscription.findOne({
      subscription_from: userId,
      subscription_to: id,
      active: true,
    });
    if (subscriptionExists && transactionExists) {
      const deleted = await stripe.subscriptions.update(
        transactionExists?.subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      if (deleted && deleted.status !== "canceled") {
        const record = await Subscription.findOneAndUpdate(
          {
            subscription_from: userId,
            subscription_to: id,
            active: true,
          },
          { active: false },
          { new: true }
        );
        if (record) {
          const user = await User.findOneAndUpdate(
            { _id: id },
            { $pull: { subscribers: userId } },
            { new: true }
          );
          await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { subscribing: id } },
            { new: true }
          );
        }
      }
      // update subscription..
      subscriptionExists.active = false;
      await subscriptionExists.save();

      // update stripe transaction
      transactionExists.endDate = Date.now();
      await transactionExists.save();
      return "success";
    } else {
      throw createError.Conflict("No subscription found for this user");
    }
  } catch (error) {
    console.log("error: ", error);
  }
};

module.exports = removeSubscriber;
