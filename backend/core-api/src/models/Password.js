const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
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
    url: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    strength: {
      type: String,
      enum: ["low", "moderate", "high", "strong"],
      default: "low",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

passwordSchema.methods.getAllFields = function () {
  return this.toObject();
};

passwordSchema.methods.getPublicFields = function () {
  return {
    id: this._id,
    userId: this.userId,
    service: this.service,
    username: this.username,
    url: this.url,
    score: this.score,
    strength: this.strength,
  };
};

// Compound index for faster queries
// passwordSchema.index({ userId: 1, title: 1 });

const Password = mongoose.model("Password", passwordSchema);

module.exports = Password;
