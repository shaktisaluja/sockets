const StripeCustomer = require("../../models/StripeCustomer.model");
const stripe = require("../../utils/stripe");
const createError = require("http-errors");

const deletePaymentMethod = async (req, res, next) => {
  try {
    const { stripe_customer_id } = req.user.data;
    const { paymentMethodId } = req.body;

    const customer = await StripeCustomer.findOne({
      stripe_customer_id: stripe_customer_id,
    });

    // if customer not found throw error
    if (!customer || !customer?.payment_methods.includes(paymentMethodId)) {
      throw createError.BadRequest("no payment method found for user.");
    }

    // delete payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    // pull payment method from stripe customer
    const newEntityofStripeCustomer = await StripeCustomer.findOneAndUpdate(
      { stripe_customer_id: stripe_customer_id },
      { $pull: { payment_methods: paymentMethodId } },
      { new: true }
    );

    // remove default payment method if default is removed
    if (customer.default_payment_method === paymentMethodId) {
      customer.default_payment_method = null;
      customer.save();
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer?.stripe_customer_id,
      type: "card",
    });
    //  sanitize and filter out those payment details only from the paymentMethods array list which is existed in savedCustomer payment_methods array.
    const saniTizedPaymentMethods = paymentMethods?.data
      ?.filter((method) =>
        newEntityofStripeCustomer?.payment_methods?.includes(method?.id)
      )
      ?.map((method) => {
        return {
          id: method?.id,
          billing_details: method?.billing_details,
          name: method?.name,
          email: method?.email,
          phone: method?.phone,
          card: method?.card,
          default: customer.default_payment_method === method?.id,
          type: method?.type,
        };
      });

    res.status(200).json({
      message: "success",
      details: [...saniTizedPaymentMethods],
    });

    // return res.status(200).json({
    //   message: "success",
    //   customer: stripe_customer_id,
    // });
  } catch (error) {
    console.log("error while deleting payment method: ", error);
    next(error);
  }
};

module.exports = deletePaymentMethod;
