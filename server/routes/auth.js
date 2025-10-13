const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const passport = require("../auth/passport");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: process.env.CLIENT_URL || "http://localhost:3000",
  }),
  (req, res) => {
    // Success
    const { token, user } = req.user;
    // Redirect to frontend with token
    const redirectUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/auth/success?token=${token}&personalGroup=${user.personalGroup}`;
    res.redirect(redirectUrl);
  }
);

module.exports = router;
