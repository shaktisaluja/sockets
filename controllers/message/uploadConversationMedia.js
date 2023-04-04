const createError = require("http-errors");
const formidable = require("formidable");

const Conversation = require("../../models/Conversation.model");
const uploadFiles = require("../../services/upload-files");

/**
 * Upload media for conversation
 * @param users - users _id list
 */
const createConversation = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const { id: conversationId } = req.params;

    const conversation = await Conversation.findOne({ _id: conversationId });
    if (!conversation) throw createError.BadRequest("Conversation not found!");
    if (!conversation.members.includes(userId))
      throw createError.BadRequest("You are not part of this conversation!");
    // if (conversation.status !== "open")
    //   throw createError.BadRequest("This conversation is not open!");

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }

      try {
        // const { media_type } = fields;

        const filesArray = Object.values(files);
        if (filesArray.length < 1)
          throw createError.BadRequest("Media is required!");
        const allFileUploadedArray = await Promise.all(
          filesArray?.map(async (item) => {
            let location = item.path;
            const originalFileName = item.name;
            const fileType = item.type;
            // uploads file.
            const data = await uploadFiles.upload(
              location,
              originalFileName,
              `conversation/${conversationId}/media`
            );
            return {
              url: data.Location,
              type: fileType,
            };
          })
        );
        return res.json({ message: "success", data: allFileUploadedArray[0] });
      } catch (error) {
        console.log("error in create post: ", error);
        next(error);
      }
    });
  } catch (error) {
    console.log("create group error: ", error);
    next(error);
  }
};

module.exports = createConversation;
