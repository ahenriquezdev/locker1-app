const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const UserEncryptionKey = sequelize.define(
  'UserEncryptionKey',
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    encrypted_key: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    iv: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
  },
  {
    tableName: 'user_encryption_keys',
    timestamps: false,
  },
);

module.exports = UserEncryptionKey;
