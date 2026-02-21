-- migrate:up
CREATE TABLE users (
  id CHAR(36) NOT NULL DEFAULT (UUID()),
  discord_id VARCHAR(20) NOT NULL,
  username VARCHAR(25) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_discord_id (discord_id)
);

-- migrate:down
DROP TABLE IF EXISTS users;
