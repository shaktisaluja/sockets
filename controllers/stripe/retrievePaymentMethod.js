const StripeCustomer = require("../../models/StripeCustomer.model");
const stripe = require("../../utils/stripe.js");

const retrievePaymentMethod = async (req, res, next) => {
  try {
    const { stripe_customer_id } = req.user.data;

    // step 1. retreive the the stripe customer detail from db.
    const stripeDetails = await StripeCustomer.findOne({ stripe_customer_id });
    const customerPaymentMethods = stripeDetails.payment_methods;
    // step 2. retrieve the all payment methods available on the stripe.
    const allPaymentMethods = await stripe.paymentMethods.list({
      customer: stripeDetails?.stripe_customer_id,
      type: "card",
    });

    // step 2. sanitize and filter out those payment details only from the allPaymentMethods array list which is existed in customerPaymentMethods array.
    const saniTizedPaymentMethods = allPaymentMethods?.data
      ?.filter((method) => customerPaymentMethods.includes(method?.id))
      ?.map((method) => {
        return {
          id: method?.id,
          billing_details: method?.billing_details,
          name: method?.name,
          email: method?.email,
          phone: method?.phone,
          card: method?.card,
          // default: method?.metadata?.default === "true" ? true : false,
          default: stripeDetails.default_payment_method === method?.id,
          type: method?.type,
        };
      });

    res.status(200).json({
      message: "success",
      details: [...saniTizedPaymentMethods],
    });
  } catch (error) {
    console.log("error occurred while validating payment method: ", error);
    next(error);
  }
};

module.exports = retrievePaymentMethod;
