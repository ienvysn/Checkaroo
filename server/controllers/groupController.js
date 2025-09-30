const Group = require("../models/groupModel");
const Item = require("../models/itemModel");
const crypto = require("crypto");
const { createActivity } = require("./activityController");

const createGroup = async (req, res) => {
  try {
    const isPersonal = req.body.isPersonal || false;
    const inviteToken = isPersonal
      ? null
      : crypto.randomBytes(16).toString("hex"); // if perosnal group then no need invvte token

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
  const groups = await Group.find({ members: req.user._id });
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

  // If user is authenticated, add them to the group
  if (req.user) {
    group.members.push(req.user._id);
    await group.save();

    // Populate members for response
    await group.populate("members", "username");

    return res
      .status(200)
      .json({ message: "Joined group successfully!", group });
  }

  // If user is not authenticated, return group info for display
  return res.status(200).json({ message: "Login to join this group", group });
};

const leaveGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  group.members = group.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  );

  if (group.owner.toString() === req.user._id.toString()) {
    await group.deleteOne();
    return res.json({ message: "Owner left, group deleted" });
  }

  await group.save();
  await createActivity(
    req.user._id,
    req.user.username,
    "left_group",
    group._id,
    null
  );
  res.json({ message: "Left group", group });
};

const deleteGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (group.owner.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Only owner can delete this group" });
  }

  await Item.deleteMany({ group: group._id });
  await group.deleteOne();

  res.json({ message: "Group deleted" });
};

module.exports = {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  joinGroupWithToken,
  joinGroup,
  leaveGroup,
};
