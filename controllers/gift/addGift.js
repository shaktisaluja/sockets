const createError = require("http-errors");
const formidable = require("formidable");

// import verify token model and user model
const uploadFiles = require("../../services/upload-files");
const Gift = require("../../models/Gift.model");

const { createGiftValidation } = require("../../services/validation_schema");

const createGift = async (req, res, next) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }

      try {
        const result = await createGiftValidation.validateAsync(fields);
        const { name, cost } = result;

        // upload files to s3
        const filesArray = Object.values(files);
        const allFileUploadedArray = await Promise.all(
          filesArray?.map(async (item) => {
            let location = item.path;
            const originalFileName = item.name;
            const fileType = item.type;
            // uploads file.
            const data = await uploadFiles.upload(
              location,
              originalFileName,
              `gifts/${name}`
            );
            return {
              url: data.Location,
              type: fileType,
            };
          })
        );

        const gift = new Gift({
          name,
          cost,
          media: allFileUploadedArray[0],
        });

        // Save gift to DB
        const createdGift = await gift.save();
        if (!createdGift)
          throw createError.InternalServerError(
            "Your request could not be processed. Please contact support or try again after some time."
          );
        return res.status(200).json({
          success: true,
          data: createdGift,
        });
      } catch (error) {
        console.log("error: ", error);
        next(error);
      }
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = createGift;
