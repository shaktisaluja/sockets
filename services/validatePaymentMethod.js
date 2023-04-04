const createError = require("http-errors");
const stripe = require("../utils/stripe");
const { paymentTypeValidation } = require("../services/validation_schema");

const validatePaymentMethod = async (body) => {
  try {
    const { payment_id, price, type } = body;
    await paymentTypeValidation.validateAsync({ type, price });
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_id);

    if (paymentMethod) {
      //create a payment intent
      const intent = await stripe.paymentIntents.create({
        //use the specified price
        amount: price * 100,
        currency: "usd",
        customer: paymentMethod.customer,
        setup_future_usage: "off_session",
      });
      if (!intent) throw createError.InternalServerError();
      else {
        //respond with the client secret and id of the new payment intent
        return {
          client_secret: intent.client_secret,
          intent_id: intent.id,
        };
      }
    } else {
      throw createError.Conflict("Payment method is not valid");
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = validatePaymentMethod;
