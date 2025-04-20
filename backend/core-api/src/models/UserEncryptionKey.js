const mongoose = require("mongoose");

const userEncryptionKeySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    salt: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const UserEncryptionKey = mongoose.model(
  "UserEncryptionKey",
  userEncryptionKeySchema,
);

module.exports = UserEncryptionKey;
