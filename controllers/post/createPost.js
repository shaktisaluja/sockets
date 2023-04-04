const createError = require("http-errors");
const formidable = require("formidable");
const Wallet = require("../../models/Wallet.model");

// import verify token model and user model
const uploadFiles = require("../../services/upload-files");
const Post = require("../../models/Post.model");

const createPost = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }

      try {
        let { description, repost, rePostedID, tag } = fields;

        let meme;
        console.log(tag)
         if(tag == undefined)tag=[]
         else { tag=JSON.parse(tag) }

        if (!repost) {
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
                null
              );
              return {
                url: data.Location,
                type: fileType,
              };
            })
          );

          //!if repost then repost tag is true because repost is itself is a post

          meme = new Post({
            media: allFileUploadedArray,
            description,
            tags: tag,
            user: userId,
          });
        } else {
          meme = new Post({
            // media: allFileUploadedArray,
            description,
            tags: tag,
            user: userId,
            isRePosted: repost,
            rePostedID,
          });
        }

        // Save post to DB
        const createdPost = await meme.save();
        if (!createdPost)
          throw createError.InternalServerError(
            "Your request could not be processed. Please contact support or try again after some time."
          );

        let postCount = await Post.find({ user: userId });

        if (postCount.length == 10)
          await Wallet.findOneAndUpdate(
            { user: userId },
            { $inc: { meme_coins: 2 } },
            { new: true }
          );
        res.status(200).json({
          success: true,
          data: createdPost,
        });
      } catch (error) {
        console.error("error in create post: ", error);
      }
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = createPost;
