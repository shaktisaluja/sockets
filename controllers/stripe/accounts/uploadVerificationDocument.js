const createError = require("http-errors");
const formidable = require("formidable");
const fs = require("fs");

const stripe = require("../../../utils/stripe");
const User = require("../../../models/User.model.js");
const Creator = require("../../../models/Creator.model.js");

const uploadVerificationDocument = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;

    const user = await User.findOne({ _id: userId });
    if (!user.is_creator)
      throw createError.BadRequest("Please finish account creation first");

    const creatorDetails = await Creator.findOne({
      _id: user.creator_id,
    });

    if (!creatorDetails) {
      throw createError.BadRequest(
        "Internal server error. Please contact administrator!"
      );
    }

    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        res.status(400);
        res.send(err);
      }

      try {
        const filesArray = Object.values(files);
        if (!filesArray[0])
          throw createError.InternalServerError("Please try again.");

        const temp = Object.entries(files);

        for (let fileDetails of temp) {
          if (!["front", "back"].includes(fileDetails[0]))
            throw createError.BadRequest("Security breach detected!");
          const fp = fs.readFileSync(fileDetails[1].path);
          const file = await stripe.files.create({
            purpose: "identity_document",
            file: {
              data: fp,
              name: fileDetails[1].name,
              type: "application/octet-stream",
            },
          });
          await stripe.accounts.update(creatorDetails.stripe_account_id, {
            individual: {
              verification: {
                document: {
                  [fileDetails[0]]: file.id,
                },
              },
            },
          });
        }

        return res.status(200).json({
          success: true,
          data: "",
        });
      } catch (error) {
        console.log("error in upload document: ", error);
        next(error);
      }
    });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = uploadVerificationDocument;
