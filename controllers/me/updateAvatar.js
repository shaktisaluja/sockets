const createError = require("http-errors");
const formidable = require("formidable");

// import verify token model and user model
const uploadFiles = require("../../services/upload-files");
const User = require("../../models/User.model");

const updateAvatar = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }
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
            `users/${userId}/avatar`
          );
          return {
            url: data.Location,
            type: fileType,
          };
        })
      );
      if (!allFileUploadedArray)
        throw createError.InternalServerError(
          "Your request could not be processed. Please contact support or try again after some time."
        );
      await User.findOneAndUpdate(
        {
          _id: userId,
        },
        { avatar_url: allFileUploadedArray[0]?.url },
        { new: true }
      );
      res.status(200).json({
        success: true,
        data: allFileUploadedArray[0]?.url,
      });
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = updateAvatar;
