const Group = require("../models/groupModel");
const Item = require("../models/itemModel");

const createGroup = async (req, res) => {
  try {
    const group = await Group.create({
      name: req.body.name,
      owner: req.user._id,
      members: [req.user._id],
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
    "name email"
  );
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (!group.members.includes(req.user._id)) {
    return res
      .status(403)
      .json({ message: "Not authorized to view this group" });
  }

  res.json(group);
};

const joinGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  if (group.members.includes(req.user._id)) {
    return res.status(400).json({ message: "Already a member" });
  }

  group.members.push(req.user._id);
  await group.save();

  res.json({ message: "Joined group", group });
};

const leaveGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: "Group not found" });

  group.members = group.members.filter(
    (member) => member.toString() !== req.user._id.toString()
  );

  // If owner leaves, delete group (or transfer ownership later)
  if (group.owner.toString() === req.user._id.toString()) {
    await group.deleteOne();
    return res.json({ message: "Owner left, group deleted" });
  }

  await group.save();
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
  joinGroup,
  leaveGroup,
};
