const ContactMech = require("../models/ContactMech.model");

const createUserHandle = async (name) => {
  const modifiedName = name.length > 10 ? name.slice(0, 9) : name;
  const userHandle =
    modifiedName.replace(" ", "").replace(/\s/g, "").toLowerCase() +
    Math.random().toString().slice(2, 11);
  if (userHandle.length < 21) {
    const existingUserHandle = await ContactMech.findOne({ userHandle });
    if (existingUserHandle) createUserHandle(modifiedName);
    return userHandle;
  } else {
    createUserHandle(modifiedName);
  }
};
module.exports = createUserHandle;
