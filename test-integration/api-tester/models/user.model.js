const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    security_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: {},
      },
    },
  },
);

// User.hasMany(AuthToken, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasMany(OAuthAccount, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasMany(Password, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasOne(EncryptionKey, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasMany(TeamMember, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasMany(Notification, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });
// User.hasMany(PasswordBreach, {
//   foreignKey: 'user_id',
//   onDelete: 'CASCADE',
// });

module.exports = User;
