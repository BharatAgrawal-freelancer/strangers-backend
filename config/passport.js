import passport from "passport"
import dotenv from "dotenv";
dotenv.config();
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import User from "../models/User.js"

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // 1️⃣ Find user by email
        let user = await User.findOne({ email });

        if (user) {
          /**
           * CASE 1:
           * user exists via FORM login
           */
          if (user.provider === "form") {
            user.provider = "google";
            user.providerId = profile.id;
            user.profilePhoto =
              profile.photos?.[0]?.value || user.profilePhoto;
            user.name = user.name || profile.displayName;

            await user.save();
          }

          /**
           * CASE 2:
           * already google user → do nothing
           */
        } else {
          /**
           * CASE 3:
           * brand new google user
           */
          user = await User.create({
            provider: "google",
            providerId: profile.id,
            name: profile.displayName,
            email,
            profilePhoto: profile.photos?.[0]?.value || null,
          });
        }

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

export default passport
