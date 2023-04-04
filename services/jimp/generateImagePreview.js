const fs = require("fs");
const Jimp = require("jimp");
const AWS = require("aws-sdk");
const keys = require("../../config/keys").aws;

exports.generateImagePreview = async (inputPath, outputPath) => {
  try {
    // reads the image
    const image = await Jimp.read(inputPath);
    // blurs the image with the given number of pixels
    await image.blur(50);
    const s3 = new AWS.S3({
      accessKeyId: keys.accessKeyId,
      secretAccessKey: keys.secretAccessKey,
      region: keys.region,
    });
    const data = await image.getBufferAsync(Jimp.AUTO);
    const params = {
      Bucket: keys.bucketName,
      Key: outputPath,
      Body: data,
      ACL: "public-read",
    };
    const s3Response = await s3.upload(params).promise();
    fs.unlink(inputPath, function (err) {
      if (err) {
        console.error(err);
      }
    });
    return s3Response;
  } catch (error) {
    console.log("error in image processing: ", error);
    return error;
  }
};
