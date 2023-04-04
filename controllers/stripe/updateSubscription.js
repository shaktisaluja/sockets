const createError = require("http-errors");
const { secretKey } = require("../../config/keys").stripe;
const stripe = require("stripe")(secretKey);
const StripeProduct = require("../../models/StripeProduct.model");
const User = require("../../models/User.model");
const StripeTransaction = require("../../models/StripeTransaction.model");
const updateSubscriptionForSubscribers = require("./updateSubscriptionForsubscribers");
const cancelSubscriptionForSubscribers = require("./cancelSubscriptionForSubscribers");
const subscriptionPlanChangeNotification = require("../../services/notifications/subscription/subscriptionPlanChangeNotification");
const subscriptionCancelledNotification = require("../../services/notifications/subscription/subscriptionCancelledNotification");

const updateSubscription = async (req, res, next) => {
  try {
    const { _id: id } = req.user.data;
    const { subscription_active, price } = req.body;
    if (subscription_active === undefined && price === undefined)
      throw createError.BadRequest("empty body found");
    const user = await User.findOne({ _id: id });
    const existingPrice = user.subscription_price;

    const subscriptionExists = await StripeTransaction.find({
      to: id,
      type: "subscription",
      endDate: null,
    });

    const stripeProduct = await StripeProduct.findOne({
      user_id: id,
    });
    // if product already found
    if (subscriptionExists) {
      //if price is not same, create new price object and update subscription...
      if (price * 100 !== existingPrice && subscription_active !== false) {
        //create new price object ...

        const newPriceObj = await stripe.prices.create({
          unit_amount: price * 100,
          currency: "usd",
          recurring: { interval: "month" },
          product: stripeProduct.product_id,
        });
        let priceId = newPriceObj.id.toString();

        //update user model for new subscription price

        user.subscription_price = price * 100;
        user.save();

        //update subscription for all subscribers.....
        await updateSubscriptionForSubscribers(
          subscriptionExists,
          priceId,
          price
        );
        // send subscription plan changed notification...
        await subscriptionPlanChangeNotification(
          subscriptionExists,
          id,
          price / 100,
          req.io
        );
        res.json({
          message: "success",
          price: price,
          subscription_active: true,
        });

        // deactivate subscription...
      } else if (subscription_active === false) {
        // delete subscription at period end.
        // await stripe.products.del(stripeProduct.product_id);

        await StripeProduct.deleteOne({
          user_id: id,
        });

        await cancelSubscriptionForSubscribers(subscriptionExists);
        //send subscription cancel notification.
        subscriptionCancelledNotification(
          subscriptionExists,
          id,
          req.io,
          false
        );
        //update user model and stripe transaction.
        user.subscription_active = false;
        user.save();

        return res.json({ message: "success", subscription_active: false });

        // if no change in price and active flag
      } else {
        throw createError.BadRequest(
          "subsription already active with same price"
        );
      }
      //if product not found
    } else {
      res.json({
        message:
          "no active Subscription Plan. please add your subscription plan",
      });
    }
  } catch (error) {
    console.log("error in updating stripe product: ", error);
    next(error);
  }
};
module.exports = updateSubscription;
