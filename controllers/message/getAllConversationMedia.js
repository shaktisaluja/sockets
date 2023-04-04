const createError = require("http-errors");
const { ObjectId } = require("mongoose").Types;
const Message = require("../../models/Message.model");

const getAllConversationMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const getMedia = await Message.find({
      conversation: ObjectId(id),
      // $or: [ { type: { $eq: "video" } }, { type: { $eq: "image" } } ] 
      type: ["image", "video", "audio", "document"],
    });

    if (!getMedia) {
      throw createError.BadRequest("No Media Found!");
    }

    res.status(200).json({
        message: "success",
        getMedia
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports= getAllConversationMedia;