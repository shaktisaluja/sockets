const stripe = require("../utils/stripe");
const StripeTransaction = require("../models/StripeTransaction.model");
const { paymentTypeValidation } = require("../services/validation_schema");
const { purchaseCommission } = require("../config/keys").coins;

const confirmPayment = async (body) => {
  try {
    // const { _id: userId } = req.user.data;
    const { payment_id, type, price, userId } = body;
    await paymentTypeValidation.validateAsync({ type, price });

    //get the transaction based on the provided id
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_id);
    if (paymentIntent.status === "succeeded") {
      const transaction = await StripeTransaction.create({
        from: userId || null,
        to: body.to || null,
        amount: price * 100 || null,
        intent_id: payment_id || null,
        post_id: body.postId || null,
        type: type,
        purchaseCommission: purchaseCommission,
      });
      if (transaction) {
        return {
          success: true,
          paymentIntent,
        };
      }
    } else {
      return { success: false };
    }
  } catch (error) {
    console.log("error: ", error);
  }
};

module.exports = confirmPayment;
