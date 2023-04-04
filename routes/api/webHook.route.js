const router = require("express").Router();

const stripeWebHooks = require("../../controllers/stripe/stripeWebHooks");
const accountWebhookHandler = require("../../controllers/stripe/webhooks.js/connectAccount");

// validate payment method before sending tip
router.post("/payment", stripeWebHooks);
router.post("/account", accountWebhookHandler);

module.exports = router;
