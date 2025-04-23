const mongoose = require("mongoose");

const passwordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    password: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String, required: true },
    url: { type: String, trim: true },
    score: { type: Number, min: 0, max: 100, default: 0 },
    strength: {
      type: String,
      enum: ["low", "moderate", "high", "strong"],
      default: "low",
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.iv;
        delete ret.authTag;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.iv;
        delete ret.authTag;
        return ret;
      },
    },
  },
);

passwordSchema.virtual("isShared").get(function () {
  return this._isShared || false;
});
passwordSchema.virtual("sharedWithUser").get(function () {
  return this._sharedWithUser || false;
});
passwordSchema.virtual("sharedFromGroup").get(function () {
  return this._sharedFromGroup || null;
});

passwordSchema.statics.getOwnNotShared = async function (userId) {
  const results = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "passwordshares",
        localField: "_id",
        foreignField: "passwordId",
        as: "shares",
      },
    },
    { $match: { shares: { $size: 0 } } },
    {
      $addFields: {
        _isShared: false,
        _sharedWithUser: false,
        _sharedFromGroup: null,
      },
    },
    { $project: { shares: 0 } },
  ]);

  return results.map((result) => new this(result));
};

passwordSchema.statics.getOwnShared = async function (userId) {
  const results = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "passwordshares",
        localField: "_id",
        foreignField: "passwordId",
        as: "shares",
      },
    },
    { $match: { "shares.0": { $exists: true } } },
    {
      $addFields: {
        _isShared: true,
        _sharedWithUser: false,
        _sharedFromGroup: null,
      },
    },
    { $project: { shares: 0 } },
  ]);

  return results.map((result) => new this(result));
};

passwordSchema.statics.getSharedWithUser = async function (userId) {
  const results = await mongoose.model("PasswordShare").aggregate([
    { $match: { sharedWith: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: "passwords",
        localField: "passwordId",
        foreignField: "_id",
        as: "passwordInfo",
      },
    },
    { $unwind: "$passwordInfo" },
    {
      $lookup: {
        from: "groupmembers",
        let: {
          groupId: "$groupId",
          userId: new mongoose.Types.ObjectId(userId),
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$groupId", "$$groupId"] },
                  { $eq: ["$memberId", "$$userId"] },
                ],
              },
            },
          },
        ],
        as: "membership",
      },
    },
    { $match: { membership: { $ne: [] } } },
    {
      $addFields: {
        "passwordInfo._isShared": true,
        "passwordInfo._sharedWithUser": true,
        "passwordInfo._sharedFromGroup": "$groupId",
      },
    },
    {
      $replaceRoot: { newRoot: "$passwordInfo" },
    },
  ]);

  return results.map((result) => new this(result));
};

passwordSchema.statics.getByCategory = async function (
  userId,
  category,
  skip = 0,
  limit = 10,
) {
  let allResults = [];

  switch (category) {
    case "own-not-shared":
      allResults = await this.getOwnNotShared(userId);
      break;
    case "own-shared":
      allResults = await this.getOwnShared(userId);
      break;
    case "shared-with-me":
      allResults = await this.getSharedWithUser(userId);
      break;
    case "all":
    default:
      const [notShared, shared, sharedWithMe] = await Promise.all([
        this.getOwnNotShared(userId),
        this.getOwnShared(userId),
        this.getSharedWithUser(userId),
      ]);
      allResults = [...notShared, ...shared, ...sharedWithMe];
      break;
  }

  const paginated = allResults.slice(skip, skip + limit);
  return { results: paginated, total: allResults.length };
};

const Password = mongoose.model("Password", passwordSchema);

module.exports = Password;
