const express = require("express");
const router = express.Router();
const apiRoutes = require("../config/endpoints");
const Password = require("../models/Password");
const SharedPassword = require("../models/SharedPassword");
const User = require("../models/User");
const UserEncryptionKey = require("../models/UserEncryptionKey");

const encryptionUtils = require("../utils/encryption");

const authMiddleware = require("../middleware/auth");

// [] get all passwords
router.get(apiRoutes.password.getAll, async (req, res) => {});

// [OK] get password by id
router.get(apiRoutes.password.getById, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const passwordId = req.params.id;

    const passwordEntry = await Password.findOne({
      _id: passwordId,
      userId,
    });

    if (!passwordEntry) {
      return res.sendError(404, "Password not found");
    }

    const userEncryptionKey = await UserEncryptionKey.findOne({
      userId,
    });

    if (!userEncryptionKey) {
      return res.sendError(404, "User encryption key not found");
    }

    const derivedKey = encryptionUtils.deriveKey(
      userId,
      userEncryptionKey.salt,
    );

    const decryptedPassword = encryptionUtils.decrypt(
      passwordEntry.password,
      derivedKey,
      passwordEntry.iv,
      passwordEntry.authTag,
    );

    passwordEntry.password = decryptedPassword;

    return res.sendSuccess(
      200,
      "Password found successfully",
      passwordEntry.getPublicFields(),
    );
  } catch (error) {
    res.sendError(500, "CO: Get password failed", error);
  }
});

// [OK] create a new password
router.post(apiRoutes.password.create, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { service, username, password, url, score, strength } = req.body;

    let userEncryptionKey = await UserEncryptionKey.findOne({
      userId,
    });

    if (!userEncryptionKey) {
      const {
        salt,
        derivedKey: initialDerivedKey,
        iv: keyIv,
      } = encryptionUtils.generateUserEncryptionKeyData(userId);

      const MASTER_KEY = encryptionUtils.getMasterKey();
      const { encrypted: encryptedKey, authTag: keyAuthTag } =
        encryptionUtils.encrypt(
          initialDerivedKey.toString("base64"),
          MASTER_KEY,
          keyIv,
        );

      userEncryptionKey = await UserEncryptionKey.create({
        userId,
        salt: salt,
        key: encryptedKey,
        iv: keyIv,
        authTag: keyAuthTag,
      });
    }

    const derivedKey = encryptionUtils.deriveKey(
      userId,
      userEncryptionKey.salt,
    );
    const {
      iv: passwordIv,
      encrypted: encryptedPassword,
      authTag: passwordAuthTag,
    } = encryptionUtils.encrypt(password, derivedKey);

    const passwordEntry = await Password.create({
      userId,
      service,
      username,
      password: encryptedPassword,
      iv: passwordIv,
      authTag: passwordAuthTag,
      url,
      score,
      strength,
    });

    return res.sendSuccess(
      201,
      "Password created successfully",
      passwordEntry.getPublicFields(),
    );
  } catch (error) {
    res.sendError(500, "CO: Create password failed", error);
  }
});

// [] update password by id
router.put(apiRoutes.password.updateOrDelete, async (req, res) => {});

// [] delete password by id
router.delete(apiRoutes.password.updateOrDelete, async (req, res) => {});

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const Password = require('../models/Password');
// const authMiddleware = require('../middleware/auth');
// const { encryptPassword, decryptPassword } = require('../utils/encryption');
// const zxcvbn = require('zxcvbn');
// const Group = require('../models/Group');
// const axios = require('axios');
// const { authenticate } = require('../middleware/auth');
// const { bulkBreachCheck } = require('../controllers/securityController');
// const { checkPasswordBreach } = require('../utils/hibpCheck');
// const { calculatePasswordStrength } = require('../utils/passwordStrength');
//
// // Create a new password
// router.post('/', authMiddleware, async (req, res) => {
//     try {
//         const { title, username, password, url, notes, category, favorite } = req.body;
//
//         // Encrypt the password using the auth token
//         const { encryptedPassword, iv, authTag } = await encryptPassword(
//             password,
//             req.headers.authorization
//         );
//
//         // Calculate password strength
//         const strength = zxcvbn(password);
//
//         const newPassword = new Password({
//             userId: req.user.userId,
//             title,
//             username,
//             encryptedPassword,
//             iv,
//             authTag,
//             url,
//             notes,
//             category,
//             favorite,
//             strength: {
//                 score: strength.score,
//                 feedback: strength.feedback.warning || strength.feedback.suggestions[0]
//             }
//         });
//
//         await newPassword.save();
//
//         // Return the password without sensitive data
//         const passwordData = newPassword.toJSON();
//         delete passwordData.encryptedPassword;
//         delete passwordData.iv;
//         delete passwordData.authTag;
//
//         res.status(201).json({
//             status: 'success',
//             data: {
//                 password: passwordData
//             }
//         });
//     } catch (error) {
//         console.error('Password creation error:', error);
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Get all passwords (including shared ones)
// router.get('/', authMiddleware, async (req, res) => {
//     try {
//         // Find all groups where user is a member or owner
//         const groups = await Group.find({
//             $or: [
//                 { owner: req.user.userId },
//                 { 'members.userId': req.user.userId }
//             ]
//         });
//
//         const groupIds = groups.map(group => group._id);
//
//         // Find user's own passwords and passwords shared with their groups
//         const passwords = await Password.find({
//             $or: [
//                 { userId: req.user.userId },
//                 { sharedWith: { $in: groupIds } }
//             ]
//         }).select('-encryptedPassword -iv -authTag');
//
//         // Add an isShared flag to indicate if the password is from a group
//         const enhancedPasswords = passwords.map(password => {
//             const passwordObj = password.toObject();
//             passwordObj.isShared = password.userId !== req.user.userId;
//             if (passwordObj.isShared) {
//                 const sharedGroups = groups.filter(group =>
//                     password.sharedWith.some(id => id.equals(group._id))
//                 ).map(group => ({
//                     id: group._id,
//                     name: group.name
//                 }));
//                 passwordObj.sharedVia = sharedGroups;
//             }
//             return passwordObj;
//         });
//
//         res.json({
//             status: 'success',
//             data: {
//                 passwords: enhancedPasswords
//             }
//         });
//     } catch (error) {
//         console.error('Get passwords error:', error);
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Get a single password
// router.get('/:id', authMiddleware, async (req, res) => {
//     try {
//         // Find all groups where user is a member or owner
//         const groups = await Group.find({
//             $or: [
//                 { owner: req.user.userId },
//                 { 'members.userId': req.user.userId }
//             ]
//         });
//
//         const groupIds = groups.map(group => group._id);
//
//         // Find the password that either belongs to user or is shared with their groups
//         const password = await Password.findOne({
//             _id: req.params.id,
//             $or: [
//                 { userId: req.user.userId },
//                 { sharedWith: { $in: groupIds } }
//             ]
//         });
//
//         if (!password) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Password not found or you do not have access to it'
//             });
//         }
//
//         // Create a copy of the password object
//         const passwordObj = password.toObject();
//
//         try {
//             // If it's a shared password, we need to get the owner's encryption key
//             const ownerAuthToken = await getOwnerAuthToken(password.userId);
//
//             // Decrypt the password using the owner's key
//             const decryptedPassword = await decryptPassword(
//                 password.encryptedPassword,
//                 password.iv,
//                 password.authTag,
//                 ownerAuthToken
//             );
//
//             // Add the decrypted password and sharing info to the response
//             passwordObj.password = decryptedPassword;
//             passwordObj.isShared = password.userId !== req.user.userId;
//
//             if (passwordObj.isShared) {
//                 const sharedGroups = groups.filter(group =>
//                     password.sharedWith.some(id => id.equals(group._id))
//                 ).map(group => ({
//                     id: group._id,
//                     name: group.name
//                 }));
//                 passwordObj.sharedVia = sharedGroups;
//             }
//
//             // Remove sensitive encryption data
//             delete passwordObj.encryptedPassword;
//             delete passwordObj.iv;
//             delete passwordObj.authTag;
//             delete passwordObj.__v;
//
//             res.json({
//                 status: 'success',
//                 data: {
//                     password: passwordObj
//                 }
//             });
//         } catch (error) {
//             console.error('Decryption error:', error);
//             res.status(400).json({
//                 status: 'error',
//                 message: 'Unable to decrypt shared password. The owner may need to re-share it.'
//             });
//         }
//     } catch (error) {
//         console.error('Get password error:', error);
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Helper function to get owner's auth token
// async function getOwnerAuthToken(ownerId) {
//     try {
//         // Make a request to auth service to get owner's encryption key
//         const response = await axios.post('http://localhost:3001/auth/shared-key', {
//             userId: ownerId
//         });
//
//         if (!response.data || !response.data.token) {
//             throw new Error('Failed to get owner encryption key');
//         }
//
//         return `Bearer ${response.data.token}`;
//     } catch (error) {
//         console.error('Error getting owner auth token:', error);
//         throw new Error('Failed to get owner encryption key');
//     }
// }
//
// // Update a password
// router.put('/:id', authMiddleware, async (req, res) => {
//     try {
//         const { title, username, password, url, notes, category, favorite } = req.body;
//         const updateData = { title, username, url, notes, category, favorite };
//
//         // If password is being updated, encrypt it
//         if (password) {
//             // Encrypt the password using the auth token
//             const { encryptedPassword, iv, authTag } = await encryptPassword(
//                 password,
//                 req.headers.authorization
//             );
//
//             // Calculate new password strength
//             const strength = zxcvbn(password);
//
//             updateData.encryptedPassword = encryptedPassword;
//             updateData.iv = iv;
//             updateData.authTag = authTag;
//             updateData.strength = {
//                 score: strength.score,
//                 feedback: strength.feedback.warning || strength.feedback.suggestions[0]
//             };
//         }
//
//         updateData.lastModified = new Date();
//
//         const updatedPassword = await Password.findOneAndUpdate(
//             { _id: req.params.id, userId: req.user.userId },
//             updateData,
//             { new: true }
//         );
//
//         if (!updatedPassword) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Password not found'
//             });
//         }
//
//         // Return the password without sensitive data
//         const passwordData = updatedPassword.toJSON();
//         delete passwordData.encryptedPassword;
//         delete passwordData.iv;
//         delete passwordData.authTag;
//
//         res.json({
//             status: 'success',
//             data: {
//                 password: passwordData
//             }
//         });
//     } catch (error) {
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Delete a password
// router.delete('/:id', authMiddleware, async (req, res) => {
//     try {
//         const password = await Password.findOneAndDelete({
//             _id: req.params.id,
//             userId: req.user.userId
//         });
//
//         if (!password) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Password not found'
//             });
//         }
//
//         res.json({
//             status: 'success',
//             message: 'Password deleted successfully'
//         });
//     } catch (error) {
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Get user's password security score
// router.get('/security/score', authMiddleware, async (req, res) => {
//     try {
//         // Get all passwords owned by the user
//         const passwords = await Password.find({ userId: req.user.userId });
//
//         if (passwords.length === 0) {
//             return res.json({
//                 status: 'success',
//                 data: {
//                     score: 0,
//                     totalPasswords: 0,
//                     analysis: {
//                         weak: 0,
//                         medium: 0,
//                         strong: 0,
//                         veryStrong: 0
//                     },
//                     recommendations: [
//                         'Start by creating some passwords to get a security score'
//                     ]
//                 }
//             });
//         }
//
//         // Calculate statistics
//         const analysis = {
//             weak: 0,     // score 0-1
//             medium: 0,   // score 2
//             strong: 0,   // score 3
//             veryStrong: 0 // score 4
//         };
//
//         passwords.forEach(password => {
//             const score = password.strength.score;
//             if (score <= 1) analysis.weak++;
//             else if (score === 2) analysis.medium++;
//             else if (score === 3) analysis.strong++;
//             else analysis.veryStrong++;
//         });
//
//         // Calculate overall score (weighted average)
//         const totalScore = passwords.reduce((sum, password) => sum + password.strength.score, 0);
//         const averageScore = (totalScore / passwords.length).toFixed(2);
//
//         // Generate recommendations
//         const recommendations = [];
//         if (analysis.weak > 0) {
//             recommendations.push(`You have ${analysis.weak} weak password(s). Consider updating them to improve security.`);
//         }
//         if (analysis.medium > analysis.strong + analysis.veryStrong) {
//             recommendations.push('Most of your passwords have medium strength. Try using longer passwords with special characters.');
//         }
//         if (passwords.length < 5) {
//             recommendations.push('Consider using password manager for more accounts to improve overall security.');
//         }
//         if (analysis.veryStrong === 0) {
//             recommendations.push('None of your passwords are very strong. Try using passphrases with numbers and symbols.');
//         }
//
//         // Calculate reuse statistics
//         const uniquePasswords = new Set(passwords.map(p => p.encryptedPassword)).size;
//         const reusePercentage = ((1 - (uniquePasswords / passwords.length)) * 100).toFixed(1);
//
//         if (reusePercentage > 0) {
//             recommendations.push(`You are reusing passwords across ${reusePercentage}% of your accounts. Each account should have a unique password.`);
//         }
//
//         res.json({
//             status: 'success',
//             data: {
//                 score: parseFloat(averageScore),
//                 totalPasswords: passwords.length,
//                 analysis: {
//                     weak: analysis.weak,
//                     medium: analysis.medium,
//                     strong: analysis.strong,
//                     veryStrong: analysis.veryStrong
//                 },
//                 statistics: {
//                     uniquePasswords,
//                     reusePercentage: parseFloat(reusePercentage)
//                 },
//                 recommendations
//             }
//         });
//     } catch (error) {
//         console.error('Security score calculation error:', error);
//         res.status(400).json({
//             status: 'error',
//             message: error.message
//         });
//     }
// });
//
// // Debug middleware
// router.use((req, res, next) => {
//     console.log('[DEBUG] Password route accessed:', req.method, req.path);
//     next();
// });
//
// // Security routes
// router.post('/security/bulk-breach-check', authenticate, async (req, res) => {
//     console.log('[DEBUG] Bulk breach check route hit');
//     try {
//         await bulkBreachCheck(req, res);
//     } catch (error) {
//         console.error('[ERROR] Bulk breach check failed:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to perform bulk breach check'
//         });
//     }
// });
//
// // Export the router
// module.exports = router;
