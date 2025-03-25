const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const TeamInvitation = sequelize.define(
  'TeamInvitation',
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    team_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    invited_email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'expired'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    tableName: 'team_invitations',
    timestamps: true,
    createAt: 'created_at',
    updatedAt: false,
  },
);

module.exports = TeamInvitation;
