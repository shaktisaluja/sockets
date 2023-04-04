const createError = require("http-errors");
const formidable = require("formidable");

// import verify token model and user model
const uploadFiles = require("../../services/upload-files");
const UserModel = require("../../models/User.model");

const uploadAvatar = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      console.log(files)
      if (err) {
        res.status(400);
        res.send(err);
      }

      try {
        const { description } =
          fields;

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
              `users/${userId}/posts`,
              null,
            );
            return {
              url: data.Location,
              type: fileType,
            };
          })
        );

        const uploadAvatar = await UserModel.findOneAndUpdate({_id:userId},{avatar_url:allFileUploadedArray[0].url},{new:true})
    
        // const post = new Post({
        //   media: allFileUploadedArray,
        //   description,
        //   user: userId,
        // });

        // Save post to DB
        // const createdPost = await post.save();
        // if (!createdPost)
        //   throw createError.InternalServerError(
        //     "Your request could not be processed. Please contact support or try again after some time."
        //   );

        res.status(200).json({
          success: true,
          data: uploadAvatar,
        });

      } catch (error) {
        console.error("error in create post: ", error)
      }
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = uploadAvatar;