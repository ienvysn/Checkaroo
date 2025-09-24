const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isPersonal: {
      type: Boolean,
      default: false,
    },
    inviteToken: {
      type: String,
      unique: true, // ensures no duplicate tokens across groups
      sparse: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
