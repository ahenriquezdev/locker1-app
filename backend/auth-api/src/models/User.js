const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true  // Changed from requirement since we don't need email confirmation
    },
    securityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    lastLogin: {
        type: Date,
        default: null
    }
}, {
    timestamps: true, // This will add createdAt and updatedAt fields automatically
    toJSON: {
        transform: function (doc, ret) {
            delete ret.passwordHash; // Never send password hash in responses
            return ret;
        }
    }
});

// Index for faster queries
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 