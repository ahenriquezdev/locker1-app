const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const AuthToken = sequelize.define(
  'AuthToken',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM(
        'activation',
        'password_reset',
        'session',
        'oauth_session',
      ),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: 'auth_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = AuthToken;
