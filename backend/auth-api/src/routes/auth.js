const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');
const UserEncryptionKey = require('../models/UserEncryptionKey');
const mongoose = require('mongoose');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            passwordHash,
            fullName
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.status(201).json({
            status: 'success',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({
            status: 'success',
            data: {
                user,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get current user (protected route)
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Store encryption key
router.post('/encryption-key', authMiddleware, async (req, res) => {
    try {
        // Generate a random 32-byte key (256 bits for AES-256)
        const key = crypto.randomBytes(32);
        // Generate a random 12-byte IV (96 bits for GCM mode)
        const iv = crypto.randomBytes(12);

        // Convert to base64 strings
        const keyBase64 = key.toString('base64');
        const ivBase64 = iv.toString('base64');

        const userEncryptionKey = await UserEncryptionKey.findOneAndUpdate(
            { userId: req.user.userId },
            {
                key: keyBase64,
                iv: ivBase64
            },
            { upsert: true, new: true }
        );

        // Verify the saved data
        if (!userEncryptionKey || !userEncryptionKey.key || !userEncryptionKey.iv) {
            throw new Error('Failed to save encryption key');
        }

        res.json({
            status: 'success',
            data: {
                key: keyBase64,
                iv: ivBase64
            }
        });
    } catch (error) {
        console.error('Encryption key generation error:', error);
        res.status(400).json({
            status: 'error',
            message: `Failed to generate encryption key: ${error.message}`
        });
    }
});

// Get encryption key
router.get('/encryption-key', authMiddleware, async (req, res) => {
    try {
        let userEncryptionKey = await UserEncryptionKey.findOne({ userId: req.user.userId });

        if (!userEncryptionKey) {
            // Generate new key if none exists
            const key = crypto.randomBytes(32);
            const iv = crypto.randomBytes(12);

            const keyBase64 = key.toString('base64');
            const ivBase64 = iv.toString('base64');

            userEncryptionKey = await UserEncryptionKey.create({
                userId: req.user.userId,
                key: keyBase64,
                iv: ivBase64
            });
        }

        // Verify the data
        if (!userEncryptionKey || !userEncryptionKey.key || !userEncryptionKey.iv) {
            throw new Error('Invalid encryption key data');
        }

        res.json({
            status: 'success',
            data: {
                key: userEncryptionKey.key,
                iv: userEncryptionKey.iv
            }
        });
    } catch (error) {
        console.error('Encryption key retrieval error:', error);
        res.status(400).json({
            status: 'error',
            message: `Failed to retrieve encryption key: ${error.message}`
        });
    }
});

// Delete encryption key
router.delete('/encryption-key', authMiddleware, async (req, res) => {
    try {
        await UserEncryptionKey.findOneAndDelete({ userId: req.user.userId });

        res.json({
            status: 'success',
            message: 'Encryption key deleted successfully'
        });
    } catch (error) {
        console.error('Encryption key deletion error:', error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// Get shared encryption key token
router.post('/shared-key', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required'
            });
        }

        // Get the user's encryption key
        const encryptionKey = await UserEncryptionKey.findOne({ userId });
        if (!encryptionKey) {
            return res.status(404).json({
                status: 'error',
                message: 'Encryption key not found'
            });
        }

        // Create a special token that only allows encryption key access
        const token = jwt.sign(
            {
                userId,
                purpose: 'shared-key-access',
                exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes expiration
            },
            process.env.JWT_SECRET
        );

        res.json({
            status: 'success',
            token
        });
    } catch (error) {
        console.error('Shared key error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate shared key token'
        });
    }
});

module.exports = router; 