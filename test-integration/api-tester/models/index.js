const sequelize = require('../config/db.config');

const User = require('./user.model');
const AuthToken = require('./authToken.model');
const OAuthAccount = require('./oauthAccount.model');
const UserEncryptionKey = require('./encryptionKey.model');
const Team = require('./team.model');
const TeamMember = require('./teamMember.model');
const Password = require('./password.model');
const PasswordShare = require('./passwordShare.model');
const PasswordBreach = require('./passwordBreach.model');
const TeamInvitation = require('./teamInvitation.model');
const Notification = require('./notification.model');

const defineRelations = require('./relations');

const models = {
  User,
  AuthToken,
  OAuthAccount,
  UserEncryptionKey,
  Team,
  TeamMember,
  Password,
  PasswordShare,
  PasswordBreach,
  TeamInvitation,
  Notification,
};

defineRelations(models);

module.exports = {
  ...models,
  sequelize,
};
