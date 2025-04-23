const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const PasswordBreach = sequelize.define(
  'PasswordBreach',
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    password_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    breach_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    last_checked: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'password_breaches',
    timestamps: false,
  },
);

module.exports = PasswordBreach;
