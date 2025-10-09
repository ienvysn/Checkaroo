const Group = require("../models/groupModel");
const Item = require("../models/itemModel");
const Activity = require("../models/activityModel");
const crypto = require("crypto");
const { createActivity } = require("./activityController");

const createGroup = async (req, res) => {
  try {
    const isPersonal = req.body.isPersonal || false;
    const inviteToken = isPersonal
      ? null
      : crypto.randomBytes(16).toString("hex");

    const group = await Group.create({
      name: req.body.name,
      owner: req.user._id,
      members: [req.user._id],
      isPersonal: isPersonal,
      inviteToken: inviteToken,
    });
    res.status(201).json(group);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating group", error: err.message });
  }
};

const getGroups = async (req, res) => {
  const groups = await Group.find({ members: req.user._id }).populate(
    "members",
    "username"
  );
  res.json(groups);
};

const getGroup = async (req, res) => {
  const group = await Group.findById(req.params.id).populate(
    "members",
    "username"
  );

  if (!group) {
    return res.status(404).json({ message: "Group not found" });
  }

  if (
    !group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    )
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this group" });
  }

  res.json(group);
};

const joinGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (
    group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    )
  ) {
    return res.status(400).json({ message: "Already a member" });
  }

  group.members.push(req.user._id);
  await group.save();

  // Populate members before sending response
  await group.populate("members", "username");

  // Log activity
  await createActivity(
    req.user._id,
    req.user.username,
    "joined_group",
    group._id,
    null
  );

  res.json({ message: "Joined group", group });
};

const joinGroupWithToken = async (req, res) => {
  const { token } = req.params;

  let group = await Group.findOne({ inviteToken: token });

  if (!group) {
    try {
      group = await Group.findById(token);
    } catch (err) {
      return res.status(404).json({ message: "Invalid invite link" });
    }
  }

  if (!group) {
    return res.status(404).json({ message: "Invalid invite link" });
  }

  if (
    req.user &&
    group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    )
  ) {
    return res.status(200).json({ message: "Already a member", group });
  }

  if (req.user) {
    group.members.push(req.user._id);
    await group.save();

    await group.populate("members", "username");

    return res
      .status(200)
      .json({ message: "Joined group successfully!", group });
  }

  return res.status(200).json({ message: "Login to join this group", group });
};

const updateGroupName = async (req, res) => {
  try {
    const { name } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only owner can update group name" });
    }

    // Check if personal group
    if (group.isPersonal) {
      return res
        .status(403)
        .json({ message: "Cannot update personal group name" });
    }

    // Validate name
    if (!name || name.trim().length < 3) {
      return res
        .status(400)
        .json({ message: "Group name must be at least 3 characters" });
    }

    const oldName = group.name;
    group.name = name.trim();
    await group.save();

    // Log activity
    await createActivity(
      req.user._id,
      req.user.username,
      "edited_group_name",
      group._id,
      `"${oldName}" to "${group.name}"`
    );

    res.json({ message: "Group name updated", group });
  } catch (err) {
    console.error("Update group name error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const group = await Group.findById(req.params.id).populate(
      "members",
      "username"
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if user is owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can remove members" });
    }

    // Check if trying to remove self
    if (userId === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot remove yourself. Use leave group instead." });
    }

    // Check if member exists in group
    const memberToRemove = group.members.find(
      (m) => m._id.toString() === userId
    );
    if (!memberToRemove) {
      return res.status(404).json({ message: "Member not found in group" });
    }

    // Remove member
    group.members = group.members.filter(
      (member) => member._id.toString() !== userId
    );
    await group.save();

    // Log activity
    await createActivity(
      req.user._id,
      req.user.username,
      "removed_member",
      group._id,
      memberToRemove.username
    );

    res.json({ message: "Member removed", group });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const leaveGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  // Check if user is owner
  if (group.owner.toString() === req.user._id.toString()) {
    return res.status(400).json({
      message: "Owner cannot leave group. Delete the group instead.",
      isOwner: true,
    });
  }

  // Log activity before removing
  await createActivity(
    req.user._id,
    req.user.username,
    "left_group",
    group._id,
    null
  );

  group.members = group.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  );

  await group.save();
  res.json({ message: "Left group", group });
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if user is owner
    if (group.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Only owner can delete this group" });
    }

    // Check if personal group
    if (group.isPersonal) {
      return res.status(403).json({ message: "Cannot delete personal group" });
    }

    // Delete all items in the group
    await Item.deleteMany({ group: group._id });

    // Delete all activities in the group
    await Activity.deleteMany({ group: group._id });

    // Delete the group
    await group.deleteOne();

    res.json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Delete group error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  joinGroupWithToken,
  joinGroup,
  leaveGroup,
  updateGroupName,
  removeMember,
};
