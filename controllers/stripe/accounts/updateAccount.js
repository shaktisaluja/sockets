const stripe = require("../../../utils/stripe");

const User = require("../../../models/User.model.js");
const Creator = require("../../../models/Creator.model.js");

const updateAccount = async (req, res, next) => {
  try {
    // check if accountId exists in StripeCustomer schema for userId
    const { _id: userId } = req.user.data;
    const { body } = req;

    const user = await User.findOne({ _id: userId });

    if (user?.creator_id) {
      return res.status(200).json({
        message: "Account already exists",
        accountId: user.creator_id,
      });
    }
    // fetch email from user schema
    const {
      primary_email: { contact_mech_value: email },
      name,
    } = await User.findOne({ _id: userId })
      .populate("primary_email")
      .populate("primary_phone");

      const account = await stripe.accounts.update(
        'acct_1GJ4hPDAk3gjYvvm',
        {metadata: {order_id: '6735'}}
      );

    res.json({ message: "success", accountId: account.id });
  } catch (error) {
    console.log("error in creating new stripe account: ", error);
    next(error);
  }
};

module.exports = updateAccount;
