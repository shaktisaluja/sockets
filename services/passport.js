const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const createError = require("http-errors");
const { app, google, baseUrl } = require("../config/keys");

const User = require("../models/User.model");
const oAuthRegisterUser = require("./user/oAuthRegisterUser");
const UserLoginMech = require("../models/UserLoginMech.model");
const ContactMech = require("../models/ContactMech.model");

passport.use(
  new GoogleStrategy(
    {
      clientID: google.clientID,
      clientSecret: google.clientSecret,
      // callbackURL: "/api/auth/google/callback",
      callbackURL: `${baseUrl.base_server_url}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //console.log("Passport service callback triggered: ", accessToken, refreshToken, profile);
        const data = profile._json;
        //console.log("asdfdsafsa",data.sub)

        const fetchedUser = await User.findOne({ OAuth: data.sub });
        if (fetchedUser) {
          let id = fetchedUser._id;
          return done(null, { id: id });
        }
        const err = await oAuthRegisterUser(data);

        if (!err) throw createError.InternalServerError("failed to save user");
        console.log(err);
        let id = err._id;

        return done(null, { id: id });

        //}
        // const userExist = await ContactMech.findOne({ contact_mech_value: data.email }).populate("user");
        // if (userExist) {
        //   return done(null, {localUser: true, ...userExist.user._doc});
        // }

        // return "okkay"
        //const err = await oAuthRegisterUser(data);

        // if (!err) throw createError.InternalServerError("failed to save user");
        // console.log(err)

        //return done(null, err);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);
