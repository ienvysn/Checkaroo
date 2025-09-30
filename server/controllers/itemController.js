const Item = require("../models/itemModel");
const Group = require("../models/groupModel");
const { createActivity } = require("./activityController");
// Get all items in a group
const getItems = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const items = await Item.find({ group: groupId });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const createItem = async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newItem = new Item({
      name,
      quantity: quantity || 1,
      group: groupId,
      createdBy: req.user.id,
    });

    await newItem.save();
    await createActivity(
      req.user.id,
      req.user.username,
      "added_item",
      groupId,
      name
    );
    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cannot add the item");
  }
};

// Update (toggle complete) an item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    item.isComplete = !item.isComplete;
    await item.save();

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await item.deleteOne();

    await createActivity(
      req.user.id,
      req.user.username,
      "deleted_item",
      item.group,
      itemName
    );

    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };
