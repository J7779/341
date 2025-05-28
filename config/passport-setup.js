// config/passport-setup.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const dotenv = require("dotenv");

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id); // Store user.id in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach user object to req.user
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`, // Ensure this matches Google Console
      scope: ["profile", "email"], // Request access to profile and email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in your DB
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, log them in
          return done(null, user);
        } else {
          // If not, create a new user in your DB
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
            // profilePhoto: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          });

          // Validate email exists (Google should always provide one with 'email' scope)
          if (!newUser.email) {
            return done(new Error("Email not provided by Google. Ensure 'email' scope is requested and granted."), false);
          }
          
          // Check if email is already in use by a non-Google user (e.g. local account)
          const existingEmailUser = await User.findOne({ email: newUser.email });
          if (existingEmailUser) {
              // Potentially link accounts or handle conflict
              // For now, we'll assume if email exists, it should be linked or throw error.
              // This example will simply log in the existing user if their email matches,
              // and update their googleId if it's missing.
              if (!existingEmailUser.googleId) {
                  existingEmailUser.googleId = profile.id;
                  existingEmailUser.displayName = existingEmailUser.displayName || profile.displayName;
                  // Optionally update other fields
                  await existingEmailUser.save();
                  return done(null, existingEmailUser);
              }
              // If email exists and has a *different* googleId, this is a conflict.
              // Or, if it's the same user just re-authenticating.
              return done(null, existingEmailUser); // Log them in
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