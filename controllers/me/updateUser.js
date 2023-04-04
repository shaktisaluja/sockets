const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;

// import user model
const User = require("../../models/User.model");
// const ContactMech = require("../../models/ContactMech.model");
const UserLoginMech = require("../../models/UserLoginMech.model");
const Conversation = require("../../models/Conversation.model");

const { updateUserValidation } = require("../../services/validation_schema");
const sendNotification = require("../../services/notifications/message/conversationNotification");

const updateUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const result = await updateUserValidation.validateAsync(req.body);
    const user = await User.findOne({ _id: userId })
      .populate("primary_phone")
      .populate("primary_email");
    if (result.userHandle && user.user_handle !== result.userHandle) {
      const updatedUserHandle = await UserLoginMech.findOneAndUpdate(
        { user: userId },
        { login_mech_value: result.userHandle },
        { new: true }
      );
      if (!updatedUserHandle)
        throw createError.InternalServerError(
          "User details can not be updated. Please try again."
        );
      user.user_handle = result.userHandle;
    }
    user.name = result?.name;
    user.bio = result?.bio;
    user.website = result?.website;
    user.gender = result?.gender;

    const prevPrice = user?.conversation_price;
    let isConversationUpdated = false;
    if (result?.conversation_price > -1) {
      isConversationUpdated =
        user?.conversation_price !== result?.conversation_price;
      user.conversation_price = result?.conversation_price;
    }

    await user.save();
    if (isConversationUpdated) {
      const currUsersConversation = await Conversation.aggregate([
        { $match: { owner: ObjectId(userId) } },
      ]);

      if (currUsersConversation?.length) {
        await Conversation.updateMany(
          { owner: ObjectId(userId) },
          { price: user.conversation_price }
        );

        // no need to wait for this async operations
        currUsersConversation.forEach((conversation) => {
          conversation.price = user.conversation_price;

          sendNotification(
            req.user.data, // sender
            conversation?.members?.find(
              (member) => member.toString() !== userId.toString()
            ), // receiver
            conversation, //conversationId
            req.io, //io
            "update-conversation-price", // verb
            `__@__${req.user.data.user_handle} has updated the cost of the message  from ${prevPrice} to ${user?.conversation_price}` // message
          );
        });
      }
    }

    // if(result?.phone) {
    //   let updatedPhone
    //   if(response?.primary_phone) {
    //      updatedPhone = await ContactMech.findOneAndUpdate({user: userId, contact_mech_type: "phone"}, {contact_mech_value: result.phone})
    //   } else {
    //     updatedPhone = await ContactMech.create({user: userId, contact_mech_type: "phone", contact_mech_value: result.phone});
    //   }
    //   response.primary_phone = updatedPhone._id;
    //   await response.save();
    // }

    const userDetails = {
      _id: user._id,
      name: user.name,
      phone: user.primary_phone?.contact_mech_value,
      email: user.primary_email?.contact_mech_value,
      userHandle: user.user_handle,
      website: user.website,
      bio: user.bio,
      gender: user.gender,
      verified: user.verified,
      is_private: user.is_private,
      conversation_price: user.conversation_price,
    };

    return res.status(200).json({
      message: "success",
      data: userDetails,
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = updateUser;
