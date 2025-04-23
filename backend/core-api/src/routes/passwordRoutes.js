const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Password = require('../models/Password');
const { encryptPassword, decryptPassword } = require('../utils/encryption');
const { checkPasswordBreach } = require('../utils/hibpCheck');
const Group = require('../models/Group');

router.get('/security/score', authenticate, async (req, res) => {
    try {
        const passwords = await Password.find({ userId: req.user.userId });
        const totalPasswords = passwords.length;

        if (totalPasswords === 0) {
            return res.json({
                status: 'success',
                data: {
                    score: 0,
                    totalPasswords: 0,
                    recommendations: ['Start by adding some passwords to secure']
                }
            });
        }

        const totalScore = passwords.reduce((sum, pwd) => sum + (pwd.strength?.score || 0), 0);
        const averageScore = totalScore / totalPasswords;

        res.json({
            status: 'success',
            data: {
                score: averageScore,
                totalPasswords,
                recommendations: []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to calculate security score'
        });
    }
});

router.post('/security/check', authenticate, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                status: 'error',
                message: 'Password is required'
            });
        }

        const result = await checkPasswordBreach(password);
        res.json({
            status: 'success',
            data: {
                isCompromised: result.isCompromised,
                timesExposed: result.timesExposed,
                message: result.isCompromised
                    ? `This password has been exposed in data breaches ${result.timesExposed} times`
                    : 'This password has not been found in any known data breaches'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to check password'
        });
    }
});

router.post('/', authenticate, async (req, res) => {
    try {
        const { title, username, password, url, notes, category, favorite } = req.body;

        if (!title || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Title and password are required'
            });
        }

        const breachCheck = await checkPasswordBreach(password);
        const strength = { score: 0, feedback: '' };

        if (breachCheck && breachCheck.isCompromised) {
            strength.feedback = `WARNING: This password has been exposed in data breaches ${breachCheck.timesExposed} times.`;
        }

        const { encryptedPassword, iv, authTag } = await encryptPassword(password, req.user.token);

        const newPassword = new Password({
            userId: req.user.id,
            title,
            username,
            encryptedPassword,
            iv,
            authTag,
            url,
            notes,
            category,
            favorite,
            strength
        });

        await newPassword.save();

        res.status(201).json({
            status: 'success',
            data: {
                password: {
                    _id: newPassword._id,
                    userId: newPassword.userId,
                    title: newPassword.title,
                    username: newPassword.username,
                    url: newPassword.url,
                    notes: newPassword.notes,
                    category: newPassword.category,
                    favorite: newPassword.favorite,
                    strength: newPassword.strength,
                    sharedWith: [],
                    lastModified: newPassword.updatedAt,
                    createdAt: newPassword.createdAt,
                    updatedAt: newPassword.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while creating the password'
        });
    }
});

module.exports = router; 