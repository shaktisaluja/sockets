const StripeCustomer = require("../../models/StripeCustomer.model");
const StripeProduct = require("../../models/StripeProduct.model");
const stripe = require("../../utils/stripe.js");
const createError = require("http-errors");

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * 
 * This function is to evaluate the following user stories
 * 
 * 1. Evaluate if the said subscription belongs to the creator of the product
 * 2. Evaluate if the subscription is active
 * 3. Evaluate if the subscription is not expired
 * 4. Retrive how many users are subscribed to the said product
 * 5. Cancel the subscription for all users who are subscribed to the said product
 * 6. Dormant the said product
 * 7. Create a new product with the new price
 * 8. Display the message to the user that the product has been dormant.
 * 9. Display the message to the user will now agree to the new terms and conditions, and will be charged for the new product.
 * 10. Change of the subscription can only be done once a month.
 * 
 * Output:
 * 1. If the user is not the creator of the product, then return an error
 * 2. If the subscription is not active, then return an error
 * 3. If the subscription is expired, then return an error
 * 4. If the subscription is active, then return the number of users subscribed to the said product
 * 5. If the subscription is active, then return the last date of the subscription for the said product
 * 6. If the change of the subscription was already done in the last month, then return an error
 * 7. If the change of the subscription was done, then return how many users have aggreed to subscribe to the new product
 * 
 */
const updateCreatorProduct = async (req, res, next) => {

    try {
        // const { stripe_customer_id } = req.user.data;

        // get _id from req.user.data
        const { _id: userId, } = req.user.data;

        // check if productId is not empty
        if (!req.params.productId) {
            throw createError(400, "Product id is empty");
        }

        
        
        // get document for userId from stripeProduct model
        const existingStripeProduct = await StripeProduct.findOne({ user_id: userId, productId: req.params.productId });
        
        // Evaluate if the said subscription belongs to the creator of the product
        if (existingStripeProduct?.user_id !== userId) {
            throw createError(400, "You are not the creator of this product");
        }

        const subscriptionProductId = req.params.productId;

        // Evaluate if the subscriptionProductId is active
        const subscription = await stripe.subscriptions.retrieve(subscriptionProductId);
        if (subscription.status !== "active") {
            throw createError(400, "This subscription is not active");
        }

        // Retrive how many users are subscribed to the said product
        const product = await stripe.products.retrieve(subscriptionProductId);
        const numberOfUsers = product.metadata.number_of_users;

        // Retrive all the customers subscribed to the said product with no limit
        const customers = await stripe.customers.list({
            limit: 100,
            product: subscriptionProductId,
        });

        // cancel the subscription for all users who are subscribed to the said product
        for (let i = 0; i < customers.data.length; i++) {
            const customer = customers.data[i];
            await stripe.subscriptions.update(customer.subscriptions.data[0].id, {
                cancel_at_period_end: true,
            });
        }

        // Dormant the said product
        await stripe.products.update(subscriptionProductId, {
            active: false,
        });

        // Create a new subscription with the new price
        const newProduct = await stripe.products.create({
            name: product.name,
            type: "service",
            metadata: {
                number_of_users: numberOfUsers,
            },
            unit_amount: req.body.unit_amount,
            statement_descriptor: product.statement_descriptor,
        });

        // Send bulk email to all customers, stating that the product has been dormant
        const stripeCustomer = await StripeCustomer.find({ user_id: userId });
        for (let i = 0; i < stripeCustomer.length; i++) {console.log("")}

        
        

    } catch (error) {
        console.log("error occurred while validating payment method: ", error);
        next(error);
    }
};

module.exports = updateCreatorProduct;
