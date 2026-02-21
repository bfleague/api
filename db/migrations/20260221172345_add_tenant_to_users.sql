-- migrate:up
ALTER TABLE users
  ADD COLUMN tenant VARCHAR(100) NOT NULL DEFAULT 'default' AFTER id;

ALTER TABLE users
  DROP INDEX uq_users_discord_id,
  ADD UNIQUE KEY uq_users_tenant_discord_id (tenant, discord_id),
  ADD KEY idx_users_tenant_created_at (tenant, created_at);

-- migrate:down
ALTER TABLE users
  DROP INDEX idx_users_tenant_created_at,
  DROP INDEX uq_users_tenant_discord_id,
  ADD UNIQUE KEY uq_users_discord_id (discord_id);

ALTER TABLE users
  DROP COLUMN tenant;
