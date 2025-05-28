
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
      
          return done(null, user);
        } else {
  
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
   
          });

    
          if (!newUser.email) {
            return done(new Error("Email not provided by Google. Ensure 'email' scope is requested and granted."), false);
          }

          const existingEmailUser = await User.findOne({ email: newUser.email });
          if (existingEmailUser) {

              if (!existingEmailUser.googleId) {
                  existingEmailUser.googleId = profile.id;
                  existingEmailUser.displayName = existingEmailUser.displayName || profile.displayName;

                  await existingEmailUser.save();
                  return done(null, existingEmailUser);
              }

              return done(null, existingEmailUser); 
          }


          await newUser.save();
          return done(null, newUser);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);