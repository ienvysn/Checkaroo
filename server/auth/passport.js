const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Group = require("../models/groupModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google OAuth Profile:", profile.id);

        // Check if user exists by googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if user exists by email
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google account to existing user
            user.googleId = profile.id;
            user.authProvider = "google";
            await user.save();
            console.log("Linked Google to existing user:", user.email);
          } else {
            // Create new user
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              username:
                profile.displayName || profile.emails[0].value.split("@")[0],
              authProvider: "google",
            });

            // Create personal group for new user
            const personalGroup = await Group.create({
              name: `${user.username}'s Personal`,
              owner: user._id,
              members: [user._id],
              isPersonal: true,
            });

            user.personalGroup = personalGroup._id;
            await user.save();

            console.log(
              "Created new OAuth user with personal group:",
              user.email
            );
          }
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });

        done(null, { user, token });
      } catch (error) {
        console.error("OAuth Error:", error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((data, done) => {
  done(null, data);
});

passport.deserializeUser((data, done) => {
  done(null, data);
});

module.exports = passport;
