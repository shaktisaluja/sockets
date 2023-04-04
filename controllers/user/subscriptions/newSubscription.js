const createError = require("http-errors");
const stripe = require("../../../utils/stripe");
const User = require("../../../models/User.model");
const Subscription = require("../../../models/Subscription.model");
const StripeCustomer = require("../../../models/StripeCustomer.model");
const StripeProduct = require("../../../models/StripeProduct.model");
const StripeTransaction = require("../../../models/StripeTransaction.model");
const Wallet = require("../../../models/Wallet.model");

const addSubscriber = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id } = req.params;

    const { paymentMethodId, payment_id } = req.body;
    const user = await User.findOne({ _id: id });
    if (!user)
      throw createError.BadRequest(
        "We were unable to find a user in order to subscribe. Please try again later!"
      );

    if (paymentMethodId === undefined) {
      throw createError.BadRequest(
        "Please add a payment method before proceeding further!"
      );
    }
    const subscriptionExists = await Subscription.findOne({
      subscription_from: userId,
      subscription_to: id,
      active: true,
    });
    if (subscriptionExists) {
      throw createError.Conflict("You already subscribed to this user");
    }
    const hadPaymentMethod = await StripeCustomer.findOne({
      user_id: userId,
    });
    if (hadPaymentMethod?.payment_methods.length === 0) {
      const attachPayment = await stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: hadPaymentMethod?.stripe_customer_id,
        }
      );

      // add payment method to customer payment method add to set
      await StripeCustomer.updateOne(
        {
          stripe_customer_id: attachPayment?.customer,
        },
        {
          $push: {
            payment_methods: [paymentMethodId],
          },
          default_payment_method: paymentMethodId,
        },
        { new: true }
      );
    }
    const availableProduct = await StripeProduct.findOne({ user_id: id });
    if (!availableProduct) {
      throw createError.Conflict(
        "We were unable to fetch product of respective user you want to subscribe"
      );
    }
    const subscription = await stripe.subscriptions.create({
      customer: hadPaymentMethod.stripe_customer_id,
      items: [{ price: availableProduct.price_id }],
      default_payment_method: paymentMethodId,
      metadata: {
        product_id: availableProduct.product_id,
        subscription_from: userId,
        subscription_to: id,
        type: "subscription",
      },
    });

    if (!subscription) {
      throw createError.InternalServerError();
    }
    const updateSubscription = await stripe.subscriptions.update(
      subscription.id,
      { default_payment_method: hadPaymentMethod?.default_payment_method }
    );
    if (!updateSubscription) {
      throw createError.InternalServerError();
    }

    //  update the wallet when new subscriber is added...
    const subsc = await StripeTransaction.findOne({
      intent_id: payment_id,
    });

    subsc.subscription_id = subscription?.id;
    await subsc.save();

    const wallet = await Wallet.findOne({ user: id });
    let money = wallet.money + user.subscription_price;
    wallet.money = money;
    await wallet.save();
    // push subscriber in user
    const loginUser = await User.findOneAndUpdate(
      { _id: id },
      { $push: { subscribers: userId } },
      { new: true }
    );
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { subscribing: id } },
      { new: true }
    );
    if (loginUser) {
      const subscriptionObj = await Subscription.create({
        subscription_from: userId,
        subscription_to: id,
        active: true,
      });
      if (subscriptionObj) {
        res.status(200).json({
          message: "success",
          data: subscription,
        });
      }
    }
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = addSubscriber;
