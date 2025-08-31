const express = require("express");
const router = express.Router();
const Item = require("../models/itemModel");
const itemModel = require("../models/itemModel");

router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findById(id);
    res.send(item);
  } catch (err) {
    console.error(err.message);
    req.status(500).send("Server error");
  }
});

router.post("/", async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
    });
    await newItem.save();
    res.send(newItem);
  } catch (err) {
    console.error(err.message);
    req.send("Cannot add the item");
  }
});

router.put("/:id", async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    item.isComplete = !item.isComplete;
    await item.save();
    console.log(`Item updated: ${item.name}`);
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }
    await Item.findByIdAndDelete(req.params.id);
    console.log(`Item deleted: ${item.name}`);
    res.json({ msg: "Item removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
