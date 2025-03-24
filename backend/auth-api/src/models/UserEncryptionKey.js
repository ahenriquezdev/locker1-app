const mongoose = require('mongoose');

const userEncryptionKeySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    key: {
        type: String,
        required: true
    },
    iv: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for faster queries
userEncryptionKeySchema.index({ userId: 1 });

const UserEncryptionKey = mongoose.model('UserEncryptionKey', userEncryptionKeySchema);

module.exports = UserEncryptionKey; 