const User = require("../models/userModel");
const Group = require("../models/groupModel");
const Item = require("../models/itemModel");

createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const owner = req.user.id;
    const group = await Group.create({ name, owner, members: [owner] });
    res.status(201).json(group);
  } catch (e) {
    res.status(400).json({ message: "Error creating group", error: e.message });
  }
};

deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!group) {
      return res
        .status(404)
        .json({ msg: "Group not found or you are not the owner" });
    }

    await Group.findByIdAndDelete(req.params.id);

    console.log(`Group deleted: ${group.name}`);
    res.json({ msg: "Group removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("members", "username email")
      .populate("items");
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }

    if (!group.members.some((member) => member._id.equals(req.user.id))) {
      return res
        .status(403)
        .json({ msg: "User not authorized to view this group" });
    }
    res.json(group);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id });
    res.json(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    if (group.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Only the group owner can add members" });
    }
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (group.members.includes(userId)) {
      return res
        .status(400)
        .json({ msg: "User is already a member of this group" });
    }
    group.members.push(userId);
    await group.save();
    res.json(group.members);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

addItemToGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    if (!group.members.some((member) => member._id.equals(req.user.id))) {
      return res.status(403).json({ msg: "Only group members can add items" });
    }
    const { name, quantity } = req.body;
    const newItem = new Item({
      name,
      quantity,
      user: req.user.id,
    });
    const item = await newItem.save();
    group.items.push(item._id);
    await group.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

removeItemFromGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ msg: "Group not found" });
    }
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    const isMember = group.members.some((member) =>
      member._id.equals(req.user.id)
    );
    const isItemOwner = item.user.toString() === req.user.id;

    if (!isMember) {
      return res
        .status(403)
        .json({ msg: "You are not a member of this group" });
    }
    if (!isItemOwner && group.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to remove this item" });
    }

    group.items = group.items.filter((item) => item.toString() !== itemId);
    await group.save();
    await Item.findByIdAndDelete(itemId);
    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createGroup,
  deleteGroup,
  getGroup,
  getGroups,
  addMember,
  addItemToGroup,
  removeItemFromGroup,
};
