const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        trim: true
    },
    encryptedPassword: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    },
    authTag: {
        type: String,
        required: true
    },
    url: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'Uncategorized'
    },
    favorite: {
        type: Boolean,
        default: false
    },
    strength: {
        score: {
            type: Number,
            min: 0,
            max: 4,
            default: 0
        },
        feedback: {
            type: String
        }
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group'
    }],
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index for faster queries
passwordSchema.index({ userId: 1, title: 1 });

// Method to return password data without sensitive information
passwordSchema.methods.toJSON = function () {
    const password = this.toObject();
    delete password.__v;
    delete password.encryptedPassword;
    delete password.iv;
    delete password.authTag;
    return password;
};

const Password = mongoose.model('Password', passwordSchema);

module.exports = Password; 