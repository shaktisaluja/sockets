const stripe = require("../../utils/stripe");
const StripeCustomer = require("../../models/StripeCustomer.model");

const addPaymentMethod = async (req, res, next) => {
  try {
    const { stripe_customer_id } = req.user.data;
    const { paymentMethodId } = req.body;
    // Step 1 retreive the stripe customer from the collection.
    const customer = await StripeCustomer.findOne({
      stripe_customer_id: stripe_customer_id,
    });
    // link payment method to customer on stripe and make default if no any default added.
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripe_customer_id,
    });

    if (!customer?.default_payment_method) {
      customer.default_payment_method = paymentMethodId;
      await customer.save();
    }

    // add payment method to customer payment method add to set
    const savedCustomer = await StripeCustomer.findOneAndUpdate(
      {
        stripe_customer_id: stripe_customer_id,
      },
      {
        $push: {
          payment_methods: [paymentMethodId],
        },
      },
      { new: true }
    );
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer?.stripe_customer_id,
      type: "card",
    });
    //  sanitize and filter out those payment details only from the paymentMethods array list which is existed in savedCustomer payment_methods array.
    const saniTizedPaymentMethods = paymentMethods?.data
      ?.filter((method) => savedCustomer?.payment_methods?.includes(method?.id))
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
  } catch (error) {
    console.log("error while adding payment method: ", error);
    next(error);
  }
};

module.exports = addPaymentMethod;
