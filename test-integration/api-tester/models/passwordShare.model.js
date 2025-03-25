const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const PasswordShare = sequelize.define(
  'PasswordShare',
  {
    password_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    team_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    shared_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    shared_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'password_shares',
    timestamps: false,
  },
);

module.exports = PasswordShare;
