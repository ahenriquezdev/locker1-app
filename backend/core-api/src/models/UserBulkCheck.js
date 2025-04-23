const mongoose = require('mongoose');

const userBulkCheckSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    lastCheckDate: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create index for faster lookups
userBulkCheckSchema.index({ userId: 1 });

const UserBulkCheck = mongoose.model('UserBulkCheck', userBulkCheckSchema);

module.exports = UserBulkCheck; 