const defineRelations = (models) => {
  // Relaciones de usuario
  models.User.hasMany(models.AuthToken, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasMany(models.OAuthAccount, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasMany(models.Password, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasOne(models.UserEncryptionKey, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasMany(models.TeamMember, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasMany(models.Notification, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.User.hasMany(models.PasswordBreach, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });

  // Relaciones de autenticación
  models.AuthToken.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.OAuthAccount.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.Password.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
  models.UserEncryptionKey.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });

  // Relaciones de equipo
  models.Team.hasMany(models.TeamMember, {
    foreignKey: 'team_id',
    onDelete: 'CASCADE',
  });
  models.Team.hasMany(models.PasswordShare, {
    foreignKey: 'team_id',
    onDelete: 'CASCADE',
  });
  models.TeamMember.belongsTo(models.Team, {
    foreignKey: 'team_id',
    onDelete: 'CASCADE',
  });
  models.TeamMember.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });

  // Relaciones de contraseña
  models.Password.hasMany(models.PasswordShare, {
    foreignKey: 'password_id',
    onDelete: 'CASCADE',
  });
  models.Password.hasMany(models.PasswordBreach, {
    foreignKey: 'password_id',
    onDelete: 'CASCADE',
  });
  models.PasswordShare.belongsTo(models.Password, {
    foreignKey: 'password_id',
    onDelete: 'CASCADE',
  });
  models.PasswordShare.belongsTo(models.Team, {
    foreignKey: 'team_id',
    onDelete: 'CASCADE',
  });
  models.PasswordBreach.belongsTo(models.Password, {
    foreignKey: 'password_id',
    onDelete: 'CASCADE',
  });
  models.PasswordBreach.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });

  // Relaciones de notificación
  models.Notification.belongsTo(models.User, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  });
};

module.exports = defineRelations;
