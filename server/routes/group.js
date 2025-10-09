const express = require("express");
const router = express.Router();
const itemRoutes = require("./items");
const activityRoutes = require("./activity");
const { protect } = require("../middleware/authMiddleware");
const {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  joinGroup,
  joinGroupWithToken,
  leaveGroup,
  updateGroupName,
  removeMember,
} = require("../controllers/groupController");

router.post("/", protect, createGroup);

router.get("/", protect, getGroups);

router.get("/:id", protect, getGroup);

router.post("/:id/join", protect, joinGroup);

router.get("/invite/:token", joinGroupWithToken);

router.post("/:id/leave", protect, leaveGroup);

router.put("/:id/name", protect, updateGroupName);

router.delete("/:id/members/:userId", protect, removeMember);

router.delete("/:id", protect, deleteGroup);

// Activity routes
router.use("/:groupId/activities", activityRoutes);

// Item routes
router.use("/:groupId/items", itemRoutes);

module.exports = router;
