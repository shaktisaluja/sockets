const createError = require("http-errors");
// import post model
const UserModel = require("../../models/User.model");


const checkUserHandle = async (req, res, next) => {
  try {
   
    const {user_handle } = req.query

    console.log(user_handle)

    console.log(user_handle)
   if(!user_handle){
    res.status(400).json({
        status: "false",
        message : "user handle is required feild"
      });
   }
   const userHandleExist = await UserModel.findOne({user_handle : user_handle})

   if(!userHandleExist)return res.status(400).send({status : "false" , message : "Please put unique user handle"});
   else return res.status(200).send({status : "true" , message : "success"});

  } catch (error) {
    next(error);
  }
};

module.exports = checkUserHandle;
