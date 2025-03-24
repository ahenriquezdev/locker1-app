const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    owner: {
        type: String,
        required: true,
        index: true
    },
    members: [{
        userId: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['member', 'admin'],
            default: 'member'
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    sharedPasswords: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Password'
    }]
}, {
    timestamps: true
});

// Compound index for faster queries
groupSchema.index({ owner: 1, name: 1 });

// Method to return group data without sensitive information
groupSchema.methods.toJSON = function () {
    const group = this.toObject();
    delete group.__v;
    return group;
};

// Static method to check if a user is a member of a group
groupSchema.statics.isMember = async function (groupId, userId) {
    const group = await this.findOne({
        _id: groupId,
        $or: [
            { owner: userId },
            { 'members.userId': userId }
        ]
    });
    return !!group;
};

// Static method to check if a user is an admin of a group
groupSchema.statics.isAdmin = async function (groupId, userId) {
    const group = await this.findOne({
        _id: groupId,
        $or: [
            { owner: userId },
            {
                'members.userId': userId,
                'members.role': 'admin'
            }
        ]
    });
    return !!group;
};

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 