const createError = require("http-errors");
const User = require("../../models/User.model");
const { updateUserValidation } = require("../../services/validation_schema");


const updateUser = async (req, res, next) => {
  try {
    const { _id: userId } = req.user.data;
    //const { dateOfBirth } = req.body ;


    //converting the date into GMT format
    // const dob= new Date(dateOfBirth); 
    // delete req.body['dateOfBirth']; 
    // req.body["dob"] = dob.toString();

    //Validation of Request Body
    const result = await updateUserValidation.validateAsync(req.body);
     
    const contacts = await User.findOne({ _id: userId });
    if (!contacts) {
      throw createError(404, "Contact not found");
    }

    //Updating the feilds into dataBase
    const updateContacts = await User.findOneAndUpdate(
      { _id: userId },
        result,
      { new: true }
    );
    await updateContacts.save();
    res.json({
      success: true,
      message: "Contact updated successfully",
      data: updateContacts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = updateUser;