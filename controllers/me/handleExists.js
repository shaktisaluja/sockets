const createError = require("http-errors");
// import verify token model and user model
const checkUserHandle = require("../../services/checkUserHandle");

const handleExists = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    if (!req.body.userHandle) {
      throw createError.BadRequest();
    }
    const check = await checkUserHandle(req.body.userHandle);

    res.status(200).json({ message: "success", exists: check });
  } catch (error) {
    console.log("error: ", error);
    next(error);
  }
};

module.exports = handleExists;
