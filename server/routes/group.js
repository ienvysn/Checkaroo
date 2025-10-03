const express = require("express");
const router = express.Router();
const itemRoutes = require("./items");
const { protect } = require("../middleware/authMiddleware");
const activityRoutes = require("./activity");
const {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  joinGroup,
  joinGroupWithToken,
  leaveGroup,
} = require("../controllers/groupController");

router.post("/", protect, createGroup);

router.get("/", protect, getGroups);

router.get("/:id", protect, getGroup);

router.post("/:id/join", protect, joinGroup);

router.get("/invite/:token", joinGroupWithToken);

router.post("/:id/leave", protect, leaveGroup);

router.delete("/:id", protect, deleteGroup);

// ANy request in this route will use itemroutes. so groups/groupid/items/itemid
router.use("/:groupId/activities", activityRoutes);
router.use("/:groupId/items", itemRoutes);

module.exports = router;
