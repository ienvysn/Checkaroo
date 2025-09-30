const Activity = require("../models/activityModel");
const Group = require("../models/groupModel");

const createActivity = async (
  userId,
  username,
  action,
  groupId,
  itemName = null
) => {
  try {
    const activity = await Activity.create({
      user: userId,
      username: username,
      action: action,
      itemName: itemName,
      group: groupId,
    });
    return activity;
  } catch (err) {
    console.error("Error creating activity:", err);
  }
};

// Get activities for a group (last 7 days)
const getActivities = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get activities from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activities = await Activity.find({
      group: groupId,
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent

    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const activities = await Activity.find({ group: groupId })
      .sort({ createdAt: -1 })
      .limit(3);

    res.json(activities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { createActivity, getActivities, getRecentActivities };
