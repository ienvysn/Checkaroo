const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "added_item",
        "marked_complete",
        "marked_incomplete",
        "deleted_item",
        "joined_group",
        "left_group",
        "edited_group_name",
        "removed_member",
      ],
    },
    itemName: {
      type: String,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 604800, // Auto-delete after 7 days (in seconds)
    },
  },
  { timestamps: true }
);

// for fastwr quires
ActivitySchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", ActivitySchema);
