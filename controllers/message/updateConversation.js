const Conversation = require("../../models/ConversationCategory.model");
const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const updateConversationCategory = async (req, res, next) => {
  const { id } = req.params;
  try {
  
     await Conversation.findOne(
      {
        _id: ObjectId(id),
      },
     
    );


    if(type==="primary"){
      const update = await findOneAndUpdate({
        _id: ObjectId(id),

      },
      {type:"archive"},
      {
        new:true
      })
      
      return res.json({ message: "success", data: update });

    }

   
  } catch (error) {
    next(error);
  }
};
module.exports = updateConversationCategory;