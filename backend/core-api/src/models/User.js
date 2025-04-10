const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    securityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastLogin: {
      type: Date,
      default: null,
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

userSchema.methods.getAllFields = function () {
  return this.toObject();
};

userSchema.methods.getPublicFields = function () {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    isActive: this.isActive,
    securityScore: this.securityScore,
    lastLogin: this.lastLogin,
  };
};

// Index for faster queries
// userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
