const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

const { protect } = require("../middleware/authMiddleware");

// GET all items in a group
router.get("/", protect, getItems);

// GET single item by id
router.get("/:id", protect, getItemById);

// CREATE new item in a group
router.post("/", protect, createItem);

// UPDATE (toggle complete) item
router.put("/:id", protect, updateItem);

// DELETE item
router.delete("/:id", protect, deleteItem);

module.exports = router;
