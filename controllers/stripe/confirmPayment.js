const createError = require("http-errors");
const stripe = require("../../utils/stripe");

const StripeCustomer = require("../../models/StripeCustomer.model");
const StripeTransaction = require("../../models/StripeTransaction.model");
const { paymentTypeValidation } = require("../../services/validation_schema");
const { purchaseCommission } = require("../../config/keys").coins;

const confirmPayment = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { payment_id, type, price, payment_method } = req.body;
    await paymentTypeValidation.validateAsync({ type, price });

    if (!req.body.to && type === "subscription")
      throw createError.BadRequest("required parameter to is missing.");
    // get default payment method of user
    const stripeDetails = await StripeCustomer.findOne({
      user_id: userId,
    });

    if (!payment_method && !stripeDetails?.default_payment_method)
      throw createError.BadRequest("No payment method found.");

    // stripe confirm payment
    const paymentConfirmation = await stripe?.paymentIntents.confirm(
      payment_id,
      {
        payment_method: payment_method || stripeDetails?.default_payment_method,
      }
    );
    if (!paymentConfirmation?.paymentIntent?.status === "succeeded") {
      throw createError.BadRequest("Payment failed.");
    }

    const transaction = await StripeTransaction.create({
      from: userId,
      to: req.body.to || null,
      amount: price * 100 || null,
      intent_id: payment_id || null,
      post_id: req.body.postId || null,
      type: type,
      purchaseCommission: purchaseCommission,
    });
    if (transaction) {
      res.json({
        success: true,
        intentId: payment_id,
        message: "success",
        transactionId: transaction._id,
      });
    }
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = confirmPayment;
