const StripeCustomer = require("../../models/StripeCustomer.model");
const StripeProduct = require("../../models/StripeProduct.model");
const stripe = require("../../utils/stripe.js");

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
const getProductChangeAudit = async (req, res, next) => {
    const responseBuilder = {
        messages: [],
    }
    try {
        // const { stripe_customer_id } = req.user.data;

        // get _id from req.user.data
        const { _id: userId, } = req.user.data;

        // get document for userId from stripeProduct model
        const existingStripeProduct = await StripeProduct.findOne({ user_id: userId });

        // extract product_id from existingStripeProduct
        const productId = existingStripeProduct?.product_id;

        // check if productId is not empty
        if (!productId) {
            responseBuilder.messages.push({
                type: "error",
                message: "Product id is empty",
            });
            return res.status(200).json(responseBuilder);
        }

        // check how many users are subscribed to the said product from stripe sdk
        const product = await stripe.products.retrieve(productId);

        console.log(product);

        // check if existingStripeProduct is marked as dormant
        if (existingStripeProduct?.dormant) {
            responseBuilder.messages.push(`The product is already dormant.`);
        }

        res.status(200).json({
            message: "success",
            data: responseBuilder,
        });


    } catch (error) {
        console.log("error occurred while validating payment method: ", error);
        next(error);
    }
};

module.exports = getProductChangeAudit;
