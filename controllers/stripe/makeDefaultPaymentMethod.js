const createError = require("http-errors");
const stripe = require("../../utils/stripe");
const StripeCustomer = require("../../models/StripeCustomer.model");

const makeDefaultPaymentMethod = async (req, res, next) => {
  try {
    const { stripe_customer_id } = req.user.data;
    const { paymentMethodId } = req.body;

    // fetch stripe customer details
    const stripeCustomer = await StripeCustomer.findOne({
      stripe_customer_id: stripe_customer_id,
    });

    if (!stripeCustomer)
      throw createError.NotFound(
        "Stripe customer not found. Please contact administrator."
      );

    // check if payment method exists in customer payment methods
    if (!stripeCustomer.payment_methods.includes(paymentMethodId))
      throw createError.BadRequest("Payment method not found.");

    // if user has already default subscription method remove current from stripe and stripecustomer
    if (stripeCustomer.default_payment_method !== paymentMethodId) {
      //update new default in database

      stripeCustomer.default_payment_method = paymentMethodId;
      stripeCustomer.save();
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomer?.stripe_customer_id,
      type: "card",
    });
    // step 2. sanitize and filter out those payment details only from the paymentMethods array list which is existed in stripeCustomer payment_methods array.
    const saniTizedPaymentMethods = paymentMethods?.data
      ?.filter((method) =>
        stripeCustomer?.payment_methods?.includes(method?.id)
      )
      ?.map((method) => {
        return {
          id: method?.id,
          billing_details: method?.billing_details,
          name: method?.name,
          email: method?.email,
          phone: method?.phone,
          card: method?.card,
          default: stripeCustomer.default_payment_method === method?.id,
          type: method?.type,
        };
      });
    return res.status(200).json({
      message: "success",
      details: saniTizedPaymentMethods,
    });
  } catch (error) {
    console.log("error while assigning default payment method ", error);
    next(error);
  }
};

module.exports = makeDefaultPaymentMethod;
