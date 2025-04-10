const mongoose = require("mongoose");

const sharedPasswordSchema = new mongoose.Schema(
  {
    userId: {
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
  },
  {
    timestamps: true,
  },
);

// TODO: Users can only share their own keys, not those belonging to other users

module.exports = mongoose.model("SharedPassword", sharedPasswordSchema);
