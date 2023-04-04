const createError = require("http-errors");

const Conversation = require("../../models/Conversation.model");
const ConversationCategory = require("../../models/ConversationCategory.model");
const UserFollow = require("../../models/UserFollow.model")

const {
  createMessageGroupValidation,
} = require("../../services/validation_schema");

/**
 * Create a messaging group
 * @param {Array<ObjectId>} users - users _id list
 */
const createConversation = async (req, res, next) => {
  const { _id: userId } = req.user.data;
  const { usersList } = req.body;
  try {
    if (usersList?.length < 2)
      throw createError.BadRequest(
        "Minimum 2 users are required in a conversation"
      );
    // const { type } =
    //   await createMessageGroupValidation.validateAsync(req.body);

    const existingConversation = await Conversation.findOne({
      // $or: [],
      members: { $all: usersList },
      // type: "single",
    });
    // console.log("existingConversation: ", existingConversation);
    if (existingConversation)
      throw createError.BadRequest("Conversation already exists");
    const group = new Conversation({
      members: usersList,
      type: "single",
      hidden_by: usersList,
    });

    ///// conversation list

    const groupData = await group.save();
    const populatedConversation = await Conversation.populate(group, "members");


   const sender = await ConversationCategory.create({
    conversationId:groupData._id,
    type:"primary",
    userId:usersList[0]
   })


   const reciever_is_follower = await UserFollow.findOne({to:usersList[1] ,from :usersList[0]}) 

   if(reciever_is_follower){
    const sender = await ConversationCategory.create({
      conversationId:groupData._id,
      type:"primary",
      userId:usersList[1]
     })
   }
   else {
    const sender = await ConversationCategory.create({
      conversationId:groupData._id,
      type:"unknown",
      userId:usersList[1]
     })
   }

    return res.status(200).json({
      message: "success",
      data: {
        _id: populatedConversation?._id,
        members: populatedConversation?.members,
        type: populatedConversation?.type,
      },
      sender
    });


  } catch (error) {
    console.log("create group error: ", error);
    next(error);
  }
};

module.exports = createConversation;
