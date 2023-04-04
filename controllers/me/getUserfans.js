const createError = require("http-errors");

const StripeCustomer = require("../../models/StripeCustomer.model");
const StripeProduct = require("../../models/StripeProduct.model");

// import user model
const User = require("../../models/User.model");
const Wallet = require("../../models/Wallet.model");
const Post = require("../../models/Post.model");
const fetchUnreadNotificationsCount = require("../../services/notifications/unreadNotificationsCount");
const fetchUnreadConversationsCount = require("../../services/messages/unreadConversationsCount");

const getUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const response = await User.findOne({ _id: userId })
      .populate("primary_email")
      .populate("primary_phone");
    if (!response)
      return createError.Unauthorized("User details can not be fetched");

    const wallet = await Wallet.findOne({ user: userId });
    const stripeDetails = await StripeCustomer.findOne({ user_id: userId });
    const subscriptionAmount = await StripeProduct.findOne({
      user_id: userId,
    });

    const unreadNotificationCount = await fetchUnreadNotificationsCount(userId);
    const unreadConversationsCount = await fetchUnreadConversationsCount(
      userId
    );
    const giftTypes = await Post.aggregate([
      { $match: { user: response?._id } },
      {
        $lookup: {
          from: "postgift",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$post_id"] },
                  ],
                },
              },
            },
          ],
          as: "postgifts",
        }
      },
      {
        $unwind: {
          path: "$postgifts",
        }
      }
    ]);
    const userDetails = {
      _id: response._id,
      name: response.name,
      phone: response.primary_phone?.contact_mech_value,
      email: response.primary_email?.contact_mech_value,
      user_handle: response.user_handle,
      website: response.website,
      bio: response.bio,
      gender: response.gender,
      verified: response.verified,
      avatar_url: response?.avatar_url,
      cover_url: response?.cover_url,
      content_average: response?.content_average,
      post_count: response?.posts?.length,
      follower_count: response?.followers?.length,
      subscriber_count: response?.subscribers?.length,
      is_private: response?.is_private,
      unreadNotifications: unreadNotificationCount,
      stripe_customer_id: response?.stripe_customer_id,
      unreadConversations: unreadConversationsCount,
      stripeDetails,
      coins: wallet?.coins,
      money: wallet?.money,
      subscription: {
        subscription_active: response?.subscription_active || false,
      },
      profileGifts: giftTypes.length,
      role: response?.role,
      conversation_price: response.conversation_price,
      is_creator: response.is_creator
    };
    if (response?.subscription_active) {
      userDetails.subscription.product_id = subscriptionAmount?.product_id;
      userDetails.subscription.price_id = subscriptionAmount?.price_id;
      userDetails.subscription.subscriptionAmount =
        response?.subscription_price / 100 || 0;
    }
    return res.status(200).json({
      message: "success",
      data: userDetails,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = getUser;
