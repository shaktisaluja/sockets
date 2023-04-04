const router = require("express").Router();

// bring in models and controllers
const generatePayment = require("../../controllers/stripe/generatePayment");
const confirmPayment = require("../../controllers/stripe/confirmPayment");
const addCustomer = require("../../controllers/stripe/addCustomer");
const addSubscription = require("../../controllers/stripe/addSubscription");
const validatePaymentMethod = require("../../controllers/stripe/validatePaymentMethod");
const retrievePaymentMethod = require("../../controllers/stripe/retrievePaymentMethod");

// account controllers

// this will register the user as a creator in fanstime, and as a express user in stripe
const createAccount = require("../../controllers/stripe/accounts/createAccount");
const retrieveAccount = require("../../controllers/stripe/accounts/retrieveAccount");
const uploadVerificationDocument = require("../../controllers/stripe/accounts/uploadVerificationDocument");

const createTransfer = require("../../controllers/stripe/accounts/createTransfer");
const updateSubscription = require("../../controllers/stripe/updateSubscription");
const addPaymentMethod = require("../../controllers/stripe/addPaymentMethod");
const deletePaymentMethod = require("../../controllers/stripe/deletePaymentMethod");
const makeDefaultPaymentMethod = require("../../controllers/stripe/makeDefaultPaymentMethod");

//generate payment request for a card payer
router.post("/generate", generatePayment);

//confirm payment request for a card payer
router.post("/confirm", confirmPayment);

//register customer in stripe
router.post("/customer", addCustomer);

//get stripe connected account details
router.get("/account", retrieveAccount);

// create account in stripe
router.post("/accounts", createAccount);

// upload user verification document in stripe
router.post("/accounts/document", uploadVerificationDocument);

// generate transfer from stripe
router.post("/transfer", createTransfer);

// register product and its related price in stripe
router.post("/subscription", addSubscription);

// update product and its related price in stripe
router.put("/subscription/update", updateSubscription);

// validate payment method before sending tip
router.post("/validate/paymentmethod", validatePaymentMethod);

// retrieve payment method details from stripe
router.get("/paymentmethod", retrievePaymentMethod);

// add payment method
router.post("/paymentmethod", addPaymentMethod);

// delete payment method
router.delete("/paymentmethod", deletePaymentMethod);

// make default payment method
router.put("/paymentmethod/default", makeDefaultPaymentMethod);
// validate payment method before sending tip
// router.post("/webhook", stripeWebHooks);

module.exports = router;
