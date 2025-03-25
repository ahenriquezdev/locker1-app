DROP DATABASE IF EXISTS `locker1-dev_db`;
CREATE DATABASE `locker1-dev_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `locker1-dev_db`;

CREATE TABLE users
(
  id             CHAR(36)            NOT NULL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password       VARBINARY(128)      NULL,
  full_name      VARCHAR(100)        NOT NULL,
  created_at     DATETIME   DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login     DATETIME   DEFAULT NULL,
  is_active      TINYINT(1) DEFAULT 0,
  security_score INT        DEFAULT 0 CHECK (security_score BETWEEN 0 AND 100)
);

CREATE TABLE oauth_accounts
(
  id          CHAR(36)                               NOT NULL PRIMARY KEY,
  user_id     CHAR(36)                               NOT NULL,
  provider    ENUM ('google', 'github', 'microsoft') NOT NULL,
  provider_id VARCHAR(255)                           NOT NULL,
  email       VARCHAR(255)                           NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (provider, provider_id)
);

CREATE TABLE auth_tokens
(
  id         CHAR(36)                                                          NOT NULL PRIMARY KEY,
  user_id    CHAR(36)                                                          NOT NULL,
  token      VARCHAR(255) UNIQUE                                               NOT NULL,
  type       ENUM ('activation', 'password_reset', 'session', 'oauth_session') NOT NULL,
  expires_at DATETIME                                                          NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE user_encryption_keys
(
  user_id       CHAR(36)     NOT NULL PRIMARY KEY,
  encrypted_key VARCHAR(256) NOT NULL,
  iv            VARCHAR(32)  NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE teams
(
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by  CHAR(36),
  FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE team_members
(
  user_id   CHAR(36)                 NOT NULL,
  team_id   CHAR(36)                 NOT NULL,
  role      ENUM ('owner', 'member') NOT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, team_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE
);

CREATE TABLE passwords
(
  id          CHAR(36)                                   NOT NULL PRIMARY KEY,
  user_id     CHAR(36)                                   NOT NULL,
  service     VARCHAR(100)                               NOT NULL,
  username    VARCHAR(255)                               NOT NULL,
  password    VARCHAR(256)                               NOT NULL,
  iv          VARCHAR(32)                                NOT NULL,
  score       INT CHECK (score BETWEEN 1 AND 100)        NOT NULL,
  strength    ENUM ('low', 'moderate', 'high', 'strong') NULL,
  last_update DATETIME                                   NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (user_id, service, username)
);

CREATE TABLE password_shares
(
  password_id CHAR(36) NOT NULL,
  team_id     CHAR(36) NOT NULL,
  shared_by   CHAR(36) NOT NULL,
  shared_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (password_id, team_id),
  FOREIGN KEY (password_id) REFERENCES passwords (id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE password_breaches
(
  id           CHAR(36) NOT NULL PRIMARY KEY,
  user_id      CHAR(36) NOT NULL,
  password_id  CHAR(36) NOT NULL,
  breach_count INT      NOT NULL,
  last_checked DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (password_id) REFERENCES passwords (id) ON DELETE CASCADE
);

CREATE TABLE team_invitations
(
  id            CHAR(36)                                            NOT NULL PRIMARY KEY,
  team_id       CHAR(36)                                            NOT NULL,
  user_id       CHAR(36)                                            NULL,
  invited_email VARCHAR(255)                                        NULL,
  token         VARCHAR(100) UNIQUE                                 NOT NULL,
  expires_at    DATETIME                                            NOT NULL,
  created_at    DATETIME                                                     DEFAULT CURRENT_TIMESTAMP,
  status        ENUM ('pending', 'accepted', 'rejected', 'expired') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CHECK ((user_id IS NOT NULL) OR (invited_email IS NOT NULL))
);

CREATE TABLE notifications
(
  id         CHAR(36)                                   NOT NULL PRIMARY KEY,
  user_id    CHAR(36)                                   NOT NULL,
  message    TEXT                                       NOT NULL,
  type       ENUM ('security', 'invitation', 'general') NOT NULL,
  is_read    TINYINT(1) DEFAULT 0,
  created_at DATETIME   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
