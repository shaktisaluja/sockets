const StripeTransaction = require("../../models/StripeTransaction.model");
const Subscription = require("../../models/Subscription.model");
const Wallet = require("../../models/Wallet.model");
const subscriptionCancelledNotification = require("../../services/notifications/subscription/subscriptionCancelledNotification");

// This example uses Express to receive webhooks

// Use body-parser to retrieve the raw body as a buffer
const bodyParser = require("body-parser");

// Match the raw body to content type application/json
//app.post('/webhook', bodyParser.raw({type: 'application/json'}), (request, response) => {
const stripeWebHooks = async (req, res, next) => {
  const event = req.body;
  // console.log({event});
  // Handle the event
  switch (event.type) {
    case "invoice.payment_failed":
      //   const paymentIntent = event.data.object;
      console.log(
        "============================== automatic Payment for subscription failed =============================="
      );
      if (event.data.object.metadata?.type === "subscription") {
        // stripe automatically cancel subscription for the user when payment fails..
        //update in our database...
        const subsc = await StripeTransaction.find({
          _id: event.data.object.metadata.subscription_from,
          type: "subscription",
          endDate: null,
        });
        subsc[0].endDate = Date.now();
        subsc[0].save();

        //update subscription collection
        const subscription = await Subscription.findOne({
          subscription_from: event.data.object.metadata.subscription_from,
          subscription_to: event.data.object.metadata.subscription_to,
        });
        subscription.active = false;
        subscription.save();

        //send notification to subscriber and user..
        subscriptionCancelledNotification(
          subsc,
          event.data.object.metadata.subscription_to,
          req.io,
          true
        );
      }
      // console.log(event.data);

      break;
    case "payment_intent.succeeded":
      // console.log(event.data.object);
      console.log(event.data);
      if (event.data.object.metadata?.type === "subscription") {
        // subscription payment successful
        // update wallet balance for the user ...

        // const transaction = await StripeTransaction.create({
        //   from: event.data.object.metadata.subscription_from || null,
        //   to: event.data.object.metadata.subscription_from|| null,
        //   amount: price * 100 || null,
        //   intent_id: payment_id || null,
        //   post_id: req.body.postId || null,
        //   type: "subscription",
        //   purchaseCommission: purchaseCommission,
        // });
        const wallet = Wallet.findOne({
          user: event.data.object.metadata.subscription_from,
        });
        let money = wallet.money + event.data.object.amount;
        wallet.money = money;
        wallet.save();
      }

      break;

    // ... handle other event types
    default:
      console.log(`webHooks captured for: ${event.type}`);
  }
  next();
};
module.exports = stripeWebHooks;
