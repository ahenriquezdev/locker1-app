const mongoose = require("mongoose");

const passwordShareSchema = new mongoose.Schema(
  {
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    passwordId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Password",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Group",
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    unique: ["passwordId", "groupId"],
  },
);

passwordShareSchema.index({ sharedBy: 1 });
passwordShareSchema.index({ passwordId: 1 });
passwordShareSchema.index({ groupId: 1 });
passwordShareSchema.index({ sharedBy: 1, groupId: 1 });
passwordShareSchema.index({ passwordId: 1, groupId: 1 });

const PasswordShare = mongoose.model("PasswordShare", passwordShareSchema);

module.exports = PasswordShare;
