const createError = require("http-errors");
// import verify token model and user model
const User = require("../models/User.model");

const userHandle = async (handle) => {
  try {
    const exists = await User.findOne({ user_handle: handle });
    if (exists) {
      return true;
    }
    return false;
  } catch (error) {
    return error;
  }
};

module.exports = userHandle;
