const mongoose = require("mongoose");

const groupMemberSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
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

groupMemberSchema.index({ groupId: 1, memberId: 1 }, { unique: true });
groupMemberSchema.index({ groupId: 1 });
groupMemberSchema.index({ memberId: 1 });

const GroupMember = mongoose.model("GroupMember", groupMemberSchema);

module.exports = GroupMember;
