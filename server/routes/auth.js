const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} = require("../controllers/resetPasswordController");
const passport = require("../auth/passport");
const { sendPasswordResetEmail } = require("../utils/EmailService");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Password reset routes
router.post("/forgot-password", requestPasswordReset);
router.get("/verify-reset-token/:token", verifyResetToken);
router.post("/reset-password", resetPassword);

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
    const { token, user } = req.user;
    const redirectUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }?token=${token}&personalGroup=${user.personalGroup}`;
    res.redirect(redirectUrl);
  }
);

router.post("/test-email", async (req, res) => {
  try {
    await sendPasswordResetEmail(
      req.body.email || process.env.EMAIL_USER,
      "test-token-123"
    );
    res.json({ message: "Test email sent! Check your inbox." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to send email",
      error: error.message,
    });
  }
});

module.exports = router;
