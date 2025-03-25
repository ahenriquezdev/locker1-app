const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const OAuthAccount = sequelize.define(
  'OAuthAccount',
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
    provider: {
      type: DataTypes.ENUM('google', 'github', 'microsoft'),
      allowNull: false,
    },
    provider_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: 'oauth_accounts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
);

// OAuthAccount.associate = (models) => {
//   OAuthAccount.belongsTo(models.User, {
//     foreignKey: 'user_id',
//     onDelete: 'CASCADE',
//   });
// };

module.exports = OAuthAccount;
