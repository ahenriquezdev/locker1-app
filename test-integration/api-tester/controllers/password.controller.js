const {
  User,
  Password,
  PasswordShare,
  Team,
  UserEncryptionKey,
} = require('../models');
const { sequelize } = require('../models');
const {
  generateEncryptionKey,
  encryptPassword,
  decryptPassword,
} = require('../utils/crypto.util');
const { v4: uuidv4 } = require('uuid');

const MASTER_KEY = Buffer.from(process.env.APP_MASTER_KEY, 'hex');

async function createPassword(req, res) {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.sub;

    const { service, username, password, score, strength } = req.body;

    const existingUser = await User.findByPk(userId, { transaction });
    if (!existingUser) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
        data: null,
      });
    }

    let userKeyEntry = await UserEncryptionKey.findByPk(userId, {
      transaction,
    });

    if (!userKeyEntry) {
      const encryptionKey = await generateEncryptionKey();

      const { encryptedData: encryptedKey, iv } = await encryptPassword(
        encryptionKey,
        MASTER_KEY,
      );

      userKeyEntry = await UserEncryptionKey.create(
        {
          user_id: userId,
          encrypted_key: encryptedKey,
          iv,
        },
        { transaction },
      );
    }

    const decryptedKey = await decryptPassword(
      userKeyEntry.encrypted_key,
      MASTER_KEY,
      userKeyEntry.iv,
    );
    const { encryptedData, iv } = await encryptPassword(password, decryptedKey);

    const passwordEntry = await Password.create(
      {
        id: uuidv4(),
        user_id: userId,
        service,
        username,
        password: encryptedData,
        iv,
        score,
        strength,
        last_update: new Date(),
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Password created successfully',
      data: {
        id: passwordEntry.id,
        user_id: passwordEntry.user_id,
        service: passwordEntry.service,
        username: passwordEntry.username,
        score: passwordEntry.score,
        strength: passwordEntry.strength,
        last_update: passwordEntry.last_update,
      },
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal Server Error',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function getPassword(req, res) {
  try {
    const userId = req.user.sub;
    const { id } = req.params;
    const passwordEntry = await Password.findByPk(id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Password not found',
        data: null,
      });
    }

    if (passwordEntry.user_id !== userId) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'You do not have permission to view this password.',
      });
    }

    const userKeyEntry = await UserEncryptionKey.findByPk(
      passwordEntry.user_id,
    );

    if (!userKeyEntry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User encryption key not found',
        data: null,
      });
    }

    const decryptedKey = await decryptPassword(
      userKeyEntry.encrypted_key,
      MASTER_KEY,
      userKeyEntry.iv,
    );

    const encryptedPasswordBuffer = Buffer.from(passwordEntry.password, 'hex');
    const ivBuffer = Buffer.from(passwordEntry.iv, 'hex');

    const decryptedPasswordBuffer = await decryptPassword(
      encryptedPasswordBuffer,
      decryptedKey,
      ivBuffer,
    );

    const decryptedPassword = decryptedPasswordBuffer.toString('utf8');

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password retrieved successfully',
      data: {
        id: passwordEntry.id,
        user_id: passwordEntry.user_id,
        service: passwordEntry.service,
        username: passwordEntry.username,
        password: decryptedPassword,
        score: passwordEntry.score,
        strength: passwordEntry.strength,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal Server Error',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

async function getAllPasswords(req, res) {
  try {
    const userId = req.user.sub;

    const userEntry = await User.findByPk(userId);
    if (!userEntry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
        data: null,
      });
    }

    const userPasswords = await Password.findAll({
      where: { user_id: userId },
    });

    const userKeyEntry = await UserEncryptionKey.findByPk(userId);

    if (!userKeyEntry) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User encryption key not found',
        data: null,
      });
    }

    const decryptedKey = await decryptPassword(
      userKeyEntry.encrypted_key,
      MASTER_KEY,
      userKeyEntry.iv,
    );

    const passwordList = await Promise.all(
      userPasswords.map(async (password) => {
        try {
          const encryptedPasswordBuffer = Buffer.from(password.password, 'hex');
          const ivBuffer = Buffer.from(password.iv, 'hex');

          const decryptedPasswordBuffer = await decryptPassword(
            encryptedPasswordBuffer,
            decryptedKey,
            ivBuffer,
          );

          const decryptedPassword = decryptedPasswordBuffer.toString('utf8');

          const sharedTeams = await PasswordShare.findAll({
            where: { password_id: password.id },
            include: [{ model: Team, attributes: ['id', 'name'] }],
          });

          return {
            id: password.id,
            user_id: password.user_id,
            service: password.service,
            username: password.username,
            password: decryptedPassword,
            score: password.score,
            strength: password.strength,
            last_update: password.last_update,
            sharedTeams: sharedTeams.map((share) => share.Team),
          };
        } catch (error) {
          console.error(`Error decrypting password ${password.id}:`, error);
          return {
            id: password.id,
            user_id: password.user_id,
            service: password.service,
            username: password.username,
            password: 'Decryption failed',
            score: password.score,
            strength: password.strength,
            last_update: password.last_update,
            sharedTeams: [],
          };
        }
      }),
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Passwords retrieved successfully',
      data: passwordList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal Server Error',
      data: null,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

// async function getAllPasswords(req, res) {
//   try {
//     const userId = req.user.sub;
//
//     const userEntry = await User.findByPk(userId);
//     if (!userEntry) {
//       return res.status(404).json({
//         success: false,
//         statusCode: 404,
//         message: 'User not found',
//         data: null,
//       });
//     }
//
//     const userPasswords = await Password.findAll({
//       where: { user_id: userId },
//     });
//
//     const userKeyEntry = await UserEncryptionKey.findByPk(userId);
//
//     if (!userKeyEntry) {
//       return res.status(404).json({
//         success: false,
//         statusCode: 404,
//         message: 'User encryption key not found',
//         data: null,
//       });
//     }
//
//     const decryptedKey = await decryptPassword(
//       userKeyEntry.encrypted_key,
//       MASTER_KEY,
//       userKeyEntry.iv,
//     );
//
//     const passwordList = await Promise.all(
//       userPasswords.map(async (password) => {
//         try {
//           const encryptedPasswordBuffer = Buffer.from(password.password, 'hex');
//           const ivBuffer = Buffer.from(password.iv, 'hex');
//
//           const decryptedPasswordBuffer = await decryptPassword(
//             encryptedPasswordBuffer,
//             decryptedKey,
//             ivBuffer,
//           );
//
//           const decryptedPassword = decryptedPasswordBuffer.toString('utf8');
//
//           return {
//             id: password.id,
//             user_id: password.user_id,
//             service: password.service,
//             username: password.username,
//             password: decryptedPassword,
//             score: password.score,
//             strength: password.strength,
//           };
//         } catch (error) {
//           console.error(`Error decrypting password ${password.id}:`, error);
//           return {
//             id: password.id,
//             user_id: password.user_id,
//             service: password.service,
//             username: password.username,
//             password: 'Decryption failed',
//             score: password.score,
//             strength: password.strength,
//           };
//         }
//       }),
//     );
//
//     return res.status(200).json({
//       success: true,
//       statusCode: 200,
//       message: 'Passwords retrieved successfully',
//       data: passwordList,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       statusCode: 500,
//       message: 'Internal Server Error',
//       data: null,
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined,
//     });
//   }
// }

module.exports = {
  createPassword,
  getPassword,
  getAllPasswords,
};
