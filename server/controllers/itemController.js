const Item = require("../models/itemModel");
const Group = require("../models/groupModel");
const { createActivity } = require("./activityController");

// Get all items in a group
const getItems = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const items = await Item.find({ group: groupId })
      .populate("assignedTo", "username")
      .populate("createdBy", "username");
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("assignedTo", "username")
      .populate("createdBy", "username");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user._id)) {
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
    const { name, quantity, assignedTo } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newItem = new Item({
      name,
      quantity: quantity || 1,
      group: groupId,
      createdBy: req.user._id,
      assignedTo: assignedTo || null,
    });

    await newItem.save();
    await newItem.populate("assignedTo", "username");
    await newItem.populate("createdBy", "username");

    // Log activity for adding item
    await createActivity(
      req.user._id,
      req.user.username,
      "added_item",
      groupId,
      name
    );

    if (assignedTo) {
      const assignedUser = await require("../models/userModel").findById(
        assignedTo
      );
      if (assignedUser) {
        await createActivity(
          req.user._id,
          req.user.username,
          "assigned_item",
          groupId,
          `${name} to ${assignedUser.username}`
        );
      }
    }

    res.status(201).json(newItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Cannot add the item");
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("assignedTo", "username")
      .populate("createdBy", "username");
    if (!item) return res.status(404).json({ msg: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { isComplete, name, quantity, assignedTo } = req.body;

    //  toggle
    if (isComplete !== undefined) {
      item.isComplete = isComplete;
      await item.save();
      await item.populate("assignedTo", "username");
      await item.populate("createdBy", "username");

      const action = item.isComplete ? "marked_complete" : "marked_incomplete";
      await createActivity(
        req.user._id,
        req.user.username,
        action,
        item.group,
        item.name
      );

      return res.json(item);
    }

    let activityMessages = [];

    if (name && name !== item.name) {
      const oldName = item.name;
      item.name = name;
      activityMessages.push(`renamed "${oldName}" to "${name}"`);
    }

    if (quantity && quantity !== item.quantity) {
      item.quantity = quantity;
    }

    //  assignment change
    if (assignedTo !== undefined) {
      const oldAssignedTo = item.assignedTo?._id?.toString();
      const newAssignedTo = assignedTo;

      if (oldAssignedTo !== newAssignedTo) {
        item.assignedTo = assignedTo || null;

        if (!assignedTo) {
          // Unassigned
          await createActivity(
            req.user._id,
            req.user.username,
            "unassigned_item",
            item.group,
            item.name
          );
        } else {
          // Assigned or reassigned
          const assignedUser = await require("../models/userModel").findById(
            assignedTo
          );
          if (assignedUser) {
            await createActivity(
              req.user._id,
              req.user.username,
              "assigned_item",
              item.group,
              `${item.name} to ${assignedUser.username}`
            );
          }
        }
      }
    }

    await item.save();
    await item.populate("assignedTo", "username");
    await item.populate("createdBy", "username");

    // Log edit activity if name or quantity changed
    if (activityMessages.length > 0) {
      await createActivity(
        req.user._id,
        req.user.username,
        "edited_item",
        item.group,
        item.name
      );
    }

    res.json(item);
  } catch (err) {
    console.error("Update item error:", err.message);
    res.status(500).send("Server Error");
  }
};

// Delete an item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });

    const group = await Group.findById(item.group);
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const itemName = item.name;
    const itemGroup = item.group;

    await item.deleteOne();

    // Log activity
    await createActivity(
      req.user._id,
      req.user.username,
      "deleted_item",
      itemGroup,
      itemName
    );

    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error("Delete item error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { getItems, getItemById, createItem, updateItem, deleteItem };
