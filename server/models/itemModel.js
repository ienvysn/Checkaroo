const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  assignedTo: {
    type: String,
    default: false,
  },
});

module.exports = mongoose.model("item", ItemSchema);
