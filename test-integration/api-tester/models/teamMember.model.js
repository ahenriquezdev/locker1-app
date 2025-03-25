const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const TeamMember = sequelize.define(
  'TeamMember',
  {
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    team_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM('owner', 'member'),
      allowNull: false,
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'team_members',
    timestamps: false,
  },
);

module.exports = TeamMember;
