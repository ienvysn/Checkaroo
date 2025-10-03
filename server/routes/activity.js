const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getActivities,
  getRecentActivities,
} = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");
// last 3 and 7 days
router.get("/", protect, getActivities);
router.get("/recent", protect, getRecentActivities);

module.exports = router;
