-- migrate:up
ALTER TABLE users
  ADD COLUMN role ENUM('admin', 'mod', 'default') NOT NULL DEFAULT 'default' AFTER username;

-- migrate:down
ALTER TABLE users
  DROP COLUMN role;
