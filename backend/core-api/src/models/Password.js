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
      enum: ["low", "moderate", "high", "strong"],
      default: "low",
    },
    // authTag: {
    //   type: String,
    //   required: true,
    // },
    // notes: {
    //     type: String,
    //     trim: true
    // },
    // category: {
    //     type: String,
    //     trim: true,
    //     default: 'Uncategorized'
    // },
    // favorite: {
    //     type: Boolean,
    //     default: false
    // },
    // strength: {
    //     score: {
    //         type: Number,
    //         min: 0,
    //         max: 4,
    //         default: 0
    //     },
    //     feedback: {
    //         type: String
    //     }
    // },
    // sharedWith: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Group'
    // }],
    // lastModified: {
    //     type: Date,
    //     default: Date.now
    // }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // delete ret.passwordHash; // Never send password hash in responses
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
passwordSchema.index({ userId: 1, title: 1 });

// Method to return password data without sensitive information
// passwordSchema.methods.toJSON = function () {
//   const password = this.toObject();
//   delete password.__v;
//   delete password.encryptedPassword;
//   delete password.iv;
//   delete password.authTag;
//   return password;
// };

const Password = mongoose.model("Password", passwordSchema);

module.exports = Password;
