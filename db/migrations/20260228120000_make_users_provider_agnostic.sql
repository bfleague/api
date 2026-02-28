-- migrate:up
ALTER TABLE users
  ADD COLUMN provider VARCHAR(32) NOT NULL DEFAULT 'discord' AFTER tenant,
  CHANGE COLUMN discord_id provider_user_id VARCHAR(191) NOT NULL;

ALTER TABLE users
  DROP INDEX uq_users_tenant_discord_id,
  ADD UNIQUE KEY uq_users_tenant_provider_subject (tenant, provider, provider_user_id);

-- migrate:down
ALTER TABLE users
  DROP INDEX uq_users_tenant_provider_subject;

ALTER TABLE users
  CHANGE COLUMN provider_user_id discord_id VARCHAR(20) NOT NULL,
  DROP COLUMN provider;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_tenant_discord_id (tenant, discord_id);
