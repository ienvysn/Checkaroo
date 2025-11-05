const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Get current user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile (username and email)
const updateUserProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OAuth user (cannot change email for OAuth)
    if (user.authProvider !== "local" && email !== user.email) {
      return res.status(400).json({
        message: "Cannot change email for OAuth accounts",
      });
    }

    // Validate username
    if (username && username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
      });
      if (emailExists) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }
    }

    // Update fields
    if (username) user.username = username.trim();
    if (email) user.email = email.toLowerCase().trim();

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OAuth user
    if (user.authProvider !== "local") {
      return res.status(400).json({
        message: "Cannot change password for OAuth accounts",
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For local accounts, verify password
    if (user.authProvider === "local") {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect password" });
      }
    }

    // Delete user's personal group
    if (user.personalGroup) {
      const Group = require("../models/groupModel");
      const Item = require("../models/itemModel");
      const Activity = require("../models/activityModel");

      await Item.deleteMany({ group: user.personalGroup });
      await Activity.deleteMany({ group: user.personalGroup });
      await Group.findByIdAndDelete(user.personalGroup);
    }

    // Remove user from all groups
    const Group = require("../models/groupModel");
    await Group.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    // Delete user
    await user.deleteOne();

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteAccount,
};
