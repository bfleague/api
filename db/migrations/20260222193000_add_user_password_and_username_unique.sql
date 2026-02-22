-- migrate:up
ALTER TABLE users
  ADD COLUMN password VARCHAR(255) NULL AFTER username;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_tenant_username (tenant, username);

-- migrate:down
ALTER TABLE users
  DROP INDEX uq_users_tenant_username;

ALTER TABLE users
  DROP COLUMN password;
