const stripe = require("../../utils/stripe");

const StripeCustomer = require("../../models/StripeCustomer.model");

const addCustomer = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { name, email, phone, paymentMethodId, address } = req.body;
    //user sends customer details along with payment method Id
    const customer = await stripe.customers.create({
      name: name || null,
      email: email || null,
      phone: phone || null,
      payment_method: paymentMethodId || null,
      invoice_settings: {
        default_payment_method: paymentMethodId || null,
      },
      metadata: {
        id: userId,
      },
      address: address || null,
    });

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    const customer_record = await StripeCustomer.create({
      user_id: userId,
      stripe_customer_id: customer.id,
      payment_method: paymentMethodId,
    });

    return res
      .status(200)
      .json({ message: "success", customer: customer_record });
  } catch (error) {
    console.log("error in create stripe customer: ", error);
    next(error);
  }
};

module.exports = addCustomer;
